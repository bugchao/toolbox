import React, { useEffect, useState } from 'react';
import {
  Binary,
  Calculator,
  Calendar,
  Delete,
  Divide,
  Dot,
  Equal,
  Minus,
  Percent,
  Plus,
  RotateCcw,
  Ruler,
  X,
} from 'lucide-react';

type CalculatorType = 'basic' | 'scientific' | 'unit' | 'date' | 'percentage' | 'base';
type ScientificOperation = 'sin' | 'cos' | 'tan' | 'sqrt' | 'log' | 'ln' | 'exp' | 'abs';
type UnitCategory = 'length' | 'weight' | 'temperature' | 'speed' | 'area';
type DateOperation = 'diff' | 'add' | 'subtract';
type PercentageOperation = 'of' | 'is' | 'change';
type NumericField = 'sciValue' | 'unitValue' | 'daysToAdd' | 'percentValue' | 'percentTotal' | 'baseValue';

const calculators = [
  { id: 'basic' as CalculatorType, name: '基础计算', icon: Calculator, hint: '表达式 + 按键' },
  { id: 'scientific' as CalculatorType, name: '科学计算', icon: Calculator, hint: '函数运算' },
  { id: 'unit' as CalculatorType, name: '单位转换', icon: Ruler, hint: '多单位换算' },
  { id: 'date' as CalculatorType, name: '日期计算', icon: Calendar, hint: '日期差与加减' },
  { id: 'percentage' as CalculatorType, name: '百分比', icon: Percent, hint: '百分比场景' },
  { id: 'base' as CalculatorType, name: '进制转换', icon: Binary, hint: '2/8/10/16 进制' },
];

const fieldLabels: Record<NumericField, string> = {
  sciValue: '科学计算数值',
  unitValue: '单位转换数值',
  daysToAdd: '日期增减天数',
  percentValue: '百分比数值 1',
  percentTotal: '百分比数值 2',
  baseValue: '进制转换数值',
};

const basicPad = [
  ['clear', '(', ')', 'backspace'],
  ['7', '8', '9', '÷'],
  ['4', '5', '6', '×'],
  ['1', '2', '3', '-'],
  ['0', '.', '=', '+'],
];

const numberPad = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
  ['sign', '0', '.'],
];

const basePad = [
  ['A', 'B', 'C'],
  ['D', 'E', 'F'],
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
  ['0', 'clear', 'backspace'],
];

const unitRates: Record<Exclude<UnitCategory, 'temperature'>, Record<string, number>> = {
  length: { mm: 0.001, cm: 0.01, m: 1, km: 1000, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.34 },
  weight: { mg: 0.001, g: 1, kg: 1000, lb: 453.592, oz: 28.3495 },
  speed: { 'm/s': 1, 'km/h': 0.277778, mph: 0.44704, knot: 0.514444 },
  area: { 'mm²': 0.000001, 'cm²': 0.0001, 'm²': 1, 'km²': 1000000, 'ft²': 0.092903 },
};

function getAllowedBaseChars(base: string) {
  if (base === '2') return '01';
  if (base === '8') return '01234567';
  if (base === '10') return '0123456789';
  return '0123456789ABCDEF';
}

function sanitizeBaseInput(value: string, base: string) {
  const allowed = new Set(getAllowedBaseChars(base).split(''));
  return value
    .toUpperCase()
    .split('')
    .filter((char) => allowed.has(char))
    .join('');
}

