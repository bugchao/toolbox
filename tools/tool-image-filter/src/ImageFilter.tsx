import React, { useState, useRef } from 'react';
import { Upload, Download, Sparkles, X, Plus, Sliders } from 'lucide-react';

interface FilterImage {
  id: string;
  originalFile: File;
  originalSize?: number;
  previewUrl: string;
  processedBlob?: Blob;
  processedSize?: number;
  processedUrl?: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  error?: string;
}

interface FilterSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  sepia: number;
  grayscale: number;
  blur: number;
  hueRotate: number;
  invert: number;
}

const PRESET_FILTERS: { name: string; settings: FilterSettings }[] = [
  {
    name: '原图',
    settings: { brightness: 100, contrast: 100, saturation: 100, sepia: 0, grayscale: 0, blur: 0, hueRotate: 0, invert: 0 },
  },
  {
    name: '鲜艳',
    settings: { brightness: 110, contrast: 120, saturation: 130, sepia: 0, grayscale: 0, blur: 0, hueRotate: 0, invert: 0 },
  },
  {
    name: '柔和',
    settings: { brightness: 105, contrast: 90, saturation: 110, sepia: 0, grayscale: 0, blur: 0.5, hueRotate: 0, invert: 0 },
  },
  {
    name: '复古',
    settings: { brightness: 90, contrast: 110, saturation: 80, sepia: 60, grayscale: 0, blur: 0, hueRotate: 0, invert: 0 },
  },
  {
    name: '黑白',
    settings: { brightness: 100, contrast: 120, saturation: 0, sepia: 0, grayscale: 100, blur: 0, hueRotate: 0, invert: 0 },
  },
  {
    name: '棕褐色',
    settings: { brightness: 100, contrast: 100, saturation: 100, sepia: 100, grayscale: 0, blur: 0, hueRotate: 0, invert: 0 },
  },
  {
    name: '冷色',
    settings: { brightness: 100, contrast: 100, saturation: 100, sepia: 0, grayscale: 0, blur: 0, hueRotate: 30, invert: 0 },
  },
  {
    name: '暖色',
    settings: { brightness: 105, contrast: 100, saturation: 110, sepia: 30, grayscale: 0, blur: 0, hueRotate: -20, invert: 0 },
  },
  {
    name: '梦幻',
    settings: { brightness: 110, contrast: 90, saturation: 120, sepia: 20, grayscale: 0, blur: 1, hueRotate: 10, invert: 0 },
  },
  {
    name: '胶片',
    settings: { brightness: 95, contrast: 110, saturation: 90, sepia: 20, grayscale: 0, blur: 0.5, hueRotate: 0, invert: 0 },
  },
  {
    name: '负片',
    settings: { brightness: 100, contrast: 100, saturation: 100, sepia: 0, grayscale: 0, blur: 0, hueRotate: 0, invert: 100 },
  },
  {
    name: '朦胧',
    settings: { brightness: 115, contrast: 80, saturation: 80, sepia: 0, grayscale: 0, blur: 2, hueRotate: 0, invert: 0 },
  },
];

