import React, { useState, useRef } from 'react';
import { Upload, Download, Scissors, RotateCcw, X, Plus, Check } from 'lucide-react';

interface CropImage {
  id: string;
  originalFile: File;
  previewUrl: string;
  processedUrl?: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  error?: string;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const PRESET_RATIOS = [
  { label: '自由', value: 'free' },
  { label: '1:1', value: '1:1' },
  { label: '4:3', value: '4:3' },
  { label: '3:2', value: '3:2' },
  { label: '16:9', value: '16:9' },
  { label: '9:16', value: '9:16' },
  { label: 'A4', value: 'a4' },
];

const ImageCropper: React.FC = () => {
  const [images, setImages] = useState<CropImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<CropImage | null>(null);
  const [aspectRatio, setAspectRatio] = useState<string>('free');
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: CropImage[] = Array.from(files).map(file => ({
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

  const handleImageSelect = (image: CropImage) => {
    setSelectedImage(image);
    setRotation(0);
    setFlipHorizontal(false);
    setFlipVertical(false);
    setCropArea({ x: 0, y: 0, width: 0, height: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !selectedImage) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDragging(true);
    setDragStart({ x, y });
    setCropArea({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    let newArea = {
      x: Math.min(dragStart.x, x),
      y: Math.min(dragStart.y, y),
      width: Math.abs(x - dragStart.x),
      height: Math.abs(y - dragStart.y),
    };

    if (aspectRatio !== 'free') {
      const [ratioW, ratioH] = aspectRatio === 'a4' ? [1, 1.414] : aspectRatio.split(':').map(Number);
      const targetRatio = ratioW / ratioH;
      const currentRatio = newArea.width / (newArea.height || 1);
      
      if (currentRatio > targetRatio) {
        newArea.width = newArea.height * targetRatio;
      } else {
        newArea.height = newArea.width / targetRatio;
      }
    }

    setCropArea(newArea);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCrop = async () => {
    if (!selectedImage || !canvasRef.current || cropArea.width === 0 || cropArea.height === 0) return;

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
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      const scaleX = img.width / canvasRef.current.width;
      const scaleY = img.height / canvasRef.current.height;

      canvas.width = cropArea.width * scaleX;
      canvas.height = cropArea.height * scaleY;

      ctx.save();
      
      // Apply transformations
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
      ctx.translate(-centerX, -centerY);

      ctx.drawImage(
        img,
        cropArea.x * scaleX,
        cropArea.y * scaleY,
        cropArea.width * scaleX,
        cropArea.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );

      ctx.restore();

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
        error: '裁剪失败：' + (error as Error).message 
      } : null);
    }
  };

  const handleDownload = (image: CropImage) => {
    if (!image.processedUrl) return;
    
    const link = document.createElement('a');
    link.href = image.processedUrl;
    link.download = `cropped_${image.originalFile.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setCropArea({ x: 0, y: 0, width: 0, height: 0 });
    setRotation(0);
    setFlipHorizontal(false);
    setFlipVertical(false);
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
      handleReset();
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
    handleReset();
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">图片裁剪工具</h1>
        <p className="text-gray-600">
          自由裁剪或按预设比例裁剪图片，支持旋转、翻转，批量处理
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
        </div>

        {/* Main - Editor */}
        <div className="lg:col-span-3">
          {selectedImage ? (
            <div className="bg-white rounded-lg shadow p-6">
              {/* Controls */}
              <div className="mb-4 flex flex-wrap gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">裁剪比例</label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="px-4 py-2 border rounded-lg"
                  >
                    {PRESET_RATIOS.map(ratio => (
                      <option key={ratio.value} value={ratio.value}>{ratio.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">旋转</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setRotation(prev => prev - 90)}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                    >
                      -90°
                    </button>
                    <button
                      onClick={() => setRotation(0)}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1"
                    >
                      <RotateCcw className="w-4 h-4" />
                      重置
                    </button>
                    <button
                      onClick={() => setRotation(prev => prev + 90)}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                    >
                      +90°
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">翻转</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFlipHorizontal(!flipHorizontal)}
                      className={`px-3 py-2 rounded-lg ${
                        flipHorizontal ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      水平
                    </button>
                    <button
                      onClick={() => setFlipVertical(!flipVertical)}
                      className={`px-3 py-2 rounded-lg ${
                        flipVertical ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      垂直
                    </button>
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                  >
                    重置全部
                  </button>
                </div>
              </div>

              {/* Canvas */}
              <div ref={containerRef} className="mb-4 bg-gray-100 rounded-lg overflow-hidden">
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className="w-full cursor-crosshair"
                  style={{ maxHeight: '500px' }}
                  width={800}
                  height={600}
                />
              </div>

              {/* Crop Info */}
              {cropArea.width > 0 && cropArea.height > 0 && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    裁剪区域：{Math.round(cropArea.width)} × {Math.round(cropArea.height)} px
                    {aspectRatio !== 'free' && ` (${aspectRatio})`}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleCrop}
                  disabled={cropArea.width === 0 || cropArea.height === 0 || selectedImage.status === 'processing'}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition flex items-center gap-2"
                >
                  <Scissors className="w-5 h-5" />
                  {selectedImage.status === 'processing' ? '处理中...' : '裁剪'}
                </button>

                {selectedImage.status === 'done' && (
                  <button
                    onClick={() => handleDownload(selectedImage)}
                    className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    下载
                  </button>
                )}
              </div>

              {/* Processed Preview */}
              {selectedImage.processedUrl && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-3">裁剪结果</h3>
                  <img
                    src={selectedImage.processedUrl}
                    alt="Cropped"
                    className="max-w-full rounded-lg shadow"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Scissors className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-lg text-gray-600">选择或上传图片开始裁剪</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
