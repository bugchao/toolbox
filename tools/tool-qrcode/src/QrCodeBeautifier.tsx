import React, { useState, useRef } from 'react';
import { Download, Copy, Upload, Palette, Layers, Image as ImageIcon } from 'lucide-react';
import QRCode from 'qrcode';

const QrCodeBeautifier: React.FC = () => {
  const [text, setText] = useState('https://example.com');
  const [qrSize, setQrSize] = useState(300);
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState(60);
  const [dotStyle, setDotStyle] = useState<'square' | 'rounded' | 'dots'>('square');
  const [eyeStyle, setEyeStyle] = useState<'square' | 'rounded' | 'circle'>('square');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 在 (x, y) 处画一个边长 size 的“模块”，按 dotStyle 选择方形/圆角/圆点
  const drawModule = (
    ctx: CanvasRenderingContext2D,
    style: 'square' | 'rounded' | 'dots',
    x: number,
    y: number,
    size: number,
  ) => {
    if (style === 'dots') {
      const r = size / 2;
      ctx.beginPath();
      ctx.arc(x + r, y + r, r * 0.92, 0, Math.PI * 2);
      ctx.fill();
    } else if (style === 'rounded') {
      const r = size * 0.3;
      ctx.beginPath();
      ctx.roundRect(x, y, size, size, r);
      ctx.fill();
    } else {
      ctx.fillRect(x, y, size, size);
    }
  };

  // 定位角「眼睛」：7x7 外框 + 5x5 镂空 + 3x3 内芯，三层同风格叠画
  const drawEye = (
    ctx: CanvasRenderingContext2D,
    style: 'square' | 'rounded' | 'circle',
    left: number,
    top: number,
    moduleSize: number,
    dark: string,
    light: string,
  ) => {
    const drawLayer = (span: number, offset: number, color: string) => {
      const x = left + offset * moduleSize;
      const y = top + offset * moduleSize;
      const size = span * moduleSize;
      ctx.fillStyle = color;
      if (style === 'circle') {
        const r = size / 2;
        ctx.beginPath();
        ctx.arc(x + r, y + r, r, 0, Math.PI * 2);
        ctx.fill();
      } else if (style === 'rounded') {
        ctx.beginPath();
        ctx.roundRect(x, y, size, size, size * 0.22);
        ctx.fill();
      } else {
        ctx.fillRect(x, y, size, size);
      }
    };
    drawLayer(7, 0, dark);
    drawLayer(5, 1, light);
    drawLayer(3, 2, dark);
  };

  const isInsideEye = (row: number, col: number, moduleCount: number) => {
    const inTopLeft = row < 7 && col < 7;
    const inTopRight = row < 7 && col >= moduleCount - 7;
    const inBottomLeft = row >= moduleCount - 7 && col < 7;
    return inTopLeft || inTopRight || inBottomLeft;
  };

  const generateQrCode = async () => {
    if (!text.trim()) {
      alert('请输入要生成二维码的内容');
      return;
    }

    setIsGenerating(true);
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = qrSize;
      canvas.height = qrSize;

      // 拿到原始模块矩阵（而不是现成的 dataURL），才能按模块自定义形状
      const qr = QRCode.create(text, { errorCorrectionLevel: errorCorrection });
      const moduleCount = qr.modules.size;
      const margin = 1; // 静区，单位：模块
      const totalModules = moduleCount + margin * 2;
      const moduleSize = qrSize / totalModules;

      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, qrSize, qrSize);

      ctx.fillStyle = foregroundColor;
      for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
          if (!qr.modules.get(row, col)) continue;
          if (isInsideEye(row, col, moduleCount)) continue;
          const x = (col + margin) * moduleSize;
          const y = (row + margin) * moduleSize;
          drawModule(ctx, dotStyle, x, y, moduleSize);
        }
      }

      const eyeOrigins: Array<[number, number]> = [
        [0, 0],
        [0, moduleCount - 7],
        [moduleCount - 7, 0],
      ];
      for (const [row, col] of eyeOrigins) {
        drawEye(
          ctx,
          eyeStyle,
          (col + margin) * moduleSize,
          (row + margin) * moduleSize,
          moduleSize,
          foregroundColor,
          backgroundColor,
        );
      }

      // 如果有Logo，添加到中心
      if (logoImage) {
        const logoImg = new Image();
        logoImg.onload = () => {
          const logoX = (qrSize - logoSize) / 2;
          const logoY = (qrSize - logoSize) / 2;

          // 画白色背景
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(logoX - 4, logoY - 4, logoSize + 8, logoSize + 8);

          ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);

          const finalUrl = canvas.toDataURL('image/png');
          setQrCodeUrl(finalUrl);
          setIsGenerating(false);
        };
        logoImg.src = logoImage;
      } else {
        const finalUrl = canvas.toDataURL('image/png');
        setQrCodeUrl(finalUrl);
        setIsGenerating(false);
      }
    } catch (error) {
      console.error('生成二维码失败:', error);
      alert('生成二维码失败，请重试');
      setIsGenerating(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadQrCode = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `qrcode-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = async () => {
    if (!qrCodeUrl) return;
    try {
      const response = await fetch(qrCodeUrl);
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
      alert('复制失败，请手动下载');
    }
  };

  React.useEffect(() => {
    generateQrCode();
  }, [text, qrSize, errorCorrection, foregroundColor, backgroundColor, logoSize, dotStyle, eyeStyle]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">二维码美化工具</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左侧配置区 */}
        <div className="space-y-6">
          {/* 内容输入 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <span className="text-blue-600 dark:text-blue-400">📝</span> 基础内容
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  二维码内容
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-24 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  placeholder="输入网址、文本或任何内容..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    二维码大小 (px)
                  </label>
                  <input
                    type="number"
                    value={qrSize}
                    onChange={(e) => setQrSize(Math.max(100, Math.min(1000, parseInt(e.target.value) || 300)))}
                    min="100"
                    max="1000"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    容错级别
                  </label>
                  <select
                    value={errorCorrection}
                    onChange={(e) => setErrorCorrection(e.target.value as 'L' | 'M' | 'Q' | 'H')}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="L">低 (7%)</option>
                    <option value="M">中 (15%)</option>
                    <option value="Q">较高 (25%)</option>
                    <option value="H">高 (30%)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 颜色配置 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" /> 颜色设置
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  前景色
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer bg-white"
                  />
                  <input
                    type="text"
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  背景色
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer bg-white"
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Logo配置 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <ImageIcon className="w-5 h-5 text-green-600 dark:text-green-400" /> Logo设置
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  上传Logo
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    选择图片
                  </button>
                  {logoImage && (
                    <button
                      onClick={removeLogo}
                      className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    >
                      移除Logo
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
              </div>
              
              {logoImage && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Logo大小 (px)
                  </label>
                  <input
                    type="number"
                    value={logoSize}
                    onChange={(e) => setLogoSize(Math.max(20, Math.min(qrSize / 3, parseInt(e.target.value) || 60)))}
                    min="20"
                    max={qrSize / 3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 样式配置 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Layers className="w-5 h-5 text-orange-600 dark:text-orange-400" /> 样式设置
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  点样式
                </label>
                <select
                  value={dotStyle}
                  onChange={(e) => setDotStyle(e.target.value as 'square' | 'rounded' | 'dots')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="square">方形</option>
                  <option value="rounded">圆角</option>
                  <option value="dots">圆点</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  角点样式
                </label>
                <select
                  value={eyeStyle}
                  onChange={(e) => setEyeStyle(e.target.value as 'square' | 'rounded' | 'circle')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="square">方形</option>
                  <option value="rounded">圆角</option>
                  <option value="circle">圆形</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧预览区 */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">二维码预览</h2>
            <div className="flex flex-col items-center space-y-6">
              <div
                className="border-2 border-gray-200 dark:border-gray-600 rounded-lg p-4 flex items-center justify-center bg-gray-50 dark:bg-gray-700/50"
                style={{ minHeight: qrSize + 32 }}
              >
                {isGenerating ? (
                  <div className="text-gray-500 dark:text-gray-400">生成中...</div>
                ) : qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="生成的二维码"
                    className="max-w-full"
                    style={{ width: qrSize, height: qrSize }}
                  />
                ) : (
                  <div className="text-gray-500 dark:text-gray-400">请输入内容生成二维码</div>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {qrCodeUrl && (
                <div className="flex gap-4 w-full justify-center">
                  <button
                    onClick={downloadQrCode}
                    className="px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    下载PNG
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className={`px-6 py-3 ${
                      copied ? 'bg-green-600 dark:bg-green-500' : 'bg-gray-600 dark:bg-gray-500'
                    } text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2`}
                  >
                    <Copy className="w-5 h-5" />
                    {copied ? '已复制' : '复制到剪贴板'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">💡 使用提示</h2>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 dark:text-blue-400 font-bold">•</span>
                <span>高容错级别适合添加较大的Logo，二维码被遮挡部分仍可识别</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 dark:text-blue-400 font-bold">•</span>
                <span>建议Logo大小不超过二维码的1/3，避免影响扫码识别</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 dark:text-blue-400 font-bold">•</span>
                <span>前景色和背景色需要有足够的对比度，确保扫码成功率</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 dark:text-blue-400 font-bold">•</span>
                <span>生成的二维码可以直接下载或复制到剪贴板使用</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrCodeBeautifier;