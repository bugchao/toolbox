import React, { useState, useEffect } from 'react';

interface StretchExercise {
  name: string;
  duration: string;
  description: string;
}

const STRETCH_EXERCISES: StretchExercise[] = [
  { name: '颈部拉伸', duration: '30秒', description: '缓慢转动头部，左右各15秒' },
  { name: '肩部放松', duration: '30秒', description: '双肩向后画圈10次，向前画圈10次' },
  { name: '腰部扭转', duration: '30秒', description: '坐姿扭腰，左右各15秒' },
  { name: '手腕活动', duration: '20秒', description: '双手交叉，手腕画圈' },
  { name: '腿部拉伸', duration: '40秒', description: '站立，单腿后抬，左右各20秒' },
  { name: '深呼吸', duration: '30秒', description: '深吸气5秒，呼气5秒，重复3次' },
];

export default function SedentaryReminder() {
  const [interval, setInterval] = useState(45);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(interval * 60);
  const [totalSessions, setTotalSessions] = useState(0);
  const [todayBreaks, setTodayBreaks] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          showNotification();
          setTodayBreaks((b) => b + 1);
          return interval * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isActive, interval]);

  const showNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('🪑 该起来活动啦！', {
        body: '你已经坐了很久了，起来走走，做做拉伸吧！',
        icon: '🪑',
      });
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const startReminder = async () => {
    await requestNotificationPermission();
    setIsActive(true);
    setTimeLeft(interval * 60);
    setTotalSessions((s) => s + 1);
  };

  const stopReminder = () => {
    setIsActive(false);
    setTimeLeft(interval * 60);
  };

  const resetToday = () => {
    setTodayBreaks(0);
    setTotalSessions(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((interval * 60 - timeLeft) / (interval * 60)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🪑 久坐提醒工具</h1>
          <p className="text-gray-600">定时提醒起身活动，保护颈椎和腰椎健康</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-sm text-gray-600 mb-1">今日休息次数</div>
            <div className="text-3xl font-bold text-green-600">{todayBreaks}</div>
            <div className="text-xs text-gray-500 mt-1">次</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-sm text-gray-600 mb-1">总会话数</div>
            <div className="text-3xl font-bold text-teal-600">{totalSessions}</div>
            <div className="text-xs text-gray-500 mt-1">次</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-sm text-gray-600 mb-1">提醒间隔</div>
            <div className="text-3xl font-bold text-blue-600">{interval}</div>
            <div className="text-xs text-gray-500 mt-1">分钟</div>
          </div>
        </div>

        {/* 计时器 */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="text-center mb-6">
            <div className="text-6xl font-bold text-gray-800 mb-2">
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm text-gray-600">
              {isActive ? '距离下次提醒' : '未启动'}
            </div>
          </div>

          {isActive && (
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-400 to-teal-400 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {!isActive ? (
              <button
                onClick={startReminder}
                className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-teal-600 transition-colors"
              >
                开始提醒
              </button>
            ) : (
              <button
                onClick={stopReminder}
                className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                停止提醒
              </button>
            )}
            <button
              onClick={resetToday}
              className="px-6 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              重置
            </button>
          </div>
        </div>

        {/* 设置 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">提醒设置</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              提醒间隔 (分钟)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="15"
                max="120"
                step="15"
                value={interval}
                onChange={(e) => {
                  setInterval(Number(e.target.value));
                  if (!isActive) {
                    setTimeLeft(Number(e.target.value) * 60);
                  }
                }}
                disabled={isActive}
                className="flex-1"
              />
              <span className="text-lg font-semibold text-gray-800 w-16 text-right">
                {interval} 分
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              建议每 45-60 分钟起身活动一次
            </div>
          </div>
        </div>

        {/* 拉伸建议 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">🧘 推荐拉伸动作</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STRETCH_EXERCISES.map((exercise, index) => (
              <div
                key={index}
                className="p-4 bg-gradient-to-br from-green-50 to-teal-50 rounded-lg border border-green-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="font-semibold text-gray-800">{exercise.name}</div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    {exercise.duration}
                  </span>
                </div>
                <div className="text-sm text-gray-600">{exercise.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 使用提示 */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">💡 健康建议</h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• 久坐超过 1 小时会增加颈椎和腰椎负担</li>
            <li>• 每次起身活动 3-5 分钟，做简单拉伸</li>
            <li>• 保持正确坐姿，屏幕与眼睛平行</li>
            <li>• 多喝水，既补充水分又增加起身频率</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
