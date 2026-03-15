import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Check, Palette, Shuffle, Download, Plus, X, ChevronDown, Sun, Moon, Droplet } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface Color {
  id: string;
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  locked: boolean;
}

interface SavedPalette {
  id: string;
  name: string;
  colors: Color[];
  createdAt: number;
}

const ColorPicker: React.FC = () => {
  const { t } = useTranslation('colorPicker');
  const [currentColor, setCurrentColor] = useState<Color>({
    id: 'current',
    hex: '#6366f1',
    rgb: { r: 99, g: 102, b: 241 },
    hsl: { h: 239, s: 84, l: 67 },
    locked: false,
  });
  const [palette, setPalette] = useState<Color[]>([]);
  const [savedPalettes, setSavedPalettes] = useState<SavedPalette[]>([]);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();
  const darkMode = theme === 'dark';
  const [showSavedPalettes, setShowSavedPalettes] = useState(false);
  const colorInputRef = useRef<HTMLInputElement>(null);

  // 预设调色板
  const presetPalettes = [
    { nameKey: 'presetMaterial', colors: ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39'] },
    { nameKey: 'presetTailwind', colors: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'] },
    { nameKey: 'presetMorandi', colors: ['#e8b4b8', '#eed6d9', '#a7c5eb', '#bcd2e8', '#e2e9d8', '#f0d7c0', '#d4c4c9', '#b5c9c3'] }
  ];

  // 颜色格式转换
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
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h *= 60;
    }

    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
    s /= 100;
    l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) =>
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return {
      r: Math.round(f(0) * 255),
      g: Math.round(f(8) * 255),
      b: Math.round(f(4) * 255),
    };
  };

  const updateColorFromHex = (hex: string) => {
    if (!/^#?([a-f\d]{6}|[a-f\d]{3})$/i.test(hex)) return;
    
    if (hex.length === 4) {
      hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    setCurrentColor(prev => ({
      ...prev,
      hex: hex.toLowerCase(),
      rgb,
      hsl,
    }));
  };

  const updateColorFromRgb = (r: number, g: number, b: number) => {
    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);
    setCurrentColor(prev => ({
      ...prev,
      hex,
      rgb: { r, g, b },
      hsl,
    }));
  };

  const updateColorFromHsl = (h: number, s: number, l: number) => {
    const rgb = hslToRgb(h, s, l);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    setCurrentColor(prev => ({
      ...prev,
      hex,
      rgb,
      hsl: { h, s, l },
    }));
  };

  // 生成和谐配色
  const generateHarmonicPalette = (baseColor: Color): Color[] => {
    const { h, s, l } = baseColor.hsl;
    const colors: Color[] = [baseColor];

    // 类似色
    for (let i = 1; i <= 2; i++) {
      const newHsl = { h: (h + i * 30) % 360, s, l };
      const rgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
      colors.push({
        id: Math.random().toString(36).substring(2, 9),
        hex,
        rgb,
        hsl: newHsl,
        locked: false,
      });
    }

    // 补色
    const complementHsl = { h: (h + 180) % 360, s, l: Math.max(20, Math.min(80, l + 10)) };
    const complementRgb = hslToRgb(complementHsl.h, complementHsl.s, complementHsl.l);
    const complementHex = rgbToHex(complementRgb.r, complementRgb.g, complementRgb.b);
    colors.push({
      id: Math.random().toString(36).substring(2, 9),
      hex: complementHex,
      rgb: complementRgb,
      hsl: complementHsl,
      locked: false,
    });

    // 三角色
    for (let i = 1; i <= 2; i++) {
      const newHsl = { h: (h + i * 120) % 360, s, l };
      const rgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
      colors.push({
        id: Math.random().toString(36).substring(2, 9),
        hex,
        rgb,
        hsl: newHsl,
        locked: false,
      });
    }

    return colors.slice(0, 5);
  };

  const generateRandomPalette = () => {
    const newPalette: Color[] = [];
    for (let i = 0; i < 5; i++) {
      const h = Math.floor(Math.random() * 360);
      const s = 60 + Math.floor(Math.random() * 30);
      const l = 40 + Math.floor(Math.random() * 30);
      const rgb = hslToRgb(h, s, l);
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
      newPalette.push({
        id: Math.random().toString(36).substring(2, 9),
        hex,
        rgb,
        hsl: { h, s, l },
        locked: false,
      });
    }
    setPalette(newPalette);
  };

  const addToPalette = (color: Color) => {
    if (palette.length >= 10) return;
    setPalette(prev => [...prev, { ...color, id: Math.random().toString(36).substring(2, 9) }]);
  };

  const removeFromPalette = (id: string) => {
    setPalette(prev => prev.filter(c => c.id !== id));
  };

  const toggleLockColor = (id: string) => {
    setPalette(prev => prev.map(c => 
      c.id === id ? { ...c, locked: !c.locked } : c
    ));
  };

  const copyToClipboard = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const saveCurrentPalette = () => {
    if (palette.length === 0) return;
    const newSavedPalette: SavedPalette = {
      id: Math.random().toString(36).substring(2, 9),
      name: t('paletteName', { n: savedPalettes.length + 1 }),
      colors: [...palette],
      createdAt: Date.now(),
    };
    setSavedPalettes(prev => [newSavedPalette, ...prev]);
  };

  const loadPalette = (savedPalette: SavedPalette) => {
    setPalette(savedPalette.colors);
    setShowSavedPalettes(false);
  };

  const deleteSavedPalette = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedPalettes(prev => prev.filter(p => p.id !== id));
  };

  const exportPalette = (format: 'css' | 'json' | 'tailwind' | 'scss') => {
    if (palette.length === 0) return;

    let content = '';
    let filename = 'palette';

    switch (format) {
      case 'css':
        content = ':root {\n';
        palette.forEach((color, index) => {
          content += `  --color-${index + 1}: ${color.hex};\n`;
          content += `  --color-${index + 1}-rgb: ${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b};\n`;
        });
        content += '}';
        filename += '.css';
        break;
      case 'json':
        content = JSON.stringify({
          name: 'Custom Palette',
          colors: palette.map(c => ({ hex: c.hex, rgb: c.rgb, hsl: c.hsl }))
        }, null, 2);
        filename += '.json';
        break;
      case 'tailwind':
        content = '/** @type {import(\'tailwindcss\').Config} */\n';
        content += 'module.exports = {\n';
        content += '  theme: {\n';
        content += '    extend: {\n';
        content += '      colors: {\n';
        content += '        palette: {\n';
        palette.forEach((color, index) => {
          content += `          ${index + 1}: '${color.hex}',\n`;
        });
        content += '        },\n';
        content += '      },\n';
        content += '    },\n';
        content += '  },\n';
        content += '}';
        filename += '.tailwind.js';
        break;
      case 'scss':
        palette.forEach((color, index) => {
          content += `$color-${index + 1}: ${color.hex};\n`;
          content += `$color-${index + 1}-rgb: ${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b};\n`;
        });
        filename += '.scss';
        break;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 取色器功能
  const handleEyeDropper = async () => {
    if (!(window as any).EyeDropper) {
      alert(t('eyedropperUnsupported'));
      return;
    }

    try {
      const eyeDropper = new (window as any).EyeDropper();
      const result = await eyeDropper.open();
      updateColorFromHex(result.sRGBHex);
    } catch (e) {
      // 用户取消取色
    }
  };

  const getContrastColor = (hex: string): string => {
    const rgb = hexToRgb(hex);
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  // 初始化生成默认调色板
  useEffect(() => {
    setPalette(generateHarmonicPalette(currentColor));
  }, []);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Palette className="h-8 w-8 text-indigo-600" />
              {t('title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {t('subtitle')}
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 颜色拾取器 */}
          <div className={`lg:col-span-1 rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-xl font-semibold mb-6">{t('pickerTitle')}</h2>

            {/* 颜色预览 */}
            <div 
              className="w-full h-40 rounded-lg mb-6 cursor-pointer transition-all hover:scale-[1.02]"
              style={{ backgroundColor: currentColor.hex }}
              onClick={() => colorInputRef.current?.click()}
            >
              <input
                ref={colorInputRef}
                type="color"
                value={currentColor.hex}
                onChange={(e) => updateColorFromHex(e.target.value)}
                className="hidden"
              />
            </div>

            {/* 取色器按钮 */}
            <button
              onClick={handleEyeDropper}
              className={`w-full mb-4 py-2 px-4 rounded-md flex items-center justify-center gap-2 ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              } transition-colors`}
            >
              <Droplet className="h-4 w-4" />
              {t('screenPick')}
            </button>

            {/* 颜色值输入 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">HEX</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentColor.hex}
                    onChange={(e) => updateColorFromHex(e.target.value)}
                    className={`flex-1 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                    } border`}
                  />
                  <button
                    onClick={() => copyToClipboard(currentColor.hex, 'hex')}
                    className={`px-3 py-2 rounded-md ${
                      darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                    } transition-colors`}
                  >
                    {copiedFormat === 'hex' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    {t('copy')}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">RGB</label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <input
                      type="number"
                      value={currentColor.rgb.r}
                      onChange={(e) => updateColorFromRgb(parseInt(e.target.value) || 0, currentColor.rgb.g, currentColor.rgb.b)}
                      min="0"
                      max="255"
                      className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      } border`}
                    />
                    <div className="text-xs text-center mt-1 text-gray-500">R</div>
                  </div>
                  <div>
                    <input
                      type="number"
                      value={currentColor.rgb.g}
                      onChange={(e) => updateColorFromRgb(currentColor.rgb.r, parseInt(e.target.value) || 0, currentColor.rgb.b)}
                      min="0"
                      max="255"
                      className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      } border`}
                    />
                    <div className="text-xs text-center mt-1 text-gray-500">G</div>
                  </div>
                  <div>
                    <input
                      type="number"
                      value={currentColor.rgb.b}
                      onChange={(e) => updateColorFromRgb(currentColor.rgb.r, currentColor.rgb.g, parseInt(e.target.value) || 0)}
                      min="0"
                      max="255"
                      className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      } border`}
                    />
                    <div className="text-xs text-center mt-1 text-gray-500">B</div>
                  </div>
                </div>
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => copyToClipboard(`rgb(${currentColor.rgb.r}, ${currentColor.rgb.g}, ${currentColor.rgb.b})`, 'rgb')}
                    className={`text-xs px-2 py-1 rounded ${
                      darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                    } transition-colors flex items-center gap-1`}
                  >
                    {copiedFormat === 'rgb' ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                    {t('copy')}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">HSL</label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <input
                      type="number"
                      value={currentColor.hsl.h}
                      onChange={(e) => updateColorFromHsl(parseInt(e.target.value) || 0, currentColor.hsl.s, currentColor.hsl.l)}
                      min="0"
                      max="360"
                      className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      } border`}
                    />
                    <div className="text-xs text-center mt-1 text-gray-500">H</div>
                  </div>
                  <div>
                    <input
                      type="number"
                      value={currentColor.hsl.s}
                      onChange={(e) => updateColorFromHsl(currentColor.hsl.h, parseInt(e.target.value) || 0, currentColor.hsl.l)}
                      min="0"
                      max="100"
                      className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      } border`}
                    />
                    <div className="text-xs text-center mt-1 text-gray-500">S%</div>
                  </div>
                  <div>
                    <input
                      type="number"
                      value={currentColor.hsl.l}
                      onChange={(e) => updateColorFromHsl(currentColor.hsl.h, currentColor.hsl.s, parseInt(e.target.value) || 0)}
                      min="0"
                      max="100"
                      className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      } border`}
                    />
                    <div className="text-xs text-center mt-1 text-gray-500">L%</div>
                  </div>
                </div>
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => copyToClipboard(`hsl(${currentColor.hsl.h}, ${currentColor.hsl.s}%, ${currentColor.hsl.l}%)`, 'hsl')}
                    className={`text-xs px-2 py-1 rounded ${
                      darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                    } transition-colors flex items-center gap-1`}
                  >
                    {copiedFormat === 'hsl' ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                    {t('copy')}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => addToPalette(currentColor)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {t('addToPalette')}
              </button>
            </div>
          </div>

          {/* 调色板 */}
          <div className={`lg:col-span-2 rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">{t('palette')}</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <button
                    onClick={() => setShowSavedPalettes(!showSavedPalettes)}
                    className={`py-2 px-4 rounded-md flex items-center gap-2 ${
                      darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                    } transition-colors`}
                  >
                    {t('savedPalettes')}
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  
                  {showSavedPalettes && savedPalettes.length > 0 && (
                    <div className={`absolute right-0 mt-2 w-64 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto ${
                      darkMode ? 'bg-gray-700' : 'bg-white'
                    }`}>
                      {savedPalettes.map(p => (
                        <div
                          key={p.id}
                          onClick={() => loadPalette(p)}
                          className={`px-4 py-2 cursor-pointer flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-600`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {p.colors.slice(0, 4).map((c, i) => (
                                <div
                                  key={i}
                                  className="w-4 h-4"
                                  style={{ backgroundColor: c.hex }}
                                />
                              ))}
                            </div>
                            <span className="text-sm">{p.name}</span>
                          </div>
                          <button
                            onClick={(e) => deleteSavedPalette(p.id, e)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={generateRandomPalette}
                  className={`py-2 px-4 rounded-md flex items-center gap-2 ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                  } transition-colors`}
                >
                  <Shuffle className="h-4 w-4" />
                  {t('randomGenerate')}
                </button>

                <button
                  onClick={saveCurrentPalette}
                  className={`py-2 px-4 rounded-md flex items-center gap-2 ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                  } transition-colors`}
                  disabled={palette.length === 0}
                >
                  {t('save')}
                </button>

                <div className="relative group">
                  <button
                    className={`py-2 px-4 rounded-md flex items-center gap-2 ${
                      darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                    } transition-colors`}
                    disabled={palette.length === 0}
                  >
                    <Download className="h-4 w-4" />
                    {t('export')}
                  </button>
                  <div className={`absolute right-0 hidden group-hover:block mt-2 w-48 rounded-md shadow-lg z-10 ${
                    darkMode ? 'bg-gray-700' : 'bg-white'
                  }`}>
                    <button
                      onClick={() => exportPalette('css')}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      {t('exportCss')}
                    </button>
                    <button
                      onClick={() => exportPalette('scss')}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      {t('exportScss')}
                    </button>
                    <button
                      onClick={() => exportPalette('tailwind')}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      {t('exportTailwind')}
                    </button>
                    <button
                      onClick={() => exportPalette('json')}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      {t('exportJson')}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 调色板颜色展示 */}
            {palette.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                {palette.map((color) => (
                  <div key={color.id} className="group relative">
                    <div
                      className="h-32 rounded-lg cursor-pointer transition-all hover:scale-[1.02] overflow-hidden"
                      style={{ backgroundColor: color.hex }}
                      onClick={() => copyToClipboard(color.hex, 'palette')}
                    >
                      <div 
                        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                        style={{ color: getContrastColor(color.hex) }}
                      >
                        {copiedFormat === 'palette' ? (
                          <Check className="h-6 w-6" />
                        ) : (
                          <Copy className="h-6 w-6" />
                        )}
                      </div>
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between items-center">
                        <div className="font-mono text-sm">{color.hex}</div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => toggleLockColor(color.id)}
                            className={`p-1 rounded ${
                              color.locked ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600 dark:text-gray-200 dark:hover:text-gray-200'
                            }`}
                            title={color.locked ? t('unlock') : t('lock')}
                          >
                            {color.locked ? '🔒' : '🔓'}
                          </button>
                          <button
                            onClick={() => removeFromPalette(color.id)}
                            className="p-1 rounded text-gray-400 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-300">
                        RGB({color.rgb.r}, {color.rgb.g}, {color.rgb.b})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 text-center mb-6">
                <Palette className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-300">{t('paletteEmpty')}</p>
              </div>
            )}

            {/* 预设调色板 */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium mb-4">{t('presetPalettes')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {presetPalettes.map((palette, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg cursor-pointer transition-all hover:scale-[1.02] ${
                      darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      const newPalette: Color[] = palette.colors.map(hex => {
                        const rgb = hexToRgb(hex);
                        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                        return {
                          id: Math.random().toString(36).substring(2, 9),
                          hex,
                          rgb,
                          hsl,
                          locked: false,
                        };
                      });
                      setPalette(newPalette);
                    }}
                  >
                    <div className="font-medium mb-2">{t(palette.nameKey)}</div>
                    <div className="flex h-8 rounded overflow-hidden">
                      {palette.colors.map((color, i) => (
                        <div
                          key={i}
                          className="flex-1 h-full"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 使用提示 */}
            <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <h3 className="text-sm font-medium mb-2">💡 {t('tipsTitle')}</h3>
              <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-200">
                <li>• {t('tip1')}</li>
                <li>• {t('tip2')}</li>
                <li>• {t('tip3')}</li>
                <li>• {t('tip4')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;
