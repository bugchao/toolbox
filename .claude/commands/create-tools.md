---
description: 端到端开发一个新工具：PRD → openspec → superpowers → 实现 → codex review → 截图人工确认 → 单测 → PR
argument-hint: <tool-name>
---

# /create-tools $ARGUMENTS

You are orchestrating the end-to-end creation of a new tool inside this monorepo. The tool name is in `$ARGUMENTS` (kebab-case, e.g. `dns-query`). If `$ARGUMENTS` is empty, ask the user for the tool name before doing anything else.

This is a **long-running, multi-stage workflow with three human gates**. Do not skip stages, do not skip gates. After every stage, briefly tell the user what just happened and what's next before proceeding.

Use `TaskCreate` to track the stages so the user can see progress. Mark each stage `in_progress` when you start it and `completed` when you finish.

---

## Stage 0 — Preflight

Before doing anything, verify the environment:

1. **Tool name validity**: must match `^[a-z0-9]+(-[a-z0-9]+)*$`. If not, abort with a clear error.
2. **Name collision**: check `tools/tool-$ARGUMENTS/` doesn't exist; check no manifest already uses path `/$ARGUMENTS`. If collision, ask the user whether to pick a different name or work on the existing tool.
3. **Required CLIs**: confirm `openspec` is available (`which openspec`). If missing, tell the user to `npm i -g @fission-ai/openspec` and stop.
4. **Required plugins**: check the `superpowers` plugin is installed (`/plugin list` style — look in `~/.claude/plugins/installed_plugins.json`). If missing, tell the user to run `/plugin install superpowers@claude-plugins-official` and stop.
5. **Working tree**: run `git status --porcelain`. If dirty, ask the user whether to proceed (uncommitted work will get bundled into the PR) or stash first.
6. **Branch**: if currently on `main`, create and switch to a feature branch `feat/tool-$ARGUMENTS`. Otherwise stay on the current branch but warn the user.
7. **openspec init**: if `openspec/` directory does not exist at repo root, run `openspec init` (yes, in this repo) before continuing.

After preflight, summarize what you found and confirm with the user before moving on.

---

## Stage 1 — Intent collection (interactive)

Use `AskUserQuestion` to gather the requirements. Ask in **one batch** with these questions (adapt wording, keep them concise):

1. **What does this tool do?** (one-sentence purpose)
2. **Who uses it and when?** (target user + trigger scenario)
3. **Inputs and outputs?** (what the user gives, what they get back)
4. **Backend needed?** (no / yes-light / yes-heavy — affects whether we touch `apps/api-gateway` and a service module)
5. **Reference tool?** (point to an existing `tools/tool-*` whose UX or shape is closest, so we can match the pattern)
6. **Category?** (one of: dns, domain, ip, dhcp, gslb, ipam, network, dev, life, travel, utility, ai, query, learning, blockchain — see `apps/web/src/config/a-*.ts` for examples)

If the user gave any of this in the original message, don't re-ask — confirm what you inferred.

---

## Stage 2 — PRD

Generate `docs/tools/$ARGUMENTS/PRD.md` with this structure (use Chinese — repo language is bilingual but PRDs default to zh):

