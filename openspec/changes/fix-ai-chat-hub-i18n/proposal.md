# 修复 AI Chat Hub 国际化问题

## 问题描述

AI Chat Hub 工具的国际化配置不一致，导致子组件无法正确显示翻译文本。

### 现象
- 子组件中的 UI 文本可能显示为翻译 key 而非实际翻译
- 中英文切换时部分组件不响应
- 用户体验受影响

### 复现步骤
1. 启动应用并打开 AI Chat Hub 工具
2. 切换语言（中文/英文）
3. 观察子组件（ProviderSelector、ApiKeyConfig 等）的文本显示

### 影响范围
- ProviderSelector 组件
- ApiKeyConfig 组件
- PromptInput 组件
- ResponsePanel 组件
- ViewModeToggle 组件

## 根因分析

通过代码审查发现：

1. **主组件** (`src/AiChatHub.tsx` line 16):
   ```typescript
   const { t } = useTranslation('toolAiChatHub')
   ```
   正确指定了 namespace `toolAiChatHub`

2. **所有子组件**:
   ```typescript
   const { t } = useTranslation()
   ```
   未指定 namespace，导致无法加载 `toolAiChatHub` namespace 下的翻译

3. **Manifest 配置** (`tool.manifest.ts`):
   ```typescript
   namespace: 'toolAiChatHub',
   loadMessages: {
     zh: () => import('./src/locales/zh.json'),
     en: () => import('./src/locales/en.json'),
   }
   ```
   翻译文件被加载到 `toolAiChatHub` namespace

**结论**: 子组件的 `useTranslation()` 调用缺少 namespace 参数，无法访问正确的翻译资源。

## 解决方案

### 方案选择

**方案 A（推荐）**: 统一所有组件使用 `useTranslation('toolAiChatHub')`
- 优点：明确、一致、不依赖默认行为
- 缺点：需要修改 5 个组件文件

**方案 B**: 修改 manifest 使用默认 namespace
- 优点：只需修改 1 个文件
- 缺点：可能与其他工具冲突，不符合最佳实践

**选择方案 A**，因为：
1. 明确性：每个组件都清楚声明使用的 namespace
2. 可维护性：未来开发者能立即看到 i18n 配置
3. 最佳实践：遵循 react-i18next 推荐的 namespace 使用方式

### 实施步骤

1. 修改 5 个子组件，添加 namespace 参数：
   - `src/components/ProviderSelector.tsx`
   - `src/components/ApiKeyConfig.tsx`
   - `src/components/PromptInput.tsx`
   - `src/components/ResponsePanel.tsx`
   - `src/components/ViewModeToggle.tsx`

2. 更新对应的测试文件，确保测试使用正确的 namespace

3. 验证修复：
   - 运行单元测试
   - 手动测试语言切换
   - 检查所有 UI 文本正确显示

## 影响评估

### 风险
- **低风险**: 仅修改 i18n hook 调用，不改变业务逻辑
- **无破坏性**: 不影响现有功能

### 测试范围
- 单元测试：所有组件测试需要通过
- 集成测试：E2E 测试需要通过
- 手动测试：验证中英文切换

### 回滚方案
如果出现问题，可以直接 revert commit。

## 验收标准

- [ ] 所有子组件使用 `useTranslation('toolAiChatHub')`
- [ ] 所有单元测试通过
- [ ] E2E 测试通过
- [ ] 手动验证中英文切换正常
- [ ] 所有 UI 文本正确显示翻译
