import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FileText, Upload, Trash2, Download, GripVertical, AlertCircle } from 'lucide-react'
import { PageHero, useFileDropzone } from '@toolbox/ui-kit'
import { PDFDocument } from 'pdf-lib'

interface PDFFile {
  id: string
  file: File
  name: string
  size: number
  pages: number
}

export default function DocMerger() {
  const { t } = useTranslation('toolDocMerger')

  const [files, setFiles] = useState<PDFFile[]>([])
  const [merging, setMerging] = useState(false)
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = async (selectedFiles: File[]) => {
    setError(null)
    const newFiles: PDFFile[] = []
    
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]
      
      if (file.type !== 'application/pdf') {
        setError(t('messages.invalidFile'))
        continue
      }
      
      try {
        const arrayBuffer = await file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(arrayBuffer)
        const pageCount = pdfDoc.getPageCount()
        
        newFiles.push({
          id: `${Date.now()}-${i}`,
          file,
          name: file.name,
          size: file.size,
          pages: pageCount
        })
      } catch (err) {
        console.error('Error loading PDF:', err)
        setError(t('messages.mergeError'))
      }
    }
    
    setFiles([...files, ...newFiles])
  }

  const { openPicker, dropzoneProps, inputProps } = useFileDropzone({
    onFiles: (files) => void handleFileSelect(files),
  })

  const removeFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id))
    if (files.length <= 1) {
      setMergedPdfUrl(null)
    }
  }

  const clearAll = () => {
    setFiles([])
    setMergedPdfUrl(null)
    setError(null)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragEnter = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return
    
    const newFiles = [...files]
    const draggedFile = newFiles[draggedIndex]
    newFiles.splice(draggedIndex, 1)
    newFiles.splice(index, 0, draggedFile)
    
    setFiles(newFiles)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const mergePDFs = async () => {
    if (files.length < 2) {
      setError(t('messages.minFiles'))
      return
    }
    
    setMerging(true)
    setError(null)
    
    try {
      const mergedPdf = await PDFDocument.create()
      
      for (const pdfFile of files) {
        const arrayBuffer = await pdfFile.file.arrayBuffer()
        const pdf = await PDFDocument.load(arrayBuffer)
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
        copiedPages.forEach((page) => mergedPdf.addPage(page))
      }
      
      const mergedPdfBytes = await mergedPdf.save()
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      setMergedPdfUrl(url)
    } catch (err) {
      console.error('Error merging PDFs:', err)
      setError(t('messages.mergeError'))
    } finally {
      setMerging(false)
    }
  }

  const downloadMergedPDF = () => {
    if (!mergedPdfUrl) return
    
    const link = document.createElement('a')
    link.href = mergedPdfUrl
    link.download = `merged-${Date.now()}.pdf`
    link.click()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <PageHero
        icon={FileText}
        title={t('title')}
        description={t('description')}
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Upload Area */}
        <div
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer bg-white dark:bg-gray-800"
          {...dropzoneProps}
          onClick={openPicker}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">{t('uploadArea.title')}</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-2">{t('uploadArea.description')}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('uploadArea.hint')}</p>
          <input {...inputProps} accept="application/pdf" multiple />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('fileList.title')} ({files.length})</h3>
              <button
                onClick={clearAll}
                className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                {t('actions.clear')}
              </button>
            </div>

            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={file.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-3 p-3 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-move transition-colors ${
                    draggedIndex === index ? 'opacity-50' : ''
                  }`}
                >
                  <GripVertical className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-gray-900 dark:text-gray-100">{file.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)} • {file.pages} {t('fileList.pages')}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">{t('fileList.dragHint')}</p>
          </div>
        )}

        {/* Actions */}
        {files.length > 0 && (
          <div className="mt-6 flex gap-4">
            <button
              onClick={mergePDFs}
              disabled={merging || files.length < 2}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {merging ? t('actions.merging') : t('actions.merge')}
            </button>
            
            {mergedPdfUrl && (
              <button
                onClick={downloadMergedPDF}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                {t('actions.download')}
              </button>
            )}
          </div>
        )}

        {/* Empty State */}
        {files.length === 0 && (
          <div className="mt-8 text-center text-gray-500 dark:text-gray-400">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p>{t('fileList.empty')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
