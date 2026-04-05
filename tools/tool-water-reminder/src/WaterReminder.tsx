import React, { useState, useEffect } from 'react';

interface WaterRecord {
  id: string;
  time: string;
  amount: number;
}

const STORAGE_KEY = 'water-reminder-records';
const SETTINGS_KEY = 'water-reminder-settings';

export default function WaterReminder() {
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [records, setRecords] = useState<WaterRecord[]>([]);
  const [customAmount, setCustomAmount] = useState(250);
  const [reminderInterval, setReminderInterval] = useState(60);
  const [reminderEnabled, setReminderEnabled] = useState(false);

  // 从 localStorage 加载数据
  useEffect(() => {
    try {
      const savedRecords = localStorage.getItem(STORAGE_KEY);
      if (savedRecords) {
        setRecords(JSON.parse(savedRecords));
      }

      const savedSettings = localStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setDailyGoal(settings.dailyGoal || 2000);
        setReminderInterval(settings.reminderInterval || 60);
        setReminderEnabled(settings.reminderEnabled || false);
      }
    } catch (error) {
      console.error('Failed to load water reminder data:', error);
    }
  }, []);

  // 保存记录到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (error) {
      console.error('Failed to save water records:', error);
    }
  }, [records]);

  // 保存设置到 localStorage
  useEffect(() => {
    try {
      const settings = {
        dailyGoal,
        reminderInterval,
        reminderEnabled,
      };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [dailyGoal, reminderInterval, reminderEnabled]);

  const totalToday = records.reduce((sum, r) => sum + r.amount, 0);
  const progress = Math.min((totalToday / dailyGoal) * 100, 100);

  const addWater = (amount: number) => {
    const newRecord: WaterRecord = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      amount,
    };
    setRecords([newRecord, ...records]);
  };

  const deleteRecord = (id: string) => {
    if (confirm('确定要删除这条记录吗？')) {
      setRecords(records.filter(r => r.id !== id));
    }
  };

  const resetToday = () => {
    if (confirm('确定要清空今日记录吗？')) {
      setRecords([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const exportData = () => {
    const data = {
      records,
      settings: { dailyGoal, reminderInterval },
      exportDate: new Date().toISOString(),
    };
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `water-records-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (!reminderEnabled) return;

    const interval = setInterval(() => {
      if (totalToday < dailyGoal) {
        if (Notification.permission === 'granted') {
          new Notification('💧 该喝水啦！', {
            body: `今日已喝 ${totalToday}ml，距离目标还差 ${dailyGoal - totalToday}ml`,
            icon: '💧',
          });
        }
      }
    }, reminderInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [reminderEnabled, reminderInterval, totalToday, dailyGoal]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    setReminderEnabled(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">💧 饮水提醒工具</h1>
          <p className="text-gray-600">记录每日饮水量，养成健康饮水习惯</p>
        </div>

        {/* 进度卡片 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">今日饮水量</div>
              <div className="text-4xl font-bold text-blue-600">{totalToday} ml</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">目标</div>
              <div className="text-2xl font-semibold text-gray-700">{dailyGoal} ml</div>
            </div>
          </div>

          <div className="mb-2">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>进度</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-blue-400 to-cyan-400 h-4 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {totalToday >= dailyGoal && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
              <span className="text-green-700 font-medium">🎉 恭喜！今日目标已达成</span>
            </div>
          )}
        </div>

        {/* 快捷添加 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">快捷记录</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[100, 200, 250, 500].map((amount) => (
              <button
                key={amount}
                onClick={() => addWater(amount)}
                className="bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border-2 border-blue-200 text-blue-700 py-4 rounded-lg font-semibold transition-colors"
              >
                <div className="text-2xl mb-1">💧</div>
                <div>{amount} ml</div>
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(Number(e.target.value))}
              placeholder="自定义毫升数"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => addWater(customAmount)}
              className="px-6 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              添加
            </button>
          </div>
        </div>

        {/* 设置 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">设置</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                每日目标 (ml)
              </label>
              <input
                type="number"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                step="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                提醒间隔 (分钟)
              </label>
              <input
                type="number"
                value={reminderInterval}
                onChange={(e) => setReminderInterval(Number(e.target.value))}
                min="15"
                step="15"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">启用提醒</span>
              <button
                onClick={() => {
                  if (!reminderEnabled) {
                    requestNotificationPermission();
                  } else {
                    setReminderEnabled(false);
                  }
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  reminderEnabled
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {reminderEnabled ? '已启用' : '已关闭'}
              </button>
            </div>
          </div>
        </div>

        {/* 今日记录 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">今日记录</h2>
            <div className="flex gap-2">
              {records.length > 0 && (
                <>
                  <button
                    onClick={exportData}
                    className="text-sm text-blue-500 hover:text-blue-700"
                  >
                    导出
                  </button>
                  <button
                    onClick={resetToday}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    清空记录
                  </button>
                </>
              )}
            </div>
          </div>

          {records.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💧</div>
              <p className="text-gray-500">还没有饮水记录</p>
              <p className="text-sm text-gray-400 mt-2">点击上方按钮开始记录</p>
            </div>
          ) : (
            <div className="space-y-2">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">💧</div>
                    <div>
                      <div className="font-medium text-gray-800">{record.amount} ml</div>
                      <div className="text-sm text-gray-600">{record.time}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteRecord(record.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 使用提示 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">💡 饮水建议</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 成年人建议每天饮水 1500-2000ml</li>
            <li>• 少量多次饮水，避免一次性大量饮水</li>
            <li>• 运动后、天气炎热时需要增加饮水量</li>
            <li>• 晨起一杯温水有助于促进新陈代谢</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
