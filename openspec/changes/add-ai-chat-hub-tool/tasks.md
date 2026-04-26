# AI Chat Hub 实现任务（含并行分析）

## 并行组 1：基础设施（串行 - 必须先完成）

### Task 1.1: 脚手架和配置
- 运行 `pnpm create:tool ai-chat-hub` 创建工具骨架
- 运行 `pnpm install` 链接工作区包
- 配置 `tool.manifest.ts`：
  - categoryKey: `ai`
  - icon: `MessageSquare` (lucide-react)
  - mode: `client`
  - keywords: 中英文混合（ai, chat, chatgpt, gemini, deepseek, grok, 聊天, 对比, 并发）
  - meta.zh/en: title 和 description
- 提交：`feat(tool-ai-chat-hub): scaffold and configure tool package`

### Task 1.2: 类型定义
- 创建 `src/types.ts`：
  - `AIProvider`: 'chatgpt' | 'gemini' | 'deepseek' | 'grok'
  - `APIConfig`: { provider, apiKey, baseURL? }
  - `Message`: { role, content, provider, timestamp }
  - `ViewMode`: 'grid' | 'tab'
  - `ResponseStatus`: 'idle' | 'loading' | 'success' | 'error'
  - `AIResponse`: { provider, status, content, error? }
  - `ProviderConfig`: { provider, name, enabled, configured }
- 创建 `src/types.test.ts` 验证类型定义
- 提交：`feat(tool-ai-chat-hub): add TypeScript type definitions`

---

## 并行组 2：独立功能（可并行执行）

以下任务互不依赖，可由多个子代理并行实现：

### Task 2.1: 本地存储工具函数
**文件：** `src/utils/storage.ts`, `src/utils/storage.test.ts`

**功能：**
- `saveApiKey(provider, apiKey)` - 保存 API 密钥到 localStorage
- `getApiKey(provider)` - 读取 API 密钥
- `deleteApiKey(provider)` - 删除 API 密钥
- `getAllApiKeys()` - 获取所有已配置的密钥
- `saveViewMode(mode)` - 保存视图模式偏好
- `getViewMode()` - 读取视图模式偏好

**TDD 要点：**
- 测试保存和读取 API 密钥
- 测试删除密钥后返回 null
- 测试获取所有密钥返回正确的对象
- 使用 `beforeEach(() => localStorage.clear())` 清理测试环境

**提交：** `feat(tool-ai-chat-hub): add localStorage utility for API keys`

---

### Task 2.2: AI 提供商选择器组件
**文件：** `src/components/ProviderSelector.tsx`, `src/components/ProviderSelector.test.tsx`

**功能：**
- 显示 4 个 AI 提供商（ChatGPT, Gemini, DeepSeek, Grok）
- 多选复选框，支持选中/取消选中
- 显示已配置/未配置状态（通过 storage 检查）
- 触发 `onChange(selectedProviders)` 回调

**UI 设计：**
- 使用 `@toolbox/ui-kit` 的 Card 组件包裹
- 每个提供商一个复选框 + 名称 + 配置状态图标
- 未配置时显示警告图标和提示

**TDD 要点：**
- 测试点击复选框触发 onChange
- 测试初始选中状态
- 测试配置状态显示

**提交：** `feat(tool-ai-chat-hub): add AI provider selector component`

---

### Task 2.3: API 密钥配置组件
**文件：** `src/components/ApiKeyConfig.tsx`, `src/components/ApiKeyConfig.test.tsx`

**功能：**
- Modal 或 Drawer 形式的配置面板
- 列出所有 AI 提供商
- 每个提供商：
  - 密钥输入框（type="password"，支持显示/隐藏）
  - 保存按钮
  - 删除按钮（已配置时显示）
- 已配置的密钥显示掩码（如 "sk-***...***"）
- 调用 storage 工具函数保存/删除密钥

