const CANDIDATE_MIMES = [
  'video/webm; codecs=vp9',
  'video/webm; codecs=vp8',
  'video/webm',
  'video/mp4',
]

export function getSupportedMimeTypes(): string[] {
  if (!window.MediaRecorder) return []
  return CANDIDATE_MIMES.filter(mime => MediaRecorder.isTypeSupported(mime))
}

export function getDefaultMimeType(): string | null {
  const supported = getSupportedMimeTypes()
  return supported[0] || null
}

export function getExtensionForMime(mime: string | null): string {
  if (!mime) return 'webm'  // Safe default
  if (mime.startsWith('video/webm')) return 'webm'
  if (mime.startsWith('video/mp4')) return 'mp4'
  return 'webm'  // Valid fallback instead of 'video'
}
