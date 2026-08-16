import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RunRecord {
  id: string;
  date: string;
  distance: number;
  duration: number;
  pace: number;
  calories: number;
  notes: string;
}

const STORAGE_KEY = 'running-tracker-records';

export default function RunningTracker() {
  const [records, setRecords] = useState<RunRecord[]>([]);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // 从 localStorage 加载数据
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setRecords(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load running records:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // 保存数据到 localStorage（仅在加载完成后）
  useEffect(() => {
    if (!isLoaded) return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (error) {
      console.error('Failed to save running records:', error);
    }
  }, [records, isLoaded]);

  const calculatePace = (dist: number, dur: number): number => {
    if (dist === 0) return 0;
    return Math.round((dur / dist) * 10) / 10;
  };

  const calculateCalories = (dist: number): number => {
    return Math.round(dist * 60);
  };

  const addRecord = () => {
    const dist = parseFloat(distance);
    const dur = parseFloat(duration);

    if (!dist || !dur || dist <= 0 || dur <= 0) {
      alert('请输入有效的距离和时长');
      return;
    }

    const pace = calculatePace(dist, dur);
    const calories = calculateCalories(dist);

    const newRecord: RunRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      distance: dist,
      duration: dur,
      pace,
      calories,
      notes,
    };

    setRecords([newRecord, ...records]);
    setDistance('');
    setDuration('');
    setNotes('');
    setShowForm(false);
  };

  const deleteRecord = (id: string) => {
    if (confirm('确定要删除这条记录吗？')) {
      setRecords(records.filter(r => r.id !== id));
    }
  };

  const clearAllRecords = () => {
    if (confirm('确定要清空所有记录吗？此操作不可恢复！')) {
      setRecords([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(records, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `running-records-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 准备图表数据（最近10次）
  const getChartData = () => {
    return records
      .slice(0, 10)
      .reverse()
      .map(record => ({
        日期: record.date.slice(5), // MM-DD
        距离: record.distance,
        配速: record.pace,
        时长: record.duration,
        卡路里: record.calories,
      }));
  };

  const totalDistance = records.reduce((sum, r) => sum + r.distance, 0);
  const totalDuration = records.reduce((sum, r) => sum + r.duration, 0);
  const totalCalories = records.reduce((sum, r) => sum + r.calories, 0);
  const avgPace = records.length > 0
    ? Math.round((records.reduce((sum, r) => sum + r.pace, 0) / records.length) * 10) / 10
    : 0;

  const getPaceLevel = (pace: number) => {
    if (pace < 5) return { label: '极快', color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20' };
    if (pace < 6) return { label: '快速', color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20' };
    if (pace < 7) return { label: '良好', color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' };
    if (pace < 8) return { label: '一般', color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' };
    return { label: '慢跑', color: 'text-ink-muted bg-surface-muted' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-ink mb-2">🏃 跑步数据分析</h1>
          <p className="text-ink-muted">记录跑步数据，分析配速和趋势</p>
        </div>

        {/* 统计卡片 */}
        {records.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="text-sm text-ink-muted mb-1">总次数</div>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{records.length}</div>
              <div className="text-xs text-ink-muted mt-1">次</div>
            </div>

            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="text-sm text-ink-muted mb-1">总里程</div>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">{totalDistance.toFixed(1)}</div>
              <div className="text-xs text-ink-muted mt-1">公里</div>
            </div>

            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="text-sm text-ink-muted mb-1">总时长</div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalDuration.toFixed(0)}</div>
              <div className="text-xs text-ink-muted mt-1">分钟</div>
            </div>

            <div className="bg-surface rounded-xl shadow-lg p-6">
              <div className="text-sm text-ink-muted mb-1">平均配速</div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{avgPace}</div>
              <div className="text-xs text-ink-muted mt-1">分钟/公里</div>
            </div>
          </div>
        )}

        {/* 添加记录按钮 */}
        {!showForm && (
          <div className="mb-6">
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-colors shadow-lg"
            >
              + 添加跑步记录
            </button>
          </div>
        )}

        {/* 数据管理按钮 */}
        {records.length > 0 && (
          <div className="flex gap-2 mb-6">
            <button
              onClick={exportData}
              className="flex-1 bg-surface text-orange-600 dark:text-orange-400 border-2 border-orange-500 py-2 rounded-lg font-medium hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
            >
              📥 导出数据
            </button>
            <button
              onClick={clearAllRecords}
              className="flex-1 bg-surface text-red-600 dark:text-red-400 border-2 border-red-500 py-2 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              🗑️ 清空数据
            </button>
          </div>
        )}

        {/* 跑步数据图表 */}
        {records.length >= 2 && (
          <div className="bg-surface rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">📊 跑步数据分析（最近10次）</h2>
            
            {/* 距离趋势 */}
            <div className="mb-8">
              <h3 className="text-sm font-medium text-ink mb-3">距离趋势</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="日期" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="距离" stroke="#ef4444" strokeWidth={2} unit=" km" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 配速分析 */}
            <div className="mb-8">
              <h3 className="text-sm font-medium text-ink mb-3">配速分析</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="日期" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="配速" fill="#8b5cf6" unit=" 分/km" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 卡路里消耗 */}
            <div>
              <h3 className="text-sm font-medium text-ink mb-3">卡路里消耗</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="日期" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="卡路里" fill="#f59e0b" unit=" kcal" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 添加表单 */}
        {showForm && (
          <div className="bg-surface rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">记录跑步数据</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  距离 (公里) *
                </label>
                <input
                  type="number"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  placeholder="例如：5.0"
                  step="0.1"
                  className="w-full px-4 py-2 border border-edge-strong rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  时长 (分钟) *
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="例如：30"
                  step="0.1"
                  className="w-full px-4 py-2 border border-edge-strong rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {distance && duration && parseFloat(distance) > 0 && parseFloat(duration) > 0 && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-sm text-ink-muted mb-1">配速</div>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {calculatePace(parseFloat(distance), parseFloat(duration))}
                  </div>
                  <div className="text-xs text-ink-muted">分钟/公里</div>
                </div>

                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-sm text-ink-muted mb-1">消耗热量</div>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {calculateCalories(parseFloat(distance))}
                  </div>
                  <div className="text-xs text-ink-muted">千卡</div>
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-ink mb-2">备注</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="记录天气、路线、感受等..."
                rows={3}
                className="w-full px-4 py-2 border border-edge-strong rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={addRecord}
                className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
              >
                保存记录
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-6 bg-surface-inset text-ink py-2 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {/* 记录列表 */}
        <div className="space-y-4">
          {records.length === 0 ? (
            <div className="bg-surface rounded-xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">🏃</div>
              <p className="text-ink-muted">还没有跑步记录</p>
              <p className="text-sm text-ink-subtle mt-2">点击上方按钮添加第一条记录</p>
            </div>
          ) : (
            records.map((record) => {
              const paceLevel = getPaceLevel(record.pace);
              return (
                <div key={record.id} className="bg-surface rounded-xl shadow-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-lg font-semibold text-ink">{record.date}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${paceLevel.color}`}>
                          {paceLevel.label}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteRecord(record.id)}
                      className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm"
                    >
                      删除
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                      <div className="text-xs text-ink-muted mb-1">距离</div>
                      <div className="text-xl font-bold text-orange-600 dark:text-orange-400">{record.distance} km</div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <div className="text-xs text-ink-muted mb-1">时长</div>
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{record.duration} min</div>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                      <div className="text-xs text-ink-muted mb-1">配速</div>
                      <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{record.pace} min/km</div>
                    </div>

                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                      <div className="text-xs text-ink-muted mb-1">热量</div>
                      <div className="text-xl font-bold text-red-600 dark:text-red-400">{record.calories} kcal</div>
                    </div>
                  </div>

                  {record.notes && (
                    <div className="p-3 bg-surface-muted rounded-lg">
                      <div className="text-xs text-ink-muted mb-1">备注</div>
                      <div className="text-sm text-ink">{record.notes}</div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* 使用提示 */}
        <div className="mt-6 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <h3 className="font-semibold text-orange-800 dark:text-orange-300 mb-2">💡 跑步建议</h3>
          <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
            <li>• 初学者建议配速 7-8 分钟/公里，循序渐进</li>
            <li>• 跑前热身 5-10 分钟，跑后拉伸放松</li>
            <li>• 每周跑步 3-4 次，每次 30-60 分钟</li>
            <li>• 注意补充水分，选择合适的跑鞋</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
