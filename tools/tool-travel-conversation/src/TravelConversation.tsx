import React, { useState } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Scenario {
  id: string;
  name: string;
  icon: string;
  description: string;
  phrases: { question: string; answer: string }[];
}

const SCENARIOS: Scenario[] = [
  {
    id: 'hotel',
    name: '酒店入住',
    icon: '🏨',
    description: '办理入住、询问设施、解决问题',
    phrases: [
      { question: 'I have a reservation under the name...', answer: '我预订了一个房间，名字是...' },
      { question: 'What time is check-out?', answer: '退房时间是几点？' },
      { question: 'Do you have free WiFi?', answer: '有免费WiFi吗？' },
      { question: 'Can I have a wake-up call at 7 AM?', answer: '可以帮我设置早上7点的叫醒服务吗？' },
      { question: 'Where is the breakfast area?', answer: '早餐在哪里？' },
    ],
  },
  {
    id: 'restaurant',
    name: '餐厅点餐',
    icon: '🍽️',
    description: '预订座位、点餐、结账',
    phrases: [
      { question: 'Table for two, please.', answer: '两位，谢谢。' },
      { question: 'Can I see the menu?', answer: '可以给我看一下菜单吗？' },
      { question: 'What do you recommend?', answer: '你推荐什么？' },
      { question: 'I\'ll have the steak, medium rare.', answer: '我要牛排，五分熟。' },
      { question: 'Can I have the bill, please?', answer: '可以结账吗？' },
    ],
  },
  {
    id: 'shopping',
    name: '购物',
    icon: '🛍️',
    description: '询价、试穿、砍价',
    phrases: [
      { question: 'How much is this?', answer: '这个多少钱？' },
      { question: 'Can I try this on?', answer: '我可以试穿吗？' },
      { question: 'Do you have this in a smaller size?', answer: '有小一号的吗？' },
      { question: 'Can you give me a discount?', answer: '可以打折吗？' },
      { question: 'I\'ll take it.', answer: '我买了。' },
    ],
  },
  {
    id: 'transport',
    name: '交通出行',
    icon: '🚕',
    description: '打车、问路、乘坐公共交通',
    phrases: [
      { question: 'How do I get to...?', answer: '去...怎么走？' },
      { question: 'How much is a ticket to...?', answer: '去...的票多少钱？' },
      { question: 'Does this bus go to...?', answer: '这辆公交车去...吗？' },
      { question: 'Can you take me to this address?', answer: '可以带我去这个地址吗？' },
      { question: 'How long does it take?', answer: '需要多长时间？' },
    ],
  },
  {
    id: 'emergency',
    name: '紧急情况',
    icon: '🚨',
    description: '求助、报警、就医',
    phrases: [
      { question: 'I need help!', answer: '我需要帮助！' },
      { question: 'Where is the nearest hospital?', answer: '最近的医院在哪里？' },
      { question: 'I lost my passport.', answer: '我的护照丢了。' },
      { question: 'Can you call the police?', answer: '可以帮我报警吗？' },
      { question: 'I don\'t feel well.', answer: '我感觉不舒服。' },
    ],
  },
  {
    id: 'sightseeing',
    name: '观光游览',
    icon: '📸',
    description: '买票、询问信息、拍照',
    phrases: [
      { question: 'How much is the entrance fee?', answer: '门票多少钱？' },
      { question: 'What time does it close?', answer: '几点关门？' },
      { question: 'Can I take photos here?', answer: '这里可以拍照吗？' },
      { question: 'Is there a guided tour?', answer: '有导游吗？' },
      { question: 'Where is the restroom?', answer: '洗手间在哪里？' },
    ],
  },
];

export default function TravelConversation() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [showPhrases, setShowPhrases] = useState(true);

  const startConversation = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: `欢迎来到"${scenario.name}"场景练习！你可以输入英文对话，或者点击下方的常用短语快速练习。`,
        timestamp: new Date(),
      },
    ]);
  };

  const sendMessage = (content: string) => {
    if (!content.trim() || !selectedScenario) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setUserInput('');

    // 模拟AI回复
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateResponse(content, selectedScenario),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const generateResponse = (userMessage: string, scenario: Scenario): string => {
    const lowerMessage = userMessage.toLowerCase();

    // 简单的关键词匹配回复
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return 'Hello! How can I help you today?';
    }
    if (lowerMessage.includes('thank')) {
      return 'You\'re welcome! Is there anything else I can help you with?';
    }
    if (lowerMessage.includes('bye')) {
      return 'Goodbye! Have a great day!';
    }

    // 场景特定回复
    if (scenario.id === 'hotel') {
      if (lowerMessage.includes('reservation')) {
        return 'Yes, I have your reservation here. May I see your ID, please?';
      }
      if (lowerMessage.includes('wifi')) {
        return 'Yes, we have free WiFi. The password is on your room key card.';
      }
    }

    if (scenario.id === 'restaurant') {
      if (lowerMessage.includes('menu')) {
        return 'Here is the menu. Would you like to start with drinks?';
      }
      if (lowerMessage.includes('recommend')) {
        return 'Our chef\'s special today is the grilled salmon. It\'s very popular!';
      }
    }

    return 'I understand. Let me help you with that. (This is a practice scenario - in real situations, responses will vary)';
  };

  const usePhrase = (phrase: { question: string; answer: string }) => {
    sendMessage(phrase.question);
  };

  const resetConversation = () => {
    setSelectedScenario(null);
    setMessages([]);
    setUserInput('');
  };

  if (!selectedScenario) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">💬 旅行对话模拟</h1>
            <p className="text-gray-600">选择场景，练习旅行中的常用英语对话</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SCENARIOS.map(scenario => (
              <button
                key={scenario.id}
                onClick={() => startConversation(scenario)}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all text-left"
              >
                <div className="text-6xl mb-4">{scenario.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{scenario.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{scenario.description}</p>
                <div className="text-blue-600 font-medium">开始练习 →</div>
              </button>
            ))}
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">💡 使用提示</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 选择旅行场景，模拟真实对话情境</li>
              <li>• 可以自由输入英文对话，或使用预设短语</li>
              <li>• AI 会根据场景给出合适的回复</li>
              <li>• 适合出国前练习常用对话</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* 头部 */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{selectedScenario.icon}</span>
                <div>
                  <h2 className="text-xl font-bold">{selectedScenario.name}</h2>
                  <p className="text-blue-100 text-sm">{selectedScenario.description}</p>
                </div>
              </div>
              <button
                onClick={resetConversation}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
              >
                返回场景选择
              </button>
            </div>
          </div>

          {/* 对话区域 */}
          <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-800 shadow'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 常用短语 */}
          {showPhrases && (
            <div className="border-t border-gray-200 p-4 bg-white">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">💡 常用短语</h3>
                <button
                  onClick={() => setShowPhrases(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  隐藏
                </button>
              </div>
              <div className="space-y-2">
                {selectedScenario.phrases.map((phrase, index) => (
                  <button
                    key={index}
                    onClick={() => usePhrase(phrase)}
                    className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-blue-50 rounded-lg text-sm transition-colors"
                  >
                    <div className="font-medium text-gray-800">{phrase.question}</div>
                    <div className="text-gray-500 text-xs mt-1">{phrase.answer}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!showPhrases && (
            <div className="border-t border-gray-200 p-2 bg-white">
              <button
                onClick={() => setShowPhrases(true)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                显示常用短语
              </button>
            </div>
          )}

          {/* 输入区域 */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage(userInput)}
                placeholder="输入你的英文对话..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => sendMessage(userInput)}
                disabled={!userInput.trim()}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                发送
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
