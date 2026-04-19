import React, { useState, useEffect } from 'react';
import { ArrowRightLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Unit {
  name: string;
  symbol: string;
  factor: number; // 转换为基准单位的系数
}

interface Category {
  name: string;
  baseUnit: string;
  units: Unit[];
}

const UnitConverter: React.FC = () => {
  const { t } = useTranslation();
  const categories: Category[] = [
    {
      name: '长度',
      baseUnit: '米',
      units: [
        { name: '千米', symbol: 'km', factor: 1000 },
        { name: '米', symbol: 'm', factor: 1 },
        { name: '分米', symbol: 'dm', factor: 0.1 },
        { name: '厘米', symbol: 'cm', factor: 0.01 },
        { name: '毫米', symbol: 'mm', factor: 0.001 },
        { name: '微米', symbol: 'μm', factor: 0.000001 },
        { name: '纳米', symbol: 'nm', factor: 0.000000001 },
        { name: '英寸', symbol: 'in', factor: 0.0254 },
        { name: '英尺', symbol: 'ft', factor: 0.3048 },
        { name: '码', symbol: 'yd', factor: 0.9144 },
        { name: '英里', symbol: 'mi', factor: 1609.34 },
        { name: '海里', symbol: 'nmi', factor: 1852 },
      ],
    },
    {
      name: '重量',
      baseUnit: '千克',
      units: [
        { name: '吨', symbol: 't', factor: 1000 },
        { name: '千克', symbol: 'kg', factor: 1 },
        { name: '克', symbol: 'g', factor: 0.001 },
        { name: '毫克', symbol: 'mg', factor: 0.000001 },
        { name: '微克', symbol: 'μg', factor: 0.000000001 },
        { name: '磅', symbol: 'lb', factor: 0.453592 },
        { name: '盎司', symbol: 'oz', factor: 0.0283495 },
        { name: '克拉', symbol: 'ct', factor: 0.0002 },
        { name: '斤', symbol: '斤', factor: 0.5 },
        { name: '两', symbol: '两', factor: 0.05 },
      ],
    },
    {
      name: '温度',
      baseUnit: '摄氏度',
      units: [
        { name: '摄氏度', symbol: '°C', factor: 1 },
        { name: '华氏度', symbol: '°F', factor: 1 },
        { name: '开尔文', symbol: 'K', factor: 1 },
      ],
    },
    {
      name: '面积',
      baseUnit: '平方米',
      units: [
        { name: '平方千米', symbol: 'km²', factor: 1000000 },
        { name: '平方米', symbol: 'm²', factor: 1 },
        { name: '平方分米', symbol: 'dm²', factor: 0.01 },
        { name: '平方厘米', symbol: 'cm²', factor: 0.0001 },
        { name: '平方毫米', symbol: 'mm²', factor: 0.000001 },
        { name: '公顷', symbol: 'ha', factor: 10000 },
        { name: '英亩', symbol: 'ac', factor: 4046.86 },
        { name: '平方英寸', symbol: 'in²', factor: 0.00064516 },
        { name: '平方英尺', symbol: 'ft²', factor: 0.092903 },
        { name: '平方码', symbol: 'yd²', factor: 0.836127 },
        { name: '平方英里', symbol: 'mi²', factor: 2589990 },
        { name: '亩', symbol: '亩', factor: 666.667 },
      ],
    },
    {
      name: '体积',
      baseUnit: '立方米',
      units: [
        { name: '立方米', symbol: 'm³', factor: 1 },
        { name: '立方分米', symbol: 'dm³', factor: 0.001 },
        { name: '立方厘米', symbol: 'cm³', factor: 0.000001 },
        { name: '升', symbol: 'L', factor: 0.001 },
        { name: '分升', symbol: 'dL', factor: 0.0001 },
        { name: '厘升', symbol: 'cL', factor: 0.00001 },
        { name: '毫升', symbol: 'mL', factor: 0.000001 },
        { name: '立方英寸', symbol: 'in³', factor: 0.0000163871 },
        { name: '立方英尺', symbol: 'ft³', factor: 0.0283168 },
        { name: '立方码', symbol: 'yd³', factor: 0.764555 },
        { name: '加仑(美)', symbol: 'gal(US)', factor: 0.00378541 },
        { name: '加仑(英)', symbol: 'gal(UK)', factor: 0.00454609 },
        { name: '盎司(美液)', symbol: 'fl oz(US)', factor: 0.0000295735 },
        { name: '盎司(英液)', symbol: 'fl oz(UK)', factor: 0.0000284131 },
      ],
    },
    {
      name: '时间',
      baseUnit: '秒',
      units: [
        { name: '年', symbol: 'y', factor: 31536000 },
        { name: '月', symbol: 'mo', factor: 2592000 },
        { name: '周', symbol: 'wk', factor: 604800 },
        { name: '天', symbol: 'd', factor: 86400 },
        { name: '小时', symbol: 'h', factor: 3600 },
        { name: '分钟', symbol: 'min', factor: 60 },
        { name: '秒', symbol: 's', factor: 1 },
        { name: '毫秒', symbol: 'ms', factor: 0.001 },
        { name: '微秒', symbol: 'μs', factor: 0.000001 },
        { name: '纳秒', symbol: 'ns', factor: 0.000000001 },
      ],
    },
    {
      name: '速度',
      baseUnit: '米每秒',
      units: [
        { name: '米每秒', symbol: 'm/s', factor: 1 },
        { name: '千米每小时', symbol: 'km/h', factor: 0.277778 },
        { name: '英里每小时', symbol: 'mph', factor: 0.44704 },
        { name: '节', symbol: 'kn', factor: 0.514444 },
        { name: '英尺每秒', symbol: 'ft/s', factor: 0.3048 },
        { name: '马赫', symbol: 'Ma', factor: 343 },
      ],
    },
    {
      name: '数据存储',
      baseUnit: '字节',
      units: [
        { name: '比特', symbol: 'bit', factor: 0.125 },
        { name: '字节', symbol: 'B', factor: 1 },
        { name: '千字节', symbol: 'KB', factor: 1024 },
        { name: '兆字节', symbol: 'MB', factor: 1024 * 1024 },
        { name: '吉字节', symbol: 'GB', factor: 1024 * 1024 * 1024 },
        { name: '太字节', symbol: 'TB', factor: 1024 ** 4 },
        { name: '拍字节', symbol: 'PB', factor: 1024 ** 5 },
        { name: '艾字节', symbol: 'EB', factor: 1024 ** 6 },
      ],
    },
    {
      name: '压力',
      baseUnit: '帕斯卡',
      units: [
        { name: '帕斯卡', symbol: 'Pa', factor: 1 },
        { name: '千帕', symbol: 'kPa', factor: 1000 },
        { name: '兆帕', symbol: 'MPa', factor: 1000000 },
        { name: '巴', symbol: 'bar', factor: 100000 },
        { name: '标准大气压', symbol: 'atm', factor: 101325 },
        { name: '毫米汞柱', symbol: 'mmHg', factor: 133.322 },
        { name: '英寸汞柱', symbol: 'inHg', factor: 3386.39 },
        { name: '磅每平方英寸', symbol: 'psi', factor: 6894.76 },
      ],
    },
    {
      name: '功率',
      baseUnit: '瓦特',
      units: [
        { name: '瓦特', symbol: 'W', factor: 1 },
        { name: '千瓦', symbol: 'kW', factor: 1000 },
        { name: '兆瓦', symbol: 'MW', factor: 1000000 },
        { name: '英制马力', symbol: 'hp', factor: 745.7 },
        { name: '公制马力', symbol: 'ps', factor: 735.5 },
        { name: '千卡/秒', symbol: 'kcal/s', factor: 4184 },
        { name: '英热单位/秒', symbol: 'Btu/s', factor: 1055.06 },
      ],
    },
    {
      name: '能量',
      baseUnit: '焦耳',
      units: [
        { name: '焦耳', symbol: 'J', factor: 1 },
        { name: '千焦', symbol: 'kJ', factor: 1000 },
        { name: '卡路里', symbol: 'cal', factor: 4.184 },
        { name: '千卡', symbol: 'kcal', factor: 4184 },
        { name: '千瓦时', symbol: 'kW·h', factor: 3600000 },
        { name: '英热单位', symbol: 'Btu', factor: 1055.06 },
        { name: '英尺磅', symbol: 'ft·lb', factor: 1.35582 },
      ],
    },
    {
      name: '角度',
      baseUnit: '度',
      units: [
        { name: '度', symbol: '°', factor: 1 },
        { name: '弧度', symbol: 'rad', factor: 57.2958 },
        { name: '分', symbol: "'", factor: 0.0166667 },
        { name: '秒', symbol: '"', factor: 0.000277778 },
        { name: '圈', symbol: 'rev', factor: 360 },
        { name: '梯度', symbol: 'grad', factor: 0.9 },
      ],
    },
  ];

  const [selectedCategory, setSelectedCategory] = useState<string>('长度');
  const [inputValue, setInputValue] = useState<string>('1');
  const [fromUnit, setFromUnit] = useState<string>('m');
  const [toUnit, setToUnit] = useState<string>('km');
  const [result, setResult] = useState<string>('0.001');

  // 温度转换特殊处理
  const convertTemperature = (value: number, from: string, to: string): number => {
    if (from === '°C' && to === '°F') {
      return (value * 9) / 5 + 32;
    } else if (from === '°C' && to === 'K') {
      return value + 273.15;
    } else if (from === '°F' && to === '°C') {
      return ((value - 32) * 5) / 9;
    } else if (from === '°F' && to === 'K') {
      return ((value - 32) * 5) / 9 + 273.15;
    } else if (from === 'K' && to === '°C') {
      return value - 273.15;
    } else if (from === 'K' && to === '°F') {
      return ((value - 273.15) * 9) / 5 + 32;
    }
    return value;
  };

  // 通用转换
  const convert = () => {
    const value = parseFloat(inputValue);
    if (isNaN(value)) {
      setResult('');
      return;
    }

    const category = categories.find(c => c.name === selectedCategory);
    if (!category) return;

    if (selectedCategory === '温度') {
      const convertedValue = convertTemperature(value, fromUnit, toUnit);
      setResult(convertedValue.toFixed(6));
      return;
    }

    const fromUnitData = category.units.find(u => u.symbol === fromUnit);
    const toUnitData = category.units.find(u => u.symbol === toUnit);
    
    if (!fromUnitData || !toUnitData) return;

    // 先转换为基准单位，再转换为目标单位
    const baseValue = value * fromUnitData.factor;
    const convertedValue = baseValue / toUnitData.factor;
    
    setResult(convertedValue.toFixed(6));
  };

  // 交换单位
  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setInputValue(result);
  };

  // 当分类变化时，重置单位
  useEffect(() => {
    const category = categories.find(c => c.name === selectedCategory);
    if (category) {
      setFromUnit(category.units[0].symbol);
      setToUnit(category.units[1].symbol);
      setInputValue('1');
    }
  }, [selectedCategory]);

  // 当输入或单位变化时，自动转换
  useEffect(() => {
    convert();
  }, [inputValue, fromUnit, toUnit, selectedCategory]);

  const currentCategory = categories.find(c => c.name === selectedCategory);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">单位换算器</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* 分类选择 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            选择分类
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category.name} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* 转换区域 */}
        <div className="space-y-6">
          {/* 输入部分 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              输入数值
            </label>
            <div className="flex gap-4">
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="输入数值"
              />
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="w-40 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {currentCategory?.units.map(unit => (
                  <option key={unit.symbol} value={unit.symbol}>
                    {unit.name} ({unit.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 交换按钮 */}
          <div className="flex justify-center">
            <button
              onClick={swapUnits}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              <ArrowRightLeft className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* 结果部分 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              转换结果
            </label>
            <div className="flex gap-4">
              <input
                type="text"
                value={result}
                readOnly
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                placeholder="转换结果"
              />
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-40 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {currentCategory?.units.map(unit => (
                  <option key={unit.symbol} value={unit.symbol}>
                    {unit.name} ({unit.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 常用单位说明 */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">📖 单位说明</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          {selectedCategory === '长度' && (
            <>
              <div>
                <span className="font-semibold">公制单位：</span>
                千米(km)、米(m)、分米(dm)、厘米(cm)、毫米(mm)
              </div>
              <div>
                <span className="font-semibold">英制单位：</span>
                英寸(in)、英尺(ft)、码(yd)、英里(mi)
              </div>
            </>
          )}
          {selectedCategory === '重量' && (
            <>
              <div>
                <span className="font-semibold">公制单位：</span>
                吨(t)、千克(kg)、克(g)、毫克(mg)
              </div>
              <div>
                <span className="font-semibold">英制/市制：</span>
                磅(lb)、盎司(oz)、斤、两
              </div>
            </>
          )}
          {selectedCategory === '数据存储' && (
            <>
              <div>
                <span className="font-semibold">换算关系：</span>
                1字节(B) = 8比特(bit)
              </div>
              <div>
                <span className="font-semibold">二进制换算：</span>
                1KB = 1024B, 1MB = 1024KB, 1GB = 1024MB
              </div>
            </>
          )}
        </div>
      </div>

      {/* 功能特性 */}
      <div className="mt-6 bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">✨ 功能特性</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-blue-700">
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span>支持12大类、上百种单位的互相转换</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span>实时转换，输入数值立即得到结果</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span>一键交换单位，快速对比换算</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span>高精度转换，保留6位小数</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span>包含公制、英制、市制等多种单位体系</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span>所有转换本地完成，无需联网</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UnitConverter;