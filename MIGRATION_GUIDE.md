# 工具迁移指南

这个文件只保留迁移入口，避免再和活跃文档重复维护。

## 当前迁移原则

项目现在采用渐进式迁移：

- 老模块可以继续运行在现有结构里
- 新模块按新标准开发
- 老模块后续再逐步迁到新标准

也就是说：

- **新工具**：默认放到 `tools/tool-<name>/`
- **旧工具**：按优先级逐步从旧页面/旧服务迁移
- **后端能力**：逐步从兼容桥迁到 `apps/api-gateway` + 领域服务
- **国际化**：逐步从主应用全量注册迁到工具内按需加载

## 现在应该看哪些文档

- [docs/TOOL_LANDING.md](docs/TOOL_LANDING.md)
  - 新工具如何按现有规范落地
- [docs/refactor-structure.md](docs/refactor-structure.md)
  - 当前目录职责和开发命令
- [docs/ARCHITECTURE_GRADUAL.md](docs/ARCHITECTURE_GRADUAL.md)
  - 渐进式架构方案
- [docs/ARCHITECTURE_STATES.md](docs/ARCHITECTURE_STATES.md)
  - 当前态 vs 目标态、迁移阶段图
- [docs/TOOLS_ROADMAP.md](docs/TOOLS_ROADMAP.md)
  - 哪些工具已完成、哪些还待开发或待迁移

## 迁移落地的最小标准

新标准工具至少满足这些条件：

1. 有独立目录：`tools/tool-<name>/`
2. 有 `tool.manifest.ts`
3. 国际化放在工具内：`src/locales/zh.json`、`src/locales/en.json`
4. 公共 UI 优先复用 `packages/ui-kit`
5. 导航/首页通过配置和 manifest 接入
6. 若需要后端能力，优先走 `apps/api-gateway` 或兼容桥

## 不再继续维护的旧口径

以下旧说法已经不再作为当前标准：

- “所有工具都应该继续放在 `apps/web/src/pages/`”
- “新工具接入必须手写一整套静态 import”
- “工具文案统一全放到主应用 i18n”
- “根目录长文档维护精确工具数量和逐项统计”

如果需要继续推进某一批老模块迁移，直接以以上文档为准，不要再参考历史快照式文档。
