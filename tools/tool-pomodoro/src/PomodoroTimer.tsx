import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, Check, Plus, Trash2, Volume2, VolumeX } from 'lucide-react';

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

interface Task {
  id: string;
  name: string;
  completed: boolean;
  pomodoros: number;
}

const PomodoroTimer: React.FC = () => {
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [workDuration, setWorkDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  const [autoStartBreaks, setAutoStartBreaks] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskName, setNewTaskName] = useState('');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<AudioContext | null>(null);

  const modeLabels: Record<TimerMode, string> = {
    work: '专注工作',
    shortBreak: '短休息',
    longBreak: '长休息',
  };

  const modeColors: Record<TimerMode, string> = {
    work: 'bg-red-500',
    shortBreak: 'bg-green-500',
    longBreak: 'bg-blue-500',
  };

  const modeBgColors: Record<TimerMode, string> = {
    work: 'from-red-500 to-red-600',
    shortBreak: 'from-green-500 to-green-600',
    longBreak: 'from-blue-500 to-blue-600',
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const playSound = () => {
    if (!soundEnabled) return;
    
    try {
      if (!audioRef.current) {
        audioRef.current = new AudioContext();
      }
      
      const ctx = audioRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);
    } catch {
      // Audio not supported
    }
  };

  const handleTimerComplete = () => {
    playSound();
    
    if (mode === 'work') {
      const newPomodoros = pomodorosCompleted + 1;
      setPomodorosCompleted(newPomodoros);
      
      // Update active task
      if (activeTaskId) {
        setTasks(tasks.map(task => 
          task.id === activeTaskId 
            ? { ...task, pomodoros: task.pomodoros + 1 }
            : task
        ));
      }
      
      // Long break every 4 pomodoros
      if (newPomodoros % 4 === 0) {
        setMode('longBreak');
        setTimeLeft(longBreakDuration * 60);
      } else {
        setMode('shortBreak');
        setTimeLeft(shortBreakDuration * 60);
      }
      
      if (autoStartBreaks) {
        setIsRunning(true);
      } else {
        setIsRunning(false);
      }
    } else {
      setMode('work');
      setTimeLeft(workDuration * 60);
      
      if (autoStartBreaks) {
        setIsRunning(true);
      } else {
        setIsRunning(false);
      }
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    switch (mode) {
      case 'work':
        setTimeLeft(workDuration * 60);
        break;
      case 'shortBreak':
        setTimeLeft(shortBreakDuration * 60);
        break;
      case 'longBreak':
        setTimeLeft(longBreakDuration * 60);
        break;
    }
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsRunning(false);
    switch (newMode) {
      case 'work':
        setTimeLeft(workDuration * 60);
        break;
      case 'shortBreak':
        setTimeLeft(shortBreakDuration * 60);
        break;
      case 'longBreak':
        setTimeLeft(longBreakDuration * 60);
        break;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = () => {
    const total = mode === 'work' 
      ? workDuration * 60 
      : mode === 'shortBreak' 
        ? shortBreakDuration * 60 
        : longBreakDuration * 60;
    return ((total - timeLeft) / total) * 100;
  };

  const addTask = () => {
    if (!newTaskName.trim()) return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      name: newTaskName.trim(),
      completed: false,
      pomodoros: 0,
    };
    
    setTasks([...tasks, newTask]);
    setNewTaskName('');
    
    if (!activeTaskId) {
      setActiveTaskId(newTask.id);
    }
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
    if (activeTaskId === id) {
      setActiveTaskId(null);
    }
  };

  const saveSettings = () => {
    setShowSettings(false);
    if (!isRunning) {
      switchMode(mode);
    }
  };

  const circleSize = 280;
  const strokeWidth = 8;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress() / 100) * circumference;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">番茄钟</h1>
        <p className="text-gray-600">专注工作 25 分钟，休息 5 分钟，提高效率</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Timer Section */}
        <div className="space-y-6">
          {/* Mode Selector */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(modeLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => switchMode(key as TimerMode)}
                  className={`px-4 py-3 rounded-lg font-medium transition ${
                    mode === key
                      ? `${modeColors[key as TimerMode]} text-white`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Timer Display */}
          <div className={`bg-gradient-to-br ${modeBgColors[mode]} rounded-2xl shadow-lg p-8`}>
            <div className="relative flex items-center justify-center">
              <svg width={circleSize} height={circleSize}>
                {/* Background circle */}
                <circle
                  cx={circleSize / 2}
                  cy={circleSize / 2}
                  r={radius}
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth={strokeWidth}
                />
                {/* Progress circle */}
                <circle
                  cx={circleSize / 2}
                  cy={circleSize / 2}
                  r={radius}
                  fill="none"
                  stroke="white"
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  transform={`rotate(-90 ${circleSize / 2} ${circleSize / 2})`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute text-center">
                <div className="text-6xl font-bold text-white mb-2">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-white/80 text-lg">
                  {isRunning ? '进行中' : '已暂停'}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={toggleTimer}
                className="w-16 h-16 rounded-full bg-white text-gray-800 flex items-center justify-center hover:bg-gray-100 transition shadow-lg"
              >
                {isRunning ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8 ml-1" />
                )}
              </button>
              <button
                onClick={resetTimer}
                className="w-16 h-16 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition"
              >
                <RotateCcw className="w-8 h-8" />
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-16 h-16 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition"
              >
                <Settings className="w-8 h-8" />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">设置</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">专注时长 (分钟)</label>
                  <input
                    type="number"
                    value={workDuration}
                    onChange={(e) => setWorkDuration(parseInt(e.target.value) || 25)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    min="1"
                    max="60"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">短休息 (分钟)</label>
                    <input
                      type="number"
                      value={shortBreakDuration}
                      onChange={(e) => setShortBreakDuration(parseInt(e.target.value) || 5)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      min="1"
                      max="30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">长休息 (分钟)</label>
                    <input
                      type="number"
                      value={longBreakDuration}
                      onChange={(e) => setLongBreakDuration(parseInt(e.target.value) || 15)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      min="1"
                      max="60"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">自动开始休息</span>
                  <button
                    onClick={() => setAutoStartBreaks(!autoStartBreaks)}
                    className={`w-12 h-6 rounded-full transition ${
                      autoStartBreaks ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition ${
                      autoStartBreaks ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    提示音
                  </span>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`w-12 h-6 rounded-full transition ${
                      soundEnabled ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition ${
                      soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                
                <button
                  onClick={saveSettings}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  保存设置
                </button>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-500">{pomodorosCompleted}</div>
              <div className="text-sm text-gray-600">今日完成番茄数</div>
            </div>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">今日任务</h2>
          
          {/* Add Task */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="添加任务..."
            />
            <button
              onClick={addTask}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Task List */}
          <div className="space-y-2">
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <div className="text-sm">暂无任务</div>
              </div>
            ) : (
              tasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => setActiveTaskId(task.id)}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition ${
                    activeTaskId === task.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${task.completed ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTask(task.id);
                      }}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition ${
                        task.completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300'
                      }`}
                    >
                      {task.completed && <Check className="w-4 h-4" />}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium truncate ${
                        task.completed ? 'line-through text-gray-500' : ''
                      }`}>
                        {task.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        🍅 {task.pomodoros} 个番茄
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTask(task.id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Tips */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">🍅 番茄工作法</h4>
            <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
              <li>选择一个任务，设置 25 分钟倒计时</li>
              <li>专注工作，直到番茄钟响起</li>
              <li>休息 5 分钟，起来走动一下</li>
              <li>每 4 个番茄后，休息 15-30 分钟</li>
              <li>任务可以分解成多个番茄</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
