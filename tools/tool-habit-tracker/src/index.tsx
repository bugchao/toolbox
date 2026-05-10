<<<<<<< HEAD
import React, { useState, useEffect } from 'react';

interface Habit {
  id: string;
  name: string;
  color: string;
  streak: number;
  completedDates: string[];
}

const HabitTracker: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#3b82f6');

  useEffect(() => {
    const saved = localStorage.getItem('habits');
    if (saved) setHabits(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
  }, [habits]);

  const addHabit = () => {
    if (!newHabitName.trim()) return;
    const habit: Habit = {
      id: Date.now().toString(),
      name: newHabitName,
      color: selectedColor,
      streak: 0,
      completedDates: []
    };
    setHabits([...habits, habit]);
    setNewHabitName('');
  };

  const toggleHabit = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    setHabits(habits.map(h => {
      if (h.id !== id) return h;
      const completed = h.completedDates.includes(today);
      const newDates = completed 
        ? h.completedDates.filter(d => d !== today)
        : [...h.completedDates, today];
      return { ...h, completedDates: newDates, streak: calculateStreak(newDates) };
    }));
  };

  const calculateStreak = (dates: string[]): number => {
    if (dates.length === 0) return 0;
    const sorted = dates.sort().reverse();
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < sorted.length; i++) {
      const date = new Date(sorted[i]);
      const diff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (diff === i) streak++;
      else break;
    }
    return streak;
  };

  const deleteHabit = (id: string) => {
    setHabits(habits.filter(h => h.id !== id));
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6">✅ 习惯追踪器</h1>
        
        <div className="mb-6 flex gap-2">
          <input
            type="text"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addHabit()}
            placeholder="输入新习惯..."
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="w-12 h-10 rounded cursor-pointer"
          />
          <button onClick={addHabit} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            添加
          </button>
        </div>

        <div className="space-y-4">
          {habits.map(habit => (
            <div key={habit.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: habit.color }} />
              <div className="flex-1">
                <div className="font-semibold">{habit.name}</div>
                <div className="text-sm text-gray-500">连续 {habit.streak} 天</div>
              </div>
              <button
                onClick={() => toggleHabit(habit.id)}
                className={`px-6 py-2 rounded-lg font-semibold ${
                  habit.completedDates.includes(today)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {habit.completedDates.includes(today) ? '✓ 已完成' : '打卡'}
              </button>
              <button onClick={() => deleteHabit(habit.id)} className="text-red-500 hover:text-red-700">
                删除
              </button>
            </div>
          ))}
        </div>

        {habits.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            还没有习惯，添加一个开始吧！
          </div>
        )}
      </div>
    </div>
  );
};

export default HabitTracker;
=======
export { HabitTracker as default } from './HabitTracker';
>>>>>>> origin/feat/batch-tools-27
