import React, { useState } from 'react';

interface Attraction {
  id: string;
  name: string;
  type: string;
  duration: number;
  selected: boolean;
}

interface RouteStop {
  attraction: Attraction;
  arrivalTime: string;
  departureTime: string;
  transport: string;
  transportTime: number;
}

export default function CityRoute() {
  const [city, setCity] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [route, setRoute] = useState<RouteStop[]>([]);
  const [showAttractions, setShowAttractions] = useState(false);

  const attractionTypes = ['历史古迹', '自然风光', '博物馆', '购物中心', '美食街', '公园'];

  const generateAttractions = () => {
    if (!city.trim()) {
      alert('请输入城市名称');
      return;
    }

    // 模拟生成景点列表
    const mockAttractions: Attraction[] = [
      { id: '1', name: `${city}博物馆`, type: '博物馆', duration: 120, selected: false },
      { id: '2', name: `${city}古城`, type: '历史古迹', duration: 90, selected: false },
      { id: '3', name: `${city}公园`, type: '公园', duration: 60, selected: false },
      { id: '4', name: `${city}美食街`, type: '美食街', duration: 90, selected: false },
      { id: '5', name: `${city}购物中心`, type: '购物中心', duration: 120, selected: false },
      { id: '6', name: `${city}观景台`, type: '自然风光', duration: 60, selected: false },
    ];

    setAttractions(mockAttractions);
    setShowAttractions(true);
  };

  const toggleAttraction = (id: string) => {
    setAttractions(attractions.map(a =>
      a.id === id ? { ...a, selected: !a.selected } : a
    ));
  };

  const generateRoute = () => {
    const selected = attractions.filter(a => a.selected);
    
    if (selected.length === 0) {
      alert('请至少选择一个景点');
      return;
    }

    let currentTime = startTime;
    const stops: RouteStop[] = [];

    selected.forEach((attraction, index) => {
      const [hours, minutes] = currentTime.split(':').map(Number);
      const arrivalMinutes = hours * 60 + minutes;

      const departureMinutes = arrivalMinutes + attraction.duration;
      const departureHours = Math.floor(departureMinutes / 60);
      const departureMins = departureMinutes % 60;

      const transportTime = index < selected.length - 1 ? 20 : 0;
      const nextMinutes = departureMinutes + transportTime;
      const nextHours = Math.floor(nextMinutes / 60);
      const nextMins = nextMinutes % 60;

      stops.push({
        attraction,
        arrivalTime: currentTime,
        departureTime: `${departureHours.toString().padStart(2, '0')}:${departureMins.toString().padStart(2, '0')}`,
        transport: index < selected.length - 1 ? '地铁/公交' : '',
        transportTime,
      });

      currentTime = `${nextHours.toString().padStart(2, '0')}:${nextMins.toString().padStart(2, '0')}`;
    });

    setRoute(stops);
  };

  const getTotalDuration = () => {
    return route.reduce((sum, stop) => sum + stop.attraction.duration + stop.transportTime, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">🗺️ 城市游玩路线生成</h1>
          <p className="text-gray-600 dark:text-gray-400">智能规划单城市景点路线</p>
        </div>

        {/* 输入区域 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">规划路线</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">城市名称 *</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="例如：北京"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">出发时间</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            onClick={generateAttractions}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition-colors"
          >
            🔍 查找景点
          </button>
        </div>

        {/* 景点选择 */}
        {showAttractions && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">选择景点</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {attractions.map((attraction) => (
                <button
                  key={attraction.id}
                  onClick={() => toggleAttraction(attraction.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    attraction.selected
                      ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-semibold text-gray-800 dark:text-gray-200">{attraction.name}</div>
                    {attraction.selected && (
                      <span className="text-pink-500 dark:text-pink-400">✓</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full text-xs">
                      {attraction.type}
                    </span>
                    <span>{attraction.duration} 分钟</span>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={generateRoute}
              className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              ✨ 生成路线
            </button>
          </div>
        )}

        {/* 路线结果 */}
        {route.length > 0 && (
          <div className="space-y-4">
            {/* 路线概览 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">路线概览</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-pink-50 dark:bg-pink-900/20 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">景点数量</div>
                  <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">{route.length}</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">总时长</div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {Math.floor(getTotalDuration() / 60)}h {getTotalDuration() % 60}m
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">结束时间</div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {route[route.length - 1]?.departureTime}
                  </div>
                </div>
              </div>
            </div>

            {/* 详细路线 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">详细路线</h2>

              <div className="space-y-4">
                {route.map((stop, index) => (
                  <div key={index}>
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-semibold">
                          {index + 1}
                        </div>
                        {index < route.length - 1 && (
                          <div className="w-0.5 h-16 bg-gray-300 dark:bg-gray-600 my-2" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="font-semibold text-lg text-gray-800 dark:text-gray-200">
                                {stop.attraction.name}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full text-xs">
                                  {stop.attraction.type}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600 dark:text-gray-400">游玩时长</div>
                              <div className="font-semibold text-pink-600 dark:text-pink-400">
                                {stop.attraction.duration} 分钟
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-3">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">到达：</span>
                              <span className="font-medium text-gray-800 dark:text-gray-200">{stop.arrivalTime}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">离开：</span>
                              <span className="font-medium text-gray-800 dark:text-gray-200">{stop.departureTime}</span>
                            </div>
                          </div>
                        </div>

                        {stop.transport && (
                          <div className="flex items-center gap-2 mt-2 ml-4 text-sm text-gray-600 dark:text-gray-400">
                            <span>🚇</span>
                            <span>{stop.transport}</span>
                            <span>·</span>
                            <span>{stop.transportTime} 分钟</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 使用提示 */}
        <div className="mt-6 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg p-4">
          <h3 className="font-semibold text-pink-800 dark:text-pink-300 mb-2">💡 使用提示</h3>
          <ul className="text-sm text-pink-700 dark:text-pink-300 space-y-1">
            <li>• 根据景点类型和游玩时长智能规划路线</li>
            <li>• 自动计算交通时间和到达时间</li>
            <li>• 建议选择 3-5 个景点，避免行程过于紧张</li>
            <li>• 实际游玩时请根据体力和兴趣灵活调整</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
