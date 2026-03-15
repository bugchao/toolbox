# 工具规划与落位一览

本文档是**唯一权威**的「已开发 / 待开发 / 调研中」工具清单。后续规划、调研结果、排期都写在这里，避免重复开发、便于 AI/人 统一查看。

---

## 一、分类目录（固定，后续规划按此填写）

| 分类 ID | 分类名称     | 说明 |
|--------|--------------|------|
| `utils` | 实用工具     | 日常效率：图片/文档/表格/格式转换、生成器等 |
| `dev`   | 研发工具     | 开发调试：编解码、正则、时间戳、哈希、代码格式化等 |
| `query` | 查询工具     | 信息查询：邮编、天气、IP、颜色等 |
| `news`  | 资讯工具     | 资讯聚合、热点等 |
| `ai`    | AI 工具      | 依赖 AI 能力：会议纪要、文案、设计、PPT 等 |

新增规划时，**必须**指定上述其一作为「分类」。

---

## 二、已开发工具（代码落位）

以下工具已上线，**不要再重复立项**。新增需求请在「三、待开发/调研」中登记。

### 实用工具（16）

| 工具名称 | 路由路径 | 代码位置 |
|----------|----------|----------|
| 二维码生成 | `/qrcode/generate` | `tools/tool-qrcode` → QrCodeGenerator |
| 二维码解析 | `/qrcode/read` | `tools/tool-qrcode` → QrCodeReader |
| 二维码美化 | `/qrcode/beautifier` | `tools/tool-qrcode` → QrCodeBeautifier |
| 图片压缩/格式转换 | `/image-compressor` | `apps/web/src/pages/ImageCompressor.tsx` |
| 图片去背景 | `/image-background-remover` | `apps/web/src/pages/ImageBackgroundRemover.tsx` |
| Markdown 转 HTML/公众号 | `/markdown` | `apps/web/src/pages/MarkdownConverter.tsx` |
| BMI 健康计算器 | `/bmi` | `apps/web/src/pages/BMICalculator.tsx` |
| 单位换算器 | `/unit-converter` | `apps/web/src/pages/UnitConverter.tsx` |
| PDF 工具集 | `/pdf-tools` | `tools/tool-pdf` → PdfTools |
| 短链接生成器 | `/short-link` | `apps/web/src/pages/ShortLinkGenerator.tsx` |
| 简历生成器 | `/resume-generator` | `tools/tool-resume` → ResumeGenerator |
| AI 配色生成器 | `/color-generator` | `apps/web/src/pages/ColorGenerator.tsx` |
| 表情包生成器 | `/meme-generator` | `apps/web/src/pages/MemeGenerator.tsx` |
| AI 文案生成器 | `/copywriting-generator` | `apps/web/src/pages/CopywritingGenerator.tsx` |
| 电子木鱼 | `/wooden-fish` | `apps/web/src/pages/ElectronicWoodenFish.tsx` |
| 人生进度条 | `/life-progress` | `apps/web/src/pages/LifeProgressBar.tsx` |

### 研发工具（11）

| 工具名称 | 路由路径 | 代码位置 |
|----------|----------|----------|
| JSON 格式化/校验 | `/json` | `apps/web/src/pages/JsonFormatter.tsx` |
| Base64 编解码 | `/base64` | `apps/web/src/pages/Base64.tsx` |
| 时间戳转换 | `/timestamp` | `apps/web/src/pages/Timestamp.tsx` |
| URL 编解码 | `/url` | `apps/web/src/pages/UrlEncoder.tsx` |
| 正则表达式测试 | `/regex` | `apps/web/src/pages/RegexTester.tsx` |
| Cron 表达式生成器 | `/cron` | `apps/web/src/pages/CronGenerator.tsx` |
| 随机密码生成器 | `/password` | `apps/web/src/pages/PasswordGenerator.tsx` |
| 哈希计算 | `/hash` | `apps/web/src/pages/HashGenerator.tsx` |
| 代码美化 | `/code` | `apps/web/src/pages/CodeFormatter.tsx` |
| UUID 生成器 | `/uuid` | `apps/web/src/pages/UuidGenerator.tsx` |
| 文本对比 | `/text-comparator` | `apps/web/src/pages/TextComparator.tsx` |

### 查询工具（4）

| 工具名称 | 路由路径 | 代码位置 |
|----------|----------|----------|
| 邮政编码查询 | `/zipcode` | `apps/web/src/pages/ZipCode.tsx` |
| 天气查询 | `/weather` | `apps/web/src/pages/Weather.tsx` |
| IP 地址查询 | `/ip-query` | `apps/web/src/pages/IpQuery.tsx` |
| 颜色拾取/调色板 | `/color-picker` | `apps/web/src/pages/ColorPicker.tsx` |

