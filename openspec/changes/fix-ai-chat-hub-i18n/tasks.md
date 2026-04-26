# AI Chat Hub 国际化修复任务

## 修复任务

### Task 1: 修复组件 i18n namespace
**优先级**: P0 (Critical)

**文件修改**:
- `tools/tool-ai-chat-hub/src/components/ProviderSelector.tsx`
- `tools/tool-ai-chat-hub/src/components/ApiKeyConfig.tsx`
- `tools/tool-ai-chat-hub/src/components/PromptInput.tsx`
- `tools/tool-ai-chat-hub/src/components/ResponsePanel.tsx`
- `tools/tool-ai-chat-hub/src/components/ViewModeToggle.tsx`

**修改内容**:
将所有组件中的：
```typescript
const { t } = useTranslation()
```

修改为：
```typescript
const { t } = useTranslation('toolAiChatHub')
```

**验证**:
- [ ] 代码修改完成
- [ ] TypeScript 编译通过
- [ ] 单元测试通过

---

### Task 2: 更新测试文件
**优先级**: P0 (Critical)

**文件修改**:
- `tools/tool-ai-chat-hub/src/components/ProviderSelector.test.tsx`
- `tools/tool-ai-chat-hub/src/components/ApiKeyConfig.test.tsx`
- `tools/tool-ai-chat-hub/src/components/PromptInput.test.tsx`
- `tools/tool-ai-chat-hub/src/components/ResponsePanel.test.tsx`
- `tools/tool-ai-chat-hub/src/components/ViewModeToggle.test.tsx`

**修改内容**:
确保测试中的 i18n mock 使用正确的 namespace：
```typescript
i18n.init({
  lng: 'en',
  fallbackLng: 'en',
  ns: ['toolAiChatHub'],
  defaultNS: 'toolAiChatHub',
  resources: {
    en: {
      toolAiChatHub: {
        // translations
      }
    }
  }
})
```

**验证**:
- [ ] 所有测试文件更新
- [ ] 测试通过

---

## 测试任务

### Task 3: 单元测试验证
**优先级**: P0 (Critical)

**执行**:
```bash
pnpm -C tools/tool-ai-chat-hub test
```

**验证**:
- [ ] 所有组件测试通过
- [ ] 无 i18n 相关警告或错误

---

### Task 4: 集成测试验证
**优先级**: P1 (High)

**执行**:
```bash
pnpm test:e2e tests/ai-chat-hub.spec.ts
```

**验证**:
- [ ] E2E 测试通过
- [ ] 语言切换功能正常

---

## 验证任务

### Task 5: 手动测试
**优先级**: P1 (High)

**测试步骤**:
1. 启动开发服务器：`pnpm dev`
2. 打开 AI Chat Hub 工具
3. 验证所有 UI 文本正确显示（中文）
4. 切换到英文
5. 验证所有 UI 文本正确显示（英文）
6. 测试所有组件功能：
   - ProviderSelector: 提供商名称、配置状态
   - ApiKeyConfig: 标签、按钮、提示信息
   - PromptInput: 占位符、按钮文本
   - ResponsePanel: 状态消息、错误提示
   - ViewModeToggle: 视图模式标签

**验证**:
- [ ] 中文显示正确
- [ ] 英文显示正确
- [ ] 语言切换流畅
- [ ] 无翻译 key 泄露

---

## 质量关卡

### Task 6: 代码质量检查
**优先级**: P0 (Critical)

**执行**:
```bash
pnpm lint
pnpm -C apps/web build
pnpm test
```

**验证**:
- [ ] Lint 通过
- [ ] Build 成功
- [ ] 所有测试通过

---

## 提交清单

- [ ] 所有代码修改完成
- [ ] 所有测试通过
- [ ] 手动验证通过
- [ ] 质量关卡通过
- [ ] Commit message: `fix(tool-ai-chat-hub): fix i18n namespace in components`
- [ ] OpenSpec 变更归档
