import React, { useState } from 'react';

const SQLFormatter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indentSize, setIndentSize] = useState(2);

  const keywords = [
    'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER',
    'ON', 'AND', 'OR', 'ORDER BY', 'GROUP BY', 'HAVING', 'LIMIT', 'OFFSET',
    'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE',
    'ALTER', 'DROP', 'AS', 'DISTINCT', 'UNION', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END'
  ];

  const formatSQL = () => {
    let sql = input.trim();
    if (!sql) return;

    const indent = ' '.repeat(indentSize);
    let formatted = sql;

    // 转大写关键字
    keywords.forEach(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'gi');
      formatted = formatted.replace(regex, kw);
    });

    // 添加换行
    formatted = formatted
      .replace(/\bSELECT\b/g, '\nSELECT\n' + indent)
      .replace(/\bFROM\b/g, '\nFROM\n' + indent)
      .replace(/\bWHERE\b/g, '\nWHERE\n' + indent)
      .replace(/\bJOIN\b/g, '\nJOIN\n' + indent)
      .replace(/\bLEFT JOIN\b/g, '\nLEFT JOIN\n' + indent)
      .replace(/\bRIGHT JOIN\b/g, '\nRIGHT JOIN\n' + indent)
      .replace(/\bINNER JOIN\b/g, '\nINNER JOIN\n' + indent)
      .replace(/\bON\b/g, '\n' + indent + 'ON ')
      .replace(/\bAND\b/g, '\n' + indent + 'AND ')
      .replace(/\bOR\b/g, '\n' + indent + 'OR ')
      .replace(/\bORDER BY\b/g, '\nORDER BY\n' + indent)
      .replace(/\bGROUP BY\b/g, '\nGROUP BY\n' + indent)
      .replace(/\bHAVING\b/g, '\nHAVING\n' + indent)
      .replace(/\bLIMIT\b/g, '\nLIMIT ')
      .replace(/,/g, ',\n' + indent);

    // 清理多余空行
    formatted = formatted.replace(/\n{3,}/g, '\n\n').trim();

    setOutput(formatted);
  };

  const minifySQL = () => {
    let sql = input.trim();
    if (!sql) return;

    // 移除多余空格和换行
    let minified = sql
      .replace(/\s+/g, ' ')
      .replace(/\(\s+/g, '(')
      .replace(/\s+\)/g, ')')
      .replace(/,\s+/g, ',')
      .trim();

    setOutput(minified);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6">🗄️ SQL 格式化工具</h1>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">输入 SQL</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="粘贴你的 SQL 语句..."
              className="w-full h-96 p-4 border rounded-lg font-mono text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">格式化结果</label>
            <textarea
              value={output}
              readOnly
              className="w-full h-96 p-4 border rounded-lg font-mono text-sm bg-gray-50"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <label className="flex items-center gap-2">
            <span className="text-sm">缩进空格:</span>
            <input
              type="number"
              min="2"
              max="8"
              value={indentSize}
              onChange={(e) => setIndentSize(parseInt(e.target.value) || 2)}
              className="w-16 px-2 py-1 border rounded"
            />
          </label>
          
          <button
            onClick={formatSQL}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            格式化
          </button>
          
          <button
            onClick={minifySQL}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            压缩
          </button>
          
          <button
            onClick={copyToClipboard}
            disabled={!output}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
          >
            复制结果
          </button>
          
          <button
            onClick={() => { setInput(''); setOutput(''); }}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            清空
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">💡 功能说明</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 格式化：美化 SQL，添加缩进和换行</li>
            <li>• 压缩：移除多余空格，生成单行 SQL</li>
            <li>• 支持常见 SQL 关键字自动大写</li>
            <li>• 可自定义缩进空格数</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SQLFormatter;
