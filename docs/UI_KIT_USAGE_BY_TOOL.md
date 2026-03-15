# 工具与 ui-kit 能力对照表

开发任一工具前，先在本表确认**是否用到**以下能力；若用，**先在 ui-kit 中封装，再在工具内引用**，避免在各工具内重复实现。

---

## 一、ui-kit 能力清单

| 能力 | 封装位置 | 用途 |
|------|----------|------|
| **Motion** | `animations/FadeIn`, `StaggerChildren` | 入场淡入、列表错开动画 |
| **Spring** | `spring/FlipCard`, `spring/Parallax` | 卡片正反翻转、视差滚动 |
| **粒子背景** | `background/ParticlesBackground`, `BackgroundVisibilityProvider` | 每工具可选预设，全局可开关 |
| **Recharts** | `charts/ChartContainer` + 从 ui-kit 复出 Line/Bar/Pie 等 | 折线/柱状/饼图等 |
| **shadcn 风格** | `lib/cn()` | 类名合并，新组件用 cva + cn 保持风格一致 |

---

## 二、使用原则

1. **先封装再用**：需要动画/翻转/视差/粒子/图表时，在 `packages/ui-kit/src` 下先做通用组件或预设，再在工具页引用。
2. **粒子背景**：工具页用 `<ParticlesBackground preset="xxx" />`，应用层用 `BackgroundVisibilityProvider` 包裹，并提供全局“显示/隐藏背景”开关。
3. **图表**：统一用 `ChartContainer` 包一层，内部用 recharts 的 `LineChart`/`BarChart`/`PieChart` 等（从 ui-kit 或 recharts 导入均可）。

---

## 三、工具 × 能力对照（开发前参考）

**图例**：✅ 建议用 | ⭕ 可选 | ❌ 通常不需要

### 已开发工具

