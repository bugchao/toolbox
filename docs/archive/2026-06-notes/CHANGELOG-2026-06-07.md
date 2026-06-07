# 2026-06-07 工具批量上线记录

继 2026-06-01（favicon-generator + box-shadow-gen）之后的一轮密集迭代，覆盖 **8 个 PR / 14 个新工具**，主要为 `dev` 与 `utility` 分类补齐空缺。

实践要点：
- **多轮 subagent 并行协作**：本轮共启动 **8 个 isolation=worktree subagent**，跨 4 个批次（batch-32 / batch-33 / batch-34 + 单工具回炉）
- **AI 翻译工具长链路**：`tool-ai-translator` 单 PR 内连续叠加 11 个增量 commit（基础功能 → 朗读 → 历史 → bug 修复 → 模型扩展 → Ollama 友好错误 → 文件批量 → 术语表 → Markdown 渲染 → 双 provider 对比 → Qwen3/Gemma3 系列），merge 时一次合入
- **主会话兜底**：batch-34 三个 agent 全部撞到账号级 session limit 没 commit，主会话从 worktree 复制目录到 batch 分支并补缺失 locales + 修变量名冲突
- **冲突解法统一**：batch-32/33/34 三轮 merge main 时 `pnpm-lock.yaml` 都有冲突，统一走 `checkout --theirs` + `pnpm install` 重算

---

## 新增工具

### 一、AI 翻译工具（tool-ai-translator） — PR #19

- **路径**：`/ai-translator`
- **分类**：AI（ai）
- **功能总览**：把任意文本通过大模型翻译，支持云端 API（OpenAI / Claude / Gemini / DeepSeek / Moonshot / 通义） + 本地服务（Ollama） + 浏览器内 WebLLM；API Key 与模型选择全部存本地；流式输出
- **关键特性**：
  - **多端接入**：6 家云端 + OpenAI 兼容自定义 + Ollama 本地 HTTP + WebLLM 浏览器内（@mlc-ai/web-llm 双层动态 import 防 bundle 爆）
  - **流式输出**：所有 provider 统一抽 4 种协议适配器（OpenAI / Anthropic / Gemini / Ollama JSONL）
  - **朗读**：Web SpeechSynthesis，按语种自动挑 voice，组件 unmount 时统一 cancel
  - **历史**：localStorage 容量滚动（默认 50，可选 20/50/100/200）+ 手动管理两种策略，抽屉式增删改查 + 一键载入回编辑器
  - **术语表 / 翻译记忆**：用户维护中外对照，命中条目注入到系统提示词；含搜索、导入导出 JSON、"本次生效"高亮；文件模式下每段独立计算命中
  - **文件批量翻译**：`.txt` / `.md` 段落级串行处理，单段失败不阻塞，进度条 + 状态徽章 + ZIP 打包下载
  - **Markdown 渲染输出**：marked + DOMPurify 按需动态 import，输出面板原文 / 渲染一键切
  - **双 Provider 并排对比**：同一输入并行调两端，A 端入历史、B 端只展示
  - **持久化 hook**：`usePersistedSession` 加 `restored` 闸门防止挂载时把存档覆盖（修复 React 18 StrictMode 下选 WebLLM 刷新回到 OpenAI 的 bug）
  - **模型库扩展**：6 家云端共 40+ 内置模型；Ollama 17 个常见 tag 含 Qwen3 系列、Gemma3 系列；WebLLM 11 个含 Qwen3 0.6B/1.7B/4B/8B + Gemma3
  - **模型字段下拉 + 自定义兜底**：select 列预设 + `✎ 自定义…` 入口
  - **Ollama 404 友好化**：解析 `{error: "model 'xxx' not found"}` → 转专门错误码 → 本地化为 "请先 `ollama pull <model>`"
- **测试**：114 单测（providers 8 + languages 4 + storage 8 + speech 10 + translate 13 + history 18 + glossary 18 + chunker 16 + batch 6 + markdown 7 + usePersistedSession 6）
- **依赖**：`@mlc-ai/web-llm ^0.2.79`、`marked ^15`、`dompurify ^3.2`、`jszip ^3.10`

### 二、Slug 生成器（tool-slug-generator） — PR #20

- **路径**：`/slug-generator` ｜ **分类**：dev
- **功能**：把任意文本转 URL 友好别名
  - 中英分段：CJK 段走 pinyin-pro 转**全拼 / 首字母 / 跳过 / 保留**；非 CJK 段保留
  - Unicode 规范化（NFD + 剥变音）：`café` → `cafe`
  - 4 种分隔符（`-` / `_` / `.` / 无）、3 种大小写、英文停用词 20+ 词
  - 自定义替换链（在拼音前先做）、maxLength 智能截断（落在分隔符上时干净截）
  - 批量模式：每行一条，空行保留
