import React, { useState } from 'react';

interface FlightInfo {
  airline: string;
  flightNumber: string;
  departure: string;
  arrival: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  stops: number;
  aircraft: string;
}

const MOCK_FLIGHTS: FlightInfo[] = [
  {
    airline: '中国国际航空',
    flightNumber: 'CA1234',
    departure: '北京首都国际机场 (PEK)',
    arrival: '上海浦东国际机场 (PVG)',
    departureTime: '08:00',
    arrivalTime: '10:30',
    duration: '2小时30分钟',
    price: 850,
    stops: 0,
    aircraft: '波音737',
  },
  {
    airline: '东方航空',
    flightNumber: 'MU5678',
    departure: '北京首都国际机场 (PEK)',
    arrival: '上海浦东国际机场 (PVG)',
    departureTime: '10:30',
    arrivalTime: '13:00',
    duration: '2小时30分钟',
    price: 780,
    stops: 0,
    aircraft: '空客A320',
  },
  {
    airline: '南方航空',
    flightNumber: 'CZ9012',
    departure: '北京首都国际机场 (PEK)',
    arrival: '上海浦东国际机场 (PVG)',
    departureTime: '14:00',
    arrivalTime: '16:30',
    duration: '2小时30分钟',
    price: 920,
    stops: 0,
    aircraft: '波音787',
  },
  {
    airline: '海南航空',
    flightNumber: 'HU3456',
    departure: '北京首都国际机场 (PEK)',
    arrival: '上海浦东国际机场 (PVG)',
    departureTime: '16:30',
    arrivalTime: '19:00',
    duration: '2小时30分钟',
    price: 690,
    stops: 0,
    aircraft: '波音737',
  },
  {
    airline: '春秋航空',
    flightNumber: '9C8765',
    departure: '北京首都国际机场 (PEK)',
    arrival: '上海浦东国际机场 (PVG)',
    departureTime: '19:00',
    arrivalTime: '21:30',
    duration: '2小时30分钟',
    price: 520,
    stops: 0,
    aircraft: '空客A320',
  },
];

const POPULAR_ROUTES = [
  { from: '北京', to: '上海', fromCode: 'PEK', toCode: 'PVG' },
  { from: '北京', to: '广州', fromCode: 'PEK', toCode: 'CAN' },
  { from: '上海', to: '深圳', fromCode: 'PVG', toCode: 'SZX' },
  { from: '北京', to: '成都', fromCode: 'PEK', toCode: 'CTU' },
  { from: '上海', to: '成都', fromCode: 'PVG', toCode: 'CTU' },
  { from: '广州', to: '上海', fromCode: 'CAN', toCode: 'PVG' },
];

export default function FlightSearch() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [tripType, setTripType] = useState<'oneway' | 'roundtrip'>('oneway');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState('economy');
  const [flights, setFlights] = useState<FlightInfo[]>([]);
  const [searching, setSearching] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'time' | 'duration'>('price');

  const handleSearch = () => {
    if (!from.trim() || !to.trim()) {
      alert('请输入出发地和目的地');
      return;
    }

    setSearching(true);
    
    // 模拟搜索延迟
    setTimeout(() => {
      setFlights(MOCK_FLIGHTS);
      setSearching(false);
    }, 1500);
  };

  const handleQuickSelect = (route: typeof POPULAR_ROUTES[0]) => {
    setFrom(route.from);
    setTo(route.to);
  };

  const getSortedFlights = () => {
    const sorted = [...flights];
    
    switch (sortBy) {
      case 'price':
        return sorted.sort((a, b) => a.price - b.price);
      case 'time':
        return sorted.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
      case 'duration':
        return sorted.sort((a, b) => {
          const durationA = parseInt(a.duration);
          const durationB = parseInt(b.duration);
          return durationA - durationB;
        });
      default:
        return sorted;
    }
  };

  const sortedFlights = getSortedFlights();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">✈️ 航班信息查询</h1>
          <p className="text-gray-600">聚合多个平台的航班信息，快速找到最优航班</p>
        </div>

        {/* 搜索表单 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setTripType('oneway')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                tripType === 'oneway' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              单程
            </button>
            <button
              onClick={() => setTripType('roundtrip')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                tripType === 'roundtrip' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              往返
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">出发地</label>
              <input
                type="text"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="城市或机场代码"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">目的地</label>
              <input
                type="text"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="城市或机场代码"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">出发日期</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {tripType === 'roundtrip' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">返程日期</label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  min={date}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">乘客人数</label>
              <select
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <option key={num} value={num}>{num} 人</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">舱位等级</label>
              <select
                value={cabinClass}
                onChange={(e) => setCabinClass(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="economy">经济舱</option>
                <option value="premium">超级经济舱</option>
                <option value="business">商务舱</option>
                <option value="first">头等舱</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={searching}
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {searching ? '搜索中...' : '🔍 搜索航班'}
          </button>
        </div>

        {/* 热门航线 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">🔥 热门航线</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {POPULAR_ROUTES.map((route, index) => (
              <button
                key={index}
                onClick={() => handleQuickSelect(route)}
                className="px-4 py-2 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                {route.from} → {route.to}
              </button>
            ))}
          </div>
        </div>

        {/* 搜索结果 */}
        {flights.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">找到 {flights.length} 个航班</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy('price')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === 'price' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  价格最低
                </button>
                <button
                  onClick={() => setSortBy('time')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === 'time' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  时间最早
                </button>
                <button
                  onClick={() => setSortBy('duration')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === 'duration' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  时长最短
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {sortedFlights.map((flight, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="font-semibold text-gray-800">{flight.airline}</div>
                        <div className="text-sm text-gray-500">{flight.flightNumber}</div>
                        <div className="text-sm text-gray-500">{flight.aircraft}</div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-800">{flight.departureTime}</div>
                          <div className="text-sm text-gray-600 mt-1">{flight.departure.split(' ')[0]}</div>
                        </div>

                        <div className="flex-1 text-center">
                          <div className="text-sm text-gray-500 mb-1">{flight.duration}</div>
                          <div className="relative">
                            <div className="h-px bg-gray-300"></div>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                              {flight.stops === 0 ? (
                                <span className="text-xs text-green-600 font-medium">直飞</span>
                              ) : (
                                <span className="text-xs text-orange-600 font-medium">{flight.stops} 经停</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-800">{flight.arrivalTime}</div>
                          <div className="text-sm text-gray-600 mt-1">{flight.arrival.split(' ')[0]}</div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right ml-6">
                      <div className="text-3xl font-bold text-blue-600 mb-2">¥{flight.price}</div>
                      <button className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors">
                        查看详情
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">💡 使用说明</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 当前为演示版本，显示的是模拟数据</li>
            <li>• 实际版本将聚合携程、去哪儿、飞猪等平台的真实航班信息</li>
            <li>• 支持价格、时间、时长等多维度排序</li>
            <li>• 可快速选择热门航线进行查询</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
