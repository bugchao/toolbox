import React, { useState, useMemo } from 'react'
import { Copy, Download, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface AiModel {
  id: string
  name: string
  provider: string
  inputPrice: number // 每 1K tokens 的价格（美元）
  outputPrice: number // 每 1K tokens 的价格（美元）
  contextWindow: number
}

interface CalculationResult {
  model: AiModel
  inputTokens: number
  outputTokens: number
  totalTokens: number
  inputCost: number
  outputCost: number
  totalCost: number
}

const defaultModels: AiModel[] = [
  // OpenAI Models
  {
    id: 'gpt4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    inputPrice: 0.01,
    outputPrice: 0.03,
    contextWindow: 128000
  },
  {
    id: 'gpt4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    inputPrice: 0.005,
    outputPrice: 0.015,
    contextWindow: 128000
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    inputPrice: 0.0005,
    outputPrice: 0.0015,
    contextWindow: 16384
  },
  // Anthropic Claude Models
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    inputPrice: 0.015,
    outputPrice: 0.075,
    contextWindow: 200000
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    inputPrice: 0.003,
    outputPrice: 0.015,
    contextWindow: 200000
  },
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    inputPrice: 0.00025,
    outputPrice: 0.00125,
    contextWindow: 200000
  },
  // Google Gemini Models
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    inputPrice: 0.0005,
    outputPrice: 0.001,
    contextWindow: 32000
  },
  {
    id: 'gemini-pro-vision',
    name: 'Gemini Pro Vision',
    provider: 'Google',
    inputPrice: 0.001,
    outputPrice: 0.002,
    contextWindow: 32000
  },
  // Anthropic Models
  {
    id: 'claude-2',
    name: 'Claude 2',
    provider: 'Anthropic',
    inputPrice: 0.008,
    outputPrice: 0.024,
    contextWindow: 100000
  },
  // Mistral Models
  {
    id: 'mistral-medium',
    name: 'Mistral Medium',
    provider: 'Mistral AI',
    inputPrice: 0.0007,
    outputPrice: 0.002,
    contextWindow: 32000
  },
  {
    id: 'mistral-small',
    name: 'Mistral Small',
    provider: 'Mistral AI',
    inputPrice: 0.00014,
    outputPrice: 0.00042,
    contextWindow: 32000
  }
]