- **测试**：26 单测
- **依赖**：`pinyin-pro ^3.26`

### 三、CSS 缓动曲线可视化（tool-cubic-bezier） — PR #21

- **路径**：`/cubic-bezier` ｜ **分类**：dev
- **功能**：SVG 拖控制点（支持 overshoot `[-0.5, 1.5]`），9 个预设（含 easeOutBack / easeInOutCubic 等），底部 3 球动画对比（当前 / linear / ease），CSS `cubic-bezier(x1,y1,x2,y2)` 输出 + 复制
- **测试**：33 单测（bezier 15 + presets 8 + clamp 10）｜ **零新增依赖**

### 四、YAML ↔ JSON 互转（tool-yaml-json） — PR #21

- **路径**：`/yaml-json` ｜ **分类**：dev
- **功能**：双向实时转换 + 方向锁（auto / Y→J / J→Y）+ JSON 缩进 2/4/Tab + YAML block/flow 风格 + 3 组样例（K8s / GH Actions / 混合）
- **测试**：11 单测
- **依赖**：`js-yaml ^4.1`

### 五、EXIF 查看 / 清理（tool-exif-cleaner） — PR #21

- **路径**：`/exif-cleaner` ｜ **分类**：utility
- **功能**：exifr 解析（相机 / 镜头 / GPS / 时间 / 软件）+ PropertyGrid 详情（**GPS 字段 danger tone 突出隐私警告**）+ canvas 重编码剥元数据 + ZIP 批量下载
- **测试**：34 单测
- **依赖**：`exifr ^7.1`、`jszip ^3.10`

### 六、HTML 实体编解码（tool-html-entities） — PR #22

- **路径**：`/html-entities` ｜ **分类**：dev
- **功能**：5 种编码强度（minimal / named-extended / decimal / hex / all-non-ascii-named）+ 宽松解码（命名实体最长前缀贪婪匹配、缺分号也尝试）+ 30 项命名表 + emoji 代理对正确 roundtrip
- **测试**：40 单测（encode 20 + decode 20）｜ **零新增依赖**

### 七、URL Query 可视化编辑器（tool-url-query） — PR #22

- **路径**：`/url-query` ｜ **分类**：dev
- **功能**：URL 拆 protocol/host/path/hash + 查询参数表格化（增删改 / ↑↓ 重排 / 按字母排序）+ 全量 encode/decode 按钮 + 重复键 & 空值键开关 + 编辑实时重组
- **测试**：23 单测 ｜ **零新增依赖**

### 八、颜色格式互转（tool-color-format） — PR #23

- **路径**：`/color-format` ｜ **分类**：dev
- **功能**：8 种格式同步显示（hex / rgb / hsl / hwb / lab / lch / **oklch / oklab**）+ WCAG 对比度（vs 白 / vs 黑 大色块 + 判定徽章）+ sRGB / P3 色域 badge + 命名色反查（30+） + HSL 滑块联动 + localStorage 最近 12 色
- **测试**：17 单测
- **依赖**：`culori ^4.0`

### 九、Lorem Ipsum 生成器（tool-lorem-ipsum） — PR #24

- **路径**：`/lorem-ipsum` ｜ **分类**：dev
- **功能**：**拉丁** + **中文乱数**双语风格 + 段 / 句 / 词三种单位 + Plain / Markdown（每 N 段插假标题）/ HTML（`<p>` 或 `<br>`）三种格式 + mulberry32 种子可重现 + 投骰子按钮
- **测试**：21 单测（generator 13 + format 8）｜ **零新增依赖**

### 十、JSON Schema 校验器（tool-json-schema-validator） — PR #25

- **路径**：`/json-schema-validator` ｜ **分类**：dev
- **功能**：ajv 三草案切换（draft-07 / 2019-09 / 2020-12）+ instancePath + schemaPath 错误指引 + 5 样例（用户对象、商品列表、OpenAPI 节选、anyOf/oneOf、format）
- **测试**：9 单测
- **依赖**：`ajv ^8.17`、`ajv-formats ^3.0`

### 十一、Cookie 解析器（tool-cookie-parser） — PR #25

- **路径**：`/cookie-parser` ｜ **分类**：dev
- **功能**：Cookie / Set-Cookie 双模式 Tab；PropertyGrid 属性表（Domain/Path/Expires/Max-Age/Secure/HttpOnly/SameSite/Priority/Partitioned）；**4 类安全 warning**（SameSite=None 无 Secure / 像 token 没 HttpOnly / Expires 过期 / 未设 Domain）
- **测试**：21 单测（parseCookie 8 + parseSetCookie 13）｜ **零新增依赖**

