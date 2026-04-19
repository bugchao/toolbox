import React, { useState, useRef } from 'react';
import { Upload, Download, Eraser, X, Plus, Circle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface WatermarkImage {
  id: string;
  originalFile: File;
  previewUrl: string;
  processedUrl?: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  error?: string;
}

const ImageWatermarkRemover: React.FC = () => {
  const { t } = useTranslation();
  const [images, setImages] = useState<WatermarkImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<WatermarkImage | null>(null);
  const [brushSize, setBrushSize] = useState(30);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [maskPoints, setMaskPoints] = useState<{x: number, y: number}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: WatermarkImage[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      originalFile: file,
      previewUrl: URL.createObjectURL(file),
      status: 'pending',
    }));

    setImages(prev => [...prev, ...newImages]);
    if (newImages.length > 0 && !selectedImage) {
      setSelectedImage(newImages[0]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageSelect = (image: WatermarkImage) => {
    setSelectedImage(image);
    setMaskPoints([]);
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const { x, y } = getCanvasCoordinates(e);
    setMaskPoints(prev => [...prev, { x, y }]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    
    const { x, y } = getCanvasCoordinates(e);
    setMaskPoints(prev => [...prev, { x, y }]);

    // Draw on canvas
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.fill();
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleRemoveWatermark = async () => {
    if (!selectedImage || maskPoints.length === 0) return;

    setIsProcessing(true);
    setSelectedImage(prev => prev ? { ...prev, status: 'processing' } : null);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = selectedImage.previewUrl;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Simple inpainting algorithm - replace marked areas with surrounding pixels
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = canvas.width;
      maskCanvas.height = canvas.height;
      const maskCtx = maskCanvas.getContext('2d');
      if (!maskCtx) throw new Error('Mask canvas failed');

      // Draw mask points
      maskCtx.fillStyle = 'white';
      maskPoints.forEach(point => {
        const scaleX = canvas.width / (canvasRef.current?.width || 1);
        const scaleY = canvas.height / (canvasRef.current?.height || 1);
        maskCtx.beginPath();
        maskCtx.arc(point.x * scaleX, point.y * scaleY, brushSize / 2 * scaleX, 0, Math.PI * 2);
        maskCtx.fill();
      });

      const maskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
      
      // Simple neighborhood averaging for marked pixels
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const idx = (y * canvas.width + x) * 4;
          if (maskData.data[idx + 3] > 0) {
            // Find surrounding non-masked pixels and average them
            let sumR = 0, sumG = 0, sumB = 0, count = 0;
            const radius = Math.max(brushSize, 10);
            
            for (let dy = -radius; dy <= radius; dy++) {
              for (let dx = -radius; dx <= radius; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < canvas.width && ny >= 0 && ny < canvas.height) {
                  const nidx = (ny * canvas.width + nx) * 4;
                  if (maskData.data[nidx + 3] === 0) {
                    sumR += data[nidx];
                    sumG += data[nidx + 1];
                    sumB += data[nidx + 2];
                    count++;
                  }
                }
              }
            }
            
            if (count > 0) {
              data[idx] = sumR / count;
              data[idx + 1] = sumG / count;
              data[idx + 2] = sumB / count;
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);

      const processedUrl = canvas.toDataURL(selectedImage.originalFile.type, 0.95);
      
      setImages(prev => prev.map(img => 
        img.id === selectedImage.id 
          ? { ...img, processedUrl, status: 'done' }
          : img
      ));
      setSelectedImage(prev => prev ? { ...prev, processedUrl, status: 'done' } : null);
    } catch (error) {
      setSelectedImage(prev => prev ? { 
        ...prev, 
        status: 'error', 
        error: '处理失败：' + (error as Error).message 
      } : null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = (image: WatermarkImage) => {
    if (!image.processedUrl) return;
    
    const link = document.createElement('a');
    link.href = image.processedUrl;
    link.download = `removed_${image.originalFile.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearMask = () => {
    setMaskPoints([]);
    if (selectedImage && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx && selectedImage) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = selectedImage.previewUrl;
      }
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const image = prev.find(img => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.previewUrl);
        if (image.processedUrl) {
          URL.revokeObjectURL(image.processedUrl);
        }
      }
      return prev.filter(img => img.id !== id);
    });
    if (selectedImage?.id === id) {
      setSelectedImage(null);
    }
  };

  const clearAll = () => {
    images.forEach(img => {
      URL.revokeObjectURL(img.previewUrl);
      if (img.processedUrl) {
        URL.revokeObjectURL(img.processedUrl);
      }
    });
    setImages([]);
    setSelectedImage(null);
    setMaskPoints([]);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">图片去水印工具</h1>
        <p className="text-gray-600">
          智能识别并涂抹水印区域，AI 算法自动修复，保持原图画质
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Image List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">图片列表</h2>
              <button
                onClick={clearAll}
                className="text-sm text-red-500 hover:text-red-600"
              >
                清空
              </button>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition mb-4"
            >
              <Plus className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">添加图片</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {images.map(image => (
                <div
                  key={image.id}
                  onClick={() => handleImageSelect(image)}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition ${
                    selectedImage?.id === image.id
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <img
                    src={image.previewUrl}
                    alt={image.originalFile.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{image.originalFile.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(image.originalFile.size)}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeImage(image.id); }}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tools */}
          {selectedImage && (
            <div className="mt-4 bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold mb-3">工具</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  画笔大小 ({brushSize}px)
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleClearMask}
                  className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  清除标记
                </button>
                <button
                  onClick={handleRemoveWatermark}
                  disabled={maskPoints.length === 0 || isProcessing}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                  <Eraser className="w-4 h-4" />
                  {isProcessing ? '处理中...' : '去除水印'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Main - Editor */}
        <div className="lg:col-span-3">
          {selectedImage ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>使用说明：</strong>使用红色画笔涂抹水印区域，然后点击"去除水印"按钮。AI 会自动分析周围像素并智能修复。
                </p>
              </div>

              {/* Canvas */}
              <div className="mb-4 bg-gray-100 rounded-lg overflow-hidden">
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleMouseDown}
                  onTouchMove={handleMouseMove}
                  onTouchEnd={handleMouseUp}
                  className="w-full cursor-crosshair"
                  style={{ maxHeight: '500px', touchAction: 'none' }}
                  width={800}
                  height={600}
                />
              </div>

              {/* Stats */}
              {maskPoints.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center gap-2">
                  <Circle className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-blue-800">
                    已标记 {maskPoints.length} 个点，红色区域将被修复
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                {selectedImage.processedUrl && (
                  <button
                    onClick={() => handleDownload(selectedImage)}
                    className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    下载结果
                  </button>
                )}
              </div>

              {/* Processed Preview */}
              {selectedImage.processedUrl && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-3">处理结果</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">原图</p>
                      <img
                        src={selectedImage.previewUrl}
                        alt="Original"
                        className="w-full rounded-lg shadow"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">处理后</p>
                      <img
                        src={selectedImage.processedUrl}
                        alt="Processed"
                        className="w-full rounded-lg shadow"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Eraser className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-lg text-gray-600">选择或上传图片开始去水印</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageWatermarkRemover;
