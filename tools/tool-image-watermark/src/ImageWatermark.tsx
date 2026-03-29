import React, { useState, useRef } from 'react';
import { Upload, Download, Type, Image as ImageIcon, X, Plus, Trash2, Settings } from 'lucide-react';

interface WatermarkImage {
  id: string;
  originalFile: File;
  originalSize?: number | null;
  processedBlob?: Blob | null;
  processedSize?: number | null;
  status: 'pending' | 'processing' | 'done' | 'error';
  previewUrl: string;
  processedUrl?: string;
  error?: string;
}

interface WatermarkConfig {
  text: string;
  fontSize: number;
  fontColor: string;
  opacity: number;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  rotation: number;
  offsetX: number;
  offsetY: number;
}

interface LogoConfig {
  file?: File;
  url?: string;
  size: number;
  opacity: number;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  offsetX: number;
  offsetY: number;
}

const ImageWatermark: React.FC = () => {
  const [images, setImages] = useState<WatermarkImage[]>([]);
  const [watermarkType, setWatermarkType] = useState<'text' | 'logo'>('text');
  const [textConfig, setTextConfig] = useState<WatermarkConfig>({
    text: '© Your Name',
    fontSize: 48,
    fontColor: '#ffffff',
    opacity: 0.5,
    position: 'bottom-right',
    rotation: 0,
    offsetX: 20,
    offsetY: 20,
  });
  const [logoConfig, setLogoConfig] = useState<LogoConfig>({
    size: 100,
    opacity: 0.7,
    position: 'bottom-right',
    offsetX: 20,
    offsetY: 20,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

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
      status: 'pending',
      previewUrl: URL.createObjectURL(file),
    }));

    setImages(prev => [...prev, ...newImages]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoConfig(prev => ({
        ...prev,
        file,
        url: URL.createObjectURL(file),
      }));
    }
  };

  const getPositionCoords = (
    position: string,
    imgWidth: number,
    imgHeight: number,
    watermarkWidth: number,
    watermarkHeight: number,
    offsetX: number,
    offsetY: number
  ): { x: number; y: number } => {
    const padding = 20;
    
    switch (position) {
      case 'top-left':
        return { x: padding + offsetX, y: padding + offsetY };
      case 'top-right':
        return { x: imgWidth - watermarkWidth - padding + offsetX, y: padding + offsetY };
      case 'bottom-left':
        return { x: padding + offsetX, y: imgHeight - watermarkHeight - padding + offsetY };
      case 'bottom-right':
        return { x: imgWidth - watermarkWidth - padding + offsetX, y: imgHeight - watermarkHeight - padding + offsetY };
      case 'center':
        return { 
          x: (imgWidth - watermarkWidth) / 2 + offsetX, 
          y: (imgHeight - watermarkHeight) / 2 + offsetY 
        };
      default:
        return { x: padding, y: padding };
    }
  };

  const processImage = async (image: WatermarkImage): Promise<WatermarkImage> => {
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

        if (watermarkType === 'text') {
          ctx.save();
          ctx.globalAlpha = textConfig.opacity;
          ctx.font = `${textConfig.fontSize}px Arial, sans-serif`;
          ctx.fillStyle = textConfig.fontColor;
          ctx.textBaseline = 'bottom';
          
          const textMetrics = ctx.measureText(textConfig.text);
          const textWidth = textMetrics.width;
          const textHeight = textConfig.fontSize;
          
          const { x, y } = getPositionCoords(
            textConfig.position,
            img.width,
            img.height,
            textWidth,
            textHeight,
            textConfig.offsetX,
            textConfig.offsetY
          );
          
          ctx.translate(x + textWidth / 2, y - textHeight / 2);
          ctx.rotate((textConfig.rotation * Math.PI) / 180);
          ctx.fillText(textConfig.text, -textWidth / 2, 0);
          ctx.restore();
        } else if (watermarkType === 'logo' && logoConfig.url) {
          const logoImg = new Image();
          logoImg.crossOrigin = 'anonymous';
          logoImg.onload = () => {
            ctx.save();
            ctx.globalAlpha = logoConfig.opacity;
            
            const logoWidth = logoConfig.size;
            const logoHeight = (logoImg.height / logoImg.width) * logoConfig.size;
            
            const { x, y } = getPositionCoords(
              logoConfig.position,
              img.width,
              img.height,
              logoWidth,
              logoHeight,
              logoConfig.offsetX,
              logoConfig.offsetY
            );
            
            ctx.drawImage(logoImg, x, y, logoWidth, logoHeight);
            ctx.restore();
            
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  resolve({ ...image, status: 'error', error: 'Failed to process image' });
                  return;
                }
                resolve({
                  ...image,
                  processedBlob: blob,
                  processedSize: blob.size,
                  status: 'done',
                  processedUrl: URL.createObjectURL(blob),
                });
              },
              image.originalFile.type,
              0.92
            );
          };
          logoImg.src = logoConfig.url;
          return;
        }

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve({ ...image, status: 'error', error: 'Failed to process image' });
              return;
            }
            resolve({
              ...image,
              processedBlob: blob,
              processedSize: blob.size,
              status: 'done',
              processedUrl: URL.createObjectURL(blob),
            });
          },
          image.originalFile.type,
          0.92
        );
      };
      img.onerror = () => {
        resolve({ ...image, status: 'error', error: 'Failed to load image' });
      };
      img.src = image.previewUrl;
    });
  };

  const handleProcessAll = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    setProgress(0);
    const processedImages: WatermarkImage[] = [];
    for (let i = 0; i < images.length; i++) {
      const processed = await processImage(images[i]);
      processedImages.push(processed);
      setProgress(((i + 1) / images.length) * 100);
    }
    setImages(processedImages);
    setIsProcessing(false);
  };

  const handleDownload = (image: WatermarkImage) => {
    if (!image.processedBlob) return;
    const link = document.createElement('a');
    link.href = image.processedUrl!;
    link.download = `watermarked_${image.originalFile.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = () => {
    images.filter(img => img.status === 'done').forEach(handleDownload);
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const image = prev.find(img => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.previewUrl);
        if (image.processedUrl) URL.revokeObjectURL(image.processedUrl);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const clearAll = () => {
    images.forEach(img => {
      URL.revokeObjectURL(img.previewUrl);
      if (img.processedUrl) URL.revokeObjectURL(img.processedUrl);
    });
    setImages([]);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">图片水印工具</h1>
        <p className="text-gray-600">为图片添加文字或 Logo 水印，支持批量处理、自定义位置、透明度和旋转</p>
      </div>

      <div className="mb-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          水印设置
        </h2>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setWatermarkType('text')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
              watermarkType === 'text' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <Type className="w-4 h-4" />
            文字水印
          </button>
          <button
            onClick={() => setWatermarkType('logo')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
              watermarkType === 'logo' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Logo 水印
          </button>
        </div>

        {watermarkType === 'text' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">水印文字</label>
              <input
                type="text"
                value={textConfig.text}
                onChange={(e) => setTextConfig(prev => ({ ...prev, text: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="输入水印文字"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">字体大小</label>
                <input
                  type="number"
                  value={textConfig.fontSize}
                  onChange={(e) => setTextConfig(prev => ({ ...prev, fontSize: parseInt(e.target.value) || 24 }))}
                  className="w-full px-4 py-2 border rounded-lg"
                  min="12"
                  max="200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">文字颜色</label>
                <input
                  type="color"
                  value={textConfig.fontColor}
                  onChange={(e) => setTextConfig(prev => ({ ...prev, fontColor: e.target.value }))}
                  className="w-full h-10 px-1 py-1 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">透明度</label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={textConfig.opacity}
                  onChange={(e) => setTextConfig(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
                  className="w-full"
                />
                <div className="text-sm text-gray-600 mt-1">{Math.round(textConfig.opacity * 100)}%</div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">旋转角度</label>
                <input
                  type="number"
                  value={textConfig.rotation}
                  onChange={(e) => setTextConfig(prev => ({ ...prev, rotation: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 border rounded-lg"
                  min="-180"
                  max="180"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">位置</label>
              <div className="grid grid-cols-3 gap-2">
                {['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'].map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setTextConfig(prev => ({ ...prev, position: pos as any }))}
                    className={`px-3 py-2 rounded border text-sm transition ${
                      textConfig.position === pos ? 'bg-blue-500 text-white border-blue-500' : 'bg-white hover:bg-gray-50 border-gray-300'
                    }`}
                  >
                    {pos.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">水平偏移 (px)</label>
                <input
                  type="number"
                  value={textConfig.offsetX}
                  onChange={(e) => setTextConfig(prev => ({ ...prev, offsetX: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">垂直偏移 (px)</label>
                <input
                  type="number"
                  value={textConfig.offsetY}
                  onChange={(e) => setTextConfig(prev => ({ ...prev, offsetY: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">上传 Logo</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {logoConfig.file ? '更换 Logo' : '选择 Logo 图片'}
                </button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoSelect}
                  className="hidden"
                />
                {logoConfig.file && (
                  <div className="flex items-center gap-2">
                    <img src={logoConfig.url} alt="Logo preview" className="h-12 w-auto border rounded" />
                    <span className="text-sm text-gray-600">{logoConfig.file.name}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Logo 大小</label>
                <input
                  type="number"
                  value={logoConfig.size}
                  onChange={(e) => setLogoConfig(prev => ({ ...prev, size: parseInt(e.target.value) || 100 }))}
                  className="w-full px-4 py-2 border rounded-lg"
                  min="20"
                  max="500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">透明度</label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={logoConfig.opacity}
                  onChange={(e) => setLogoConfig(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
                  className="w-full"
                />
                <div className="text-sm text-gray-600 mt-1">{Math.round(logoConfig.opacity * 100)}%</div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">位置</label>
                <select
                  value={logoConfig.position}
                  onChange={(e) => setLogoConfig(prev => ({ ...prev, position: e.target.value as any }))}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="top-left">左上角</option>
                  <option value="top-right">右上角</option>
                  <option value="bottom-left">左下角</option>
                  <option value="bottom-right">右下角</option>
                  <option value="center">居中</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">水平偏移 (px)</label>
                <input
                  type="number"
                  value={logoConfig.offsetX}
                  onChange={(e) => setLogoConfig(prev => ({ ...prev, offsetX: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">垂直偏移 (px)</label>
                <input
                  type="number"
                  value={logoConfig.offsetY}
                  onChange={(e) => setLogoConfig(prev => ({ ...prev, offsetY: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mb-6">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 transition"
        >
          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">点击或拖拽上传图片</p>
          <p className="text-sm text-gray-500">支持 JPG、PNG、WebP 等格式，支持批量上传</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {images.length > 0 && (
        <div className="mb-6 flex gap-4">
          <button
            onClick={handleProcessAll}
            disabled={isProcessing}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {isProcessing ? '处理中...' : `添加水印 (${images.length}张)`}
          </button>
          {images.some(img => img.status === 'done') && (
            <button
              onClick={handleDownloadAll}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              下载全部
            </button>
          )}
          <button
            onClick={clearAll}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            清空
          </button>
        </div>
      )}

      {isProcessing && (
        <div className="mb-6">
          <div className="bg-gray-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-sm text-gray-600 mt-2">正在处理：{Math.round(progress)}%</p>
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <div key={image.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="relative aspect-video bg-gray-100">
                <img src={image.processedUrl || image.previewUrl} alt={image.originalFile.name} className="w-full h-full object-contain" />
                {image.status === 'processing' && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
                  </div>
                )}
                <button onClick={() => removeImage(image.id)} className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4">
                <p className="font-medium truncate mb-2">{image.originalFile.name}</p>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>原始：{formatFileSize(image.originalSize || image.originalFile.size)}</span>
                  {image.processedSize && <span>处理后：{formatFileSize(image.processedSize)}</span>}
                </div>
                {image.status === 'done' && (
                  <button onClick={() => handleDownload(image)} className="mt-3 w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    下载
                  </button>
                )}
                {image.status === 'error' && <p className="mt-2 text-sm text-red-500">{image.error}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageWatermark;
