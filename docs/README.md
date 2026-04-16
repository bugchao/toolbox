# 文档索引

这个仓库的文档分成三层：

1. 根目录文档：项目入口、快速理解和对外说明。
2. `docs/` 活跃文档：持续维护的规范、架构和专题设计。
3. `docs/archive/` 历史文档：阶段性快照、旧分析和一次性清单，不再作为当前事实来源。

## 当前应优先查看的文档

| 文档 | 用途 | 是否权威 |
|------|------|----------|
| [README.md](../README.md) | 项目入口、启动方式、核心文档导航 | 入口 |
| [TOOLS_ROADMAP.md](./TOOLS_ROADMAP.md) | 已开发 / 待开发 / 调研中的工具总清单 | 是 |
| [ROADMAP_CONVENTION.md](./ROADMAP_CONVENTION.md) | 如何新增规划、如何更新状态、如何避免重复 | 是 |
| [SUPERPOWERS_PLAN.md](./SUPERPOWERS_PLAN.md) | P0-P2 分层执行计划与当前迭代进度 | 是 |
| [refactor-structure.md](./refactor-structure.md) | 开发命令、目录职责、当前开发流程 | 是 |
| [TOOL_LANDING.md](./TOOL_LANDING.md) | 新工具按现有标准落地的结构和清单 | 是 |
| [MIGRATION_GUIDE.md](../MIGRATION_GUIDE.md) | 老模块迁移到新标准时的入口说明 | 入口 |
| [ARCHITECTURE.md](../ARCHITECTURE.md) | 架构入口页 | 入口 |
| [ARCHITECTURE_GRADUAL.md](./ARCHITECTURE_GRADUAL.md) | 当前渐进式架构方案 | 是 |
| [ARCHITECTURE_STATES.md](./ARCHITECTURE_STATES.md) | 当前态 vs 目标态、迁移阶段图 | 是 |
| [UI_KIT_USAGE_BY_TOOL.md](./UI_KIT_USAGE_BY_TOOL.md) | `ui-kit` 的复用约束和接入方式 | 是 |
| [STORAGE_DESIGN.md](./STORAGE_DESIGN.md) | 持久化策略设计 | 专题 |
| [TRANSLATION_STUDIO_ARCHITECTURE.md](./TRANSLATION_STUDIO_ARCHITECTURE.md) | 翻译工作台专题架构 | 专题 |

## 文档维护规则

- 工具是否已开发，以 [TOOLS_ROADMAP.md](./TOOLS_ROADMAP.md) 为准。
- 根目录的 [TOOLS_LIST.md](../TOOLS_LIST.md)、[ROADMAP.md](../ROADMAP.md)、[ARCHITECTURE.md](../ARCHITECTURE.md) 只保留概览，不再维护逐项细节。
- 新增一次性统计、批次报告、阶段复盘时，默认放进 `docs/archive/`，不要再放进活跃目录。
- 文档里的分类命名统一使用当前应用实际使用的 key：`network`、`dev`、`life`、`travel`、`utility`、`ai`、`query`、`learning`、`news`。

## 历史归档

历史快照、阶段分析和一次性清单已经移动到 [archive/README.md](./archive/README.md) 对应的目录中，便于回溯，但不再参与当前维护。
