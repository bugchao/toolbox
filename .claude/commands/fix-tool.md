---
description: 修复现有工具的问题：更新文档 → 修改代码 → 测试 → PR
argument-hint: <工具名称> <问题描述>
---

# /fix-tool $ARGUMENTS

你正在修复现有工具的问题。参数格式：`<工具名称> <问题描述>`，例如 `/fix-tool screen-recorder 录制时音频不同步`。

这是一个**文档优先的修复工作流**。先更新相关文档（OpenSpec），再修改代码，确保文档和代码保持同步。

使用 `TaskCreate` 跟踪修复进度。在开始每个阶段时将其标记为 `in_progress`，完成时标记为 `completed`。

---

## 阶段 0 — 预检和问题分析

1. **解析参数**：
   - 工具名称：从 `$ARGUMENTS` 中提取（kebab-case）
   - 问题描述：剩余部分
   - 如果参数不完整，询问用户补充

2. **验证工具存在**：
   - 检查 `tools/tool-<name>/` 目录存在
   - 检查 `openspec/specs/<name>/` 或归档中的规范存在
   - 如果不存在，报错并停止

3. **分析问题类型**：
   - **Bug 修复**：功能不符合预期
   - **功能增强**：添加新功能或改进现有功能
   - **性能优化**：提升性能或减少资源消耗
   - **重构**：改进代码结构但不改变行为

4. **检查 git 状态**：
   - 运行 `git status --porcelain`
   - 如果有未提交的更改，询问用户是继续还是先 stash
   - 如果当前在 `main` 上，创建修复分支 `fix/tool-<name>-<简短描述>`
   - 否则保持在当前分支但警告用户

5. **定位相关文件**：
   - 工具代码：`tools/tool-<name>/`
   - OpenSpec 规范：`openspec/specs/<name>/` 或 `openspec/changes/archive/*/specs/<name>/`
   - 相关测试：`tools/tool-<name>/src/*.test.ts`

预检后，总结问题类型和影响范围，与用户确认。

---

## 阶段 1 — 更新 OpenSpec 文档

**重要：先更新文档，再改代码。**

1. **创建 OpenSpec 变更**：
   ```bash
   openspec change add fix-<name>-<issue-id>
   ```

2. **编写变更提案**（`openspec/changes/fix-<name>-<issue-id>/`）：
   - `proposal.md`：
     - 问题描述（现象、影响、复现步骤）
     - 根因分析
     - 解决方案
     - 影响范围
   - `specs/<capability>/spec.md`：
     - 如果是 Bug：更新现有需求的场景，标记为 MODIFIED
     - 如果是功能增强：添加新需求，标记为 ADDED
     - 如果是性能优化：更新性能相关需求
   - `tasks.md`：
     - 修复任务清单
     - 测试任务清单
     - 验证任务清单

3. **验证变更**：
   ```bash
   openspec validate fix-<name>-<issue-id>
   ```

完成后，向用户显示 OpenSpec 变更路径。

### 🧑 人工关卡 — 修复方案审阅

停止并明确询问用户：**"修复方案已生成在 `openspec/changes/fix-<name>-<issue-id>/`，请审阅。通过 / 需要修改？"**

在用户明确表示批准之前不要继续。如果他们想要更改，编辑并重新确认。

---

## 阶段 2 — 代码修复

**调用 `toolbox-tool-dev` 技能**以获取项目约定。

**步骤 2.1 — 分析修复范围**

从 OpenSpec 的 `tasks.md` 中分析任务：
- 识别需要修改的文件
- 识别需要添加的测试
- 识别可能的副作用

**步骤 2.2 — 执行修复**

根据问题类型选择策略：

**对于 Bug 修复：**
1. 先写失败的测试（复现 Bug）
2. 修改代码使测试通过
3. 运行所有测试确保没有回归

