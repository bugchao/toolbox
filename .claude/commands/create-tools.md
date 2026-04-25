---
description: 端到端开发一个新工具：PRD → 规划 → 实现(TDD) → 审查 → 截图 → PR
argument-hint: <工具名称>
---

# /create-tools $ARGUMENTS

你正在编排此 monorepo 中新工具的端到端创建流程。工具名称在 `$ARGUMENTS` 中（kebab-case 格式，例如 `dns-query`）。如果 `$ARGUMENTS` 为空，在执行任何操作之前先询问用户工具名称。

这是一个**长期运行的多阶段工作流，包含一个人工审核关卡**。不要跳过阶段。每个阶段结束后，简要告诉用户刚刚发生了什么以及接下来要做什么。

使用 `TaskCreate` 跟踪各个阶段，以便用户可以看到进度。在开始每个阶段时将其标记为 `in_progress`，完成时标记为 `completed`。

---

## 阶段 0 — 预检

在执行任何操作之前，验证环境：

1. **工具名称有效性**：必须匹配 `^[a-z0-9]+(-[a-z0-9]+)*$`。如果不匹配，中止并给出清晰的错误提示。
2. **名称冲突**：检查 `tools/tool-$ARGUMENTS/` 是否不存在；检查是否没有 manifest 已经使用路径 `/$ARGUMENTS`。如果冲突，询问用户是选择不同的名称还是在现有工具上工作。
3. **必需的 CLI**：确认 `openspec` 可用（`which openspec`）。如果缺失，告诉用户运行 `npm i -g @fission-ai/openspec` 并停止。
4. **必需的插件**：检查 `superpowers` 插件是否已安装（`/plugin list` 风格 — 查看 `~/.claude/plugins/installed_plugins.json`）。如果缺失，告诉用户运行 `/plugin install superpowers@claude-plugins-official` 并停止。
5. **工作树**：运行 `git status --porcelain`。如果有未提交的更改，询问用户是继续（未提交的工作将被打包到 PR 中）还是先 stash。
6. **分支**：如果当前在 `main` 上，创建并切换到特性分支 `feat/tool-$ARGUMENTS`。否则保持在当前分支但警告用户。
7. **openspec 初始化**：如果仓库根目录不存在 `openspec/` 目录，在继续之前运行 `openspec init`（是的，在这个仓库中）。

预检后，总结你发现的内容并在继续之前与用户确认。

---

## 阶段 1 — 需求收集（交互式）

使用 `AskUserQuestion` 收集需求。在**一批**中提出以下问题（调整措辞，保持简洁）：

1. **这个工具做什么？**（一句话目的）
2. **谁使用它以及何时使用？**（目标用户 + 触发场景）
3. **输入和输出？**（用户提供什么，得到什么）
4. **需要后端吗？**（no / yes-light / yes-heavy — 影响是否触及 `apps/api-gateway` 和 service 模块）
5. **参考工具？**（指向现有的 `tools/tool-*`，其 UX 或形态最接近，以便我们可以匹配模式）
6. **分类？**（以下之一：dns, domain, ip, dhcp, gslb, ipam, network, dev, life, travel, utility, ai, query, learning, blockchain — 参见 `apps/web/src/config/a-*.ts` 中的示例）

如果用户在原始消息中提供了其中任何内容，不要重新询问 — 确认你推断的内容。

---

## 阶段 2 — PRD + 实现规划

生成 `docs/tools/$ARGUMENTS/PRD.md`，结构如下（使用中文 — 仓库语言是双语的，但 PRD 默认为中文）：

```markdown
# PRD: <工具显示名称>

- 工具 ID: tool-$ARGUMENTS
- 路径: /$ARGUMENTS
- 分类: <category>
- 模式: <client | server | hybrid>
- 创建日期: <today>

## 1. 背景与目标
## 2. 目标用户与场景
## 3. 功能范围
   ### 3.1 必须有 (P0)
   ### 3.2 应该有 (P1)
   ### 3.3 不做
## 4. 输入与输出
## 5. UI 草图（文字描述）
## 6. 后端能力（如需）
   - 接口路径、入参、出参
   - 复用/新建的 service 模块
## 7. i18n 关键词清单
## 8. 验收标准
## 9. 参考工具
## 10. 实现任务分解
   - 按 TDD 原则分解的实现任务清单
   - 每个任务包含：功能点、测试要点、验收标准
```

写完 PRD 后，基于 PRD 创建 OpenSpec 变更提案：

1. 运行 `openspec change add add-$ARGUMENTS-tool`
2. 在 `openspec/changes/add-$ARGUMENTS-tool/` 下编写变更规范，涵盖：正在添加的能力、设计说明、验证标准
3. 运行 `openspec validate add-$ARGUMENTS-tool` 并修复任何错误

完成后，向用户显示 PRD 路径和 OpenSpec 变更路径。

### 🧑 人工关卡 — PRD 和规划审阅

停止并明确询问用户：**"PRD 和实现规划已生成：
- PRD: `docs/tools/$ARGUMENTS/PRD.md`
- OpenSpec: `openspec/changes/add-$ARGUMENTS-tool/`

请审阅。通过 / 需要修改？"**

在用户明确表示批准之前不要继续。如果他们想要更改，编辑并重新确认。

---

## 阶段 3 — 实现（TDD + 并行子代理）

**调用 `toolbox-tool-dev` 技能**（此仓库的项目级技能）以获取约定。

**步骤 3.1 — 脚手架和配置**

