import React, { useState } from 'react';

interface DayEntry {
  day: number;
  date: string;
  activities: string[];
  photos: number;
  notes: string;
}

interface JournalData {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: string;
  days: DayEntry[];
}

export default function TravelJournal() {
  const [journalData, setJournalData] = useState<JournalData>({
    destination: '',
    startDate: '',
    endDate: '',
    travelers: '',
    days: [],
  });
  const [currentDay, setCurrentDay] = useState<DayEntry>({
    day: 1,
    date: '',
    activities: [''],
    photos: 0,
    notes: '',
  });
  const [generatedJournal, setGeneratedJournal] = useState('');
  const [step, setStep] = useState<'input' | 'days' | 'preview'>('input');

  const handleBasicInfoSubmit = () => {
    if (!journalData.destination || !journalData.startDate || !journalData.endDate) {
      alert('请填写完整的基本信息');
      return;
    }

    const start = new Date(journalData.startDate);
    const end = new Date(journalData.endDate);
    const dayCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (dayCount <= 0) {
      alert('结束日期必须晚于开始日期');
      return;
    }

    const days: DayEntry[] = [];
    for (let i = 0; i < dayCount; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      days.push({
        day: i + 1,
        date: date.toISOString().split('T')[0],
        activities: [''],
        photos: 0,
        notes: '',
      });
    }

    setJournalData({ ...journalData, days });
    setCurrentDay(days[0]);
    setStep('days');
  };

  const updateActivity = (index: number, value: string) => {
    const newActivities = [...currentDay.activities];
    newActivities[index] = value;
    setCurrentDay({ ...currentDay, activities: newActivities });
  };

  const addActivity = () => {
    setCurrentDay({
      ...currentDay,
      activities: [...currentDay.activities, ''],
    });
  };

  const removeActivity = (index: number) => {
    const newActivities = currentDay.activities.filter((_, i) => i !== index);
    setCurrentDay({ ...currentDay, activities: newActivities });
  };

  const saveDayEntry = () => {
    const newDays = [...journalData.days];
    newDays[currentDay.day - 1] = currentDay;
    setJournalData({ ...journalData, days: newDays });
  };

  const switchDay = (day: number) => {
    saveDayEntry();
    setCurrentDay(journalData.days[day - 1]);
  };

  const generateJournal = () => {
    saveDayEntry();

    const journal = `# ${journalData.destination}旅行日记

**旅行时间**：${journalData.startDate} 至 ${journalData.endDate}
**同行伙伴**：${journalData.travelers || '独自旅行'}

---

${journalData.days.map(day => `
## Day ${day.day} - ${day.date}

${day.activities.filter(a => a.trim()).map(activity => `### ${activity}

${day.notes || '今天的旅程充满了惊喜和美好的回忆。'}

${day.photos > 0 ? `📷 拍摄了 ${day.photos} 张照片` : ''}
`).join('\n')}

---
`).join('\n')}

## 旅行感悟

这次${journalData.destination}之旅让我收获满满。每一个景点，每一次相遇，都成为了珍贵的回忆。期待下一次的旅程！
`;

    setGeneratedJournal(journal);
    setStep('preview');
  };

  const downloadJournal = () => {
    const blob = new Blob([generatedJournal], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${journalData.destination}-旅行日记.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedJournal);
    alert('已复制到剪贴板！');
  };

  if (step === 'input') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">📖 游记自动生成</h1>
            <p className="text-gray-600">记录每一天的旅行，自动生成精美游记</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">基本信息</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">目的地 *</label>
                <input
                  type="text"
                  value={journalData.destination}
                  onChange={(e) => setJournalData({ ...journalData, destination: e.target.value })}
                  placeholder="例如：日本东京"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">开始日期 *</label>
                  <input
                    type="date"
                    value={journalData.startDate}
                    onChange={(e) => setJournalData({ ...journalData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">结束日期 *</label>
                  <input
                    type="date"
                    value={journalData.endDate}
                    onChange={(e) => setJournalData({ ...journalData, endDate: e.target.value })}
                    min={journalData.startDate}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">同行伙伴</label>
                <input
                  type="text"
                  value={journalData.travelers}
                  onChange={(e) => setJournalData({ ...journalData, travelers: e.target.value })}
                  placeholder="例如：家人、朋友、爱人（可选）"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleBasicInfoSubmit}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-colors"
              >
                下一步：记录每日行程
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'days') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{journalData.destination} 旅行日记</h1>
            <p className="text-gray-600">{journalData.startDate} 至 {journalData.endDate}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 日期导航 */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-4 sticky top-4">
                <h3 className="font-semibold mb-3">选择日期</h3>
                <div className="space-y-2">
                  {journalData.days.map((day) => (
                    <button
                      key={day.day}
                      onClick={() => switchDay(day.day)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        currentDay.day === day.day
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="font-medium">Day {day.day}</div>
                      <div className="text-xs opacity-75">{day.date}</div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={generateJournal}
                  className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-colors"
                >
                  生成游记
                </button>
              </div>
            </div>

            {/* 当日记录 */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Day {currentDay.day} - {currentDay.date}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">今日活动</label>
                    {currentDay.activities.map((activity, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={activity}
                          onChange={(e) => updateActivity(index, e.target.value)}
                          placeholder={`活动 ${index + 1}`}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        {currentDay.activities.length > 1 && (
                          <button
                            onClick={() => removeActivity(index)}
                            className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            删除
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={addActivity}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                      + 添加活动
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">拍摄照片数</label>
                    <input
                      type="number"
                      value={currentDay.photos}
                      onChange={(e) => setCurrentDay({ ...currentDay, photos: Number(e.target.value) })}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">今日感想</label>
                    <textarea
                      value={currentDay.notes}
                      onChange={(e) => setCurrentDay({ ...currentDay, notes: e.target.value })}
                      placeholder="记录今天的感受、有趣的事情、美食体验等..."
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <button
                    onClick={saveDayEntry}
                    className="w-full bg-purple-500 text-white py-2 rounded-lg font-medium hover:bg-purple-600 transition-colors"
                  >
                    保存当日记录
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">游记预览</h1>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setStep('days')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              返回编辑
            </button>
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              📋 复制
            </button>
            <button
              onClick={downloadJournal}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              💾 下载
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
            {generatedJournal}
          </pre>
        </div>

        <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-800 mb-2">💡 使用提示</h3>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• 游记已生成为 Markdown 格式，可直接用于博客或公众号</li>
            <li>• 可以返回编辑修改任意一天的内容</li>
            <li>• 下载后可以添加照片和更多细节</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
