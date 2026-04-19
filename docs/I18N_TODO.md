# 国际化 TODO

更新时间：`2026-04-18`

这份清单用于持续跟踪“还没有完成国际化”的前端模块。  
目标不是一次性全部清完，而是给后续改造一个统一入口，避免每次都重新盘点。

## 口径说明

本次清单按下面 3 条规则静态扫描后整理：

1. `未国际化`：
   - 页面组件没有使用 `useTranslation`
   - 且源码里存在硬编码中文文案
2. `部分国际化`：
   - 已经接了 `useTranslation`
   - 但页面内部仍保留明显的硬编码中文
3. `工具级待补齐`：
   - 工具包缺少独立 locale 资源
   - 或有 locale 资源，但页面组件没有真正消费 `useTranslation`

说明：

- 这是一份“前端 UI 国际化”清单，不包含纯服务端模块。
- 部分工具包是聚合包或占位包，不应该按普通 UI 工具算进改造范围。
- 扫描结果仍需人工复核，但已经足够作为后续分批处理的 TODO 基线。

## 本次扫描摘要

- 确认完全没有工具级国际化的工具包：`5`
- 缺少独立 locale 资源的工具包：`10`
- 完全没有页面国际化的老页面：`16`
- 已接 i18n 但仍有大量硬编码中文的老页面：`23`
- 有 locale 资源但页面层疑似未真正消费 i18n 的工具包：`76`

## 不纳入本轮 TODO 的模块

这些模块不适合按“普通页面工具国际化”处理，先从本清单排除：

- 共享 / 服务端辅助包：
  - `tools/tool-cert-suite-shared`
- 通过 `src/locales.ts` 做聚合的 suite 包：
  - `tools/tool-domain-suite`
  - `tools/tool-ip-ops-suite`
  - `tools/tool-subnet-suite`
- 当前仅作为聚合占位的包：
  - `tools/tool-learn-suite`
  - `tools/tool-life-suite`
  - `tools/tool-travel-suite`
- 当前仍在进行中的 WIP：
  - `tools/tool-blockchain-transfer`

## P0：完全没有页面国际化的老页面

这批优先级最高，因为页面里仍是整块硬编码 UI。

- ~~[apps/web/src/pages/BMICalculator.tsx](/Users/dyck/workspaces/ai/toolbox-codex/apps/web/src/pages/BMICalculator.tsx)~~ ✅ 已完成
- ~~[apps/web/src/pages/ElectronicWoodenFish.tsx](/Users/dyck/workspaces/ai/toolbox-codex/apps/web/src/pages/ElectronicWoodenFish.tsx)~~ ✅ 已完成
- ~~[apps/web/src/pages/HotNews.tsx](/Users/dyck/workspaces/ai/toolbox-codex/apps/web/src/pages/HotNews.tsx)~~ ✅ 已完成
- ~~[apps/web/src/pages/ImageBackgroundRemover.tsx](/Users/dyck/workspaces/ai/toolbox-codex/apps/web/src/pages/ImageBackgroundRemover.tsx)~~ ✅ 已完成
- ~~[apps/web/src/pages/ImageCompressor.tsx](/Users/dyck/workspaces/ai/toolbox-codex/apps/web/src/pages/ImageCompressor.tsx)~~ 🟡 已添加 i18n hook
- ~~[apps/web/src/pages/ImageCropper.tsx](/Users/dyck/workspaces/ai/toolbox-codex/apps/web/src/pages/ImageCropper.tsx)~~ 🟡 已添加 locale 配置
- ~~[apps/web/src/pages/ImageFilter.tsx](/Users/dyck/workspaces/ai/toolbox-codex/apps/web/src/pages/ImageFilter.tsx)~~ 🟡 已添加 i18n hook
- ~~[apps/web/src/pages/ImageRotator.tsx](/Users/dyck/workspaces/ai/toolbox-codex/apps/web/src/pages/ImageRotator.tsx)~~ ✅ 已完成
- ~~[apps/web/src/pages/ImageStitcher.tsx](/Users/dyck/workspaces/ai/toolbox-codex/apps/web/src/pages/ImageStitcher.tsx)~~ 🟡 已添加 i18n hook
- ~~[apps/web/src/pages/ImageWatermark.tsx](/Users/dyck/workspaces/ai/toolbox-codex/apps/web/src/pages/ImageWatermark.tsx)~~ 🟡 已添加 i18n hook
- ~~[apps/web/src/pages/ImageWatermarkRemover.tsx](/Users/dyck/workspaces/ai/toolbox-codex/apps/web/src/pages/ImageWatermarkRemover.tsx)~~ 🟡 已添加 i18n hook
- ~~[apps/web/src/pages/LifeProgressBar.tsx](/Users/dyck/workspaces/ai/toolbox-codex/apps/web/src/pages/LifeProgressBar.tsx)~~ 🟡 已添加 i18n hook
- ~~[apps/web/src/pages/MarkdownConverter.tsx](/Users/dyck/workspaces/ai/toolbox-codex/apps/web/src/pages/MarkdownConverter.tsx)~~ 🟡 已添加 i18n hook
- ~~[apps/web/src/pages/ShortLinkRedirect.tsx](/Users/dyck/workspaces/ai/toolbox-codex/apps/web/src/pages/ShortLinkRedirect.tsx)~~ 🟡 已添加 i18n hook
- ~~[apps/web/src/pages/UnitConverter.tsx](/Users/dyck/workspaces/ai/toolbox-codex/apps/web/src/pages/UnitConverter.tsx)~~ 🟡 已添加 i18n hook
- ~~[apps/web/src/pages/ZipCode.tsx](/Users/dyck/workspaces/ai/toolbox-codex/apps/web/src/pages/ZipCode.tsx)~~ 🟡 已添加 i18n hook

