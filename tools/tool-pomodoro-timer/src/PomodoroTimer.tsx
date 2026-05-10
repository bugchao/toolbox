import React, { useState, useEffect, useRef } from 'react';
import './PomodoroTimer.css';

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

interface TimerSettings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
}

export const PomodoroTimer: React.FC = () => {
  const [settings, setSettings] = useState<TimerSettings>({
    workMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    longBreakInterval: 4,
  });

  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState<number>(settings.workMinutes * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedPomodoros, setCompletedPomodoros] = useState<number>(0);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    if (mode === 'work') {
      const newCount = completedPomodoros + 1;
      setCompletedPomodoros(newCount);
      
      if (newCount % settings.longBreakInterval === 0) {
        switchMode('longBreak');
      } else {
        switchMode('shortBreak');
      }
    } else {
      switchMode('work');
    }
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    const minutes = newMode === 'work' 
      ? settings.workMinutes 
      : newMode === 'shortBreak' 
      ? settings.shortBreakMinutes 
      : settings.longBreakMinutes;
    setTimeLeft(minutes * 60);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    const minutes = mode === 'work' 
      ? settings.workMinutes 
      : mode === 'shortBreak' 
      ? settings.shortBreakMinutes 
      : settings.longBreakMinutes;
    setTimeLeft(minutes * 60);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getModeLabel = (): string => {
    switch (mode) {
      case 'work': return '工作时间';
      case 'shortBreak': return '短休息';
      case 'longBreak': return '长休息';
    }
  };

  const progress = () => {
    const total = mode === 'work' 
      ? settings.workMinutes * 60 
      : mode === 'shortBreak' 
      ? settings.shortBreakMinutes * 60 
      : settings.longBreakMinutes * 60;
    return ((total - timeLeft) / total) * 100;
  };

  return (
    <div className={`pomodoro-timer mode-${mode}`}>
      <div className="tool-header">
        <h1>🍅 番茄钟计时器</h1>
        <p>番茄工作法 - 提高专注力和效率</p>
      </div>

      <div className="timer-container">
        <div className="mode-label">{getModeLabel()}</div>
        
        <div className="timer-display">
          <div className="time">{formatTime(timeLeft)}</div>
          <div className="progress-ring">
            <svg width="300" height="300">
              <circle
                cx="150"
                cy="150"
                r="140"
                fill="none"
                stroke="#e0e0e0"
                strokeWidth="8"
              />
              <circle
                cx="150"
                cy="150"
                r="140"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 140}`}
                strokeDashoffset={`${2 * Math.PI * 140 * (1 - progress() / 100)}`}
                transform="rotate(-90 150 150)"
              />
            </svg>
          </div>
        </div>

        <div className="timer-controls">
          <button className="control-btn start" onClick={toggleTimer}>
            {isRunning ? '暂停' : '开始'}
          </button>
          <button className="control-btn reset" onClick={resetTimer}>
            重置
          </button>
        </div>

        <div className="mode-switcher">
          <button
            className={mode === 'work' ? 'active' : ''}
            onClick={() => switchMode('work')}
          >
            工作
          </button>
          <button
            className={mode === 'shortBreak' ? 'active' : ''}
            onClick={() => switchMode('shortBreak')}
          >
            短休息
          </button>
          <button
            className={mode === 'longBreak' ? 'active' : ''}
            onClick={() => switchMode('longBreak')}
          >
            长休息
          </button>
        </div>

        <div className="stats">
          <div className="stat-item">
            <div className="stat-value">{completedPomodoros}</div>
            <div className="stat-label">已完成番茄钟</div>
          </div>
        </div>
      </div>

      {showSettings && (
        <div className="settings-modal">
          <div className="settings-content">
            <h3>设置</h3>
            <div className="setting-item">
              <label>工作时长（分钟）</label>
              <input
                type="number"
                value={settings.workMinutes}
                onChange={e => setSettings({ ...settings, workMinutes: Number(e.target.value) })}
                min="1"
                max="60"
              />
            </div>
            <div className="setting-item">
              <label>短休息时长（分钟）</label>
              <input
                type="number"
                value={settings.shortBreakMinutes}
                onChange={e => setSettings({ ...settings, shortBreakMinutes: Number(e.target.value) })}
                min="1"
                max="30"
              />
            </div>
            <div className="setting-item">
              <label>长休息时长（分钟）</label>
              <input
                type="number"
                value={settings.longBreakMinutes}
                onChange={e => setSettings({ ...settings, longBreakMinutes: Number(e.target.value) })}
                min="1"
                max="60"
              />
            </div>
            <div className="setting-item">
              <label>长休息间隔（番茄钟数）</label>
              <input
                type="number"
                value={settings.longBreakInterval}
                onChange={e => setSettings({ ...settings, longBreakInterval: Number(e.target.value) })}
                min="2"
                max="10"
              />
            </div>
            <button onClick={() => setShowSettings(false)}>关闭</button>
          </div>
        </div>
      )}

      <button className="settings-btn" onClick={() => setShowSettings(true)}>
        ⚙️ 设置
      </button>

      <div className="info-section">
        <h3>💡 番茄工作法</h3>
        <ul>
          <li>工作 25 分钟，专注完成一项任务</li>
          <li>短休息 5 分钟，放松一下</li>
          <li>完成 4 个番茄钟后，长休息 15 分钟</li>
          <li>重复循环，提高工作效率</li>
        </ul>
      </div>
    </div>
  );
};

export default PomodoroTimer;
