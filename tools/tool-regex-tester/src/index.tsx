import React, { useState, useEffect } from 'react';

const RegexTester: React.FC = () => {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('');
  const [matches, setMatches] = useState<RegExpMatchArray[]>([]);
  const [error, setError] = useState('');

  const commonPatterns = [
    { name: '邮箱', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' },
    { name: '手机号', pattern: '1[3-9]\\d{9}' },
    { name: 'URL', pattern: 'https?://[^\\s]+' },
    { name: 'IP地址', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b' },
    { name: '日期(YYYY-MM-DD)', pattern: '\\d{4}-\\d{2}-\\d{2}' },
    { name: '时间(HH:MM)', pattern: '\\d{2}:\\d{2}' },
    { name: '中文', pattern: '[\\u4e00-\\u9fa5]+' },
    { name: '数字', pattern: '\\d+' }
  ];

  useEffect(() => {
    testRegex();
  }, [pattern, flags, testString]);

  const testRegex = () => {
    if (!pattern || !testString) {
      setMatches([]);
      setError('');
      return;
    }

    try {
      const regex = new RegExp(pattern, flags);
      const results: RegExpMatchArray[] = [];
      
      if (flags.includes('g')) {
        let match;
        while ((match = regex.exec(testString)) !== null) {
          results.push(match);
        }
      } else {
        const match = testString.match(regex);
        if (match) results.push(match);
      }
      
      setMatches(results);
      setError('');
    } catch (e) {
      setError((e as Error).message);
      setMatches([]);
    }
  };

  const highlightMatches = () => {
    if (!pattern || !testString || matches.length === 0) {
      return testString;
    }

    let result = testString;
    const highlights: Array<{ start: number; end: number; text: string }> = [];
    
    matches.forEach(match => {
      if (match.index !== undefined) {
        highlights.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[0]
        });
      }
    });

    highlights.sort((a, b) => b.start - a.start);
    
    highlights.forEach(h => {
      result = result.slice(0, h.start) + 
        `<mark class="bg-yellow-300">${h.text}</mark>` + 
        result.slice(h.end);
    });

    return result;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6">🔍 正则表达式测试器</h1>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">正则表达式</label>
            <div className="flex gap-2">
              <span className="text-2xl">/</span>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="输入正则表达式..."
                className="flex-1 px-4 py-2 border rounded-lg font-mono"
              />
              <span className="text-2xl">/</span>
              <input
                type="text"
                value={flags}
                onChange={(e) => setFlags(e.target.value)}
                placeholder="flags"
                className="w-20 px-4 py-2 border rounded-lg font-mono"
              />
            </div>
            {error && <div className="mt-2 text-red-500 text-sm">{error}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">测试字符串</label>
            <textarea
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder="输入要测试的文本..."
              className="w-full h-32 p-4 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">匹配结果 ({matches.length} 个)</label>
            <div 
              className="w-full min-h-32 p-4 border rounded-lg bg-gray-50"
              dangerouslySetInnerHTML={{ __html: highlightMatches() }}
            />
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">常用正则表达式</h3>
          <div className="grid grid-cols-2 gap-2">
            {commonPatterns.map((p, i) => (
              <button
                key={i}
                onClick={() => setPattern(p.pattern)}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-left text-sm"
              >
                <div className="font-semibold">{p.name}</div>
                <div className="text-xs text-gray-600 font-mono">{p.pattern}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">💡 标志说明</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• g - 全局匹配</li>
            <li>• i - 忽略大小写</li>
            <li>• m - 多行模式</li>
            <li>• s - 单行模式（. 匹配换行符）</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RegexTester;
