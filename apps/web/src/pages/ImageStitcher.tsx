import React, { useState, useRef } from 'react';
import { Upload, Download, LayoutGrid, Columns, Rows, X, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface StitchImage {
  id: string;
  file: File;
  previewUrl: string;
  width?: number;
  height?: number;
}

const ImageStitcher: React.FC = () => {
  const { t } = useTranslation();
  const [images, setImages] = useState<StitchImage[]>([]);
  const [direction, setDirection] = useState<'horizontal' | 'vertical'>('horizontal');
  const [gap, setGap] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: StitchImage[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setImages(prev => [...prev, ...newImages]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const image = prev.find(img => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.previewUrl);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newImages = [...images];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newImages.length) return;
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    setImages(newImages);
  };

  const handleStitch = async () => {
    if (images.length < 2) return;

    setIsProcessing(true);

    try {
      // Load all images
      const loadedImages: HTMLImageElement[] = await Promise.all(
        images.map(image => {
          return new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = image.previewUrl;
          });
        })
      );

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      if (direction === 'horizontal') {
        const totalWidth = loadedImages.reduce((sum, img) => sum + img.width, 0) + gap * (loadedImages.length - 1);
        const maxHeight = Math.max(...loadedImages.map(img => img.height));
        
        canvas.width = totalWidth;
        canvas.height = maxHeight;

        // Fill background
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw images
        let x = 0;
        loadedImages.forEach((img, index) => {
          const y = (maxHeight - img.height) / 2; // Center vertically
          ctx.drawImage(img, x, y);
          x += img.width + gap;
        });
      } else {
        const maxWidth = Math.max(...loadedImages.map(img => img.width));
        const totalHeight = loadedImages.reduce((sum, img) => sum + img.height, 0) + gap * (loadedImages.length - 1);
        
        canvas.width = maxWidth;
        canvas.height = totalHeight;

        // Fill background
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw images
        let y = 0;
        loadedImages.forEach((img) => {
          const x = (maxWidth - img.width) / 2; // Center horizontally
          ctx.drawImage(img, x, y);
          y += img.height + gap;
        });
      }

      const url = canvas.toDataURL('image/png', 1.0);
      setResultUrl(url);
    } catch (error) {
      console.error('Stitch failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    
    const link = document.createElement('a');
    link.href = resultUrl;
    link.download = `stitched_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearAll = () => {
    images.forEach(img => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    setResultUrl(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">图片拼接工具</h1>
        <p className="text-gray-600">
          将多张图片横向或纵向拼接成一张，支持自定义间距和背景色
        </p>
      </div>

      {/* Settings */}
      <div className="mb-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">拼接设置</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Direction */}
          <div>
            <label className="block text-sm font-medium mb-3">拼接方向</label>
            <div className="flex gap-2">
              <button
                onClick={() => setDirection('horizontal')}
                className={`flex-1 px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition ${
                  direction === 'horizontal'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Columns className="w-5 h-5" />
                横向
              </button>
              <button
                onClick={() => setDirection('vertical')}
                className={`flex-1 px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition ${
                  direction === 'vertical'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Rows className="w-5 h-5" />
                纵向
              </button>
            </div>
          </div>

          {/* Gap */}
          <div>
            <label className="block text-sm font-medium mb-3">间距 ({gap}px)</label>
            <input
              type="range"
              min="0"
              max="100"
              value={gap}
              onChange={(e) => setGap(parseInt(e.target.value))}
              className="w-full"
            />
            <input
              type="number"
              min="0"
              max="100"
              value={gap}
              onChange={(e) => setGap(parseInt(e.target.value) || 0)}
              className="w-full mt-2 px-4 py-2 border rounded-lg"
            />
          </div>

          {/* Background Color */}
          <div>
            <label className="block text-sm font-medium mb-3">背景色</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-12 h-10 border rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-lg"
                placeholder="#ffffff"
              />
            </div>
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
          <p className="text-sm text-gray-500">至少需要 2 张图片，支持批量上传</p>
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

      {/* Image List */}
      {images.length > 0 && (
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">图片列表 ({images.length}张)</h2>
            <button
              onClick={clearAll}
              className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              清空
            </button>
          </div>

          <div className={`grid gap-4 ${direction === 'horizontal' ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1'}`}>
            {images.map((image, index) => (
              <div key={image.id} className="relative group">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={image.previewUrl}
                    alt={image.file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => moveImage(index, 'up')}
                    disabled={index === 0}
                    className="p-2 bg-white rounded-full disabled:opacity-50"
                    title="上移"
                  >
                    <Rows className="w-4 h-4 rotate-90" />
                  </button>
                  <button
                    onClick={() => moveImage(index, 'down')}
                    disabled={index === images.length - 1}
                    className="p-2 bg-white rounded-full disabled:opacity-50"
                    title="下移"
                  >
                    <Rows className="w-4 h-4 -rotate-90" />
                  </button>
                  <button
                    onClick={() => removeImage(image.id)}
                    className="p-2 bg-red-500 text-white rounded-full"
                    title="删除"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-2 text-sm text-gray-600 truncate">
                  {index + 1}. {image.file.name}
                </div>
                <div className="text-xs text-gray-500">
                  {formatFileSize(image.file.size)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {images.length >= 2 && (
        <div className="mb-6 flex gap-4">
          <button
            onClick={handleStitch}
            disabled={isProcessing}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition flex items-center gap-2"
          >
            <LayoutGrid className="w-5 h-5" />
            {isProcessing ? '拼接中...' : '开始拼接'}
          </button>
          
          {resultUrl && (
            <button
              onClick={handleDownload}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              下载结果
            </button>
          )}
        </div>
      )}

      {/* Result Preview */}
      {resultUrl && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">拼接结果</h2>
          <div className="bg-gray-100 rounded-lg overflow-auto max-h-96 flex items-center justify-center p-4">
            <img src={resultUrl} alt="Stitched result" className="max-w-full max-h-80 object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageStitcher;
