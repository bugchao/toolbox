# 新工具落地标准

这份文档只回答一个问题：新工具应该怎样按当前仓库标准落地。

## 默认落位

新工具默认使用独立工具包：

```text
tools/tool-xxx/
  package.json
  tool.manifest.ts
  src/
    index.tsx
    locales/
      zh.json
      en.json
```

只有极少数历史页面仍然保留在 `apps/web/src/pages/`。新增需求默认不要再走这个旧路径。

## 必备标准

### 1. manifest

每个新工具必须有 `tool.manifest.ts`，至少包含：

- `id`
- `path`
- `namespace`
- `categoryKey`
- `icon`
- `meta.zh`
- `meta.en`
- `loadComponent`
- `loadMessages`

### 2. 工具内 i18n

国际化默认跟工具走，不再把完整文案堆进主应用：

- `src/locales/zh.json`
- `src/locales/en.json`

### 3. UI 复用

- 先用 `packages/ui-kit`
- 如果需要引入新的外部 UI 能力，先封装进 `ui-kit`，再给工具使用

### 4. 后端接入

如果工具需要服务端能力：

- 优先复用 `apps/api-gateway`
- 老能力先经由 `services/legacy-tools-service`
- 新领域能力逐步下沉到独立服务模块

## 推荐流程

1. 在 [TOOLS_ROADMAP.md](./TOOLS_ROADMAP.md) 确认该工具已立项或补上立项
2. 运行 `pnpm create:tool <name>`
3. 完成 UI、文案、manifest
4. 如有后端能力，补 API 接线
5. 运行 `pnpm -C apps/web build`
6. 更新 [TOOLS_ROADMAP.md](./TOOLS_ROADMAP.md) 的状态

## 什么时候需要额外抽象

以下情况应优先抽公共能力，不要直接把实现塞进单个工具：

- 多个工具会复用同一类展示卡片或表单组件
- 需要统一主题适配
- 需要统一图表、上传、时间范围、结果面板等交互模式
- 需要引入第三方组件库

这类能力统一沉淀到 `packages/ui-kit`。
