import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, Download, Copy, RefreshCw, Image as ImageIcon } from 'lucide-react';

const ImageBackgroundRemover: React.FC = () => {
  const { t } = useTranslation('imageBackgroundRemover');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setOriginalImage(event.target?.result as string);
        setProcessedImage(null);
        setProcessed(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBackground = () => {
    if (!originalImage) return;
    
    setIsProcessing(true);
    
    // 模拟AI去背景处理
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        // 绘制原始图片
        ctx.drawImage(img, 0, 0);
        
        // 获取像素数据
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // 简单的绿幕/纯色背景去除算法（实际项目中可接入AI API）
        // 这里实现的是白色背景去除，接近纯白色的像素设置为透明
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // 判断是否为接近白色的背景
          if (r > 240 && g > 240 && b > 240) {
            data[i + 3] = 0; // 设置透明
          }
        }
        
        ctx.putImageData(imageData, 0, 0);
        const resultUrl = canvas.toDataURL('image/png');
        setProcessedImage(resultUrl);
        setIsProcessing(false);
        setProcessed(true);
      };
      img.src = originalImage;
    }, 2000);
  };

  const downloadImage = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `no-bg-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = async () => {
    if (!processedImage) return;
    try {
      const response = await fetch(processedImage);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
      alert(t('copyFailedAlert'));
    }
  };

  const reset = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setProcessed(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-ink">{t('title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左侧上传区 */}
        <div className="space-y-6">
          <div className="bg-surface rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" /> {t('uploadImage')}
            </h2>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-edge-strong rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors bg-surface-muted"
            >
              {originalImage ? (
                <div className="space-y-4">
                  <img
                    src={originalImage}
                    alt={t('originalImageAlt')}
                    className="max-h-64 mx-auto rounded"
                  />
                  <p className="text-sm text-ink-muted">{t('clickToChange')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <ImageIcon className="w-16 h-16 mx-auto text-ink-subtle" />
                  <div>
                    <p className="text-lg font-medium text-ink">{t('clickOrDragUpload')}</p>
                    <p className="text-sm text-ink-muted mt-1">{t('formatHint')}</p>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {originalImage && (
              <div className="mt-6">
                <button
                  onClick={removeBackground}
                  disabled={isProcessing}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      {t('processing')}
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5" />
                      {t('removeBackgroundBtn')}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="bg-surface rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">{t('usageTitle')}</h2>
            <ul className="space-y-2 text-ink">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>{t('usageTip1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>{t('usageTip2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>{t('usageTip3')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>{t('usageTip4')}</span>
              </li>
            </ul>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">{t('noticeTitle')}</h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              {t('noticeText')}
            </p>
          </div>
        </div>

        {/* 右侧结果区 */}
        <div className="space-y-6">
          <div className="bg-surface rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">{t('resultTitle')}</h2>

            {/* ponytail: transparency checkerboard stays neutral so users can judge real alpha, not app theme */}
            <div
              className="border-2 border-edge rounded-lg p-4 flex items-center justify-center bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0iI2ZmZiI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIi8+PHJlY3QgeD0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIvPjxyZWN0IHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiLz48L2c+PC9zdmc+')] bg-[length:20px_20px]"
              style={{ minHeight: '300px' }}
            >
              {processedImage ? (
                <img
                  src={processedImage}
                  alt={t('processedImageAlt')}
                  className="max-h-64 mx-auto rounded"
                />
              ) : processed ? (
                <div className="text-gray-500">{t('processFailed')}</div>
              ) : originalImage ? (
                <div className="text-gray-500">{t('clickToStart')}</div>
              ) : (
                <div className="text-gray-500">{t('uploadFirst')}</div>
              )}
            </div>

            {processedImage && (
              <div className="mt-6 flex gap-4">
                <button
                  onClick={downloadImage}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  {t('downloadPng')}
                </button>
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 py-3 ${
                    copied ? 'bg-green-600' : 'bg-gray-600'
                  } text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2`}
                >
                  <Copy className="w-5 h-5" />
                  {copied ? t('copied') : t('copyToClipboard')}
                </button>
              </div>
            )}

            {(originalImage || processedImage) && (
              <div className="mt-4">
                <button
                  onClick={reset}
                  className="w-full py-2 bg-surface-inset text-ink rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {t('reupload')}
                </button>
              </div>
            )}
          </div>

          <div className="bg-surface rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">{t('featuresTitle')}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl mb-2">⚡</div>
                <h3 className="font-semibold text-ink">{t('featFastTitle')}</h3>
                <p className="text-sm text-ink-muted mt-1">{t('featFastDesc')}</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl mb-2">🔒</div>
                <h3 className="font-semibold text-ink">{t('featPrivacyTitle')}</h3>
                <p className="text-sm text-ink-muted mt-1">{t('featPrivacyDesc')}</p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl mb-2">🎯</div>
                <h3 className="font-semibold text-ink">{t('featQualityTitle')}</h3>
                <p className="text-sm text-ink-muted mt-1">{t('featQualityDesc')}</p>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-2xl mb-2">🆓</div>
                <h3 className="font-semibold text-ink">{t('featFreeTitle')}</h3>
                <p className="text-sm text-ink-muted mt-1">{t('featFreeDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ImageBackgroundRemover;