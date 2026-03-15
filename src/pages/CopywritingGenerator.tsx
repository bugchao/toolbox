import React, { useState } from 'react'
import { Copy, Check, Sparkles, Type, Download, History, Settings, Trash2 } from 'lucide-react'

interface CopywritingItem {
  id: string
  prompt: string
  type: string
  content: string
  createdAt: string
}

const CopywritingGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('')
  const [copyType, setCopyType] = useState('marketing')
  const [tone, setTone] = useState('professional')
  const [length, setLength] = useState('medium')
  const [generatedContent, setGeneratedContent] = useState('')
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [history, setHistory] = useState<CopywritingItem[]>([])

  // 文案类型选项
  const typeOptions = [
    { value: 'marketing', label: '营销文案' },
    { value: 'social', label: '社交媒体' },
    { value: 'official', label: '官方公告' },
    { value: 'email', label: '邮件文案' },
    { value: 'product', label: '产品介绍' },
    { value: 'slogan', label: ' slogan/广告语' },
    { value: 'article', label: '文章大纲' },
    { value: 'poetry', label: '诗歌/文案' },
  ]

  // 语气选项
  const toneOptions = [
    { value: 'professional', label: '专业正式' },
    { value: 'friendly', label: '亲切友好' },
    { value: 'humorous', label: '幽默风趣' },
    { value: 'passionate', label: '激情活力' },
    { value: 'elegant', label: '优雅文艺' },
    { value: 'strict', label: '严肃权威' },
  ]

  // 长度选项
  const lengthOptions = [
    { value: 'short', label: '简短（100字以内）' },
    { value: 'medium', label: '中等（100-300字）' },
    { value: 'long', label: '详细（300字以上）' },
  ]

  // 内置模板
  const templates = [
    { name: '产品上新', prompt: '帮我写一个新产品上线的宣传文案' },
    { name: '节日祝福', prompt: '写一个春节的节日祝福文案' },
    { name: '招聘启事', prompt: '写一个前端开发工程师的招聘文案' },
    { name: '活动推广', prompt: '写一个618促销活动的宣传文案' },
    { name: '朋友圈', prompt: '写一个适合朋友圈发的正能量文案' },
  ]

  // 生成文案的模拟函数（实际项目中对接大模型API）
  const generateCopywriting = async () => {
    if (!prompt.trim()) {
      alert('请输入文案需求')
      return
    }

    setGenerating(true)
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500))

      // 模拟生成的文案
      const generated = `【${typeOptions.find(t => t.value === copyType)?.label}】
${prompt}

${generateMockContent(prompt, copyType, tone, length)}

#文案生成 #${copyType} #${tone}`

      setGeneratedContent(generated)

      // 保存到历史
      const newItem: CopywritingItem = {
        id: Date.now().toString(),
        prompt,
        type: copyType,
        content: generated,
        createdAt: new Date().toISOString()
      }
      setHistory(prev => [newItem, ...prev].slice(0, 20)) // 保留最近20条

    } catch (error) {
      alert('生成失败，请重试')
    } finally {
      setGenerating(false)
    }
  }

  // 生成模拟文案
  const generateMockContent = (prompt: string, type: string, tone: string, length: string) => {
    const lengthMap = {
      short: 100,
      medium: 250,
      long: 400
    }

    const tones = {
      professional: '专业、严谨、正式，适合商务场景',
      friendly: '亲切、温暖，像朋友一样聊天',
      humorous: '轻松、搞笑，有趣的网络梗，让人印象深刻',
      passionate: '充满激情，有感染力，调动用户情绪',
      elegant: '优美、有文采，文艺气息浓厚',
      strict: '严肃、权威，具有说服力'
    }

    return `这是为您生成的${typeOptions.find(t => t.value === type)?.label}，采用${tones[tone as keyof typeof tones]}的语气，适合各种场景使用。

${'🎉 重磅消息！'.repeat(Math.floor(Math.random() * 3) + 1)}
${'✨'.repeat(Math.floor(Math.random() * 5) + 2)} ${prompt} ${'✨'.repeat(Math.floor(Math.random() * 5) + 2)}

${'👍 优势亮点：'.repeat(Math.floor(Math.random() * 2) + 1)}
• 行业领先技术，品质保障
• 专业团队服务，值得信赖
• 限时优惠活动，错过再等一年
• 7*24小时客服，售后无忧

${'🎁 专属福利：'.repeat(Math.floor(Math.random() * 2) + 1)}
现在下单立享8折优惠，前100名赠送精美礼品一份，数量有限先到先得！

${'💡 温馨提示：'.repeat(Math.floor(Math.random() * 1) + 1)}
活动时间：即日起至本月底，最终解释权归本公司所有。

${'📞 联系方式：'.repeat(Math.floor(Math.random() * 1) + 1)}
如需了解更多详情，欢迎私信或拨打客服热线咨询。

${'#话题标签 #热点 #活动 #推广'.repeat(Math.floor(Math.random() * 2) + 1)}`.substring(0, lengthMap[length as keyof typeof lengthMap])
  }

  // 复制文案
  const copyToClipboard = async () => {
    if (!generatedContent) return
    await navigator.clipboard.writeText(generatedContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // 导出文案
  const exportContent = () => {
    if (!generatedContent) return
    const blob = new Blob([generatedContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `文案-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // 使用历史记录
  const useHistoryItem = (item: CopywritingItem) => {
    setPrompt(item.prompt)
    setCopyType(item.type)
    setGeneratedContent(item.content)
  }

  // 删除历史记录
  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id))
  }

  // 清空所有
  const clearAll = () => {
    if (confirm('确定要清空所有内容吗？')) {
      setPrompt('')
      setGeneratedContent('')
      setHistory([])
    }
  }

  // 使用模板
  const useTemplate = (templatePrompt: string) => {
    setPrompt(templatePrompt)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">AI文案生成器</h1>
        <p className="text-white opacity-80">智能生成各类文案，支持多种风格和场景，一键复制导出</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧参数配置 */}
        <div className="lg:col-span-1 space-y-6">
          {/* 基础配置 */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-indigo-600" />
              生成配置
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">文案类型</label>
                <select
                  value={copyType}
                  onChange={(e) => setCopyType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {typeOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">语气风格</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {toneOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">长度</label>
                <select
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {lengthOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 快捷模板 */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">快捷模板</h3>
            <div className="space-y-2">
              {templates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => useTemplate(template.prompt)}
                  className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>

          {/* 历史记录 */}
          {history.length > 0 && (
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <History className="w-5 h-5 mr-2 text-indigo-600" />
                  历史记录
                </h3>
                <button
                  onClick={() => setHistory([])}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  清空
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {history.map((item) => (
                  <div key={item.id} className="p-2 bg-gray-50 rounded-lg text-sm group">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 cursor-pointer" onClick={() => useHistoryItem(item)}>
                        <p className="text-gray-900 font-medium truncate">{item.prompt}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(item.createdAt).toLocaleString('zh-CN')}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteHistoryItem(item.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 右侧生成区域 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 输入区域 */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Type className="w-5 h-5 mr-2 text-indigo-600" />
                输入需求
              </h3>
              <button
                onClick={clearAll}
                className="text-sm text-red-600 hover:text-red-800"
              >
                清空
              </button>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="请描述您的文案需求，例如：写一个奶茶店的新品宣传文案，要活泼有趣，适合发朋友圈..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            />
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {prompt.length} 字
              </div>
              <button
                onClick={generateCopywriting}
                disabled={generating || !prompt.trim()}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    生成文案
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 生成结果 */}
          {generatedContent && (
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">生成结果</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={copyToClipboard}
                    className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center"
                  >
                    {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                    {copied ? '已复制' : '复制'}
                  </button>
                  <button
                    onClick={exportContent}
                    className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    导出
                  </button>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <pre className="whitespace-pre-wrap font-sans text-gray-800 text-sm">
                  {generatedContent}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 使用说明 */}
      <div className="card bg-gray-50">
        <h3 className="text-lg font-bold text-gray-900 mb-3">使用说明</h3>
        <ul className="space-y-2 text-gray-600">
          <li className="flex items-start">
            <span className="text-indigo-600 mr-2">•</span>
            选择文案类型、语气风格和长度，输入您的具体需求，点击生成即可
          </li>
          <li className="flex items-start">
            <span className="text-indigo-600 mr-2">•</span>
            提供了丰富的快捷模板，点击即可快速填充，节省输入时间
          </li>
          <li className="flex items-start">
            <span className="text-indigo-600 mr-2">•</span>
            生成历史自动保存，随时可以查看和复用之前的生成结果
          </li>
          <li className="flex items-start">
            <span className="text-indigo-600 mr-2">•</span>
            支持一键复制到剪贴板，或导出为TXT文件
          </li>
          <li className="flex items-start">
            <span className="text-indigo-600 mr-2">•</span>
            所有数据保存在本地浏览器中，不会上传到服务器，保护隐私
          </li>
        </ul>
      </div>
    </div>
  )
}

export default CopywritingGenerator