## P0：确认没有工具级国际化的工具包

这批工具包同时缺少 locale 资源，并且页面组件没有使用 `useTranslation`。

- ~~[tools/tool-ai-token-cost](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-ai-token-cost)~~ ✅ 已完成
- ~~[tools/tool-analog-clock](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-analog-clock)~~ ✅ 已完成
- ~~[tools/tool-proxy-speed-test](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-proxy-speed-test)~~ ✅ 已完成
- [tools/tool-qrcode](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-qrcode)
- [tools/tool-rapid-tables](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-rapid-tables)

## P1：缺少独立 locale 资源的工具包

这批不一定是“完全没做国际化”，但还没有按当前工具标准做成独立 locale 资源。

- [tools/TimezoneConverter](/Users/dyck/workspaces/ai/toolbox-codex/tools/TimezoneConverter)
- [tools/tool-ai-token-cost](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-ai-token-cost)
- [tools/tool-analog-clock](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-analog-clock)
- [tools/tool-base64](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-base64)
- [tools/tool-pdf](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-pdf)
- [tools/tool-proxy-speed-test](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-proxy-speed-test)
- [tools/tool-qrcode](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-qrcode)
- [tools/tool-rapid-tables](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-rapid-tables)
- [tools/tool-resume](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-resume)
- [tools/tool-timestamp](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-timestamp)

## P1：老页面已接 i18n，但仍有大量硬编码中文

这批通常已经引入 `useTranslation`，但页面内部文案还没清干净。

