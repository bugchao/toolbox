import React, { useState } from 'react';

interface SleepRecord {
  id: string;
  date: string;
  bedTime: string;
  wakeTime: string;
  duration: number;
  quality: number;
  notes: string;
  deepSleep?: number;
  lightSleep?: number;
  remSleep?: number;
}

export default function SleepTracker() {
  const [records, setRecords] = useState<SleepRecord[]>([]);
  const [bedTime, setBedTime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [quality, setQuality] = useState(3);
  const [notes, setNotes] = useState('');
  const [showForm, setShowForm] = useState(false);

  const calculateDuration = (bed: string, wake: string): number => {
    if (!bed || !wake) return 0;
    
    const bedDate = new Date(`2000-01-01 ${bed}`);
    let wakeDate = new Date(`2000-01-01 ${wake}`);
    
    if (wakeDate < bedDate) {
      wakeDate = new Date(`2000-01-02 ${wake}`);
    }
    
    const diff = wakeDate.getTime() - bedDate.getTime();
    return Math.round(diff / (1000 * 60 * 60) * 10) / 10;
  };

  const addRecord = () => {
    if (!bedTime || !wakeTime) {
      alert('请填写入睡和起床时间');
      return;
    }

    const duration = calculateDuration(bedTime, wakeTime);
    
    if (duration <= 0) {
      alert('起床时间必须晚于入睡时间');
      return;
    }

    const newRecord: SleepRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      bedTime,
      wakeTime,
      duration,
      quality,
      notes,
      deepSleep: Math.round(duration * 0.2 * 10) / 10,
      lightSleep: Math.round(duration * 0.5 * 10) / 10,
      remSleep: Math.round(duration * 0.3 * 10) / 10,
    };

    setRecords([newRecord, ...records]);
    setBedTime('');
    setWakeTime('');
    setQuality(3);
    setNotes('');
    setShowForm(false);
  };

  const deleteRecord = (id: string) => {
    setRecords(records.filter(r => r.id !== id));
  };

  const getQualityLabel = (q: number) => {
    const labels = ['很差', '较差', '一般', '良好', '优秀'];
    return labels[q - 1] || '一般';
  };

  const getQualityColor = (q: number) => {
    if (q >= 4) return 'text-green-600 bg-green-50';
    if (q >= 3) return 'text-blue-600 bg-blue-50';
    if (q >= 2) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const avgDuration = records.length > 0
    ? Math.round(records.reduce((sum, r) => sum + r.duration, 0) / records.length * 10) / 10
    : 0;

  const avgQuality = records.length > 0
    ? Math.round(records.reduce((sum, r) => sum + r.quality, 0) / records.length * 10) / 10
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">😴 睡眠质量记录</h1>
          <p className="text-gray-600">记录每日睡眠，追踪睡眠质量</p>
        </div>

        {/* 统计卡片 */}
        {records.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-sm text-gray-600 mb-1">总记录数</div>
              <div className="text-3xl font-bold text-indigo-600">{records.length}</div>
              <div className="text-xs text-gray-500 mt-1">天</div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-sm text-gray-600 mb-1">平均睡眠时长</div>
              <div className="text-3xl font-bold text-blue-600">{avgDuration}</div>
              <div className="text-xs text-gray-500 mt-1">小时</div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-sm text-gray-600 mb-1">平均睡眠质量</div>
              <div className="text-3xl font-bold text-purple-600">{avgQuality}</div>
              <div className="text-xs text-gray-500 mt-1">/ 5.0</div>
            </div>
          </div>
        )}

        {/* 添加记录按钮 */}
        {!showForm && (
          <div className="mb-6">
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-4 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-600 transition-colors shadow-lg"
            >
              + 添加睡眠记录
            </button>
          </div>
        )}

        {/* 添加表单 */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">记录今日睡眠</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">入睡时间 *</label>
                <input
                  type="time"
                  value={bedTime}
                  onChange={(e) => setBedTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">起床时间 *</label>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {bedTime && wakeTime && (
              <div className="mb-4 p-3 bg-indigo-50 rounded-lg">
                <div className="text-sm text-gray-600">预计睡眠时长</div>
                <div className="text-2xl font-bold text-indigo-600">
                  {calculateDuration(bedTime, wakeTime)} 小时
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                睡眠质量 ({quality}/5)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="flex-1"
                />
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getQualityColor(quality)}`}>
                  {getQualityLabel(quality)}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">备注</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="记录影响睡眠的因素、梦境等..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={addRecord}
                className="flex-1 bg-indigo-500 text-white py-2 rounded-lg font-medium hover:bg-indigo-600 transition-colors"
              >
                保存记录
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-6 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {/* 记录列表 */}
        <div className="space-y-4">
          {records.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">😴</div>
              <p className="text-gray-500">还没有睡眠记录</p>
              <p className="text-sm text-gray-400 mt-2">点击上方按钮添加第一条记录</p>
            </div>
          ) : (
            records.map((record) => (
              <div key={record.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-lg font-semibold text-gray-800">{record.date}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {record.bedTime} - {record.wakeTime}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteRecord(record.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    删除
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-indigo-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">总时长</div>
                    <div className="text-xl font-bold text-indigo-600">{record.duration}h</div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">深度睡眠</div>
                    <div className="text-xl font-bold text-blue-600">{record.deepSleep}h</div>
                  </div>

                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">浅度睡眠</div>
                    <div className="text-xl font-bold text-purple-600">{record.lightSleep}h</div>
                  </div>

                  <div className="bg-pink-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">REM 睡眠</div>
                    <div className="text-xl font-bold text-pink-600">{record.remSleep}h</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">睡眠质量：</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getQualityColor(record.quality)}`}>
                      {getQualityLabel(record.quality)}
                    </span>
                  </div>
                </div>

                {record.notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">备注</div>
                    <div className="text-sm text-gray-700">{record.notes}</div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* 使用提示 */}
        <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h3 className="font-semibold text-indigo-800 mb-2">💡 睡眠建议</h3>
          <ul className="text-sm text-indigo-700 space-y-1">
            <li>• 成年人建议每天睡眠 7-9 小时</li>
            <li>• 保持规律的作息时间有助于提高睡眠质量</li>
            <li>• 睡前避免使用电子设备，保持卧室安静舒适</li>
            <li>• 记录睡眠数据可以帮助发现影响睡眠的因素</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
