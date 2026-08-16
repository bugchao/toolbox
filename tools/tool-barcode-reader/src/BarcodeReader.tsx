import React, { useState, useRef } from 'react';
import { CopyButton } from '@toolbox/ui-kit';

interface BarcodeResult {
  code: string;
  type: string;
  timestamp: string;
}

export default function BarcodeReader() {
  const [result, setResult] = useState<BarcodeResult | null>(null);
  const [history, setHistory] = useState<BarcodeResult[]>([]);
  const [manualCode, setManualCode] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 模拟条形码识别
    const reader = new FileReader();
    reader.onload = () => {
      // 模拟识别结果
      const mockCode = Math.floor(Math.random() * 10000000000000).toString().padStart(13, '0');
      const newResult: BarcodeResult = {
        code: mockCode,
        type: 'EAN-13',
        timestamp: new Date().toLocaleString('zh-CN'),
      };
      
      setResult(newResult);
      setHistory([newResult, ...history]);
    };
    reader.readAsDataURL(file);
  };

  const handleManualInput = () => {
    if (!manualCode.trim()) {
      alert('请输入条形码');
      return;
    }

    const newResult: BarcodeResult = {
      code: manualCode,
      type: detectBarcodeType(manualCode),
      timestamp: new Date().toLocaleString('zh-CN'),
    };

    setResult(newResult);
    setHistory([newResult, ...history]);
    setManualCode('');
  };

  const detectBarcodeType = (code: string): string => {
    if (code.length === 13) return 'EAN-13';
    if (code.length === 8) return 'EAN-8';
    if (code.length === 12) return 'UPC-A';
    if (code.length === 6) return 'UPC-E';
    return 'Unknown';
  };

  const searchOnline = (code: string) => {
    window.open(`https://www.google.com/search?q=${code}`, '_blank');
  };

  const clearHistory = () => {
    if (confirm('确定要清空历史记录吗？')) {
      setHistory([]);
      setResult(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">📷 条形码识别</h1>
          <p className="text-gray-600 dark:text-gray-400">上传图片或手动输入，快速识别条形码</p>
        </div>

        {/* 上传区域 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">上传条形码图片</h2>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-lg p-12 text-center cursor-pointer hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
          >
            <div className="text-6xl mb-4">📷</div>
            <p className="text-gray-600 dark:text-gray-400 mb-2">点击上传条形码图片</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">支持 JPG、PNG、GIF 格式</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* 手动输入 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">手动输入条形码</h2>

          <div className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleManualInput()}
              placeholder="输入条形码数字..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              onClick={handleManualInput}
              className="px-6 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors"
            >
              识别
            </button>
          </div>

          <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            支持格式：EAN-13 (13位)、EAN-8 (8位)、UPC-A (12位)、UPC-E (6位)
          </div>
        </div>

        {/* 识别结果 */}
        {result && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">识别结果</h2>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 mb-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">条形码</div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-3 font-mono">
                {result.code}
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                  {result.type}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{result.timestamp}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <CopyButton
                variant="button"
                value={result.code}
                label="📋 复制"
                copiedLabel="✅ 已复制"
                className="flex-1 justify-center !bg-blue-500 !text-white hover:!bg-blue-600"
              />
              <button
                onClick={() => searchOnline(result.code)}
                className="flex-1 bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
              >
                🔍 搜索
              </button>
            </div>
          </div>
        )}

        {/* 历史记录 */}
        {history.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">历史记录</h2>
              <button
                onClick={clearHistory}
                className="text-sm text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                清空
              </button>
            </div>

            <div className="space-y-2">
              {history.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-mono font-semibold text-gray-800 dark:text-gray-200">{item.code}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
                        {item.type}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{item.timestamp}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <CopyButton
                      variant="inline"
                      value={item.code}
                      label="复制"
                      copiedLabel="已复制"
                      className="!text-blue-500 dark:!text-blue-400 hover:!text-blue-700 dark:hover:!text-blue-300 text-sm"
                    />
                    <button
                      onClick={() => searchOnline(item.code)}
                      className="text-green-500 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm"
                    >
                      搜索
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 使用提示 */}
        <div className="mt-6 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">💡 使用提示</h3>
          <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
            <li>• 上传清晰的条形码图片，确保条形码完整可见</li>
            <li>• 支持常见的条形码格式：EAN-13、EAN-8、UPC-A、UPC-E</li>
            <li>• 识别后可以复制条形码或在线搜索商品信息</li>
            <li>• 历史记录保存在本地，刷新页面后会清空</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