- [apps/web/src/pages/Base64.tsx](/Users/dyck/workspaces/ai/toolbox-codex/apps/web/src/pages/Base64.tsx)
- [apps/web/src/pages/CodeFormatter.tsx](/Users/dyck/workspaces/ai/toolbox-codex/apps/web/src/pages/CodeFormatter.tsx)
- [apps/web/src/pages/ColorGenerator.tsx](/Users/dyck/workspaces/ai/toolbox-codex/apps/web/src/pages/ColorGenerator.tsx)
- [apps/web/src/pages/ColorPicker.tsx](/Users/dyck/workspaces/ai/toolbox-codex/apps/web/src/pages/ColorPicker.tsx)
- [apps/web/src/pages/CopywritingGenerator.tsx](/Users/dyck/workspaces/ai/toolbox-codex/apps/web/src/pages/CopywritingGenerator.tsx)
- [apps/web/src/pages/CronGenerator.tsx](/Users/dyck/workspaces/ai/toolbox-codex/apps/web/src/pages/CronGenerator.tsx)
- [apps/web/src/pages/DnsQuery.tsx](/Users/dyck/workspaces/ai/toolbox-codex/apps/web/src/pages/DnsQuery.tsx)
- [apps/web/src/pages/FormatConverter.tsx](/Users/dyck/workspaces/ai/toolbox-codex/apps/web/src/pages/FormatConverter.tsx)
- [apps/web/src/pages/HashGenerator.tsx](/Users/dyck/workspaces/ai/toolbox-codex/apps/web/src/pages/HashGenerator.tsx)
- [apps/web/src/pages/Home.tsx](/Users/dyck/workspaces/ai/toolbox-codex/apps/web/src/pages/Home.tsx)
- [apps/web/src/pages/IpQuery.tsx](/Users/dyck/workspaces/ai/toolbox-codex/apps/web/src/pages/IpQuery.tsx)
- [apps/web/src/pages/JsonFormatter.tsx](/Users/dyck/workspaces/ai/toolbox-codex/apps/web/src/pages/JsonFormatter.tsx)
- [apps/web/src/pages/MeetingMinutes.tsx](/Users/dyck/workspaces/ai/toolbox-codex/apps/web/src/pages/MeetingMinutes.tsx)
- [apps/web/src/pages/MemeGenerator.tsx](/Users/dyck/workspaces/ai/toolbox-codex/apps/web/src/pages/MemeGenerator.tsx)
- [apps/web/src/pages/PasswordGenerator.tsx](/Users/dyck/workspaces/ai/toolbox-codex/apps/web/src/pages/PasswordGenerator.tsx)
- [apps/web/src/pages/RegexTester.tsx](/Users/dyck/workspaces/ai/toolbox-codex/apps/web/src/pages/RegexTester.tsx)
- [apps/web/src/pages/SheetEditor.tsx](/Users/dyck/workspaces/ai/toolbox-codex/apps/web/src/pages/SheetEditor.tsx)
- [apps/web/src/pages/ShortLinkGenerator.tsx](/Users/dyck/workspaces/ai/toolbox-codex/apps/web/src/pages/ShortLinkGenerator.tsx)
- [apps/web/src/pages/TextComparator.tsx](/Users/dyck/workspaces/ai/toolbox-codex/apps/web/src/pages/TextComparator.tsx)
- [apps/web/src/pages/Timestamp.tsx](/Users/dyck/workspaces/ai/toolbox-codex/apps/web/src/pages/Timestamp.tsx)
- [apps/web/src/pages/UIGenerator.tsx](/Users/dyck/workspaces/ai/toolbox-codex/apps/web/src/pages/UIGenerator.tsx)
- [apps/web/src/pages/UrlEncoder.tsx](/Users/dyck/workspaces/ai/toolbox-codex/apps/web/src/pages/UrlEncoder.tsx)
- [apps/web/src/pages/UuidGenerator.tsx](/Users/dyck/workspaces/ai/toolbox-codex/apps/web/src/pages/UuidGenerator.tsx)

## P2：工具包有 locale 资源，但页面层疑似没有真正消费 i18n

这批需要逐个复核。扫描结果说明：包里已经有 locale 文件，但主页面组件里没看到 `useTranslation`。