const ImageFilter: React.FC = () => {
  const [images, setImages] = useState<FilterImage[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('原图');
  const [settings, setSettings] = useState<FilterSettings>(PRESET_FILTERS[0].settings);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: FilterImage[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      originalFile: file,
      previewUrl: URL.createObjectURL(file),
      status: 'pending',
    }));

    setImages(prev => [...prev, ...newImages]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const applyFilter = async (image: FilterImage): Promise<FilterImage> => {
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

        // Apply CSS-like filters
        const filterString = `
          brightness(${settings.brightness}%)
          contrast(${settings.contrast}%)
          saturate(${settings.saturation}%)
          sepia(${settings.sepia}%)
          grayscale(${settings.grayscale}%)
          blur(${settings.blur}px)
          hue-rotate(${settings.hueRotate}deg)
          invert(${settings.invert}%)
        `.trim();

        ctx.filter = filterString;
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve({
                ...image,
                status: 'error',
                error: '处理失败',
              });
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
          0.95
        );
      };

      img.onerror = () => {
        resolve({
          ...image,
          status: 'error',
          error: '加载图片失败',
        });
      };

      img.src = image.previewUrl;
    });
  };

  const handleProcessAll = async () => {
    if (images.length === 0) return;
    
    setIsProcessing(true);
    const processedImages: FilterImage[] = [];
    
    for (const image of images) {
      const processed = await applyFilter(image);
      processedImages.push(processed);
    }

    setImages(processedImages);
    setIsProcessing(false);
  };

  const handleDownload = (image: FilterImage) => {
    if (!image.processedUrl) return;
    
    const link = document.createElement('a');
    link.href = image.processedUrl;
    link.download = `filtered_${image.originalFile.name}`;
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
        if (image.processedUrl) {
          URL.revokeObjectURL(image.processedUrl);
        }
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const clearAll = () => {
    images.forEach(img => {
      URL.revokeObjectURL(img.previewUrl);
      if (img.processedUrl) {
        URL.revokeObjectURL(img.processedUrl);
      }
    });
    setImages([]);
    setSelectedFilter('原图');
    setSettings(PRESET_FILTERS[0].settings);
  };

  const handlePresetSelect = (preset: typeof PRESET_FILTERS[0]) => {
    setSelectedFilter(preset.name);
    setSettings(preset.settings);
  };

  const updateSetting = (key: keyof FilterSettings, value: number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSelectedFilter('自定义');
  };

  const getFilterString = () => {
    return `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%) sepia(${settings.sepia}%) grayscale(${settings.grayscale}%) blur(${settings.blur}px) hue-rotate(${settings.hueRotate}deg) invert(${settings.invert}%)`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">图片滤镜工具</h1>
        <p className="text-gray-600">
          提供 12 种预设滤镜，支持自定义亮度、对比度、饱和度等参数，批量处理
        </p>
      </div>

      {/* Preset Filters */}
      <div className="mb-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          预设滤镜
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {PRESET_FILTERS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handlePresetSelect(preset)}
              className={`p-3 rounded-lg border-2 transition text-center ${
                selectedFilter === preset.name
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div
                className="w-full aspect-square rounded mb-2 bg-gradient-to-br from-gray-200 to-gray-300"
                style={{ filter: `brightness(${preset.settings.brightness}%) contrast(${preset.settings.contrast}%) saturate(${preset.settings.saturation}%) sepia(${preset.settings.sepia}%)` }}
              />
              <p className="text-sm font-medium">{preset.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="mb-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sliders className="w-5 h-5" />
          高级调整
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">亮度 ({settings.brightness}%)</label>
            <input
              type="range"
              min="0"
              max="200"
              value={settings.brightness}
              onChange={(e) => updateSetting('brightness', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">对比度 ({settings.contrast}%)</label>
            <input
              type="range"
              min="0"
              max="200"
              value={settings.contrast}
              onChange={(e) => updateSetting('contrast', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">饱和度 ({settings.saturation}%)</label>
            <input
              type="range"
              min="0"
              max="200"
              value={settings.saturation}
              onChange={(e) => updateSetting('saturation', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">色温 ({settings.sepia}%)</label>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.sepia}
              onChange={(e) => updateSetting('sepia', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">灰度 ({settings.grayscale}%)</label>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.grayscale}
              onChange={(e) => updateSetting('grayscale', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">模糊 ({settings.blur}px)</label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={settings.blur}
              onChange={(e) => updateSetting('blur', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">色相旋转 ({settings.hueRotate}°)</label>
            <input
              type="range"
              min="0"
              max="360"
              value={settings.hueRotate}
              onChange={(e) => updateSetting('hueRotate', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">反色 ({settings.invert}%)</label>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.invert}
              onChange={(e) => updateSetting('invert', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Upload Area */}
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

      {/* Action Buttons */}
      {images.length > 0 && (
        <div className="mb-6 flex gap-4">
          <button
            onClick={handleProcessAll}
            disabled={isProcessing}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {isProcessing ? '处理中...' : `应用滤镜 (${images.length}张)`}
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
            <X className="w-5 h-5" />
            清空
          </button>
        </div>
      )}

      {/* Image Grid with Preview */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <div key={image.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="relative aspect-video bg-gray-100">
                <img
                  src={image.processedUrl || image.previewUrl}
                  alt={image.originalFile.name}
                  className="w-full h-full object-contain"
                  style={{
                    filter: image.status === 'pending' ? getFilterString() : 'none',
                  }}
                />
                {image.status === 'processing' && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
                  </div>
                )}
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-4">
                <p className="font-medium truncate mb-2">{image.originalFile.name}</p>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>原始：{formatFileSize(image.originalSize || image.originalFile.size)}</span>
                  {image.processedSize && (
                    <span>处理后：{formatFileSize(image.processedSize)}</span>
                  )}
                </div>
                {image.status === 'done' && (
                  <button
                    onClick={() => handleDownload(image)}
                    className="mt-3 w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    下载
                  </button>
                )}
                {image.status === 'error' && (
                  <p className="mt-2 text-sm text-red-500">{image.error}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageFilter;
