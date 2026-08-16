import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('bmiCalculator');
  const [height, setHeight] = useState<string>('175');
  const [weight, setWeight] = useState<string>('65');
  const [age, setAge] = useState<string>('25');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activityLevel, setActivityLevel] = useState<number>(1.2);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');

  const activityLevels = [
    { value: 1.2, label: t('activityLevelSedentaryLabel'), description: t('activityLevelSedentaryDesc') },
    { value: 1.375, label: t('activityLevelLightLabel'), description: t('activityLevelLightDesc') },
    { value: 1.55, label: t('activityLevelModerateLabel'), description: t('activityLevelModerateDesc') },
    { value: 1.725, label: t('activityLevelHighLabel'), description: t('activityLevelHighDesc') },
    { value: 1.9, label: t('activityLevelVeryHighLabel'), description: t('activityLevelVeryHighDesc') },
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
      bmiCategory = t('bmiCategoryUnderweight');
      bmiColor = 'text-blue-600';
    } else if (bmi < 24) {
      bmiCategory = t('bmiCategoryNormal');
      bmiColor = 'text-green-600';
    } else if (bmi < 28) {
      bmiCategory = t('bmiCategoryOverweight');
      bmiColor = 'text-yellow-600';
    } else {
      bmiCategory = t('bmiCategoryObese');
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
      healthTips.push(t('healthTipUnderweight1'));
      healthTips.push(t('healthTipUnderweight2'));
      healthTips.push(t('healthTipUnderweight3'));
    } else if (bmi < 24) {
      healthTips.push(t('healthTipNormal1'));
      healthTips.push(t('healthTipNormal2'));
      healthTips.push(t('healthTipNormal3'));
    } else if (bmi < 28) {
      healthTips.push(t('healthTipOverweight1'));
      healthTips.push(t('healthTipOverweight2'));
      healthTips.push(t('healthTipOverweight3'));
    } else {
      healthTips.push(t('healthTipObese1'));
      healthTips.push(t('healthTipObese2'));
      healthTips.push(t('healthTipObese3'));
      healthTips.push(t('healthTipObese4'));
    }

    if (parseInt(age) >= 40) {
      healthTips.push(t('healthTipAge'));
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
    height: unitSystem === 'metric' ? t('unitCm') : t('unitInch'),
    weight: unitSystem === 'metric' ? t('unitKg') : t('unitLb'),
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Calculator className="h-8 w-8 text-indigo-600" />
          {t('title')}
        </h1>
        <p className="text-ink-muted">
          {t('description')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 输入表单 */}
        <div className="bg-surface rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-600" />
            {t('basicInfo')}
          </h2>

          {/* 单位切换 */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-medium text-ink">{t('unitSystemLabel')}</span>
            <div className="flex border border-edge-strong rounded-md overflow-hidden">
              <button
                onClick={() => setUnitSystem('metric')}
                className={`px-4 py-1.5 text-sm ${
                  unitSystem === 'metric'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-surface text-ink hover:bg-surface-muted'
                }`}
              >
                {t('unitMetric')}
              </button>
              <button
                onClick={() => setUnitSystem('imperial')}
                className={`px-4 py-1.5 text-sm ${
                  unitSystem === 'imperial'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-surface text-ink hover:bg-surface-muted'
                }`}
              >
                {t('unitImperial')}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1 flex items-center gap-1">
                <Ruler className="h-4 w-4" />
                {t('heightLabel', { unit: unitLabels.height })}
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-3 py-2 border border-edge-strong rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="50"
                max="250"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1 flex items-center gap-1">
                <Scale className="h-4 w-4" />
                {t('weightLabel', { unit: unitLabels.weight })}
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3 py-2 border border-edge-strong rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="20"
                max="300"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                {t('ageLabel')}
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 border border-edge-strong rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="1"
                max="120"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                {t('genderLabel')}
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="male"
                    checked={gender === 'male'}
                    onChange={(e) => setGender(e.target.value as 'male')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-edge-strong"
                  />
                  <span>{t('male')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="female"
                    checked={gender === 'female'}
                    onChange={(e) => setGender(e.target.value as 'female')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-edge-strong"
                  />
                  <span>{t('female')}</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2 flex items-center gap-1">
                <Activity className="h-4 w-4" />
                {t('activityLevelLabel')}
              </label>
              <div className="space-y-2">
                {activityLevels.map((level) => (
                  <label
                    key={level.value}
                    className={`flex items-start gap-2 p-3 border rounded-md cursor-pointer transition-colors ${
                      activityLevel === level.value
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                        : 'border-edge-strong hover:bg-surface-muted'
                    }`}
                  >
                    <input
                      type="radio"
                      value={level.value}
                      checked={activityLevel === level.value}
                      onChange={(e) => setActivityLevel(parseFloat(e.target.value))}
                      className="h-4 w-4 mt-1 text-indigo-600 focus:ring-indigo-500 border-edge-strong"
                    />
                    <div>
                      <div className="font-medium text-sm">{level.label}</div>
                      <div className="text-xs text-ink-muted">{level.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full bg-surface-inset hover:bg-gray-200 dark:hover:bg-gray-600 text-ink font-medium py-2 px-4 rounded-md transition-colors"
            >
              {t('reset')}
            </button>
          </div>
        </div>

        {/* 结果展示 */}
        <div className="bg-surface rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            {t('healthAssessment')}
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
                <div className="text-sm text-ink-muted">
                  {t('normalRange')}
                </div>
              </div>

              {/* 健康数据卡片 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-muted p-4 rounded-lg">
                  <div className="text-sm text-ink-muted mb-1">{t('idealWeightRange')}</div>
                  <div className="text-lg font-semibold">
                    {healthData.idealWeightRange[0]} - {healthData.idealWeightRange[1]} {unitLabels.weight}
                  </div>
                </div>
                <div className="bg-surface-muted p-4 rounded-lg">
                  <div className="text-sm text-ink-muted mb-1">{t('bmrLabel')}</div>
                  <div className="text-lg font-semibold">
                    {healthData.bmr} {t('kcalPerDay')}
                  </div>
                </div>
                <div className="bg-surface-muted p-4 rounded-lg col-span-2">
                  <div className="text-sm text-ink-muted mb-1">{t('tdeeLabel')}</div>
                  <div className="text-lg font-semibold">
                    {healthData.tdee} {t('kcalPerDay')}
                  </div>
                  <div className="text-xs text-ink-muted mt-1">
                    {t('tdeeHint')}
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
              <div className="flex justify-between text-xs text-ink-muted">
                <span>{t('scaleUnderweight')}</span>
                <span>{t('scaleNormal')}</span>
                <span>{t('scaleOverweight')}</span>
                <span>{t('scaleObese')}</span>
              </div>

              {/* 健康建议 */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  {t('healthAdvice')}
                </h3>
                <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-400">
                  {healthData.healthTips.map((tip, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="text-blue-500">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 健康小知识 */}
              <div className="border-t border-edge pt-4">
                <h3 className="text-sm font-medium text-ink mb-2">{t('healthFactsTitle')}</h3>
                <div className="text-xs text-ink-muted space-y-1">
                  <p>• {t('healthFact1')}</p>
                  <p>• {t('healthFact2')}</p>
                  <p>• {t('healthFact3')}</p>
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

