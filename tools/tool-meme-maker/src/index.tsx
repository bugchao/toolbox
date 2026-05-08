import React, { useState, useRef, useEffect } from 'react';

const MemeMaker: React.FC = () => {
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [fontSize, setFontSize] = useState(40);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const templates = [
    { name: '成功小孩', url: 'https://i.imgflip.com/1bhk.jpg' },
    { name: '分心男友', url: 'https://i.imgflip.com/1ur9b0.jpg' },
    { name: '德雷克', url: 'https://i.imgflip.com/30b1gx.jpg' },
    { name: '思考黑人', url: 'https://i.imgflip.com/9ehk.jpg' },
    { name: '古代外星人', url: 'https://i.imgflip.com/26am.jpg' }
  ];

  useEffect(() => {
    if (imageUrl) {
      drawMeme();
    }
  }, [topText, bottomText, imageUrl, fontSize]);

  const drawMeme = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.drawImage(img, 0, 0);
      
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 3;
      ctx.font = `bold ${fontSize}px Impact, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      if (topText) {
        const x = canvas.width / 2;
        const y = 20;
        ctx.strokeText(topText.toUpperCase(), x, y);
        ctx.fillText(topText.toUpperCase(), x, y);
      }

      if (bottomText) {
        const x = canvas.width / 2;
        const y = canvas.height - fontSize - 20;
        ctx.strokeText(bottomText.toUpperCase(), x, y);
        ctx.fillText(bottomText.toUpperCase(), x, y);
      }

      setImageLoaded(true);
    };

    img.src = imageUrl;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadMeme = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'meme.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6">😂 Meme 生成器</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">上方文字</label>
              <input
                type="text"
                value={topText}
                onChange={(e) => setTopText(e.target.value)}
                placeholder="输入上方文字..."
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">下方文字</label>
              <input
                type="text"
                value={bottomText}
                onChange={(e) => setBottomText(e.target.value)}
                placeholder="输入下方文字..."
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">字体大小</label>
              <input
                type="range"
                min="20"
                max="80"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-sm text-gray-500 text-center">{fontSize}px</div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">上传图片</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">或选择模板</label>
              <div className="grid grid-cols-2 gap-2">
                {templates.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setImageUrl(t.url)}
                    className="px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm"
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {imageLoaded && (
              <button
                onClick={downloadMeme}
                className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 font-semibold"
              >
                下载 Meme
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">预览</label>
            <div className="border rounded-lg p-4 bg-gray-50">
              <canvas ref={canvasRef} className="max-w-full h-auto" />
              {!imageUrl && (
                <div className="text-center text-gray-400 py-12">
                  上传图片或选择模板开始制作
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">💡 使用提示</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 上传自己的图片或使用经典模板</li>
            <li>• 文字会自动转为大写（Meme 传统风格）</li>
            <li>• 调整字体大小以适应图片</li>
            <li>• 点击下载保存你的作品</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MemeMaker;
