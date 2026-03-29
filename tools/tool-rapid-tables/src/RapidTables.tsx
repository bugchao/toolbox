import React, { useState } from 'react';
import { Calculator, Ruler, Calendar, Percent, Binary, RotateCcw } from 'lucide-react';

type CalculatorType = 'basic' | 'scientific' | 'unit' | 'date' | 'percentage' | 'base';

const RapidTables: React.FC = () => {
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType>('basic');
  
  // Basic Calculator State
  const [basicExpr, setBasicExpr] = useState('');
  const [basicResult, setBasicResult] = useState<string | null>(null);
  
  // Scientific Calculator State
  const [sciValue, setSciValue] = useState('');
  const [sciOperation, setSciOperation] = useState<'sin' | 'cos' | 'tan' | 'sqrt' | 'log' | 'ln' | 'exp' | 'abs'>('sin');
  const [sciResult, setSciResult] = useState<string | null>(null);
  
  // Unit Converter State
  const [unitCategory, setUnitCategory] = useState<'length' | 'weight' | 'temperature' | 'speed' | 'area'>('length');
  const [unitValue, setUnitValue] = useState('');
  const [unitFrom, setUnitFrom] = useState('m');
  const [unitTo, setUnitTo] = useState('km');
  const [unitResult, setUnitResult] = useState<string | null>(null);
  
  // Date Calculator State
  const [date1, setDate1] = useState('');
  const [date2, setDate2] = useState('');
  const [dateOperation, setDateOperation] = useState<'diff' | 'add' | 'subtract'>('diff');
  const [daysToAdd, setDaysToAdd] = useState('');
  const [dateResult, setDateResult] = useState<string | null>(null);
  
  // Percentage Calculator State
  const [percentValue, setPercentValue] = useState('');
  const [percentTotal, setPercentTotal] = useState('');
  const [percentOperation, setPercentOperation] = useState<'of' | 'is' | 'change'>('of');
  const [percentResult, setPercentResult] = useState<string | null>(null);
  
  // Base Converter State
  const [baseValue, setBaseValue] = useState('');
  const [baseFrom, setBaseFrom] = useState('10');
  const [baseTo, setBaseTo] = useState('2');
  const [baseResult, setBaseResult] = useState<string | null>(null);

  // Unit conversion rates (to base unit)
  const unitRates: Record<string, Record<string, number>> = {
    length: { mm: 0.001, cm: 0.01, m: 1, km: 1000, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.34 },
    weight: { mg: 0.001, g: 1, kg: 1000, lb: 453.592, oz: 28.3495 },
    speed: { 'm/s': 1, 'km/h': 0.277778, 'mph': 0.44704, knot: 0.514444 },
    area: { 'mm²': 0.000001, 'cm²': 0.0001, 'm²': 1, 'km²': 1000000, 'ft²': 0.092903 },
  };

  const calculateBasic = () => {
    try {
      // Safe evaluation of mathematical expression
      const sanitized = basicExpr.replace(/[^0-9+\-*/().\s]/g, '');
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${sanitized})`)();
      setBasicResult(String(result));
    } catch {
      setBasicResult('Error: Invalid expression');
    }
  };

  const calculateScientific = () => {
    try {
      const value = parseFloat(sciValue);
      if (isNaN(value)) {
        setSciResult('Error: Invalid number');
        return;
      }
      
      let result: number;
      switch (sciOperation) {
        case 'sin': result = Math.sin(value); break;
        case 'cos': result = Math.cos(value); break;
        case 'tan': result = Math.tan(value); break;
        case 'sqrt': result = Math.sqrt(value); break;
        case 'log': result = Math.log10(value); break;
        case 'ln': result = Math.log(value); break;
        case 'exp': result = Math.exp(value); break;
        case 'abs': result = Math.abs(value); break;
        default: result = 0;
      }
      
      setSciResult(result.toFixed(6));
    } catch {
      setSciResult('Error');
    }
  };

  const convertUnit = () => {
    try {
      const value = parseFloat(unitValue);
      if (isNaN(value)) {
        setUnitResult('Error: Invalid number');
        return;
      }
      
      if (unitCategory === 'temperature') {
        // Special handling for temperature
        let celsius: number;
        if (unitFrom === 'C') celsius = value;
        else if (unitFrom === 'F') celsius = (value - 32) * 5/9;
        else if (unitFrom === 'K') celsius = value - 273.15;
        else return;
        
        let result: number;
        if (unitTo === 'C') result = celsius;
        else if (unitTo === 'F') result = celsius * 9/5 + 32;
        else if (unitTo === 'K') result = celsius + 273.15;
        else return;
        
        setUnitResult(`${result.toFixed(2)} ${unitTo}`);
      } else {
        const rates = unitRates[unitCategory];
        const fromRate = rates[unitFrom];
        const toRate = rates[unitTo];
        const result = (value * fromRate) / toRate;
        setUnitResult(`${result.toFixed(6)} ${unitTo}`);
      }
    } catch {
      setUnitResult('Error');
    }
  };

  const calculateDate = () => {
    try {
      if (dateOperation === 'diff' && date1 && date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2.getTime() - d1.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDateResult(`${diffDays} days`);
      } else if (dateOperation === 'add' && date1 && daysToAdd) {
        const d = new Date(date1);
        d.setDate(d.getDate() + parseInt(daysToAdd));
        setDateResult(d.toLocaleDateString());
      } else if (dateOperation === 'subtract' && date1 && daysToAdd) {
        const d = new Date(date1);
        d.setDate(d.getDate() - parseInt(daysToAdd));
        setDateResult(d.toLocaleDateString());
      } else {
        setDateResult('Please fill in all fields');
      }
    } catch {
      setDateResult('Error: Invalid date');
    }
  };

  const calculatePercentage = () => {
    try {
      const value = parseFloat(percentValue);
      const total = parseFloat(percentTotal);
      
      if (isNaN(value) || isNaN(total)) {
        setPercentResult('Error: Invalid numbers');
        return;
      }
      
      let result: number;
      let label: string;
      
      if (percentOperation === 'of') {
        result = (value / 100) * total;
        label = `${value}% of ${total} is`;
      } else if (percentOperation === 'is') {
        result = (value / total) * 100;
        label = `${value} is what percent of ${total}?`;
      } else { // change
        result = ((total - value) / value) * 100;
        label = `Percentage change from ${value} to ${total}:`;
      }
      
      setPercentResult(`${label} ${result.toFixed(2)}%`);
    } catch {
      setPercentResult('Error');
    }
  };

  const convertBase = () => {
    try {
      const fromBase = parseInt(baseFrom);
      const toBase = parseInt(baseTo);
      const decimalValue = parseInt(baseValue, fromBase);
      
      if (isNaN(decimalValue)) {
        setBaseResult('Error: Invalid number for selected base');
        return;
      }
      
      const result = decimalValue.toString(toBase).toUpperCase();
      setBaseResult(result);
    } catch {
      setBaseResult('Error');
    }
  };

  const resetAll = () => {
    setBasicExpr('');
    setBasicResult(null);
    setSciValue('');
    setSciResult(null);
    setUnitValue('');
    setUnitResult(null);
    setDate1('');
    setDate2('');
    setDaysToAdd('');
    setDateResult(null);
    setPercentValue('');
    setPercentTotal('');
    setPercentResult(null);
    setBaseValue('');
    setBaseResult(null);
  };

  const calculators = [
    { id: 'basic' as CalculatorType, name: '基础计算', icon: Calculator },
    { id: 'scientific' as CalculatorType, name: '科学计算', icon: Calculator },
    { id: 'unit' as CalculatorType, name: '单位转换', icon: Ruler },
    { id: 'date' as CalculatorType, name: '日期计算', icon: Calendar },
    { id: 'percentage' as CalculatorType, name: '百分比', icon: Percent },
    { id: 'base' as CalculatorType, name: '进制转换', icon: Binary },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">RapidTables 计算器</h1>
        <p className="text-gray-600">在线多功能计算器集合，涵盖数学、单位转换、日期、百分比、进制转换等</p>
      </div>

      {/* Calculator Type Selector */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
        {calculators.map(calc => (
          <button
            key={calc.id}
            onClick={() => setActiveCalculator(calc.id)}
            className={`p-3 rounded-lg border-2 transition flex flex-col items-center gap-1 ${
              activeCalculator === calc.id
                ? 'border-blue-500 bg-blue-50 text-blue-600'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <calc.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{calc.name}</span>
          </button>
        ))}
      </div>

      {/* Calculator Content */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {calculators.find(c => c.id === activeCalculator)?.name}
          </h2>
          <button
            onClick={resetAll}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <RotateCcw className="w-4 h-4" />
            重置
          </button>
        </div>

        {/* Basic Calculator */}
        {activeCalculator === 'basic' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">表达式</label>
              <input
                type="text"
                value={basicExpr}
                onChange={(e) => setBasicExpr(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && calculateBasic()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="例如：(2 + 3) * 4"
              />
            </div>
            <button
              onClick={calculateBasic}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
            >
              计算
            </button>
            {basicResult && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-sm text-gray-600">结果</div>
                <div className="text-2xl font-bold text-green-700">{basicResult}</div>
              </div>
            )}
          </div>
        )}

        {/* Scientific Calculator */}
        {activeCalculator === 'scientific' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">数值</label>
              <input
                type="number"
                value={sciValue}
                onChange={(e) => setSciValue(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="输入数值"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">函数</label>
              <select
                value={sciOperation}
                onChange={(e) => setSciOperation(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="sin">sin(x) - 正弦</option>
                <option value="cos">cos(x) - 余弦</option>
                <option value="tan">tan(x) - 正切</option>
                <option value="sqrt">√x - 平方根</option>
                <option value="log">log₁₀(x) - 常用对数</option>
                <option value="ln">ln(x) - 自然对数</option>
                <option value="exp">eˣ - 指数</option>
                <option value="abs">|x| - 绝对值</option>
              </select>
            </div>
            <button
              onClick={calculateScientific}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
            >
              计算
            </button>
            {sciResult && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-sm text-gray-600">结果</div>
                <div className="text-2xl font-bold text-green-700">{sciResult}</div>
              </div>
            )}
          </div>
        )}

        {/* Unit Converter */}
        {activeCalculator === 'unit' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">类别</label>
              <select
                value={unitCategory}
                onChange={(e) => {
                  setUnitCategory(e.target.value as any);
                  if (e.target.value !== 'temperature') {
                    const rates = unitRates[e.target.value];
                    const units = Object.keys(rates);
                    setUnitFrom(units[0]);
                    setUnitTo(units[1]);
                  } else {
                    setUnitFrom('C');
                    setUnitTo('F');
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="length">长度</option>
                <option value="weight">重量</option>
                <option value="temperature">温度</option>
                <option value="speed">速度</option>
                <option value="area">面积</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">数值</label>
              <input
                type="number"
                value={unitValue}
                onChange={(e) => setUnitValue(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="输入数值"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">从</label>
                <select
                  value={unitFrom}
                  onChange={(e) => setUnitFrom(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {unitCategory === 'temperature' ? (
                    <>
                      <option value="C">摄氏度 (°C)</option>
                      <option value="F">华氏度 (°F)</option>
                      <option value="K">开尔文 (K)</option>
                    </>
                  ) : (
                    Object.keys(unitRates[unitCategory]).map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">到</label>
                <select
                  value={unitTo}
                  onChange={(e) => setUnitTo(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {unitCategory === 'temperature' ? (
                    <>
                      <option value="C">摄氏度 (°C)</option>
                      <option value="F">华氏度 (°F)</option>
                      <option value="K">开尔文 (K)</option>
                    </>
                  ) : (
                    Object.keys(unitRates[unitCategory]).map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))
                  )}
                </select>
              </div>
            </div>
            <button
              onClick={convertUnit}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
            >
              转换
            </button>
            {unitResult && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-sm text-gray-600">结果</div>
                <div className="text-2xl font-bold text-green-700">{unitResult}</div>
              </div>
            )}
          </div>
        )}

        {/* Date Calculator */}
        {activeCalculator === 'date' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">操作</label>
              <select
                value={dateOperation}
                onChange={(e) => setDateOperation(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="diff">计算日期差</option>
                <option value="add">日期加天数</option>
                <option value="subtract">日期减天数</option>
              </select>
            </div>
            {dateOperation === 'diff' ? (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">日期 1</label>
                  <input
                    type="date"
                    value={date1}
                    onChange={(e) => setDate1(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">日期 2</label>
                  <input
                    type="date"
                    value={date2}
                    onChange={(e) => setDate2(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">日期</label>
                  <input
                    type="date"
                    value={date1}
                    onChange={(e) => setDate1(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">天数</label>
                  <input
                    type="number"
                    value={daysToAdd}
                    onChange={(e) => setDaysToAdd(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="输入天数"
                  />
                </div>
              </>
            )}
            <button
              onClick={calculateDate}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
            >
              计算
            </button>
            {dateResult && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-sm text-gray-600">结果</div>
                <div className="text-2xl font-bold text-green-700">{dateResult}</div>
              </div>
            )}
          </div>
        )}

        {/* Percentage Calculator */}
        {activeCalculator === 'percentage' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">操作</label>
              <select
                value={percentOperation}
                onChange={(e) => setPercentOperation(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="of">求百分比值 (X% of Y)</option>
                <option value="is">求百分比 (X is what % of Y)</option>
                <option value="change">求变化率 (X to Y)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">数值 1 (X)</label>
              <input
                type="number"
                value={percentValue}
                onChange={(e) => setPercentValue(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="输入数值"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">数值 2 (Y)</label>
              <input
                type="number"
                value={percentTotal}
                onChange={(e) => setPercentTotal(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="输入数值"
              />
            </div>
            <button
              onClick={calculatePercentage}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
            >
              计算
            </button>
            {percentResult && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-sm text-gray-600">结果</div>
                <div className="text-xl font-bold text-green-700">{percentResult}</div>
              </div>
            )}
          </div>
        )}

        {/* Base Converter */}
        {activeCalculator === 'base' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">数值</label>
              <input
                type="text"
                value={baseValue}
                onChange={(e) => setBaseValue(e.target.value.toUpperCase())}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="输入数值"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">从 (进制)</label>
                <select
                  value={baseFrom}
                  onChange={(e) => setBaseFrom(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="2">二进制 (2)</option>
                  <option value="8">八进制 (8)</option>
                  <option value="10">十进制 (10)</option>
                  <option value="16">十六进制 (16)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">到 (进制)</label>
                <select
                  value={baseTo}
                  onChange={(e) => setBaseTo(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="2">二进制 (2)</option>
                  <option value="8">八进制 (8)</option>
                  <option value="10">十进制 (10)</option>
                  <option value="16">十六进制 (16)</option>
                </select>
              </div>
            </div>
            <button
              onClick={convertBase}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
            >
              转换
            </button>
            {baseResult && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-sm text-gray-600">结果</div>
                <div className="text-2xl font-bold text-green-700 font-mono">{baseResult}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Reference */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-2">📚 常用公式参考</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <strong>温度转换：</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>°C → °F: (°C × 9/5) + 32</li>
              <li>°F → °C: (°F - 32) × 5/9</li>
              <li>K → °C: K - 273.15</li>
            </ul>
          </div>
          <div>
            <strong>常用单位：</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>1 英里 = 1.609 公里</li>
              <li>1 英尺 = 0.3048 米</li>
              <li>1 磅 = 0.4536 千克</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RapidTables;