**UI 设计：**
- 使用 Modal 组件（从 @toolbox/ui-kit 或自定义）
- 表单布局，每个提供商一行
- 保存成功后显示 toast 提示

**TDD 要点：**
- 测试输入密钥并保存
- 测试删除密钥需要确认
- 测试密钥掩码显示

**提交：** `feat(tool-ai-chat-hub): add API key configuration panel`

---

### Task 2.4: 统一输入框组件
**文件：** `src/components/PromptInput.tsx`, `src/components/PromptInput.test.tsx`

**功能：**
- 多行文本输入框（textarea）
- 发送按钮
- 支持快捷键 Ctrl+Enter / Cmd+Enter 发送
- 输入验证：非空检查
- 触发 `onSend(prompt)` 回调
- 发送后清空输入框

**UI 设计：**
- 使用 `@toolbox/ui-kit` 的 TextArea 组件
- 发送按钮在右下角
- 禁用状态：输入为空或正在加载时

**TDD 要点：**
- 测试输入文本并点击发送
- 测试快捷键发送
- 测试空输入时按钮禁用
- 测试发送后清空输入

**提交：** `feat(tool-ai-chat-hub): add unified prompt input component`

---

### Task 2.5: AI 响应区域组件
**文件：** `src/components/ResponsePanel.tsx`, `src/components/ResponsePanel.test.tsx`

**功能：**
- 显示单个 AI 的响应
- 支持三种状态：
  - idle: 显示占位符
  - loading: 显示加载动画
  - success: 显示响应内容（支持 Markdown 渲染）
  - error: 显示错误信息 + 重试按钮
- 流式内容追加和自动滚动
- 显示 AI 提供商名称和图标

**UI 设计：**
- 使用 `@toolbox/ui-kit` 的 Card 组件
- 头部：AI 名称 + 状态图标
- 内容区：Markdown 渲染（使用 react-markdown 或类似库）
- 自动滚动到底部

**TDD 要点：**
- 测试不同状态的渲染
- 测试错误状态显示重试按钮
- 测试内容更新时自动滚动

**提交：** `feat(tool-ai-chat-hub): add AI response panel component`

---

### Task 2.6: 视图模式切换组件
**文件：** `src/components/ViewModeToggle.tsx`, `src/components/ViewModeToggle.test.tsx`

**功能：**
- 两个按钮：Grid 模式 / Tab 模式
- 当前模式高亮显示
- 触发 `onChange(mode)` 回调

**UI 设计：**
- 使用按钮组（Button Group）
- 图标 + 文本标签
- 当前模式使用 primary 样式

**TDD 要点：**
- 测试点击切换模式
- 测试当前模式高亮

**提交：** `feat(tool-ai-chat-hub): add view mode toggle component`

---

### Task 2.7: Grid 和 Tab 视图容器
**文件：** `src/components/GridView.tsx`, `src/components/TabView.tsx`, 测试文件

**GridView 功能：**
- 接收 `children` (ResponsePanel 数组)
- 响应式网格布局（1-4 列，根据屏幕宽度）
- 使用 CSS Grid 或 Flexbox

**TabView 功能：**
- 接收 `tabs` 数组（{ label, content }）
- 选项卡导航
- 点击切换显示对应内容
- 使用 `@toolbox/ui-kit` 的 ToolTabView 组件（如果可用）

**TDD 要点：**
- GridView: 测试子元素正确渲染
- TabView: 测试点击切换标签

**提交：** `feat(tool-ai-chat-hub): add grid and tab view containers`

---

### Task 2.8: i18n 文件
**文件：** `src/locales/zh.json`, `src/locales/en.json`

**内容：**
- 工具标题和描述
- AI 提供商名称
- 按钮文本（发送、配置、保存、删除、重试）
- 提示信息（请选择 AI、请配置密钥、加载中、请求失败等）
- 错误信息（API 密钥无效、网络错误、速率限制）
- 视图模式标签（平铺模式、Tab 模式）

