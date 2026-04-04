import React, { useState, useEffect } from 'react';

interface TimeEntry {
  id: string;
  activity: string;
  category: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // 分钟
  date: string;
}

interface CategoryStats {
  category: string;
  totalMinutes: number;
  percentage: number;
  color: string;
}

const CATEGORIES = [
  { name: '工作', color: '#3b82f6' },
  { name: '学习', color: '#10b981' },
  { name: '娱乐', color: '#f59e0b' },
  { name: '社交', color: '#ec4899' },
  { name: '运动', color: '#8b5cf6' },
  { name: '休息', color: '#6b7280' },
  { name: '其他', color: '#14b8a6' },
];

export default function TimeLogger() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [activity, setActivity] = useState('');
  const [category, setCategory] = useState('工作');
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');

  useEffect(() => {
    const saved = localStorage.getItem('timeLoggerEntries');
    if (saved) {
      const parsed = JSON.parse(saved);
      setEntries(parsed.map((e: any) => ({
        ...e,
        startTime: new Date(e.startTime),
        endTime: e.endTime ? new Date(e.endTime) : undefined,
      })));
    }
  }, []);

  useEffect(() => {
    if (entries.length > 0) {
      localStorage.setItem('timeLoggerEntries', JSON.stringify(entries));
    }
  }, [entries]);

  const startTracking = () => {
    if (!activity.trim()) return;
    
    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      activity: activity.trim(),
      category,
      startTime: new Date(),
      duration: 0,
      date: new Date().toISOString().split('T')[0],
    };
    
    setCurrentEntry(newEntry);
    setActivity('');
  };

  const stopTracking = () => {
    if (!currentEntry) return;
    
    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - currentEntry.startTime.getTime()) / 60000);
    
    const completedEntry = {
      ...currentEntry,
      endTime,
      duration,
    };
    
    setEntries([completedEntry, ...entries]);
    setCurrentEntry(null);
  };

  const addManualEntry = (minutes: number) => {
    if (!activity.trim() || minutes <= 0) return;
    
    const now = new Date();
    const startTime = new Date(now.getTime() - minutes * 60000);
    
    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      activity: activity.trim(),
      category,
      startTime,
      endTime: now,
      duration: minutes,
      date: now.toISOString().split('T')[0],
    };
    
    setEntries([newEntry, ...entries]);
    setActivity('');
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const getFilteredEntries = () => {
    const selected = new Date(selectedDate);
    
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      
      if (viewMode === 'day') {
        return entry.date === selectedDate;
      } else if (viewMode === 'week') {
        const weekStart = new Date(selected);
        weekStart.setDate(selected.getDate() - selected.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return entryDate >= weekStart && entryDate <= weekEnd;
      } else {
        return entryDate.getMonth() === selected.getMonth() && 
               entryDate.getFullYear() === selected.getFullYear();
      }
    });
  };

  const getCategoryStats = (): CategoryStats[] => {
    const filtered = getFilteredEntries();
    const totalMinutes = filtered.reduce((sum, e) => sum + e.duration, 0);
    
    const categoryMap = new Map<string, number>();
    filtered.forEach(entry => {
      categoryMap.set(entry.category, (categoryMap.get(entry.category) || 0) + entry.duration);
    });
    
    return CATEGORIES.map(cat => ({
      category: cat.name,
      totalMinutes: categoryMap.get(cat.name) || 0,
      percentage: totalMinutes > 0 ? ((categoryMap.get(cat.name) || 0) / totalMinutes) * 100 : 0,
      color: cat.color,
    })).filter(stat => stat.totalMinutes > 0);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  const stats = getCategoryStats();
  const filteredEntries = getFilteredEntries();
  const totalTime = filteredEntries.reduce((sum, e) => sum + e.duration, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">⏱️ 时间日志分析</h1>
          <p className="text-gray-600">记录你的时间都去哪了，优化时间分配</p>
        </div>

        {/* 记录区域 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📝 记录活动</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">活动名称</label>
              <input
                type="text"
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                placeholder="例如：写代码、看书、开会..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              {!currentEntry ? (
                <>
                  <button
                    onClick={startTracking}
                    disabled={!activity.trim()}
                    className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    ▶️ 开始计时
                  </button>
                  <button
                    onClick={() => addManualEntry(30)}
                    disabled={!activity.trim()}
                    className="px-6 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    +30分钟
                  </button>
                  <button
                    onClick={() => addManualEntry(60)}
                    disabled={!activity.trim()}
                    className="px-6 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    +1小时
                  </button>
                </>
              ) : (
                <button
                  onClick={stopTracking}
                  className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                >
                  ⏹️ 停止计时
                </button>
              )}
            </div>

            {currentEntry && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-green-800">{currentEntry.activity}</p>
                    <p className="text-sm text-green-600">分类：{currentEntry.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-600">开始时间</p>
                    <p className="font-semibold text-green-800">{formatTime(currentEntry.startTime)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 统计区域 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">📊 时间统计</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('day')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'day' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                日
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                周
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                月
              </button>
            </div>
          </div>

          <div className="mb-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="mb-6">
            <div className="text-center py-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">总时长</p>
              <p className="text-3xl font-bold text-blue-600">{formatDuration(totalTime)}</p>
            </div>
          </div>

          {stats.length > 0 ? (
            <div className="space-y-3">
              {stats.map(stat => (
                <div key={stat.category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-700">{stat.category}</span>
                    <span className="text-sm text-gray-600">
                      {formatDuration(stat.totalMinutes)} ({stat.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all duration-300"
                      style={{
                        width: `${stat.percentage}%`,
                        backgroundColor: stat.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>暂无数据</p>
              <p className="text-sm mt-2">开始记录你的时间吧！</p>
            </div>
          )}
        </div>

        {/* 记录列表 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">📋 活动记录</h2>
          
          {filteredEntries.length > 0 ? (
            <div className="space-y-3">
              {filteredEntries.map(entry => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: CATEGORIES.find(c => c.name === entry.category)?.color || '#6b7280'
                        }}
                      />
                      <span className="font-semibold text-gray-800">{entry.activity}</span>
                      <span className="text-sm text-gray-500">{entry.category}</span>
                    </div>
                    <div className="text-sm text-gray-600 ml-6">
                      {formatTime(entry.startTime)} - {entry.endTime ? formatTime(entry.endTime) : '进行中'}
                      <span className="ml-3 font-medium">{formatDuration(entry.duration)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="text-red-500 hover:text-red-700 px-3 py-1 rounded hover:bg-red-50 transition-colors"
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>该时间段暂无记录</p>
            </div>
          )}
        </div>

        {/* 使用提示 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">💡 使用提示</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 可以实时计时，也可以手动添加已完成的活动</li>
            <li>• 支持按日/周/月查看时间分配统计</li>
            <li>• 数据保存在本地浏览器，不会上传到服务器</li>
            <li>• 定期查看统计，优化时间分配，提高效率</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