- [tools/tool-api-availability](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-api-availability)
- [tools/tool-barcode-reader](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-barcode-reader)
- [tools/tool-cdn-check](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-cdn-check)
- [tools/tool-city-route](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-city-route)
- [tools/tool-curl-to-fetch](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-curl-to-fetch)
- [tools/tool-dhcp-config-gen](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-dhcp-config-gen)
- [tools/tool-dhcp-conflict](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-dhcp-conflict)
- [tools/tool-dhcp-discover-sim](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-dhcp-discover-sim)
- [tools/tool-dhcp-lease-analysis](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-dhcp-lease-analysis)
- [tools/tool-dhcp-log-analysis](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-dhcp-log-analysis)
- [tools/tool-dhcp-mac-binding](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-dhcp-mac-binding)
- [tools/tool-dhcp-option](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-dhcp-option)
- [tools/tool-dhcp-scan](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-dhcp-scan)
- [tools/tool-dhcp-utilization](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-dhcp-utilization)
- [tools/tool-distance-calc](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-distance-calc)
- [tools/tool-expense-tracker](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-expense-tracker)
- [tools/tool-flight-search](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-flight-search)
- [tools/tool-graphql-playground](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-graphql-playground)
- [tools/tool-gslb-failover-sim](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-gslb-failover-sim)
- [tools/tool-gslb-geo-sim](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-gslb-geo-sim)
- [tools/tool-gslb-health-sim](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-gslb-health-sim)
- [tools/tool-gslb-hit-predict](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-gslb-hit-predict)
- [tools/tool-gslb-isp-sim](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-gslb-isp-sim)
- [tools/tool-gslb-latency-sim](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-gslb-latency-sim)
- [tools/tool-gslb-policy-sim](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-gslb-policy-sim)
- [tools/tool-gslb-rule-validate](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-gslb-rule-validate)
- [tools/tool-gslb-traffic-predict](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-gslb-traffic-predict)
- [tools/tool-gslb-weight-calc](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-gslb-weight-calc)
- [tools/tool-habit-tracker](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-habit-tracker)
- [tools/tool-hotel-trend](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-hotel-trend)
- [tools/tool-http-debugger](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-http-debugger)
- [tools/tool-http-status](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-http-status)
- [tools/tool-id-photo](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-id-photo)
- [tools/tool-image-canvas-lab](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-image-canvas-lab)
- [tools/tool-image-cropper](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-image-cropper)
- [tools/tool-image-filter](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-image-filter)
- [tools/tool-image-rotator](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-image-rotator)
- [tools/tool-image-stitcher](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-image-stitcher)
- [tools/tool-image-watermark](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-image-watermark)
- [tools/tool-image-watermark-remover](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-image-watermark-remover)
- [tools/tool-installment-calc](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-installment-calc)
- [tools/tool-ipam-changelog](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-ipam-changelog)
- [tools/tool-ipam-reclaim](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-ipam-reclaim)
- [tools/tool-ipam-scan](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-ipam-scan)
- [tools/tool-ipam-subnet-util](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-ipam-subnet-util)
- [tools/tool-ipam-visualize](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-ipam-visualize)
- [tools/tool-ping](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-ping)
- [tools/tool-pomodoro](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-pomodoro)
- [tools/tool-postman-lite](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-postman-lite)
- [tools/tool-pronunciation-eval](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-pronunciation-eval)
- [tools/tool-recipe-finder](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-recipe-finder)
- [tools/tool-restaurant-finder](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-restaurant-finder)
- [tools/tool-running-tracker](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-running-tracker)
- [tools/tool-security-dns-ddos](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-security-dns-ddos)
- [tools/tool-security-dnssec-verify](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-security-dnssec-verify)
- [tools/tool-security-domain-hijack](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-security-domain-hijack)
- [tools/tool-security-domain-score](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-security-domain-score)
- [tools/tool-sedentary-reminder](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-sedentary-reminder)
- [tools/tool-server-latency](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-server-latency)
- [tools/tool-sleep-tracker](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-sleep-tracker)
- [tools/tool-split-bill](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-split-bill)
- [tools/tool-ssl-cert](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-ssl-cert)
- [tools/tool-study-timer](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-study-timer)
- [tools/tool-tcp-port](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-tcp-port)
- [tools/tool-time-logger](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-time-logger)
- [tools/tool-traceroute](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-traceroute)
- [tools/tool-travel-budget](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-travel-budget)
- [tools/tool-travel-checklist](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-travel-checklist)
- [tools/tool-travel-conversation](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-travel-conversation)
- [tools/tool-travel-guide-summary](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-travel-guide-summary)
- [tools/tool-travel-journal](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-travel-journal)
- [tools/tool-travel-story](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-travel-story)
- [tools/tool-trending-spots](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-trending-spots)
- [tools/tool-trip-planner](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-trip-planner)
- [tools/tool-water-reminder](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-water-reminder)
- [tools/tool-web-availability](/Users/dyck/workspaces/ai/toolbox-codex/tools/tool-web-availability)

## 建议处理顺序

1. 先清 `P0`：
   - 老页面完全没国际化的 16 个
   - 工具级完全没 i18n 的 5 个
2. 再清 `P1`：
   - 缺少独立 locale 资源的 10 个工具包
   - 已接 i18n 但页面仍有硬编码中文的 23 个老页面
3. 最后处理 `P2`：
   - 76 个“有 locale 资源但未真正消费”的工具包，按分类一批批复核

## 维护方式

- 每次完成一批国际化改造，就直接从本文件对应分组里删除或移动。
- 如果新增工具没有 locale 资源，必须第一时间补进本文件。
- 后续如果要自动化，可以把本文件的扫描逻辑收敛成脚本，接到 `pnpm check:consistency` 之后。
