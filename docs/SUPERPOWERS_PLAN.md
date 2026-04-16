# Toolbox Superpowers 执行计划

这份文档把当前项目的遗留项、优化项和迁移项收成一套真正可执行的 `P0-P2` 计划。

目标不是一次性“大重构”，而是：

1. 先消掉已经影响一致性和演进效率的架构卡点。
2. 再提升迁移速度、构建质量和测试覆盖。
3. 最后做服务边界、自动化和体验层的长期增强。

## 使用方式

- 每次推进优先看 `P0`，只有 `P0` 明显收敛后再大规模展开 `P1`。
- 每个事项必须同时写清楚：
  - 问题
  - 目标
  - 验收标准
  - 当前状态
- 进展更新只维护这份文档，不再分散到多个一次性说明里。

## 状态说明

| 状态 | 说明 |
|------|------|
| `planned` | 已确认要做，但还没开始 |
| `in_progress` | 正在实施 |
| `done` | 已完成并验证 |

## P0：先把架构卡点收掉

### P0-1 工具级 i18n 收口到 runtime

- 状态：`in_progress`
- 问题：
  - `apps/web/src/i18n.ts` 仍静态导入大量工具文案
  - 与 manifest 的 `loadMessages` 并存，形成双轨
  - 已经导致构建 warning，并持续抬高首屏和维护成本
- 目标：
  - 新标准工具默认只通过 `tool.manifest.ts + @toolbox/i18n-runtime` 加载文案
  - `apps/web/src/i18n.ts` 逐步只保留壳层 namespace 和确有必要的历史兼容项
- 第一阶段范围：
  - 先移除已经 manifest 化且可安全切走的静态文案导入
  - 先清掉当前 build 中已暴露的 warning
- 验收标准：
  - `pnpm -C apps/web build` 不再出现当前已知的动态/静态双导入 warning
  - 导航、首页和工具页标题/描述不回退成裸 key

### P0-2 建立“代码 / 配置 / 文档”一致性校验

- 状态：`done`
- 问题：
  - `TOOLS_ROADMAP`、导航配置、实际路由和 manifest 仍需要人工同步
  - 已经出现过 `/ip-query` 这类文档与实现不一致
- 目标：
  - 增加一个本地可跑的校验脚本，检查：
    - 路由是否已接入
    - 导航配置是否唯一
    - 已 manifest 化工具是否仍被手工重复登记
    - `TOOLS_ROADMAP` 中的代码位置是否过期
- 验收标准：
  - 能输出明确的 mismatch 清单
  - 后续变更可以在提交前快速发现漂移

### P0-3 从兼容桥中拆出首批领域服务骨架

- 状态：`done`
- 问题：
  - `apps/api-gateway` 已经是入口，但当前仍只注册 `legacy-tools-service`
  - 服务边界已经有目标方案，但还没真正开始拆
- 目标：
  - 先在 `services/` 下建立真实可注册的首批领域服务骨架：
    - `dns-service`
    - `ip-service`
    - `security-service`
  - 新增后端能力不再继续堆进兼容桥
- 验收标准：
  - `api-gateway` 中能看到除兼容桥外的真实服务模块
  - 至少一组旧接口从兼容桥迁出并保持行为一致

## P1：提升迁移效率和工程质量

### P1-1 迁移高频旧页面工具到新标准

- 状态：`planned`
- 目标：
  - 优先迁移仍停留在 `apps/web/src/pages/` 的高频工具
  - 第一批建议：
    - `json`
    - `format-converter`
    - `markdown`
    - `dns-query`
    - `meeting-minutes`
    - `news`
    - `bmi`
    - `unit-converter`
    - `color-picker`
    - `short-link`
- 验收标准：
  - 工具迁移到 `tools/tool-*`
  - 工具自带 manifest 和 locales
  - `TOOLS_ROADMAP` 与导航配置同步更新

### P1-2 构建拆包和大 chunk 优化

- 状态：`planned`
- 问题：
  - 当前 build 已通过，但仍有明显的大 chunk warning
  - PDF、编辑器、图表和重型工具会继续放大这个问题