### 资讯工具（1）

| 工具名称 | 路由路径 | 代码位置 |
|----------|----------|----------|
| 每日热点新闻 | `/news` | `apps/web/src/pages/HotNews.tsx` |

---

## 三、待开发 / 调研工具

**新增规划时**：在本节按分类添加一行，填写「工具名称、分类、路由（建议）、状态、优先级、备注」。  
**上线后**：把该行移到「二、已开发」对应分类表，并补上「代码位置」和路由。

### 当前待办（第二阶段）

| 工具名称 | 分类 | 建议路径 | 状态 | 优先级 | 备注 |
|----------|------|----------|------|--------|------|
| CSV/Excel 在线编辑器 | utils | `/sheet-editor` | 待开发 | P1 | 在线编辑表格，格式转换、筛选、图表 |
| JSON/YAML/XML 格式转换器 | dev | `/format-converter` | 待开发 | P1 | 多格式互转，实时校验 |
| AI 会议纪要生成器 | ai | `/meeting-minutes` | 待开发 | P2 | 音视频转文字，结构化纪要 |
| AI UI 设计生成器 | ai | `/ui-generator` | 待开发 | P2 | 文本/草图生成 UI |
| AI PPT 生成器 | ai | `/ppt-generator` | 待开发 | P2 | 主题 → 大纲、内容、排版 |

**状态约定**：`调研中` | `待开发` | `开发中` | （上线后移入「二、已开发」）

### 后续计划（待立项 / 未命名）

以下来自 [ROADMAP.md](../ROADMAP.md)、[ARCHITECTURE.md](../ARCHITECTURE.md) 的方向性规划，**尚未有正式工具名或路由**，先记在此处作为后续计划；确定名称与路径后请挪到上方「当前待办」表格，避免遗漏。

| 方向/暂定描述 | 分类 | 建议路径（待定） | 备注 |
|---------------|------|------------------|------|
| 工具开发脚手架 | dev | 待定 | 一键生成新工具模板，提升开发效率 |
| PWA / 离线可用 | utils | 待定 | 全站或关键工具离线使用 |
| 移动端适配增强 | - | - | 响应式或独立 H5，非单点工具 |
| 工具协作功能 | utils | 待定 | 多人在线协作使用同一工具（待细化） |
| AI 助手集成 | ai | `/ai-assistant` 或待定 | 站内通用 AI 问答/辅助 |
| 企业版能力 | - | 待定 | 权限、审计、私有部署等（待细化） |
| 工具市场 / 第三方提交 | - | 待定 | 发现与安装第三方工具（平台能力） |
| 用户收藏 / 历史 / 个性化配置 | - | - | 用户系统能力，非单点工具 |

**使用方式**：确定要做成具体「工具」且命名、路径定好后，在本节删掉该行，并在上方「当前待办」表格新增一行。

---

## 四、后续规划怎么发 / 怎么更新

1. **新增「待开发」或「调研」工具**  
   在 **「三、待开发/调研工具」** 的**当前待办表格**中加一行，填齐：工具名称、分类（必填）、建议路径、状态、优先级、备注（可写调研结论或需求要点）。  
   **仅有方向、尚未命名的想法**：先记入「三、后续计划（待立项/未命名）」表格，确定名称和路径后再挪到当前待办。

2. **避免重复**  
   开发前先查 **「二、已开发工具」** 和 **「三、待开发/调研工具」**，确认没有同名或同功能工具再立项。

3. **上线后**  
   - 在「二、已开发」对应分类表里增加一行（路由 + 代码位置）。  
   - 在「三、待开发/调研工具」里删除该行。  
   - 同步更新 [TOOLS_LIST.md](../TOOLS_LIST.md) 的已上线表格与统计，以及 [apps/web 的 Layout/Home](../apps/web/src/components/Layout.tsx)、[App 路由](../apps/web/src/App.tsx)。

4. **给 AI 的说明**  
   后续只需说「按 TOOLS_ROADMAP 规划」或「在 TOOLS_ROADMAP 里加一个待开发：xxx」，即表示以本文档为准；新增/调整规划都改 **docs/TOOLS_ROADMAP.md**，已开发清单也以本文档「二」为准，避免重复开发。

---

## 五、文档索引

| 文档 | 用途 |
|------|------|
| 本文档 `docs/TOOLS_ROADMAP.md` | 已开发落位 + 待开发/调研清单 + 分类与更新规范 |
| [docs/ROADMAP_CONVENTION.md](ROADMAP_CONVENTION.md) | 规划约定（怎么提、怎么填、怎么给 AI） |
| [TOOLS_LIST.md](../TOOLS_LIST.md) | 对外/产品向工具清单与统计（与本文档同步） |
