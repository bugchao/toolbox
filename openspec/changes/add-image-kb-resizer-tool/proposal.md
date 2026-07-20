# Change: 新增图片文件大小调整工具（image-kb-resizer）

## Why

参考 [resizefile.com 的 "Increase Image Size in KB"](https://resizefile.com/increase-image-size-in-kb/)：用户上传图片、指定目标 KB，工具输出一张精确匹配该大小的图片（超出目标时重编码降质，不足目标时追加无害填充数据补齐，不改变可见内容）。同类需求在很多场景很实际（表单上传要求"文件大小 ≥ N KB"或"≤ N KB"、批量归档统一体积等）。仓库现有 `apps/web/src/pages/ImageCompressor.tsx` 只能按质量百分比压缩，压不到精确的目标字节数，也不支持"增大"方向。

## What Changes

新增纯前端工具 `tools/tool-image-kb-resizer/`，路由 `/image-kb-resizer`，分类 `utility`：

- **输入**：本地图片（拖拽/选择，JPG/PNG/WEBP/GIF/BMP），目标大小（KB，1~10000），输出格式（保持原格式/JPEG/PNG/WEBP）。
- **双向调整**（比参考站多做一个方向，同一套 UI 复用）：
  - 目标 KB **大于**原图：重编码（若目标格式支持质量参数则用最高质量）后，若仍小于目标，向文件追加格式安全的无害填充数据，直到字节数精确等于目标。可见内容、分辨率不变。
  - 目标 KB **小于**原图：对支持质量参数的格式（JPEG/WEBP）用二分搜索质量因子逼近目标；仍降不到目标时，按比例缩小分辨率继续降；PNG 为无损格式，缺少质量旋钮，压缩方向按分辨率缩放逼近目标（明确告知用户 PNG 压缩是近似值，不保证精确命中）。
- **填充算法（纯函数，均可脱离真实图片文件单测）**：
  - **JPEG**：在最后一个 EOI 标记（`FFD9`）之后追加任意字节——JPEG 解码器读到 EOI 即停止，尾部字节被忽略。
  - **PNG**：在 `IEND` 块之前插入一个自定义的 ancillary + safe-to-copy 私有块（首字母小写=ancillary，末字母小写=safe-to-copy），带正确的 CRC-32，不被解码器识别但符合规范会被跳过。
  - **WEBP**：作为一个新的 RIFF 子块追加（偶数字节对齐），并更新外层 RIFF 长度字段——RIFF 容器按声明的块大小顺序解析，未知 FourCC 的块会被安全跳过。
- **输出**：处理后的图片可下载，展示原始大小、目标大小、实际达成大小、达成率；PNG 压缩方向未精确命中时展示提示而非误导性的"已达标"。

技术方案：纯前端 Canvas + Blob/ArrayBuffer 操作，不依赖第三方库、不触碰后端。图片重编码/二分搜索质量的 canvas 编排部分不做单元测试（jsdom 无法真实解码/编码图片），由 build + 手工真实图片验收覆盖；三种格式的填充算法、CRC-32、二分搜索步进函数均为纯函数，单测覆盖。

## Acceptance Criteria

- 上传图片，目标 KB 高于原图：处理后文件字节数精确等于目标 KB×1024，图片可正常打开且视觉内容不变。
- 目标 KB 低于原图（JPEG/WEBP）：处理后文件字节数 ≤ 目标，且尽量逼近（二分搜索收敛）。
- 目标 KB 低于原图（PNG）：明确提示结果为近似值，展示实际达成的大小。
- 三种格式的填充函数、CRC-32、二分搜索步进函数有单测覆盖，覆盖典型输入与边界（目标等于原始大小、目标略小于最小可能填充块等）。
- `pnpm check:consistency`、`pnpm lint`、`pnpm test`、`pnpm -C apps/web build` 全部通过。
