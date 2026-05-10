import React, { useState, useEffect } from 'react';
import './ColorSchemeGenerator.css';

type SchemeType = 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'tetradic' | 'split-complementary';

interface Color {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
}

export const ColorSchemeGenerator: React.FC = () => {
  const [baseColor, setBaseColor] = useState<string>('#3498db');
  const [schemeType, setSchemeType] = useState<SchemeType>('analogous');
  const [colors, setColors] = useState<Color[]>([]);

  useEffect(() => {
    generateScheme();
  }, [baseColor, schemeType]);

  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };

  const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  };

  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  };

  const generateScheme = () => {
    const rgb = hexToRgb(baseColor);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const newColors: Color[] = [];

    switch (schemeType) {
      case 'monochromatic':
        for (let i = 0; i < 5; i++) {
          const l = Math.max(10, Math.min(90, hsl.l + (i - 2) * 15));
          const newRgb = hslToRgb(hsl.h, hsl.s, l);
          newColors.push({
            hex: rgbToHex(newRgb.r, newRgb.g, newRgb.b),
            rgb: newRgb,
            hsl: { h: hsl.h, s: hsl.s, l },
          });
        }
        break;

      case 'analogous':
        for (let i = -2; i <= 2; i++) {
          const h = (hsl.h + i * 30 + 360) % 360;
          const newRgb = hslToRgb(h, hsl.s, hsl.l);
          newColors.push({
            hex: rgbToHex(newRgb.r, newRgb.g, newRgb.b),
            rgb: newRgb,
            hsl: { h, s: hsl.s, l: hsl.l },
          });
        }
        break;

      case 'complementary':
        [0, 180].forEach(offset => {
          const h = (hsl.h + offset) % 360;
          const newRgb = hslToRgb(h, hsl.s, hsl.l);
          newColors.push({
            hex: rgbToHex(newRgb.r, newRgb.g, newRgb.b),
            rgb: newRgb,
            hsl: { h, s: hsl.s, l: hsl.l },
          });
        });
        break;

      case 'triadic':
        [0, 120, 240].forEach(offset => {
          const h = (hsl.h + offset) % 360;
          const newRgb = hslToRgb(h, hsl.s, hsl.l);
          newColors.push({
            hex: rgbToHex(newRgb.r, newRgb.g, newRgb.b),
            rgb: newRgb,
            hsl: { h, s: hsl.s, l: hsl.l },
          });
        });
        break;

      case 'tetradic':
        [0, 90, 180, 270].forEach(offset => {
          const h = (hsl.h + offset) % 360;
          const newRgb = hslToRgb(h, hsl.s, hsl.l);
          newColors.push({
            hex: rgbToHex(newRgb.r, newRgb.g, newRgb.b),
            rgb: newRgb,
            hsl: { h, s: hsl.s, l: hsl.l },
          });
        });
        break;

      case 'split-complementary':
        [0, 150, 210].forEach(offset => {
          const h = (hsl.h + offset) % 360;
          const newRgb = hslToRgb(h, hsl.s, hsl.l);
          newColors.push({
            hex: rgbToHex(newRgb.r, newRgb.g, newRgb.b),
            rgb: newRgb,
            hsl: { h, s: hsl.s, l: hsl.l },
          });
        });
        break;
    }

    setColors(newColors);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('已复制到剪贴板');
  };

  const randomColor = () => {
    const randomHex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    setBaseColor(randomHex);
  };

  const exportPalette = () => {
    const css = colors.map((c, i) => `--color-${i + 1}: ${c.hex};`).join('\n');
    copyToClipboard(css);
  };

  return (
    <div className="color-scheme-generator">
      <div className="tool-header">
        <h1>🎨 配色方案生成器</h1>
        <p>自动生成和谐的配色方案</p>
      </div>

      <div className="generator-container">
        <div className="controls">
          <div className="control-group">
            <label>基础颜色</label>
            <div className="color-input-wrapper">
              <input
                type="color"
                value={baseColor}
                onChange={e => setBaseColor(e.target.value)}
              />
              <input
                type="text"
                value={baseColor}
                onChange={e => setBaseColor(e.target.value)}
                placeholder="#3498db"
              />
              <button onClick={randomColor}>🎲 随机</button>
            </div>
          </div>

          <div className="control-group">
            <label>配色方案</label>
            <select value={schemeType} onChange={e => setSchemeType(e.target.value as SchemeType)}>
              <option value="monochromatic">单色（Monochromatic）</option>
              <option value="analogous">类似色（Analogous）</option>
              <option value="complementary">互补色（Complementary）</option>
              <option value="triadic">三角色（Triadic）</option>
              <option value="tetradic">四角色（Tetradic）</option>
              <option value="split-complementary">分裂互补（Split Complementary）</option>
            </select>
          </div>

          <button className="export-btn" onClick={exportPalette}>
            📋 导出 CSS 变量
          </button>
        </div>

        <div className="colors-display">
          {colors.map((color, index) => (
            <div key={index} className="color-card" style={{ background: color.hex }}>
              <div className="color-info">
                <div className="color-value" onClick={() => copyToClipboard(color.hex)}>
                  {color.hex}
                </div>
                <div className="color-formats">
                  <div onClick={() => copyToClipboard(`rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`)}>
                    RGB: {color.rgb.r}, {color.rgb.g}, {color.rgb.b}
                  </div>
                  <div onClick={() => copyToClipboard(`hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`)}>
                    HSL: {color.hsl.h}°, {color.hsl.s}%, {color.hsl.l}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="info-section">
        <h3>💡 配色方案说明</h3>
        <ul>
          <li><strong>单色：</strong>使用同一色相的不同明度</li>
          <li><strong>类似色：</strong>色轮上相邻的颜色</li>
          <li><strong>互补色：</strong>色轮上相对的颜色</li>
          <li><strong>三角色：</strong>色轮上等距的三个颜色</li>
          <li><strong>四角色：</strong>色轮上等距的四个颜色</li>
          <li><strong>分裂互补：</strong>基础色和互补色两侧的颜色</li>
        </ul>
      </div>
    </div>
  );
};

export default ColorSchemeGenerator;
