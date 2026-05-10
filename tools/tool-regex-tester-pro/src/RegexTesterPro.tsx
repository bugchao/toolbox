import React, { useState, useEffect } from 'react';
import './RegexTesterPro.css';

interface RegexTemplate {
  name: string;
  pattern: string;
  description: string;
  example: string;
}

const REGEX_TEMPLATES: RegexTemplate[] = [
  {
    name: '邮箱',
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    description: '匹配标准邮箱地址',
    example: 'user@example.com',
  },
  {
    name: '手机号（中国）',
    pattern: '^1[3-9]\\d{9}$',
    description: '匹配中国大陆手机号',
    example: '13800138000',
  },
  {
    name: 'URL',
    pattern: '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$',
    description: '匹配 HTTP/HTTPS URL',
    example: 'https://www.example.com',
  },
  {
    name: 'IPv4 地址',
    pattern: '^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',
    description: '匹配 IPv4 地址',
    example: '192.168.1.1',
  },
  {
    name: '身份证号',
    pattern: '^[1-9]\\d{5}(18|19|20)\\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$',
    description: '匹配中国身份证号（18位）',
    example: '110101199001011234',
  },
  {
    name: '日期 YYYY-MM-DD',
    pattern: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$',
    description: '匹配日期格式',
    example: '2024-01-01',
  },
  {
    name: '时间 HH:MM:SS',
    pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$',
    description: '匹配时间格式',
    example: '12:30:45',
  },
  {
    name: '中文字符',
    pattern: '^[\\u4e00-\\u9fa5]+$',
    description: '匹配纯中文字符',
    example: '你好世界',
  },
  {
    name: '用户名',
    pattern: '^[a-zA-Z0-9_-]{3,16}$',
    description: '匹配用户名（3-16位字母数字下划线）',
    example: 'user_name123',
  },
  {
    name: '密码强度',
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
    description: '至少8位，包含大小写字母、数字和特殊字符',
    example: 'Pass@word123',
  },
  {
    name: '十六进制颜色',
    pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
    description: '匹配十六进制颜色代码',
    example: '#FF5733',
  },
  {
    name: '银行卡号',
    pattern: '^[1-9]\\d{15,18}$',
    description: '匹配银行卡号（16-19位）',
    example: '6222021234567890123',
  },
];

