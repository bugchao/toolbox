import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import './AITokenCost.css';
import { I18N_NAMESPACE } from './namespace';

export { I18N_NAMESPACE };

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

// 中文服务商/模型名称 -> i18n key（用于表格展示的翻译；英文名称如 OpenAI/GPT-4o 保持字面量）
const PROVIDER_LABEL_KEYS: Record<string, string> = {
  '阿里云': 'providerAlibaba',
  '百度': 'providerBaidu',
  '智谱AI': 'providerZhipu',
  '月之暗面': 'providerMoonshot',
  '字节跳动': 'providerBytedance',
};

const MODEL_LABEL_KEYS: Record<string, string> = {
  '通义千问 Turbo': 'modelQwenTurbo',
  '通义千问 Plus': 'modelQwenPlus',
  '通义千问 Max': 'modelQwenMax',
  '豆包': 'modelDoubao',
};

export const AITokenCost: React.FC = () => {
  const { t } = useTranslation(I18N_NAMESPACE);
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
      flagship: { label: t('categoryFlagship'), color: '#8b5cf6' },
      standard: { label: t('categoryStandard'), color: '#3b82f6' },
      fast: { label: t('categoryFast'), color: '#10b981' },
      vision: { label: t('categoryVision'), color: '#f59e0b' },
      embedding: { label: t('categoryEmbedding'), color: '#6366f1' },
    };
    const badge = badges[category as keyof typeof badges];
    return (
      <span className="category-badge" style={{ background: badge.color }}>
        {badge.label}
      </span>
    );
  };

  const translateProvider = (provider: string) =>
    PROVIDER_LABEL_KEYS[provider] ? t(PROVIDER_LABEL_KEYS[provider]) : provider;

  const translateModel = (model: string) =>
    MODEL_LABEL_KEYS[model] ? t(MODEL_LABEL_KEYS[model]) : model;

  return (
    <div className="ai-token-cost">
      <div className="tool-header">
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
      </div>

      <div className="calculator-section">
        <h2>{t('inputTokensHeading')}</h2>
        <div className="token-inputs">
          <div className="input-group">
            <label>{t('inputTokensLabel')}</label>
            <input
              type="number"
              value={inputTokens}
              onChange={e => setInputTokens(Number(e.target.value))}
              min="0"
            />
            <span className="token-display">{formatTokens(inputTokens)}</span>
          </div>

          <div className="input-group">
            <label>{t('outputTokensLabel')}</label>
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
            {t('preset1k')}
          </button>
          <button onClick={() => { setInputTokens(10000); setOutputTokens(10000); }}>
            {t('preset10k')}
          </button>
          <button onClick={() => { setInputTokens(100000); setOutputTokens(100000); }}>
            {t('preset100k')}
          </button>
          <button onClick={() => { setInputTokens(1000000); setOutputTokens(1000000); }}>
            {t('preset1m')}
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <h3>{t('providerHeading')}</h3>
          <div className="filter-buttons">
            {providers.map(provider => (
              <button
                key={provider}
                className={selectedProviders.includes(provider) ? 'active' : ''}
                onClick={() => toggleProvider(provider)}
              >
                {translateProvider(provider)}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <h3>{t('categoryHeading')}</h3>
          <div className="filter-buttons">
            <button
              className={selectedCategories.includes('flagship') ? 'active' : ''}
              onClick={() => toggleCategory('flagship')}
            >
              {t('categoryFlagship')}
            </button>
            <button
              className={selectedCategories.includes('standard') ? 'active' : ''}
              onClick={() => toggleCategory('standard')}
            >
              {t('categoryStandard')}
            </button>
            <button
              className={selectedCategories.includes('fast') ? 'active' : ''}
              onClick={() => toggleCategory('fast')}
            >
              {t('categoryFast')}
            </button>
          </div>
        </div>

        <div className="filter-group">
          <h3>{t('sortHeading')}</h3>
          <div className="filter-buttons">
            <button
              className={sortBy === 'cost' ? 'active' : ''}
              onClick={() => setSortBy('cost')}
            >
              {t('sortByCost')}
            </button>
            <button
              className={sortBy === 'provider' ? 'active' : ''}
              onClick={() => setSortBy('provider')}
            >
              {t('sortByProvider')}
            </button>
            <button
              className={sortBy === 'model' ? 'active' : ''}
              onClick={() => setSortBy('model')}
            >
              {t('sortByModel')}
            </button>
          </div>
        </div>
      </div>

      <div className="results-section">
        <h2>{t('resultsHeading', { count: calculatedCosts.length })}</h2>
        <div className="results-table">
          <div className="table-header">
            <div className="col-provider">{t('providerHeading')}</div>
            <div className="col-model">{t('colModel')}</div>
            <div className="col-category">{t('colCategory')}</div>
            <div className="col-context">{t('colContext')}</div>
            <div className="col-input">{t('colInputCost')}</div>
            <div className="col-output">{t('colOutputCost')}</div>
            <div className="col-total">{t('colTotalCost')}</div>
          </div>

          {calculatedCosts.map((model, index) => (
            <div key={index} className="table-row">
              <div className="col-provider">{translateProvider(model.provider)}</div>
              <div className="col-model">{translateModel(model.model)}</div>
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
            <p>{t('emptyState')}</p>
          </div>
        )}
      </div>

      <div className="info-section">
        <h3>{t('infoHeading')}</h3>
        <ul>
          <li>{t('infoLine1')}</li>
          <li>{t('infoLine2')}</li>
          <li>{t('infoLine3')}</li>
          <li>{t('infoLine4')}</li>
          <li>{t('infoLine5')}</li>
          <li>{t('infoLine6')}</li>
        </ul>
      </div>
    </div>
  );
};

export default AITokenCost;
