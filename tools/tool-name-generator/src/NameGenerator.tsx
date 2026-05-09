import React, { useState } from 'react';
import './NameGenerator.css';

type NameType = 'chinese' | 'english' | 'username' | 'company' | 'product' | 'fantasy';

const CHINESE_SURNAMES = ['李', '王', '张', '刘', '陈', '杨', '黄', '赵', '周', '吴', '徐', '孙', '马', '朱', '胡', '郭', '何', '林', '罗', '高'];
const CHINESE_NAMES = ['明', '华', '强', '伟', '芳', '娜', '静', '丽', '敏', '秀', '英', '杰', '涛', '磊', '军', '勇', '艳', '超', '鹏', '辉'];

const ENGLISH_FIRST_NAMES = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Nancy'];
const ENGLISH_LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

const USERNAME_PREFIXES = ['cool', 'super', 'mega', 'ultra', 'pro', 'master', 'epic', 'legend', 'ninja', 'dragon'];
const USERNAME_SUFFIXES = ['gamer', 'player', 'king', 'queen', 'lord', 'warrior', 'hero', 'star', 'ace', 'boss'];

const COMPANY_PREFIXES = ['Tech', 'Digital', 'Smart', 'Cloud', 'Cyber', 'Net', 'Web', 'Data', 'Info', 'Soft'];
const COMPANY_SUFFIXES = ['Solutions', 'Systems', 'Technologies', 'Labs', 'Works', 'Studio', 'Group', 'Corp', 'Inc', 'Ltd'];

const PRODUCT_ADJECTIVES = ['Smart', 'Quick', 'Easy', 'Pro', 'Ultra', 'Super', 'Mega', 'Fast', 'Instant', 'Auto'];
const PRODUCT_NOUNS = ['Hub', 'Box', 'Kit', 'Tool', 'App', 'Sync', 'Link', 'Flow', 'Wave', 'Spark'];

const FANTASY_PREFIXES = ['Ael', 'Thal', 'Zor', 'Kael', 'Dra', 'Mor', 'Fen', 'Gar', 'Lor', 'Val'];
const FANTASY_SUFFIXES = ['ion', 'ius', 'or', 'an', 'en', 'is', 'os', 'ar', 'el', 'on'];

export const NameGenerator: React.FC = () => {
  const [nameType, setNameType] = useState<NameType>('chinese');
  const [count, setCount] = useState<number>(10);
  const [generatedNames, setGeneratedNames] = useState<string[]>([]);

  const random = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const generateChineseName = (): string => {
    const surname = random(CHINESE_SURNAMES);
    const name = random(CHINESE_NAMES) + (Math.random() > 0.5 ? random(CHINESE_NAMES) : '');
    return surname + name;
  };

  const generateEnglishName = (): string => {
    return `${random(ENGLISH_FIRST_NAMES)} ${random(ENGLISH_LAST_NAMES)}`;
  };

  const generateUsername = (): string => {
    const prefix = random(USERNAME_PREFIXES);
    const suffix = random(USERNAME_SUFFIXES);
    const number = Math.floor(Math.random() * 1000);
    return `${prefix}_${suffix}${Math.random() > 0.5 ? number : ''}`;
  };

  const generateCompanyName = (): string => {
    return `${random(COMPANY_PREFIXES)}${random(COMPANY_SUFFIXES)}`;
  };

  const generateProductName = (): string => {
    return `${random(PRODUCT_ADJECTIVES)}${random(PRODUCT_NOUNS)}`;
  };

  const generateFantasyName = (): string => {
    return `${random(FANTASY_PREFIXES)}${random(FANTASY_SUFFIXES)}`;
  };

  const generateNames = () => {
    const names: string[] = [];
    const generators = {
      chinese: generateChineseName,
      english: generateEnglishName,
      username: generateUsername,
      company: generateCompanyName,
      product: generateProductName,
      fantasy: generateFantasyName,
    };

    for (let i = 0; i < count; i++) {
      names.push(generators[nameType]());
    }

    setGeneratedNames(names);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('已复制到剪贴板');
  };

  const copyAll = () => {
    copyToClipboard(generatedNames.join('\n'));
  };

  return (
    <div className="name-generator">
      <div className="tool-header">
        <h1>🎲 随机名字生成器</h1>
        <p>生成各种类型的随机名字</p>
      </div>

      <div className="generator-container">
        <div className="controls">
          <div className="control-group">
            <label>名字类型</label>
            <select value={nameType} onChange={e => setNameType(e.target.value as NameType)}>
              <option value="chinese">中文名字</option>
              <option value="english">英文名字</option>
              <option value="username">用户名</option>
              <option value="company">公司名称</option>
              <option value="product">产品名称</option>
              <option value="fantasy">奇幻名字</option>
            </select>
          </div>

          <div className="control-group">
            <label>生成数量</label>
            <input
              type="number"
              value={count}
              onChange={e => setCount(Math.max(1, Math.min(100, Number(e.target.value))))}
              min="1"
              max="100"
            />
          </div>

          <button className="generate-btn" onClick={generateNames}>
            🎲 生成名字
          </button>
        </div>

        {generatedNames.length > 0 && (
          <div className="results">
            <div className="results-header">
              <h3>生成结果 ({generatedNames.length})</h3>
              <button onClick={copyAll}>📋 复制全部</button>
            </div>
            <div className="names-grid">
              {generatedNames.map((name, index) => (
                <div
                  key={index}
                  className="name-item"
                  onClick={() => copyToClipboard(name)}
                >
                  {name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="info-section">
        <h3>💡 使用说明</h3>
        <ul>
          <li><strong>中文名字：</strong>生成常见的中文姓名</li>
          <li><strong>英文名字：</strong>生成常见的英文姓名</li>
          <li><strong>用户名：</strong>生成适合网络使用的用户名</li>
          <li><strong>公司名称：</strong>生成科技公司风格的名称</li>
          <li><strong>产品名称：</strong>生成产品或应用名称</li>
          <li><strong>奇幻名字：</strong>生成奇幻风格的名字</li>
          <li>点击名字可复制到剪贴板</li>
        </ul>
      </div>
    </div>
  );
};

export default NameGenerator;
