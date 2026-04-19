import React, { useState, useRef } from 'react';
import { Upload, Download, RotateCw, FlipHorizontal, FlipVertical, X, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface RotateImage {
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

const ImageRotator: React.FC = () => {
  const { t } = useTranslation();
  const [images, setImages] = useState<RotateImage[]>([]);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [customAngle, setCustomAngle] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: RotateImage[] = Array.from(files).map(file => ({
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

  const processImage = async (image: RotateImage): Promise<RotateImage> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            ...image,
            status: 'error',
            error: 'Canvas not supported',
          });
          return;
        }

        const rad = (rotation * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        // Calculate new canvas size for arbitrary rotation
        const newWidth = Math.abs(img.width * cos) + Math.abs(img.height * sin);
        const newHeight = Math.abs(img.width * sin) + Math.abs(img.height * cos);

        canvas.width = newWidth;
        canvas.height = newHeight;

        ctx.translate(newWidth / 2, newHeight / 2);
        ctx.rotate(rad);
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve({
                ...image,
                status: 'error',
                error: t('imageRotator.status.error'),
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
          error: t('common.error'),
        });
      };

      img.src = image.previewUrl;
    });
  };

  const handleProcessAll = async () => {
    const processedImages: RotateImage[] = [];
    
    for (const image of images) {
      const processed = await processImage(image);
      processedImages.push(processed);
    }

    setImages(processedImages);
  };

  const handleDownload = (image: RotateImage) => {
    if (!image.processedUrl) return;
    
    const link = document.createElement('a');
    link.href = image.processedUrl;
    link.download = `rotated_${image.originalFile.name}`;
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
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setCustomAngle(0);
  };

  const handleReset = () => {
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setCustomAngle(0);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('imageRotator.title')}</h1>
        <p className="text-gray-600">
          {t('imageRotator.description')}
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">{t('imageRotator.rotation')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quick Rotate */}
          <div>
            <label className="block text-sm font-medium mb-3">{t('imageRotator.rotation')}</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setRotation(prev => prev - 90)}
                className="px-3 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center gap-1"
              >
                <RotateCw className="w-5 h-5 rotate-180" />
                -90°
              </button>
              <button
                onClick={() => setRotation(0)}
                className="px-3 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                0°
              </button>
              <button
                onClick={() => setRotation(prev => prev + 90)}
                className="px-3 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center gap-1"
              >
                <RotateCw className="w-5 h-5" />
                +90°
              </button>
              <button
                onClick={() => setRotation(180)}
                className="px-3 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                180°
              </button>
              <button
                onClick={() => setRotation(270)}
                className="px-3 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                270°
              </button>
              <button
                onClick={handleReset}
                className="px-3 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg"
              >
                {t('common.reset')}
              </button>
            </div>
          </div>

          {/* Custom Angle */}
          <div>
            <label className="block text-sm font-medium mb-3">{t('imageRotator.customAngle')}</label>
            <div className="space-y-3">
              <input
                type="range"
                min="-180"
                max="180"
                value={customAngle}
                onChange={(e) => {
                  setCustomAngle(parseInt(e.target.value));
                  setRotation(parseInt(e.target.value));
                }}
                className="w-full"
              />
              <input
                type="number"
                min="-180"
                max="180"
                value={customAngle}
                onChange={(e) => {
                  setCustomAngle(parseInt(e.target.value) || 0);
                  setRotation(parseInt(e.target.value) || 0);
                }}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <p className="text-sm text-gray-500 text-center">{t('common.current')}: {rotation}°</p>
            </div>
          </div>

          {/* Flip */}
          <div>
            <label className="block text-sm font-medium mb-3">{t('imageRotator.flipHorizontal')} / {t('imageRotator.flipVertical')}</label>
            <div className="space-y-3">
              <button
                onClick={() => setFlipH(!flipH)}
                className={`w-full px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition ${
                  flipH ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <FlipHorizontal className="w-5 h-5" />
                {t('imageRotator.flipHorizontal')}
              </button>
              <button
                onClick={() => setFlipV(!flipV)}
                className={`w-full px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition ${
                  flipV ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <FlipVertical className="w-5 h-5" />
                {t('imageRotator.flipVertical')}
              </button>
            </div>
          </div>
        </div>

        {/* Current Settings */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            {t('common.current')}: {t('imageRotator.rotation')} <span className="font-medium">{rotation}°</span>
            {flipH && <span className="ml-2">| {t('imageRotator.flipHorizontal')}</span>}
            {flipV && <span className="ml-2">| {t('imageRotator.flipVertical')}</span>}
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <div className="mb-6">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 transition"
        >
          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">{t('imageRotator.dragOrClick')}</p>
          <p className="text-sm text-gray-500">{t('imageRotator.supportMultiple')}</p>
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
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {t('imageRotator.processAll')} ({images.length})
          </button>
          
          {images.some(img => img.status === 'done') && (
            <button
              onClick={handleDownloadAll}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              {t('imageRotator.downloadAll')}
            </button>
          )}
          
          <button
            onClick={clearAll}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-2"
          >
            <X className="w-5 h-5" />
            {t('imageRotator.clearAll')}
          </button>
        </div>
      )}

      {/* Image Grid */}
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
                    transform: image.status === 'pending' 
                      ? `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`
                      : 'none',
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
                  <span>{t('imageRotator.originalSize')}: {formatFileSize(image.originalSize || image.originalFile.size)}</span>
                  {image.processedSize && (
                    <span>{t('imageRotator.processedSize')}: {formatFileSize(image.processedSize)}</span>
                  )}
                </div>
                {image.status === 'done' && (
                  <button
                    onClick={() => handleDownload(image)}
                    className="mt-3 w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    {t('common.download')}
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

export default ImageRotator;