**对于功能增强：**
1. 遵循 TDD：先写测试
2. 实现新功能
3. 更新 i18n 文件（如果涉及 UI 文本）
4. 更新 tool.manifest.ts（如果涉及元数据）

**对于性能优化：**
1. 添加性能基准测试
2. 实施优化
3. 验证性能提升
4. 确保功能正确性

**对于重构：**
1. 确保现有测试覆盖充分
2. 执行重构
3. 运行测试确保行为不变

**步骤 2.3 — 更新相关文档**

- 如果修改了 API 或接口，更新注释
- 如果修改了 UI，更新 i18n 文件
- 如果修改了配置，更新 manifest

---

## 阶段 3 — 质量关卡

运行所有这些，只有在全部通过时才继续：

```bash
pnpm check:consistency
pnpm lint
pnpm -C apps/web build
pnpm test
```

如果任何失败，就地修复。

---

## 阶段 4 — 代码审查

**使用子代理进行审查以避免上下文爆炸。**

派遣一个子代理在此修复的 diff 上调用 `simplify` 技能。子代理应该：
1. 使用参数 `main...fix/tool-<name>-<issue>` 运行 simplify 技能
2. 应用所有发现（重用、死代码、冗余抽象）
3. 重新运行阶段 3 质量关卡
4. 使用消息 "refactor(tool-<name>): apply code review fixes" 提交修复
5. 报告修复内容的摘要

---

## 阶段 5 — 归档 + PR

**步骤 5.1 — 归档 OpenSpec 变更**

派遣一个子代理归档 openspec 变更：
1. 运行 `openspec archive fix-<name>-<issue-id> --yes`
2. 验证变更已移动到 archive 并更新了主规范
3. 运行 `openspec validate --strict` 确认
4. 提交归档更改

**步骤 5.2 — 创建 PR**

派遣一个子代理创建 PR：
1. `git status` — 确认暂存的内容
2. `git add` 特定文件（工具目录、测试、文档）。避免 `git add -A`。
3. 使用常规消息提交：
   ```bash
   # Bug 修复
   fix(tool-<name>): <问题描述>
   
   # 功能增强
   feat(tool-<name>): <功能描述>
   
   # 性能优化
   perf(tool-<name>): <优化描述>
   
   # 重构
   refactor(tool-<name>): <重构描述>
   ```
4. 推送：`git push -u origin fix/tool-<name>-<issue>`
5. `gh pr create --title "<type>(tool-<name>): <摘要>" --body "<HEREDOC body>"`，正文包含：
   - 问题描述
   - 根因分析
   - 解决方案
   - OpenSpec 变更链接
   - 测试计划
   - 影响范围
6. 报告 PR URL

GitHub Actions 在合并时处理部署。

---

## 此工作流的操作原则

- **文档优先。** 先更新 OpenSpec，再改代码，确保文档和代码同步。
- **测试驱动。** Bug 修复先写失败测试，功能增强遵循 TDD。
- **最小化修改。** 只修改必要的部分，避免不相关的重构。
- **验证充分。** 运行完整的测试套件，确保没有回归。
- **清晰沟通。** PR 中清楚说明问题、根因、方案、影响。

## 工作流总结

**完整流程（6 个阶段 + 1 个关卡）：**
```
0.预检和问题分析 → 1.更新OpenSpec[关卡] → 2.代码修复 → 
3.质量关卡 → 4.代码审查 → 5.归档+PR
```

**关键特性：**
- 文档优先：先更新 OpenSpec，确保文档和代码同步
- 测试驱动：Bug 修复先写失败测试，功能增强遵循 TDD
- 最小化修改：只改必要的部分
- 自动化验证：质量关卡 + 代码审查
- 清晰追溯：OpenSpec 记录问题、根因、方案

**适用场景：**
- Bug 修复：功能不符合预期
- 功能增强：添加新功能或改进现有功能
- 性能优化：提升性能或减少资源消耗
- 重构：改进代码结构但不改变行为