const AiTokenCostCalculator: React.FC = () => {
  const { t } = useTranslation();
  const [models, setModels] = useState<AiModel[]>(defaultModels)
  const [inputTokens, setInputTokens] = useState<string>('1000')
  const [outputTokens, setOutputTokens] = useState<string>('500')
  const [exchangeRate, setExchangeRate] = useState<string>('7')
  const [selectedModels, setSelectedModels] = useState<string[]>(
    defaultModels.slice(0, 3).map(m => m.id)
  )
  const [newModel, setNewModel] = useState<Partial<AiModel>>({
    name: '',
    provider: '',
    inputPrice: 0,
    outputPrice: 0,
    contextWindow: 4096
  })

  const input = parseInt(inputTokens) || 0
  const output = parseInt(outputTokens) || 0
  const rate = parseFloat(exchangeRate) || 7

  const results: CalculationResult[] = useMemo(() => {
    return selectedModels
      .map(id => models.find(m => m.id === id))
      .filter((m): m is AiModel => m !== undefined)
      .map(model => ({
        model,
        inputTokens: input,
        outputTokens: output,
        totalTokens: input + output,
        inputCost: (input / 1000) * model.inputPrice,
        outputCost: (output / 1000) * model.outputPrice,
        totalCost: (input / 1000) * model.inputPrice + (output / 1000) * model.outputPrice
      }))
      .sort((a, b) => a.totalCost - b.totalCost)
  }, [models, selectedModels, input, output])

  const handleAddModel = () => {
    if (!newModel.name || !newModel.provider) {
      alert('请填写模型名称和提供商')
      return
    }
    const model: AiModel = {
      id: Math.random().toString(36).substr(2, 9),
      name: newModel.name || '',
      provider: newModel.provider || '',
      inputPrice: newModel.inputPrice || 0,
      outputPrice: newModel.outputPrice || 0,
      contextWindow: newModel.contextWindow || 4096
    }
    setModels([...models, model])
    setSelectedModels([...selectedModels, model.id])
    setNewModel({ name: '', provider: '', inputPrice: 0, outputPrice: 0, contextWindow: 4096 })
  }

  const handleToggleModel = (id: string) => {
    setSelectedModels(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    )
  }

  const handleRemoveModel = (id: string) => {
    setModels(models.filter(m => m.id !== id))
    setSelectedModels(selectedModels.filter(m => m !== id))
  }

  const downloadResults = () => {
    const csv = [
      '模型名,提供商,输入 Token 数,输出 Token 数,总 Token 数,输入费用(USD),输出费用(USD),总费用(USD),总费用(CNY)',
      ...results.map(r =>
        `${r.model.name},${r.model.provider},${r.inputTokens},${r.outputTokens},${r.totalTokens},${r.inputCost.toFixed(6)},${r.outputCost.toFixed(6)},${r.totalCost.toFixed(6)},${(r.totalCost * rate).toFixed(2)}`
      )
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `ai-token-cost-${Date.now()}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const copyAsMarkdown = () => {
    const markdown = [
      '| 模型 | 提供商 | 费用 (USD) | 费用 (CNY) |',
      '|------|--------|-----------|-----------|',
      ...results.map(
        r =>
          `| ${r.model.name} | ${r.model.provider} | $${r.totalCost.toFixed(6)} | ¥${(r.totalCost * rate).toFixed(2)} |`
      )
    ].join('\n')

    navigator.clipboard.writeText(markdown).then(() => {
      alert('已复制到剪贴板')
    })
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">AI Token 费用计算器</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              输入 Token 数
            </label>
            <input
              type="number"
              value={inputTokens}
              onChange={(e) => setInputTokens(e.target.value)}
              min="0"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              输出 Token 数
            </label>
            <input
              type="number"
              value={outputTokens}
              onChange={(e) => setOutputTokens(e.target.value)}
              min="0"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              美元对人民币汇率
            </label>
            <input
              type="number"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(e.target.value)}
              min="0"
              step="0.1"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              操作
            </label>
            <div className="flex space-x-2">
              <button
                onClick={copyAsMarkdown}
                className="btn bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 flex items-center"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={downloadResults}
                disabled={results.length === 0}
                className="btn bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 flex items-center"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">费用对比</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">
                    模型
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">
                    提供商
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">
                    输入费用
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">
                    输出费用
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">
                    总费用 (USD)
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">
                    总费用 (CNY)
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      请选择要比较的模型
                    </td>
                  </tr>
                ) : (
                  results.map((result, idx) => (
                    <tr
                      key={result.model.id}
                      className={`border-b border-gray-100 dark:border-gray-800 ${
                        idx === 0
                          ? 'bg-green-50 dark:bg-green-900/10'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}
                    >
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                        {result.model.name}
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                        {result.model.provider}
                      </td>
                      <td className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">
                        ${result.inputCost.toFixed(6)}
                      </td>
                      <td className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">
                        ${result.outputCost.toFixed(6)}
                      </td>
                      <td className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">
                        ${result.totalCost.toFixed(6)}
                      </td>
                      <td className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">
                        ¥{(result.totalCost * rate).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">模型管理</h2>

        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">添加自定义模型</h3>
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-3">
            <input
              type="text"
              placeholder="模型名称"
              value={newModel.name || ''}
              onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
              className="input lg:col-span-1"
            />
            <input
              type="text"
              placeholder="提供商"
              value={newModel.provider || ''}
              onChange={(e) => setNewModel({ ...newModel, provider: e.target.value })}
              className="input lg:col-span-1"
            />
            <input
              type="number"
              placeholder="输入价格/1K tokens"
              value={newModel.inputPrice || ''}
              onChange={(e) => setNewModel({ ...newModel, inputPrice: parseFloat(e.target.value) })}
              step="0.00001"
              className="input lg:col-span-1"
            />
            <input
              type="number"
              placeholder="输出价格/1K tokens"
              value={newModel.outputPrice || ''}
              onChange={(e) => setNewModel({ ...newModel, outputPrice: parseFloat(e.target.value) })}
              step="0.00001"
              className="input lg:col-span-1"
            />
            <input
              type="number"
              placeholder="上下文窗口"
              value={newModel.contextWindow || ''}
              onChange={(e) => setNewModel({ ...newModel, contextWindow: parseInt(e.target.value) })}
              className="input lg:col-span-1"
            />
            <button
              onClick={handleAddModel}
              className="btn btn-primary flex items-center justify-center lg:col-span-1"
            >
              <Plus className="w-4 h-4 mr-1" />
              添加
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">可用模型</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {models.map(model => (
              <div
                key={model.id}
                className="p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedModels.includes(model.id)}
                      onChange={() => handleToggleModel(model.id)}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{model.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{model.provider}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        输入: ${model.inputPrice}/1K | 输出: ${model.outputPrice}/1K | 上下文: {model.contextWindow.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {!defaultModels.find(m => m.id === model.id) && (
                    <button
                      onClick={() => handleRemoveModel(model.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">使用说明</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
          <li>输入 API 调用产生的输入和输出 Token 数量</li>
          <li>设置美元对人民币的实时汇率</li>
          <li>从列表中选择要对比的 AI 模型</li>
          <li>自动计算和比较各模型的成本</li>
          <li>支持添加自定义模型用于费用计算</li>
          <li>可以复制为 Markdown 表格或导出为 CSV 文件</li>
          <li>价格数据定期更新，请根据实际官方价格调整</li>
        </ul>
      </div>
    </div>
  )
}

export default AiTokenCostCalculator
