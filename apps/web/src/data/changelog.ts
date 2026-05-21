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
