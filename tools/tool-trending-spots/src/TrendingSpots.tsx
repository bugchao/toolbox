import React, { useState } from 'react';

interface TrendingSpot {
  id: string;
  name: string;
  city: string;
  category: string;
  description: string;
  tags: string[];
  popularity: number;
  bestTime: string;
  tips: string[];
  imageUrl: string;
  coordinates?: { lat: number; lng: number };
}

const MOCK_SPOTS: TrendingSpot[] = [
  {
    id: '1',
    name: '故宫角楼',
    city: '北京',
    category: '历史建筑',
    description: '故宫东北角楼是拍摄故宫全景的绝佳位置，尤其是日出和日落时分，光影交错，美不胜收。',
    tags: ['古建筑', '日出', '摄影圣地', '历史文化'],
    popularity: 95,
    bestTime: '清晨 6:00-7:30 或 傍晚 17:00-18:30',
    tips: [
      '建议提前预约故宫门票',
      '携带广角镜头拍摄全景',
      '避开节假日人流高峰',
      '注意保暖，清晨温度较低'
    ],
    imageUrl: '🏯',
  },
  {
    id: '2',
    name: '外滩观景台',
    city: '上海',
    category: '城市地标',
    description: '上海外滩是观赏浦东天际线的最佳位置，夜景尤为壮观，霓虹灯下的东方明珠塔和陆家嘴金融区构成经典画面。',
    tags: ['夜景', '城市风光', '地标建筑', '浪漫'],
    popularity: 98,
    bestTime: '傍晚 18:30-21:00',
    tips: [
      '晚上人流量大，建议提前占位',
      '携带三脚架拍摄夜景',
      '可以乘坐游船从江上观赏',
      '附近有多家餐厅可以边用餐边赏景'
    ],
    imageUrl: '🌃',
  },
  {
    id: '3',
    name: '茶卡盐湖',
    city: '青海',
    category: '自然景观',
    description: '被誉为"天空之镜"的茶卡盐湖，湖面如镜，倒映着蓝天白云，是拍摄倒影照片的绝佳地点。',
    tags: ['天空之镜', '自然奇观', '倒影', '网红打卡'],
    popularity: 92,
    bestTime: '上午 9:00-11:00 或 下午 15:00-17:00',
    tips: [
      '穿着鲜艳的衣服拍照效果更好',
      '带上墨镜，盐湖反光强烈',
      '注意防晒，高原紫外线强',
      '雨后湖面更平静，倒影效果最佳'
    ],
    imageUrl: '🏞️',
  },
  {
    id: '4',
    name: '鼓浪屿',
    city: '厦门',
    category: '海岛风光',
    description: '鼓浪屿是厦门的标志性景点，岛上有众多欧式建筑和文艺小店，适合慢节奏游览和拍照。',
    tags: ['海岛', '文艺', '建筑', '休闲'],
    popularity: 90,
    bestTime: '全天，建议避开正午高温',
    tips: [
      '提前预订轮渡船票',
      '穿舒适的鞋子，岛上多为步行',
      '尝试当地特色小吃',
      '日落时分在海边拍照最美'
    ],
    imageUrl: '🏝️',
  },
  {
    id: '5',
    name: '张家界天门山',
    city: '张家界',
    category: '山岳景观',
    description: '天门山玻璃栈道和天门洞是网红打卡必去之地，云雾缭绕时仿佛仙境。',
    tags: ['玻璃栈道', '山景', '刺激', '云海'],
    popularity: 94,
    bestTime: '上午 8:00-12:00',
    tips: [
      '提前购买索道票',
      '穿防滑鞋，玻璃栈道需要鞋套',
      '恐高者慎入玻璃栈道',
      '雨后云雾景观最佳'
    ],
    imageUrl: '⛰️',
  },
  {
    id: '6',
    name: '西湖断桥',
    city: '杭州',
    category: '湖泊景观',
    description: '西湖断桥是杭州最浪漫的地标之一，春天桃花盛开，冬天雪景如画。',
    tags: ['湖景', '浪漫', '四季皆宜', '历史'],
    popularity: 88,
    bestTime: '春季 3-5月 或 冬季雪后',
    tips: [
      '春天赏桃花，冬天赏雪景',
      '清晨人少，拍照效果好',
      '可以租自行车环湖游览',
      '附近有多家茶馆可以休息'
    ],
    imageUrl: '🌸',
  },
];

const CATEGORIES = ['全部', '历史建筑', '城市地标', '自然景观', '海岛风光', '山岳景观', '湖泊景观'];
const CITIES = ['全部', '北京', '上海', '青海', '厦门', '张家界', '杭州', '成都', '重庆', '西安'];

export default function TrendingSpots() {
  const [selectedCity, setSelectedCity] = useState('全部');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popularity' | 'name'>('popularity');

  const getFilteredSpots = () => {
    let filtered = MOCK_SPOTS;

    if (selectedCity !== '全部') {
      filtered = filtered.filter(spot => spot.city === selectedCity);
    }

    if (selectedCategory !== '全部') {
      filtered = filtered.filter(spot => spot.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(spot =>
        spot.name.toLowerCase().includes(query) ||
        spot.description.toLowerCase().includes(query) ||
        spot.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered.sort((a, b) => {
      if (sortBy === 'popularity') {
        return b.popularity - a.popularity;
      }
      return a.name.localeCompare(b.name, 'zh-CN');
    });
  };

  const filteredSpots = getFilteredSpots();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📸 网红景点生成器</h1>
          <p className="text-gray-600">发现热门打卡点，记录美好瞬间</p>
        </div>

        {/* 筛选区域 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">🔍 搜索景点</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="输入景点名称、标签或关键词..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">🏙️ 城市</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">🎯 分类</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('popularity')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  sortBy === 'popularity' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🔥 热度排序
              </button>
              <button
                onClick={() => setSortBy('name')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  sortBy === 'name' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🔤 名称排序
              </button>
            </div>
          </div>
        </div>

        {/* 景点列表 */}
        <div className="mb-4 text-gray-600">
          找到 <span className="font-semibold text-purple-600">{filteredSpots.length}</span> 个网红景点
        </div>

        {filteredSpots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSpots.map(spot => (
              <div
                key={spot.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow"
              >
                <div className="h-48 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-8xl">
                  {spot.imageUrl}
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-1">{spot.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>📍 {spot.city}</span>
                        <span>•</span>
                        <span>{spot.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-red-50 px-3 py-1 rounded-full">
                      <span className="text-red-500 font-bold">{spot.popularity}</span>
                      <span className="text-xs text-red-500">🔥</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{spot.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {spot.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-50 text-purple-600 text-xs rounded-full font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 pt-4 space-y-3">
                    <div>
                      <div className="text-sm font-semibold text-gray-700 mb-1">⏰ 最佳时间</div>
                      <div className="text-sm text-gray-600">{spot.bestTime}</div>
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-gray-700 mb-2">💡 游玩建议</div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {spot.tips.slice(0, 2).map((tip, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-purple-500 mt-0.5">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-colors">
                    查看详情
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-600 text-lg">没有找到符合条件的景点</p>
            <p className="text-gray-500 text-sm mt-2">试试调整筛选条件或搜索关键词</p>
          </div>
        )}

        {/* 使用提示 */}
        <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-800 mb-2">💡 使用提示</h3>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• 根据城市和分类快速筛选感兴趣的景点</li>
            <li>• 查看最佳拍照时间和游玩建议，提升旅行体验</li>
            <li>• 热度排序帮你找到当下最火的打卡点</li>
            <li>• 提前了解景点特色，做好出行准备</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
