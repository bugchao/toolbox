import React, { useEffect, useState, useRef } from 'react';
import { Upload, Download, Eraser, X, Plus, Circle } from 'lucide-react';

interface WatermarkImage {
  id: string;
  originalFile: File;
  previewUrl: string;
  processedUrl?: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  error?: string;
}

interface MaskPoint {
  x: number;
  y: number;
  radius: number;
  start?: boolean;
}

interface CanvasImageLayout {
  imageWidth: number;
  imageHeight: number;
  drawWidth: number;
  drawHeight: number;
  offsetX: number;
  offsetY: number;
}

type RepairMode = 'standard' | 'fine' | 'large';

interface RepairModeConfig {
  label: string;
  description: string;
  maskExpansion: number;
  neighborRadius: number;
  passFactor: number;
  minPasses: number;
  fallbackRadiusFactor: number;
  smoothPasses: number;
  smoothBlend: number;
}

const REPAIR_MODE_CONFIGS: Record<RepairMode, RepairModeConfig> = {
  standard: {
    label: '普通修复',
    description: '适合轻度文字水印，速度最快。',
    maskExpansion: 1.15,
    neighborRadius: 1,
    passFactor: 1.8,
    minPasses: 20,
    fallbackRadiusFactor: 2.8,
    smoothPasses: 1,
    smoothBlend: 0.35,
  },
  fine: {
    label: '精细修复',
    description: '更关注边缘自然度，适合半透明水印和细字。',
    maskExpansion: 1.28,
    neighborRadius: 2,
    passFactor: 2.4,
    minPasses: 28,
    fallbackRadiusFactor: 4,
    smoothPasses: 2,
    smoothBlend: 0.42,
  },
  large: {
    label: '大面积修复',
    description: '适合大 Logo 或块状覆盖，扩散范围更大。',
    maskExpansion: 1.45,
    neighborRadius: 2,
    passFactor: 3.2,
    minPasses: 36,
    fallbackRadiusFactor: 5.5,
    smoothPasses: 3,
    smoothBlend: 0.5,
  },
};

