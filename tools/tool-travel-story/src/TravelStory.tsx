import React, { useState } from 'react';

interface StoryInput {
  destination: string;
  duration: string;
  companions: string;
  highlights: string;
  mood: string;
  style: string;
}

const MOODS = [
  { value: 'romantic', label: '浪漫', emoji: '💕' },
  { value: 'adventurous', label: '冒险', emoji: '🏔️' },
  { value: 'relaxing', label: '休闲', emoji: '🌴' },
  { value: 'cultural', label: '文化', emoji: '🏛️' },
  { value: 'foodie', label: '美食', emoji: '🍜' },
  { value: 'photography', label: '摄影', emoji: '📷' },
];

const STYLES = [
  { value: 'narrative', label: '叙事风格', desc: '详细记录旅行经历' },
  { value: 'poetic', label: '诗意风格', desc: '优美文艺的表达' },
  { value: 'humorous', label: '幽默风格', desc: '轻松有趣的叙述' },
  { value: 'minimalist', label: '极简风格', desc: '简洁精炼的描述' },
];

export default function TravelStory() {
  const [input, setInput] = useState<StoryInput>({
    destination: '',
    duration: '',
    companions: '',
    highlights: '',
    mood: 'romantic',
    style: 'narrative',
  });
  const [story, setStory] = useState('');
  const [generating, setGenerating] = useState(false);

  const generateStory = () => {
    if (!input.destination.trim() || !input.highlights.trim()) {
      alert('请至少填写目的地和旅行亮点');
      return;
    }

    setGenerating(true);

    // 模拟 AI 生成延迟
    setTimeout(() => {
      const generatedStory = createStory(input);
      setStory(generatedStory);
      setGenerating(false);
    }, 2000);
  };

  const createStory = (data: StoryInput): string => {
    const { destination, duration, companions, highlights, mood, style } = data;

    const moodTexts = {
      romantic: '这是一段充满浪漫气息的旅程',
      adventurous: '这是一次充满冒险精神的探索',
      relaxing: '这是一场放松身心的度假',
      cultural: '这是一次深度文化体验之旅',
      foodie: '这是一场舌尖上的美食之旅',
      photography: '这是一次用镜头记录美好的旅程',
    };

    const styleIntros = {
      narrative: `${destination}，一个让人心驰神往的地方。${duration ? `在这${duration}的时光里，` : ''}${companions ? `我和${companions}一起，` : '我独自一人，'}开启了一段难忘的旅程。`,
      poetic: `${destination}的风，轻轻吹过。${duration ? `${duration}的时光，` : ''}如诗如画。${companions ? `与${companions}同行，` : '独自漫步，'}每一刻都值得珍藏。`,
      humorous: `说走就走的旅行？那必须是${destination}啊！${duration ? `花了${duration}，` : ''}${companions ? `拉上${companions}，` : '一个人，'}开始了这场"说好的诗和远方"。`,
      minimalist: `${destination}。${duration ? `${duration}。` : ''}${companions ? `${companions}。` : ''}`,
    };

    const moodDescriptions = {
      romantic: '夕阳西下，我们漫步在街头，每一个转角都是惊喜。温暖的灯光下，时间仿佛静止，只剩下彼此的陪伴。',
      adventurous: '我们攀登高峰，穿越丛林，每一步都充满挑战。汗水与欢笑交织，征服未知的快感让人上瘾。',
      relaxing: '躺在沙滩上，听着海浪的声音，所有的烦恼都随风而去。这里没有时间的概念，只有纯粹的放松。',
      cultural: '走进博物馆，触摸历史的痕迹。与当地人交谈，了解他们的生活方式。每一次体验都让我对这个世界有了新的认识。',
      foodie: '从街边小吃到米其林餐厅，我们品尝了无数美食。每一道菜都是一个故事，每一口都是一次惊喜。',
      photography: '清晨的第一缕阳光，傍晚的金色余晖，我用镜头捕捉每一个瞬间。这些照片不仅是记录，更是情感的延续。',
    };

    const highlightText = highlights.split('\n').filter(h => h.trim()).map(h => `• ${h.trim()}`).join('\n');

    let storyText = '';

    if (style === 'narrative') {
      storyText = `# ${destination}旅行记

${styleIntros[style]}

${moodTexts[mood as keyof typeof moodTexts]}。${moodDescriptions[mood as keyof typeof moodDescriptions]}

## 旅行亮点

${highlightText}

## 难忘瞬间

在${destination}的日子里，有太多值得回味的瞬间。${companions ? `和${companions}在一起的时光，` : '独自旅行的自由，'}让这次旅行变得格外特别。

每一个景点，每一次相遇，都在心中留下了深刻的印记。这不仅仅是一次旅行，更是一次心灵的洗礼。

## 后记

${destination}，我还会再来的。带着这次旅行的美好回忆，继续前行。`;
    } else if (style === 'poetic') {
      storyText = `# ${destination}·诗与远方

${styleIntros[style]}

${moodTexts[mood as keyof typeof moodTexts]}，
在${destination}的天空下，
我找到了久违的宁静。

## 旅途印记

${highlightText}

## 心之所向

风吹过，云飘过，
${companions ? `与${companions}的笑声，` : '独行的脚步，'}
都成了最美的风景。

${destination}，
不只是地图上的一个点，
更是心中永恒的诗篇。`;
    } else if (style === 'humorous') {
      storyText = `# ${destination}爆笑游记

${styleIntros[style]}

${moodTexts[mood as keyof typeof moodTexts]}？说实话，一开始我是拒绝的，但是真香！

## 搞笑瞬间

${highlightText}

## 旅行总结

${companions ? `和${companions}一起旅行的好处就是，` : '一个人旅行的好处就是，'}有人（自己）帮你拍照，有人（自己）帮你背锅，有人（自己）陪你疯。

${destination}，下次见！（钱包：求求你别去了）`;
    } else {
      storyText = `# ${destination}

${styleIntros[style]}

${highlightText}

${moodTexts[mood as keyof typeof moodTexts]}。

完。`;
    }

    return storyText;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(story);
    alert('已复制到剪贴板！');
  };

  const downloadStory = () => {
    const blob = new Blob([story], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${input.destination || '旅行故事'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">✍️ 旅行故事生成</h1>
          <p className="text-gray-600">AI 帮你把旅行经历变成精彩故事</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 输入区域 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">📝 填写旅行信息</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">目的地 *</label>
                <input
                  type="text"
                  value={input.destination}
                  onChange={(e) => setInput({ ...input, destination: e.target.value })}
                  placeholder="例如：巴黎、东京、丽江..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">旅行时长</label>
                <input
                  type="text"
                  value={input.duration}
                  onChange={(e) => setInput({ ...input, duration: e.target.value })}
                  placeholder="例如：3天2夜、一周、一个月..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">同行伙伴</label>
                <input
                  type="text"
                  value={input.companions}
                  onChange={(e) => setInput({ ...input, companions: e.target.value })}
                  placeholder="例如：家人、朋友、爱人..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">旅行亮点 *</label>
                <textarea
                  value={input.highlights}
                  onChange={(e) => setInput({ ...input, highlights: e.target.value })}
                  placeholder="每行一个亮点，例如：&#10;登上埃菲尔铁塔看日落&#10;在塞纳河边散步&#10;品尝正宗法式大餐"
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">旅行氛围</label>
                <div className="grid grid-cols-3 gap-2">
                  {MOODS.map(mood => (
                    <button
                      key={mood.value}
                      onClick={() => setInput({ ...input, mood: mood.value })}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        input.mood === mood.value
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {mood.emoji} {mood.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">写作风格</label>
                <div className="space-y-2">
                  {STYLES.map(style => (
                    <button
                      key={style.value}
                      onClick={() => setInput({ ...input, style: style.value })}
                      className={`w-full px-4 py-3 rounded-lg text-left transition-colors ${
                        input.style === style.value
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="font-medium">{style.label}</div>
                      <div className={`text-sm ${input.style === style.value ? 'text-orange-100' : 'text-gray-500'}`}>
                        {style.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={generateStory}
                disabled={generating}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-amber-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {generating ? '生成中...' : '✨ 生成旅行故事'}
              </button>
            </div>
          </div>

          {/* 输出区域 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">📖 生成的故事</h2>
              {story && (
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                  >
                    📋 复制
                  </button>
                  <button
                    onClick={downloadStory}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                  >
                    💾 下载
                  </button>
                </div>
              )}
            </div>

            {story ? (
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                  {story}
                </pre>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-center py-20">
                <div>
                  <div className="text-6xl mb-4">✍️</div>
                  <p>填写左侧信息，生成你的旅行故事</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 使用提示 */}
        <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="font-semibold text-orange-800 mb-2">💡 使用提示</h3>
          <ul className="text-sm text-orange-700 space-y-1">
            <li>• 填写的信息越详细，生成的故事越精彩</li>
            <li>• 可以选择不同的写作风格，找到最适合你的表达方式</li>
            <li>• 生成后可以复制或下载，方便分享到社交平台</li>
            <li>• 支持 Markdown 格式，可以直接用于博客或公众号</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
