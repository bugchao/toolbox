import React, { useState, useRef } from 'react';

interface PhotoSpec {
  name: string;
  width: number;
  height: number;
  dpi: number;
}

const PHOTO_SPECS: PhotoSpec[] = [
  { name: '一寸照', width: 295, height: 413, dpi: 300 },
  { name: '二寸照', width: 413, height: 626, dpi: 300 },
  { name: '小一寸', width: 260, height: 378, dpi: 300 },
  { name: '大一寸', width: 390, height: 567, dpi: 300 },
  { name: '护照照片', width: 390, height: 567, dpi: 300 },
  { name: '身份证照片', width: 358, height: 441, dpi: 300 },
];

const BACKGROUND_COLORS = [
  { name: '白色', value: '#FFFFFF' },
  { name: '蓝色', value: '#438EDB' },
  { name: '红色', value: '#E74C3C' },
  { name: '灰色', value: '#95A5A6' },
];

export default function IdPhoto() {
  const [selectedSpec, setSelectedSpec] = useState<PhotoSpec>(PHOTO_SPECS[0]);
  const [backgroundColor, setBackgroundColor] = useState('#438EDB');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
      setProcessedImage(null);
    };
    reader.readAsDataURL(file);
  };

  const processPhoto = () => {
    if (!uploadedImage) {
      alert('请先上传照片');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // 设置画布尺寸
      canvas.width = selectedSpec.width;
      canvas.height = selectedSpec.height;

      // 绘制背景色
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 计算图片缩放比例
      const scale = Math.max(
        canvas.width / img.width,
        canvas.height / img.height
      );

      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;

      const x = (canvas.width - scaledWidth) / 2;
      const y = (canvas.height - scaledHeight) / 2;

      // 绘制图片
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

      // 导出处理后的图片
      setProcessedImage(canvas.toDataURL('image/jpeg', 0.95));
    };
    img.src = uploadedImage;
  };

  const downloadPhoto = () => {
    if (!processedImage) return;

    const link = document.createElement('a');
    link.download = `${selectedSpec.name}-${Date.now()}.jpg`;
    link.href = processedImage;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📸 证件照工具</h1>
          <p className="text-gray-600">标准尺寸裁剪、背景色更换</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：设置 */}
          <div className="space-y-4">
            {/* 规格选择 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4">选择规格</h2>
              <div className="space-y-2">
                {PHOTO_SPECS.map((spec) => (
                  <button
                    key={spec.name}
                    onClick={() => setSelectedSpec(spec)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedSpec.name === spec.name
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="font-medium">{spec.name}</div>
                    <div className="text-sm opacity-75">
                      {spec.width} × {spec.height} px ({spec.dpi} DPI)
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 背景色选择 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4">背景颜色</h2>
              <div className="grid grid-cols-2 gap-2">
                {BACKGROUND_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setBackgroundColor(color.value)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      backgroundColor === color.value
                        ? 'border-blue-500'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div
                      className="w-full h-12 rounded mb-2"
                      style={{ backgroundColor: color.value }}
                    />
                    <div className="text-sm text-gray-700">{color.name}</div>
                  </button>
                ))}
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  自定义颜色
                </label>
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* 上传按钮 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-600 transition-colors"
              >
                📁 上传照片
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* 中间：预览 */}
          <div className="lg:col-span-2 space-y-4">
            {/* 原图预览 */}
            {uploadedImage && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-semibold mb-4">原始照片</h2>
                <div className="flex justify-center">
                  <img
                    src={uploadedImage}
                    alt="原始照片"
                    className="max-w-full max-h-96 rounded-lg"
                  />
                </div>
                <button
                  onClick={processPhoto}
                  className="w-full mt-4 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                >
                  ✨ 生成证件照
                </button>
              </div>
            )}

            {/* 处理后预览 */}
            {processedImage && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-semibold mb-4">证件照预览</h2>
                <div className="flex justify-center mb-4">
                  <img
                    src={processedImage}
                    alt="证件照"
                    className="rounded-lg shadow-md"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={downloadPhoto}
                    className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                  >
                    💾 下载照片
                  </button>
                  <button
                    onClick={processPhoto}
                    className="px-6 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    🔄 重新生成
                  </button>
                </div>
              </div>
            )}

            {/* 空状态 */}
            {!uploadedImage && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">📸</div>
                <p className="text-gray-500 mb-2">还没有上传照片</p>
                <p className="text-sm text-gray-400">点击左侧按钮上传照片开始制作</p>
              </div>
            )}
          </div>
        </div>

        {/* 隐藏的 Canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* 使用提示 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">💡 使用提示</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 上传正面免冠照片，确保五官清晰可见</li>
            <li>• 选择需要的证件照规格和背景颜色</li>
            <li>• 生成后可下载为高清 JPG 格式</li>
            <li>• 所有处理在浏览器本地完成，不上传服务器</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
