export type ChangelogText = {
  zh: string
  en: string
}

export type ChangelogItem = {
  type: 'added' | 'updated'
  summary: ChangelogText
  paths: string[]
  extraLabels?: ChangelogText[]
}

export type ChangelogEntry = {
  date: string
  title: ChangelogText
  items: ChangelogItem[]
}

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    date: '2026-07-04',
    title: {
      zh: '会议纪要新增系统音频转写 + 图片压缩器重构',
      en: 'Meeting Minutes gains system-audio transcription + Image Compressor rewrite',
    },
    items: [
      {
        type: 'updated',
        summary: {
          zh: '会议纪要升级：新增 useSystemAudioTranscriber，通过 getDisplayMedia 抓取系统/标签页声音，浏览器内 transformers.js Whisper 本地转写（音频不出本机）；同时新增 services/meeting-audio-service 后端服务并接入 api-gateway，提供 BlackHole + whisper.cpp 本地引擎的流式转写与纪要总结接口，供更长录音场景使用。',
          en: 'Meeting Minutes upgrade: new useSystemAudioTranscriber captures system/tab audio via getDisplayMedia and transcribes locally in-browser with transformers.js Whisper (audio never leaves the device); also added a services/meeting-audio-service backend wired into api-gateway offering BlackHole + whisper.cpp streaming transcription and summarization for longer recordings.',
        },
        paths: ['/meeting-minutes'],
      },
      {
        type: 'updated',
        summary: {
          zh: '图片压缩器重构：拆分尺寸计算 / 体积估算等纯函数便于单测，压缩与下载流程随之精简；补充 imageCompressor 命名空间中英文案接入 i18n，新增单测覆盖核心计算逻辑。',
          en: 'Image Compressor refactor: extracted pure functions for size calculation / weight estimation for testability, simplifying the compress/download flow; added imageCompressor i18n namespace (zh/en) and unit tests for the core math.',
        },
        paths: ['/image-compressor'],
      },
    ],
  },
  {
    date: '2026-06-29',
    title: {
      zh: 'Mermaid 大升级：CodeMirror 编辑器 + 分栏全屏 + 手绘风格',
      en: 'Mermaid overhaul: CodeMirror editor + split/fullscreen + hand-drawn style',
    },
    items: [
      {
        type: 'updated',
        summary: {
          zh: 'Mermaid 编辑器全面升级：输入区换用 CodeMirror（跟随明暗主题 + Recursive 可变字体）；中间可拖动分割条、左右等高，预览区支持全屏；接入 ELK / tidy-tree 布局与 ZenUML 外部图，新增 svg2roughjs 手绘风格开关；自定义主色可按 primaryColor 派生整套配色；本地历史支持自动提取标题命名并可编辑；预览区点击元素可定位回源码，双击标签可就地改名（flowchart/pie/gantt）；修复甘特图横向溢出与思维导图样例关键字冲突。',
          en: 'Major Mermaid upgrade: editor now runs on CodeMirror (theme-aware + Recursive variable font); draggable split divider with equal-height panes, fullscreen preview; ELK / tidy-tree layouts and ZenUML external diagrams registered, plus an svg2roughjs hand-drawn style toggle; custom primary color derives a full palette; local history auto-names entries from the title and is editable; clicking a preview element jumps to its source, double-clicking a label renames it in place (flowchart/pie/gantt); fixed gantt horizontal overflow and a mindmap sample keyword clash.',
        },
        paths: ['/mermaid'],
      },
      {
        type: 'updated',
        summary: {
          zh: 'Mermaid「完全本地」提示支持关闭并持久化，避免每次进入都重复弹出。',
          en: 'Mermaid\'s "fully local" notice can now be dismissed and stays dismissed, instead of reappearing on every visit.',
        },
        paths: ['/mermaid'],
      },
    ],
  },
  {
    date: '2026-06-27',
    title: {
      zh: '10 个工具集中上线：WiFi 二维码 / User-Agent 解析 / chmod 计算器等',
      en: 'Ten tools shipped together: WiFi QR / User-Agent Parser / chmod Calculator and more',
    },
    items: [
      {
        type: 'added',
        summary: {
          zh: '新增 /wifi-qr WiFi 二维码：填写 SSID/密码/加密方式（WPA/WEP/无密码）本地生成可扫码联网的二维码。新增 /user-agent User-Agent 解析器：解析 UA 字符串识别浏览器、引擎、操作系统、设备类型与爬虫。新增 /htpasswd 生成器：本地生成 Apache/Nginx Basic Auth 凭据，支持 bcrypt / apr1 / SHA。',
          en: 'New /wifi-qr: enter SSID/password/encryption (WPA/WEP/open) to generate a scannable WiFi QR code locally. New /user-agent: parse a UA string into browser, engine, OS, device type and bot info. New /htpasswd: generate Apache/Nginx Basic Auth credentials locally (bcrypt / apr1 / SHA).',
        },
        paths: ['/wifi-qr', '/user-agent', '/htpasswd'],
      },
      {
        type: 'added',
        summary: {
          zh: '新增 7 个研发工具：/css-clamp（流式响应式字号/间距 clamp() 生成器，实时预览不同视口取值）、/gitignore-gen（勾选常用模板一键生成下载 .gitignore）、/meta-tags（SEO/Open Graph/Twitter Card 标签生成 + 实时分享卡片预览）、/chmod-calc（权限矩阵或八进制双向生成 chmod 命令与符号表示）、/svg-to-jsx（SVGO 优化 + 转 React 组件，支持 TypeScript/forwardRef）、/cron-parser（cron 表达式翻译成人话并逐字段拆解、预测未来运行时间）、/dotenv-parser（.env 解析并互转 JSON/YAML/Shell export，含校验提示）。均为 manifest-first 纯前端 + i18n(zh/en) + 单测。',
          en: 'Seven new dev tools: /css-clamp (fluid clamp() generator for responsive font size/spacing with live viewport preview), /gitignore-gen (pick templates, generate and download a .gitignore), /meta-tags (SEO/Open Graph/Twitter Card tags with live social-card preview), /chmod-calc (permission matrix or octal, both ways, to chmod command + symbolic form), /svg-to-jsx (SVGO optimize + convert to a React component with TS/forwardRef), /cron-parser (translate cron expressions to plain language, per-field breakdown, predicted next runs), /dotenv-parser (parse .env and convert to JSON/YAML/Shell export with validation). All manifest-first, client-only, zh/en i18n, and unit-tested.',
        },
        paths: ['/css-clamp', '/gitignore-gen', '/meta-tags', '/chmod-calc', '/svg-to-jsx', '/cron-parser', '/dotenv-parser'],
      },
      {
        type: 'updated',
        summary: {
          zh: '简化 meta-tags / svg-to-jsx / user-agent 冗余代码：去掉单字段包装类型、消除提前返回后的恒真三元、删除被前置分支挡住的死代码。',
          en: 'Simplified meta-tags / svg-to-jsx / user-agent: dropped a single-field wrapper type, removed an always-true ternary after an early return, and deleted dead code shadowed by an earlier branch.',
        },
        paths: ['/meta-tags', '/svg-to-jsx', '/user-agent'],
      },
    ],
  },
  {
    date: '2026-06-26',
    title: {
      zh: '新增 JSON Diff 与 JSON Flatten',
      en: 'New JSON Diff and JSON Flatten',
    },
    items: [
      {
        type: 'added',
        summary: {
          zh: '新增 /json-diff：两份 JSON 结构化对比，忽略键顺序，标出新增/删除/修改与类型变化，纯本地。新增 /json-flatten：嵌套 JSON 扁平化为点路径键并可导出 CSV，对象数组自动转表格。',
          en: 'New /json-diff: structural diff of two JSON docs, ignoring key order, highlighting added/removed/changed values and type changes — fully local. New /json-flatten: flatten nested JSON into dot-path keys with CSV export, turning object arrays into tables.',
        },
        paths: ['/json-diff', '/json-flatten'],
      },
    ],
  },
  {
    date: '2026-06-22',
    title: {
      zh: '新增 Markdown 目录生成 / MIME 速查 / Semver / JSON Lines',
      en: 'New Markdown TOC / MIME Lookup / Semver / JSON Lines',
    },
    items: [
      {
        type: 'added',
        summary: {
          zh: '新增 /markdown-toc：从 Markdown 标题生成嵌套目录，GitHub 风格锚点、可调层级范围、跳过代码块、同名锚点去重。新增 /mime-lookup：扩展名 ↔ Content-Type 双向查询，支持按类别搜索。新增 /semver：语义化版本解析/比较/排序/范围匹配（^ ~ >= ||）/差异级别/自增。新增 /jsonl：NDJSON/JSON Lines ↔ JSON 数组互转，逐行校验报错并带行号。',
          en: 'New /markdown-toc: generate a nested TOC from Markdown headings with GitHub-style anchors, level range, code-block awareness and slug de-dup. New /mime-lookup: bi-directional extension ↔ Content-Type lookup with category search. New /semver: parse, compare, sort, range-match (^ ~ >= ||), diff level and bump semantic versions. New /jsonl: convert NDJSON/JSON Lines ↔ JSON array with per-line validation and line numbers.',
        },
        paths: ['/markdown-toc', '/mime-lookup', '/semver', '/jsonl'],
      },
    ],
  },
  {
    date: '2026-06-21',
    title: {
      zh: '6 个研发小工具集中上线：进制计算 / ID 生成器 / 文本行处理等',
      en: 'Six dev utilities shipped together: Base Calculator / ID Generator / Line Tools and more',
    },
    items: [
      {
        type: 'added',
        summary: {
          zh: '新增 /number-base（任意 2–36 进制互转 + BigInt + 8/16/32/64 位补码视图 + 位运算）、/id-generator（UUID v4/v7、ULID、NanoID 批量生成，WebCrypto 本地随机，ULID/UUIDv7 时间有序）、/line-tools（按行排序/去重/反转/打乱/加去行号/去空行/trim/过滤/统计）、/duration-calc（解析 1d2h30m 等时长串、单位互转、人性化、时钟格式、加减到基准时间）、/json-query（点号/方括号路径查询 JSON，支持通配与切片）、/http-status-ref（HTTP 状态码分类速查，按码或含义搜索）。均纯本地零依赖。',
          en: 'New /number-base (any radix 2–36 with BigInt, 8/16/32/64-bit two\'s-complement views, bitwise ops), /id-generator (bulk UUID v4/v7, ULID, NanoID via WebCrypto, time-ordered ULID/UUIDv7), /line-tools (sort/dedupe/reverse/shuffle/number/trim/filter/stats per line), /duration-calc (parse durations like 1d2h30m, unit conversion, humanize, clock format, add/subtract to a base time), /json-query (dot/bracket JSON path queries with wildcards and slices), /http-status-ref (searchable HTTP status code reference grouped 1xx–5xx). All fully local, zero dependencies.',
        },
        paths: ['/number-base', '/id-generator', '/line-tools', '/duration-calc', '/json-query', '/http-status-ref'],
      },
    ],
  },
  {
    date: '2026-06-17',
    title: {
      zh: '新增 .env ↔ JSON 互转与字符串转义',
      en: 'New .env ↔ JSON converter and String Escape',
    },
    items: [
      {
        type: 'added',
        summary: {
          zh: '新增 /env-json：.env 与扁平 JSON 双向实时互转，支持 export 前缀、单双引号转义、跨行值、行内注释，嵌套对象自动转 JSON 串。新增 /string-escape：在 JSON/JS/C/Shell/SQL/正则等语境下转义与反转义字符串，支持 \\xHH \\uHHHH \\u{} 与八进制。',
          en: 'New /env-json: live bi-directional conversion between .env and flat JSON, handling export prefixes, quote escapes, multi-line values and inline comments. New /string-escape: escape/unescape strings for JSON/JS/C/Shell/SQL/regex contexts, including \\xHH \\uHHHH \\u{} and octal.',
        },
        paths: ['/env-json', '/string-escape'],
      },
    ],
  },
  {
    date: '2026-06-16',
    title: {
      zh: '新增 Cron 表达式解析与 Unicode 字符检查器',
      en: 'New Cron Explainer and Unicode Inspector',
    },
    items: [
      {
        type: 'added',
        summary: {
          zh: '新增 /cron-explain：解析标准 5 字段 cron 表达式为人类可读描述并列出接下来若干次执行时间，支持 */,- 区间步进与月份/星期别名。新增 /unicode-inspector：逐字符剖析文本，展示码点 U+、Unicode 块、UTF-8/UTF-16 字节与 JS/HTML/CSS 转义，按码点正确切分 emoji 与代理对。',
          en: 'New /cron-explain: parse a standard 5-field cron expression into a human-readable description and list upcoming run times, supporting */,- steps and month/weekday aliases. New /unicode-inspector: break text down character by character with code point, Unicode block, UTF-8/UTF-16 bytes, and JS/HTML/CSS escapes — correctly iterates emoji and surrogate pairs by code point.',
        },
        paths: ['/cron-explain', '/unicode-inspector'],
      },
    ],
  },
  {
    date: '2026-06-14',
    title: {
      zh: '新增 Diff/Patch 工具与命名风格转换',
      en: 'New Diff/Patch tool and Case Converter',
    },
    items: [
      {
        type: 'added',
        summary: {
          zh: '新增 /diff-patch：两段文本生成可调上下文行数的 unified diff，或把 patch 应用回原文，按行着色并统计增删。新增 /case-converter：把任意文本拆词后一键转 camelCase/PascalCase/snake_case/CONSTANT_CASE/kebab-case/Title Case 等 13 种风格，支持批量逐行、中英混排与连续大写智能拆分。',
          en: 'New /diff-patch: generate a unified diff from two texts with adjustable context, or apply a patch back onto a source, with color-coded lines and add/del stats. New /case-converter: tokenize any text and convert to 13 styles (camelCase, PascalCase, snake_case, CONSTANT_CASE, kebab-case, Title Case and more), with batch line mode, CJK-aware handling and smart acronym splitting.',
        },
        paths: ['/diff-patch', '/case-converter'],
      },
    ],
  },
  {
    date: '2026-06-11',
    title: {
      zh: '新增 CSV ↔ Markdown 表格与 JWT 生成器',
      en: 'New CSV ↔ Markdown table and JWT Builder',
    },
    items: [
      {
        type: 'added',
        summary: {
          zh: '新增 /csv-markdown：CSV 与 Markdown 表格双向实时互转，处理引号/换行字段、列对齐、中英混排列宽美化与转置，零依赖纯本地。新增 /jwt-builder：用 WebCrypto 在浏览器本地签发 HS256/HS384/HS512 JWT，自定义 payload 与 header，密钥支持 UTF-8/Base64，并附带签名验证。',
          en: 'New /csv-markdown: live bi-directional conversion between CSV and Markdown tables, handling quoted/multiline fields, column alignment, CJK-aware padding and transpose — zero deps, fully local. New /jwt-builder: sign HS256/HS384/HS512 JWTs locally with WebCrypto, custom payload & header, UTF-8/Base64 secrets, plus signature verification.',
        },
        paths: ['/csv-markdown', '/jwt-builder'],
      },
    ],
  },
  {
    date: '2026-06-10',
    title: {
      zh: '新增 Regex 铁路图与 Base64 文件互转',
      en: 'New Regex Railroad Diagram and Base64 ↔ File',
    },
    items: [
      {
        type: 'added',
        summary: {
          zh: '新增 /regex-railroad：把任意 JS 正则解析为 AST 并绘制铁路图（railroad diagram），附带匹配测试与逐 token 解释。新增 /base64-file：拖文件转 Base64/Data URI，粘贴 Base64 自动嗅探文件类型（PNG/JPEG/PDF/ZIP 等魔数）并还原下载，纯本地处理。',
          en: 'New /regex-railroad: parse any JS regex into its AST and draw a railroad diagram, with a live match tester and per-token explanations. New /base64-file: drop a file to get Base64/Data URI, or paste Base64 to sniff the file type (PNG/JPEG/PDF/ZIP magic bytes) and download the restored file — fully local.',
        },
        paths: ['/regex-railroad', '/base64-file'],
      },
    ],
  },
  {
    date: '2026-06-07',
    title: {
      zh: '新增 JSON Schema 校验器 / Cookie 解析 / TOML 互转 / Mermaid 渲染',
      en: 'New JSON Schema Validator / Cookie Parser / TOML converter / Mermaid renderer',
    },
    items: [
      {
        type: 'added',
        summary: {
          zh: '3 个 subagent 协作并行交付：新增 /json-schema-validator（浏览器本地用 Ajv 校验 JSON 是否符合 JSON Schema，支持 draft-07/2019-09/2020-12，错误定位到 JSON Path）、/cookie-parser（粘贴 Cookie 请求头或 Set-Cookie 响应头本地解析为结构化表格，标注 SameSite/Secure/HttpOnly 等安全问题）、/mermaid（粘贴 Mermaid 源码实时渲染流程图/时序图/类图/状态图/ER 图/甘特图/饼图/思维导图，一键导出 SVG/PNG，本地不上传）。',
          en: 'Delivered in parallel by 3 subagents: new /json-schema-validator (validate JSON against a schema locally with Ajv, draft-07/2019-09/2020-12, JSON-Path error locations), /cookie-parser (paste Cookie or Set-Cookie headers, parse into structured tables locally, flag SameSite/Secure/HttpOnly issues), /mermaid (paste Mermaid source and render flowchart/sequence/class/state/ER/gantt/pie/mindmap diagrams live, one-click SVG/PNG export, fully local).',
        },
        paths: ['/json-schema-validator', '/cookie-parser', '/mermaid'],
      },
      {
        type: 'added',
        summary: {
          zh: '新增 /toml-json：TOML 与 JSON 双向实时互转，支持嵌套表、数组、行内表，错误带行号。',
          en: 'New /toml-json: live bi-directional conversion between TOML and JSON, handling nested tables, arrays and inline tables, with line-numbered errors.',
        },
        paths: ['/toml-json'],
      },
    ],
  },
  {
    date: '2026-06-06',
    title: {
      zh: '8 个工具集中上线：Slug 生成器 / 缓动曲线 / EXIF 清理 / 颜色格式互转等',
      en: 'Eight tools shipped together: Slug Generator / Cubic Bezier / EXIF Cleaner / Color Format and more',
    },
    items: [
      {
        type: 'added',
        summary: {
          zh: '新增 /slug-generator（任意文本转 URL 友好别名：中文拼音、英文 kebab-case、Unicode 规范化、停用词剔除、批量模式）、/yaml-json（YAML 与 JSON 双向实时互转，自定义缩进与错误行号高亮）、/cubic-bezier（可视化拖拽编辑 cubic-bezier 控制点，实时预览动画曲线，内置 easing 预设）、/exif-cleaner（本地解析照片 EXIF 元数据并一键剥离，零上传）。',
          en: 'New /slug-generator (turn any text into a URL-friendly slug: pinyin for Chinese, kebab-case for English, Unicode normalization, stopword stripping, batch mode), /yaml-json (live bi-directional YAML ↔ JSON with custom indent and error-line highlighting), /cubic-bezier (drag control points to design a cubic-bezier easing curve with live animation preview and presets), /exif-cleaner (parse photo EXIF metadata locally and strip it with one click, zero uploads).',
        },
        paths: ['/slug-generator', '/yaml-json', '/cubic-bezier', '/exif-cleaner'],
      },
      {
        type: 'added',
        summary: {
          zh: '新增 /url-query（URL 查询参数拆成可编辑列表，实时拼回完整 URL，支持编解码与重复键）、/html-entities（HTML 实体双向编解码，5 种编码强度 + 宽松解码，支持 emoji 与 CJK）、/color-format（hex/rgb/hsl/hwb/lab/lch/oklch/oklab 等颜色格式互转，附 WCAG 对比度与 P3 色域提示）、/lorem-ipsum（经典 Lorem Ipsum 与中文乱数假文生成，Plain/Markdown/HTML 三种输出，可选种子保证可重现）。',
          en: 'New /url-query (split a URL\'s query string into an editable list, rebuild live, with encode/decode and duplicate keys), /html-entities (two-way HTML entity conversion with 5 encoding strengths and lenient decoding, full emoji/CJK support), /color-format (convert between hex/rgb/hsl/hwb/lab/lch/oklch/oklab with WCAG contrast and P3 gamut hints), /lorem-ipsum (classic Lorem Ipsum or Chinese pseudo-text, Plain/Markdown/HTML output, optional deterministic seed).',
        },
        paths: ['/url-query', '/html-entities', '/color-format', '/lorem-ipsum'],
      },
    ],
  },
  {
    date: '2026-06-01',
    title: {
      zh: 'AI 翻译平台上线 + CSS 阴影生成器',
      en: 'AI Translator platform launched + CSS Box Shadow Generator',
    },
    items: [
      {
        type: 'added',
        summary: {
          zh: '新增 /ai-translator AI 翻译：云端 API（OpenAI/Claude/Gemini/DeepSeek/Moonshot/通义）、本地 Ollama、浏览器内 WebLLM 三端可切换，流式输出，API Key 与模型选择本地存储；上线当日快速迭代加入：朗读输入/结果（Web SpeechSynthesis 按语种选 voice）、本地历史（容量滚动/手动两种策略 + 抽屉增删改）、模型库扩展（含 Qwen3/Gemma3）+ 模型字段改为可输入下拉、Ollama 未拉取模型的友好报错、文件批量翻译（.txt/.md 段落级串行 + ZIP 打包下载）、术语表（翻译记忆 v1，prompt 注入 + 抽屉 CRUD + 导入导出）、Markdown 渲染视图、双 Provider 并排对比模式。',
          en: 'New /ai-translator: LLM-powered translation switchable across cloud APIs (OpenAI/Claude/Gemini/DeepSeek/Moonshot/Qwen), local Ollama, and in-browser WebLLM, with streaming output and localStorage-persisted API keys/model choice. Rapid same-day iteration added: read-aloud for input/output (Web SpeechSynthesis, per-language voice), local history (rolling/manual retention + drawer CRUD), expanded model library (incl. Qwen3/Gemma3) with an editable-dropdown model field, friendly errors for un-pulled Ollama models, batch file translation (.txt/.md, paragraph-serial, ZIP download), a glossary (translation-memory v1, prompt injection + drawer CRUD + import/export), a Markdown render view, and a side-by-side dual-provider comparison mode.',
        },
        paths: ['/ai-translator'],
      },
      {
        type: 'added',
        summary: {
          zh: '新增 /box-shadow-gen CSS 阴影生成器：多层 box-shadow 可视化编辑（x/y/blur/spread/颜色/alpha/inset），形状切换（矩形/胶囊/圆形），8 个预设（Material/Neumorphism/Glassmorphism），一键输出 CSS 或 Tailwind 任意值，零新增依赖。',
          en: 'New /box-shadow-gen: visually edit multi-layer box-shadow (x/y/blur/spread/color/alpha/inset), switch shape (rectangle/pill/circle), 8 presets (Material/Neumorphism/Glassmorphism), one-click CSS or Tailwind arbitrary-value output, zero new dependencies.',
        },
        paths: ['/box-shadow-gen'],
      },
    ],
  },
  {
    date: '2026-05-31',
    title: {
      zh: '新增 Favicon 生成器',
      en: 'New Favicon Generator',
    },
    items: [
      {
        type: 'added',
        summary: {
          zh: '新增 /favicon-generator：上传一张图片，本地一键生成多尺寸 favicon.ico（16/32/48 PNG-in-ICO 容器）、独立 PNG（16~512，含 apple-touch-icon）、site.webmanifest 片段与 HTML <link> 代码片段，支持透明背景/自填底色与 maskable 安全区，全部资源打包 ZIP 下载。',
          en: 'New /favicon-generator: upload one image and instantly generate a multi-size favicon.ico (16/32/48 PNG-in-ICO), standalone PNGs (16–512, incl. apple-touch-icon), a site.webmanifest snippet and HTML <link> code — with transparent/custom background and maskable safe-zone options, all bundled into a ZIP download.',
        },
        paths: ['/favicon-generator'],
      },
    ],
  },
  {
    date: '2026-05-28',
    title: {
      zh: '新增 /image-to-pdf 图片转 PDF',
      en: 'New /image-to-pdf',
    },
    items: [
      {
        type: 'added',
        summary: {
          zh: '新增 /image-to-pdf 图片转 PDF：本地把多张 JPG/PNG/WebP 图片合成为一个 PDF，支持拖拽排序、旋转、A4/Letter 等纸张、横竖方向、边距、每页 1/2/4 张拼版，导出不上传；同日修复 React 18 StrictMode 下选完图片后立即消失的问题（对象 URL 生命周期跟随图片项，而非挂在渲染期 useMemo 上）。',
          en: 'New /image-to-pdf: combine multiple JPG/PNG/WebP images into a single PDF locally — drag to reorder, rotate, paper size, orientation, margins, 1/2/4-per-page layout, no upload; same-day fix for a React 18 StrictMode bug where selected images vanished immediately (object URL lifetime now tracks the image item instead of a render-time useMemo).',
        },
        paths: ['/image-to-pdf'],
      },
    ],
  },
  {
    date: '2026-05-26',
    title: {
      zh: '新增儿童数独闯关 + AI 内容检测器',
      en: 'New Kids Sudoku Quest + AI Content Detector',
    },
    items: [
      {
        type: 'added',
        summary: {
          zh: '新增 /sudoku-kids 儿童数独闯关：4×4/6×6/9×9 三档难度、30 关递进、三星评分与学习辅助，面向小朋友设计。新增 /ai-detector AI 检测（启发式）：文本与图片输入本地计算 AI 倾向分与三档分类，无需联网或 API key；次日（05-27）深化启发式算法 — 文本新增 Burstiness（句长变异系数）、停用词滑动窗口方差、句级可疑度打分（展示 top 5 可疑句 + 命中关键词）；图片新增 8×8 二维 DCT 高频能量占比统计，区分真实照片与 AI 平滑出图。',
          en: 'New /sudoku-kids: kid-friendly sudoku with 4×4/6×6/9×9 difficulties, 30 progressive levels, three-star scoring and learning helpers. New /ai-detector (heuristic): local text/image AI-likelihood scoring with a three-tier verdict, no network or API key; deepened the next day (05-27) — text gained burstiness (sentence-length CV), stopword sliding-window variance, and per-sentence suspicion scoring (top-5 flagged sentences with matched keywords); images gained 8×8 2D-DCT high-frequency energy ratio to separate real photos from AI-smoothed output.',
        },
        paths: ['/sudoku-kids', '/ai-detector'],
      },
    ],
  },
  {
    date: '2026-05-25',
    title: {
      zh: '新增 WCAG 对比度检查器 + JSON 转 TypeScript',
      en: 'New WCAG Contrast Checker + JSON to TypeScript',
    },
    items: [
      {
        type: 'added',
        summary: {
          zh: '新增 /contrast-checker：检测前景/背景色的 WCAG 对比度，实时给出 AA/AAA 合规等级与文本预览。新增 /json-to-ts：把 JSON 转换成 TypeScript interface/type 类型定义，自动推断可选字段与数组类型合并。',
          en: 'New /contrast-checker: check WCAG color contrast between text and background with live AA/AAA grading and preview. New /json-to-ts: convert JSON into TypeScript interface/type definitions with smart optional-field and array-merging inference.',
        },
        paths: ['/contrast-checker', '/json-to-ts'],
      },
    ],
  },
  {
    date: '2026-05-24',
    title: {
      zh: '新增 /bird-smash 弹弓物理小游戏 + manifest 校验脚本',
      en: 'New /bird-smash physics game + manifest consistency check script',
    },
    items: [
      {
        type: 'added',
        summary: {
          zh: '新增 /bird-smash 愤怒的小鸟（Bird Smash）：基于 Matter.js 物理引擎 + zustand 状态管理的 2D 弹弓游戏，拖拽小鸟瞄准发射，摧毁木箱 / 石块 / 玻璃打败敌人；归入「社交游戏」分类，自动从 manifest 注册无需改 nav。',
          en: 'New /bird-smash (Angry Birds clone): 2D slingshot game built on Matter.js physics + zustand store; drag birds to aim and launch, destroy wood / stone / glass to defeat enemies; auto-registered into the Social Games category via manifest.',
        },
        paths: ['/bird-smash'],
      },
      {
        type: 'added',
        summary: {
          zh: 'scripts/validate-manifests.ts：manifest-first 体系一致性校验脚本（440 行），覆盖 nav locale 是否齐全 / 路径与 namespace 唯一性 / manifest 必填字段 / loadMessages 引用文件存在性；任一规则不通过即 exit 1，可挂 CI 防回归。',
          en: 'scripts/validate-manifests.ts: manifest-first consistency checker (440 lines) — verifies nav locale coverage, path & namespace uniqueness, required manifest fields, and loadMessages target existence; exits 1 on any violation, ready for CI.',
        },
        paths: [],
        extraLabels: [{ zh: '工程化', en: 'Tooling' }],
      },
    ],
  },
  {
    date: '2026-05-22',
    title: {
      zh: '新增 /xml-formatter XML 格式化',
      en: 'New /xml-formatter',
    },
    items: [
      {
        type: 'added',
        summary: {
          zh: '新增 /xml-formatter XML 格式化：浏览器原生 DOMParser 解析，自写递归序列化器（缩进 2/4/Tab 可选、简单文本元素 inline 输出、可选保留注释、CDATA & PI 透传）；压缩模式可选移除注释；校验模式显示元素节点数；XML 声明（<?xml ... ?>）自动保留；解析失败时定位行列号并显示错误片段。',
          en: 'New /xml-formatter: parse with native DOMParser, custom recursive serializer (2 / 4 / Tab indent, inline simple text elements, optional comment retention, CDATA & PI passthrough); minify can drop comments; validate reports element count; XML declaration preserved; parse errors show line/column with snippet.',
        },
        paths: ['/xml-formatter'],
      },
      {
        type: 'added',
        summary: {
          zh: '新增 /file-hash-check 文件哈希校验：拖拽 / 多文件批量；MD5 用 RFC 1321 纯 JS 实现（Web Crypto 不支持），SHA-1/SHA-256/SHA-512 走 crypto.subtle.digest；预期哈希按长度自动识别算法（32/40/64/128 hex）；命中算法行用 emerald 高亮、不匹配用 red 高亮；批量复制单个 hash + 一键下载全部为 txt；文件不上传。',
          en: 'New /file-hash-check: drag-drop / multi-file batch; MD5 implemented in pure JS per RFC 1321 (Web Crypto does not ship MD5), SHA-1 / SHA-256 / SHA-512 via crypto.subtle.digest; expected hash detected by hex length (32/40/64/128); matching row highlighted emerald, mismatching red; per-hash copy + bulk download as txt; files never uploaded.',
        },
        paths: ['/file-hash-check'],
      },
      {
        type: 'added',
        summary: {
          zh: '新增 /md-table-gen Markdown 表格生成器：可视化网格编辑（每单元格 input、行列上下左右移动、删除、列对齐左/中/右）；从 CSV / TSV / JSON（对象数组）/ Markdown 双向解析导入（含 RFC 4180 引号转义解析）；实时输出 MD / CSV / TSV / JSON 四种格式；复制 + 下载（按格式自动选 mime 与扩展名）。状态本地持久化。',
          en: 'New /md-table-gen: visual grid editor (per-cell input, row/column move + delete, column alignment L/C/R); import from CSV / TSV / JSON (array of objects) / Markdown with RFC 4180-compliant quote parsing; live output in MD / CSV / TSV / JSON; copy + download with mime auto-selection. State persisted locally.',
        },
        paths: ['/md-table-gen'],
      },
      {
        type: 'added',
        summary: {
          zh: '新增 /zip-extractor ZIP 在线解压：JSZip 在浏览器本地解析压缩包，文件树折叠展开浏览，按扩展名自动选择预览方式（文本用 <pre> 等宽 / 图片用 <img>），不可预览的二进制文件提示下载；每个文件支持单独下载；并行解压获取真实大小；不支持 RAR。',
          en: 'New /zip-extractor: parse ZIP archives locally via JSZip; browse with a collapsible tree; auto-preview by extension (text via monospace `<pre>`, images via `<img>`); binary files prompt direct download; per-file download supported; parallel size resolution; RAR not supported.',
        },
        paths: ['/zip-extractor'],
      },
      {
        type: 'added',
        summary: {
          zh: '新增 /duplicate-finder 重复文件检测：拖入多个文件后先按 size 预分组（不同大小必然不同），仅对同 size 组并发 6 路 SHA-256 哈希；按 hash 聚类后展示重复组（按可释放空间降序），每组用单选标"保留"自动反推"删除"；右上角 4 项 stat 卡（总数 / 重复组 / 可释放 / 哈希中）；CSV 报告导出 file_name / size / sha256 / group / action。',
          en: 'New /duplicate-finder: pre-group by size (different sizes are never duplicates), then concurrently SHA-256 only files within same-size buckets (6 workers); group by hash and sort duplicates by reclaimable size descending; per-group radio chooses which to keep (others auto "delete"); 4 stat cards (total / dup groups / reclaimable / hashing); CSV report with file_name / size / sha256 / group / action.',
        },
        paths: ['/duplicate-finder'],
      },
      {
        type: 'added',
        summary: {
          zh: '新增 /file-splitter 大文件分割合并：分割 tab 按字节数（KB/MB/GB）或份数切分，预览分片列表（最多 30 条 + "还有 N 份未显示"提示），可打包成 ZIP 一键下载或逐个下载（每个延迟 80ms 避免浏览器阻塞）；合并 tab 多选 part，按文件名数字感知排序（localeCompare numeric），可手动上下移动调序，输出名自动从首个 part 猜测（去掉 .NNN 或 .partNN 后缀）；Blob 拼接生成最终文件。全程本地。',
          en: 'New /file-splitter: Split tab cuts by byte size (KB/MB/GB) or part count, previews up to 30 parts with "{n} more not shown" hint, downloads as one ZIP or individually (80ms staggered); Merge tab natural-sorts multi-selected parts (numeric localeCompare), allows manual reorder, auto-guesses output name by stripping .NNN/.partNN suffix; Blob concatenation builds the final file. All local.',
        },
        paths: ['/file-splitter'],
      },
    ],
  },
  {
    date: '2026-05-21',
    title: {
      zh: '新增 /item-locator 物品放置记录',
      en: 'New /item-locator',
    },
    items: [
      {
        type: 'added',
        summary: {
          zh: '新增 /item-locator 物品放置记录：用于记录衣物 / 手表 / 文档 / 电子产品等日常物品到底放在哪里。预设 13 个类型（衣物/鞋包/首饰手表/电子/文档/化妆/工具/药品/食品/书籍/玩具/装饰/其他）× 12 个场景（卧室/客厅/厨房/书房/储物间/阳台/卫生间/办公室/车里/仓储/朋友处/其他场所），双维筛选 + 标签 + 备注；全文搜索覆盖名称/位置/标签/备注；增删改 + JSON 导入导出（覆盖前二次确认）；全部数据本地存储。',
          en: 'New /item-locator: track where you put clothes / watches / documents / electronics. Built-in 13 categories × 12 scenarios two-axis filtering with tags + notes; full-text search across name / location / tags / note; CRUD + JSON import / export (with overwrite confirm); all data stays local.',
        },
        paths: ['/item-locator'],
      },
      {
        type: 'added',
        summary: {
          zh: '新增 /fake-data-gen 测试数据生成器：32 种字段类型（ID/个人/地址/公司/网络/金融/数值/文本/时间/自定义 10 大类）+ 用户/订单/产品/员工 4 套预设模板；JSON / CSV / SQL Insert / TypeScript 四种输出；最高 10000 行；数值字段支持 min/max/精度，枚举/固定值字段支持自定义配置；全部使用 crypto.getRandomValues 均匀随机；字段可上下移动、删除。',
          en: 'New /fake-data-gen: 32 field types (ID / Person / Address / Company / Web / Finance / Numeric / Text / Time / Custom — 10 groups) + 4 presets (User / Order / Product / Employee); 4 output formats (JSON / CSV / SQL Insert / TypeScript); up to 10,000 rows; numeric fields support min/max/precision, enum/static support custom config; all randomness uses crypto.getRandomValues; fields support reorder and delete.',
        },
        paths: ['/fake-data-gen'],
      },
    ],
  },
  {
    date: '2026-05-20',
    title: {
      zh: '节日倒计时上线 + 修复 17 个 DNS 工具描述显示 key 字面量',
      en: 'Holiday Countdown launched + fixed 17 DNS tool descriptions showing literal i18n keys',
    },
    items: [
      {
        type: 'added',
        summary: {
          zh: '新增 /holiday-countdown 节日倒计时：内置 24 个节日（公历 16 个 + 农历 8 个，覆盖元旦 / 春节 / 元宵 / 龙抬头 / 清明 / 劳动 / 端午 / 七夕 / 中秋 / 重阳 / 国庆 / 圣诞 等），农历用 2026-2030 五年公历对照表预存；自定义日期支持「年度重复」（生日/纪念日）或「一次性」（过期消失）；按剩余时间升序排列，每分钟自动刷新；卡片色调按紧急度变红（≤1 天）/ 黄（≤7 天）/ 蓝（更远）；可隐藏内置节日并随时恢复。',
          en: 'New /holiday-countdown: 24 built-in holidays (16 Gregorian + 8 lunar, covering Chinese New Year, Lantern, Qingming, Dragon Boat, Qixi, Mid-Autumn, Double Ninth, National Day, Christmas, etc.); lunar dates precomputed as a 2026-2030 LUT; custom dates support "yearly recurring" (birthdays/anniversaries) or "one-off" (auto-removed when past); cards sorted by days remaining, updated every minute; accent color shifts red (≤1 day) / amber (≤7 days) / indigo (further); built-in holidays can be hidden and restored.',
        },
        paths: ['/holiday-countdown'],
      },
      {
        type: 'updated',
        summary: {
          zh: '首页修复：17 个 DNS 工具描述不再露出 `toolDesc.dns_xxx` 字面量。getToolDescription 在最后一档加安全网（key 缺失返回空串而非 key 自身），同时为 home.toolDesc 补齐 dns_global_check / dns_performance / dns_ttl / dns_soa / dns_diagnose / dns_pollution_check / dns_hijack_check / dns_cache_check / dns_loop_check / dns_ns / dns_cname_chain / dns_nxdomain / dns_latency / dns_authoritative / dns_recursive / dns_path_viz / dns_tunnel 共 17 条中英描述。',
          en: 'Home page fix: 17 DNS tools no longer leak `toolDesc.dns_xxx` literal keys. Added a safety net in getToolDescription (returns empty when the key is missing instead of the key itself), and filled in zh/en descriptions for the 17 missing entries under home.toolDesc.',
        },
        paths: [],
        extraLabels: [
          { zh: '首页 DNS 描述修复', en: 'Home DNS desc fix' },
        ],
      },
      {
        type: 'updated',
        summary: {
          zh: 'AES 加解密修复：GCM 模式 additionalData 字段在「存在但值为 undefined」时 Chrome 抛 "AeadParams: additionalData: Not a BufferSource"。改为条件展开，只在 AAD 实际有内容时挂上字段。',
          en: 'AES Cipher fix: in Chrome, GCM\'s additionalData field throws "AeadParams: additionalData: Not a BufferSource" when present-but-undefined. Now conditionally added only when AAD actually has content.',
        },
        paths: ['/aes-cipher'],
      },
      {
        type: 'added',
        summary: {
          zh: '新增 /trash-classifier 垃圾分类助手：内置 ~110 条常见品目（可回收 30 / 湿垃圾 28 / 干垃圾 29 / 有害 20）+ 同义词别名；模糊匹配按相关度评分（完全匹配 100 / 别名匹配 95 / 包含 80 / 含别名 70 / 反向包含 60）；随机抽题 + 4 大类浏览全表 + 自定义补录 + 搜索历史；结果卡显示分类徽章 + emoji + 提示语。',
          en: 'New /trash-classifier: ~110 built-in items across 4 categories (recyclable 30 / wet 28 / dry 29 / hazardous 20) with synonym aliases; fuzzy match with relevance scoring; random draw + browse-by-category + custom entries + search history; result card shows category badge + emoji + disposal hint.',
        },
        paths: ['/trash-classifier'],
      },
      {
        type: 'updated',
        summary: {
          zh: '节日倒计时升级：自定义日期支持「公历 / 农历」切换；农历用 2026-2030 五年公历对照表（含 2028 闰五月），按年自动循环；点击节日名称弹出排期 modal，展示未来若干年的日期 + 星期 + 距今天数，最近一次高亮，支持 X / 遮罩 / Esc 三路关闭。',
          en: 'Holiday Countdown upgrade: custom dates can now switch between Gregorian and Lunar; lunar uses a 2026-2030 LUT (incl. 2028 leap month 5) and auto-cycles yearly; clicking a holiday name opens a schedule modal showing upcoming years\' dates + weekday + days-from-now, the nearest one highlighted, closable via X / backdrop / Esc.',
        },
        paths: ['/holiday-countdown'],
      },
    ],
  },
  {
    date: '2026-05-19',
    title: {
      zh: '三工具并行交付：矩阵计算器 / 体重记录 / Meta 标签生成器',
      en: 'Three tools shipped in parallel: Matrix Calculator / Weight Tracker / Meta Tag Generator',
    },
    items: [
      {
        type: 'added',
        summary: {
          zh: '新增 /matrix-calc 矩阵计算器：2x2 ~ 10x10 矩阵 A/B 自由编辑；单目运算（转置、行列式、逆矩阵、秩、迹）+ 双目运算（加减乘）+ 标量乘；行列式用 LU 分解 + 部分主元法，逆矩阵用 Gauss-Jordan 增广消元，秩用行阶梯形主元计数；维度不合法自动禁用对应按钮并提示原因；结果区按矩阵/标量/错误三态渲染，浮点近零阈值 1e-10。',
          en: 'New /matrix-calc: edit two matrices A/B (2x2–10x10); unary ops (transpose, determinant, inverse, rank, trace) + binary ops (add/sub/mul) + scalar multiply; determinant via LU with partial pivoting, inverse via Gauss-Jordan on the augmented matrix, rank by counting pivots in row-echelon form; ops disable themselves with reason tooltips when dims do not match; near-zero threshold 1e-10.',
        },
        paths: ['/matrix-calc'],
      },
      {
        type: 'added',
        summary: {
          zh: '新增 /weight-tracker 体重记录：日期 + 体重 + 备注每日记录（同日覆盖确认）；4 项概览（当前/7 日均值/累计变化/距目标）；SVG 折线图按真实日期间距绘点（不是 index 等距）；动态 BMI 四级分类（偏瘦/正常/超重/肥胖）含颜色徽章；目标进度条同时支持减重与增重；kg/lb 单位切换只换显示不动存储；身高、目标、单位、历史全部本地持久化。',
          en: 'New /weight-tracker: log date + weight + note daily (same-day overwrite confirm); 4 summary cards (current / 7-day avg / total change / to-goal); SVG trend chart plots by real date spacing (not index); live BMI four-tier classification (underweight / normal / overweight / obese) with colored badge; goal progress bar handles both weight-loss and weight-gain; kg/lb switches display only, storage stays in kg; height, target, unit and history all persisted locally.',
        },
        paths: ['/weight-tracker'],
      },
      {
        type: 'added',
        summary: {
          zh: '新增 /meta-tag-gen Meta 标签生成器：基础 SEO + Open Graph + Twitter Card 三组标签一表填写；实时预览 Google 搜索片段 / Twitter 卡片 / Facebook 卡片三种社交分享样式；title/description 字符计数（≤60/≤160 超出转红）；所有动态字段经 HTML escape，预览不会被注入；OG/Twitter 留空自动 fallback 到基础字段；HTML 输出 monospace textarea + 复制 + 下载。',
          en: 'New /meta-tag-gen: fill in SEO + Open Graph + Twitter Card tags in one form; live preview as Google search snippet / Twitter card / Facebook card; title/description character counters (≤60/≤160 turn red over limit); every dynamic value passes through HTML escape so the preview cannot be injected; OG / Twitter fields fall back to base fields when blank; HTML output in a monospace textarea with copy and download.',
        },
        paths: ['/meta-tag-gen'],
      },
    ],
  },
  {
    date: '2026-05-18',
    title: {
      zh: '社交游戏 ×3 + 个税计算器',
      en: 'Social Games ×3 + China IIT Calculator',
    },
    items: [
      {
        type: 'added',
        summary: {
          zh: '新增 /tax-calc 个税计算器：基于 2019 年起综合所得 7 级超额累进税率，月度累计预扣预缴模型生成 12 个月预扣表；支持五险一金按比例或按金额输入；6 类专项附加扣除（子女教育/婴幼儿照护/继续教育/住房贷款/住房租金按城市等级/赡养老人独生 vs 分摊）实时聚合；年终奖单独 vs 合并计税自动对比并标出更优方案。',
          en: 'New /tax-calc: China IIT calculator with the post-2019 7-tier progressive comprehensive-income brackets; 12-month cumulative-withholding table; social insurance configurable by rate or amount; six itemized deductions (child education, baby care, continuing ed, housing loan, housing rent by city tier, elderly support — only-child vs shared) auto-aggregated; year-end bonus single vs merged comparison highlights the better option.',
        },
        paths: ['/tax-calc'],
      },
      {
        type: 'added',
        summary: {
          zh: '新增 /data-masking 数据脱敏：9 类内置规则（手机/身份证/邮箱/银行卡/IPv4/IPv6/MAC/车牌/JWT）一键开关，命中数实时显示在徽章上；支持自定义正则 + 替换模板（含 $1/$2 捕获组），无效正则即时报错；贪心算法去重叠匹配；左右双栏对照 + 复制/下载/"以脱敏结果替换原文"。全程本地处理。',
          en: 'New /data-masking: 9 built-in rules (mobile / ID / email / bank-card / IPv4 / IPv6 / MAC / plate / JWT) toggleable with live hit-count badges; custom regex + replacement template ($1/$2 supported, invalid patterns flagged inline); greedy de-overlap algorithm; side-by-side input/output with copy, download and "use masked output as input". All client-side.',
        },
        paths: ['/data-masking'],
      },
      {
        type: 'added',
        summary: {
          zh: '新增 /business-card 名片生成器：3 套模板（极简边线 / 侧栏色块 / 渐变现代）+ 调色板 + 8 个预设色；可选 vCard 二维码（扫码一键存通讯录）或站点 URL；标准 90×54 mm，html2canvas 4× 高清导出 PNG / jspdf 导出名片实际尺寸 PDF；状态本地持久化，下次进来字段都还在。',
          en: 'New /business-card: 3 templates (minimal edge / side stripe / gradient modern) with a color picker and 8 presets; optional QR encodes a vCard (scan-to-save contact) or website URL; standard 90×54 mm card, html2canvas at 4× for print-quality PNG, jspdf exports an actual-size PDF; state persists locally so fields are kept across visits.',
        },
        paths: ['/business-card'],
      },
      {
        type: 'added',
        summary: {
          zh: '新增 /aes-cipher AES 加解密：Web Crypto API 原生实现 AES-GCM / CBC / CTR 三种模式 × 128/192/256 位密钥；密钥源支持原始字节或 PBKDF2-SHA256 口令派生（默认 200,000 迭代）；随机或手动 IV，GCM 支持 AAD 附加认证数据；Base64/Hex/UTF-8 编码自由切换且字段间自动重新编码；密钥/口令/IV/明文密文均不持久化，刷新即清空。',
          en: 'New /aes-cipher: native Web Crypto AES-GCM / CBC / CTR × 128/192/256-bit keys; key source can be raw bytes or PBKDF2-SHA256 from a passphrase (default 200,000 iterations); IV is random or manual, GCM supports AAD; Base64 / Hex / UTF-8 encodings switch freely with auto re-encoding between fields; key, passphrase, IV, plaintext and ciphertext are never persisted and wiped on refresh.',
        },
        paths: ['/aes-cipher'],
      },
      {
        type: 'added',
        summary: {
          zh: '新增 /hmac-sign HMAC 签名：Web Crypto 原生 HMAC-SHA1/256/384/512；密钥与消息支持 UTF-8/Base64/Hex 编码，输出可选 Hex/Base64/Base64URL；双模式签名 + 验证，验证阶段使用常量时间比对避免 timing 侧信道；适合 API / Webhook 调试。',
          en: 'New /hmac-sign: native Web Crypto HMAC-SHA1/256/384/512; key & message accept UTF-8/Base64/Hex encodings, output as Hex/Base64/Base64URL; dual sign + verify modes with constant-time comparison to avoid timing side-channels — ideal for API / webhook debugging.',
        },
        paths: ['/hmac-sign'],
      },
      {
        type: 'added',
        summary: {
          zh: '新增 /undercover-game 谁是卧底：单设备多人桌游，35 对内置词对 + 自定义词对、卧底数量与白板可选；pass-and-flip 翻牌私密看身份与词；分阶段 setup → 翻牌 → 描述 → 投票 → 亮身份 → 结束；自动判胜负，平民与卧底词同步揭晓；游戏中途状态持久化（刷新可恢复）。',
          en: 'New /undercover-game (Spyfall-style): single-device party game, 35 built-in word pairs + custom pairs, configurable undercover count and optional Whiteboard role; pass-and-flip cards reveal each player\'s role and word privately; staged flow setup → reveal → discuss → vote → reveal-elim → ended with automatic winner detection; in-progress state persists across refresh.',
        },
        paths: ['/undercover-game'],
      },
      {
        type: 'added',
        summary: {
          zh: '新增 /guess-number 猜数字：双模式（电脑出题 / 朋友设题），可调范围、二分提示、命中即时统计次数与用时；自动记录每个范围下的历史最佳；达到理论极限（⌈log₂(range)⌉）时给"最优解"褒奖。',
          en: 'New /guess-number: two modes (computer picks / friend sets), adjustable range, binary-style hint, per-range best-score history; awards an "optimal" badge when you match the theoretical bound ⌈log₂(range)⌉.',
        },
        paths: ['/guess-number'],
      },
      {
        type: 'added',
        summary: {
          zh: '新增 /werewolf 狼人杀：单设备发牌器，9 种经典角色（村民/狼人/狼王/预言家/女巫/猎人/守卫/白痴/丘比特），各带技能说明；自由配比 + 平衡校验（狼人不得多于好人、至少 4 人）；shuffle 后 pass-and-flip 私密分发身份卡，适合线下当面玩主持。',
          en: 'New /werewolf: single-device role dealer for in-person play. Nine classic roles (Villager / Werewolf / Wolf King / Seer / Witch / Hunter / Guard / Idiot / Cupid) with full skill descriptions; free composition with balance validation; shuffled pass-and-flip reveal so each player sees only their card.',
        },
        paths: ['/werewolf'],
      },
    ],
  },
  {
    date: '2026-05-17',
    title: {
      zh: '骰子上线 + JSON 升级 + 新增「社交游戏」分类',
      en: 'Dice launched + JSON revamp + new "Social Games" category',
    },
    items: [
      {
        type: 'added',
        summary: {
          zh: '新增 /dice-roller 骰子工具：真 3D cube（CSS perspective + preserve-3d），1-6 经典点骰子（1 与 4 红点），默认 5 颗、可选 1~12 颗；crypto 安全随机；支持隐藏/显示（大话骰盖盅效果）；历史与统计带时间戳且刷新不丢，主按钮 sticky 贴底单手操作。',
          en: 'New /dice-roller: real 3D CSS cube (perspective + preserve-3d), classic 1–6 pip dice with red 1/4 pips, default 5 dice (1–12 selectable); crypto-secure RNG; hide/reveal toggle (Liar\'s Dice "cup" effect); persisted history with timestamps; sticky bottom roll button for one-handed use.',
        },
        paths: ['/dice-roller'],
      },
      {
        type: 'added',
        summary: {
          zh: '新增「社交游戏」分类，归类桌游/聚会/抽签/随机互动类工具；骰子归入该分类，左侧导航插入「生活工具」与「旅行工具」之间。',
          en: 'New "Social Games" category for tabletop / party / random-interaction tools; Dice moved into it, slotted between Life and Travel in the sidebar.',
        },
        paths: ['/dice-roller'],
      },
      {
        type: 'added',
        summary: {
          zh: '新增 /truth-dare 真心话大冒险：48 条内置题（真心话 / 大冒险 × 温和/普通/刺激/限制级 4 档）双语对齐；玩家列表与轮转、自定义题目库、已抽题去重，全部本地存储；中英文按界面语言自动切换。',
          en: 'New /truth-dare: 48 built-in prompts (Truth / Dare × 4 difficulty tiers, mild → wild) in both languages; player rotation, custom prompt library, used-prompt de-duplication — all client-side; prompts auto-switch with UI language.',
        },
        paths: ['/truth-dare'],
      },
      {
        type: 'updated',
        summary: {
          zh: 'JSON 格式化全面升级：输入区接入 Monaco 编辑器（实时高亮 + 内置 JSON 校验），输出区可在「格式化文本」与「jsoncrack 结构图」间切换；结构图支持四向布局、缩放、适配视图与节点上限保护。绕开 Monaco AMD loader 与 UMD 依赖（human-format 等）的 define 冲突。',
          en: 'JSON Formatter revamp: input editor powered by Monaco (live highlighting + built-in JSON validation); output toggles between formatted text and a jsoncrack structured graph (4-way layout, zoom, fit-to-view, node-limit guard). Bypasses Monaco\'s AMD loader to avoid `define` collisions with UMD deps like human-format.',
        },
        paths: ['/json'],
      },
      {
        type: 'updated',
        summary: {
          zh: '外壳布局放开宽度上限：原 `<main>` 写死 max-w-6xl（1152px）改为 w-full，宽屏下双栏/可视化类工具不再被钳制；保留 px-4/sm:px-6/lg:px-8 内边距，已自带 max-w-* 的工具不受影响。',
          en: 'App shell width cap lifted: `<main>` no longer enforces max-w-6xl (1152px), so wide-screen split-pane / visualization tools breathe; horizontal padding preserved, tools with their own max-w-* remain unchanged.',
        },
        paths: [],
        extraLabels: [
          { zh: '全局布局', en: 'Layout' },
        ],
      },
    ],
  },
  {
    date: '2026-05-11',
    title: {
      zh: 'PDF 总结新增 + 12 个工具接入导航',
      en: 'PDF Summary launched + 12 tools wired into navigation',
    },
    items: [
      {
        type: 'added',
        summary: {
          zh: '新增 PDF 总结工具：纯前端解析 PDF 全文，生成关键摘要与高频术语列表，文件不上传到服务器。',
          en: 'New PDF Summary: client-side PDF text extraction with key-point summary and top keywords, no upload.',
        },
        paths: ['/pdf-summary'],
      },
      {
        type: 'added',
        summary: {
          zh: '研发工具 3 个上线：SQL 格式化、正则测试器（增强版）、API 响应模拟器（与 Mock 数据生成器并存覆盖不同场景）。',
          en: 'Three dev tools available: SQL Formatter, Regex Tester Pro, and API Response Mock (coexists with Mock API Generator for distinct use cases).',
        },
        paths: ['/sql-formatter', '/regex-tester-pro', '/api-mock'],
      },
      {
        type: 'added',
        summary: {
          zh: '生活与学习工具 4 个上线：习惯打卡、句子改写、快速笔记、极简番茄计时器（与 /pomodoro 和 /pomodoro-pro 三者并存覆盖不同场景）。',
          en: 'Four life & learning tools available: Habit Tracker, Sentence Rewriter, Quick Notes, and minimal Pomodoro Timer (coexists with /pomodoro and /pomodoro-pro).',
        },
        paths: ['/habit-tracker', '/sentence-rewriter', '/quick-notes', '/pomodoro-timer'],
      },
      {
        type: 'added',
        summary: {
          zh: '实用工具 4 个进入导航：配色方案生成器、随机名字生成器、抽签工具、渐变色生成器（修补此前路径已注册但导航不可见的问题）。',
          en: 'Four utility tools now reachable from navigation: Color Scheme Generator, Name Generator, Lottery, and Gradient Generator (fixes earlier issue where routes existed but were hidden from nav).',
        },
        paths: ['/color-scheme-generator', '/name-generator', '/lottery', '/gradient-gen'],
      },
    ],
  },
  {
    date: '2026-05-01',
    title: {
      zh: '13 个新工具集中上线',
      en: 'Thirteen new tools released',
    },
    items: [
      {
        type: 'added',
        summary: {
          zh: '新增渐变色生成、CSV 转 JSON、RSA 密钥生成、房贷计算和抽签工具，补齐设计、数据转换、安全与生活计算场景。',
          en: 'Added Gradient Generator, CSV to JSON, RSA Key Generator, Mortgage Calculator, and Lottery Tool for design, data conversion, security, and daily calculation workflows.',
        },
        paths: [
          '/gradient-gen',
          '/csv-to-json',
          '/rsa-keygen',
          '/mortgage-calc',
          '/lottery',
        ],
      },
      {
        type: 'added',
        summary: {
          zh: '新增 OCR 文字识别、视频压缩、文档合并和音频剪辑工具，覆盖图片文字提取、媒体压缩与文档处理流程。',
          en: 'Added OCR Text Recognition, Video Compressor, Document Merger, and Audio Cutter for image text extraction, media compression, and document processing workflows.',
        },
        paths: [
          '/ocr-text',
          '/video-compressor',
          '/doc-merger',
          '/audio-cutter',
        ],
      },
      {
        type: 'added',
        summary: {
          zh: '新增 Logo 生成器、Mock API 生成器、代码差异对比和 API 文档生成器，完善创作、测试数据、代码审阅与接口文档能力。',
          en: 'Added Logo Generator, Mock API Generator, Code Diff, and API Doc Generator to improve creation, test data, code review, and API documentation workflows.',
        },
        paths: [
          '/logo-generator',
          '/mock-api',
          '/code-diff',
          '/api-doc-gen',
        ],
      },
    ],
  },
  {
    date: '2026-04-13',
    title: {
      zh: 'DNS 与证书工具补齐',
      en: 'DNS and certificate utilities added',
    },
    items: [
      {
        type: 'added',
        summary: {
          zh: '补齐域名注册信息、CSR 查看、证书内容查看、证书格式转换和中文域名转换 5 个独立工具。',
          en: 'Added five standalone tools for WHOIS lookup, CSR inspection, certificate viewing, certificate format conversion, and IDN conversion.',
        },
        paths: [
          '/whois-lookup',
          '/cert-csr-viewer',
          '/cert-content-viewer',
          '/ssl-format-converter',
          '/idn-converter',
        ],
      },
    ],
  },
  {
    date: '2026-04-10',
    title: {
      zh: 'SBTI 人格测试上线',
      en: 'SBTI personality assessment released',
    },
    items: [
      {
        type: 'added',
        summary: {
          zh: '新增 SBTI 人格测试工具，扩展为 50 题正式提交流，提交后自动保存到本地历史记录。',
          en: 'Added the SBTI personality assessment with a 50-question submit flow and automatic local history saving.',
        },
        paths: ['/sbti-personality'],
      },
    ],
  },
  {
    date: '2026-04-04',
    title: {
      zh: '更新日志页面上线',
      en: 'Changelog page launched',
    },
    items: [
      {
        type: 'added',
        summary: {
          zh: '新增独立更新日志菜单，按日期记录每次变更，并在条目中展示对应菜单名称。',
          en: 'Added a dedicated changelog menu that records each update by date and lists the affected menu names.',
        },
        paths: ['/changelog'],
      },
      {
        type: 'updated',
        summary: {
          zh: '翻译工作台升级为 AI 翻译平台，加入多输入、逐句编辑、多版本输出、术语库、历史记录和文档翻译结构。',
          en: 'Upgraded the translation workbench into an AI translation platform with multi-input support, sentence editing, multi-version output, glossary, history, and document workflows.',
        },
        paths: ['/translation-hub'],
      },
    ],
  },
  {
    date: '2026-04-03',
    title: {
      zh: '20 个新工具分组上线',
      en: 'Four groups of 20 new tools released',
    },
    items: [
      {
        type: 'added',
        summary: {
          zh: '第一组聚焦效率、复盘和本地预览能力。',
          en: 'Group 1 focused on productivity, review, and local preview workflows.',
        },
        paths: [
          '/procrastination-test',
          '/daily-review',
          '/image-local-preview',
          '/travel-cost-compare',
          '/weather-outfit',
        ],
      },
      {
        type: 'added',
        summary: {
          zh: '第二组聚焦旅行场景的热度、客流、风险与路线辅助。',
          en: 'Group 2 focused on travel heat, crowds, risk checks, and routing support.',
        },
        paths: [
          '/attraction-heatmap',
          '/crowd-forecast',
          '/travel-risk',
          '/photo-spots',
          '/route-map',
        ],
      },
      {
        type: 'added',
        summary: {
          zh: '第三组聚焦知识整理、学习路径和内容抽取。',
          en: 'Group 3 covered extraction, note organization, and guided learning flows.',
        },
        paths: [
          '/web-extractor',
          '/note-organizer',
          '/glossary-gen',
          '/knowledge-graph',
          '/learning-path',
        ],
      },
      {
        type: 'added',
        summary: {
          zh: '第四组聚焦编程练习、面试准备和深度问答。',
          en: 'Group 4 focused on coding practice, interview prep, and deep-dive Q&A.',
        },
        paths: [
          '/coding-challenge',
          '/frontend-interview',
          '/system-design',
          '/conversation-practice',
          '/deep-dive-qa',
        ],
      },
    ],
  },
  {
    date: '2026-04-02',
    title: {
      zh: '开发工具补齐与接线修复',
      en: 'Dev tool wiring and missing pages completed',
    },
    items: [
      {
        type: 'updated',
        summary: {
          zh: 'Rapid Tables 增加按键输入模式，兼容输入框直接录入。',
          en: 'Rapid Tables now supports keypad-style input alongside direct text entry.',
        },
        paths: ['/rapid-tables'],
      },
      {
        type: 'added',
        summary: {
          zh: '补齐之前只有入口、没有完整页面接线的开发工具。',
          en: 'Completed the dev tools that previously had menu entries but no finished pages.',
        },
        paths: [
          '/graphql-playground',
          '/postman-lite',
          '/github-repo',
          '/github-user',
          '/text-cipher',
          '/text-stats',
        ],
      },
      {
        type: 'updated',
        summary: {
          zh: '修复重复配置导致的导航键冲突问题。',
          en: 'Fixed duplicate navigation entries that caused React key conflicts.',
        },
        paths: ['/ip-query', '/ip-asn'],
      },
    ],
  },
  {
    date: '2026-04-01',
    title: {
      zh: '天气与专注工具体验整理',
      en: 'Weather and focus experience refinements',
    },
    items: [
      {
        type: 'updated',
        summary: {
          zh: '天气工具迁移为独立模块，并优化定位、布局与时间范围体验。',
          en: 'The weather tool was migrated into an independent module with improved location, layout, and date-range behavior.',
        },
        paths: ['/weather'],
      },
      {
        type: 'updated',
        summary: {
          zh: '修复专注模式刷新后状态丢失的问题，恢复持久化会话。',
          en: 'Fixed focus-mode session persistence so refreshes restore the saved state correctly.',
        },
        paths: ['/focus-mode'],
      },
    ],
  },
]

export function getLocalizedChangeText(text: ChangelogText, language: string) {
  return language.startsWith('en') ? text.en : text.zh
}
