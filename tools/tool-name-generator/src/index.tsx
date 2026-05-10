<<<<<<< HEAD
import React, { useState } from 'react';

type NameType = 'chinese' | 'english' | 'japanese' | 'fantasy' | 'tech' | 'pet';
type Gender = 'male' | 'female' | 'neutral';

interface GeneratedName {
  name: string;
  meaning?: string;
}

const chineseNames = {
  male: {
    surnames: ['李', '王', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴'],
    names: ['浩然', '子轩', '宇轩', '博文', '俊杰', '天翊', '梓豪', '子涵', '明轩', '睿渊']
  },
  female: {
    surnames: ['李', '王', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴'],
    names: ['诗涵', '梓萱', '雨萱', '欣怡', '可馨', '思涵', '语嫣', '梦琪', '雅静', '紫涵']
  }
};

const englishNames = {
  male: ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Christopher'],
  female: ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen'],
  surnames: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez']
};

const japaneseNames = {
  male: ['太郎', '健太', '翔太', '大輔', '拓也', '隆', '誠', '勇', '剛', '修'],
  female: ['さくら', '美咲', '結衣', '陽菜', '葵', '凛', '花', '愛', '優', '莉子'],
  surnames: ['佐藤', '鈴木', '高橋', '田中', '渡辺', '伊藤', '山本', '中村', '小林', '加藤']
};

const fantasyNames = {
  prefixes: ['Aer', 'Eld', 'Thal', 'Zeph', 'Lun', 'Sol', 'Nyx', 'Aur', 'Cael', 'Drak'],
  suffixes: ['ion', 'wen', 'dor', 'mir', 'wyn', 'aris', 'eth', 'iel', 'or', 'an']
};

const techNames = {
  prefixes: ['Cyber', 'Quantum', 'Neural', 'Pixel', 'Data', 'Cloud', 'Crypto', 'Nano', 'Robo', 'Tech'],
  suffixes: ['X', 'Pro', 'AI', 'Bot', 'Core', 'Net', 'Sync', 'Link', 'Hub', 'Lab']
};

const petNames = {
  cute: ['Mochi', 'Bubbles', 'Cookie', 'Peanut', 'Marshmallow', 'Cupcake', 'Pudding', 'Waffle', 'Biscuit', 'Nugget'],
  cool: ['Shadow', 'Thunder', 'Blaze', 'Storm', 'Rocket', 'Titan', 'Phoenix', 'Hunter', 'Maverick', 'Ace'],
  funny: ['Sir Barks-a-lot', 'Chewbarka', 'Bark Twain', 'Fuzz Aldrin', 'Hairy Potter', 'Meowly Cyrus', 'Catrick Swayze', 'Purrlock Holmes']
};

const NameGenerator: React.FC = () => {
  const [nameType, setNameType] = useState<NameType>('chinese');
  const [gender, setGender] = useState<Gender>('neutral');
  const [generatedNames, setGeneratedNames] = useState<GeneratedName[]>([]);
  const [count, setCount] = useState(5);

  const generateName = (): GeneratedName => {
    switch (nameType) {
      case 'chinese': {
        const data = gender === 'male' ? chineseNames.male : chineseNames.female;
        const surname = data.surnames[Math.floor(Math.random() * data.surnames.length)];
        const name = data.names[Math.floor(Math.random() * data.names.length)];
        return { name: `${surname}${name}` };
      }
      case 'english': {
        const firstNames = gender === 'male' ? englishNames.male : gender === 'female' ? englishNames.female : [...englishNames.male, ...englishNames.female];
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = englishNames.surnames[Math.floor(Math.random() * englishNames.surnames.length)];
        return { name: `${firstName} ${lastName}` };
      }
      case 'japanese': {
        const firstNames = gender === 'male' ? japaneseNames.male : japaneseNames.female;
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = japaneseNames.surnames[Math.floor(Math.random() * japaneseNames.surnames.length)];
        return { name: `${lastName} ${firstName}` };
      }
      case 'fantasy': {
        const prefix = fantasyNames.prefixes[Math.floor(Math.random() * fantasyNames.prefixes.length)];
        const suffix = fantasyNames.suffixes[Math.floor(Math.random() * fantasyNames.suffixes.length)];
        return { name: `${prefix}${suffix}` };
      }
      case 'tech': {
        const prefix = techNames.prefixes[Math.floor(Math.random() * techNames.prefixes.length)];
        const suffix = techNames.suffixes[Math.floor(Math.random() * techNames.suffixes.length)];
        return { name: `${prefix}${suffix}` };
      }
      case 'pet': {
        const categories = [petNames.cute, petNames.cool, petNames.funny];
        const category = categories[Math.floor(Math.random() * categories.length)];
        const name = category[Math.floor(Math.random() * category.length)];
        return { name };
      }
      default:
        return { name: 'Unknown' };
    }
  };

  const handleGenerate = () => {
    const names: GeneratedName[] = [];
    for (let i = 0; i < count; i++) {
      names.push(generateName());
    }
    setGeneratedNames(names);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">🎭 随机名字生成器</h1>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">名字类型</label>
            <select
              value={nameType}
              onChange={(e) => setNameType(e.target.value as NameType)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="chinese">中文名</option>
              <option value="english">英文名</option>
              <option value="japanese">日文名</option>
              <option value="fantasy">奇幻名</option>
              <option value="tech">科技名</option>
              <option value="pet">宠物名</option>
            </select>
          </div>

          {(nameType === 'chinese' || nameType === 'english' || nameType === 'japanese') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">性别</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="male"
                    checked={gender === 'male'}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    className="mr-2"
                  />
                  男性
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="female"
                    checked={gender === 'female'}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    className="mr-2"
                  />
                  女性
                </label>
                {nameType === 'english' && (
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="neutral"
                      checked={gender === 'neutral'}
                      onChange={(e) => setGender(e.target.value as Gender)}
                      className="mr-2"
                    />
                    随机
                  </label>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">生成数量</label>
            <input
              type="number"
              min="1"
              max="20"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleGenerate}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
          >
            生成名字
          </button>
        </div>

        {generatedNames.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">生成结果</h2>
            <div className="space-y-2">
              {generatedNames.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div>
                    <span className="text-lg font-medium text-gray-800">{item.name}</span>
                    {item.meaning && (
                      <span className="ml-2 text-sm text-gray-500">({item.meaning})</span>
                    )}
                  </div>
                  <button
                    onClick={() => copyToClipboard(item.name)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition"
                  >
                    复制
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">💡 使用提示</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 中文名：基于常见姓氏和流行名字组合</li>
            <li>• 英文名：美国常见名字和姓氏</li>
            <li>• 日文名：日本传统姓名</li>
            <li>• 奇幻名：适合游戏角色、小说人物</li>
            <li>• 科技名：适合产品、项目命名</li>
            <li>• 宠物名：可爱、酷炫、搞笑风格</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NameGenerator;
=======
export { NameGenerator as default } from './NameGenerator';
>>>>>>> origin/feat/batch-tools-27
