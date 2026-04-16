# 架构总览

这份文档只保留架构入口信息。当前项目的详细架构设计与迁移阶段，请分别查看：

- [docs/ARCHITECTURE_GRADUAL.md](docs/ARCHITECTURE_GRADUAL.md)
- [docs/ARCHITECTURE_STATES.md](docs/ARCHITECTURE_STATES.md)
- [docs/TRANSLATION_STUDIO_ARCHITECTURE.md](docs/TRANSLATION_STUDIO_ARCHITECTURE.md)

## 当前架构

- 前端入口：`apps/web`
- 新后端入口：`apps/api-gateway`
- 老服务兼容桥：`services/legacy-tools-service`
- 新工具标准：
  - `tool.manifest.ts`
  - 工具内 `src/locales/zh.json` / `en.json`
  - UI 通过 `packages/ui-kit`
  - 国际化通过 `packages/i18n-runtime`
- 新增工具默认走 `tools/tool-xxx/`，由 manifest 驱动接入

## 当前原则

1. `pnpm dev` 仍然只启动前端，保持日常开发简单。
2. 后端能力逐步从根 `server.js` 迁到 `api-gateway + 领域服务`。
3. 新工具按新标准开发，老工具渐进迁移，不做一次性重写。
4. 文档与规范优先服务“持续开发”，不再保留会快速失真的平行清单。

## 推荐阅读顺序

1. [docs/ARCHITECTURE_STATES.md](docs/ARCHITECTURE_STATES.md)
2. [docs/ARCHITECTURE_GRADUAL.md](docs/ARCHITECTURE_GRADUAL.md)
3. [docs/refactor-structure.md](docs/refactor-structure.md)
4. [docs/TOOL_LANDING.md](docs/TOOL_LANDING.md)