1. `pnpm create:tool $ARGUMENTS` — 脚手架
2. `pnpm install` — 链接新的工作区包
3. 编辑 `tools/tool-$ARGUMENTS/tool.manifest.ts` — 设置真实的 `categoryKey`、`icon`（选择有意义的 `lucide-react` 图标，而不是默认的 `Wrench`）、`keywords`、`meta.zh`/`meta.en`、`mode`

**步骤 3.2 — 分析任务并行性**

从 PRD 的"实现任务分解"中分析任务：
- 识别可以并行执行的独立任务（例如：UI 组件、工具函数、后端接口）
- 识别必须串行执行的依赖任务（例如：基础类型定义 → 使用该类型的组件）

**步骤 3.3 — 并行派遣子代理实现**

对于可并行的任务组，在**单个消息中派遣多个子代理**并行执行：

每个子代理应该：
1. 遵循 TDD 原则：先写测试，再实现，后重构
2. 实现分配的功能点
3. 编写对应的单元测试
4. 运行 `pnpm test` 确保测试通过
5. 报告完成状态

**示例并行任务分配：**
- 子代理 A：实现工具函数 + 测试（如 formatDuration、getMimeTypes）
- 子代理 B：实现 UI 组件 + 测试（如 IdlePanel、RecordingPanel）
- 子代理 C：实现后端接口 + 测试（如果需要）
- 子代理 D：编写 i18n 文件（zh.json + en.json）

等待所有并行子代理完成后，再处理依赖任务。

**步骤 3.4 — 集成和验证**

1. 实现主组件 `tools/tool-$ARGUMENTS/src/<Pascal>.tsx`，集成所有子组件
2. 确保从 `@toolbox/ui-kit` 中提取共享组件；如果缺少所需的原语，将其添加到 `packages/ui-kit`
3. 验证 i18n 文件完整且两个语言版本同步
4. 不要为 manifest 工具手动编辑 `apps/web/src/config/a-*.ts` — 发现是自动的

---

## 阶段 4 — 质量关卡（构建 + lint + 测试）

运行所有这些，只有在全部通过时才继续：

```bash
pnpm check:consistency
pnpm lint
pnpm -C apps/web build
pnpm test
```

如果任何失败，就地修复。如果失败看起来不简单，提前跳到阶段 5 的审查循环。

---

## 阶段 5 — 代码审查

**重要：使用子代理进行审查以避免上下文爆炸。**

派遣一个子代理在此工具的 diff 上调用 `simplify` 技能。子代理应该：
1. 使用参数 `main...feat/tool-$ARGUMENTS` 运行 simplify 技能
2. 应用所有发现（重用、死代码、冗余抽象）
3. 重新运行阶段 4 质量关卡（consistency、lint、build、test）
4. 使用消息 "refactor(tool-$ARGUMENTS): apply code review fixes" 提交修复
5. 报告修复内容的摘要

---

## 阶段 6 — 归档 + PR

**步骤 6.1 — 归档 OpenSpec 变更**

派遣一个子代理归档 openspec 变更：
1. 运行 `openspec archive add-$ARGUMENTS-tool --yes`
2. 验证变更已移动到 archive 并更新了主规范
3. 运行 `openspec validate --strict` 确认
4. 提交归档更改

**步骤 6.2 — 创建 PR**

派遣一个子代理创建 PR：
1. `git status` — 确认暂存的内容
2. `git add` 特定文件（工具目录、locale 更改、任何后端文件、测试、文档）。避免 `git add -A`。
3. 使用单个常规消息提交：
   ```
   feat(tool-$ARGUMENTS): <PRD 中的一句话摘要>
   ```
4. 推送：`git push -u origin feat/tool-$ARGUMENTS`
5. `gh pr create --title "feat(tool-$ARGUMENTS): <摘要>" --body "<HEREDOC body>"`，正文包含：
   - 摘要（最多 3 个要点）
   - PRD 链接
   - 测试计划检查清单
6. 报告 PR URL

GitHub Actions 在合并时处理部署。

---

## 此工作流的操作原则

- **一次一个阶段。** 在完成当前阶段之前不要提前开始下一个阶段。
- **智能并行化。** 在阶段 3 实现时，自动识别可并行的独立任务，在单个消息中派遣多个子代理并行执行，最大化效率。
- **不要静默跳过。** 如果你跳过一个阶段（例如不需要后端），明确说明。
- **失败 = 停止 + 询问。** 如果一个关卡在一次修复尝试后失败，在重试之前询问用户 — 不要浪费迭代。
- **工具名称在任何地方都保持一致。** `tool-$ARGUMENTS`（目录）、`/$ARGUMENTS`（路径）、`tool<Pascal>`（命名空间）、`<Pascal>`（组件）— 永远不要让这些漂移。

## 优化后的流程总结

**完整流程（7 个阶段 + 1 个关卡）：**
```
0.预检 → 1.需求收集 → 2.PRD+OpenSpec规划[关卡] → 3.实现(TDD+并行子代理) → 
4.质量关卡 → 5.代码审查(simplify) → 6.归档+PR
```

**关键优化点：**
- 合并了 OpenSpec 和 Superpowers 规划阶段
- 移除了关卡 2 和关卡 3，只保留 PRD 审阅关卡
- 移除了截图阶段
- 实现阶段采用智能并行化，自动派遣多个子代理
- 简化了审查流程，只保留 simplify
- 合并了归档和 PR 创建阶段

**预计时间节省：** 相比原流程减少约 40-50% 的执行时间。
