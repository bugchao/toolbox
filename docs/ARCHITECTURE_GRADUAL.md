# Toolbox 渐进式架构方案

## 目标

- 保持 `pnpm dev` 仍然只启动前端，兼容现有开发习惯。
- 新增 `api-gateway` 作为根级后端模块，逐步替代根上的 `server.js` 手工注册模式。
- 新工具采用“工具自带 manifest + 工具自带 i18n + 领域服务接入”的新标准。
- 老工具继续通过兼容桥运行，后续按领域逐步迁移。

补充阅读：
- [架构对比与迁移阶段图](/Users/dyck/workspaces/ai/toolbox-codex/docs/ARCHITECTURE_STATES.md)

## 当前落地结果

### 前端

- 新增 `@toolbox/tool-registry`
  - 定义工具 manifest 标准。
- 新增 `@toolbox/i18n-runtime`
  - 负责工具 namespace 按需加载。
- `tool-weather` 作为首个新标准工具：
  - 自带 `tool.manifest.ts`
  - 文案保留在工具目录内
  - 路由进入时才加载 namespace
- 首页、导航仍然可以显示新工具标题和描述：
  - 优先读工具 namespace
  - namespace 未加载时回退到 manifest 的静态 meta

### 后端

- 新增 `apps/api-gateway`
  - 作为新的后端入口
  - 提供 `/health`、`/ready`、`/api/system/services`
- 新增 `@toolbox/service-core`
  - 统一服务模块定义与注册
- 新增 `@toolbox/legacy-tools-service`
  - 把现有 `server.js` 中的老路由注册逻辑收拢成兼容服务桥
- 根上的 `server.js` 变成兼容入口，内部转发到 `api-gateway`

## 新工具开发标准

每个新工具按如下结构组织：

```text
tools/tool-foo/
  package.json
  tool.manifest.ts
  src/index.tsx
  src/locales/zh.json
  src/locales/en.json
```

### 必须具备

- `tool.manifest.ts`
  - `id`
  - `path`
  - `namespace`
  - `meta.zh`
  - `meta.en`
  - `loadComponent`
  - `loadMessages`
- 国际化文案保留在工具目录内
- 公共 UI 能力只通过 `ui-kit` 暴露
- 如果依赖服务端能力，后续接入领域服务模块，不再直接把业务逻辑塞进根入口

## 老模块迁移策略

### 第一阶段：兼容共存

- 老模块继续由 `legacy-tools-service` 挂载
- 新模块按 manifest + 工具级 i18n 标准开发
- 根前端仍然用统一壳层应用承载

### 第二阶段：领域拆分

建议逐步把后端能力下沉到：

- `services/network-service`
- `services/dns-service`
- `services/ip-service`
- `services/security-service`
- `services/content-service`

迁移方式：

1. 先复制旧接口到领域服务
2. 在 `api-gateway` 注册新服务
3. 验证新旧接口一致
4. 再从 `legacy-tools-service` 删除旧注册

### 第三阶段：收缩主应用 i18n

- 新工具不再进入 `apps/web/src/i18n.ts`
- 老工具按优先级逐步迁移到 manifest + runtime 模式
- 最终 `apps/web/src/i18n.ts` 只保留壳层 namespace

## 推荐命令

```bash
pnpm dev
pnpm run dev:api
pnpm run dev:full
pnpm run build:backend
pnpm run start:api
pnpm run start:api:dist
```

## 迁移优先级建议

1. 所有新工具强制走新标准
2. 网络与 DNS 工具优先从 `legacy-tools-service` 迁出
3. 安全与 IP 类工具第二批迁出
4. 剩余纯前端工具最后再逐步做 i18n manifest 化
