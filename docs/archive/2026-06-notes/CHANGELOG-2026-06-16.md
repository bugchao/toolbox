# 2026-06-16 工具批量上线记录

继 2026-06-07 之后第二轮密集迭代，覆盖 **PR #28 – #35** 共 8 个 PR：6 个新研发工具 + 1 个新 monorepo 包（diagram-workbench，分 5 phase 交付）+ 1 个空壳修复。

实践要点：
- **每个工具收尾跑空壳审计**：`grep 'TODO: 实现工具内容'` —— 起因是上一轮 lorem-ipsum / mermaid 两个工具的主组件被合入 main 时仍是脚手架占位（Write 被「先读后写」拒后漏补 / subagent 撞 session limit 掐断）。本轮 PR #31 补齐了那两个，并把审计固化进收尾流程。
- **diagram-workbench 分 5 phase 单 PR 累积交付**：域模型 → 适配器 → UI shell → iframe/导入导出 → Playwright + 文档。
- **本轮新工具基本零新增依赖**（除 diff 用 jsdiff、regex 用 regexp-tree），逻辑都抽到 `lib/` 纯函数 + 单测先行。

---

## 新增工具

### 一、Regex 铁路图（tool-regex-railroad） — PR #29

- **路径**：`/regex-railroad` ｜ **分类**：dev
- **架构**：`parse → IR → render` 三层，render 不识 regexp-tree 类型
  - `parse`：regexp-tree 包装；`ir`：AST → 5 类 IR 节点（term/seq/choice/optional/star/plus/repeat/group），处理 Disjunction 扁平化、命名组、反向引用、Lookaround
  - `render`：IR → SVG 自家几何模型（节点报 `{w,h,ay}`），Choice 垂直堆叠 + 左右弧线，按 tone 上色
  - `match`：强制 g flag 跑 exec，50000 上限 + 零宽防死循环
- **UI**：pattern + flag toggle + 6 内置示例 + 着色铁路图 + 匹配高亮表格
- **测试**：38（parse 7 + ir 16 + render 9 + match 6）｜依赖 `regexp-tree ^0.1.27`

### 二、Base64 文件互转（tool-base64-file） — PR #30

- **路径**：`/base64-file` ｜ **分类**：dev
- **功能**：文件 → Base64 / Data URI；Base64 → 魔数嗅探（PNG/JPEG/GIF/WEBP/PDF/ZIP/GZIP/MP3/OGG/MP4 + SVG/JSON）→ 图片预览 / 文本预览 → 还原下载
- **宽容解码**：URL-safe 归一、缺 padding 自动补、data URI 前缀剥离、`bytesToBase64` 分块防 call-stack 爆
- **测试**：26 ｜**零新增依赖**

### 三、CSV ↔ Markdown 表格（tool-csv-markdown） — PR #32

- **路径**：`/csv-markdown` ｜ **分类**：dev
- **功能**：手写 RFC 4180 CSV 解析（引号含逗号/换行/`""`，`,`/`;`/Tab 分隔）↔ Markdown 表格（`:---:` 对齐解析、`\|` 转义）
- **亮点**：CJK 感知列宽美化（中文算 2 宽，中英混排竖线对齐）+ 一键转置；双向实时同步 + 方向锁
- **测试**：26（含双向 round-trip）｜**零新增依赖**

### 四、JWT 生成器（tool-jwt-builder） — PR #33

- **路径**：`/jwt-builder` ｜ **分类**：dev ｜与 jwt-decoder 互补
- **功能**：WebCrypto 签发 HS256/384/512；header 可加 kid 但 alg/typ 受保护（防 alg:none 注入）；密钥 UTF-8 / Base64；签名验证走常数时间比较
- **正确性锚点**：HS256 + jwt.io 默认样例签名段逐字节匹配
- **测试**：16 ｜**零新增依赖**

### 五、Diff / Patch 工具（tool-diff-patch） — PR #34

- **路径**：`/diff-patch` ｜ **分类**：dev
- **功能**：两段文本 → unified diff（可调 context + 增删/hunk 统计 + 按行着色）；patch 应用回原文
- **关键**：jsdiff 对无 hunk 输入会静默返回原文，用 `parsePatch` 校验 hunk 数 > 0 显式拒垃圾输入
- **测试**：12（含 round-trip / mismatch）｜依赖 `diff ^7.0.0`

### 六、命名风格转换（tool-case-converter） — PR #35

