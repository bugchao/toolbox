import React, { useState } from 'react';
import { format } from 'sql-formatter';
import './SqlFormatter.css';

type SqlLanguage = 'sql' | 'mysql' | 'postgresql' | 'mariadb' | 'sqlite' | 'tsql' | 'plsql';

export const SqlFormatter: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [language, setLanguage] = useState<SqlLanguage>('sql');
  const [indentSize, setIndentSize] = useState<number>(2);
  const [uppercase, setUppercase] = useState<boolean>(true);

  const formatSql = () => {
    if (!input.trim()) {
      alert('请输入 SQL 代码');
      return;
    }

    try {
      const formatted = format(input, {
        language,
        tabWidth: indentSize,
        keywordCase: uppercase ? 'upper' : 'lower',
        linesBetweenQueries: 2,
      });
      setOutput(formatted);
    } catch (error) {
      alert('格式化失败：' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    alert('已复制到剪贴板');
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
  };

  const loadExample = () => {
    const example = `SELECT u.id, u.name, u.email, COUNT(o.id) as order_count, SUM(o.total) as total_amount FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.status = 'active' AND o.created_at >= '2024-01-01' GROUP BY u.id, u.name, u.email HAVING COUNT(o.id) > 5 ORDER BY total_amount DESC LIMIT 10;`;
    setInput(example);
  };

  return (
    <div className="sql-formatter">
      <div className="tool-header">
        <h1>🔧 SQL 格式化工具</h1>
        <p>格式化和美化 SQL 代码</p>
      </div>

      <div className="options-section">
        <div className="option-group">
          <label>SQL 方言</label>
          <select value={language} onChange={e => setLanguage(e.target.value as SqlLanguage)}>
            <option value="sql">标准 SQL</option>
            <option value="mysql">MySQL</option>
            <option value="postgresql">PostgreSQL</option>
            <option value="mariadb">MariaDB</option>
            <option value="sqlite">SQLite</option>
            <option value="tsql">T-SQL (SQL Server)</option>
            <option value="plsql">PL/SQL (Oracle)</option>
          </select>
        </div>

        <div className="option-group">
          <label>缩进大小</label>
          <select value={indentSize} onChange={e => setIndentSize(Number(e.target.value))}>
            <option value="2">2 空格</option>
            <option value="4">4 空格</option>
            <option value="8">8 空格</option>
          </select>
        </div>

        <div className="option-group">
          <label>
            <input
              type="checkbox"
              checked={uppercase}
              onChange={e => setUppercase(e.target.checked)}
            />
            关键字大写
          </label>
        </div>

        <button className="example-btn" onClick={loadExample}>
          加载示例
        </button>
      </div>

      <div className="editor-section">
        <div className="editor-panel">
          <div className="panel-header">
            <h3>输入 SQL</h3>
            <div className="panel-actions">
              <button onClick={clearAll}>清空</button>
            </div>
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="粘贴或输入 SQL 代码..."
            spellCheck={false}
          />
        </div>

        <div className="format-actions">
          <button className="format-btn" onClick={formatSql}>
            格式化 →
          </button>
        </div>

        <div className="editor-panel">
          <div className="panel-header">
            <h3>格式化结果</h3>
            <div className="panel-actions">
              <button onClick={copyToClipboard} disabled={!output}>
                复制
              </button>
            </div>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="格式化后的 SQL 代码将显示在这里..."
            spellCheck={false}
          />
        </div>
      </div>

      <div className="info-section">
        <h3>💡 功能特性</h3>
        <ul>
          <li>支持多种 SQL 方言（MySQL、PostgreSQL、Oracle 等）</li>
          <li>自动缩进和换行</li>
          <li>关键字大小写转换</li>
          <li>保持代码可读性</li>
          <li>支持复杂查询格式化</li>
        </ul>
      </div>
    </div>
  );
};

export default SqlFormatter;
