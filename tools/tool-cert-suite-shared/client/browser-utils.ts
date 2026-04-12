export interface BinaryPayload {
  content: string
  encoding: 'text' | 'base64'
  fileName: string
}

export function readFileAsText(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error || new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

export function readFileAsBinaryPayload(file: File) {
  return new Promise<BinaryPayload>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result !== 'string') {
        reject(new Error('Failed to read file'))
        return
      }

      const [, payload = ''] = result.split(',')
      resolve({
        content: payload,
        encoding: 'base64',
        fileName: file.name,
      })
    }
    reader.onerror = () => reject(reader.error || new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

export async function readCertificateUpload(file: File): Promise<BinaryPayload> {
  const text = await readFileAsText(file).catch(() => '')
  if (/-----BEGIN CERTIFICATE-----/.test(text)) {
    return {
      content: text,
      encoding: 'text',
      fileName: file.name,
    }
  }

  return readFileAsBinaryPayload(file)
}

export function downloadArtifact(name: string, content: string, encoding: 'text' | 'base64', mimeType: string) {
  const blob =
    encoding === 'base64'
      ? new Blob([Uint8Array.from(atob(content), (char) => char.charCodeAt(0))], { type: mimeType })
      : new Blob([content], { type: mimeType })

  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  anchor.click()
  URL.revokeObjectURL(url)
}