| 工具名称 | 路径 | Motion | Spring(翻转/视差) | 粒子背景 | Recharts | 使用位置/备注 |
|----------|------|--------|-------------------|----------|----------|----------------|
| 二维码生成/解析/美化 | /qrcode/* | ✅ 卡片入场 | ⭕ 视差 hero | ⭕ minimal | ❌ | 卡片 StaggerChildren；hero 区 Parallax 可选 |
| 图片压缩/去背景 | /image-* | ✅ 区块入场 | ❌ | ⭕ dots | ❌ | 上传区 FadeIn；进度/结果区可粒子 |
| Markdown 转换 | /markdown | ✅ 编辑/预览切换 | ⭕ FlipCard 编辑/预览 | ⭕ network | ❌ | 双栏或 FlipCard 切换 |
| PDF 工具集 | /pdf-tools | ✅ 工具卡片入场 | ❌ | ⭕ minimal | ❌ | 工具选择卡片 StaggerChildren |
| 短链接生成器 | /short-link | ✅ 列表入场 | ❌ | ⭕ dots | ❌ | 历史列表 StaggerChildren |
| 简历生成器 | /resume-generator | ✅ 标签/区块入场 | ⭕ FlipCard 编辑⇄预览 | ⭕ stars | ❌ | 编辑/预览用 FlipCard 或 Tab |
| AI 配色生成器 | /color-generator | ✅ 色块/列表入场 | ❌ | ✅ bubble | ❌ | 色板区粒子 bubble 预设 |
| 表情包生成器 | /meme-generator | ✅ 图层/模板入场 | ❌ | ⭕ minimal | ❌ | 模板列表 StaggerChildren |
| AI 文案生成器 | /copywriting-generator | ✅ 历史/结果入场 | ❌ | ⭕ dots | ❌ | 历史列表 StaggerChildren |
| 电子木鱼/人生进度条 | /wooden-fish, /life-progress | ✅ 点击/进度动效 | ❌ | ⭕ stars | ❌ | 已有动效，可加粒子 |
| IP 地址查询 | /ip-query | ✅ 结果区入场 | ❌ | ⭕ network | ❌ | 结果卡片 FadeIn |
| 天气/邮编/JSON/Base64 等 | 各 path | ⭕ 区块 FadeIn | ❌ | ⭕ minimal | ❌ | 按需 FadeIn/StaggerChildren |
| AI PPT 生成器 | /ppt-generator | ✅ 大纲/区块入场 | ❌ | ❌ | ❌ | 主题+大纲+主题色，PptxGenJS 导出 |
| 全球 DNS 解析检测 | /dns-global-check | ✅ 结果表入场 | ❌ | ❌ | ❌ | 7 家 DoH 对比表 |
| DNSSEC 检测 / DNS 性能测试 / DNS TTL | /dnssec-check, /dns-performance, /dns-ttl | ⭕ 结果区 FadeIn | ❌ | ❌ | ❌ | 表单+结果卡片 |

### 待开发工具（按类别抽样，其余参考同类）

| 工具名称 | 路径 | Motion | Spring | 粒子 | Recharts | 使用位置/备注 |
|----------|------|--------|--------|------|----------|----------------|
| CSV/Excel 在线编辑器 | /sheet-editor | ✅ 表格/工具栏 | ❌ | ⭕ minimal | ✅ 若做图表预览 | 图表预览用 ChartContainer + Bar/Line |
| JSON/YAML/XML 格式转换器 | /format-converter | ✅ 结果区 | ⭕ FlipCard 输入⇄输出 | ⭕ dots | ❌ | 双栏或 FlipCard |
| AI 会议纪要生成器 | /meeting-minutes | ✅ 列表/结果入场 | ⭕ Parallax 长页 | ⭕ stars | ❌ | 长内容可 Parallax |
| DNS NS/CNAME 链/SOA 等 | /dns-ns, /dns-cname-chain, /dns-soa | ✅ 结果/步骤入场 | ❌ | ⭕ network | ⭕ 延迟/分布图 | 解析路径、延迟分析可用 ChartContainer |
| 域名健康/安全评分 | /domain-health-score, /security-* | ✅ 评分卡片 | ❌ | ⭕ minimal | ✅ 评分雷达/柱状图 | 安全/健康维度用 Recharts |
| IP ASN/地理/黑名单 等 | /ip-* | ✅ 结果卡片 | ❌ | ⭕ network | ❌ | 与现有 IP 查询一致 |
| CIDR/子网/VLSM/网络规划 | /cidr-*, /subnet-*, /vlsm | ✅ 输入/结果区 | ❌ | ⭕ minimal | ⭕ 范围/容量可视化 | 子网容量等可简单柱状图 |
| DHCP 地址池/利用率分析 | /dhcp-* | ✅ 列表/统计区 | ❌ | ⭕ dots | ✅ 利用率/分布图 | 使用率用 BarChart/AreaChart |
| IPAM 规划/库存/可视化 | /ipam-* | ✅ 树/列表入场 | ❌ | ⭕ minimal | ✅ 使用率/拓扑示意 | 拓扑或统计用 ChartContainer |
| GSLB 策略/权重/流量预测 | /gslb-* | ✅ 策略卡片 | ⭕ FlipCard 策略⇄结果 | ⭕ network | ✅ 流量/命中预测图 | 权重、流量用 Recharts |
| Ping/Traceroute/端口检测 | /ping, /traceroute, /tcp-port-check | ✅ 结果行入场 | ❌ | ⭕ minimal | ⭕ 延迟时序图 | 延迟曲线用 LineChart |
| HTTP/SSL/CDN/可用性检测 | /http-*, /ssl-cert, /cdn-check | ✅ 结果区块 | ❌ | ⭕ dots | ⭕ 可用性时序 | 多节点可用性可图表 |
| 安全评分/黑名单/报告生成 | /security-* | ✅ 评分/列表 | ❌ | ⭕ minimal | ✅ 风险维度/报告图表 | 报告内用 ChartContainer |

**其余 network 工具**：按上表同类工具选择即可（DNS 类→network 粒子+可选图表；IP 类→minimal/dots；运维类→minimal+可选图表；安全类→minimal+Recharts）。

---

## 四、封装与引用约定

- **Motion**：`import { FadeIn, StaggerChildren } from '@toolbox/ui-kit'`，用于区块或列表根节点。
- **Spring**：`import { FlipCard, Parallax } from '@toolbox/ui-kit'`，FlipCard 用于正反两面，Parallax 包住需视差的 hero/长区块。
- **粒子**：应用根用 `BackgroundVisibilityProvider`；工具页用 `import { ParticlesBackground } from '@toolbox/ui-kit'`，容器需 `position: relative`，内层放 `ParticlesBackground preset="…" className="absolute inset-0"`。
- **图表**：`import { ChartContainer, LineChart, Line, XAxis, YAxis } from '@toolbox/ui-kit'`，用 `ChartContainer` 包一层再写 Recharts 子组件。
- **cn**：`import { cn } from '@toolbox/ui-kit'`，新组件内用 `cn(theme.xxx, className)` 等合并类名。

以上能力均在 **packages/ui-kit** 中维护，工具内仅引用、不重复实现。
