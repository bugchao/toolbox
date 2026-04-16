# 开发与扩展说明

这份文档面向日常开发。目标只有两个：

1. 让人快速跑起来。
2. 让新增工具按当前标准稳定落地。

## 快速开始

```bash
pnpm install
pnpm dev
```

常用补充命令：

| 命令 | 说明 |
|------|------|
| `pnpm dev:api` | 启动 `apps/api-gateway` |
| `pnpm dev:full` | 同时启动前端和网关 |
| `pnpm build` | 构建前端 |
| `pnpm build:backend` | 构建 `api-gateway` |
| `pnpm check:consistency` | 校验路由、导航配置、manifest 与 `TOOLS_ROADMAP` 是否一致 |
| `pnpm test` | 前端单测 |
| `pnpm test:e2e` | E2E 测试 |

## 当前目录职责

```text
apps/
  web/                 # 前端壳层、路由、导航、主题
  api-gateway/         # 新后端入口
packages/
  ui-kit/              # 公共 UI
  tool-registry/       # 工具 manifest 规范
  i18n-runtime/        # 工具级国际化按需加载
  service-core/        # 服务模块基础能力
services/
  legacy-tools-service/# 老服务兼容桥
tools/
  tool-xxx/            # 独立工具包
```

## 当前开发原则

- 新工具默认放 `tools/tool-xxx/`
- 新工具默认带 `tool.manifest.ts`
- 新工具文案保留在工具目录内
- 通用 UI 和外部 UI 库封装统一收进 `packages/ui-kit`
- 需要服务端能力时，优先考虑 `api-gateway + service/bridge` 接入，不要把逻辑继续堆回根入口

## 新增工具的最小清单

1. 运行 `pnpm create:tool <name>`
2. 完成 `tool.manifest.ts`
3. 完成 `src/index.tsx`
4. 完成 `src/locales/zh.json` 与 `src/locales/en.json`
5. 视情况补服务端接口或接入现有服务
6. 运行 `pnpm -C apps/web build`

脚手架生成后，manifest 会自动被扫描；工具路由和导航会通过 manifest 和静态配置共同接入。

## 新工具落地前先看

- [TOOLS_ROADMAP.md](./TOOLS_ROADMAP.md)：确认有没有重复工具
- [TOOL_LANDING.md](./TOOL_LANDING.md)：确认结构和接线标准
- [UI_KIT_USAGE_BY_TOOL.md](./UI_KIT_USAGE_BY_TOOL.md)：确认是否需要先抽公共组件

## 文档边界

- 查“有没有这个工具”：看 [TOOLS_ROADMAP.md](./TOOLS_ROADMAP.md)
- 查“怎么开发”：看本文档
- 查“怎么落结构和接线”：看 [TOOL_LANDING.md](./TOOL_LANDING.md)
