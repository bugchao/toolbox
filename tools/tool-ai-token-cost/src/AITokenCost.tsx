import React, { useState, useMemo } from 'react';
import './AITokenCost.css';

interface ModelPricing {
  provider: string;
  model: string;
  inputPrice: number; // per 1M tokens
  outputPrice: number; // per 1M tokens
  contextWindow: number;
  category: 'flagship' | 'standard' | 'fast' | 'vision' | 'embedding';
}

const MODEL_PRICING: ModelPricing[] = [
  // OpenAI
  { provider: 'OpenAI', model: 'GPT-4o', inputPrice: 2.5, outputPrice: 10, contextWindow: 128000, category: 'flagship' },
  { provider: 'OpenAI', model: 'GPT-4o-mini', inputPrice: 0.15, outputPrice: 0.6, contextWindow: 128000, category: 'fast' },
  { provider: 'OpenAI', model: 'GPT-4 Turbo', inputPrice: 10, outputPrice: 30, contextWindow: 128000, category: 'flagship' },
  { provider: 'OpenAI', model: 'GPT-3.5 Turbo', inputPrice: 0.5, outputPrice: 1.5, contextWindow: 16385, category: 'standard' },
  { provider: 'OpenAI', model: 'o1-preview', inputPrice: 15, outputPrice: 60, contextWindow: 128000, category: 'flagship' },
  { provider: 'OpenAI', model: 'o1-mini', inputPrice: 3, outputPrice: 12, contextWindow: 128000, category: 'fast' },
  
  // Anthropic
  { provider: 'Anthropic', model: 'Claude 3.5 Sonnet', inputPrice: 3, outputPrice: 15, contextWindow: 200000, category: 'flagship' },
  { provider: 'Anthropic', model: 'Claude 3 Opus', inputPrice: 15, outputPrice: 75, contextWindow: 200000, category: 'flagship' },
  { provider: 'Anthropic', model: 'Claude 3 Sonnet', inputPrice: 3, outputPrice: 15, contextWindow: 200000, category: 'standard' },
  { provider: 'Anthropic', model: 'Claude 3 Haiku', inputPrice: 0.25, outputPrice: 1.25, contextWindow: 200000, category: 'fast' },
  
  // Google
  { provider: 'Google', model: 'Gemini 1.5 Pro', inputPrice: 1.25, outputPrice: 5, contextWindow: 2000000, category: 'flagship' },
  { provider: 'Google', model: 'Gemini 1.5 Flash', inputPrice: 0.075, outputPrice: 0.3, contextWindow: 1000000, category: 'fast' },
  { provider: 'Google', model: 'Gemini 1.0 Pro', inputPrice: 0.5, outputPrice: 1.5, contextWindow: 32000, category: 'standard' },
  
  // 国内模型
  { provider: '阿里云', model: '通义千问 Turbo', inputPrice: 0.3, outputPrice: 0.6, contextWindow: 8000, category: 'fast' },
  { provider: '阿里云', model: '通义千问 Plus', inputPrice: 4, outputPrice: 8, contextWindow: 32000, category: 'standard' },
  { provider: '阿里云', model: '通义千问 Max', inputPrice: 20, outputPrice: 60, contextWindow: 8000, category: 'flagship' },
  { provider: '百度', model: 'ERNIE 4.0', inputPrice: 30, outputPrice: 90, contextWindow: 8000, category: 'flagship' },
  { provider: '百度', model: 'ERNIE 3.5', inputPrice: 0.8, outputPrice: 2, contextWindow: 8000, category: 'standard' },
  { provider: '智谱AI', model: 'GLM-4', inputPrice: 50, outputPrice: 50, contextWindow: 128000, category: 'flagship' },
  { provider: '智谱AI', model: 'GLM-3 Turbo', inputPrice: 0.5, outputPrice: 0.5, contextWindow: 128000, category: 'fast' },
  { provider: '月之暗面', model: 'Moonshot v1', inputPrice: 12, outputPrice: 12, contextWindow: 200000, category: 'flagship' },
  { provider: '字节跳动', model: '豆包', inputPrice: 0.3, outputPrice: 0.6, contextWindow: 32000, category: 'fast' },
];

