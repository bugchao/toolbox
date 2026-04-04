import React, { useState, useRef, useEffect } from 'react';

interface Layer {
  id: string;
  name: string;
  image: HTMLImageElement;
  x: number;
  y: number;
  opacity: number;
  visible: boolean;
}

export default function ImageCanvasLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [watermarkText, setWatermarkText] = useState('');
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.5);

  useEffect(() => {
    redrawCanvas();
  }, [layers, canvasSize]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制所有可见图层
    layers
      .filter(layer => layer.visible)
      .forEach(layer => {
        ctx.save();
        ctx.globalAlpha = layer.opacity;
        ctx.drawImage(layer.image, layer.x, layer.y);
        ctx.restore();
      });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const newLayer: Layer = {
          id: Date.now().toString(),
          name: `图层 ${layers.length + 1}`,
          image: img,
          x: 0,
          y: 0,
          opacity: 1,
          visible: true,
        };
        setLayers([...layers, newLayer]);
        setSelectedLayer(newLayer.id);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const addWatermark = () => {
    if (!watermarkText.trim()) {
      alert('请输入水印文字');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.globalAlpha = watermarkOpacity;
    ctx.font = '48px Arial';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(watermarkText, canvas.width / 2, canvas.height / 2);
    ctx.restore();
  };

  const updateLayerProperty = (id: string, property: keyof Layer, value: any) => {
    setLayers(layers.map(layer =>
      layer.id === id ? { ...layer, [property]: value } : layer
    ));
  };

  const deleteLayer = (id: string) => {
    setLayers(layers.filter(layer => layer.id !== id));
    if (selectedLayer === id) {
      setSelectedLayer(null);
    }
  };

  const moveLayer = (id: string, direction: 'up' | 'down') => {
    const index = layers.findIndex(l => l.id === id);
    if (index === -1) return;

    const newLayers = [...layers];
    if (direction === 'up' && index < layers.length - 1) {
      [newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]];
    } else if (direction === 'down' && index > 0) {
      [newLayers[index], newLayers[index - 1]] = [newLayers[index - 1], newLayers[index]];
    }
    setLayers(newLayers);
  };

  const exportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'canvas-export.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const clearCanvas = () => {
    if (confirm('确定要清空画布吗？')) {
      setLayers([]);
      setSelectedLayer(null);
    }
  };

  const selectedLayerData = layers.find(l => l.id === selectedLayer);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🎨 Canvas 图像工作台</h1>
          <p className="text-gray-600">多图层合成、水印添加、像素级处理</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧：工具栏 */}
          <div className="lg:col-span-1 space-y-4">
            {/* 画布设置 */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <h3 className="font-semibold mb-3">画布设置</h3>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-600">宽度</label>
                  <input
                    type="number"
                    value={canvasSize.width}
                    onChange={(e) => setCanvasSize({ ...canvasSize, width: Number(e.target.value) })}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">高度</label>
                  <input
                    type="number"
                    value={canvasSize.height}
                    onChange={(e) => setCanvasSize({ ...canvasSize, height: Number(e.target.value) })}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>
              </div>
            </div>

            {/* 添加图层 */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <h3 className="font-semibold mb-3">添加图层</h3>
              <label className="block w-full bg-indigo-500 text-white text-center py-2 rounded-lg cursor-pointer hover:bg-indigo-600 transition-colors">
                📁 上传图片
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* 水印 */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <h3 className="font-semibold mb-3">添加水印</h3>
              <div className="space-y-2">
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="水印文字"
                  className="w-full px-2 py-1 border rounded text-sm"
                />
                <div>
                  <label className="text-xs text-gray-600">透明度</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={watermarkOpacity}
                    onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <button
                  onClick={addWatermark}
                  className="w-full bg-purple-500 text-white py-1 rounded text-sm hover:bg-purple-600"
                >
                  添加水印
                </button>
              </div>
            </div>

            {/* 操作 */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <h3 className="font-semibold mb-3">操作</h3>
              <div className="space-y-2">
                <button
                  onClick={exportImage}
                  className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
                >
                  💾 导出图片
                </button>
                <button
                  onClick={clearCanvas}
                  className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
                >
                  🗑️ 清空画布
                </button>
              </div>
            </div>
          </div>

          {/* 中间：画布 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="overflow-auto">
                <canvas
                  ref={canvasRef}
                  width={canvasSize.width}
                  height={canvasSize.height}
                  className="border border-gray-300 mx-auto"
                />
              </div>
            </div>
          </div>

          {/* 右侧：图层面板 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-4">
              <h3 className="font-semibold mb-3">图层 ({layers.length})</h3>

              {layers.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-2">🖼️</div>
                  <p className="text-sm">暂无图层</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {[...layers].reverse().map((layer) => (
                    <div
                      key={layer.id}
                      className={`p-2 border rounded cursor-pointer ${
                        selectedLayer === layer.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedLayer(layer.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{layer.name}</span>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveLayer(layer.id, 'up');
                            }}
                            className="text-xs px-1 hover:bg-gray-200 rounded"
                          >
                            ↑
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveLayer(layer.id, 'down');
                            }}
                            className="text-xs px-1 hover:bg-gray-200 rounded"
                          >
                            ↓
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteLayer(layer.id);
                            }}
                            className="text-xs px-1 text-red-500 hover:bg-red-100 rounded"
                          >
                            ×
                          </button>
                        </div>
                      </div>

                      {selectedLayer === layer.id && (
                        <div className="space-y-1 text-xs">
                          <div>
                            <label className="text-gray-600">透明度</label>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              value={layer.opacity}
                              onChange={(e) => updateLayerProperty(layer.id, 'opacity', Number(e.target.value))}
                              className="w-full"
                            />
                          </div>
                          <div className="flex gap-2">
                            <label className="flex items-center gap-1">
                              <input
                                type="checkbox"
                                checked={layer.visible}
                                onChange={(e) => updateLayerProperty(layer.id, 'visible', e.target.checked)}
                              />
                              <span>可见</span>
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 使用提示 */}
        <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h3 className="font-semibold text-indigo-800 mb-2">💡 使用提示</h3>
          <ul className="text-sm text-indigo-700 space-y-1">
            <li>• 支持多图层叠加，可调整图层顺序和透明度</li>
            <li>• 添加文字水印，自定义透明度和位置</li>
            <li>• 所有操作在浏览器本地完成，不上传服务器</li>
            <li>• 完成后可导出为 PNG 格式图片</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
