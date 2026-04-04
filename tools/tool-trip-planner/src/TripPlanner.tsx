import React, { useState } from 'react';

interface DayPlan {
  day: number;
  activities: string[];
  meals: { breakfast: string; lunch: string; dinner: string };
  accommodation: string;
  budget: number;
}

interface TripPlan {
  destination: string;
  days: number;
  budget: number;
  interests: string[];
  plan: DayPlan[];
  tips: string[];
}

export default function TripPlanner() {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState(3000);
  const [interests, setInterests] = useState<string[]>([]);
  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);
  const [generating, setGenerating] = useState(false);

  const interestOptions = [
    '历史文化', '自然风光', '美食体验', '购物娱乐',
    '户外运动', '摄影打卡', '亲子游玩', '休闲度假'
  ];

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const generatePlan = () => {
    if (!destination.trim()) {
      alert('请输入目的地');
      return;
    }

    if (interests.length === 0) {
      alert('请至少选择一个兴趣标签');
      return;
    }

    setGenerating(true);

    // 模拟 AI 生成
    setTimeout(() => {
      const dailyBudget = Math.floor(budget / days);
      const plan: DayPlan[] = [];

      for (let i = 1; i <= days; i++) {
        plan.push({
          day: i,
          activities: [
            `上午：${destination}著名景点游览`,
            `下午：${interests[0]}相关活动体验`,
            `晚上：${destination}特色街区漫步`
          ],
          meals: {
            breakfast: `酒店早餐或当地特色早点`,
            lunch: `${destination}特色美食`,
            dinner: `推荐餐厅或夜市小吃`
          },
          accommodation: i === days ? '返程' : `${destination}市区酒店`,
          budget: dailyBudget
        });
      }

      setTripPlan({
        destination,
        days,
        budget,
        interests,
        plan,
        tips: [
          `提前预订${destination}的热门景点门票`,
          '准备好舒适的鞋子，适合长时间步行',
          '下载离线地图和翻译 APP',
          '购买旅游保险，确保旅途安全',
          '关注当地天气，准备相应衣物'
        ]
      });

      setGenerating(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">✈️ AI 行程规划器</h1>
          <p className="text-gray-600">输入预算和天数，AI 生成个性化旅行计划</p>
        </div>

        {/* 输入表单 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">规划你的旅行</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">目的地 *</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="例如：日本东京"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">旅行天数</label>
              <input
                type="number"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                min="1"
                max="30"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              预算 (¥{budget})
            </label>
            <input
              type="range"
              min="1000"
              max="20000"
              step="500"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>¥1,000</span>
              <span>¥20,000</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">兴趣标签 *</label>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    interests.includes(interest)
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generatePlan}
            disabled={generating}
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-yellow-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {generating ? '生成中...' : '🎯 生成行程计划'}
          </button>
        </div>

        {/* 行程计划 */}
        {tripPlan && (
          <div className="space-y-6">
            {/* 概览 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">行程概览</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">目的地</div>
                  <div className="text-lg font-bold text-orange-600">{tripPlan.destination}</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">天数</div>
                  <div className="text-lg font-bold text-yellow-600">{tripPlan.days} 天</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">总预算</div>
                  <div className="text-lg font-bold text-green-600">¥{tripPlan.budget}</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">日均预算</div>
                  <div className="text-lg font-bold text-blue-600">
                    ¥{Math.floor(tripPlan.budget / tripPlan.days)}
                  </div>
                </div>
              </div>
            </div>

            {/* 每日行程 */}
            {tripPlan.plan.map((dayPlan) => (
              <div key={dayPlan.day} className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Day {dayPlan.day}</h3>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">📍 活动安排</div>
                    <ul className="space-y-1">
                      {dayPlan.activities.map((activity, index) => (
                        <li key={index} className="text-sm text-gray-600 pl-4">
                          • {activity}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">🍽️ 餐饮推荐</div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="bg-orange-50 p-2 rounded">
                        <div className="text-xs text-gray-600">早餐</div>
                        <div className="text-gray-700">{dayPlan.meals.breakfast}</div>
                      </div>
                      <div className="bg-yellow-50 p-2 rounded">
                        <div className="text-xs text-gray-600">午餐</div>
                        <div className="text-gray-700">{dayPlan.meals.lunch}</div>
                      </div>
                      <div className="bg-green-50 p-2 rounded">
                        <div className="text-xs text-gray-600">晚餐</div>
                        <div className="text-gray-700">{dayPlan.meals.dinner}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-sm text-gray-600">
                      🏨 住宿：{dayPlan.accommodation}
                    </div>
                    <div className="text-sm font-semibold text-orange-600">
                      预算：¥{dayPlan.budget}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* 旅行贴士 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">💡 旅行贴士</h3>
              <ul className="space-y-2">
                {tripPlan.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* 使用提示 */}
        <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="font-semibold text-orange-800 mb-2">💡 使用提示</h3>
          <ul className="text-sm text-orange-700 space-y-1">
            <li>• AI 根据你的预算和兴趣生成个性化行程</li>
            <li>• 行程仅供参考，实际游玩请根据情况调整</li>
            <li>• 建议提前预订机票、酒店和热门景点门票</li>
            <li>• 预留一定弹性预算应对突发情况</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
