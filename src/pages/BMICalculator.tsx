import React, { useState, useEffect } from 'react';
import { Calculator, Heart, Activity, Scale, Ruler, User } from 'lucide-react';

interface HealthData {
  height: number; // cm
  weight: number; // kg
  age: number;
  gender: 'male' | 'female';
  activityLevel: number; // 1.2 - 1.9
  bmi: number;
  bmiCategory: string;
  bmiColor: string;
  idealWeightRange: [number, number];
  bmr: number; // 基础代谢率
  tdee: number; // 每日总消耗
  healthTips: string[];
}

const BMICalculator: React.FC = () => {
  const [height, setHeight] = useState<string>('175');
  const [weight, setWeight] = useState<string>('65');
  const [age, setAge] = useState<string>('25');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activityLevel, setActivityLevel] = useState<number>(1.2);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');

  const activityLevels = [
    { value: 1.2, label: '久坐不动', description: '几乎不运动，办公室工作' },
    { value: 1.375, label: '轻度活动', description: '每周1-3次轻度运动' },
    { value: 1.55, label: '中度活动', description: '每周3-5次中等强度运动' },
    { value: 1.725, label: '高度活动', description: '每周6-7次高强度运动' },
    { value: 1.9, label: '极高活动', description: '体力工作+每日高强度运动' },
  ];

  const calculateBMI = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    const a = parseInt(age);

    if (!h || !w || !a || h <= 0 || w <= 0 || a <= 0) {
      return;
    }

    // 单位转换
    const heightInM = unitSystem === 'metric' ? h / 100 : h * 0.0254;
    const weightInKg = unitSystem === 'metric' ? w : w * 0.45359237;

    // 计算BMI
    const bmi = weightInKg / (heightInM * heightInM);

    // BMI分类
    let bmiCategory: string;
    let bmiColor: string;
    
    if (bmi < 18.5) {
      bmiCategory = '体重偏轻';
      bmiColor = 'text-blue-600';
    } else if (bmi < 24) {
      bmiCategory = '体重正常';
      bmiColor = 'text-green-600';
    } else if (bmi < 28) {
      bmiCategory = '体重超重';
      bmiColor = 'text-yellow-600';
    } else {
      bmiCategory = '肥胖';
      bmiColor = 'text-red-600';
    }

    // 理想体重范围
    const idealMinWeight = 18.5 * heightInM * heightInM;
    const idealMaxWeight = 24 * heightInM * heightInM;
    const idealWeightRange: [number, number] = unitSystem === 'metric' 
      ? [Math.round(idealMinWeight), Math.round(idealMaxWeight)]
      : [Math.round(idealMinWeight / 0.45359237), Math.round(idealMaxWeight / 0.45359237)];

    // 计算基础代谢率 (Mifflin-St Jeor公式)
    let bmr: number;
    if (gender === 'male') {
      bmr = 10 * weightInKg + 6.25 * h - 5 * a + 5;
    } else {
      bmr = 10 * weightInKg + 6.25 * h - 5 * a - 161;
    }

    // 计算每日总消耗
    const tdee = bmr * activityLevel;

    // 健康建议
    const healthTips: string[] = [];
    
    if (bmi < 18.5) {
      healthTips.push('建议适当增加营养摄入，保证优质蛋白质和热量的供应');
      healthTips.push('可以进行适量的力量训练，增加肌肉量');
      healthTips.push('保持规律的作息，避免过度劳累');
    } else if (bmi < 24) {
      healthTips.push('🎉 恭喜！你的体重在正常范围内，请继续保持');
      healthTips.push('坚持均衡饮食，多吃蔬菜水果，少吃高油高盐食物');
      healthTips.push('保持规律的运动习惯，每周至少150分钟中等强度运动');
    } else if (bmi < 28) {
      healthTips.push('建议适当控制饮食，减少高热量食物摄入');
      healthTips.push('增加有氧运动，每周4-5次，每次30分钟以上');
      healthTips.push('保证充足睡眠，避免熬夜，熬夜会影响新陈代谢');
    } else {
      healthTips.push('建议在医生或营养师指导下制定科学的减重计划');
      healthTips.push('控制每日总热量摄入，逐步减重，每月减重2-4斤为宜');
      healthTips.push('运动要循序渐进，避免关节损伤，游泳、快走都是很好的选择');
      healthTips.push('定期体检，关注血压、血糖、血脂等指标');
    }

    if (parseInt(age) >= 40) {
      healthTips.push('建议定期进行体检，关注心血管健康');
    }

    setHealthData({
      height: h,
      weight: w,
      age: a,
      gender,
      activityLevel,
      bmi: parseFloat(bmi.toFixed(1)),
      bmiCategory,
      bmiColor,
      idealWeightRange,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      healthTips,
    });
  };

  useEffect(() => {
    calculateBMI();
  }, [height, weight, age, gender, activityLevel, unitSystem]);

  const handleReset = () => {
    setHeight('175');
    setWeight('65');
    setAge('25');
    setGender('male');
    setActivityLevel(1.2);
  };

  const unitLabels = {
    height: unitSystem === 'metric' ? '厘米' : '英寸',
    weight: unitSystem === 'metric' ? '公斤' : '磅',
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Calculator className="h-8 w-8 text-indigo-600" />
          BMI健康计算器
        </h1>
        <p className="text-gray-600">
          计算身体质量指数，了解健康状况，获取个性化建议
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 输入表单 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-600" />
            基本信息
          </h2>

          {/* 单位切换 */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-medium text-gray-700">单位制</span>
            <div className="flex border border-gray-300 rounded-md overflow-hidden">
              <button
                onClick={() => setUnitSystem('metric')}
                className={`px-4 py-1.5 text-sm ${
                  unitSystem === 'metric'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                公制
              </button>
              <button
                onClick={() => setUnitSystem('imperial')}
                className={`px-4 py-1.5 text-sm ${
                  unitSystem === 'imperial'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                英制
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Ruler className="h-4 w-4" />
                身高 ({unitLabels.height})
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="50"
                max="250"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Scale className="h-4 w-4" />
                体重 ({unitLabels.weight})
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="20"
                max="300"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                年龄
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="1"
                max="120"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                性别
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="male"
                    checked={gender === 'male'}
                    onChange={(e) => setGender(e.target.value as 'male')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span>男</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="female"
                    checked={gender === 'female'}
                    onChange={(e) => setGender(e.target.value as 'female')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span>女</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Activity className="h-4 w-4" />
                活动水平
              </label>
              <div className="space-y-2">
                {activityLevels.map((level) => (
                  <label
                    key={level.value}
                    className={`flex items-start gap-2 p-3 border rounded-md cursor-pointer transition-colors ${
                      activityLevel === level.value
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      value={level.value}
                      checked={activityLevel === level.value}
                      onChange={(e) => setActivityLevel(parseFloat(e.target.value))}
                      className="h-4 w-4 mt-1 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <div>
                      <div className="font-medium text-sm">{level.label}</div>
                      <div className="text-xs text-gray-500">{level.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
            >
              重置
            </button>
          </div>
        </div>

        {/* 结果展示 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            健康评估
          </h2>

          {healthData && (
            <div className="space-y-6">
              {/* BMI 结果 */}
              <div className="text-center">
                <div className="text-6xl font-bold mb-2">
                  <span className={healthData.bmiColor}>{healthData.bmi}</span>
                </div>
                <div className={`text-2xl font-semibold mb-1 ${healthData.bmiColor}`}>
                  {healthData.bmiCategory}
                </div>
                <div className="text-sm text-gray-500">
                  正常范围: 18.5 - 23.9
                </div>
              </div>

              {/* 健康数据卡片 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">理想体重范围</div>
                  <div className="text-lg font-semibold">
                    {healthData.idealWeightRange[0]} - {healthData.idealWeightRange[1]} {unitLabels.weight}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">基础代谢率 (BMR)</div>
                  <div className="text-lg font-semibold">
                    {healthData.bmr} 千卡/天
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg col-span-2">
                  <div className="text-sm text-gray-500 mb-1">每日总热量消耗 (TDEE)</div>
                  <div className="text-lg font-semibold">
                    {healthData.tdee} 千卡/天
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    维持当前体重每日需要摄入的热量
                  </div>
                </div>
              </div>

              {/* BMI 参考标尺 */}
              <div className="relative h-4 bg-gradient-to-r from-blue-500 via-green-500 via-yellow-500 to-red-500 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 h-full w-1 bg-white shadow-md transform -translate-x-1/2"
                  style={{ 
                    left: `${Math.min(100, Math.max(0, (healthData.bmi - 10) / 40 * 100))}%` 
                  }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-0.5 rounded text-xs font-semibold shadow">
                    {healthData.bmi}
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>偏瘦</span>
                <span>正常</span>
                <span>超重</span>
                <span>肥胖</span>
              </div>

              {/* 健康建议 */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  健康建议
                </h3>
                <ul className="space-y-1 text-sm text-blue-700">
                  {healthData.healthTips.map((tip, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="text-blue-500">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 健康小知识 */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">健康小知识</h3>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>• BMI（身体质量指数）是国际通用的衡量人体胖瘦程度以及是否健康的标准</p>
                  <p>• 本计算器仅供参考，具体健康状况请咨询专业医生</p>
                  <p>• 建议每周至少进行150分钟中等强度有氧运动，保持健康生活方式</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BMICalculator;

