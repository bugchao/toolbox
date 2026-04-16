# 工具盒子

一个基于 Monorepo 的在线工具平台。当前项目已经进入 `200+` 工具规模，前端保持统一壳层，新增工具按 `manifest + 工具内 i18n + ui-kit 复用` 的标准接入，后端通过 `api-gateway + legacy bridge` 渐进演进。

## 快速开始

```bash
pnpm install
pnpm dev
```

默认打开 `http://localhost:3000`。

## 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动前端开发环境 |
| `pnpm dev:api` | 启动 `apps/api-gateway` |
| `pnpm dev:full` | 同时启动前端和网关 |
| `pnpm build` | 构建前端 |
| `pnpm build:backend` | 构建 `api-gateway` |
| `pnpm start` | 启动兼容入口 `server.js` |
| `pnpm start:api` | 直接启动 `apps/api-gateway` |
| `pnpm test` | 运行前端单测 |
| `pnpm test:e2e` | 运行 Playwright E2E |

## 当前结构

```text
toolbox/
├── apps/
│   ├── web/                 # 主前端壳层
│   └── api-gateway/         # 新后端入口
├── packages/
│   ├── ui-kit/              # 公共 UI 组件
│   ├── tool-registry/       # manifest 标准
│   ├── i18n-runtime/        # 工具级按需国际化
│   └── service-core/        # 服务模块基础能力
├── services/
│   └── legacy-tools-service/# 老服务兼容桥
├── tools/                   # 独立工具包
└── docs/                    # 活跃文档与归档
```

## 文档入口

| 文档 | 用途 |
|------|------|
| [docs/README.md](docs/README.md) | 文档总索引，先看这里 |
| [docs/TOOLS_ROADMAP.md](docs/TOOLS_ROADMAP.md) | 工具已开发 / 待开发唯一权威清单 |
| [docs/ROADMAP_CONVENTION.md](docs/ROADMAP_CONVENTION.md) | 如何新增规划、更新状态、避免重复 |
| [docs/refactor-structure.md](docs/refactor-structure.md) | 当前开发命令、目录职责、日常开发流程 |
| [docs/TOOL_LANDING.md](docs/TOOL_LANDING.md) | 新工具落地标准与接入清单 |
| [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) | 老模块按新标准渐进迁移的入口说明 |
| [ARCHITECTURE.md](ARCHITECTURE.md) | 架构总览入口 |
| [ROADMAP.md](ROADMAP.md) | 路线图总览入口 |
| [TOOLS_LIST.md](TOOLS_LIST.md) | 对外/产品视角的工具目录入口 |

## 文档维护约定

- 工具状态和代码落位只在 [docs/TOOLS_ROADMAP.md](docs/TOOLS_ROADMAP.md) 维护。
- 根目录的 [ARCHITECTURE.md](ARCHITECTURE.md)、[ROADMAP.md](ROADMAP.md)、[TOOLS_LIST.md](TOOLS_LIST.md) 只保留高层概览，不再维护逐项细节。
- 阶段性统计、批次记录和历史分析放进 `docs/archive/`，不再与活跃文档混放。

## 许可证

MIT
