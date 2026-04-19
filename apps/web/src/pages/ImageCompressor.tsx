import React, { useState, useRef } from 'react';
import { Upload, Download, Settings, Image as ImageIcon, X, FileImage } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ProcessedImage {
  id: string;
  originalFile: File;
  originalSize: number;
  processedBlob?: Blob;
  processedSize?: number;
  quality: number;
  format: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  previewUrl: string;
  error?: string;
}

const ImageCompressor: React.FC = () => {
  const { t } = useTranslation();
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [quality, setQuality] = useState(80);
  const [outputFormat, setOutputFormat] = useState('same');
  const [preserveExif, setPreserveExif] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const calculateCompressionRate = (original: number, compressed: number): string => {
    const rate = ((original - compressed) / original) * 100;
    return rate.toFixed(1) + '%';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: ProcessedImage[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      originalFile: file,
      originalSize: file.size,
      quality,
      format: outputFormat === 'same' ? file.type.split('/')[1] : outputFormat,
      status: 'pending',
      previewUrl: URL.createObjectURL(file),
    }));

    setImages(prev => [...prev, ...newImages]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processImage = async (image: ProcessedImage): Promise<ProcessedImage> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            ...image,
            status: 'error',
            error: 'Canvas not supported',
          });
          return;
        }

        ctx.drawImage(img, 0, 0);

        const outputMimeType = outputFormat === 'same' 
          ? image.originalFile.type 
          : `image/${outputFormat}`;

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve({
                ...image,
                status: 'error',
                error: 'Failed to process image',
              });
              return;
            }

            resolve({
              ...image,
              processedBlob: blob,
              processedSize: blob.size,
              status: 'done',
            });
          },
          outputMimeType,
          quality / 100
        );
      };

      img.onerror = () => {
        resolve({
          ...image,
          status: 'error',
          error: 'Failed to load image',
        });
      };

      img.src = image.previewUrl;
    });
  };

  const processAllImages = async () => {
    if (images.length === 0) return;
    
    setIsProcessing(true);
    setProgress(0);
    
    const pendingImages = images.filter(img => img.status === 'pending');
    const total = pendingImages.length;
    
    const processedImages = [...images];
    
    for (let i = 0; i < pendingImages.length; i++) {
      const index = processedImages.findIndex(img => img.id === pendingImages[i].id);
      if (index === -1) continue;
      
      processedImages[index] = {
        ...processedImages[index],
        status: 'processing',
      };
      setImages([...processedImages]);
      
      const result = await processImage(pendingImages[i]);
      processedImages[index] = result;
      setImages([...processedImages]);
      
      setProgress(((i + 1) / total) * 100);
    }
    
    setIsProcessing(false);
  };

  const downloadImage = (image: ProcessedImage) => {
    if (!image.processedBlob) return;
    
    const url = URL.createObjectURL(image.processedBlob);
    const a = document.createElement('a');
    a.href = url;
    
    const originalName = image.originalFile.name.split('.')[0];
    const extension = image.format === 'same' 
      ? image.originalFile.name.split('.').pop() 
      : image.format;
    
    a.download = `${originalName}_compressed.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    const processedImages = images.filter(img => img.status === 'done');
    processedImages.forEach(downloadImage);
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      const removed = prev.find(img => img.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return filtered;
    });
  };

  const clearAll = () => {
    images.forEach(img => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    setProgress(0);
  };

  const getTotalSavings = () => {
    const processed = images.filter(img => img.status === 'done' && img.processedSize);
    if (processed.length === 0) return '0 B';
    
    const totalOriginal = processed.reduce((sum, img) => sum + img.originalSize, 0);
    const totalProcessed = processed.reduce((sum, img) => sum + (img.processedSize || 0), 0);
    const savings = totalOriginal - totalProcessed;
    
    return formatFileSize(savings);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">图片压缩/格式转换</h1>
        <p className="text-gray-600">
          纯前端图片处理，支持JPG/PNG/WebP/AVIF格式互转，批量压缩，无需上传服务器
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 侧边栏设置 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              处理设置
            </h2>
            
            <div className="space-y-6">
              {/* 质量设置 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">压缩质量: {quality}%</label>
                  <span className="text-sm text-gray-500">
                    {quality < 50 ? '高压缩' : quality < 80 ? '平衡' : '高质量'}
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  disabled={isProcessing}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* 格式选择 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">输出格式</label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  disabled={isProcessing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="same">保持原格式</option>
                  <option value="jpeg">JPEG</option>
                  <option value="png">PNG</option>
                  <option value="webp">WebP</option>
                  <option value="avif">AVIF</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  WebP/AVIF格式可获得更高的压缩率
                </p>
              </div>

              {/* EXIF选项 */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">保留EXIF信息</p>
                  <p className="text-xs text-gray-500">
                    保留拍摄参数、地理位置等信息
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preserveExif}
                  onChange={(e) => setPreserveExif(e.target.checked)}
                  disabled={isProcessing}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>

              {/* 操作按钮 */}
              <div className="space-y-3 pt-4">
                <button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                >
                  <Upload className="h-4 w-4" />
                  选择图片
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {images.length > 0 && (
                  <>
                    <button
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={processAllImages}
                      disabled={isProcessing || images.every(img => img.status !== 'pending')}
                    >
                      {isProcessing ? '处理中...' : '开始处理'}
                    </button>
                    
                    {images.some(img => img.status === 'done') && (
                      <button
                        className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center gap-2"
                        onClick={downloadAll}
                      >
                        <Download className="h-4 w-4" />
                        下载全部
                      </button>
                    )}

                    <button
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={clearAll}
                      disabled={isProcessing}
                    >
                      <X className="h-4 w-4" />
                      清空列表
                    </button>
                  </>
                )}
              </div>

              {/* 进度条 */}
              {isProcessing && (
                <div className="space-y-2 pt-4">
                  <div className="flex justify-between text-sm">
                    <span>处理进度</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* 统计信息 */}
              {images.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-gray-500">总文件数</div>
                      <div className="font-medium">{images.length}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">已处理</div>
                      <div className="font-medium">
                        {images.filter(img => img.status === 'done').length}
                      </div>
                    </div>
                    <div className="col-span-2 mt-2">
                      <div className="text-gray-500">已节省空间</div>
                      <div className="font-medium text-green-600">{getTotalSavings()}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 图片列表 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FileImage className="h-5 w-5" />
                图片列表
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {images.length === 0 
                  ? '请选择要处理的图片，支持多选' 
                  : `共 ${images.length} 张图片`}
              </p>
            </div>
            
            <div className="p-6">
              {images.length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500 mb-2">拖拽图片到此处或点击选择文件</p>
                  <p className="text-xs text-gray-500">
                    支持JPG、PNG、WebP、AVIF等格式，纯前端处理无上传
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {images.map((image) => (
                    <div key={image.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="relative aspect-video bg-gray-100">
                        <img
                          src={image.previewUrl}
                          alt={image.originalFile.name}
                          className="w-full h-full object-contain"
                        />
                        <button
                          className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 disabled:opacity-50"
                          onClick={() => removeImage(image.id)}
                          disabled={isProcessing}
                        >
                          <X className="h-3 w-3" />
                        </button>
                        {image.status === 'processing' && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="text-white text-sm">处理中...</div>
                          </div>
                        )}
                        {image.status === 'done' && (
                          <span className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                            已完成
                          </span>
                        )}
                        {image.status === 'error' && (
                          <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                            处理失败
                          </span>
                        )}
                      </div>
                      <div className="p-3 space-y-2 text-sm">
                        <div className="font-medium truncate" title={image.originalFile.name}>
                          {image.originalFile.name}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">原始大小:</span>
                            <br />
                            {formatFileSize(image.originalSize)}
                          </div>
                          {image.processedSize && (
                            <div>
                              <span className="text-gray-500">压缩后:</span>
                              <br />
                              <span className="text-green-600">
                                {formatFileSize(image.processedSize)}
                              </span>
                              <span className="text-xs ml-1">
                                (-{calculateCompressionRate(image.originalSize, image.processedSize)})
                              </span>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-500">格式:</span>
                            <br />
                            {image.format.toUpperCase()}
                          </div>
                          <div>
                            <span className="text-gray-500">质量:</span>
                            <br />
                            {image.quality}%
                          </div>
                        </div>
                        {image.status === 'done' && (
                          <button
                            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-1 px-2 rounded flex items-center justify-center gap-1"
                            onClick={() => downloadImage(image)}
                          >
                            <Download className="h-3 w-3" />
                            下载
                          </button>
                        )}
                        {image.status === 'error' && (
                          <p className="text-xs text-red-500 mt-1">{image.error}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {images.length > 0 && (
              <div className="p-4 border-t border-gray-200 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  所有图片均在本地处理，不会上传到服务器
                </div>
                {images.some(img => img.status === 'done') && (
                  <button
                    className="bg-gray-600 hover:bg-gray-700 text-white text-sm py-2 px-4 rounded flex items-center gap-2"
                    onClick={downloadAll}
                  >
                    <Download className="h-4 w-4" />
                    下载全部
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCompressor;
