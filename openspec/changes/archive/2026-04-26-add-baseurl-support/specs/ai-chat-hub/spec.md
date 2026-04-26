# AI Chat Hub - BaseURL 配置功能规范

## 变更类型

**ADDED** - 新增 BaseURL 配置功能

## 功能概述

为 AI Chat Hub 工具添加自定义 API 端点（BaseURL）配置能力，允许用户为每个 AI Provider 配置自定义的 API 端点。

## 需求规格

### FR-BASEURL-001: BaseURL 存储

**优先级**: P0  
**状态**: ADDED

**描述**：系统应提供 BaseURL 的持久化存储能力

**验收标准**：
- 每个 Provider 可以独立存储 BaseURL
- BaseURL 存储在 localStorage 中
- 存储 key 格式：`ai-chat-hub:base-url:{provider}`
- 提供 saveBaseURL、getBaseURL、deleteBaseURL 函数

**测试场景**：
```typescript
// 场景 1：保存 BaseURL
saveBaseURL('chatgpt', 'https://api.example.com/v1')
expect(getBaseURL('chatgpt')).toBe('https://api.example.com/v1')

// 场景 2：删除 BaseURL
deleteBaseURL('chatgpt')
expect(getBaseURL('chatgpt')).toBeNull()

// 场景 3：不同 Provider 独立存储
saveBaseURL('chatgpt', 'https://api1.example.com')
saveBaseURL('gemini', 'https://api2.example.com')
expect(getBaseURL('chatgpt')).toBe('https://api1.example.com')
expect(getBaseURL('gemini')).toBe('https://api2.example.com')
```

---

### FR-BASEURL-002: BaseURL UI 配置

**优先级**: P0  
**状态**: ADDED

**描述**：ApiKeyConfig 组件应为每个 Provider 提供 BaseURL 配置界面

**验收标准**：
- 每个 Provider 卡片显示 BaseURL 输入框
- BaseURL 输入框位于 API Key 输入框下方
- 输入框类型为 text（不需要密码遮罩）
- Placeholder 提示："可选，留空使用默认端点"（中文）/ "Optional, leave empty for default endpoint"（英文）
- 提供独立的保存按钮
- 提供独立的删除按钮（仅当已配置时显示）

**UI 布局**：
```
┌─────────────────────────────────────┐
│ ChatGPT                    [已配置] │
├─────────────────────────────────────┤
│ API Key                             │
│ [sk-***...def] [👁] [保存] [删除]   │
│                                     │
│ API 端点                            │
│ [https://api.example.com] [保存] [删除] │
└─────────────────────────────────────┘
```

**测试场景**：
```typescript
// 场景 1：渲染 BaseURL 输入框
render(<ApiKeyConfig isOpen={true} onClose={vi.fn()} />)
expect(screen.getAllByPlaceholderText(/可选，留空使用默认端点/i)).toHaveLength(4)

// 场景 2：保存 BaseURL
const input = screen.getAllByPlaceholderText(/可选，留空使用默认端点/i)[0]
fireEvent.change(input, { target: { value: 'https://api.example.com' } })
const saveButton = screen.getAllByText(/保存/)[1] // 第二个保存按钮是 BaseURL 的
fireEvent.click(saveButton)
expect(saveBaseURL).toHaveBeenCalledWith('chatgpt', 'https://api.example.com')

// 场景 3：显示已配置的 BaseURL
getBaseURL.mockReturnValue('https://api.example.com')
render(<ApiKeyConfig isOpen={true} onClose={vi.fn()} />)
const input = screen.getAllByPlaceholderText(/可选，留空使用默认端点/i)[0]
expect(input).toHaveValue('https://api.example.com')

// 场景 4：删除 BaseURL
const deleteButton = screen.getAllByText(/删除/)[1] // BaseURL 的删除按钮
fireEvent.click(deleteButton)
expect(deleteBaseURL).toHaveBeenCalledWith('chatgpt')
```

---

### FR-BASEURL-003: BaseURL 格式验证

**优先级**: P1  
**状态**: ADDED

**描述**：系统应验证 BaseURL 格式的合法性

**验收标准**：
- BaseURL 必须以 http:// 或 https:// 开头
- 空字符串视为合法（表示使用默认端点）
- 格式错误时显示错误提示
- 格式错误时禁止保存

