# BaseURL 支持功能 - 实现任务清单

## 阶段 1：存储层实现

### 任务 1.1：添加 BaseURL 存储函数
- [ ] 在 `src/utils/storage.ts` 中添加 `BASE_URL_KEY_PREFIX` 常量
- [ ] 实现 `saveBaseURL(provider, baseURL)` 函数
- [ ] 实现 `getBaseURL(provider)` 函数
- [ ] 实现 `deleteBaseURL(provider)` 函数
- [ ] 确保函数签名与 API Key 存储函数保持一致

### 任务 1.2：添加存储层单元测试
- [ ] 创建 `src/utils/storage.test.ts` 文件
- [ ] 测试 `saveBaseURL` 和 `getBaseURL` 配合工作
- [ ] 测试 `deleteBaseURL` 正确删除数据
- [ ] 测试不同 Provider 的 BaseURL 独立存储
- [ ] 测试 `getBaseURL` 在未配置时返回 null
- [ ] 确保所有存储测试通过

---

## 阶段 2：国际化文本

### 任务 2.1：添加中文翻译
- [ ] 在 `src/locales/zh.json` 的 `apiKeyConfig` 中添加：
  - `baseURL`: "API 端点"
  - `baseURLPlaceholder`: "可选，留空使用默认端点"
  - `baseURLSaved`: "API 端点保存成功"
  - `baseURLDeleted`: "API 端点已删除"
  - `baseURLInvalid`: "URL 格式不正确，必须以 http:// 或 https:// 开头"

### 任务 2.2：添加英文翻译
- [ ] 在 `src/locales/en.json` 的 `apiKeyConfig` 中添加：
  - `baseURL`: "API Endpoint"
  - `baseURLPlaceholder`: "Optional, leave empty for default endpoint"
  - `baseURLSaved`: "API endpoint saved successfully"
  - `baseURLDeleted`: "API endpoint deleted"
  - `baseURLInvalid`: "Invalid URL format, must start with http:// or https://"

---

## 阶段 3：UI 层实现

### 任务 3.1：添加 BaseURL 状态管理
- [ ] 在 `ApiKeyConfig.tsx` 中添加 `baseURLs` state
- [ ] 在 `ApiKeyConfig.tsx` 中添加 `baseURLErrors` state（用于格式验证）
- [ ] 在 `useEffect` 中加载已保存的 BaseURL
- [ ] 导入 `saveBaseURL`、`getBaseURL`、`deleteBaseURL` 函数

### 任务 3.2：实现 BaseURL 格式验证
- [ ] 创建 `validateBaseURL` 函数
- [ ] 验证 URL 以 http:// 或 https:// 开头
- [ ] 空字符串视为合法
- [ ] 返回验证结果（boolean）

### 任务 3.3：实现 BaseURL UI 组件
- [ ] 为每个 Provider 添加 BaseURL 输入框
- [ ] 输入框类型为 text
- [ ] 设置 placeholder（使用 t('apiKeyConfig.baseURLPlaceholder')）
- [ ] 输入框值绑定到 `baseURLs[provider]`
- [ ] onChange 时更新 state 并验证格式
- [ ] 显示格式错误提示（如果有）

### 任务 3.4：实现 BaseURL 保存功能
- [ ] 添加保存按钮（使用 t('buttons.save')）
- [ ] 点击时调用 `saveBaseURL(provider, baseURL)`
- [ ] 保存成功后显示成功消息（使用 t('apiKeyConfig.baseURLSaved')）
- [ ] 格式错误时禁用保存按钮

### 任务 3.5：实现 BaseURL 删除功能
- [ ] 添加删除按钮（使用 t('buttons.delete')）
- [ ] 仅在已配置 BaseURL 时显示删除按钮
- [ ] 点击时显示确认对话框
- [ ] 确认后调用 `deleteBaseURL(provider)`
- [ ] 删除成功后显示成功消息（使用 t('apiKeyConfig.baseURLDeleted')）
- [ ] 删除后清空输入框

---

## 阶段 4：UI 测试

### 任务 4.1：添加 BaseURL 渲染测试
- [ ] 在 `ApiKeyConfig.test.tsx` 中添加测试：渲染 BaseURL 输入框
- [ ] 测试：4 个 Provider 都显示 BaseURL 输入框
- [ ] 测试：placeholder 文本正确显示

### 任务 4.2：添加 BaseURL 保存测试
- [ ] 测试：输入 BaseURL 并保存
- [ ] 测试：保存时调用 `saveBaseURL` 函数
- [ ] 测试：保存成功后显示成功消息

### 任务 4.3：添加 BaseURL 显示测试
- [ ] 测试：已配置的 BaseURL 正确显示在输入框中
- [ ] Mock `getBaseURL` 返回测试数据

### 任务 4.4：添加 BaseURL 删除测试
- [ ] 测试：已配置 BaseURL 时显示删除按钮
- [ ] 测试：点击删除按钮显示确认对话框
- [ ] 测试：确认后调用 `deleteBaseURL` 函数
- [ ] 测试：取消删除时不调用 `deleteBaseURL`
- [ ] 测试：删除成功后显示成功消息

### 任务 4.5：添加 BaseURL 格式验证测试
- [ ] 测试：合法的 HTTPS URL 可以保存
- [ ] 测试：合法的 HTTP URL 可以保存
- [ ] 测试：空字符串可以保存
- [ ] 测试：非法格式禁用保存按钮
- [ ] 测试：非法格式显示错误提示

---

## 阶段 5：集成验证

### 任务 5.1：手动测试
- [ ] 启动开发服务器（`pnpm dev`）
- [ ] 打开 AI Chat Hub 工具
- [ ] 打开 API Key 配置对话框
- [ ] 为每个 Provider 配置 BaseURL
- [ ] 验证保存功能正常
- [ ] 验证删除功能正常
- [ ] 验证格式验证正常
- [ ] 验证中英文切换正常

### 任务 5.2：自动化测试
- [ ] 运行 `pnpm test` 确保所有测试通过
- [ ] 运行 `pnpm lint` 确保代码规范
- [ ] 运行 `pnpm build` 确保构建成功

---

## 阶段 6：文档更新

### 任务 6.1：更新 OpenSpec
- [ ] 确认所有需求已实现
- [ ] 更新规范状态为 IMPLEMENTED

### 任务 6.2：提交代码
- [ ] 使用 TDD 方式提交（先测试后实现）
- [ ] Commit message: `feat(tool-ai-chat-hub): add BaseURL configuration support`
- [ ] 包含完整的功能描述

---

## 验收标准

### 功能完整性
- [ ] 所有 4 个 Provider 都支持 BaseURL 配置
- [ ] BaseURL 可以保存、读取、删除
- [ ] BaseURL 格式验证正常工作
- [ ] 未配置 BaseURL 时不影响现有功能

### 测试覆盖
- [ ] 存储层测试覆盖率 100%
- [ ] UI 层测试覆盖所有交互场景
- [ ] 所有测试通过

### 用户体验
- [ ] UI 布局清晰合理
- [ ] 操作反馈及时明确
- [ ] 中英文翻译准确
- [ ] 错误提示清晰

### 代码质量
- [ ] 代码符合项目规范
- [ ] 无 lint 错误
- [ ] 构建成功
- [ ] 不影响现有功能
