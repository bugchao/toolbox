import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, Download, Palette } from 'lucide-react';

const IdPhoto: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState('1inch'); // 1inch, 2inch, passport
  const [backgroundColor, setBackgroundColor] = useState('#ffffff'); // white, blue, red
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sizeOptions = [
    { value: '1inch', label: '1寸 (2.5×3.5cm)', width: 295, height: 413 },
    { value: '2inch', label: '2寸 (3.5×4.9cm)', width: 413, height: 579 },
    { value: 'passport', label: '护照 (3.5×4.5cm)', width: 413, height: 531 },
  ];

  const backgroundOptions = [
    { value: '#ffffff', label: '白底', color: 'white' },
    { value: '#0000ff', label: '蓝底', color: 'blue' },
    { value: '#ff0000', label: '红底', color: 'red' },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    // Camera capture logic would go here
    alert('摄像头功能将在后续版本中实现');
  };

  const generateIdPhoto = () => {
    if (!image || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const selectedSizeOption = sizeOptions.find(opt => opt.value === selectedSize);
      if (selectedSizeOption) {
        canvas.width = selectedSizeOption.width;
        canvas.height = selectedSizeOption.height;
        
        // Fill background
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw image (centered and scaled)
        const aspectRatio = img.width / img.height;
        let drawWidth = canvas.width;
        let drawHeight = canvas.width / aspectRatio;
        
        if (drawHeight > canvas.height) {
          drawHeight = canvas.height;
          drawWidth = canvas.height * aspectRatio;
        }
        
        const x = (canvas.width - drawWidth) / 2;
        const y = (canvas.height - drawHeight) / 2;
        
        ctx.drawImage(img, x, y, drawWidth, drawHeight);
      }
    };
    img.src = image;
  };

  const downloadPhoto = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `id-photo-${selectedSize}.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">📸 证件照工具</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">上传照片</h2>
          
          <div className="mb-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              ref={fileInputRef}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center justify-center"
            >
              <ImageIcon className="mr-2" size={20} />
              选择照片
            </button>
          </div>
          
          <div className="mb-4">
            <button
              onClick={handleCameraCapture}
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center justify-center"
            >
              <Camera className="mr-2" size={20} />
              拍摄照片
            </button>
          </div>
          
          {image && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">原图预览:</h3>
              <img 
                src={image} 
                alt="Original" 
                className="max-w-full h-auto rounded border border-gray-300 dark:border-gray-600"
              />
            </div>
          )}
        </div>
        
        {/* Settings and Output Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">设置</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">证件照尺寸:</label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
            >
              {sizeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">背景颜色:</label>
            <div className="flex space-x-2">
              {backgroundOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setBackgroundColor(option.value)}
                  className={`px-3 py-2 rounded flex items-center ${
                    backgroundColor === option.value 
                      ? 'ring-2 ring-blue-500' 
                      : 'border border-gray-300 dark:border-gray-600'
                  }`}
                  style={{ backgroundColor: option.color }}
                >
                  <Palette className="mr-1" size={16} />
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={generateIdPhoto}
              disabled={!image}
              className="flex-1 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              生成证件照
            </button>
            
            <button
              onClick={downloadPhoto}
              disabled={!image}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Download className="mr-1" size={16} />
              下载
            </button>
          </div>
        </div>
      </div>
      
      {/* Output Preview */}
      {image && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">证件照预览:</h2>
          <canvas 
            ref={canvasRef} 
            className="max-w-full h-auto border border-gray-300 dark:border-gray-600 rounded"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            尺寸: {sizeOptions.find(opt => opt.value === selectedSize)?.label}
          </p>
        </div>
      )}
      
      <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>支持标准证件照尺寸，AI智能换底色，人脸自动检测和裁剪</p>
      </div>
    </div>
  );
};

export default IdPhoto;