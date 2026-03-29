import React, { useState } from 'react';
import { Calculator, Activity, Target, Info } from 'lucide-react';

type Gender = 'male' | 'female';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
type Goal = 'cut' | 'maintain' | 'bulk';

const CalorieCalculator: React.FC = () => {
  const [gender, setGender] = useState<Gender>('male');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [goal, setGoal] = useState<Goal>('maintain');
  const [results, setResults] = useState<{
    bmr: number;
    tdee: number;
    targetCalories: number;
    macros: { protein: number; carbs: number; fat: number };
  } | null>(null);

  const activityMultipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const activityLabels: Record<ActivityLevel, string> = {
    sedentary: '久坐不动 (几乎不运动)',
    light: '轻度活动 (每周 1-3 天运动)',
    moderate: '中度活动 (每周 3-5 天运动)',
    active: '活跃 (每周 6-7 天运动)',
    very_active: '非常活跃 (体力工作 + 每天运动)',
  };

  const calculateCalories = () => {
    const ageNum = parseInt(age);
    let heightCm = parseFloat(height);
    let weightKg = parseFloat(weight);

    if (!ageNum || !heightCm || !weightKg || isNaN(ageNum) || isNaN(heightCm) || isNaN(weightKg)) {
      alert('请填写所有字段');
      return;
    }

    // Convert units
    if (heightUnit === 'ft') {
      heightCm = heightCm * 30.48;
    }
    if (weightUnit === 'lb') {
      weightKg = weightKg * 0.453592;
    }

    // Mifflin-St Jeor Equation for BMR
    let bmr: number;
    if (gender === 'male') {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageNum + 5;
    } else {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageNum - 161;
    }

    // Calculate TDEE
    const tdee = bmr * activityMultipliers[activityLevel];

    // Adjust for goal
    let targetCalories: number;
    if (goal === 'cut') {
      targetCalories = tdee - 500; // 500 calorie deficit
    } else if (goal === 'bulk') {
      targetCalories = tdee + 500; // 500 calorie surplus
    } else {
      targetCalories = tdee;
    }

    // Calculate macros (40% carbs, 30% protein, 30% fat)
    const macros = {
      protein: Math.round((targetCalories * 0.3) / 4),
      carbs: Math.round((targetCalories * 0.4) / 4),
      fat: Math.round((targetCalories * 0.3) / 9),
    };

    setResults({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories: Math.round(targetCalories),
      macros,
    });
  };

  const reset = () => {
    setAge('');
    setHeight('');
    setWeight('');
    setActivityLevel('moderate');
    setGoal('maintain');
    setResults(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">卡路里计算器</h1>
        <p className="text-gray-600">科学计算每日所需卡路里和宏量营养素，支持减脂/维持/增肌目标</p>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-blue-500" />
          基本信息
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Gender */}
          <div>
            <label className="block text-sm font-medium mb-1">性别</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  checked={gender === 'male'}
                  onChange={() => setGender('male')}
                  className="w-4 h-4"
                />
                <span>男</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  checked={gender === 'female'}
                  onChange={() => setGender('female')}
                  className="w-4 h-4"
                />
                <span>女</span>
              </label>
            </div>
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-medium mb-1">年龄</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="岁"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Height */}
          <div>
            <label className="block text-sm font-medium mb-1">身高</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={heightUnit === 'cm' ? 'cm' : 'ft'}
              />
              <select
                value={heightUnit}
                onChange={(e) => setHeightUnit(e.target.value as 'cm' | 'ft')}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="cm">cm</option>
                <option value="ft">ft</option>
              </select>
            </div>
          </div>

          {/* Weight */}
          <div>
            <label className="block text-sm font-medium mb-1">体重</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={weightUnit === 'kg' ? 'kg' : 'lb'}
              />
              <select
                value={weightUnit}
                onChange={(e) => setWeightUnit(e.target.value as 'kg' | 'lb')}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-500" />
            活动水平
          </label>
          <select
            value={activityLevel}
            onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.entries(activityLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1 flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-500" />
            目标
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setGoal('cut')}
              className={`px-4 py-3 rounded-lg border-2 transition ${
                goal === 'cut'
                  ? 'border-red-500 bg-red-50 text-red-600'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold">减脂</div>
              <div className="text-xs text-gray-500">-500 卡/天</div>
            </button>
            <button
              onClick={() => setGoal('maintain')}
              className={`px-4 py-3 rounded-lg border-2 transition ${
                goal === 'maintain'
                  ? 'border-green-500 bg-green-50 text-green-600'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold">维持</div>
              <div className="text-xs text-gray-500">保持现状</div>
            </button>
            <button
              onClick={() => setGoal('bulk')}
              className={`px-4 py-3 rounded-lg border-2 transition ${
                goal === 'bulk'
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold">增肌</div>
              <div className="text-xs text-gray-500">+500 卡/天</div>
            </button>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={calculateCalories}
            className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
          >
            计算
          </button>
          <button
            onClick={reset}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            重置
          </button>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Main Results */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
              <div className="text-sm text-blue-600 font-medium mb-1">基础代谢率 (BMR)</div>
              <div className="text-3xl font-bold text-blue-700">{results.bmr}</div>
              <div className="text-xs text-blue-500 mt-1">卡路里/天</div>
              <div className="text-xs text-gray-600 mt-2">静息状态下身体消耗的能量</div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
              <div className="text-sm text-green-600 font-medium mb-1">每日总消耗 (TDEE)</div>
              <div className="text-3xl font-bold text-green-700">{results.tdee}</div>
              <div className="text-xs text-green-500 mt-1">卡路里/天</div>
              <div className="text-xs text-gray-600 mt-2">包含日常活动和运动</div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
              <div className="text-sm text-purple-600 font-medium mb-1">目标摄入量</div>
              <div className="text-3xl font-bold text-purple-700">{results.targetCalories}</div>
              <div className="text-xs text-purple-500 mt-1">卡路里/天</div>
              <div className="text-xs text-gray-600 mt-2">
                {goal === 'cut' && '建议每周减重约 0.5kg'}
                {goal === 'maintain' && '保持当前体重'}
                {goal === 'bulk' && '建议每周增重约 0.25kg'}
              </div>
            </div>
          </div>

          {/* Macros */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">宏量营养素分配</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{results.macros.protein}g</div>
                <div className="text-sm text-red-500">蛋白质</div>
                <div className="text-xs text-gray-500 mt-1">30% 热量</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{results.macros.carbs}g</div>
                <div className="text-sm text-yellow-500">碳水化合物</div>
                <div className="text-xs text-gray-500 mt-1">40% 热量</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{results.macros.fat}g</div>
                <div className="text-sm text-blue-500">脂肪</div>
                <div className="text-xs text-gray-500 mt-1">30% 热量</div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              健康建议
            </h4>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>安全减重速度：每周 0.5-1kg，过快可能导致肌肉流失</li>
              <li>增肌期建议配合力量训练，最大化肌肉增长</li>
              <li>保证充足蛋白质摄入（1.6-2.2g/kg 体重）</li>
              <li>多喝水，每天至少 2L</li>
              <li>保证 7-9 小时睡眠，有助于代谢和恢复</li>
              <li>此计算器使用 Mifflin-St Jeor 公式，误差约±10%</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalorieCalculator;