**要求：**
- 两个文件键值完全对应
- 使用嵌套结构组织（providers, buttons, messages, errors）

**提交：** `feat(tool-ai-chat-hub): add i18n locale files`

---

## 并行组 3：集成（依赖组 2 完成）

### Task 3.1: 主组件集成
**文件：** `src/AiChatHub.tsx`, `src/index.tsx`

**功能：**
- 集成所有子组件
- 状态管理：
  - `selectedProviders: AIProvider[]`
  - `viewMode: ViewMode`
  - `responses: Map<AIProvider, AIResponse>`
  - `isLoading: boolean`
- 处理用户交互：
  - 选择 AI 提供商
  - 配置 API 密钥
  - 发送问题
  - 切换视图模式
- 并发 API 调用逻辑（简化版，先使用 mock）
- 集成 i18n（useTranslation）
- 使用 PageHero 和 ParticlesBackground

**布局：**
```
<PageHero title={t('title')} description={t('description')} />
<ParticlesBackground />
<div className="container">
  <ProviderSelector />
  <ApiKeyConfig />
  <PromptInput />
  <ViewModeToggle />
  {viewMode === 'grid' ? <GridView /> : <TabView />}
</div>
```

**提交：** `feat(tool-ai-chat-hub): integrate main component`

---

### Task 3.2: 错误处理和边界情况
**文件：** 修改 `src/AiChatHub.tsx`

**功能：**
- 未选择 AI 时发送：显示提示
- 未配置密钥时发送：显示配置提示
- API 调用失败：显示错误信息 + 重试按钮
- 网络错误：显示友好提示
- 速率限制：显示等待提示

**提交：** `feat(tool-ai-chat-hub): add error handling and edge cases`

---

### Task 3.3: 端到端测试（简化版）
**文件：** `tests/ai-chat-hub.spec.ts`

**测试场景：**
- 打开工具，验证页面加载
- 选择 AI 提供商
- 配置 API 密钥（使用 mock）
- 输入问题并发送
- 验证响应区域显示（使用 mock 响应）
- 切换视图模式

**提交：** `test(tool-ai-chat-hub): add E2E smoke test`

---

## 依赖关系总结

```
Group 1 (串行)
├── Task 1.1: 脚手架和配置
└── Task 1.2: 类型定义
    ↓
Group 2 (并行 - 8 个任务可同时执行)
├── Task 2.1: 本地存储工具函数
├── Task 2.2: AI 提供商选择器组件
├── Task 2.3: API 密钥配置组件
├── Task 2.4: 统一输入框组件
├── Task 2.5: AI 响应区域组件
├── Task 2.6: 视图模式切换组件
├── Task 2.7: Grid 和 Tab 视图容器
└── Task 2.8: i18n 文件
    ↓
Group 3 (串行 - 依赖 Group 2)
├── Task 3.1: 主组件集成
├── Task 3.2: 错误处理和边界情况
└── Task 3.3: 端到端测试
```

## 验证检查点

每个任务完成后验证：
- [ ] 单元测试通过：`pnpm -C tools/tool-ai-chat-hub test`
- [ ] TypeScript 编译通过：`pnpm -C tools/tool-ai-chat-hub exec tsc --noEmit`
- [ ] ESLint 检查通过：`pnpm lint`
- [ ] 功能符合规范中的场景描述

## 注意事项

1. **AI API 集成暂时简化**：由于实际 AI API 调用需要真实密钥和网络请求，Task 3.1 中先使用 mock 数据。真实 API 集成可以作为后续优化任务。

2. **并行执行建议**：Group 2 的 8 个任务可以派遣 8 个子代理并行执行，预计可节省 70% 的执行时间。

3. **TDD 原则**：每个任务都遵循"先写测试 → 运行失败 → 实现功能 → 测试通过 → 提交"的流程。

4. **UI 组件复用**：优先使用 `@toolbox/ui-kit` 中的组件，避免重复造轮子。
