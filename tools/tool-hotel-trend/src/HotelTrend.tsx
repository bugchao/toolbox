import React, { useState } from 'react';

interface PricePoint {
  date: string;
  price: number;
  availability: 'high' | 'medium' | 'low';
}

interface HotelTrend {
  hotelName: string;
  location: string;
  rating: number;
  currentPrice: number;
  lowestPrice: number;
  highestPrice: number;
  averagePrice: number;
  priceHistory: PricePoint[];
  recommendation: string;
}

const generateMockData = (checkIn: string, checkOut: string): HotelTrend => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  const priceHistory: PricePoint[] = [];
  const basePrice = 500;
  
  for (let i = 0; i < days; i++) {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    const variation = Math.random() * 200 - 100;
    const price = Math.round(basePrice + variation);
    
    priceHistory.push({
      date: date.toISOString().split('T')[0],
      price,
      availability: price < 450 ? 'high' : price < 550 ? 'medium' : 'low',
    });
  }
  
  const prices = priceHistory.map(p => p.price);
  const lowestPrice = Math.min(...prices);
  const highestPrice = Math.max(...prices);
  const averagePrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  
  return {
    hotelName: '希尔顿酒店',
    location: '北京朝阳区',
    rating: 4.5,
    currentPrice: prices[0],
    lowestPrice,
    highestPrice,
    averagePrice,
    priceHistory,
    recommendation: prices[0] < averagePrice ? '当前价格低于平均水平，建议预订' : '价格偏高，建议等待或选择其他日期',
  };
};

export default function HotelTrend() {
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [hotelName, setHotelName] = useState('');
  const [trend, setTrend] = useState<HotelTrend | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    if (!destination.trim() || !checkIn || !checkOut) {
      alert('请填写完整信息');
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      alert('退房日期必须晚于入住日期');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const mockTrend = generateMockData(checkIn, checkOut);
      setTrend(mockTrend);
      setLoading(false);
    }, 1500);
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'high': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'high': return '充足';
      case 'medium': return '一般';
      case 'low': return '紧张';
      default: return '未知';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📊 酒店价格趋势</h1>
          <p className="text-gray-600">查看酒店价格变化，选择最佳预订时机</p>
        </div>

        {/* 搜索表单 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">目的地 *</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="城市或地区"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">酒店名称</label>
              <input
                type="text"
                value={hotelName}
                onChange={(e) => setHotelName(e.target.value)}
                placeholder="可选"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">入住日期 *</label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">退房日期 *</label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '查询中...' : '🔍 查询价格趋势'}
          </button>
        </div>

        {/* 趋势结果 */}
        {trend && (
          <div className="space-y-6">
            {/* 酒店信息 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">{trend.hotelName}</h2>
                  <p className="text-gray-600">📍 {trend.location}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < Math.floor(trend.rating) ? 'text-yellow-400' : 'text-gray-300'}>
                        ★
                      </span>
                    ))}
                    <span className="text-sm text-gray-600 ml-1">{trend.rating}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 mb-1">当前价格</div>
                  <div className="text-3xl font-bold text-cyan-600">¥{trend.currentPrice}</div>
                  <div className="text-sm text-gray-500 mt-1">每晚</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">最低价格</div>
                  <div className="text-xl font-bold text-green-600">¥{trend.lowestPrice}</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">平均价格</div>
                  <div className="text-xl font-bold text-blue-600">¥{trend.averagePrice}</div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">最高价格</div>
                  <div className="text-xl font-bold text-red-600">¥{trend.highestPrice}</div>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${
                trend.currentPrice < trend.averagePrice ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{trend.currentPrice < trend.averagePrice ? '✅' : '⚠️'}</span>
                  <div>
                    <div className="font-semibold text-gray-800">预订建议</div>
                    <div className="text-sm text-gray-700">{trend.recommendation}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 价格趋势表 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">📈 价格趋势</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">日期</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">价格</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">与平均价差</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">房源情况</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">建议</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trend.priceHistory.map((point, index) => {
                      const diff = point.price - trend.averagePrice;
                      const isGoodDeal = point.price <= trend.lowestPrice + 50;
                      
                      return (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-700">{point.date}</td>
                          <td className="py-3 px-4">
                            <span className={`font-semibold ${
                              point.price === trend.lowestPrice ? 'text-green-600' :
                              point.price === trend.highestPrice ? 'text-red-600' :
                              'text-gray-800'
                            }`}>
                              ¥{point.price}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-sm ${diff > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {diff > 0 ? '+' : ''}{diff}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(point.availability)}`}>
                              {getAvailabilityText(point.availability)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {isGoodDeal ? (
                              <span className="text-green-600 text-sm font-medium">👍 推荐</span>
                            ) : point.price > trend.averagePrice + 50 ? (
                              <span className="text-red-600 text-sm font-medium">👎 偏高</span>
                            ) : (
                              <span className="text-gray-600 text-sm">一般</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 价格走势图（简化版） */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">📉 价格走势图</h3>
              <div className="relative h-64 flex items-end gap-2">
                {trend.priceHistory.map((point, index) => {
                  const height = ((point.price - trend.lowestPrice) / (trend.highestPrice - trend.lowestPrice)) * 100;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="text-xs text-gray-600 mb-1">¥{point.price}</div>
                      <div
                        className={`w-full rounded-t transition-all ${
                          point.price === trend.lowestPrice ? 'bg-green-500' :
                          point.price === trend.highestPrice ? 'bg-red-500' :
                          'bg-blue-400'
                        }`}
                        style={{ height: `${Math.max(height, 10)}%` }}
                      />
                      <div className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-top-left whitespace-nowrap">
                        {point.date.split('-').slice(1).join('/')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 使用提示 */}
        <div className="mt-6 bg-cyan-50 border border-cyan-200 rounded-lg p-4">
          <h3 className="font-semibold text-cyan-800 mb-2">💡 使用提示</h3>
          <ul className="text-sm text-cyan-700 space-y-1">
            <li>• 价格趋势基于历史数据和预测算法生成</li>
            <li>• 绿色标记表示价格较低，适合预订</li>
            <li>• 红色标记表示价格较高，建议等待或选择其他日期</li>
            <li>• 房源紧张时价格通常较高，建议提前预订</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
