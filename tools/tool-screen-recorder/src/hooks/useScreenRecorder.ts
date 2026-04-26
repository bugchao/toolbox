import { useState, useRef, useCallback, useEffect } from 'react'

export type RecorderState =
  | 'idle'
  | 'requesting'
  | 'recording'
  | 'paused'
  | 'finished'
  | 'error'

export type ErrorType =
  | 'unsupported'
  | 'permissionDenied'
  | 'deviceError'
  | 'recordingFailed'

export interface RecorderOptions {
  includeSystemAudio: boolean
  includeMic: boolean
  mimeType: string
}

export interface RecorderData {
  state: RecorderState
  errorType: ErrorType | null
  elapsedSeconds: number
  estimatedSizeBytes: number
  videoUrl: string | null
  finalSizeBytes: number
  finalDurationSeconds: number
}

export function useScreenRecorder() {
  const [state, setState] = useState<RecorderState>('idle')
  const [errorType, setErrorType] = useState<ErrorType | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [estimatedSizeBytes, setEstimatedSizeBytes] = useState(0)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [finalSizeBytes, setFinalSizeBytes] = useState(0)
  const [finalDurationSeconds, setFinalDurationSeconds] = useState(0)
  const [warningDismissed, setWarningDismissed] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const timerRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const pausedDurationRef = useRef<number>(0)

  const cleanup = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const setupAudioTracks = useCallback(async (displayStream: MediaStream, options: RecorderOptions): Promise<MediaStream> => {
    if (!options.includeSystemAudio && !options.includeMic) {
      return displayStream
    }

    if (!options.includeSystemAudio && options.includeMic) {
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const videoTrack = displayStream.getVideoTracks()[0]
      const micTrack = micStream.getAudioTracks()[0]
      return new MediaStream([videoTrack, micTrack])
    }

    if (options.includeSystemAudio && options.includeMic) {
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audioContext = new AudioContext()
      const destination = audioContext.createMediaStreamDestination()

      const systemSource = audioContext.createMediaStreamSource(displayStream)
      const micSource = audioContext.createMediaStreamSource(micStream)

      systemSource.connect(destination)
      micSource.connect(destination)

      const videoTrack = displayStream.getVideoTracks()[0]
      const mixedAudioTrack = destination.stream.getAudioTracks()[0]

      audioContextRef.current = audioContext
      return new MediaStream([videoTrack, mixedAudioTrack])
    }

    return displayStream
  }, [])

  const startTimer = useCallback(() => {
    timerRef.current = window.setInterval(() => {
      const newElapsed = Math.floor((Date.now() - startTimeRef.current - pausedDurationRef.current) / 1000)
      setElapsedSeconds(prev => prev !== newElapsed ? newElapsed : prev)
    }, 1000)
  }, [])

  const startRecording = useCallback(async (options: RecorderOptions) => {
    setState('requesting')
    chunksRef.current = []
    setEstimatedSizeBytes(0)
    setElapsedSeconds(0)
    setWarningDismissed(false)

    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: options.includeSystemAudio,
      })

      const finalStream = await setupAudioTracks(displayStream, options)
      streamRef.current = finalStream

      const recorder = new MediaRecorder(finalStream, { mimeType: options.mimeType })
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
          setEstimatedSizeBytes(prev => prev + e.data.size)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: options.mimeType })
        const url = URL.createObjectURL(blob)
        const finalElapsed = Math.floor((Date.now() - startTimeRef.current - pausedDurationRef.current) / 1000)
        setVideoUrl(url)
        setFinalSizeBytes(blob.size)
        setFinalDurationSeconds(finalElapsed)
        setState('finished')
        cleanup()
      }

      recorder.start(1000)
      setState('recording')
      startTimeRef.current = Date.now()
      pausedDurationRef.current = 0

      startTimer()

    } catch (err: any) {
      cleanup()
      if (err.name === 'NotAllowedError') {
        setErrorType('permissionDenied')
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorType('deviceError')
      } else {
        setErrorType('recordingFailed')
      }
      setState('error')
    }
  }, [cleanup, setupAudioTracks, startTimer])

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && state === 'recording') {
      mediaRecorderRef.current.pause()
      setState('paused')
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      pausedDurationRef.current = Date.now() - startTimeRef.current
    }
  }, [state])

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && state === 'paused') {
      mediaRecorderRef.current.resume()
      setState('recording')
      startTimeRef.current = Date.now() - pausedDurationRef.current
      startTimer()
    }
  }, [state, startTimer])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && (state === 'recording' || state === 'paused')) {
      mediaRecorderRef.current.stop()
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [state])

  const reset = useCallback(() => {
    cleanup()
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl)
    }
    setState('idle')
    setErrorType(null)
    setElapsedSeconds(0)
    setEstimatedSizeBytes(0)
    setVideoUrl(null)
    setFinalSizeBytes(0)
    setFinalDurationSeconds(0)
    chunksRef.current = []
  }, [cleanup, videoUrl])

  useEffect(() => {
    return () => {
      cleanup()
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl)
      }
    }
  }, [cleanup, videoUrl])

  return {
    state,
    errorType,
    elapsedSeconds,
    estimatedSizeBytes,
    videoUrl,
    finalSizeBytes,
    finalDurationSeconds,
    warningDismissed,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    reset,
    dismissWarning: () => setWarningDismissed(true),
  }
}
