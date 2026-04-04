import React, { useState } from 'react';

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  priceRange: string;
  rating: number;
  address: string;
  openHours: string;
  specialties: string[];
  tags: string[];
  distance: string;
  estimatedWait: string;
}

const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: '1',
    name: '老北京炸酱面',
    cuisine: '北京菜',
    priceRange: '¥30-50',
    rating: 4.5,
    address: '朝阳区三里屯路12号',
    openHours: '11:00-21:00',
    specialties: ['炸酱面', '京酱肉丝', '老北京炒肝'],
    tags: ['地道', '老字号', '人气高'],
    distance: '1.2km',
    estimatedWait: '15分钟',
  },
  {
    id: '2',
    name: '海底捞火锅',
    cuisine: '火锅',
    priceRange: '¥80-120',
    rating: 4.8,
    address: '朝阳区建国路88号',
    openHours: '10:00-02:00',
    specialties: ['麻辣锅底', '虾滑', '手工拉面'],
    tags: ['服务好', '环境佳', '适合聚会'],
    distance: '2.5km',
    estimatedWait: '30分钟',
  },
  {
    id: '3',
    name: '鼎泰丰',
    cuisine: '台湾菜',
    priceRange: '¥60-100',
    rating: 4.7,
    address: '朝阳区国贸商城B1层',
    openHours: '11:00-22:00',
    specialties: ['小笼包', '炒饭', '红油抄手'],
    tags: ['米其林', '精致', '排队'],
    distance: '3.0km',
    estimatedWait: '45分钟',
  },
  {
    id: '4',
    name: '西贝莜面村',
    cuisine: '西北菜',
    priceRange: '¥70-110',
    rating: 4.6,
    address: '朝阳区大望路SOHO现代城',
    openHours: '11:00-22:00',
    specialties: ['莜面', '烤羊排', '黄馍馍'],
    tags: ['特色', '分量足', '家庭聚餐'],
    distance: '1.8km',
    estimatedWait: '20分钟',
  },
  {
    id: '5',
    name: '外婆家',
    cuisine: '杭帮菜',
    priceRange: '¥50-80',
    rating: 4.4,
    address: '朝阳区朝阳大悦城5楼',
    openHours: '11:00-21:30',
    specialties: ['西湖醋鱼', '东坡肉', '龙井虾仁'],
    tags: ['性价比高', '口味清淡', '环境好'],
    distance: '2.2km',
    estimatedWait: '25分钟',
  },
  {
    id: '6',
    name: 'Starbucks Reserve',
    cuisine: '咖啡厅',
    priceRange: '¥40-80',
    rating: 4.3,
    address: '朝阳区三里屯太古里',
    openHours: '08:00-22:00',
    specialties: ['手冲咖啡', '意式浓缩', '甜品'],
    tags: ['安静', '适合办公', 'WiFi'],
    distance: '1.5km',
    estimatedWait: '5分钟',
  },
];

const CUISINES = ['全部', '北京菜', '火锅', '台湾菜', '西北菜', '杭帮菜', '川菜', '粤菜', '日料', '西餐', '咖啡厅'];
const PRICE_RANGES = ['全部', '¥30以下', '¥30-50', '¥50-100', '¥100-200', '¥200以上'];
const MEAL_TIMES = ['早餐', '午餐', '下午茶', '晚餐', '夜宵'];

export default function RestaurantFinder() {
  const [location, setLocation] = useState('');
  const [cuisine, setCuisine] = useState('全部');
  const [priceRange, setPriceRange] = useState('全部');
  const [mealTime, setMealTime] = useState('午餐');
  const [partySize, setPartySize] = useState(2);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [searching, setSearching] = useState(false);

  const PREFERENCE_OPTIONS = [
    '环境好', '服务好', '性价比高', '适合聚会', '适合约会', '有包间', '有停车位', '可外卖'
  ];

  const togglePreference = (pref: string) => {
    setPreferences(prev =>
      prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
    );
  };

  const handleSearch = () => {
    setSearching(true);
    
    setTimeout(() => {
      let filtered = [...MOCK_RESTAURANTS];
      
      if (cuisine !== '全部') {
        filtered = filtered.filter(r => r.cuisine === cuisine);
      }
      
      if (priceRange !== '全部') {
        filtered = filtered.filter(r => r.priceRange === priceRange);
      }
      
      if (preferences.length > 0) {
        filtered = filtered.filter(r =>
          preferences.some(pref => r.tags.includes(pref))
        );
      }
      
      setRestaurants(filtered);
      setSearching(false);
    }, 1000);
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < fullStars ? 'text-yellow-400' : 'text-gray-300'}>
            {i < fullStars ? '★' : (i === fullStars && hasHalfStar ? '⯨' : '☆')}
          </span>
        ))}
        <span className="text-sm text-gray-600 ml-1">{rating}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🍽️ 餐厅推荐</h1>
          <p className="text-gray-600">根据时间、预算和偏好，找到最适合的餐厅</p>
        </div>

        {/* 搜索表单 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">📍 位置</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="输入地址或地标"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">🍜 菜系</label>
              <select
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {CUISINES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">💰 价格区间</label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {PRICE_RANGES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">⏰ 用餐时间</label>
              <div className="flex gap-2">
                {MEAL_TIMES.map(time => (
                  <button
                    key={time}
                    onClick={() => setMealTime(time)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      mealTime === time
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">👥 用餐人数</label>
              <select
                value={partySize}
                onChange={(e) => setPartySize(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <option key={num} value={num}>{num} 人</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">✨ 偏好（可多选）</label>
            <div className="flex flex-wrap gap-2">
              {PREFERENCE_OPTIONS.map(pref => (
                <button
                  key={pref}
                  onClick={() => togglePreference(pref)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    preferences.includes(pref)
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {pref}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={searching}
            className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 rounded-lg font-semibold hover:from-red-600 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {searching ? '搜索中...' : '🔍 搜索餐厅'}
          </button>
        </div>

        {/* 搜索结果 */}
        {restaurants.length > 0 && (
          <div>
            <div className="mb-4 text-gray-600">
              找到 <span className="font-semibold text-red-600">{restaurants.length}</span> 家餐厅
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map(restaurant => (
                <div
                  key={restaurant.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow"
                >
                  <div className="h-32 bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center text-6xl">
                    🍽️
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{restaurant.name}</h3>
                      <span className="text-sm font-medium text-red-600">{restaurant.priceRange}</span>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      {renderStars(restaurant.rating)}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>🍜</span>
                        <span>{restaurant.cuisine}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>📍</span>
                        <span>{restaurant.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>⏰</span>
                        <span>{restaurant.openHours}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>🚶</span>
                        <span>{restaurant.distance} · 预计等位 {restaurant.estimatedWait}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-sm font-semibold text-gray-700 mb-2">招牌菜</div>
                      <div className="flex flex-wrap gap-2">
                        {restaurant.specialties.map((dish, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-orange-50 text-orange-600 text-xs rounded-full"
                          >
                            {dish}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {restaurant.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-red-50 text-red-600 text-xs rounded-full font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">
                        查看详情
                      </button>
                      <button className="px-4 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                        导航
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 使用提示 */}
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 mb-2">💡 使用提示</h3>
          <ul className="text-sm text-red-700 space-y-1">
            <li>• 根据用餐时间、人数和预算智能推荐餐厅</li>
            <li>• 可以选择多个偏好条件，找到最符合需求的餐厅</li>
            <li>• 显示预计等位时间，合理安排用餐计划</li>
            <li>• 查看招牌菜和用户评价，提前了解餐厅特色</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
