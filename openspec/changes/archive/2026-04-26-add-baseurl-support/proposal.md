# 提案：AI Chat Hub 支持自定义 BaseURL

## 问题描述

当前 AI Chat Hub 工具只支持配置 API Key，无法配置自定义的 API 端点（BaseURL）。这限制了用户使用代理服务或自建 API 网关的能力。

### 现象

- 用户只能使用默认的官方 API 端点
- 无法配置代理服务（如反向代理、API 网关）
- 无法使用自建的兼容 API 服务

### 影响

- 国内用户无法通过代理访问被墙的 API 服务
- 企业用户无法使用内部 API 网关进行统一管理
- 开发者无法使用本地测试环境

### 用户场景

1. **代理场景**：用户通过反向代理访问 ChatGPT API
   - 需要配置：`https://api.example.com/v1`
   
2. **自建服务**：用户使用兼容 OpenAI API 的自建服务
   - 需要配置：`http://localhost:8080/api`
   
3. **企业网关**：企业统一 API 网关
   - 需要配置：`https://api-gateway.company.com/ai`

## 根因分析

### 代码层面

1. **类型定义已支持**：`types.ts` 中 `APIConfig` 接口已有 `baseURL?: string` 字段
2. **存储层缺失**：`storage.ts` 只提供了 API Key 的存储函数，没有 BaseURL 的存储函数
3. **UI 层缺失**：`ApiKeyConfig.tsx` 组件只渲染了 API Key 输入框，没有 BaseURL 输入框

### 架构层面

- 类型系统已经预留了 BaseURL 支持
- 只需补充存储层和 UI 层的实现

## 解决方案

### 方案概述

在现有架构基础上，补充 BaseURL 的存储和 UI 支持：

1. **存储层**：在 `storage.ts` 中添加 BaseURL 的 CRUD 函数
2. **UI 层**：在 `ApiKeyConfig.tsx` 中为每个 Provider 添加 BaseURL 输入框
3. **测试层**：补充 BaseURL 相关的单元测试

### 详细设计

#### 1. 存储层（storage.ts）

添加以下函数：

```typescript
const BASE_URL_KEY_PREFIX = 'ai-chat-hub:base-url:'

export function saveBaseURL(provider: AIProvider, baseURL: string): void {
  localStorage.setItem(`${BASE_URL_KEY_PREFIX}${provider}`, baseURL)
}

export function getBaseURL(provider: AIProvider): string | null {
  return localStorage.getItem(`${BASE_URL_KEY_PREFIX}${provider}`)
}

export function deleteBaseURL(provider: AIProvider): void {
  localStorage.removeItem(`${BASE_URL_KEY_PREFIX}${provider}`)
}
```

#### 2. UI 层（ApiKeyConfig.tsx）

为每个 Provider 添加：

- BaseURL 输入框（可选字段）
- Placeholder 提示默认值
- 保存/删除按钮（与 API Key 独立）

布局结构：

```
Provider Card
├── API Key 输入框
│   ├── 输入框
│   ├── 显示/隐藏按钮
│   └── 保存/删除按钮
└── BaseURL 输入框（新增）
    ├── 输入框
    ├── Placeholder: "可选，留空使用默认端点"
    └── 保存/删除按钮
```

#### 3. 国际化

在 `zh.json` 和 `en.json` 中添加：

```json
{
  "apiKeyConfig": {
    "baseURL": "API 端点",
    "baseURLPlaceholder": "可选，留空使用默认端点",
    "baseURLSaved": "API 端点保存成功",
    "baseURLDeleted": "API 端点已删除"
  }
}
```

### 技术约束

- BaseURL 为可选字段，留空时使用默认端点
- BaseURL 需要验证格式（http/https 开头）
- 与 API Key 独立存储和管理

## 影响范围

### 修改文件

1. `tools/tool-ai-chat-hub/src/utils/storage.ts` - 添加 BaseURL 存储函数
2. `tools/tool-ai-chat-hub/src/components/ApiKeyConfig.tsx` - 添加 BaseURL UI
3. `tools/tool-ai-chat-hub/src/locales/zh.json` - 添加中文翻译
4. `tools/tool-ai-chat-hub/src/locales/en.json` - 添加英文翻译
5. `tools/tool-ai-chat-hub/src/utils/storage.test.ts` - 添加存储测试（新文件）
6. `tools/tool-ai-chat-hub/src/components/ApiKeyConfig.test.tsx` - 添加 BaseURL UI 测试

### 不影响

- 现有 API Key 功能
- 其他组件（ProviderSelector、PromptInput、ResponsePanel 等）
- 类型定义（已有 baseURL 字段）

## 验收标准

1. **功能完整性**
   - 每个 Provider 都能配置 BaseURL
   - BaseURL 可以保存、读取、删除
   - BaseURL 为空时不影响现有功能

2. **UI 体验**
   - BaseURL 输入框清晰可见
   - Placeholder 提示明确
   - 保存/删除操作有成功提示

3. **测试覆盖**
   - 存储函数有单元测试
   - UI 组件有单元测试
   - 测试覆盖保存、读取、删除场景

4. **国际化**
   - 中英文翻译完整
   - 翻译准确无误

## 风险评估

### 低风险

- 功能独立，不影响现有 API Key 功能
- 类型系统已支持，无需修改接口
- 存储层简单，使用 localStorage

### 注意事项

- BaseURL 格式验证需要严格（防止用户输入错误）
- 需要明确提示 BaseURL 为可选字段
- 删除 BaseURL 时需要确认（避免误删）
