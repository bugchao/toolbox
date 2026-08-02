# 2026-08-02 合并记录

本次直接在本地 `main` 上完成 2 个待合并特性分支的合并（未走 PR），并顺带完成一轮 ui-kit 组件抽取与全仓库复用改造。

---

## 新增工具

### 一、图片文件大小精确调整（tool-image-kb-resizer）

- **路径**：`/image-kb-resizer` ｜ **分类**：utility
- **功能**：把图片压缩或增大到目标 KB 大小（JPEG 质量二分搜索 + PNG/WEBP 尾部字节填充），纯前端 Canvas 处理，无上传
- **来源分支**：`feat/tool-image-kb-resizer`（合并前已在该分支完成开发 + openspec 归档）

### 二、全方位 HTTPS 检测（tool-https-inspector）

- **路径**：`/https-inspector` ｜ **分类**：network
- **功能**：七大区块 —— 概览、证书详情、协议套件矩阵、漏洞探测、握手模拟、兼容性、评级；覆盖 IPv6/CDN/邮件安全/国密/后量子检测
- **架构**：`server/checks/*.js` 按检测维度拆分（cdn / cert-compat / cipher-matrix / gm / handshake-sim / https / ipv6 / mail / openssl-cert / overview / pqc / protocol-details / vulnerabilities），通过 `execFile` 调用系统 `openssl` + 自实现 `tls-raw.js` 做原始握手
- **测试**：8 个测试文件
- **来源分支**：`feat/tool-https-inspector`（分两轮开发：基础检测 → 补全七区块）

---

## ui-kit 组件复用改造

调研发现 `tools/*` 中 95 处文件手写"复制到剪贴板"逻辑（`useState(copied)` + `setTimeout` + 图标切换）、58 处手写 loading 转圈样式，均未走共享组件。新增：

- **`CopyButton`**：封装复制 + 成功态反馈，支持 `icon`/`button`/`inline` 三种呈现，`button` 变体直接复用 `Button` 的 variant 体系
- **`Spinner`**：统一旋转指示器
- **`Button` 新增 `loading` 属性**：自动禁用 + 前置 Spinner

**批量迁移 90 个工具文件**（92 处手写复制逻辑中，2 处确认是未被引用的死代码，跳过）到 `CopyButton`，净减少约 800 行重复代码。顺带修复：

- 多处工具的 `alert('已复制到剪贴板')` 弹窗改为内联图标反馈
- `tool-concept-explainer`/`tool-eli5` 中共享单个 `copied` 布尔值导致多张展开卡片互相干扰复制态的 bug
- `tool-color-scheme-generator` 自定义 CSS 补充 `button` 选择器以支撑 `div → button` 替换

验证方式：每批迁移后跑 `pnpm -C apps/web exec tsc --noEmit`，全程保持 0 错误。

---

## 部署修复

生产 `Dockerfile` 排查出两个此前未发现的问题：

1. **证书/TLS 类工具缺 openssl**：`cert-content-viewer`/`cert-csr-viewer`/`ssl-format-converter`/`https-inspector` 都通过 `execFile` 调用系统 `openssl` CLI，生产镜像未安装，运行时必挂。已加 `apk add --no-cache openssl`。
2. **生产阶段未拷贝后端目录**：此前只拷贝 `package.json`/`server.js`/`crawler`/前端产物，但 `server.js` 直接以源码方式加载 `apps/api-gateway` + `services/*` + `tools/*/server`（无打包步骤），导致 api-gateway 启动时 import 失败。改为复用 builder 阶段已完整 `pnpm install` 的整棵 workspace，配合 `pnpm prune --prod` 控制体积。

顺带修复 `corepack prepare pnpm@latest` 版本漂移问题（曾导致构建时解析到未验证的 pnpm 11，与仓库的构建脚本审批机制不兼容而构建失败）：改为通过 `package.json` 的 `packageManager` 字段锁定版本，配合 `pnpm-workspace.yaml` 的 `onlyBuiltDependencies` 显式批准原生依赖的安装脚本。

> `feat/tool-https-inspector` 分支独立发现并修复了 openssl 缺失问题，合并时与本次的 Dockerfile 改动冲突，取本次版本（同时覆盖了后端目录拷贝的修复）。

---

## Git 一览

本次未走 PR，直接在本地 `main` 上完成：

| 提交 | 说明 |
|---|---|
| `baca7187` | fix(deploy): 修复生产 Dockerfile 缺失 openssl 与后端目录 |
| `161b70a6` | feat(ui-kit): 新增 CopyButton/Spinner 组件，Button 支持 loading 态 |
| `64c2a7a5` | refactor(tools): 批量迁移复制按钮到 ui-kit CopyButton（96 个文件） |
| `f87c0f33` | Merge `feat/tool-image-kb-resizer` |
| `259a6d1c` | Merge `feat/tool-https-inspector`（含 Dockerfile 冲突解决） |

## 工具总数

`tools/` 目录 **317 个**。
