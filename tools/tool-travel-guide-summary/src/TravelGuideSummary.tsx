import React, { useState } from 'react';

interface GuideSummary {
  destination: string;
  overview: string;
  bestTime: string;
  duration: string;
  budget: string;
  highlights: string[];
  transportation: string[];
  accommodation: string[];
  food: string[];
  tips: string[];
}

export default function TravelGuideSummary() {
  const [inputText, setInputText] = useState('');
  const [url, setUrl] = useState('');
  const [summary, setSummary] = useState<GuideSummary | null>(null);
  const [generating, setGenerating] = useState(false);
  const [inputMode, setInputMode] = useState<'text' | 'url'>('text');

  const generateSummary = () => {
    if (inputMode === 'text' && !inputText.trim()) {
      alert('请输入攻略内容');
      return;
    }
    if (inputMode === 'url' && !url.trim()) {
      alert('请输入攻略链接');
      return;
    }

    setGenerating(true);

    // 模拟 AI 生成延迟
    setTimeout(() => {
      const mockSummary: GuideSummary = {
        destination: '日本东京',
        overview: '东京是日本的首都，融合了传统与现代的魅力。从古老的寺庙到繁华的购物区，从米其林餐厅到街边小吃，东京为游客提供了丰富多彩的体验。',
        bestTime: '春季（3-5月）和秋季（9-11月）',
        duration: '5-7天',
        budget: '¥8,000-15,000/人',
        highlights: [
          '浅草寺 - 东京最古老的寺庙',
          '东京塔 - 俯瞰城市全景',
          '涩谷十字路口 - 世界最繁忙的路口',
          '筑地市场 - 品尝新鲜海鲜',
          '秋叶原 - 动漫和电子产品天堂',
          '新宿御苑 - 赏樱胜地',
        ],
        transportation: [
          '地铁：购买西瓜卡（Suica）或 Pasmo 卡，方便快捷',
          'JR 山手线：环绕东京主要景点',
          '出租车：起步价较高，适合短途或多人出行',
          '自行车：部分区域提供共享单车',
        ],
        accommodation: [
          '新宿/涩谷：交通便利，购物方便，价格中等',
          '浅草：传统氛围浓厚，价格相对便宜',
          '银座：高端酒店聚集，价格较高',
          '上野：靠近机场，适合转机或短途停留',
        ],
        food: [
          '寿司：筑地市场或回转寿司店',
          '拉面：一兰拉面、一风堂',
          '天妇罗：银座天一',
          '烤肉：和牛烧肉店',
          '居酒屋：体验日本夜生活',
        ],
        tips: [
          '提前购买 JR Pass，节省交通费用',
          '学习基本日语礼貌用语',
          '随身携带现金，部分小店不接受信用卡',
          '遵守垃圾分类规则',
          '地铁高峰期避免携带大件行李',
          '提前预订热门餐厅',
        ],
      };

      setSummary(mockSummary);
      setGenerating(false);
    }, 2000);
  };

  const exportSummary = () => {
    if (!summary) return;

    const content = `# ${summary.destination} 旅行攻略总结

## 概览
${summary.overview}

## 基本信息
- **最佳旅行时间**：${summary.bestTime}
- **建议游玩时长**：${summary.duration}
- **预算参考**：${summary.budget}

## 必游景点
${summary.highlights.map(h => `- ${h}`).join('\n')}

## 交通指南
${summary.transportation.map(t => `- ${t}`).join('\n')}

## 住宿推荐
${summary.accommodation.map(a => `- ${a}`).join('\n')}

## 美食推荐
${summary.food.map(f => `- ${f}`).join('\n')}

## 实用建议
${summary.tips.map(t => `- ${t}`).join('\n')}
`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${summary.destination}-攻略总结.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    if (!summary) return;

    const content = `${summary.destination} 旅行攻略总结

概览：${summary.overview}

最佳时间：${summary.bestTime}
建议时长：${summary.duration}
预算：${summary.budget}

必游景点：
${summary.highlights.map(h => `• ${h}`).join('\n')}

交通：
${summary.transportation.map(t => `• ${t}`).join('\n')}

住宿：
${summary.accommodation.map(a => `• ${a}`).join('\n')}

美食：
${summary.food.map(f => `• ${f}`).join('\n')}

建议：
${summary.tips.map(t => `• ${t}`).join('\n')}`;

    navigator.clipboard.writeText(content);
    alert('已复制到剪贴板！');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📋 旅行攻略总结器</h1>
          <p className="text-gray-600">AI 提取攻略要点，生成结构化总结</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 输入区域 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">📝 输入攻略内容</h2>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setInputMode('text')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  inputMode === 'text'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                文本输入
              </button>
              <button
                onClick={() => setInputMode('url')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  inputMode === 'url'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                链接输入
              </button>
            </div>

            {inputMode === 'text' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  粘贴攻略内容
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="粘贴旅行攻略文本，可以是游记、攻略文章、笔记等..."
                  rows={15}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  输入攻略链接
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/travel-guide"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-2">
                  支持马蜂窝、穷游、小红书等旅游网站链接
                </p>
              </div>
            )}

            <button
              onClick={generateSummary}
              disabled={generating}
              className="w-full mt-4 bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-teal-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {generating ? '生成中...' : '✨ 生成攻略总结'}
            </button>

            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
              <h3 className="font-semibold text-green-800 text-sm mb-2">💡 支持的内容</h3>
              <ul className="text-xs text-green-700 space-y-1">
                <li>• 旅游攻略文章</li>
                <li>• 游记博客</li>
                <li>• 旅行笔记</li>
                <li>• 景点介绍</li>
              </ul>
            </div>
          </div>

          {/* 输出区域 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">📖 攻略总结</h2>
              {summary && (
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                  >
                    📋 复制
                  </button>
                  <button
                    onClick={exportSummary}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                  >
                    💾 导出
                  </button>
                </div>
              )}
            </div>

            {summary ? (
              <div className="space-y-6 max-h-[600px] overflow-y-auto">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{summary.destination}</h3>
                  <p className="text-gray-600">{summary.overview}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">最佳时间</div>
                    <div className="font-semibold text-gray-800">{summary.bestTime}</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">建议时长</div>
                    <div className="font-semibold text-gray-800">{summary.duration}</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg col-span-2">
                    <div className="text-sm text-gray-600 mb-1">预算参考</div>
                    <div className="font-semibold text-gray-800">{summary.budget}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">🎯 必游景点</h4>
                  <ul className="space-y-2">
                    {summary.highlights.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">🚇 交通指南</h4>
                  <ul className="space-y-2">
                    {summary.transportation.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">🏨 住宿推荐</h4>
                  <ul className="space-y-2">
                    {summary.accommodation.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">🍜 美食推荐</h4>
                  <ul className="space-y-2">
                    {summary.food.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">💡 实用建议</h4>
                  <ul className="space-y-2">
                    {summary.tips.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-center py-20">
                <div>
                  <div className="text-6xl mb-4">📋</div>
                  <p>输入攻略内容，生成结构化总结</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 使用提示 */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">💡 使用提示</h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• AI 自动提取攻略中的关键信息，生成结构化总结</li>
            <li>• 支持文本粘贴和链接抓取两种方式</li>
            <li>• 总结包含景点、交通、住宿、美食、建议等维度</li>
            <li>• 可导出为 Markdown 格式，方便保存和分享</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
