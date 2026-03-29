import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Check, TrendingUp, Calendar, Award, Flame } from 'lucide-react';

interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  completedDates: string[]; // ISO date strings
  createdAt: string;
}

const habitIcons = ['📚', '💪', '🏃', '💧', '🥗', '😴', '🧘', '✍️', '🎯', '💰'];
const habitColors = [
  'bg-red-500',
  'bg-orange-500',
  'bg-yellow-500',
  'bg-green-500',
  'bg-blue-500',
  'bg-purple-500',
  'bg-pink-500',
];

const HabitTracker: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('habits');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [newHabitName, setNewHabitName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(habitIcons[0]);
  const [selectedColor, setSelectedColor] = useState(habitColors[0]);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.setDate(diff));
  });

  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
  }, [habits]);

  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeekStart);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return formatDate(date) === formatDate(today);
  };

  const addHabit = () => {
    if (!newHabitName.trim()) return;

    const newHabit: Habit = {
      id: Date.now().toString(),
      name: newHabitName.trim(),
      icon: selectedIcon,
      color: selectedColor,
      completedDates: [],
      createdAt: formatDate(new Date()),
    };

    setHabits([...habits, newHabit]);
    setNewHabitName('');
    setSelectedIcon(habitIcons[0]);
    setSelectedColor(habitColors[0]);
  };

  const deleteHabit = (id: string) => {
    if (confirm('确定要删除这个习惯吗？')) {
      setHabits(habits.filter(h => h.id !== id));
    }
  };

  const toggleHabit = (habitId: string, date: Date) => {
    const dateStr = formatDate(date);
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const completed = habit.completedDates.includes(dateStr);
        return {
          ...habit,
          completedDates: completed
            ? habit.completedDates.filter(d => d !== dateStr)
            : [...habit.completedDates, dateStr],
        };
      }
      return habit;
    }));
  };

  const getStreak = (habit: Habit) => {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = formatDate(date);
      
      if (habit.completedDates.includes(dateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  };

  const getCompletionRate = (habit: Habit) => {
    const daysSinceCreation = Math.floor(
      (new Date().getTime() - new Date(habit.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;
    
    if (daysSinceCreation === 0) return 0;
    
    return Math.round((habit.completedDates.length / daysSinceCreation) * 100);
  };

  const weekDays = getWeekDays();
  const weekStartStr = currentWeekStart.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekEndStr = weekEnd.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });

  const changeWeek = (direction: number) => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() + direction * 7);
    setCurrentWeekStart(newWeekStart);
  };

  const totalCompletions = habits.reduce((sum, h) => sum + h.completedDates.length, 0);
  const todayCompletions = habits.filter(h => 
    h.completedDates.includes(formatDate(new Date()))
  ).length;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">习惯追踪器</h1>
        <p className="text-gray-600">建立好习惯，打破坏习惯，每天进步一点点</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-blue-600 font-medium">今日完成</span>
          </div>
          <div className="text-2xl font-bold text-blue-700">{todayCompletions}/{habits.length}</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-600 font-medium">总完成次数</span>
          </div>
          <div className="text-2xl font-bold text-green-700">{totalCompletions}</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-orange-600" />
            <span className="text-sm text-orange-600 font-medium">最佳连胜</span>
          </div>
          <div className="text-2xl font-bold text-orange-700">
            {habits.length > 0 ? Math.max(...habits.map(getStreak)) : 0} 天
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-purple-600 font-medium">习惯总数</span>
          </div>
          <div className="text-2xl font-bold text-purple-700">{habits.length}</div>
        </div>
      </div>

      {/* Add New Habit */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-green-500" />
          添加新习惯
        </h2>
        
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addHabit()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="例如：每天阅读 30 分钟、每天喝 8 杯水..."
          />
          
          <div className="flex gap-2">
            {habitIcons.slice(0, 5).map(icon => (
              <button
                key={icon}
                onClick={() => setSelectedIcon(icon)}
                className={`w-10 h-10 rounded-lg text-xl transition ${
                  selectedIcon === icon ? 'bg-green-100 ring-2 ring-green-500' : 'bg-gray-100'
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2">
            {habitColors.slice(0, 4).map(color => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-10 h-10 rounded-lg transition ${color} ${
                  selectedColor === color ? 'ring-2 ring-offset-2 ring-green-500' : ''
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={addHabit}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold"
          >
            添加
          </button>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => changeWeek(-1)}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
        >
          ← 上周
        </button>
        <div className="text-lg font-semibold">
          {weekStartStr} - {weekEndStr}
        </div>
        <button
          onClick={() => changeWeek(1)}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
        >
          下周 →
        </button>
      </div>

      {/* Habits Grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-8 gap-0 border-b">
          <div className="p-4 font-semibold text-gray-700 border-r bg-gray-50">习惯</div>
          {weekDays.map((day, index) => (
            <div
              key={index}
              className={`p-3 text-center border-r last:border-r-0 ${
                isToday(day) ? 'bg-blue-50' : ''
              }`}
            >
              <div className="text-xs text-gray-500">
                {day.toLocaleDateString('zh-CN', { weekday: 'short' })}
              </div>
              <div className={`text-sm font-medium ${isToday(day) ? 'text-blue-600' : ''}`}>
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>

        {habits.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <div className="text-lg font-medium mb-2">还没有习惯</div>
            <div className="text-sm">添加第一个习惯，开始你的成长之旅</div>
          </div>
        ) : (
          habits.map(habit => {
            const streak = getStreak(habit);
            const rate = getCompletionRate(habit);
            
            return (
              <div key={habit.id} className="grid grid-cols-8 gap-0 border-b last:border-b-0 hover:bg-gray-50">
                <div className="p-4 border-r flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${habit.color} flex items-center justify-center text-xl`}>
                    {habit.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{habit.name}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span>🔥 {streak}天连胜</span>
                      <span>📊 {rate}% 完成率</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                {weekDays.map((day, index) => {
                  const dateStr = formatDate(day);
                  const completed = habit.completedDates.includes(dateStr);
                  const isFuture = day > new Date();
                  
                  return (
                    <div
                      key={index}
                      className={`p-3 border-r last:border-r-0 flex items-center justify-center ${
                        isToday(day) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <button
                        onClick={() => !isFuture && toggleHabit(habit.id, day)}
                        disabled={isFuture}
                        className={`w-8 h-8 rounded-lg transition flex items-center justify-center ${
                          completed
                            ? `${habit.color} text-white`
                            : isFuture
                            ? 'bg-gray-100 cursor-not-allowed'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {completed && <Check className="w-5 h-5" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </div>

      {/* Tips */}
      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-800 mb-2">💡 习惯养成小贴士</h3>
        <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
          <li><strong>从小开始：</strong>习惯越小越容易坚持，比如"每天读 1 页书"而不是"每天读 1 小时"</li>
          <li><strong>固定时间：</strong>在每天的同一时间执行习惯，形成条件反射</li>
          <li><strong>视觉提示：</strong>把习惯放在显眼的地方，比如把书放在床头</li>
          <li><strong>不要中断：</strong>连续 2 天以上不执行会大大降低成功率，实在忙也要做最小版本</li>
          <li><strong>21 天法则：</strong>一个习惯平均需要 21 天才能初步养成，66 天才能自动化</li>
          <li><strong>追踪进度：</strong>看着连胜记录增长会很有成就感，这是最好的激励</li>
        </ul>
      </div>
    </div>
  );
};

export default HabitTracker;
