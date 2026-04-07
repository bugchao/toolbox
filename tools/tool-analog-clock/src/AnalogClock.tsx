import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Maximize2, Minimize2, Palette, ExternalLink } from 'lucide-react'

// 10种主题配置
const themes = [
  {
    id: 'classic',
    name: '经典黑白',
    bg: 'bg-white',
    face: 'bg-gray-50',
    border: 'border-gray-800',
    numbers: 'text-gray-800',
    hourHand: 'bg-gray-900',
    minuteHand: 'bg-gray-700',
    secondHand: 'bg-red-500',
    center: 'bg-gray-900',
    marks: 'bg-gray-400',
  },
  {
    id: 'luxury',
    name: '奢华金色',
    bg: 'bg-gradient-to-br from-amber-50 to-yellow-50',
    face: 'bg-gradient-to-br from-amber-100 to-yellow-100',
    border: 'border-amber-600',
    numbers: 'text-amber-800',
    hourHand: 'bg-amber-700',
    minuteHand: 'bg-amber-600',
    secondHand: 'bg-amber-500',
    center: 'bg-amber-700',
    marks: 'bg-amber-400',
  },
  {
    id: 'ocean',
    name: '海洋蓝',
    bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    face: 'bg-gradient-to-br from-blue-100 to-cyan-100',
    border: 'border-blue-600',
    numbers: 'text-blue-800',
    hourHand: 'bg-blue-700',
    minuteHand: 'bg-blue-600',
    secondHand: 'bg-cyan-500',
    center: 'bg-blue-700',
    marks: 'bg-blue-400',
  },
  {
    id: 'forest',
    name: '森林绿',
    bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
    face: 'bg-gradient-to-br from-green-100 to-emerald-100',
    border: 'border-green-700',
    numbers: 'text-green-900',
    hourHand: 'bg-green-800',
    minuteHand: 'bg-green-700',
    secondHand: 'bg-emerald-500',
    center: 'bg-green-800',
    marks: 'bg-green-500',
  },
  {
    id: 'sunset',
    name: '日落橙',
    bg: 'bg-gradient-to-br from-orange-50 to-red-50',
    face: 'bg-gradient-to-br from-orange-100 to-red-100',
    border: 'border-orange-600',
    numbers: 'text-orange-900',
    hourHand: 'bg-orange-700',
    minuteHand: 'bg-orange-600',
    secondHand: 'bg-red-500',
    center: 'bg-orange-700',
    marks: 'bg-orange-400',
  },
  {
    id: 'purple',
    name: '紫罗兰',
    bg: 'bg-gradient-to-br from-purple-50 to-pink-50',
    face: 'bg-gradient-to-br from-purple-100 to-pink-100',
    border: 'border-purple-600',
    numbers: 'text-purple-900',
    hourHand: 'bg-purple-700',
    minuteHand: 'bg-purple-600',
    secondHand: 'bg-pink-500',
    center: 'bg-purple-700',
    marks: 'bg-purple-400',
  },
  {
    id: 'dark',
    name: '暗夜模式',
    bg: 'bg-gray-900',
    face: 'bg-gray-800',
    border: 'border-gray-600',
    numbers: 'text-gray-300',
    hourHand: 'bg-gray-200',
    minuteHand: 'bg-gray-300',
    secondHand: 'bg-blue-400',
    center: 'bg-gray-200',
    marks: 'bg-gray-500',
  },
  {
    id: 'rose',
    name: '玫瑰金',
    bg: 'bg-gradient-to-br from-rose-50 to-pink-50',
    face: 'bg-gradient-to-br from-rose-100 to-pink-100',
    border: 'border-rose-400',
    numbers: 'text-rose-800',
    hourHand: 'bg-rose-600',
    minuteHand: 'bg-rose-500',
    secondHand: 'bg-pink-500',
    center: 'bg-rose-600',
    marks: 'bg-rose-300',
  },
  {
    id: 'mint',
    name: '薄荷绿',
    bg: 'bg-gradient-to-br from-teal-50 to-cyan-50',
    face: 'bg-gradient-to-br from-teal-100 to-cyan-100',
    border: 'border-teal-500',
    numbers: 'text-teal-900',
    hourHand: 'bg-teal-700',
    minuteHand: 'bg-teal-600',
    secondHand: 'bg-cyan-500',
    center: 'bg-teal-700',
    marks: 'bg-teal-400',
  },
  {
    id: 'silver',
    name: '银色经典',
    bg: 'bg-gradient-to-br from-slate-100 to-gray-100',
    face: 'bg-gradient-to-br from-slate-200 to-gray-200',
    border: 'border-slate-500',
    numbers: 'text-slate-800',
    hourHand: 'bg-slate-700',
    minuteHand: 'bg-slate-600',
    secondHand: 'bg-blue-500',
    center: 'bg-slate-700',
    marks: 'bg-slate-400',
  },
]

