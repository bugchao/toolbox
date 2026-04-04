import React, { useState } from 'react';

interface PronunciationResult {
  text: string;
  score: number;
  accuracy: number;
  fluency: number;
  completeness: number;
  feedback: string[];
  wordScores: { word: string; score: number; issues?: string[] }[];
}

const SAMPLE_SENTENCES = [
  { level: 'easy', text: 'Hello, how are you?', translation: '你好，你好吗？' },
  { level: 'easy', text: 'Thank you very much.', translation: '非常感谢。' },
  { level: 'medium', text: 'I would like to book a room for two nights.', translation: '我想预订两晚的房间。' },
  { level: 'medium', text: 'Could you tell me how to get to the airport?', translation: '你能告诉我怎么去机场吗？' },
  { level: 'hard', text: 'The weather forecast predicts heavy rain tomorrow.', translation: '天气预报预测明天有大雨。' },
  { level: 'hard', text: 'I appreciate your assistance with this matter.', translation: '我感谢你在这件事上的帮助。' },
];

export default function PronunciationEval() {
  const [selectedText, setSelectedText] = useState('');
  const [customText, setCustomText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

  const startRecording = () => {
    setIsRecording(true);
    setHasRecorded(false);
    setResult(null);

    // 模拟录音
    setTimeout(() => {
      setIsRecording(false);
      setHasRecorded(true);
    }, 3000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setHasRecorded(true);
  };

  const evaluatePronunciation = () => {
    const text = customText || selectedText;
    if (!text.trim()) {
      alert('请选择或输入要练习的句子');
      return;
    }

    if (!hasRecorded) {
      alert('请先录音');
      return;
    }

    setEvaluating(true);

    // 模拟评估
    setTimeout(() => {
      const words = text.split(' ');
      const wordScores = words.map(word => {
        const score = Math.floor(Math.random() * 30) + 70;
        const issues: string[] = [];
        
        if (score < 80) {
          if (Math.random() > 0.5) issues.push('发音不够清晰');
          if (Math.random() > 0.5) issues.push('重音位置不准确');
        }
        
        return { word, score, issues: issues.length > 0 ? issues : undefined };
      });

      const avgScore = Math.floor(wordScores.reduce((sum, w) => sum + w.score, 0) / wordScores.length);
      const accuracy = Math.floor(Math.random() * 15) + 80;
      const fluency = Math.floor(Math.random() * 15) + 75;
      const completeness = Math.floor(Math.random() * 10) + 85;

      const feedback: string[] = [];
      if (accuracy < 85) feedback.push('部分单词发音需要改进，建议多听标准发音');
      if (fluency < 80) feedback.push('语速可以更流畅一些，注意单词之间的连读');
      if (completeness < 90) feedback.push('句子完整度较好，继续保持');
      if (avgScore >= 85) feedback.push('整体表现优秀！继续保持');

      setResult({
        text,
        score: avgScore,
        accuracy,
        fluency,
        completeness,
        feedback,
        wordScores,
      });
      setEvaluating(false);
    }, 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return '优秀';
    if (score >= 80) return '良好';
    if (score >= 70) return '及格';
    return '需改进';
  };

  const filteredSentences = SAMPLE_SENTENCES.filter(s => s.level === difficulty);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🎤 发音评估工具</h1>
          <p className="text-gray-600">AI 评估你的英语发音，提供改进建议</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：输入区域 */}
          <div className="space-y-6">
            {/* 难度选择 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4">选择难度</h2>
              <div className="flex gap-2">
                {['easy', 'medium', 'hard'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level as any)}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      difficulty === level
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {level === 'easy' ? '简单' : level === 'medium' ? '中等' : '困难'}
                  </button>
                ))}
              </div>
            </div>

            {/* 示例句子 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4">选择示例句子</h2>
              <div className="space-y-2">
                {filteredSentences.map((sentence, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedText(sentence.text);
                      setCustomText('');
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedText === sentence.text
                        ? 'bg-indigo-50 border-2 border-indigo-500'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="font-medium text-gray-800">{sentence.text}</div>
                    <div className="text-sm text-gray-500 mt-1">{sentence.translation}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 自定义输入 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4">或输入自定义句子</h2>
              <textarea
                value={customText}
                onChange={(e) => {
                  setCustomText(e.target.value);
                  setSelectedText('');
                }}
                placeholder="输入你想练习的英文句子..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>

            {/* 录音控制 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4">录制发音</h2>
              
              {(selectedText || customText) && (
                <div className="mb-4 p-3 bg-indigo-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">练习句子：</div>
                  <div className="font-medium text-gray-800">{customText || selectedText}</div>
                </div>
              )}

              <div className="flex flex-col items-center gap-4">
                {!isRecording && !hasRecorded && (
                  <button
                    onClick={startRecording}
                    disabled={!selectedText && !customText}
                    className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    🎤 开始录音
                  </button>
                )}

                {isRecording && (
                  <div className="w-full">
                    <button
                      onClick={stopRecording}
                      className="w-full bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                    >
                      ⏹️ 停止录音
                    </button>
                    <div className="mt-3 flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-600">录音中...</span>
                    </div>
                  </div>
                )}

                {hasRecorded && !isRecording && (
                  <div className="w-full space-y-2">
                    <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                      <span>✓</span>
                      <span className="text-sm">录音完成</span>
                    </div>
                    <button
                      onClick={startRecording}
                      className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      🔄 重新录音
                    </button>
                    <button
                      onClick={evaluatePronunciation}
                      disabled={evaluating}
                      className="w-full bg-indigo-500 text-white py-3 rounded-lg font-semibold hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      {evaluating ? '评估中...' : '✨ 开始评估'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右侧：评估结果 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">评估结果</h2>

            {result ? (
              <div className="space-y-6">
                {/* 总分 */}
                <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">综合得分</div>
                  <div className={`text-6xl font-bold ${getScoreColor(result.score)}`}>
                    {result.score}
                  </div>
                  <div className="text-lg font-medium text-gray-700 mt-2">
                    {getScoreLabel(result.score)}
                  </div>
                </div>

                {/* 详细评分 */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">准确度</span>
                      <span className={`font-semibold ${getScoreColor(result.accuracy)}`}>
                        {result.accuracy}分
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-500 h-2 rounded-full transition-all"
                        style={{ width: `${result.accuracy}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">流畅度</span>
                      <span className={`font-semibold ${getScoreColor(result.fluency)}`}>
                        {result.fluency}分
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${result.fluency}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">完整度</span>
                      <span className={`font-semibold ${getScoreColor(result.completeness)}`}>
                        {result.completeness}分
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-pink-500 h-2 rounded-full transition-all"
                        style={{ width: `${result.completeness}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* 单词评分 */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">单词评分</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.wordScores.map((word, index) => (
                      <div
                        key={index}
                        className={`px-3 py-2 rounded-lg ${
                          word.score >= 85
                            ? 'bg-green-50 border border-green-200'
                            : word.score >= 75
                            ? 'bg-yellow-50 border border-yellow-200'
                            : 'bg-red-50 border border-red-200'
                        }`}
                      >
                        <div className="font-medium text-gray-800">{word.word}</div>
                        <div className={`text-xs ${getScoreColor(word.score)}`}>
                          {word.score}分
                        </div>
                        {word.issues && (
                          <div className="text-xs text-gray-600 mt-1">
                            {word.issues.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 改进建议 */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">改进建议</h3>
                  <ul className="space-y-2">
                    {result.feedback.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-indigo-500 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-center py-20">
                <div>
                  <div className="text-6xl mb-4">🎤</div>
                  <p>选择句子并录音后</p>
                  <p>查看评估结果</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 使用提示 */}
        <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h3 className="font-semibold text-indigo-800 mb-2">💡 使用提示</h3>
          <ul className="text-sm text-indigo-700 space-y-1">
            <li>• 在安静的环境中录音，确保声音清晰</li>
            <li>• 尽量模仿标准发音，注意重音和语调</li>
            <li>• 根据评估结果针对性练习薄弱环节</li>
            <li>• 建议每天练习10-15分钟，持续提升</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
