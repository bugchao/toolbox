# 2026-06-01 新增工具开发记录

并行 subagent 协作开发：用 isolation=worktree 启动两个隔离 agent，favicon 全程在 worktree 内由 subagent 完成；box-shadow 在 worktree 中遭遇写权限策略拦截后，由主会话在主仓接手完成。两工具汇入 `feat/batch-tools-31` 单一 PR 发布。

## 新增工具

### 1. Favicon 生成器（tool-favicon-generator）

- **路径**：`/favicon-generator`
- **分类**：实用工具（utility）
- **功能**：
  - 输入：单张图片（PNG / JPG / WebP / SVG）
  - 输出：
    - `favicon.ico`：单文件多尺寸（16/32/48），PNG-in-ICO 容器方案
    - 独立 PNG：16 / 32 / 48 / 96 / 180（apple-touch-icon）/ 192 / 512
    - `site.webmanifest` 片段（maskable 模式下 `purpose: "any maskable"`）
    - HTML `<link>` 片段（zh / en 注释，可直接粘到 `<head>`）
    - 全部资源一键打 ZIP
  - 选项：透明背景 / 自填底色、maskable 安全区开关
  - 预览：四档（16 / 32 / 48 / 180）实时缩略
- **技术栈**：React + TypeScript + Tailwind；Canvas resize + 自实现 ICONDIR/ICONDIRENTRY 编码；新增依赖 `jszip ^3.10`
- **测试**：23 个单测（`ico.test.ts` 8 + `resize.test.ts` 7 + `snippets.test.ts` 8）

### 2. CSS 阴影生成器（tool-box-shadow-gen）

- **路径**：`/box-shadow-gen`
- **分类**：实用工具（utility）
- **功能**：
  - 多层 `box-shadow` 可视化编辑：每层 x / y / blur / spread / 颜色 / alpha / inset 全开
  - 层管理：添加、删除、上下移动；不可变更新
  - 形状切换：矩形 / 胶囊 / 圆形；可调圆角、块色、舞台底色
  - 8 个预设：Material 1 / 2 / 4 / 8 / 16、Neumorphism Light / Dark、Glassmorphism
  - 输出：完整 CSS 规则 + Tailwind 任意值（`[box-shadow:...]`），独立 Copy 按钮
- **技术栈**：纯 React + Tailwind，**零新增依赖**
- **测试**：27 个单测（`shadow.test.ts` 13 + `layers.test.ts` 9 + `presets.test.ts` 5）

## 文件变更

### 新增文件

- `tools/tool-favicon-generator/package.json`（新增 `jszip` 依赖）
- `tools/tool-favicon-generator/tool.manifest.ts`
- `tools/tool-favicon-generator/src/index.tsx`
- `tools/tool-favicon-generator/src/FaviconGenerator.tsx`
- `tools/tool-favicon-generator/src/lib/{ico,resize,snippets}.ts`
- `tools/tool-favicon-generator/src/lib/{ico,resize,snippets}.test.ts`
- `tools/tool-favicon-generator/src/locales/{zh,en}.json`
- `tools/tool-box-shadow-gen/package.json`
- `tools/tool-box-shadow-gen/tool.manifest.ts`
- `tools/tool-box-shadow-gen/src/index.tsx`
- `tools/tool-box-shadow-gen/src/BoxShadowGen.tsx`
- `tools/tool-box-shadow-gen/src/lib/{shadow,layers,presets}.ts`
- `tools/tool-box-shadow-gen/src/lib/{shadow,layers,presets}.test.ts`
- `tools/tool-box-shadow-gen/src/locales/{zh,en}.json`

### 修改文件

- `docs/TOOLS_ROADMAP.md`：在「二、已开发 → 实用工具」表中追加两行
- `pnpm-lock.yaml`：jszip 引入 + 新工具 workspace 注册

> manifest 工具由 Vite 虚拟模块自动注册到路由 / 首页 / 导航，**未**编辑 `apps/web/src/config/a-*.ts`。

## 质量门

- `pnpm lint` → 0 warnings
- `pnpm exec vitest run ../../tools/tool-box-shadow-gen ../../tools/tool-favicon-generator` → **50 passed / 50**
- `pnpm build` → 通过（仅原有 chunk-size 提示）

> 注：仓库根 `src/config/tools.test.ts` 仍有 2 个预存量失败，与本批次无关，先于本分支存在。

## Git

- 分支：`feat/batch-tools-31`
- 两个 `--no-ff` merge commit 保留各自分支历史
- PR：[#18](https://github.com/bugchao/toolbox/pull/18)

## 工具总数（粗略）

`tools/` 目录从 266 → **268**（+2，本日新增 favicon-generator + box-shadow-gen）。
