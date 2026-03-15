# 工具盒子 - 开发路线图

> **说明**：本文件为**高层路线图**。工具级「已开发/待开发」以 [docs/TOOLS_ROADMAP.md](docs/TOOLS_ROADMAP.md) 为准，架构阶段以 [ARCHITECTURE.md](ARCHITECTURE.md) 为准。规划新工具或查是否已开发请直接看 TOOLS_ROADMAP。

---

## 当前状态（截至 2026-03）

- **已上线工具**：31 个（清单与代码落位见 [docs/TOOLS_ROADMAP.md](docs/TOOLS_ROADMAP.md) 第二节）
- **架构**：Monorepo 已落地
  - 主应用：`apps/web`（Vite + React，路由 + React.lazy 按需加载）
  - 工具包：`tools/tool-resume`、`tools/tool-pdf`、`tools/tool-qrcode`（独立依赖）
  - 公共包：`packages/core`、`packages/ui-kit`
- **待开发工具**：5 个（CSV/Excel 编辑器、格式转换器、AI 会议纪要、AI UI、AI PPT，见 [docs/TOOLS_ROADMAP.md](docs/TOOLS_ROADMAP.md) 第三节）

---

## 下一阶段（与 ARCHITECTURE 对齐）

- **工具增量**：优先落地 TOOLS_ROADMAP 中的待开发项，新规划统一登记在 TOOLS_ROADMAP，避免重复
- **架构**：微前端运行时、后端基础等按 [ARCHITECTURE.md](ARCHITECTURE.md) 阶段 2/3/4 推进

---

## 目标概览（方向性）

| 周期 | 目标 |
|------|------|
| **Q2 (4–6 月)** | 工具数 50+，用户系统/收藏历史，部署与监控完善 |
| **Q3–Q4** | 工具数 200+，PWA/离线、移动端适配，AI 助手/企业能力探索 |
| **长期** | 1000+ 工具生态，百万级用户 |

具体阶段任务与验收见 [ARCHITECTURE.md](ARCHITECTURE.md) 分阶段实施路线图。
