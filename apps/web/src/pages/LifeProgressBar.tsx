import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Heart, Clock, TrendingUp } from 'lucide-react';

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
  const { t } = useTranslation('lifeProgressBar');
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
    if (percentage < 25) return t('quote25');
    if (percentage < 50) return t('quote50');
    if (percentage < 75) return t('quote75');
    return t('quote100');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-900 dark:text-purple-300 mb-2">{t('title')}</h1>
          <p className="text-purple-700 dark:text-purple-400">{t('subtitle')}</p>
        </div>

        {/* 输入区域 */}
        <div className="bg-surface rounded-2xl shadow-xl p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-ink font-medium mb-2">
                <Calendar className="inline w-5 h-5 mr-2" />
                {t('birthDateLabel')}
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-4 py-2 border border-edge-strong rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-ink font-medium mb-2">
                <Heart className="inline w-5 h-5 mr-2" />
                {t('lifeExpectancyLabel')}
              </label>
              <input
                type="number"
                value={lifeExpectancy}
                onChange={(e) => setLifeExpectancy(Number(e.target.value))}
                min="1"
                max="150"
                className="w-full px-4 py-2 border border-edge-strong rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={calculateStats}
            disabled={!birthDate}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            {t('calculateButton')}
          </button>
        </div>

        {/* 统计结果 */}
        {stats && (
          <div className="space-y-6">
            {/* 主进度条 */}
            <div className="bg-surface rounded-2xl shadow-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl font-bold text-ink">{t('progressLabel')}</span>
                <span className="text-3xl font-bold text-purple-600">
                  {stats.percentage.toFixed(2)}%
                </span>
              </div>
              <div className="w-full bg-surface-inset rounded-full h-8 overflow-hidden">
                <div
                  className={`h-full ${getProgressColor(stats.percentage)} transition-all duration-1000 flex items-center justify-end pr-4`}
                  style={{ width: `${stats.percentage}%` }}
                >
                  <span className="text-white font-bold text-sm">
                    {t('ageSuffix', { age: stats.age })}
                  </span>
                </div>
              </div>
              <p className="text-center text-ink-muted mt-4 text-lg">
                {getMotivationalQuote(stats.percentage)}
              </p>
            </div>

            {/* 详细统计 */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-surface rounded-2xl shadow-xl p-6">
                <div className="flex items-center mb-4">
                  <Clock className="w-6 h-6 text-blue-600 mr-2" />
                  <h3 className="text-xl font-bold text-ink">{t('lived')}</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-ink-muted">{t('yearsUnit')}</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {stats.yearsLived.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-ink-muted">{t('daysUnit')}</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {stats.daysLived.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-ink-muted">{t('weeksUnit')}</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {stats.weeksLived.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-surface rounded-2xl shadow-xl p-6">
                <div className="flex items-center mb-4">
                  <TrendingUp className="w-6 h-6 text-green-600 mr-2" />
                  <h3 className="text-xl font-bold text-ink">{t('remaining')}</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-ink-muted">{t('yearsUnit')}</span>
                    <span className="text-2xl font-bold text-green-600">
                      {stats.yearsRemaining.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-ink-muted">{t('daysUnit')}</span>
                    <span className="text-2xl font-bold text-green-600">
                      {stats.daysRemaining.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-ink-muted">{t('weeksUnit')}</span>
                    <span className="text-2xl font-bold text-green-600">
                      {stats.weeksRemaining.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 人生格子 */}
            <div className="bg-surface rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-ink mb-4">{t('gridTitle')}</h3>
              <div className="grid grid-cols-10 gap-2">
                {Array.from({ length: stats.lifeExpectancy }, (_, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded ${
                      i < stats.age
                        ? 'bg-purple-500'
                        : 'bg-surface-inset'
                    }`}
                    title={t('yearTitle', { year: i + 1 })}
                  />
                ))}
              </div>
              <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <span className="text-ink-muted">{t('lived')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-surface-inset rounded"></div>
                  <span className="text-ink-muted">{t('future')}</span>
                </div>
              </div>
            </div>

            {/* 励志语录 */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-xl p-6 text-white text-center">
              <p className="text-xl font-medium mb-2">{t('reminderTitle')}</p>
              <p className="text-lg">
                "{t('reminderLine1')}<br />
                {t('reminderLine2')}"
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
