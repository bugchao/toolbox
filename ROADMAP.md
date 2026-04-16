# 路线图总览

这份文档只保留高层路线和优先级。工具级别的已开发 / 待开发 / 调研状态，统一以 [docs/TOOLS_ROADMAP.md](docs/TOOLS_ROADMAP.md) 为准。

## 当前优先级

1. 新增工具继续按 `manifest + 工具内 i18n + ui-kit` 标准开发。
2. 老工具按价值和风险逐步迁移，不追求一次性全部重构。
3. 后端能力继续从根入口收敛到 `apps/api-gateway` 和领域服务。
4. 文档、导航、工具清单保持单一事实来源，避免平行维护。

## 你应该看哪份文档

- 查工具是否已开发： [docs/TOOLS_ROADMAP.md](docs/TOOLS_ROADMAP.md)
- 新增或调整规划： [docs/ROADMAP_CONVENTION.md](docs/ROADMAP_CONVENTION.md)
- 看架构阶段： [ARCHITECTURE.md](ARCHITECTURE.md)
- 落地新工具： [docs/TOOL_LANDING.md](docs/TOOL_LANDING.md)

## 目标方向

- 继续扩展到更大工具规模，同时保持前端壳层统一。
- 让新工具默认自带元信息、国际化和可复用 UI。
- 让服务端能力逐渐具备更清晰的边界、治理和复用能力。
