---
description: 端到端开发一个新工具：PRD → openspec → superpowers → 实现 → codex review → 截图人工确认 → 单测 → PR
argument-hint: <工具名称>
---

# /create-tools $ARGUMENTS

你正在编排此 monorepo 中新工具的端到端创建流程。工具名称在 `$ARGUMENTS` 中（kebab-case 格式，例如 `dns-query`）。如果 `$ARGUMENTS` 为空，在执行任何操作之前先询问用户工具名称。

这是一个**长期运行的多阶段工作流，包含三个人工审核关卡**。不要跳过阶段，不要跳过关卡。每个阶段结束后，简要告诉用户刚刚发生了什么以及接下来要做什么。

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

## 阶段 2 — PRD

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
```

写完后，向用户显示文件路径并要求他们阅读。

### 🧑 人工关卡 1 — PRD 审阅

停止并明确询问用户：**"PRD 已生成在 `docs/tools/$ARGUMENTS/PRD.md`，请审阅。通过 / 需要修改 / 重做？"**

在用户明确表示批准之前不要继续。如果他们想要更改，编辑并重新确认。

---

## 阶段 3 — OpenSpec 变更提案

运行 `openspec change add add-$ARGUMENTS-tool`（检查 `openspec --help` 以获取当前子命令语法 — 如果不同则调整）。然后：

1. 基于 PRD 在 `openspec/changes/add-$ARGUMENTS-tool/` 下编写变更规范。涵盖：正在添加的能力、设计说明、验证标准。
2. 运行 `openspec validate add-$ARGUMENTS-tool` 并在继续之前修复任何错误。

### 🧑 人工关卡 2 — 变更提案审阅

向用户显示变更文件夹内容并询问：**"openspec change 已生成并通过 validate，请审阅。通过 / 修改？"**

等待明确批准。

---

## 阶段 4 — Superpowers 规划

调用 `superpowers` 技能（或其 brainstorm/planner 子技能 — 检查 `~/.claude/plugins/cache/.../superpowers/` 以获取当前入口点）。将 PRD 和 openspec 变更作为上下文提供给它。目标：生成下一阶段将执行的 TDD 风格实现计划。

将计划输出作为注释捕获到相关的 TaskCreate 项中，以便它持久化。

---

## 阶段 5 — 实现

**调用 `toolbox-tool-dev` 技能**（此仓库的项目级技能）以获取约定。然后：

1. `pnpm create:tool $ARGUMENTS` — 脚手架
2. `pnpm install` — 链接新的工作区包
3. 编辑 `tools/tool-$ARGUMENTS/tool.manifest.ts` — 设置真实的 `categoryKey`、`icon`（选择有意义的 `lucide-react` 图标，而不是默认的 `Wrench`）、`keywords`、`meta.zh`/`meta.en`、`mode`
4. 实现 `tools/tool-$ARGUMENTS/src/<Pascal>.tsx` — 根据 PRD 的实际 UI。首先从 `@toolbox/ui-kit` 中提取；如果缺少所需的原语，将其添加到 `packages/ui-kit` 而不是直接导入第三方库。
5. 填写 `src/locales/zh.json` 和 `src/locales/en.json` — 每个 UI 字符串都有键；两个文件保持同步。
6. **如果需要后端**：在 `apps/api-gateway/src/` 下添加路由，将领域逻辑推送到 `services/<domain>-service/` 下的新模块或现有模块中。不要将逻辑放在路由处理程序中。
7. 不要为 manifest 工具手动编辑 `apps/web/src/config/a-*.ts` — 发现是自动的。

---

## 阶段 6 — 质量关卡（构建 + lint + 测试）

运行所有这些，只有在全部通过时才继续：

```bash
pnpm check:consistency
pnpm lint
pnpm -C apps/web build
pnpm test
```

如果任何失败，就地修复。如果失败看起来不简单，提前跳到阶段 7 的审查循环。

---

## 阶段 7 — 审查循环（self-clean → codex）

**重要：为每个审查步骤使用子代理以避免上下文爆炸。**

按成本递增顺序运行审查器，以便每个工具看到前一个已经清理过的代码。这最小化了往返次数。

**步骤 7.1 — 自清理通道（免费、快速）：**

派遣一个子代理在此工具的 diff 上调用 `simplify` 技能。子代理应该：
1. 使用参数 `main...feat/tool-$ARGUMENTS` 运行 simplify 技能
2. 应用所有发现（重用、死代码、冗余抽象）
3. 重新运行阶段 6 质量关卡（consistency、lint、build、test）
4. 使用消息 "refactor(tool-$ARGUMENTS): apply simplify review fixes" 提交修复
5. 报告修复内容的摘要

**步骤 7.2 — Codex 审查循环：**

派遣一个子代理运行 codex 审查迭代。子代理应该：
1. 在新代码上运行 `/codex:review`
2. 如果报告了问题：
   - **简单/清晰的修复**：就地修复，重新运行阶段 6，然后重新运行 `/codex:review`
   - **复杂/不清楚**：使用问题上下文调用 `/codex:rescue`
3. 循环直到 `/codex:review` 报告干净。上限为 5 次迭代
4. 如果 5 次迭代后仍不干净，报告剩余问题
5. 使用消息 "fix(tool-$ARGUMENTS): address codex review findings" 提交任何修复

**步骤 7.3 — 对抗性通道（最终）：**

派遣一个子代理运行对抗性审查。子代理应该：
1. 运行一次 `/codex:adversarial-review`
2. 修复它发现的任何问题
3. 重新运行阶段 6 质量关卡
4. 使用消息 "fix(tool-$ARGUMENTS): address adversarial review findings" 提交修复
5. 报告摘要

---

## 阶段 8 — 通过 chrome-dev-mcp 或手动截图

**重要：派遣一个子代理来处理截图捕获。**

派遣一个子代理来捕获截图。子代理应该：
1. 验证开发服务器正在 http://localhost:5173 上运行
2. 使用 chrome-dev-mcp 或 Playwright 导航到 `/$ARGUMENTS`
3. 等待页面完全加载
4. 截图并保存到 `docs/tools/$ARGUMENTS/screenshots/idle.png`
5. 如果工具有多个状态，捕获额外的截图
6. 验证截图已成功创建
7. 报告截图路径

如果 chrome-dev-mcp 不可用，子代理应该：
- 编写一个简单的 Playwright 脚本来捕获截图
- 或指示用户手动捕获截图

### 🧑 人工关卡 3 — 视觉确认

告诉用户截图目录并询问：**"效果图已输出到 `docs/tools/$ARGUMENTS/screenshots/`，请查看。通过 / 需要 UI 调整？"**

如果他们想要更改，跳回阶段 5，然后重新运行 6 → 7 → 8。否则继续。

---

## 阶段 9 — 单元测试

为工具添加的任何非平凡逻辑（解析、格式化、验证）生成 Vitest 单元测试。遵循的模式：

- 作为 `tools/tool-$ARGUMENTS/src/<thing>.test.ts` 共同定位
- 或者，如果逻辑是共享的，在相关的 `packages/*/src/` 测试中
- 使用 `apps/web/src/config/tools.test.ts` 的风格

纯展示工具可能不需要新的单元测试 — 明确说明而不是填充。

运行：

```bash
pnpm test
```

循环直到通过。

---

## 阶段 10 — 归档 openspec 变更

```bash
openspec archive add-$ARGUMENTS-tool
```

这会将变更移动到归档规范中并更新主规范集。

---

## 阶段 11 — 提交 + PR

1. `git status` — 确认暂存的内容
2. `git add` 特定文件（工具目录、locale 更改、任何后端文件、测试、文档、openspec 更改）。避免 `git add -A`。
3. 使用单个常规消息提交：
   ```
   feat(tool-$ARGUMENTS): <PRD 中的一句话摘要>
   ```
4. 推送：`git push -u origin feat/tool-$ARGUMENTS`
5. `gh pr create --title "feat(tool-$ARGUMENTS): <摘要>" --body "<HEREDOC body>"`，正文包含：
   - 摘要（最多 3 个要点）
   - PRD 链接
   - 截图嵌入（相对路径）
   - 测试计划检查清单
6. 向用户报告 PR URL。

GitHub Actions 在合并时处理部署。

---

## 此工作流的操作原则

- **一次一个阶段。** 在完成当前阶段之前不要提前开始下一个阶段。
- **在每个关卡显示差异。** 在要求用户批准时，显示实际的文件路径并让他们检查。
- **不要静默跳过。** 如果你跳过一个阶段（例如不需要后端，不需要单元测试），明确说明。
- **失败 = 停止 + 询问。** 如果一个关卡在一次修复尝试后失败，在重试之前询问用户 — 不要浪费迭代。
- **工具名称在任何地方都保持一致。** `tool-$ARGUMENTS`（目录）、`/$ARGUMENTS`（路径）、`tool<Pascal>`（命名空间）、`<Pascal>`（组件）— 永远不要让这些漂移。