**测试场景**：
```typescript
// 场景 1：合法的 HTTPS URL
const input = screen.getByPlaceholderText(/可选，留空使用默认端点/i)
fireEvent.change(input, { target: { value: 'https://api.example.com' } })
const saveButton = screen.getByText(/保存/)
expect(saveButton).not.toBeDisabled()

// 场景 2：合法的 HTTP URL
fireEvent.change(input, { target: { value: 'http://localhost:8080' } })
expect(saveButton).not.toBeDisabled()

// 场景 3：空字符串合法
fireEvent.change(input, { target: { value: '' } })
expect(saveButton).not.toBeDisabled()

// 场景 4：非法格式
fireEvent.change(input, { target: { value: 'invalid-url' } })
expect(saveButton).toBeDisabled()
expect(screen.getByText(/URL 格式不正确/i)).toBeInTheDocument()
```

---

### FR-BASEURL-004: 国际化支持

**优先级**: P0  
**状态**: ADDED

**描述**：BaseURL 相关文本应支持中英文国际化

**验收标准**：
- 中文翻译完整准确
- 英文翻译完整准确
- 使用 toolAiChatHub 命名空间

**翻译清单**：

中文（zh.json）：
```json
{
  "apiKeyConfig": {
    "baseURL": "API 端点",
    "baseURLPlaceholder": "可选，留空使用默认端点",
    "baseURLSaved": "API 端点保存成功",
    "baseURLDeleted": "API 端点已删除",
    "baseURLInvalid": "URL 格式不正确，必须以 http:// 或 https:// 开头"
  }
}
```

英文（en.json）：
```json
{
  "apiKeyConfig": {
    "baseURL": "API Endpoint",
    "baseURLPlaceholder": "Optional, leave empty for default endpoint",
    "baseURLSaved": "API endpoint saved successfully",
    "baseURLDeleted": "API endpoint deleted",
    "baseURLInvalid": "Invalid URL format, must start with http:// or https://"
  }
}
```

---

### FR-BASEURL-005: 用户反馈

**优先级**: P1  
**状态**: ADDED

**描述**：BaseURL 操作应提供清晰的用户反馈

**验收标准**：
- 保存成功后显示成功提示（3秒后自动消失）
- 删除前显示确认对话框
- 删除成功后显示成功提示
- 格式错误时显示错误提示

**测试场景**：
```typescript
// 场景 1：保存成功提示
fireEvent.click(saveButton)
await waitFor(() => {
  expect(screen.getByText(/API 端点保存成功/i)).toBeInTheDocument()
})

// 场景 2：删除确认
const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
fireEvent.click(deleteButton)
expect(confirmSpy).toHaveBeenCalledWith(expect.stringContaining('确定要删除'))

// 场景 3：删除成功提示
await waitFor(() => {
  expect(screen.getByText(/API 端点已删除/i)).toBeInTheDocument()
})
```

---

## 非功能需求

### NFR-BASEURL-001: 性能

- BaseURL 读取应在 10ms 内完成（localStorage 读取）
- UI 渲染不应因 BaseURL 功能增加明显延迟

### NFR-BASEURL-002: 兼容性

- 不影响现有 API Key 功能
- 未配置 BaseURL 时使用默认端点
- 向后兼容（旧数据不受影响）

### NFR-BASEURL-003: 可维护性

- 存储函数与 API Key 存储函数保持一致的命名和结构
- UI 组件保持清晰的职责分离
- 测试覆盖率不低于现有水平

---

## 实现约束

1. **存储方式**：使用 localStorage，与 API Key 存储方式一致
2. **UI 框架**：使用 @toolbox/ui-kit 组件库
3. **测试框架**：使用 Vitest + React Testing Library
4. **国际化**：使用 react-i18next，命名空间为 toolAiChatHub

---

## 验收检查清单

- [ ] 存储函数实现完整（save/get/delete）
- [ ] 存储函数有单元测试
- [ ] UI 组件显示 BaseURL 输入框
- [ ] UI 组件有 BaseURL 相关测试
- [ ] BaseURL 格式验证正常工作
- [ ] 中英文翻译完整
- [ ] 保存/删除操作有用户反馈
- [ ] 所有测试通过
- [ ] 不影响现有功能
