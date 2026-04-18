import { useState, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ElectronicWoodenFish() {
  const { t } = useTranslation();
  const [merit, setMerit] = useState(0);
  const [autoMode, setAutoMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [speed, setSpeed] = useState(1000);
  const audioRef = useRef<HTMLAudioElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const blessings = t('woodenFish.blessings', { returnObjects: true }) as string[];

  const playSound = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  const knock = () => {
    setMerit(prev => prev + 1);
    playSound();
    showBlessing();
  };

  const showBlessing = () => {
    const blessing = blessings[Math.floor(Math.random() * blessings.length)];
    const element = document.createElement('div');
    element.textContent = blessing;
    element.className = 'blessing-text';
    element.style.cssText = `
      position: fixed;
      left: ${Math.random() * 80 + 10}%;
      top: 50%;
      color: #f59e0b;
      font-size: 1.5rem;
      font-weight: bold;
      pointer-events: none;
      animation: float-up 2s ease-out forwards;
      z-index: 1000;
    `;
    document.body.appendChild(element);
    setTimeout(() => element.remove(), 2000);
  };

  const toggleAutoMode = () => {
    if (autoMode) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } else {
      intervalRef.current = setInterval(() => {
        knock();
      }, speed);
    }
    setAutoMode(!autoMode);
  };

  const resetMerit = () => {
    setMerit(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-8">
      <style>{`
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-100px);
          }
        }
        @keyframes knock-animation {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(0.95); }
        }
        .wooden-fish:active {
          animation: knock-animation 0.3s ease;
        }
      `}</style>

      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-2">🪵 {t('woodenFish.title')}</h1>
          <p className="text-amber-700">{t('woodenFish.description')}</p>
        </div>

        {/* 功德计数器 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 text-center">
          <div className="text-6xl font-bold text-amber-600 mb-2">{merit}</div>
          <div className="text-xl text-amber-800">{t('woodenFish.merit')}</div>
        </div>

        {/* 木鱼 */}
        <div className="flex justify-center mb-8">
          <button
            onClick={knock}
            className="wooden-fish w-64 h-64 bg-gradient-to-br from-amber-700 to-amber-900 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center text-8xl cursor-pointer border-8 border-amber-800"
            disabled={autoMode}
          >
            🪵
          </button>
        </div>

        {/* 控制面板 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-medium">{t('woodenFish.autoMode')}</span>
            <button
              onClick={toggleAutoMode}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                autoMode
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-amber-500 hover:bg-amber-600 text-white'
              }`}
            >
              {autoMode ? t('common.close') : t('common.open')}
            </button>
          </div>

          {autoMode && (
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                {t('woodenFish.speed')}: {(1000 / speed).toFixed(1)} {t('common.times')}/s
              </label>
              <input
                type="range"
                min="100"
                max="2000"
                step="100"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-medium">{t('woodenFish.soundEnabled')}</span>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {soundEnabled ? (
                <Volume2 className="w-6 h-6 text-amber-600" />
              ) : (
                <VolumeX className="w-6 h-6 text-gray-400" />
              )}
            </button>
          </div>

          <button
            onClick={resetMerit}
            className="w-full py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            {t('woodenFish.resetMerit')}
          </button>
        </div>

        {/* 音频元素 */}
        <audio ref={audioRef} preload="auto">
          <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGS57OihUBELTKXh8bllHAU2jdXvzn0vBSh+zPDajzsKElyx6OyrWBUIQ5zd8sFuJAUuhM/z24k2CBdju+zooVARC0yl4fG5ZRwFNo3V785+LwUofszw2o87ChJcsejtq1gVCEOc3fLBbiQFLoTP89uJNggXY7vs6KFQEQtMpeHxuWUcBTaN1e/Ofi8FKH7M8NqPOwsSXLHo7atYFQhDnN3ywW4kBS6Ez/PbiTYIF2O77OihUBELTKXh8bllHAU2jdXvzn4vBSh+zPDajzsKElyx6O2rWBUIQ5zd8sFuJAUuhM/z24k2CBdju+zooVARC0yl4fG5ZRwFNo3V785+LwUofszw2o87ChJcsejtq1gVCEOc3fLBbiQFLoTP89uJNggXY7vs6KFQEQtMpeHxuWUcBTaN1e/Ofi8FKH7M8NqPOwsSXLHo7atYFQhDnN3ywW4kBS6Ez/PbiTYIF2O77OihUBELTKXh8bllHAU2jdXvzn4vBSh+zPDajzsKElyx6O2rWBUIQ5zd8sFuJAUuhM/z24k2CBdju+zooVARC0yl4fG5ZRwFNo3V785+LwUofszw2o87ChJcsejtq1gVCEOc3fLBbiQFLoTP89uJNggXY7vs6KFQEQtMpeHxuWUcBTaN1e/Ofi8FKH7M8NqPOwsSXLHo7atYFQhDnN3ywW4kBS6Ez/PbiTYIF2O77OihUBELTKXh8bllHAU2jdXvzn4vBSh+zPDajzsKElyx6O2rWBUIQ5zd8sFuJAUuhM/z24k2CBdju+zooVARC0yl4fG5ZRwFNo3V785+LwUofszw2o87ChJcsejtq1gVCEOc3fLBbiQFLoTP89uJNggXY7vs6KFQEQtMpeHxuWUcBTaN1e/Ofi8FKH7M8NqPOwsSXLHo7atYFQhDnN3ywW4kBS6Ez/PbiTYIF2O77OihUBELTKXh8bllHAU2jdXvzn4vBSh+zPDajzsKElyx6O2rWBUIQ5zd8sFuJAUuhM/z24k2CBdju+zooVARC0yl4fG5ZRwFNo3V785+LwUofszw2o87ChJcsejtq1gVCEOc3fLBbiQFLoTP89uJNggXY7vs6KFQEQtMpeHxuWUcBTaN1e/Ofi8FKH7M8NqPOwsSXLHo7atYFQ==" type="audio/wav" />
        </audio>
      </div>
    </div>
  );
}
