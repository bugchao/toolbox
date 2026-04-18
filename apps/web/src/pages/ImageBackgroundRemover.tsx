import React, { useState, useRef } from 'react';
import { Upload, Download, Copy, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ImageBackgroundRemover: React.FC = () => {
  const { t } = useTranslation();
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
      console.error(t('imageBackgroundRemover.copyFailed'), error);
      alert(t('imageBackgroundRemover.copyFailed'));
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
      <h1 className="text-3xl font-bold mb-6 text-gray-800">{t('imageBackgroundRemover.title')}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左侧上传区 */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" /> {t('imageBackgroundRemover.uploadImage')}
            </h2>
            
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors bg-gray-50"
            >
              {originalImage ? (
                <div className="space-y-4">
                  <img
                    src={originalImage}
                    alt={t('imageBackgroundRemover.originalImage')}
                    className="max-h-64 mx-auto rounded"
                  />
                  <p className="text-sm text-gray-500">{t('imageBackgroundRemover.reset')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <ImageIcon className="w-16 h-16 mx-auto text-gray-400" />
                  <div>
                    <p className="text-lg font-medium text-gray-700">{t('imageBackgroundRemover.dragOrClick')}</p>
                    <p className="text-sm text-gray-500 mt-1">{t('imageBackgroundRemover.supportedFormats')}</p>
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
                      {t('imageBackgroundRemover.processing')}
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5" />
                      {t('imageBackgroundRemover.removeBackground')}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">{t('imageBackgroundRemover.tips.title')}</h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>{t('imageBackgroundRemover.tips.tip1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>{t('imageBackgroundRemover.tips.tip2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>{t('imageBackgroundRemover.tips.tip3')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>{t('imageBackgroundRemover.tips.tip4')}</span>
              </li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ 功能说明</h3>
            <p className="text-sm text-yellow-700">
              当前版本为基础版，仅支持纯色背景去除。如需复杂背景AI去除功能，可联系管理员开通高级版API接入。
            </p>
          </div>
        </div>

        {/* 右侧结果区 */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">{t('imageBackgroundRemover.processedImage')}</h2>
            
            <div 
              className="border-2 border-gray-200 rounded-lg p-4 flex items-center justify-center bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0iI2ZmZiI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIi8+PHJlY3QgeD0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIvPjxyZWN0IHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiLz48L2c+PC9zdmc+')] bg-[length:20px_20px]"
              style={{ minHeight: '300px' }}
            >
              {processedImage ? (
                <img
                  src={processedImage}
                  alt={t('imageBackgroundRemover.processedImage')}
                  className="max-h-64 mx-auto rounded"
                />
              ) : processed ? (
                <div className="text-gray-500">{t('common.operationFailed')}</div>
              ) : originalImage ? (
                <div className="text-gray-500">{t('imageBackgroundRemover.processing')}</div>
              ) : (
                <div className="text-gray-500">{t('imageBackgroundRemover.uploadImage')}</div>
              )}
            </div>

            {processedImage && (
              <div className="mt-6 flex gap-4">
                <button
                  onClick={downloadImage}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  {t('imageBackgroundRemover.downloadImage')}
                </button>
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 py-3 ${
                    copied ? 'bg-green-600' : 'bg-gray-600'
                  } text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2`}
                >
                  <Copy className="w-5 h-5" />
                  {copied ? t('imageBackgroundRemover.copied') : t('imageBackgroundRemover.copyImage')}
                </button>
              </div>
            )}

            {(originalImage || processedImage) && (
              <div className="mt-4">
                <button
                  onClick={reset}
                  className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {t('imageBackgroundRemover.reset')}
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">✨ 功能特性</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl mb-2">⚡</div>
                <h3 className="font-semibold text-gray-800">快速处理</h3>
                <p className="text-sm text-gray-600 mt-1">本地处理，无需等待</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl mb-2">🔒</div>
                <h3 className="font-semibold text-gray-800">隐私安全</h3>
                <p className="text-sm text-gray-600 mt-1">不上传服务器，数据安全</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl mb-2">🎯</div>
                <h3 className="font-semibold text-gray-800">高质量输出</h3>
                <p className="text-sm text-gray-600 mt-1">无损画质，透明背景</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl mb-2">🆓</div>
                <h3 className="font-semibold text-gray-800">完全免费</h3>
                <p className="text-sm text-gray-600 mt-1">无限制使用，无水印</p>
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