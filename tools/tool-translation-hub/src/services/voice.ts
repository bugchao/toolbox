declare global {
  interface Window {
    webkitSpeechRecognition?: new () => BrowserSpeechRecognition
    SpeechRecognition?: new () => BrowserSpeechRecognition
  }
}

interface BrowserSpeechRecognitionEventLike extends Event {
  results: SpeechRecognitionResultList
}

interface BrowserSpeechRecognition extends EventTarget {
  lang: string
  interimResults: boolean
  continuous: boolean
  onresult: ((event: BrowserSpeechRecognitionEventLike) => void) | null
  onerror: ((event: Event) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

export function isSpeechRecognitionSupported() {
  return typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
}

export function createSpeechRecognition(lang: string, onResult: (text: string) => void, onEnd: () => void) {
  const RecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!RecognitionCtor) {
    throw new Error('SpeechRecognition is not supported in this browser')
  }

  const recognition = new RecognitionCtor()
  recognition.lang = lang
  recognition.interimResults = true
  recognition.continuous = true
  recognition.onresult = (event: BrowserSpeechRecognitionEventLike) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0]?.transcript ?? '')
      .join(' ')
      .trim()
    onResult(transcript)
  }
  recognition.onerror = () => onEnd()
  recognition.onend = onEnd
  return recognition
}
