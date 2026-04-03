export type ExtractedDocument = {
  text: string
  fileName: string
  sourceType: 'txt' | 'docx' | 'pdf' | 'image'
}

async function extractDocx(file: File) {
  const mammoth = await import('mammoth')
  const buffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer: buffer })
  return result.value.trim()
}

async function extractPdf(file: File) {
  const pdfjs = await import('pdfjs-dist')
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString()
  const buffer = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: buffer }).promise
  const pages = await Promise.all(
    Array.from({ length: pdf.numPages }, async (_, index) => {
      const page = await pdf.getPage(index + 1)
      const content = await page.getTextContent()
      return content.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ')
    })
  )
  return pages.join('\n').trim()
}

async function extractImage(file: File) {
  const { createWorker } = await import('tesseract.js')
  const worker = await createWorker('eng+chi_sim')
  const {
    data: { text },
  } = await worker.recognize(file)
  await worker.terminate()
  return text.trim()
}

export async function extractDocument(file: File): Promise<ExtractedDocument> {
  const lower = file.name.toLowerCase()
  if (lower.endsWith('.txt')) {
    return { text: (await file.text()).trim(), fileName: file.name, sourceType: 'txt' }
  }
  if (lower.endsWith('.docx')) {
    return { text: await extractDocx(file), fileName: file.name, sourceType: 'docx' }
  }
  if (lower.endsWith('.pdf')) {
    return { text: await extractPdf(file), fileName: file.name, sourceType: 'pdf' }
  }
  if (file.type.startsWith('image/')) {
    return { text: await extractImage(file), fileName: file.name, sourceType: 'image' }
  }

  throw new Error(`Unsupported file type: ${file.name}`)
}
