import React, { useState, useEffect, useRef } from 'react';

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

const Pomodoro: React.FC = () => {
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      if (mode === 'work') {
        setCompletedPomodoros(prev => prev + 1);
      }
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isRunning, timeLeft, mode]);

  const getDuration = (m: TimerMode) => {
    return m === 'work' ? 25 * 60 : m === 'shortBreak' ? 5 * 60 : 15 * 60;
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(getDuration(newMode));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">🍅 番茄钟</h1>
        
        <div className="flex justify-center gap-2 mb-6">
          <button onClick={() => switchMode('work')} className={`px-6 py-2 rounded-lg ${mode === 'work' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}>工作</button>
          <button onClick={() => switchMode('shortBreak')} className={`px-6 py-2 rounded-lg ${mode === 'shortBreak' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>短休息</button>
          <button onClick={() => switchMode('longBreak')} className={`px-6 py-2 rounded-lg ${mode === 'longBreak' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>长休息</button>
        </div>

        <div className="text-center mb-8">
          <div className="text-6xl font-bold">{formatTime(timeLeft)}</div>
        </div>

        <div className="flex justify-center gap-4 mb-6">
          <button onClick={() => setIsRunning(!isRunning)} className={`px-8 py-3 rounded-lg text-white ${isRunning ? 'bg-yellow-500' : 'bg-green-500'}`}>
            {isRunning ? '暂停' : '开始'}
          </button>
          <button onClick={() => setTimeLeft(getDuration(mode))} className="px-8 py-3 bg-gray-500 text-white rounded-lg">重置</button>
        </div>

        <div className="text-center">已完成: {completedPomodoros}</div>
      </div>
    </div>
  );
};

export default Pomodoro;