export default function AnalogClock() {
  const location = useLocation()
  const [time, setTime] = useState(new Date())
  const [themeIndex, setThemeIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showThemes, setShowThemes] = useState(false)

  // 检测是否为独立模式
  const searchParams = new URLSearchParams(location.search)
  const isStandalone = searchParams.get('standalone') === 'true'

  const theme = themes[themeIndex]

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // 全屏切换
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const hours = time.getHours() % 12
  const minutes = time.getMinutes()
  const seconds = time.getSeconds()

  // 计算指针角度
  const secondAngle = (seconds * 6) - 90 // 每秒6度
  const minuteAngle = (minutes * 6 + seconds * 0.1) - 90 // 每分钟6度 + 秒针带动
  const hourAngle = (hours * 30 + minutes * 0.5) - 90 // 每小时30度 + 分针带动

  const clockSize = isFullscreen ? 'w-[80vh] h-[80vh]' : 'w-96 h-96'

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 overflow-hidden' : 'min-h-screen'} flex items-center justify-center ${theme.bg} transition-colors duration-500`}>
      <div className="relative">
        {/* 时钟容器 */}
        <div className={`${clockSize} relative transition-all duration-300`}>
          {/* 表盘 */}
          <div className={`w-full h-full rounded-full ${theme.face} border-8 ${theme.border} shadow-2xl relative`}>
            {/* 刻度线 */}
            {[...Array(60)].map((_, i) => {
              const angle = i * 6
              const isHour = i % 5 === 0
              const length = isHour ? '8%' : '4%'
              const width = isHour ? '3px' : '1px'
              return (
                <div
                  key={i}
                  className={`absolute top-1/2 left-1/2 origin-left ${theme.marks}`}
                  style={{
                    width: length,
                    height: width,
                    transform: `rotate(${angle}deg) translateX(-50%)`,
                    transformOrigin: 'left center',
                  }}
                />
              )
            })}

            {/* 数字刻度 */}
            {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num, i) => {
              const angle = i * 30
              const radius = isFullscreen ? 38 : 38
              const x = 50 + radius * Math.sin((angle * Math.PI) / 180)
              const y = 50 - radius * Math.cos((angle * Math.PI) / 180)
              return (
                <div
                  key={num}
                  className={`absolute ${theme.numbers} font-bold ${isFullscreen ? 'text-6xl' : 'text-2xl'}`}
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  {num}
                </div>
              )
            })}

            {/* 时针 */}
            <div
              className={`absolute top-1/2 left-1/2 origin-left ${theme.hourHand} rounded-full shadow-lg transition-transform duration-1000`}
              style={{
                width: isFullscreen ? '25%' : '25%',
                height: isFullscreen ? '8px' : '6px',
                transform: `rotate(${hourAngle}deg) translateX(-15%)`,
                transformOrigin: 'left center',
              }}
            />

            {/* 分针 */}
            <div
              className={`absolute top-1/2 left-1/2 origin-left ${theme.minuteHand} rounded-full shadow-lg transition-transform duration-1000`}
              style={{
                width: isFullscreen ? '35%' : '35%',
                height: isFullscreen ? '6px' : '4px',
                transform: `rotate(${minuteAngle}deg) translateX(-15%)`,
                transformOrigin: 'left center',
              }}
            />

            {/* 秒针 */}
            <div
              className={`absolute top-1/2 left-1/2 origin-left ${theme.secondHand} rounded-full shadow-lg`}
              style={{
                width: isFullscreen ? '40%' : '40%',
                height: isFullscreen ? '3px' : '2px',
                transform: `rotate(${secondAngle}deg) translateX(-15%)`,
                transformOrigin: 'left center',
                transition: seconds === 0 ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
              }}
            />

            {/* 中心圆点 */}
            <div
              className={`absolute top-1/2 left-1/2 ${theme.center} rounded-full shadow-lg`}
              style={{
                width: isFullscreen ? '24px' : '16px',
                height: isFullscreen ? '24px' : '16px',
                transform: 'translate(-50%, -50%)',
              }}
            />
          </div>
        </div>

        {/* 控制按钮 */}
        {!isFullscreen && (
          <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 flex gap-3">
            {!isStandalone && (
              <button
                onClick={() => {
                  const url = `${window.location.origin}${location.pathname}?standalone=true`
                  window.open(url, '_blank', 'noopener,noreferrer')
                }}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2 whitespace-nowrap"
                title="在新窗口中独立打开"
              >
                <ExternalLink className="w-4 h-4" />
                独立打开
              </button>
            )}
            <button
              onClick={() => setShowThemes(!showThemes)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <Palette className="w-4 h-4" />
              主题
            </button>
            <button
              onClick={toggleFullscreen}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <Maximize2 className="w-4 h-4" />
              全屏
            </button>
          </div>
        )}

        {/* 全屏模式下的控制按钮 */}
        {isFullscreen && (
          <div className="fixed top-8 right-8 flex gap-3 z-50">
            {!isStandalone && (
              <button
                onClick={() => {
                  const url = `${window.location.origin}${location.pathname}?standalone=true`
                  window.open(url, '_blank', 'noopener,noreferrer')
                }}
                className="px-6 py-3 bg-white/90 backdrop-blur-sm border border-gray-300 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 text-lg whitespace-nowrap"
                title="在新窗口中独立打开"
              >
                <ExternalLink className="w-5 h-5" />
                独立打开
              </button>
            )}
            <button
              onClick={() => setShowThemes(!showThemes)}
              className="px-6 py-3 bg-white/90 backdrop-blur-sm border border-gray-300 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 text-lg whitespace-nowrap"
            >
              <Palette className="w-5 h-5" />
              主题
            </button>
            <button
              onClick={toggleFullscreen}
              className="px-6 py-3 bg-white/90 backdrop-blur-sm border border-gray-300 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 text-lg whitespace-nowrap"
            >
              <Minimize2 className="w-5 h-5" />
              退出全屏
            </button>
          </div>
        )}

        {/* 主题选择器 */}
        {showThemes && (
          <div className={`${
            isFullscreen 
              ? 'fixed top-24 right-8 w-96' 
              : 'absolute -bottom-36 left-1/2 transform -translate-x-1/2 w-[500px]'
          } bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-2xl p-4 z-50`}>
            <div className="grid grid-cols-2 gap-2">
              {themes.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setThemeIndex(i)
                    setShowThemes(false)
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    i === themeIndex
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 数字时间显示 */}
        <div className={`${
          isFullscreen 
            ? 'fixed bottom-20 left-1/2 transform -translate-x-1/2' 
            : 'absolute -top-20 left-1/2 transform -translate-x-1/2'
        } text-center whitespace-nowrap`}>
          <div className={`${isFullscreen ? 'text-6xl' : 'text-3xl'} font-bold ${theme.numbers} transition-all`}>
            {time.toLocaleTimeString('zh-CN', { hour12: false })}
          </div>
          <div className={`${isFullscreen ? 'text-2xl' : 'text-sm'} ${theme.numbers} opacity-60 mt-1 whitespace-nowrap`}>
            {time.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </div>
        </div>
      </div>
    </div>
  )
}
