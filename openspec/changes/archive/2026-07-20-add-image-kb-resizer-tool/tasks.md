# image-kb-resizer 实现计划

> 按任务顺序执行，每任务 TDD（先测后码）+ 独立提交。

**Goal:** 纯前端图片文件大小精确调整：增大到目标 KB（无害填充）、压缩到目标 KB（质量二分/分辨率缩放）。

**Architecture:** 核心逻辑全部为纯函数（`src/lib/`：三种格式的填充算法、CRC-32、二分搜索步进函数），只操作 `Uint8Array`/`ArrayBuffer`，不依赖真实图片解码，可脱离 canvas 单测。Canvas 编排（加载图片、`toBlob` 重编码、调用填充函数）是薄壳，不做单测，由 build + 手工真实图片验收覆盖（jsdom 无法真实编解码图片）。

**Tech Stack:** React 18 + TS、Canvas/Blob/ArrayBuffer API、`@toolbox/ui-kit`（PageHero/Button/Card/Input）、vitest（node 环境测纯函数）、零新依赖。

## Global Constraints

- 目录 `tools/tool-image-kb-resizer/`，路由 `/image-kb-resizer`，namespace `toolImageKbResizer`，组件 `ImageKbResizer`
- `categoryKey: 'utility'`，icon 用 lucide `Maximize2`（或 `FileImage`）
- 不改后端；不改 `apps/web/src/config/a-*.ts`（manifest 自动发现）；不加新依赖
- i18n zh/en 同步，全部文案走 `t()`

---

## Task 1: 脚手架 + manifest + 类型

- [x] `pnpm create:tool image-kb-resizer && pnpm install`
- [x] 改 manifest：`categoryKey:'utility'`、icon、keywords（图片/压缩/文件大小/KB/resize/compress）、meta zh「图片文件大小调整」/en「Image KB Resizer」
- [x] `src/lib/types.ts`：`OutputFormat = 'same'|'jpeg'|'png'|'webp'`、`ResizeResult {originalSize,targetSize,actualSize,blob,approximate:boolean}`
- [x] Commit `feat(tool-image-kb-resizer): scaffold + manifest + types`

## Task 2: CRC-32 `src/lib/crc32.ts` (+ test)

- [x] 标准 CRC-32（IEEE 802.3 多项式）纯函数 `crc32(bytes: Uint8Array): number`
- [x] 单测：对已知字符串/字节序列的 CRC-32 值做断言（用公开的标准测试向量，如空输入、"123456789"→0xCBF43926）

## Task 3: JPEG 填充 `src/lib/pad-jpeg.ts` (+ test)

- [x] `padJpeg(bytes: Uint8Array, targetSize: number): Uint8Array`：定位最后一个 `FFD9`，追加填充字节到目标长度
- [x] 单测：构造最小 JPEG 字节（SOI+EOI），填充后长度精确等于目标；目标小于等于原始长度时原样返回或报错（明确行为）

## Task 4: PNG 填充 `src/lib/pad-png.ts` (+ test，依赖 Task 2)

- [x] `padPng(bytes: Uint8Array, targetSize: number): Uint8Array`：定位 `IEND` 块，插入自定义 ancillary+safe-to-copy 私有块（长度+类型+数据+CRC32），使总长度精确等于目标
- [x] 单测：构造最小 PNG 字节（signature+IHDR+IEND），填充后长度精确等于目标；插入块的 CRC 字段与 `crc32()` 结果一致；块类型首字母小写、末字母小写

## Task 5: WEBP 填充 `src/lib/pad-webp.ts` (+ test)

- [x] `padWebp(bytes: Uint8Array, targetSize: number): Uint8Array`：追加新 RIFF 子块（偶数对齐），更新外层 RIFF size 字段（小端 4 字节，位于偏移 4）
- [x] 单测：构造最小 WEBP 字节（RIFF header + WEBP + 最小 VP8 chunk），填充后长度精确等于目标；RIFF size 字段等于 `文件总长度 - 8`

## Task 6: 二分搜索步进 `src/lib/quality-search.ts` (+ test)

- [x] 纯函数 `nextQuality(low: number, high: number, resultSize: number, targetSize: number): {quality: number, done: boolean, low: number, high: number}`：给定当前搜索区间与上次编码结果大小，返回下一个待尝试的 quality 及是否收敛
- [x] 单测覆盖：结果偏大→收窄上界，结果偏小→收窄下界，收敛判定（区间足够小或已达标）

## Task 7: i18n `src/locales/zh.json` + `en.json`

- [x] 标题、拖拽提示、目标大小输入、格式选择、结果展示（原始/目标/实际/百分比）、PNG 近似值提示、下载按钮，zh/en 同步

## Task 8: Canvas 编排 + 主组件（依赖 Task 1-7）

- [x] `src/lib/encode.ts`：`loadImage(file)`、`encodeToTarget(canvas, {format, targetBytes})` 编排：quality 格式走二分搜索 + `nextQuality`；结果小于目标调用对应 `padJpeg/padPng/padWebp`；PNG 压缩方向走分辨率缩放循环，标记 `approximate:true`
- [x] `src/ImageKbResizer.tsx`：拖拽/选择图片、目标 KB 输入、格式选择、处理按钮、结果展示（原始/目标/实际大小+百分比）、下载
- [x] `src/index.tsx` 导出
- [x] Commit

## Task 9: 质量关卡 + 手工验收

- [x] `pnpm check:consistency` / `pnpm lint` / `pnpm test` / `pnpm -C apps/web build` 全绿
- [x] 手工验收：真实 JPEG/PNG/WEBP 图片分别做"增大"和"压缩"，用系统图片查看器确认填充后文件可正常打开、内容不变、字节数精确匹配