### 十二、Mermaid 实时编辑器（tool-mermaid） — PR #25

- **路径**：`/mermaid` ｜ **分类**：dev
- **功能**：mermaid 双层 dynamic import 防 bundle 爆；8 类样例（flowchart / sequence / class / state / ER / gantt / pie / mindmap）；SVG / PNG 导出（PNG 走 2x 分辨率）；主题切换（default / dark / forest / neutral）
- **测试**：16 单测（samples 5 + export 11）
- **依赖**：`mermaid ^11.4`

### 十三、TOML ↔ JSON 互转（tool-toml-json） — PR #26

- **路径**：`/toml-json` ｜ **分类**：dev
- **功能**：与 yaml-json 一对，配置文件场景三剑客之一
  - 双向实时转换 + 方向锁 + JSON 缩进 2/4/Tab
  - 错误行号：TOML 取 `@iarna/toml` 报错的 `.line`；JSON 从 `SyntaxError 'position N'` 反推
  - 3 组样例：基础配置 / Cargo.toml 风格 / 嵌套表 + 数组表 + 行内表
  - JSON 根强制为对象（TOML 规则）
- **测试**：12 单测
- **依赖**：`@iarna/toml ^2.2`

---

## 文件变更概览

### 新增工具目录（13 个，AI 翻译已在 06-01 之前进入开发但 PR 期内仍持续叠加）

- `tools/tool-ai-translator/`（路径 `/ai-translator`）
- `tools/tool-slug-generator/`（路径 `/slug-generator`）
- `tools/tool-cubic-bezier/`（路径 `/cubic-bezier`）
- `tools/tool-yaml-json/`（路径 `/yaml-json`）
- `tools/tool-exif-cleaner/`（路径 `/exif-cleaner`）
- `tools/tool-html-entities/`（路径 `/html-entities`）
- `tools/tool-url-query/`（路径 `/url-query`）
- `tools/tool-color-format/`（路径 `/color-format`）
- `tools/tool-lorem-ipsum/`（路径 `/lorem-ipsum`）
- `tools/tool-json-schema-validator/`（路径 `/json-schema-validator`）
- `tools/tool-cookie-parser/`（路径 `/cookie-parser`）
- `tools/tool-mermaid/`（路径 `/mermaid`）
- `tools/tool-toml-json/`（路径 `/toml-json`）

### 修改文件

- `docs/TOOLS_ROADMAP.md`：在「二、已开发 → 实用工具 / 研发工具 / AI 工具」表追加 14 行
- `pnpm-lock.yaml`：注册新工作区 + 13 个新外部依赖

> manifest 工具由 Vite 虚拟模块自动注册到路由 / 首页 / 导航，**未**手动编辑 `apps/web/src/config/a-*.ts`。

## 质量门

每个工具均在合并到 main 前通过：
- `pnpm lint` → 0 warnings
- `pnpm exec vitest run <tool>` → 全绿
- `pnpm build` → 通过

> 注：仓库根 `src/config/tools.test.ts` 仍有 2 个预存量失败（与本批次无关，先于本轮存在）。

**本轮合计新增单测**：~ 380 个

## Git / PR 一览

| PR | 分支 | 说明 |
|---|---|---|
| [#19](https://github.com/bugchao/toolbox/pull/19) | `feat/tool-ai-translator` | AI 翻译工具（11 个增量 commit 累积合入） |
| [#20](https://github.com/bugchao/toolbox/pull/20) | `feat/tool-slug-generator` | Slug 生成器 |
| [#21](https://github.com/bugchao/toolbox/pull/21) | `feat/batch-tools-32` | cubic-bezier + yaml-json + exif-cleaner（3 subagent 并行） |
| [#22](https://github.com/bugchao/toolbox/pull/22) | `feat/batch-tools-33` | html-entities + url-query（2 subagent 并行） |
| [#23](https://github.com/bugchao/toolbox/pull/23) | `feat/tool-color-format` | 颜色格式互转 |
| [#24](https://github.com/bugchao/toolbox/pull/24) | `feat/tool-lorem-ipsum` | Lorem Ipsum 生成器 |
| [#25](https://github.com/bugchao/toolbox/pull/25) | `feat/batch-tools-34` | json-schema-validator + cookie-parser + mermaid（3 subagent + 主会话兜底） |
| [#26](https://github.com/bugchao/toolbox/pull/26) | `feat/tool-toml-json` | TOML ↔ JSON 互转 |

## 工具总数（粗略）

`tools/` 目录从 268 → **281**（+13，AI 翻译在 06-01 已计入）。
