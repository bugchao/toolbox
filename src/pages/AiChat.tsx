import { useState } from 'react';
import { trpc } from '../utils/trpc';

export default function AiChat() {
  const [message, setMessage] = useState('');
  const [model, setModel] = useState<'deepseek' | 'openai'>('deepseek');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai'; content: string }[]>([]);

  const aiChatMutation = trpc.aiChat.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setChatHistory(prev => [...prev, { role: 'ai', content: data.response || '' }]);
      } else {
        setChatHistory(prev => [...prev, { role: 'ai', content: `错误: ${data.error || '未知错误'}` }]);
      }
    },
    onError: (error) => {
      setChatHistory(prev => [...prev, { role: 'ai', content: `请求失败: ${error.message}` }]);
    },
  });

  const handleSend = () => {
    if (!message.trim()) return;
    
    setChatHistory(prev => [...prev, { role: 'user', content: message }]);
    aiChatMutation.mutate({ message, model });
    setMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">AI 助手</h1>
      
      <div className="mb-4 flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            value="deepseek"
            checked={model === 'deepseek'}
            onChange={(e) => setModel(e.target.value as 'deepseek')}
            className="w-4 h-4"
          />
          DeepSeek
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            value="openai"
            checked={model === 'openai'}
            onChange={(e) => setModel(e.target.value as 'openai')}
            className="w-4 h-4"
          />
          OpenAI GPT-3.5
        </label>
      </div>

      <div className="border rounded-lg p-4 h-[500px] mb-4 overflow-y-auto bg-gray-50">
        {chatHistory.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            开始和AI对话吧！支持DeepSeek和OpenAI两个模型
          </div>
        ) : (
          chatHistory.map((item, index) => (
            <div
              key={index}
              className={`mb-4 ${item.role === 'user' ? 'text-right' : 'text-left'}`}
            >
              <div
                className={`inline-block max-w-[80%] p-3 rounded-lg ${
                  item.role === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-white border rounded-bl-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{item.content}</p>
              </div>
            </div>
          ))
        )}
        {aiChatMutation.isPending && (
          <div className="text-left">
            <div className="inline-block max-w-[80%] p-3 rounded-lg bg-white border rounded-bl-none">
              <p className="text-gray-500">AI正在思考中...</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="输入你的问题..."
          className="flex-1 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={aiChatMutation.isPending}
        />
        <button
          onClick={handleSend}
          disabled={aiChatMutation.isPending || !message.trim()}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          发送
        </button>
      </div>
    </div>
  );
}