export const RegexTesterPro: React.FC = () => {
  const [pattern, setPattern] = useState<string>('');
  const [flags, setFlags] = useState<string>('g');
  const [testString, setTestString] = useState<string>('');
  const [matches, setMatches] = useState<RegExpMatchArray[]>([]);
  const [error, setError] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(false);

  useEffect(() => {
    testRegex();
  }, [pattern, flags, testString]);

  const testRegex = () => {
    if (!pattern) {
      setMatches([]);
      setError('');
      setIsValid(false);
      return;
    }

    try {
      const regex = new RegExp(pattern, flags);
      setError('');
      setIsValid(true);

      if (!testString) {
        setMatches([]);
        return;
      }

      const allMatches: RegExpMatchArray[] = [];
      let match;

      if (flags.includes('g')) {
        const globalRegex = new RegExp(pattern, flags);
        while ((match = globalRegex.exec(testString)) !== null) {
          allMatches.push(match);
        }
      } else {
        match = testString.match(regex);
        if (match) {
          allMatches.push(match);
        }
      }

      setMatches(allMatches);
    } catch (err) {
      setError(err instanceof Error ? err.message : '正则表达式错误');
      setIsValid(false);
      setMatches([]);
    }
  };

  const loadTemplate = (template: RegexTemplate) => {
    setPattern(template.pattern);
    setTestString(template.example);
    setFlags('g');
  };

  const toggleFlag = (flag: string) => {
    if (flags.includes(flag)) {
      setFlags(flags.replace(flag, ''));
    } else {
      setFlags(flags + flag);
    }
  };

  const highlightMatches = () => {
    if (!testString || matches.length === 0) {
      return testString;
    }

    let result = testString;
    const replacements: Array<{ start: number; end: number; text: string }> = [];

    matches.forEach((match) => {
      if (match.index !== undefined) {
        replacements.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[0],
        });
      }
    });

    replacements.sort((a, b) => b.start - a.start);

    replacements.forEach((replacement) => {
      result =
        result.slice(0, replacement.start) +
        `<mark>${replacement.text}</mark>` +
        result.slice(replacement.end);
    });

    return result;
  };

  return (
    <div className="regex-tester-pro">
      <div className="tool-header">
        <h1>🔍 正则表达式测试器</h1>
        <p>测试和调试正则表达式，包含常用模板</p>
      </div>

      <div className="main-section">
        <div className="regex-input-section">
          <div className="input-group">
            <label>正则表达式</label>
            <div className="regex-input-wrapper">
              <span className="regex-delimiter">/</span>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="输入正则表达式..."
                className={error ? 'error' : isValid ? 'valid' : ''}
              />
              <span className="regex-delimiter">/</span>
              <div className="flags-input">
                <button
                  className={flags.includes('g') ? 'active' : ''}
                  onClick={() => toggleFlag('g')}
                  title="全局匹配"
                >
                  g
                </button>
                <button
                  className={flags.includes('i') ? 'active' : ''}
                  onClick={() => toggleFlag('i')}
                  title="忽略大小写"
                >
                  i
                </button>
                <button
                  className={flags.includes('m') ? 'active' : ''}
                  onClick={() => toggleFlag('m')}
                  title="多行模式"
                >
                  m
                </button>
              </div>
            </div>
            {error && <div className="error-message">{error}</div>}
          </div>

          <div className="input-group">
            <label>测试字符串</label>
            <textarea
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder="输入要测试的字符串..."
              rows={6}
            />
          </div>

          <div className="results-section">
            <h3>匹配结果 ({matches.length})</h3>
            {matches.length > 0 ? (
              <div className="matches-list">
                {matches.map((match, index) => (
                  <div key={index} className="match-item">
                    <div className="match-header">
                      <span className="match-index">匹配 {index + 1}</span>
                      <span className="match-position">
                        位置: {match.index} - {match.index! + match[0].length}
                      </span>
                    </div>
                    <div className="match-content">{match[0]}</div>
                    {match.length > 1 && (
                      <div className="match-groups">
                        {match.slice(1).map((group, i) => (
                          <div key={i} className="group-item">
                            <span className="group-label">分组 {i + 1}:</span>
                            <span className="group-value">{group || '(空)'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-matches">
                {testString ? '无匹配结果' : '请输入测试字符串'}
              </div>
            )}
          </div>

          {testString && matches.length > 0 && (
            <div className="highlight-section">
              <h3>高亮显示</h3>
              <div
                className="highlight-text"
                dangerouslySetInnerHTML={{ __html: highlightMatches() }}
              />
            </div>
          )}
        </div>

        <div className="templates-section">
          <h3>常用模板</h3>
          <div className="templates-list">
            {REGEX_TEMPLATES.map((template, index) => (
              <div key={index} className="template-item" onClick={() => loadTemplate(template)}>
                <div className="template-name">{template.name}</div>
                <div className="template-description">{template.description}</div>
                <div className="template-pattern">{template.pattern}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="info-section">
        <h3>💡 常用语法</h3>
        <div className="syntax-grid">
          <div className="syntax-item">
            <code>.</code> - 匹配任意字符
          </div>
          <div className="syntax-item">
            <code>*</code> - 0次或多次
          </div>
          <div className="syntax-item">
            <code>+</code> - 1次或多次
          </div>
          <div className="syntax-item">
            <code>?</code> - 0次或1次
          </div>
          <div className="syntax-item">
            <code>\d</code> - 数字
          </div>
          <div className="syntax-item">
            <code>\w</code> - 字母数字下划线
          </div>
          <div className="syntax-item">
            <code>\s</code> - 空白字符
          </div>
          <div className="syntax-item">
            <code>^</code> - 行首
          </div>
          <div className="syntax-item">
            <code>$</code> - 行尾
          </div>
          <div className="syntax-item">
            <code>[abc]</code> - 字符集
          </div>
          <div className="syntax-item">
            <code>(x|y)</code> - 或
          </div>
          <div className="syntax-item">
            <code>()</code> - 分组
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegexTesterPro;
