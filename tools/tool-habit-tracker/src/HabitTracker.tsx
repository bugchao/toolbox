import React, { useState, useEffect } from 'react';
import './HabitTracker.css';

interface Habit {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: number;
  completedDates: string[];
}

const COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e'];

export const HabitTracker: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newHabit, setNewHabit] = useState({ name: '', description: '', color: COLORS[0] });

  useEffect(() => {
    loadHabits();
  }, []);

  useEffect(() => {
    saveHabits();
  }, [habits]);

  const loadHabits = () => {
    const saved = localStorage.getItem('habit-tracker');
    if (saved) {
      setHabits(JSON.parse(saved));
    }
  };

  const saveHabits = () => {
    localStorage.setItem('habit-tracker', JSON.stringify(habits));
  };

  const addHabit = () => {
    if (!newHabit.name.trim()) {
      alert('请输入习惯名称');
      return;
    }

    const habit: Habit = {
      id: Date.now().toString(),
      name: newHabit.name,
      description: newHabit.description,
      color: newHabit.color,
      createdAt: Date.now(),
      completedDates: [],
    };

    setHabits([...habits, habit]);
    setNewHabit({ name: '', description: '', color: COLORS[0] });
    setShowAddModal(false);
  };

  const deleteHabit = (id: string) => {
    if (confirm('确定删除这个习惯吗？')) {
      setHabits(habits.filter(h => h.id !== id));
    }
  };

  const toggleHabit = (id: string, date: string) => {
    setHabits(habits.map(habit => {
      if (habit.id === id) {
        const completed = habit.completedDates.includes(date);
        return {
          ...habit,
          completedDates: completed
            ? habit.completedDates.filter(d => d !== date)
            : [...habit.completedDates, date],
        };
      }
      return habit;
    }));
  };

  const getDateString = (daysAgo: number): string => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
  };

  const getDayLabel = (daysAgo: number): string => {
    if (daysAgo === 0) return '今天';
    if (daysAgo === 1) return '昨天';
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const getStreak = (habit: Habit): number => {
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const date = getDateString(i);
      if (habit.completedDates.includes(date)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const getCompletionRate = (habit: Habit, days: number): number => {
    let completed = 0;
    for (let i = 0; i < days; i++) {
      const date = getDateString(i);
      if (habit.completedDates.includes(date)) {
        completed++;
      }
    }
    return Math.round((completed / days) * 100);
  };

  return (
    <div className="habit-tracker">
      <div className="tool-header">
        <h1>✅ 习惯追踪器</h1>
        <p>养成好习惯，记录每一天的进步</p>
      </div>

      <div className="tracker-container">
        <div className="header-actions">
          <button className="add-habit-btn" onClick={() => setShowAddModal(true)}>
            ➕ 添加习惯
          </button>
        </div>

        {habits.length === 0 ? (
          <div className="empty-state">
            <p>还没有添加习惯，点击上方按钮开始吧！</p>
          </div>
        ) : (
          <div className="habits-list">
            {habits.map(habit => (
              <div key={habit.id} className="habit-card" style={{ borderLeftColor: habit.color }}>
                <div className="habit-header">
                  <div className="habit-info">
                    <h3>{habit.name}</h3>
                    {habit.description && <p className="habit-description">{habit.description}</p>}
                  </div>
                  <button className="delete-btn" onClick={() => deleteHabit(habit.id)}>
                    🗑️
                  </button>
                </div>

                <div className="habit-stats">
                  <div className="stat-item">
                    <div className="stat-value">{getStreak(habit)}</div>
                    <div className="stat-label">连续天数</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{getCompletionRate(habit, 7)}%</div>
                    <div className="stat-label">7天完成率</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{getCompletionRate(habit, 30)}%</div>
                    <div className="stat-label">30天完成率</div>
                  </div>
                </div>

                <div className="habit-calendar">
                  {Array.from({ length: 7 }).map((_, i) => {
                    const date = getDateString(i);
                    const completed = habit.completedDates.includes(date);
                    return (
                      <div
                        key={i}
                        className={`calendar-day ${completed ? 'completed' : ''}`}
                        style={{ background: completed ? habit.color : undefined }}
                        onClick={() => toggleHabit(habit.id, date)}
                      >
                        <div className="day-label">{getDayLabel(i)}</div>
                        <div className="day-check">{completed ? '✓' : ''}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>添加新习惯</h3>
            <div className="form-group">
              <label>习惯名称</label>
              <input
                type="text"
                value={newHabit.name}
                onChange={e => setNewHabit({ ...newHabit, name: e.target.value })}
                placeholder="例如：每天阅读30分钟"
              />
            </div>
            <div className="form-group">
              <label>描述（可选）</label>
              <textarea
                value={newHabit.description}
                onChange={e => setNewHabit({ ...newHabit, description: e.target.value })}
                placeholder="添加一些描述..."
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>颜色</label>
              <div className="color-picker">
                {COLORS.map(color => (
                  <button
                    key={color}
                    className={`color-btn ${newHabit.color === color ? 'active' : ''}`}
                    style={{ background: color }}
                    onClick={() => setNewHabit({ ...newHabit, color })}
                  />
                ))}
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowAddModal(false)}>取消</button>
              <button className="primary" onClick={addHabit}>添加</button>
            </div>
          </div>
        </div>
      )}

      <div className="info-section">
        <h3>💡 使用提示</h3>
        <ul>
          <li>点击日期方块标记完成</li>
          <li>连续完成可以增加连续天数</li>
          <li>数据保存在浏览器本地</li>
          <li>坚持21天养成一个习惯</li>
        </ul>
      </div>
    </div>
  );
};

export default HabitTracker;
