import React, { useState } from 'react';

type SchemeType = 'monochromatic' | 'complementary' | 'analogous' | 'triadic' | 'tetradic';

const ColorScheme: React.FC = () => {
  const [baseColor, setBaseColor] = useState('#3b82f6');
  const [schemeType, setSchemeType] = useState<SchemeType>('complementary');
  const [colors, setColors] = useState<string[]>([]);

  const hexToHSL = (hex: string): [number, number, number] => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return [h * 360, s * 100, l * 100];
  };

  const HSLToHex = (h: number, s: number, l: number): string => {
    h = h / 360;
    s = s / 100;
    l = l / 100;

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    const toHex = (x: number) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const generateScheme = () => {
    const [h, s, l] = hexToHSL(baseColor);
    let newColors: string[] = [baseColor];

    switch (schemeType) {
      case 'monochromatic':
        newColors = [
          HSLToHex(h, s, Math.max(l - 20, 10)),
          HSLToHex(h, s, Math.max(l - 10, 20)),
          baseColor,
          HSLToHex(h, s, Math.min(l + 10, 80)),
          HSLToHex(h, s, Math.min(l + 20, 90))
        ];
        break;
      case 'complementary':
        newColors = [
          baseColor,
          HSLToHex((h + 180) % 360, s, l),
          HSLToHex(h, s, Math.max(l - 15, 20)),
          HSLToHex((h + 180) % 360, s, Math.max(l - 15, 20))
        ];
        break;
      case 'analogous':
        newColors = [
          HSLToHex((h - 30 + 360) % 360, s, l),
          baseColor,
          HSLToHex((h + 30) % 360, s, l),
          HSLToHex((h + 60) % 360, s, l)
        ];
        break;
      case 'triadic':
        newColors = [
          baseColor,
          HSLToHex((h + 120) % 360, s, l),
          HSLToHex((h + 240) % 360, s, l)
        ];
        break;
      case 'tetradic':
        newColors = [
          baseColor,
          HSLToHex((h + 90) % 360, s, l),
          HSLToHex((h + 180) % 360, s, l),
          HSLToHex((h + 270) % 360, s, l)
        ];
        break;
    }

    setColors(newColors);
  };

  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6">🎨 配色方案生成器</h1>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">基础颜色</label>
            <div className="flex gap-4">
              <input
                type="color"
                value={baseColor}
                onChange={(e) => setBaseColor(e.target.value)}
                className="w-20 h-12 rounded cursor-pointer"
              />
              <input
                type="text"
                value={baseColor}
                onChange={(e) => setBaseColor(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-lg font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">配色方案</label>
            <select
              value={schemeType}
              onChange={(e) => setSchemeType(e.target.value as SchemeType)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="monochromatic">单色 - 同一色相的不同明度</option>
              <option value="complementary">互补 - 色轮对面的颜色</option>
              <option value="analogous">类似 - 色轮相邻的颜色</option>
              <option value="triadic">三角 - 色轮等距的三个颜色</option>
              <option value="tetradic">四角 - 色轮等距的四个颜色</option>
            </select>
          </div>

          <button
            onClick={generateScheme}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 font-semibold"
          >
            生成配色方案
          </button>
        </div>

        {colors.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">配色结果</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {colors.map((color, i) => (
                <div key={i} className="text-center">
                  <div
                    className="w-full h-32 rounded-lg mb-2 cursor-pointer hover:scale-105 transition"
                    style={{ backgroundColor: color }}
                    onClick={() => copyColor(color)}
                  />
                  <div className="font-mono text-sm">{color}</div>
                  <button
                    onClick={() => copyColor(color)}
                    className="text-xs text-blue-500 hover:text-blue-700"
                  >
                    复制
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">💡 使用提示</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 单色：适合简洁统一的设计</li>
            <li>• 互补：对比强烈，适合突出重点</li>
            <li>• 类似：和谐自然，适合渐变效果</li>
            <li>• 三角/四角：丰富多彩，适合多元素设计</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ColorScheme;