- **路径**：`/case-converter` ｜ **分类**：dev ｜与 slug-generator 互补
- **功能**：5 步智能分词（连续大写 `HTTPServer`→`http server`、字母数字交界 `version2`、Unicode 非 ASCII）→ 13 种风格（camel/pascal/snake/constant/kebab/cobol/train/title/sentence/lower/upper/dot/path）；批量逐行
- **UI**：输入 + 实时分词 chip + 13 风格网格点击即复制
- **测试**：25 ｜**零新增依赖**

---

## 新增 monorepo 包

### Diagram Workbench（packages/diagram-workbench） — PR #28

> 与 `tools/tool-*` 不同，这是一个**私有 React/Vite 包**，按 `openspec/changes/add-diagram-workbench` 提案分 5 phase 单 PR 累积交付，12 节全部完成。

- 命名空间 `@toolbox/diagram-workbench`（提案原写 `@zddi/*`，对齐 monorepo 改名）
- **域模型**：types / factory / reducer（12 action 不可变）
- **持久化**：IndexedDB（idb）+ workspace JSON schema v1
- **三引擎适配器**：Mermaid（lazy import）/ PlantUML（pako deflate + 自定义 alphabet 编码 + 可注入 fetch）/ draw.io（postMessage 严格 origin allowlist + iframe）
- **UI shell**：侧栏 / 工具栏 / 编辑器 / 预览 / 设置 / 状态栏 + 自动保存 + Cmd/Ctrl+S/O/E
- **导入导出**：workspace JSON + 单文档源文件 + SVG
- **Playwright**：5 个 smoke 用例
- **测试**：97 单测 ｜依赖 antd 5 / mermaid 11 / idb 8 / pako 2

---

## 修复

### 补齐 lorem-ipsum 与 mermaid 空壳组件 — PR #31

- 两个工具（PR #24 / #25 引入）主组件合入 main 时仍是脚手架占位，路由能进但页面只有标题
- 补齐 lorem-ipsum（8 项配置 + 生成）与 mermaid（实时渲染 + 主题 + 8 样例 + SVG/2x PNG 导出 + 全量 locales）
- **经验固化**：今后每个工具收尾前 grep `'TODO: 实现工具内容'` 防空壳

---

## 文件变更概览

### 新增
- `tools/tool-{regex-railroad,base64-file,csv-markdown,jwt-builder,diff-patch,case-converter}/`（6 个研发工具）
- `packages/diagram-workbench/`（私有包）

### 修改
- `tools/tool-{lorem-ipsum,mermaid}/`（补齐组件 + locales）
- `docs/TOOLS_ROADMAP.md`：「二、已开发 → 研发工具」表追加 6 行
- `pnpm-lock.yaml`：新增 regexp-tree / diff / antd / mermaid / idb / pako 等

> manifest 工具由 Vite 虚拟模块自动注册，**未**手动编辑 `apps/web/src/config/a-*.ts`。

## 质量门

每个 PR 合并前均通过：`pnpm lint` 0 warnings、对应工具 vitest 全绿、`pnpm build` 通过。

> 注：仓库根 `src/config/tools.test.ts` 仍有 2 个预存量失败（先于本轮存在，与新工具无关）。

**本轮新增单测**：约 240（regex 38 + base64 26 + csv 26 + jwt 16 + diff 12 + case 25 + diagram-workbench 97）

## Git / PR 一览

| PR | 分支 | 说明 |
|---|---|---|
| [#28](https://github.com/bugchao/toolbox/pull/28) | `feat/diagram-workbench` | Diagram Workbench 包（5 phase / 12 节） |
| [#29](https://github.com/bugchao/toolbox/pull/29) | `feat/tool-regex-railroad` | Regex 铁路图 |
| [#30](https://github.com/bugchao/toolbox/pull/30) | `feat/tool-base64-file` | Base64 文件互转 |
| [#31](https://github.com/bugchao/toolbox/pull/31) | `fix/tool-lorem-ipsum-ui` | 空壳修复（lorem-ipsum + mermaid） |
| [#32](https://github.com/bugchao/toolbox/pull/32) | `feat/tool-csv-markdown` | CSV ↔ Markdown 表格 |
| [#33](https://github.com/bugchao/toolbox/pull/33) | `feat/tool-jwt-builder` | JWT 生成器 |
| [#34](https://github.com/bugchao/toolbox/pull/34) | `feat/tool-diff-patch` | Diff / Patch 工具 |
| [#35](https://github.com/bugchao/toolbox/pull/35) | `feat/tool-case-converter` | 命名风格转换 |

## 工具总数（粗略）

`tools/` 目录 **286 个**（本轮 +6 研发工具；diagram-workbench 作为 package 不计入 tools/）。
