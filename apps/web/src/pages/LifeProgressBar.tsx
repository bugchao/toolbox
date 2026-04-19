import { useState, useEffect } from 'react';
import { Calendar, Heart, Clock, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LifeStats {
  age: number;
  lifeExpectancy: number;
  yearsLived: number;
  yearsRemaining: number;
  daysLived: number;
  daysRemaining: number;
  weeksLived: number;
  weeksRemaining: number;
  percentage: number;
}

export default function LifeProgressBar() {
  const { t } = useTranslation();
  const [birthDate, setBirthDate] = useState('');
  const [lifeExpectancy, setLifeExpectancy] = useState(80);
  const [stats, setStats] = useState<LifeStats | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('lifeProgressData');
    if (saved) {
      const data = JSON.parse(saved);
      setBirthDate(data.birthDate);
      setLifeExpectancy(data.lifeExpectancy);
    }
  }, []);

  const calculateStats = () => {
    if (!birthDate) return;

    const birth = new Date(birthDate);
    const now = new Date();
    const ageMs = now.getTime() - birth.getTime();
    const age = ageMs / (1000 * 60 * 60 * 24 * 365.25);

    const yearsLived = age;
    const yearsRemaining = Math.max(0, lifeExpectancy - age);
    const daysLived = Math.floor(ageMs / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.floor(yearsRemaining * 365.25);
    const weeksLived = Math.floor(daysLived / 7);
    const weeksRemaining = Math.floor(daysRemaining / 7);
    const percentage = Math.min(100, (age / lifeExpectancy) * 100);

    const newStats: LifeStats = {
      age: Math.floor(age),
      lifeExpectancy,
      yearsLived,
      yearsRemaining,
      daysLived,
      daysRemaining,
      weeksLived,
      weeksRemaining,
      percentage
    };

    setStats(newStats);
    localStorage.setItem('lifeProgressData', JSON.stringify({ birthDate, lifeExpectancy }));
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 30) return 'bg-green-500';
    if (percentage < 60) return 'bg-yellow-500';
    if (percentage < 80) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getMotivationalQuote = (percentage: number) => {
    if (percentage < 25) return '人生才刚刚开始，未来充满无限可能！';
    if (percentage < 50) return '正值人生黄金时期，把握当下，创造精彩！';
    if (percentage < 75) return '人生过半，经验丰富，智慧增长！';
    return '时光珍贵，珍惜每一天，活出精彩！';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-900 mb-2">⏳ 人生进度条</h1>
          <p className="text-purple-700">可视化你的人生时间，珍惜每一刻</p>
        </div>

        {/* 输入区域 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                <Calendar className="inline w-5 h-5 mr-2" />
                出生日期
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                <Heart className="inline w-5 h-5 mr-2" />
                预期寿命（岁）
              </label>
              <input
                type="number"
                value={lifeExpectancy}
                onChange={(e) => setLifeExpectancy(Number(e.target.value))}
                min="1"
                max="150"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={calculateStats}
            disabled={!birthDate}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
          >
            计算人生进度
          </button>
        </div>

        {/* 统计结果 */}
        {stats && (
          <div className="space-y-6">
            {/* 主进度条 */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl font-bold text-gray-800">人生进度</span>
                <span className="text-3xl font-bold text-purple-600">
                  {stats.percentage.toFixed(2)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                <div
                  className={`h-full ${getProgressColor(stats.percentage)} transition-all duration-1000 flex items-center justify-end pr-4`}
                  style={{ width: `${stats.percentage}%` }}
                >
                  <span className="text-white font-bold text-sm">
                    {stats.age} 岁
                  </span>
                </div>
              </div>
              <p className="text-center text-gray-600 mt-4 text-lg">
                {getMotivationalQuote(stats.percentage)}
              </p>
            </div>

            {/* 详细统计 */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center mb-4">
                  <Clock className="w-6 h-6 text-blue-600 mr-2" />
                  <h3 className="text-xl font-bold text-gray-800">已度过</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">年</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {stats.yearsLived.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">天</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {stats.daysLived.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">周</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {stats.weeksLived.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center mb-4">
                  <TrendingUp className="w-6 h-6 text-green-600 mr-2" />
                  <h3 className="text-xl font-bold text-gray-800">还剩余</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">年</span>
                    <span className="text-2xl font-bold text-green-600">
                      {stats.yearsRemaining.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">天</span>
                    <span className="text-2xl font-bold text-green-600">
                      {stats.daysRemaining.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">周</span>
                    <span className="text-2xl font-bold text-green-600">
                      {stats.weeksRemaining.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 人生格子 */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">人生格子图（每格代表一年）</h3>
              <div className="grid grid-cols-10 gap-2">
                {Array.from({ length: stats.lifeExpectancy }, (_, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded ${
                      i < stats.age
                        ? 'bg-purple-500'
                        : 'bg-gray-200'
                    }`}
                    title={`${i + 1} 岁`}
                  />
                ))}
              </div>
              <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <span className="text-gray-600">已度过</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <span className="text-gray-600">未来</span>
                </div>
              </div>
            </div>

            {/* 励志语录 */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-xl p-6 text-white text-center">
              <p className="text-xl font-medium mb-2">💡 时间提醒</p>
              <p className="text-lg">
                "时间是最公平的资源，每个人每天都只有24小时。<br />
                珍惜当下，活出精彩，让每一天都有意义！"
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