const ImageWatermarkRemover: React.FC = () => {
  const [images, setImages] = useState<WatermarkImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<WatermarkImage | null>(null);
  const [brushSize, setBrushSize] = useState(30);
  const [repairMode, setRepairMode] = useState<RepairMode>('fine');
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [maskPoints, setMaskPoints] = useState<MaskPoint[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastPointRef = useRef<MaskPoint | null>(null);
  const canvasLayoutRef = useRef<CanvasImageLayout | null>(null);

  const toPreviewPoint = (point: MaskPoint) => {
    const layout = canvasLayoutRef.current;
    if (!layout) return point;

    const scaleX = layout.drawWidth / layout.imageWidth;
    const scaleY = layout.drawHeight / layout.imageHeight;

    return {
      x: layout.offsetX + point.x * scaleX,
      y: layout.offsetY + point.y * scaleY,
      radius: point.radius * ((scaleX + scaleY) / 2),
    };
  };

  const paintMaskStroke = (
    ctx: CanvasRenderingContext2D,
    point: MaskPoint,
    previousPoint: MaskPoint | null,
    fillStyle: string,
  ) => {
    ctx.save();
    ctx.fillStyle = fillStyle;
    ctx.strokeStyle = fillStyle;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (previousPoint && !point.start) {
      ctx.lineWidth = Math.max(point.radius, previousPoint.radius) * 2;
      ctx.beginPath();
      ctx.moveTo(previousPoint.x, previousPoint.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const drawImageToCanvas = (imageUrl: string) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
      const drawWidth = img.width * scale;
      const drawHeight = img.height * scale;
      const offsetX = (canvas.width - drawWidth) / 2;
      const offsetY = (canvas.height - drawHeight) / 2;

      canvasLayoutRef.current = {
        imageWidth: img.width,
        imageHeight: img.height,
        drawWidth,
        drawHeight,
        offsetX,
        offsetY,
      };

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };
    img.src = imageUrl;
  };

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

  useEffect(() => {
    if (!selectedImage) return;
    drawImageToCanvas(selectedImage.previewUrl);
  }, [selectedImage]);

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !canvasLayoutRef.current) return null;
    
    const canvas = canvasRef.current;
    const layout = canvasLayoutRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const canvasX = (clientX - rect.left) * scaleX;
    const canvasY = (clientY - rect.top) * scaleY;

    const withinImage =
      canvasX >= layout.offsetX &&
      canvasX <= layout.offsetX + layout.drawWidth &&
      canvasY >= layout.offsetY &&
      canvasY <= layout.offsetY + layout.drawHeight;

    if (!withinImage) return null;

    const normalizedX = (canvasX - layout.offsetX) / layout.drawWidth;
    const normalizedY = (canvasY - layout.offsetY) / layout.drawHeight;
    const brushRadiusOnCanvas = brushSize / 2;
    
    return {
      x: normalizedX * layout.imageWidth,
      y: normalizedY * layout.imageHeight,
      radius: brushRadiusOnCanvas * ((layout.imageWidth / layout.drawWidth) + (layout.imageHeight / layout.drawHeight)) / 2,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const nextPoint = getCanvasCoordinates(e);
    if (!nextPoint) {
      setIsDrawing(false);
      return;
    }

    setIsDrawing(true);
    const point = { ...nextPoint, start: true };
    setMaskPoints(prev => [...prev, point]);
    lastPointRef.current = point;

    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const previewPoint = toPreviewPoint(point);
    paintMaskStroke(ctx, previewPoint, null, 'rgba(255, 0, 0, 0.5)');
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    
    const point = getCanvasCoordinates(e);
    if (!point) return;
    setMaskPoints(prev => [...prev, point]);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const previewPoint = toPreviewPoint(point);
    const previousPreviewPoint = lastPointRef.current ? toPreviewPoint(lastPointRef.current) : null;
    paintMaskStroke(ctx, previewPoint, previousPreviewPoint, 'rgba(255, 0, 0, 0.5)');
    lastPointRef.current = point;
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    lastPointRef.current = null;
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
      const modeConfig = REPAIR_MODE_CONFIGS[repairMode];

      // Draw a continuous mask so fast strokes do not leave unpainted gaps.
      let previousPoint: MaskPoint | null = null;
      maskPoints.forEach(point => {
        paintMaskStroke(maskCtx, { ...point, radius: point.radius * modeConfig.maskExpansion }, previousPoint, 'white');
        previousPoint = point.start ? point : point;
      });

      const maskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);

      const pixelCount = canvas.width * canvas.height;
      const pendingMask = new Uint8Array(pixelCount);
      const originalMask = new Uint8Array(pixelCount);

      for (let i = 0; i < pixelCount; i++) {
        const alpha = maskData.data[i * 4 + 3];
        if (alpha > 0) {
          pendingMask[i] = 1;
          originalMask[i] = 1;
        }
      }

      const maxRadius = Math.max(...maskPoints.map((point) => point.radius), brushSize / 2);
      const passBudget = Math.max(Math.round(maxRadius * modeConfig.passFactor), modeConfig.minPasses);
      const nextPass = new Uint8ClampedArray(data.length);
      const resolvedIndexes: number[] = [];

      // Grow color from the watermark boundary inward. This behaves much better than
      // a single average pass when the user marks a larger logo or text block.
      for (let pass = 0; pass < passBudget; pass++) {
        resolvedIndexes.length = 0;
        nextPass.set(data);

        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const pixelIndex = y * canvas.width + x;
            if (pendingMask[pixelIndex] === 0) continue;

            let sumR = 0;
            let sumG = 0;
            let sumB = 0;
            let weightTotal = 0;

            for (let dy = -modeConfig.neighborRadius; dy <= modeConfig.neighborRadius; dy++) {
              for (let dx = -modeConfig.neighborRadius; dx <= modeConfig.neighborRadius; dx++) {
                if (dx === 0 && dy === 0) continue;

                const nx = x + dx;
                const ny = y + dy;
                if (nx < 0 || nx >= canvas.width || ny < 0 || ny >= canvas.height) continue;

                const neighborIndex = ny * canvas.width + nx;
                if (pendingMask[neighborIndex] === 1) continue;

                const rgbaIndex = neighborIndex * 4;
                const distance = Math.hypot(dx, dy);
                const weight = distance === 0 ? 1 : 1 / distance;
                sumR += data[rgbaIndex] * weight;
                sumG += data[rgbaIndex + 1] * weight;
                sumB += data[rgbaIndex + 2] * weight;
                weightTotal += weight;
              }
            }

            if (weightTotal > 0) {
              const rgbaIndex = pixelIndex * 4;
              nextPass[rgbaIndex] = Math.round(sumR / weightTotal);
              nextPass[rgbaIndex + 1] = Math.round(sumG / weightTotal);
              nextPass[rgbaIndex + 2] = Math.round(sumB / weightTotal);
              resolvedIndexes.push(pixelIndex);
            }
          }
        }

        if (resolvedIndexes.length === 0) break;

        data.set(nextPass);
        resolvedIndexes.forEach((pixelIndex) => {
          pendingMask[pixelIndex] = 0;
        });
      }

      // If some pixels still remain unresolved after diffusion, fill them from a
      // wider neighborhood so large solid logos do not stay untouched.
      const fallbackRadius = Math.max(Math.round(maxRadius * modeConfig.fallbackRadiusFactor), 18);
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const pixelIndex = y * canvas.width + x;
          if (pendingMask[pixelIndex] === 0) continue;

          let sumR = 0;
          let sumG = 0;
          let sumB = 0;
          let weightTotal = 0;

          for (let dy = -fallbackRadius; dy <= fallbackRadius; dy++) {
            for (let dx = -fallbackRadius; dx <= fallbackRadius; dx++) {
              const nx = x + dx;
              const ny = y + dy;
              if (nx < 0 || nx >= canvas.width || ny < 0 || ny >= canvas.height) continue;

              const neighborIndex = ny * canvas.width + nx;
              if (pendingMask[neighborIndex] === 1) continue;

              const distance = Math.hypot(dx, dy);
              if (distance === 0 || distance > fallbackRadius) continue;

              const rgbaIndex = neighborIndex * 4;
              const weight = 1 / distance;
              sumR += data[rgbaIndex] * weight;
              sumG += data[rgbaIndex + 1] * weight;
              sumB += data[rgbaIndex + 2] * weight;
              weightTotal += weight;
            }
          }

          if (weightTotal > 0) {
            const rgbaIndex = pixelIndex * 4;
            data[rgbaIndex] = Math.round(sumR / weightTotal);
            data[rgbaIndex + 1] = Math.round(sumG / weightTotal);
            data[rgbaIndex + 2] = Math.round(sumB / weightTotal);
          }
        }
      }

      // Blend the repaired area once more to soften visible seams on text/logo edges.
      for (let smoothPass = 0; smoothPass < modeConfig.smoothPasses; smoothPass++) {
        nextPass.set(data);
        for (let y = 1; y < canvas.height - 1; y++) {
          for (let x = 1; x < canvas.width - 1; x++) {
            const pixelIndex = y * canvas.width + x;
            if (originalMask[pixelIndex] === 0) continue;

            let sumR = 0;
            let sumG = 0;
            let sumB = 0;
            let count = 0;

            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                const neighborIndex = (y + dy) * canvas.width + (x + dx);
                const rgbaIndex = neighborIndex * 4;
                sumR += data[rgbaIndex];
                sumG += data[rgbaIndex + 1];
                sumB += data[rgbaIndex + 2];
                count++;
              }
            }

            const rgbaIndex = pixelIndex * 4;
            nextPass[rgbaIndex] = Math.round((data[rgbaIndex] * (1 - modeConfig.smoothBlend)) + (sumR / count) * modeConfig.smoothBlend);
            nextPass[rgbaIndex + 1] = Math.round((data[rgbaIndex + 1] * (1 - modeConfig.smoothBlend)) + (sumG / count) * modeConfig.smoothBlend);
            nextPass[rgbaIndex + 2] = Math.round((data[rgbaIndex + 2] * (1 - modeConfig.smoothBlend)) + (sumB / count) * modeConfig.smoothBlend);
          }
        }
        data.set(nextPass);
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
    if (selectedImage) drawImageToCanvas(selectedImage.previewUrl);
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

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">修复模式</label>
                <div className="space-y-2">
                  {(['standard', 'fine', 'large'] as RepairMode[]).map((mode) => {
                    const config = REPAIR_MODE_CONFIGS[mode];
                    const active = repairMode === mode;
                    return (
                      <button
                        key={mode}
                        onClick={() => setRepairMode(mode)}
                        className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                          active
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="text-sm font-medium">{config.label}</div>
                        <div className="mt-1 text-xs text-gray-500">{config.description}</div>
                      </button>
                    );
                  })}
                </div>
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