```markdown
# PRD: <Tool Display Name>

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

After writing, show the user the file path and ask them to read it.

### 🧑 Human Gate 1 — PRD review

Stop and ask the user explicitly: **"PRD 已生成在 `docs/tools/$ARGUMENTS/PRD.md`，请审阅。通过 / 需要修改 / 重做？"**

Do not proceed until the user explicitly says it's approved. If they want changes, edit and re-confirm.

---

## Stage 3 — OpenSpec change proposal

Run `openspec change add add-$ARGUMENTS-tool` (check `openspec --help` for current subcommand syntax — adapt if different). Then:

1. Author the change spec under `openspec/changes/add-$ARGUMENTS-tool/` based on the PRD. Cover: capability being added, design notes, validation criteria.
2. Run `openspec validate add-$ARGUMENTS-tool` and fix any errors before proceeding.

### 🧑 Human Gate 2 — change proposal review

Show the user the change folder contents and ask: **"openspec change 已生成并通过 validate，请审阅。通过 / 修改？"**

Wait for explicit approval.

---

## Stage 4 — Superpowers planning

Invoke the `superpowers` skill (or its brainstorm/planner sub-skill — check `~/.claude/plugins/cache/.../superpowers/` for current entry point). Feed it the PRD and openspec change as context. Goal: produce a TDD-flavored implementation plan that the next stage will execute.

Capture the plan output as comments in the relevant TaskCreate items so it persists.

---

## Stage 5 — Implementation

**Invoke the `toolbox-tool-dev` skill** (this repo's project-level skill) for the conventions. Then:

1. `pnpm create:tool $ARGUMENTS` — scaffold
2. `pnpm install` — link the new workspace package
3. Edit `tools/tool-$ARGUMENTS/tool.manifest.ts` — set real `categoryKey`, `icon` (pick a meaningful `lucide-react` icon, not the default `Wrench`), `keywords`, `meta.zh`/`meta.en`, `mode`
4. Implement `tools/tool-$ARGUMENTS/src/<Pascal>.tsx` — the actual UI per the PRD. Pull from `@toolbox/ui-kit` first; if a needed primitive is missing, add it to `packages/ui-kit` rather than importing third-party libs directly.
5. Fill `src/locales/zh.json` and `src/locales/en.json` — every UI string keyed; both files in lockstep.
6. **If backend needed**: add the route under `apps/api-gateway/src/`, push domain logic into a new or existing module under `services/<domain>-service/`. Do not put logic in route handlers.
7. Do NOT manually edit `apps/web/src/config/a-*.ts` for a manifest tool — discovery is automatic.

---

## Stage 6 — Quality gate (build + lint + test)

Run all of these and only proceed when green:

```bash
pnpm check:consistency
pnpm lint
pnpm -C apps/web build
pnpm test
```

If any fail, fix in place. If a failure looks non-trivial, jump to Stage 7's review loop early.

---

## Stage 7 — Review loop (self-clean → codex)

**IMPORTANT: Use subagents for each review step to avoid context explosion.**

Run reviewers in escalating cost order so each tool sees code the previous one already cleaned. This minimizes round-trips.

**Step 7.1 — Self-clean pass (free, fast):**

Dispatch a subagent to invoke the `simplify` skill on the diff for this tool. The subagent should:
1. Run the simplify skill with argument `main...feat/tool-$ARGUMENTS`
2. Apply all findings (reuse, dead code, redundant abstractions)
3. Re-run Stage 6 quality gate (consistency, lint, build, test)
4. Commit fixes with message "refactor(tool-$ARGUMENTS): apply simplify review fixes"
5. Report summary of what was fixed

**Step 7.2 — Codex review loop:**

Dispatch a subagent to run codex review iterations. The subagent should:
1. Run `/codex:review` on the new code
2. If issues reported:
   - **Trivial / clear fix**: fix in place, re-run Stage 6, then re-run `/codex:review`
   - **Complex / unclear**: invoke `/codex:rescue` with the issue context
3. Loop until `/codex:review` reports clean. Cap at 5 iterations
4. If still not clean after 5 iterations, report remaining issues
5. Commit any fixes with message "fix(tool-$ARGUMENTS): address codex review findings"

**Step 7.3 — Adversarial pass (final):**

Dispatch a subagent to run adversarial review. The subagent should:
1. Run `/codex:adversarial-review` once
2. Fix anything it surfaces
3. Re-run Stage 6 quality gate
4. Commit fixes with message "fix(tool-$ARGUMENTS): address adversarial review findings"
5. Report summary

---

## Stage 8 — Screenshot via chrome-dev-mcp or manual

**IMPORTANT: Dispatch a subagent to handle screenshot capture.**

Dispatch a subagent to capture screenshots. The subagent should:
1. Verify dev server is running on http://localhost:5173
2. Use chrome-dev-mcp or Playwright to navigate to `/$ARGUMENTS`
3. Wait for page to load completely
4. Take screenshot and save to `docs/tools/$ARGUMENTS/screenshots/idle.png`
5. If the tool has multiple states, capture additional screenshots
6. Verify screenshots were created successfully
7. Report screenshot paths

If chrome-dev-mcp is not available, the subagent should:
- Write a simple Playwright script to capture screenshots
- Or instruct the user to manually capture screenshots

### 🧑 Human Gate 3 — visual confirmation

Tell the user the screenshot directory and ask: **"效果图已输出到 `docs/tools/$ARGUMENTS/screenshots/`，请查看。通过 / 需要 UI 调整？"**

If they want changes, jump back to Stage 5, then re-run 6 → 7 → 8. Otherwise proceed.

---

## Stage 9 — Unit tests

Generate Vitest unit tests for any non-trivial logic the tool added (parsing, formatting, validation). Patterns to follow:

- Co-locate as `tools/tool-$ARGUMENTS/src/<thing>.test.ts`
- Or, if the logic is shared, in the relevant `packages/*/src/` test
- Use the style of `apps/web/src/config/tools.test.ts`

Pure-presentation tools may not need new unit tests — say so explicitly rather than padding.

Run:

```bash
pnpm test
```

Loop until green.

---

## Stage 10 — Archive openspec change

```bash
openspec archive add-$ARGUMENTS-tool
```

This moves the change into archived specs and updates the main spec set.

---

## Stage 11 — Commit + PR

1. `git status` — confirm what's staged
2. `git add` the specific files (tool dir, locale changes, any backend files, tests, docs, openspec changes). Avoid `git add -A`.
3. Commit with a single conventional message:
   ```
   feat(tool-$ARGUMENTS): <one-sentence summary from PRD>
   ```
4. Push: `git push -u origin feat/tool-$ARGUMENTS`
5. `gh pr create --title "feat(tool-$ARGUMENTS): <summary>" --body "<HEREDOC body>"` with body containing:
   - Summary (3 bullets max)
   - Link to the PRD
   - Screenshot embeds (relative paths)
   - Test plan checklist
6. Report the PR URL to the user.

GitHub Actions handles deploy on merge.

---

## Operating principles for this workflow

- **One stage at a time.** Don't pre-emptively start the next stage before finishing the current one.
- **Surface diffs at each gate.** When asking the user to approve, show the actual file paths and let them inspect.
- **No silent skips.** If you skip a stage (e.g. backend not needed, no unit tests warranted), say so explicitly.
- **Failures = stop + ask.** If a gate fails after one fix attempt, ask the user before retrying — don't burn iterations.
- **Tool names everywhere consistent.** `tool-$ARGUMENTS` (dir), `/$ARGUMENTS` (path), `tool<Pascal>` (namespace), `<Pascal>` (component) — never let these drift.