- 目标：
  - 基于路由和能力边界做 chunk 收敛
  - 为重型依赖建立更清晰的加载边界
- 验收标准：
  - 主包显著缩小
  - 已知超大 chunk 数量下降

### P1-3 补齐 shared logic 的单测层

- 状态：`planned`
- 问题：
  - 当前 E2E 有一定覆盖，但 unit-like 测试明显偏少
- 目标：
  - 先给这些层补单测：
    - storage hooks
    - 解析/转换工具函数
    - 网络工具中的纯逻辑模块
    - 文案/配置回退逻辑
- 验收标准：
  - 单测不再只有极少数样例
  - 回归类 bug 不再只能靠手点页面发现

## P2：长期治理和平台能力增强

### P2-1 持续缩小 legacy bridge

- 状态：`planned`
- 目标：
  - 逐步把兼容桥变成少量遗留模块的收口层，而不是默认承载层

### P2-2 文档与发布说明自动化

- 状态：`planned`
- 目标：
  - 基于 manifest / 配置自动生成部分目录说明
  - 减少 `TOOLS_ROADMAP` 和入口文档的人工同步成本

### P2-3 观测与质量门槛补强

- 状态：`planned`
- 目标：
  - 补充服务健康信息、构建质量门槛、关键路径监控
  - 让“工具越来越多”不等于“发布越来越靠人工经验”

## 当前迭代

### Iteration 1

- 主题：`P0-1 工具级 i18n 收口`
- 当前状态：`done`
- 已完成：
  - 已移除 `tool-daily-planner`、`tool-project-scaffold` 在 `apps/web/src/i18n.ts` 中的静态注册
  - 保留工具页通过 manifest runtime 加载文案
  - 已通过 `pnpm -C apps/web build` 验证，当前已知的双导入 warning 已消失
- 下一步：
  - 按同样方式继续缩减 `apps/web/src/i18n.ts` 中的工具级静态文案
  - 进入 `P0-2`，补齐代码 / 配置 / 文档一致性校验

### Iteration 2

- 主题：`P0-2 一致性校验`
- 当前状态：`done`
- 已完成：
  - 新增 [scripts/check-tool-consistency.cjs](/Users/dyck/workspaces/ai/toolbox-codex/scripts/check-tool-consistency.cjs)
  - 新增命令 `pnpm check:consistency`
  - 校验覆盖了导航配置重复、manifest/配置 namespace 对齐、已开发 Roadmap 路由重复、代码位置存在性、路由接入情况
  - 已清理 `a-dev-tools.ts` / `a-network-tools.ts` 中的重复配置
  - 已清理 `App.tsx` 中一批与 manifest 自动挂载重复的手写路由
  - 已修正 `TOOLS_ROADMAP.md` 中已开发清单的重复路由项
  - 已通过 `pnpm check:consistency` 与 `pnpm -C apps/web build` 验证
- 下一步：
  - 进入 `P0-3`，开始把兼容桥中的后端能力拆出首批领域服务骨架

### Iteration 3

- 主题：`P0-3 领域服务骨架`
- 当前状态：`done`
- 已完成：
  - 新增 `@toolbox/dns-service`、`@toolbox/ip-service`、`@toolbox/security-service`
  - `api-gateway` 已同时注册三类领域服务和 `legacy-tools-service`
  - 已把 DNS、IP、Security 相关路由注册从兼容桥迁出到独立服务模块
  - 已进一步把 `whois` 归入 `dns-service`，把证书工具归入 `security-service`
  - `legacy-tools-service` 收缩为新闻、邮编、store、HTTP 状态码和少量遗留接口承载层
- 验收结果：
  - `api-gateway` 已不再只注册单一兼容桥
  - 首批真实接口已通过领域服务接线承载
- 下一步：
  - 继续缩小 legacy bridge 中剩余的遗留接口
  - 给服务清单增加更细粒度的健康信息与分类说明

后续每完成一个阶段，就在这里追加一条迭代记录。