export const AITokenCost: React.FC = () => {
  const [inputTokens, setInputTokens] = useState<number>(1000);
  const [outputTokens, setOutputTokens] = useState<number>(1000);
  const [selectedProviders, setSelectedProviders] = useState<string[]>(['OpenAI', 'Anthropic', 'Google']);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['flagship', 'standard', 'fast']);
  const [sortBy, setSortBy] = useState<'cost' | 'provider' | 'model'>('cost');

  const providers = useMemo(() => {
    return Array.from(new Set(MODEL_PRICING.map(m => m.provider)));
  }, []);

  const filteredModels = useMemo(() => {
    return MODEL_PRICING.filter(
      m => selectedProviders.includes(m.provider) && selectedCategories.includes(m.category)
    );
  }, [selectedProviders, selectedCategories]);

  const calculatedCosts = useMemo(() => {
    return filteredModels.map(model => {
      const inputCost = (inputTokens / 1000000) * model.inputPrice;
      const outputCost = (outputTokens / 1000000) * model.outputPrice;
      const totalCost = inputCost + outputCost;

      return {
        ...model,
        inputCost,
        outputCost,
        totalCost,
      };
    }).sort((a, b) => {
      if (sortBy === 'cost') return a.totalCost - b.totalCost;
      if (sortBy === 'provider') return a.provider.localeCompare(b.provider);
      return a.model.localeCompare(b.model);
    });
  }, [filteredModels, inputTokens, outputTokens, sortBy]);

  const toggleProvider = (provider: string) => {
    setSelectedProviders(prev =>
      prev.includes(provider)
        ? prev.filter(p => p !== provider)
        : [...prev, provider]
    );
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const formatCost = (cost: number) => {
    if (cost < 0.01) return `$${(cost * 100).toFixed(4)}¢`;
    return `$${cost.toFixed(4)}`;
  };

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
    return tokens.toString();
  };

  const getCategoryBadge = (category: string) => {
    const badges = {
      flagship: { label: '旗舰', color: '#8b5cf6' },
      standard: { label: '标准', color: '#3b82f6' },
      fast: { label: '快速', color: '#10b981' },
      vision: { label: '视觉', color: '#f59e0b' },
      embedding: { label: '嵌入', color: '#6366f1' },
    };
    const badge = badges[category as keyof typeof badges];
    return (
      <span className="category-badge" style={{ background: badge.color }}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="ai-token-cost">
      <div className="tool-header">
        <h1>💰 AI Token 费用计算器</h1>
        <p>对比各大 AI 模型的 Token 费用</p>
      </div>

      <div className="calculator-section">
        <h2>输入 Token 数量</h2>
        <div className="token-inputs">
          <div className="input-group">
            <label>输入 Tokens</label>
            <input
              type="number"
              value={inputTokens}
              onChange={e => setInputTokens(Number(e.target.value))}
              min="0"
            />
            <span className="token-display">{formatTokens(inputTokens)}</span>
          </div>

          <div className="input-group">
            <label>输出 Tokens</label>
            <input
              type="number"
              value={outputTokens}
              onChange={e => setOutputTokens(Number(e.target.value))}
              min="0"
            />
            <span className="token-display">{formatTokens(outputTokens)}</span>
          </div>
        </div>

        <div className="quick-presets">
          <button onClick={() => { setInputTokens(1000); setOutputTokens(1000); }}>
            1K + 1K
          </button>
          <button onClick={() => { setInputTokens(10000); setOutputTokens(10000); }}>
            10K + 10K
          </button>
          <button onClick={() => { setInputTokens(100000); setOutputTokens(100000); }}>
            100K + 100K
          </button>
          <button onClick={() => { setInputTokens(1000000); setOutputTokens(1000000); }}>
            1M + 1M
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <h3>服务商</h3>
          <div className="filter-buttons">
            {providers.map(provider => (
              <button
                key={provider}
                className={selectedProviders.includes(provider) ? 'active' : ''}
                onClick={() => toggleProvider(provider)}
              >
                {provider}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <h3>模型类型</h3>
          <div className="filter-buttons">
            <button
              className={selectedCategories.includes('flagship') ? 'active' : ''}
              onClick={() => toggleCategory('flagship')}
            >
              旗舰
            </button>
            <button
              className={selectedCategories.includes('standard') ? 'active' : ''}
              onClick={() => toggleCategory('standard')}
            >
              标准
            </button>
            <button
              className={selectedCategories.includes('fast') ? 'active' : ''}
              onClick={() => toggleCategory('fast')}
            >
              快速
            </button>
          </div>
        </div>

        <div className="filter-group">
          <h3>排序方式</h3>
          <div className="filter-buttons">
            <button
              className={sortBy === 'cost' ? 'active' : ''}
              onClick={() => setSortBy('cost')}
            >
              按费用
            </button>
            <button
              className={sortBy === 'provider' ? 'active' : ''}
              onClick={() => setSortBy('provider')}
            >
              按服务商
            </button>
            <button
              className={sortBy === 'model' ? 'active' : ''}
              onClick={() => setSortBy('model')}
            >
              按模型
            </button>
          </div>
        </div>
      </div>

      <div className="results-section">
        <h2>费用对比 ({calculatedCosts.length} 个模型)</h2>
        <div className="results-table">
          <div className="table-header">
            <div className="col-provider">服务商</div>
            <div className="col-model">模型</div>
            <div className="col-category">类型</div>
            <div className="col-context">上下文</div>
            <div className="col-input">输入费用</div>
            <div className="col-output">输出费用</div>
            <div className="col-total">总费用</div>
          </div>

          {calculatedCosts.map((model, index) => (
            <div key={index} className="table-row">
              <div className="col-provider">{model.provider}</div>
              <div className="col-model">{model.model}</div>
              <div className="col-category">{getCategoryBadge(model.category)}</div>
              <div className="col-context">{formatTokens(model.contextWindow)}</div>
              <div className="col-input">{formatCost(model.inputCost)}</div>
              <div className="col-output">{formatCost(model.outputCost)}</div>
              <div className="col-total">
                <strong>{formatCost(model.totalCost)}</strong>
              </div>
            </div>
          ))}
        </div>

        {calculatedCosts.length === 0 && (
          <div className="empty-state">
            <p>请选择至少一个服务商和模型类型</p>
          </div>
        )}
      </div>

      <div className="info-section">
        <h3>💡 使用说明</h3>
        <ul>
          <li>价格单位：美元 / 百万 Tokens（$/ 1M tokens）</li>
          <li>价格数据更新时间：2024年1月（实际价格以官方为准）</li>
          <li>输入 Tokens：发送给模型的文本长度</li>
          <li>输出 Tokens：模型生成的文本长度</li>
          <li>上下文窗口：模型支持的最大 Token 数量</li>
          <li>1 Token ≈ 0.75 个英文单词 ≈ 1.5 个中文字符</li>
        </ul>
      </div>
    </div>
  );
};

export default AITokenCost;
