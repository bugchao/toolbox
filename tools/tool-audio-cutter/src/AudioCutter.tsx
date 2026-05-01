import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, Play, Pause, Square, Scissors, Download, Trash2 } from 'lucide-react'
import { PageHero } from '@toolbox/ui-kit'
import WaveSurfer from 'wavesurfer.js'
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js'

export default function AudioCutter() {
  const { t } = useTranslation('toolAudioCutter')
  const waveformRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  const regionsPluginRef = useRef<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (!waveformRef.current) return

    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#667eea',
      progressColor: '#764ba2',
      cursorColor: '#333',
      barWidth: 2,
      barRadius: 3,
      cursorWidth: 2,
      height: 128,
      barGap: 2,
    })

    const regions = wavesurfer.registerPlugin(RegionsPlugin.create())
    regionsPluginRef.current = regions

    wavesurfer.on('ready', () => {
      const dur = wavesurfer.getDuration()
      setDuration(dur)
      setEndTime(dur)
      
      regions.addRegion({
        start: 0,
        end: dur,
        color: 'rgba(102, 126, 234, 0.3)',
        drag: true,
        resize: true,
      })
    })

    wavesurfer.on('audioprocess', () => {
      setCurrentTime(wavesurfer.getCurrentTime())
    })

    wavesurfer.on('play', () => setIsPlaying(true))
    wavesurfer.on('pause', () => setIsPlaying(false))

    regions.on('region-updated', (region: any) => {
      setStartTime(region.start)
      setEndTime(region.end)
    })

    wavesurferRef.current = wavesurfer

    return () => {
      wavesurfer.destroy()
    }
  }, [])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/mp4']
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|aac|m4a)$/i)) {
      alert(t('invalidFormat') || '不支持的音频格式')
      return
    }

    setAudioFile(file)
    const url = URL.createObjectURL(file)
    
    if (wavesurferRef.current) {
      await wavesurferRef.current.load(url)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('audio/')) {
      const input = fileInputRef.current
      if (input) {
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        input.files = dataTransfer.files
        handleFileSelect({ target: input } as any)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const togglePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause()
    }
  }

  const handleStop = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.stop()
      setIsPlaying(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 100)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
  }

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    if (!isNaN(value) && value >= 0 && value < endTime) {
      setStartTime(value)
      updateRegion(value, endTime)
    }
  }

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    if (!isNaN(value) && value > startTime && value <= duration) {
      setEndTime(value)
      updateRegion(startTime, value)
    }
  }

  const updateRegion = (start: number, end: number) => {
    if (regionsPluginRef.current) {
      const regions = regionsPluginRef.current.getRegions()
      if (regions.length > 0) {
        regions[0].setOptions({ start, end })
      }
    }
  }

  const handleCut = async () => {
    if (!audioFile || !wavesurferRef.current) return

    setIsProcessing(true)

    try {
      const audioContext = new AudioContext()
      const arrayBuffer = await audioFile.arrayBuffer()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

      const sampleRate = audioBuffer.sampleRate
      const startSample = Math.floor(startTime * sampleRate)
      const endSample = Math.floor(endTime * sampleRate)
      const newLength = endSample - startSample

      const newBuffer = audioContext.createBuffer(
        audioBuffer.numberOfChannels,
        newLength,
        sampleRate
      )

      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const oldData = audioBuffer.getChannelData(channel)
        const newData = newBuffer.getChannelData(channel)
        for (let i = 0; i < newLength; i++) {
          newData[i] = oldData[startSample + i]
        }
      }

      const wav = audioBufferToWav(newBuffer)
      const blob = new Blob([wav], { type: 'audio/wav' })
      const url = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = `${audioFile.name.replace(/\.[^.]+$/, '')}_cut.wav`
      a.click()

      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Cut failed:', error)
      alert(t('cutFailed') || '剪辑失败')
    } finally {
      setIsProcessing(false)
    }
  }

  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const length = buffer.length * buffer.numberOfChannels * 2 + 44
    const arrayBuffer = new ArrayBuffer(length)
    const view = new DataView(arrayBuffer)
    const channels: Float32Array[] = []
    let offset = 0
    let pos = 0

    const setUint16 = (data: number) => {
      view.setUint16(pos, data, true)
      pos += 2
    }

    const setUint32 = (data: number) => {
      view.setUint32(pos, data, true)
      pos += 4
    }

    setUint32(0x46464952)
    setUint32(length - 8)
    setUint32(0x45564157)
    setUint32(0x20746d66)
    setUint32(16)
    setUint16(1)
    setUint16(buffer.numberOfChannels)
    setUint32(buffer.sampleRate)
    setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels)
    setUint16(buffer.numberOfChannels * 2)
    setUint16(16)
    setUint32(0x61746164)
    setUint32(length - pos - 4)

    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i))
    }

    while (pos < length) {
      for (let i = 0; i < buffer.numberOfChannels; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]))
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff
        view.setInt16(pos, sample, true)
        pos += 2
      }
      offset++
    }

    return arrayBuffer
  }

  const handleReset = () => {
    setAudioFile(null)
    setStartTime(0)
    setEndTime(0)
    setCurrentTime(0)
    setDuration(0)
    setIsPlaying(false)
    if (wavesurferRef.current) {
      wavesurferRef.current.empty()
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <PageHero
        icon={Scissors}
        title={t('title')}
        description={t('description')}
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          {!audioFile ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center cursor-pointer hover:border-purple-500 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('uploadPrompt')}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('supportedFormats')}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.ogg,.aac,.m4a"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                    {audioFile.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title={t('reset')}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div ref={waveformRef} />
              </div>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={togglePlayPause}
                  className="p-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
                  disabled={!audioFile}
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </button>
                <button
                  onClick={handleStop}
                  className="p-3 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
                  disabled={!audioFile}
                >
                  <Square className="w-6 h-6" />
                </button>
              </div>

              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('startTime')}
                  </label>
                  <input
                    type="number"
                    value={startTime.toFixed(2)}
                    onChange={handleStartTimeChange}
                    step="0.01"
                    min="0"
                    max={endTime}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatTime(startTime)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('endTime')}
                  </label>
                  <input
                    type="number"
                    value={endTime.toFixed(2)}
                    onChange={handleEndTimeChange}
                    step="0.01"
                    min={startTime}
                    max={duration}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatTime(endTime)}
                  </p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {t('selectedDuration')}: {formatTime(endTime - startTime)}
                </p>
                <button
                  onClick={handleCut}
                  disabled={isProcessing || !audioFile}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t('processing')}
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      {t('cutAndDownload')}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('features')}
          </h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li>✓ {t('feature1')}</li>
            <li>✓ {t('feature2')}</li>
            <li>✓ {t('feature3')}</li>
            <li>✓ {t('feature4')}</li>
            <li>✓ {t('feature5')}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
