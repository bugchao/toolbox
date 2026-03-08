import React, { useState } from 'react'
import { Search, Cloud, Sun, CloudRain, Wind, Droplets, Thermometer } from 'lucide-react'
import { WeatherInfo } from '../types'

const Weather: React.FC = () => {
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState<WeatherInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 城市坐标映射
  const cityCoordinates: Record<string, { lat: number; lon: number }> = {
    '北京': { lat: 39.9042, lon: 116.4074 },
    '上海': { lat: 31.2304, lon: 121.4737 },
    '广州': { lat: 23.1291, lon: 113.2644 },
    '深圳': { lat: 22.5431, lon: 114.0579 },
    '成都': { lat: 30.5728, lon: 104.0668 },
    '杭州': { lat: 30.2741, lon: 120.1551 },
    '武汉': { lat: 30.5931, lon: 114.3055 },
    '西安': { lat: 34.3416, lon: 108.9398 },
    '南京': { lat: 32.0603, lon: 118.7969 },
    '重庆': { lat: 29.5630, lon: 106.5516 },
  }

  const fetchWeather = async () => {
    if (!city.trim()) return
    
    setLoading(true)
    setError('')
    setWeather(null)

    try {
      const coords = cityCoordinates[city]
      if (!coords) {
        throw new Error('暂不支持该城市查询，请输入国内主要城市名称')
      }

      // 使用免费的Open-Meteo API
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=Asia/Shanghai&forecast_days=7`
      )

      if (!response.ok) {
        throw new Error('天气查询失败')
      }

      const data = await response.json()
      
      // 解析天气代码
      const getWeatherDescription = (code: number) => {
        const weatherCodes: Record<number, string> = {
          0: '晴朗',
          1: '晴',
          2: '多云',
          3: '阴',
          45: '雾',
          48: '雾凇',
          51: '小雨',
          53: '中雨',
          55: '大雨',
          61: '阵雨',
          63: '中阵雨',
          65: '大阵雨',
          71: '小雪',
          73: '中雪',
          75: '大雪',
          80: '雷阵雨',
          95: '雷暴',
        }
        return weatherCodes[code] || '未知'
      }

      const getWeatherIcon = (code: number) => {
        if (code <= 1) return '☀️'
        if (code <= 3) return '☁️'
        if (code >= 45 && code <= 48) return '🌫️'
        if (code >= 51 && code <= 67) return '🌧️'
        if (code >= 71 && code <= 77) return '❄️'
        if (code >= 80) return '⛈️'
        return '🌤️'
      }

      const weatherInfo: WeatherInfo = {
        city,
        temperature: Math.round(data.current.temperature_2m),
        description: getWeatherDescription(data.current.weather_code),
        humidity: Math.round(data.current.relative_humidity_2m),
        windSpeed: Math.round(data.current.wind_speed_10m),
        icon: getWeatherIcon(data.current.weather_code),
        forecast: data.daily.time.map((date: string, index: number) => ({
          date: new Date(date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
          high: Math.round(data.daily.temperature_2m_max[index]),
          low: Math.round(data.daily.temperature_2m_min[index]),
          description: getWeatherDescription(data.daily.weather_code[index]),
        }))
      }

      setWeather(weatherInfo)
    } catch (err: any) {
      setError(err.message || '查询失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      fetchWeather()
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">天气查询</h1>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              输入城市名称
            </label>
            <div className="flex space-x-4">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="例如：北京、上海、广州、深圳"
                className="input flex-1"
              />
              <button
                onClick={fetchWeather}
                disabled={!city.trim() || loading}
                className="btn btn-primary flex items-center whitespace-nowrap"
              >
                <Search className="w-4 h-4 mr-2" />
                {loading ? '查询中...' : '查询'}
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              支持查询国内主要城市天气，数据来源于Open-Meteo免费API
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {weather && (
            <div className="space-y-6">
              {/* 当前天气 */}
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{weather.city}</h2>
                    <p className="text-6xl font-bold mb-4">
                      {weather.icon} {weather.temperature}°C
                    </p>
                    <p className="text-xl opacity-90">{weather.description}</p>
                  </div>
                  <div className="space-y-3 text-right">
                    <div className="flex items-center justify-end">
                      <Droplets className="w-5 h-5 mr-2" />
                      <span>湿度 {weather.humidity}%</span>
                    </div>
                    <div className="flex items-center justify-end">
                      <Wind className="w-5 h-5 mr-2" />
                      <span>风速 {weather.windSpeed} km/h</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 未来7天预报 */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">未来7天预报</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {weather.forecast.map((day, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-500 mb-2">{day.date}</p>
                      <p className="text-2xl mb-2">{day.description.includes('晴') ? '☀️' : day.description.includes('雨') ? '🌧️' : '☁️'}</p>
                      <p className="text-red-600 font-bold">{day.high}°</p>
                      <p className="text-blue-600 font-medium">{day.low}°</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">功能说明</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          <li>使用免费的Open-Meteo天气API，无需API密钥，无使用限制</li>
          <li>支持查询国内主要城市的实时天气信息，包括温度、湿度、风速等</li>
          <li>提供未来7天的天气预报，最高温和最低温信息</li>
          <li>数据每小时自动更新，确保信息准确可靠</li>
          <li>支持城市列表：北京、上海、广州、深圳、成都、杭州、武汉、西安、南京、重庆</li>
        </ul>
      </div>
    </div>
  )
}

export default Weather
