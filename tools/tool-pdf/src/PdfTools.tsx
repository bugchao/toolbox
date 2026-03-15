import React, { useState, useRef } from 'react'
import { Upload, Download, FileText, Scissors, Merge, Image, FileCode, X, Check, Loader2, ChevronDown, File } from 'lucide-react'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import JSZip from 'jszip'

type ToolMode = 'merge' | 'split' | 'to-image' | 'to-text' | 'compress'

interface PdfFile {
  id: string
  file: File
  name: string
  size: number
  pages?: number
  status: 'idle' | 'processing' | 'completed' | 'error'
  progress: number
  url?: string
}

const PdfTools: React.FC = () => {
  const [mode, setMode] = useState<ToolMode>('merge')
  const [files, setFiles] = useState<PdfFile[]>([])
  const [processing, setProcessing] = useState(false)
  const [processed, setProcessed] = useState(false)
  const [error, setError] = useState('')
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [outputFilename, setOutputFilename] = useState('output.pdf')
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(e.target.files || [])
    const newFiles = uploadedFiles.map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      name: file.name,
      size: file.size,
      status: 'idle' as const,
      progress: 0
    }))
    
    setFiles(prev => [...prev, ...newFiles])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
    setProcessed(false)
    setDownloadUrl(null)
    setError('')
  }

  const clearAll = () => {
    setFiles([])
    setProcessed(false)
    setDownloadUrl(null)
    setError('')
  }

  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as ArrayBuffer)
      reader.onerror = reject
      reader.readAsArrayBuffer(file)
    })
  }

  const mergePdfs = async () => {
    if (files.length < 2) {
      throw new Error('至少需要上传2个PDF文件才能合并')
    }

    const mergedPdf = await PDFDocument.create()
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const arrayBuffer = await readFileAsArrayBuffer(file.file)
      const pdf = await PDFDocument.load(arrayBuffer)
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
      pages.forEach(page => mergedPdf.addPage(page))
      
      // 更新进度
      setFiles(prev => prev.map((f, idx) => 
        idx === i ? { ...f, progress: 100, status: 'completed' } : f
      ))
    }

    const pdfBytes = await mergedPdf.save()
    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
    return blob
  }

  const splitPdf = async () => {
    if (files.length !== 1) {
      throw new Error('请上传1个PDF文件进行分割')
    }

    const file = files[0]
    const arrayBuffer = await readFileAsArrayBuffer(file.file)
    const pdf = await PDFDocument.load(arrayBuffer)
    const pageCount = pdf.getPageCount()
    
    const zip = new JSZip()
    
    for (let i = 0; i < pageCount; i++) {
      const newPdf = await PDFDocument.create()
      const [page] = await newPdf.copyPages(pdf, [i])
      newPdf.addPage(page)
      const pdfBytes = await newPdf.save()
      zip.file(`${file.name.replace(/\.pdf$/i, '')}_page_${i + 1}.pdf`, pdfBytes)
      
      // 更新进度
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, progress: Math.round(((i + 1) / pageCount) * 100) } : f
      ))
    }

    const zipContent = await zip.generateAsync({ type: 'blob' })
    setOutputFilename(`${file.name.replace(/\.pdf$/i, '')}_split.zip`)
    return zipContent
  }

  const processFiles = async () => {
    if (files.length === 0) {
      setError('请先上传PDF文件')
      return
    }

    setProcessing(true)
    setError('')
    setProcessed(false)
    setDownloadUrl(null)

    try {
      let resultBlob: Blob

      switch (mode) {
        case 'merge':
          resultBlob = await mergePdfs()
          break
        case 'split':
          resultBlob = await splitPdf()
          break
        default:
          throw new Error('该功能正在开发中，敬请期待')
      }

      const url = URL.createObjectURL(resultBlob)
      setDownloadUrl(url)
      setProcessed(true)
      
      setFiles(prev => prev.map(f => ({
        ...f,
        status: 'completed' as const,
        progress: 100
      })))
    } catch (err) {
      setError(err instanceof Error ? err.message : '处理失败，请重试')
      setFiles(prev => prev.map(f => ({
        ...f,
        status: 'error' as const
      })))
    } finally {
      setProcessing(false)
    }
  }

  const downloadResult = () => {
    if (!downloadUrl) return
    
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = outputFilename
    a.click()
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const tools = [
    { value: 'merge', label: 'PDF合并', icon: Merge, description: '将多个PDF文件合并为一个' },
    { value: 'split', label: 'PDF分割', icon: Scissors, description: '将PDF按页面分割为多个文件' },
    { value: 'to-image', label: 'PDF转图片', icon: Image, description: '将PDF每页转换为图片格式', disabled: true },
    { value: 'to-text', label: 'PDF转文字', icon: FileCode, description: '提取PDF中的文本内容', disabled: true },
    { value: 'compress', label: 'PDF压缩', icon: FileText, description: '压缩PDF文件大小，保持画质', disabled: true },
  ]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">PDF工具集</h1>
        <p className="text-white opacity-80">多功能PDF处理工具，支持合并、分割、格式转换等操作</p>
      </div>

      {/* 工具选择 */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {tools.map(tool => (
            <button
              key={tool.value}
              onClick={() => {
                if (!tool.disabled) {
                  setMode(tool.value as ToolMode)
                  clearAll()
                }
              }}
              disabled={tool.disabled}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                mode === tool.value
                  ? 'border-indigo-600 bg-indigo-50'
                  : tool.disabled
                  ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                  : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
              }`}
            >
              <tool.icon className={`w-6 h-6 mb-2 ${mode === tool.value ? 'text-indigo-600' : 'text-gray-500'}`} />
              <div className={`font-medium ${mode === tool.value ? 'text-indigo-900' : 'text-gray-900'}`}>
                {tool.label}
              </div>
              <div className="text-xs text-gray-500 mt-1">{tool.description}</div>
              {tool.disabled && <div className="text-xs text-orange-500 mt-1">开发中</div>}
            </button>
          ))}
        </div>
      </div>

      {/* 上传区域 */}
      <div className="card">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            multiple={mode === 'merge'}
            onChange={handleFileUpload}
            className="hidden"
          />
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">上传PDF文件</h3>
          <p className="text-gray-500 mb-4">
            {mode === 'merge' ? '支持多选，拖拽或点击上传多个PDF文件' : '点击上传单个PDF文件'}
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            选择文件
          </button>
          <p className="text-xs text-gray-400 mt-4">最大支持单个文件 50MB</p>
        </div>

        {/* 文件列表 */}
        {files.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-gray-900">已上传文件 ({files.length})</h3>
              <button
                onClick={clearAll}
                className="text-sm text-gray-500 hover:text-red-600 transition-colors flex items-center"
              >
                <X className="w-4 h-4 mr-1" />
                清空全部
              </button>
            </div>
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center space-x-3">
                    <File className="w-5 h-5 text-indigo-600" />
                    <div>
                      <div className="font-medium text-gray-900">{file.name}</div>
                      <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {file.status === 'processing' && (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                        <span className="text-sm text-gray-600">{file.progress}%</span>
                      </div>
                    )}
                    {file.status === 'completed' && (
                      <Check className="w-5 h-5 text-green-500" />
                    )}
                    {file.status === 'error' && (
                      <X className="w-5 h-5 text-red-500" />
                    )}
                    {file.status === 'idle' && (
                      <button
                        onClick={() => removeFile(file.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {/* 操作按钮 */}
        {files.length > 0 && !processed && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={processFiles}
              disabled={processing}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  处理中...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  开始处理
                </>
              )}
            </button>
          </div>
        )}

        {/* 处理完成 */}
        {processed && downloadUrl && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
            <Check className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-green-900 mb-2">处理完成！</h3>
            <p className="text-gray-600 mb-4">文件已成功处理，点击下方按钮下载</p>
            <button
              onClick={downloadResult}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center mx-auto"
            >
              <Download className="w-5 h-5 mr-2" />
              下载 {outputFilename}
            </button>
          </div>
        )}
      </div>

      {/* 使用说明 */}
      <div className="card bg-gray-50">
        <h3 className="text-lg font-bold text-gray-900 mb-3">使用说明</h3>
        <ul className="space-y-2 text-gray-600">
          <li className="flex items-start">
            <span className="text-indigo-600 mr-2">•</span>
            PDF合并：选择多个PDF文件，点击开始处理，将按上传顺序合并为一个PDF
          </li>
          <li className="flex items-start">
            <span className="text-indigo-600 mr-2">•</span>
            PDF分割：上传单个PDF文件，将每页分割为独立的PDF文件，打包为ZIP下载
          </li>
          <li className="flex items-start">
            <span className="text-indigo-600 mr-2">•</span>
            所有文件处理均在本地浏览器中完成，不会上传到服务器，保护您的文件隐私
          </li>
          <li className="flex items-start">
            <span className="text-indigo-600 mr-2">•</span>
            大文件处理可能需要较长时间，请耐心等待，不要关闭页面
          </li>
        </ul>
      </div>
    </div>
  )
}

export default PdfTools