const RapidTables: React.FC = () => {
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType>('basic');

  const [basicExpr, setBasicExpr] = useState('');
  const [basicResult, setBasicResult] = useState<string | null>(null);

  const [sciValue, setSciValue] = useState('');
  const [sciOperation, setSciOperation] = useState<ScientificOperation>('sin');
  const [sciResult, setSciResult] = useState<string | null>(null);

  const [unitCategory, setUnitCategory] = useState<UnitCategory>('length');
  const [unitValue, setUnitValue] = useState('');
  const [unitFrom, setUnitFrom] = useState('m');
  const [unitTo, setUnitTo] = useState('km');
  const [unitResult, setUnitResult] = useState<string | null>(null);

  const [date1, setDate1] = useState('');
  const [date2, setDate2] = useState('');
  const [dateOperation, setDateOperation] = useState<DateOperation>('diff');
  const [daysToAdd, setDaysToAdd] = useState('');
  const [dateResult, setDateResult] = useState<string | null>(null);

  const [percentValue, setPercentValue] = useState('');
  const [percentTotal, setPercentTotal] = useState('');
  const [percentOperation, setPercentOperation] = useState<PercentageOperation>('of');
  const [percentResult, setPercentResult] = useState<string | null>(null);

  const [baseValue, setBaseValue] = useState('');
  const [baseFrom, setBaseFrom] = useState('10');
  const [baseTo, setBaseTo] = useState('2');
  const [baseResult, setBaseResult] = useState<string | null>(null);

  const [activeNumberField, setActiveNumberField] = useState<NumericField>('sciValue');

  useEffect(() => {
    if (activeCalculator === 'scientific') setActiveNumberField('sciValue');
    if (activeCalculator === 'unit') setActiveNumberField('unitValue');
    if (activeCalculator === 'percentage') setActiveNumberField('percentValue');
    if (activeCalculator === 'base') setActiveNumberField('baseValue');
    if (activeCalculator === 'date' && dateOperation !== 'diff') setActiveNumberField('daysToAdd');
  }, [activeCalculator, dateOperation]);

  const setNumberFieldValue = (field: NumericField, nextValue: string) => {
    switch (field) {
      case 'sciValue':
        setSciValue(nextValue);
        break;
      case 'unitValue':
        setUnitValue(nextValue);
        break;
      case 'daysToAdd':
        setDaysToAdd(nextValue);
        break;
      case 'percentValue':
        setPercentValue(nextValue);
        break;
      case 'percentTotal':
        setPercentTotal(nextValue);
        break;
      case 'baseValue':
        setBaseValue(nextValue);
        break;
    }
  };

  const getNumberFieldValue = (field: NumericField) => {
    switch (field) {
      case 'sciValue':
        return sciValue;
      case 'unitValue':
        return unitValue;
      case 'daysToAdd':
        return daysToAdd;
      case 'percentValue':
        return percentValue;
      case 'percentTotal':
        return percentTotal;
      case 'baseValue':
        return baseValue;
    }
  };

  const calculateBasic = () => {
    try {
      const sanitized = basicExpr.replace(/[^0-9+\-*/().\s]/g, '');
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${sanitized})`)();
      setBasicResult(String(result));
    } catch {
      setBasicResult('Error: Invalid expression');
    }
  };

  const calculateScientific = () => {
    const value = parseFloat(sciValue);
    if (isNaN(value)) {
      setSciResult('Error: Invalid number');
      return;
    }

    let result: number;
    switch (sciOperation) {
      case 'sin':
        result = Math.sin(value);
        break;
      case 'cos':
        result = Math.cos(value);
        break;
      case 'tan':
        result = Math.tan(value);
        break;
      case 'sqrt':
        result = Math.sqrt(value);
        break;
      case 'log':
        result = Math.log10(value);
        break;
      case 'ln':
        result = Math.log(value);
        break;
      case 'exp':
        result = Math.exp(value);
        break;
      case 'abs':
        result = Math.abs(value);
        break;
    }

    setSciResult(result.toFixed(6));
  };

  const convertUnit = () => {
    const value = parseFloat(unitValue);
    if (isNaN(value)) {
      setUnitResult('Error: Invalid number');
      return;
    }

    if (unitCategory === 'temperature') {
      let celsius: number;
      if (unitFrom === 'C') celsius = value;
      else if (unitFrom === 'F') celsius = ((value - 32) * 5) / 9;
      else if (unitFrom === 'K') celsius = value - 273.15;
      else return;

      let result: number;
      if (unitTo === 'C') result = celsius;
      else if (unitTo === 'F') result = (celsius * 9) / 5 + 32;
      else if (unitTo === 'K') result = celsius + 273.15;
      else return;

      setUnitResult(`${result.toFixed(2)} ${unitTo}`);
      return;
    }

    const rates = unitRates[unitCategory];
    const fromRate = rates[unitFrom];
    const toRate = rates[unitTo];
    const result = (value * fromRate) / toRate;
    setUnitResult(`${result.toFixed(6)} ${unitTo}`);
  };

  const calculateDate = () => {
    try {
      if (dateOperation === 'diff' && date1 && date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2.getTime() - d1.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDateResult(`${diffDays} days`);
        return;
      }

      if ((dateOperation === 'add' || dateOperation === 'subtract') && date1 && daysToAdd) {
        const d = new Date(date1);
        const delta = parseInt(daysToAdd, 10);
        d.setDate(d.getDate() + (dateOperation === 'add' ? delta : -delta));
        setDateResult(d.toLocaleDateString());
        return;
      }

      setDateResult('Please fill in all fields');
    } catch {
      setDateResult('Error: Invalid date');
    }
  };

  const calculatePercentage = () => {
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
    } else {
      result = ((total - value) / value) * 100;
      label = `Percentage change from ${value} to ${total}:`;
    }

    setPercentResult(`${label} ${result.toFixed(2)}%`);
  };

  const convertBase = () => {
    try {
      const fromBase = parseInt(baseFrom, 10);
      const toBase = parseInt(baseTo, 10);
      const decimalValue = parseInt(baseValue, fromBase);

      if (isNaN(decimalValue)) {
        setBaseResult('Error: Invalid number for selected base');
        return;
      }

      setBaseResult(decimalValue.toString(toBase).toUpperCase());
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

  const appendBasicToken = (token: string) => {
    const mapped = token === '×' ? '*' : token === '÷' ? '/' : token;
    setBasicExpr((prev) => prev + mapped);
  };

  const updateNumberFieldWithPad = (field: NumericField, action: string) => {
    const current = getNumberFieldValue(field);

    if (action === 'clear') {
      setNumberFieldValue(field, '');
      return;
    }

    if (action === 'backspace') {
      setNumberFieldValue(field, current.slice(0, -1));
      return;
    }

    if (field === 'baseValue') {
      setNumberFieldValue(field, sanitizeBaseInput(`${current}${action}`, baseFrom));
      return;
    }

    if (action === 'sign') {
      if (!current) {
        setNumberFieldValue(field, '-');
      } else if (current.startsWith('-')) {
        setNumberFieldValue(field, current.slice(1));
      } else {
        setNumberFieldValue(field, `-${current}`);
      }
      return;
    }

    if (action === '.') {
      if (current.includes('.')) return;
      if (!current || current === '-') {
        setNumberFieldValue(field, `${current || ''}0.`);
        return;
      }
    }

    if (current === '0' && /^[0-9]$/.test(action)) {
      setNumberFieldValue(field, action);
      return;
    }

    if (current === '-0' && /^[0-9]$/.test(action)) {
      setNumberFieldValue(field, `-${action}`);
      return;
    }

    setNumberFieldValue(field, `${current}${action}`);
  };

  const renderPadButton = (key: string, onClick: () => void, disabled = false) => {
    const iconMap: Record<string, React.ReactNode> = {
      clear: 'AC',
      backspace: <Delete className="h-4 w-4" />,
      '=': <Equal className="h-4 w-4" />,
      '+': <Plus className="h-4 w-4" />,
      '-': <Minus className="h-4 w-4" />,
      '×': <X className="h-4 w-4" />,
      '÷': <Divide className="h-4 w-4" />,
      '.': <Dot className="h-4 w-4" />,
      sign: '±',
    };

    const isAction = ['clear', 'backspace', '=', '+', '-', '×', '÷', 'sign'].includes(key);

    return (
      <button
        key={key}
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={`flex h-14 items-center justify-center rounded-2xl border text-base font-semibold transition ${
          disabled
            ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-300 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-600'
            : isAction
              ? 'border-cyan-300 bg-cyan-500/10 text-cyan-700 hover:border-cyan-400 hover:bg-cyan-500/15 dark:border-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-100 dark:hover:bg-cyan-500/25'
              : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        {iconMap[key] ?? key}
      </button>
    );
  };

  const activeCalculatorMeta = calculators.find((calculator) => calculator.id === activeCalculator);

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-8 rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 dark:shadow-[0_24px_80px_rgba(2,6,23,0.5)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/60 bg-cyan-500/10 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-cyan-700 dark:border-cyan-700/50 dark:bg-cyan-500/10 dark:text-cyan-200">
              RAPID TABLES
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">
              多模式计算工作台
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              保留输入框直输，同时补上一套像手机计算器一样顺手的按键输入。基础计算走完整表达式键盘，
              其他模式会把当前聚焦字段接到数字键盘上。
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            当前模式：
            <span className="ml-2 font-semibold text-slate-900 dark:text-white">{activeCalculatorMeta?.name}</span>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {calculators.map((calculator) => (
          <button
            key={calculator.id}
            type="button"
            onClick={() => setActiveCalculator(calculator.id)}
            className={`rounded-3xl border p-4 text-left transition ${
              activeCalculator === calculator.id
                ? 'border-cyan-400 bg-gradient-to-br from-cyan-500/15 via-sky-500/10 to-indigo-500/15 text-cyan-800 shadow-[0_16px_40px_rgba(6,182,212,0.18)] dark:border-cyan-500/50 dark:text-cyan-100'
                : 'border-slate-200 bg-white/85 text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-200 dark:hover:bg-slate-900'
            }`}
          >
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-current/15 bg-current/5">
              <calculator.icon className="h-5 w-5" />
            </div>
            <div className="text-sm font-semibold">{calculator.name}</div>
            <div className="mt-1 text-xs opacity-70">{calculator.hint}</div>
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
        <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-950/80">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{activeCalculatorMeta?.name}</h2>
            <button
              type="button"
              onClick={resetAll}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white"
            >
              <RotateCcw className="h-4 w-4" />
              重置
            </button>
          </div>

          {activeCalculator === 'basic' && (
            <div className="space-y-5">
              <div className="rounded-[28px] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <div className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-400">Expression</div>
                <label className="mb-2 block text-sm font-medium text-slate-300">表达式输入</label>
                <input
                  type="text"
                  value={basicExpr}
                  onChange={(event) => setBasicExpr(event.target.value)}
                  onKeyDown={(event) => event.key === 'Enter' && calculateBasic()}
                  className="w-full border-0 bg-transparent px-0 py-2 font-mono text-3xl tracking-tight text-white outline-none placeholder:text-slate-500"
                  placeholder="例如：(2 + 3) * 4"
                />
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Result</div>
                  <div className="mt-2 min-h-[40px] text-2xl font-semibold text-cyan-300">
                    {basicResult ?? '等待计算'}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {basicPad.flat().map((key) =>
                  renderPadButton(key, () => {
                    if (key === 'clear') {
                      setBasicExpr('');
                      setBasicResult(null);
                    } else if (key === 'backspace') {
                      setBasicExpr((prev) => prev.slice(0, -1));
                    } else if (key === '=') {
                      calculateBasic();
                    } else {
                      appendBasicToken(key);
                    }
                  })
                )}
              </div>
            </div>
          )}

          {activeCalculator === 'scientific' && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">数值</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={sciValue}
                  onFocus={() => setActiveNumberField('sciValue')}
                  onChange={(event) => setSciValue(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 font-mono text-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  placeholder="输入数值"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">函数</label>
                <select
                  value={sciOperation}
                  onChange={(event) => setSciOperation(event.target.value as ScientificOperation)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
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
                type="button"
                onClick={calculateScientific}
                className="w-full rounded-2xl bg-cyan-600 px-4 py-3 font-semibold text-white transition hover:bg-cyan-700"
              >
                计算
              </button>
              {sciResult && (
                <div className="rounded-2xl border border-emerald-300 bg-emerald-500/10 p-4 dark:border-emerald-700/60">
                  <div className="text-sm text-slate-600 dark:text-slate-300">结果</div>
                  <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{sciResult}</div>
                </div>
              )}
            </div>
          )}

          {activeCalculator === 'unit' && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">类别</label>
                <select
                  value={unitCategory}
                  onChange={(event) => {
                    const nextCategory = event.target.value as UnitCategory;
                    setUnitCategory(nextCategory);
                    if (nextCategory !== 'temperature') {
                      const units = Object.keys(unitRates[nextCategory]);
                      setUnitFrom(units[0]);
                      setUnitTo(units[1]);
                    } else {
                      setUnitFrom('C');
                      setUnitTo('F');
                    }
                  }}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="length">长度</option>
                  <option value="weight">重量</option>
                  <option value="temperature">温度</option>
                  <option value="speed">速度</option>
                  <option value="area">面积</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">数值</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={unitValue}
                  onFocus={() => setActiveNumberField('unitValue')}
                  onChange={(event) => setUnitValue(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 font-mono text-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  placeholder="输入数值"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">从</label>
                  <select
                    value={unitFrom}
                    onChange={(event) => setUnitFrom(event.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    {unitCategory === 'temperature'
                      ? ['C', 'F', 'K'].map((unit) => (
                          <option key={unit} value={unit}>
                            {unit === 'C' ? '摄氏度 (°C)' : unit === 'F' ? '华氏度 (°F)' : '开尔文 (K)'}
                          </option>
                        ))
                      : Object.keys(unitRates[unitCategory]).map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">到</label>
                  <select
                    value={unitTo}
                    onChange={(event) => setUnitTo(event.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    {unitCategory === 'temperature'
                      ? ['C', 'F', 'K'].map((unit) => (
                          <option key={unit} value={unit}>
                            {unit === 'C' ? '摄氏度 (°C)' : unit === 'F' ? '华氏度 (°F)' : '开尔文 (K)'}
                          </option>
                        ))
                      : Object.keys(unitRates[unitCategory]).map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                  </select>
                </div>
              </div>
              <button
                type="button"
                onClick={convertUnit}
                className="w-full rounded-2xl bg-cyan-600 px-4 py-3 font-semibold text-white transition hover:bg-cyan-700"
              >
                转换
              </button>
              {unitResult && (
                <div className="rounded-2xl border border-emerald-300 bg-emerald-500/10 p-4 dark:border-emerald-700/60">
                  <div className="text-sm text-slate-600 dark:text-slate-300">结果</div>
                  <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{unitResult}</div>
                </div>
              )}
            </div>
          )}

          {activeCalculator === 'date' && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">操作</label>
                <select
                  value={dateOperation}
                  onChange={(event) => setDateOperation(event.target.value as DateOperation)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="diff">计算日期差</option>
                  <option value="add">日期加天数</option>
                  <option value="subtract">日期减天数</option>
                </select>
              </div>
              {dateOperation === 'diff' ? (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">日期 1</label>
                    <input
                      type="date"
                      value={date1}
                      onChange={(event) => setDate1(event.target.value)}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">日期 2</label>
                    <input
                      type="date"
                      value={date2}
                      onChange={(event) => setDate2(event.target.value)}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">日期</label>
                    <input
                      type="date"
                      value={date1}
                      onChange={(event) => setDate1(event.target.value)}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">天数</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={daysToAdd}
                      onFocus={() => setActiveNumberField('daysToAdd')}
                      onChange={(event) => setDaysToAdd(event.target.value)}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 font-mono text-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      placeholder="输入天数"
                    />
                  </div>
                </>
              )}
              <button
                type="button"
                onClick={calculateDate}
                className="w-full rounded-2xl bg-cyan-600 px-4 py-3 font-semibold text-white transition hover:bg-cyan-700"
              >
                计算
              </button>
              {dateResult && (
                <div className="rounded-2xl border border-emerald-300 bg-emerald-500/10 p-4 dark:border-emerald-700/60">
                  <div className="text-sm text-slate-600 dark:text-slate-300">结果</div>
                  <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{dateResult}</div>
                </div>
              )}
            </div>
          )}

          {activeCalculator === 'percentage' && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">操作</label>
                <select
                  value={percentOperation}
                  onChange={(event) => setPercentOperation(event.target.value as PercentageOperation)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="of">求百分比值 (X% of Y)</option>
                  <option value="is">求百分比 (X is what % of Y)</option>
                  <option value="change">求变化率 (X to Y)</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">数值 1 (X)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={percentValue}
                  onFocus={() => setActiveNumberField('percentValue')}
                  onChange={(event) => setPercentValue(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 font-mono text-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  placeholder="输入数值"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">数值 2 (Y)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={percentTotal}
                  onFocus={() => setActiveNumberField('percentTotal')}
                  onChange={(event) => setPercentTotal(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 font-mono text-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  placeholder="输入数值"
                />
              </div>
              <button
                type="button"
                onClick={calculatePercentage}
                className="w-full rounded-2xl bg-cyan-600 px-4 py-3 font-semibold text-white transition hover:bg-cyan-700"
              >
                计算
              </button>
              {percentResult && (
                <div className="rounded-2xl border border-emerald-300 bg-emerald-500/10 p-4 dark:border-emerald-700/60">
                  <div className="text-sm text-slate-600 dark:text-slate-300">结果</div>
                  <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{percentResult}</div>
                </div>
              )}
            </div>
          )}

          {activeCalculator === 'base' && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">数值</label>
                <input
                  type="text"
                  value={baseValue}
                  onFocus={() => setActiveNumberField('baseValue')}
                  onChange={(event) => setBaseValue(sanitizeBaseInput(event.target.value, baseFrom))}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 font-mono text-lg uppercase focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  placeholder="输入数值"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">从 (进制)</label>
                  <select
                    value={baseFrom}
                    onChange={(event) => {
                      const nextBase = event.target.value;
                      setBaseFrom(nextBase);
                      setBaseValue((prev) => sanitizeBaseInput(prev, nextBase));
                    }}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="2">二进制 (2)</option>
                    <option value="8">八进制 (8)</option>
                    <option value="10">十进制 (10)</option>
                    <option value="16">十六进制 (16)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">到 (进制)</label>
                  <select
                    value={baseTo}
                    onChange={(event) => setBaseTo(event.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="2">二进制 (2)</option>
                    <option value="8">八进制 (8)</option>
                    <option value="10">十进制 (10)</option>
                    <option value="16">十六进制 (16)</option>
                  </select>
                </div>
              </div>
              <button
                type="button"
                onClick={convertBase}
                className="w-full rounded-2xl bg-cyan-600 px-4 py-3 font-semibold text-white transition hover:bg-cyan-700"
              >
                转换
              </button>
              {baseResult && (
                <div className="rounded-2xl border border-emerald-300 bg-emerald-500/10 p-4 dark:border-emerald-700/60">
                  <div className="text-sm text-slate-600 dark:text-slate-300">结果</div>
                  <div className="font-mono text-2xl font-bold text-emerald-700 dark:text-emerald-300">{baseResult}</div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {activeCalculator !== 'basic' && activeCalculator !== 'date' && (
            <div className="rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-950/80">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">按键输入</div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    当前输入目标：{fieldLabels[activeNumberField]}
                  </div>
                </div>
                <div className="rounded-full border border-cyan-300/60 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-700 dark:border-cyan-700/60 dark:bg-cyan-500/10 dark:text-cyan-200">
                  {getNumberFieldValue(activeNumberField) || '未输入'}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {(activeCalculator === 'base' ? basePad : numberPad).flat().map((key) => {
                  const baseAllowed =
                    activeCalculator !== 'base' ||
                    key === 'clear' ||
                    key === 'backspace' ||
                    getAllowedBaseChars(baseFrom).includes(key);

                  return renderPadButton(
                    key,
                    () => updateNumberFieldWithPad(activeNumberField, key),
                    !baseAllowed
                  );
                })}
              </div>
            </div>
          )}

          {activeCalculator === 'date' && dateOperation !== 'diff' && (
            <div className="rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-950/80">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">天数键盘</div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    保留手输，也可以直接点按键填充天数。
                  </div>
                </div>
                <div className="rounded-full border border-cyan-300/60 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-700 dark:border-cyan-700/60 dark:bg-cyan-500/10 dark:text-cyan-200">
                  {daysToAdd || '未输入'}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {numberPad.flat().map((key) =>
                  renderPadButton(key, () => updateNumberFieldWithPad('daysToAdd', key))
                )}
              </div>
            </div>
          )}

          <div className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-950/60">
            <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">常用公式参考</h3>
            <div className="grid gap-4 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <strong className="text-slate-900 dark:text-white">温度转换</strong>
                <ul className="mt-2 space-y-1">
                  <li>°C → °F: (°C × 9/5) + 32</li>
                  <li>°F → °C: (°F - 32) × 5/9</li>
                  <li>K → °C: K - 273.15</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <strong className="text-slate-900 dark:text-white">常用单位</strong>
                <ul className="mt-2 space-y-1">
                  <li>1 英里 = 1.609 公里</li>
                  <li>1 英尺 = 0.3048 米</li>
                  <li>1 磅 = 0.4536 千克</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RapidTables;
