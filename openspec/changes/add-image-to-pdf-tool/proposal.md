# Change: Add Image to PDF Tool

## Why
仓库现有 `tool-pdf` 提供"PDF → 其他"方向（合并、分割、转图、转文本），但缺少反向的"**图片 → PDF**"工具。这是高频的实用需求场景：
- 把扫描照片拼装成一份 PDF 文档发送；
- 把课程讲义截图打包归档；
- 把多张设计稿合成一份 PDF 评审稿。

商用方案（SmallPDF / iLovePDF）需要联网/付费。本工具完全本地、纯前端、不上传，使用 jsPDF（仓库已引入）。

## What Changes
- 新增工具包 `tools/tool-image-to-pdf/`（manifest-first），路径 `/image-to-pdf`，归类 `utility`。
- 拖拽 / 选择多张图片 → 在线缩略图预览，可拖拽排序、单张旋转 90°、单张删除。
- 页面选项：
  - 纸张大小：A4 / Letter / Legal / A3 / A5 / 适应图片本身比例
  - 方向：竖向 / 横向
  - 边距：无 / 小 / 中 / 大
  - 每页图片数：1 / 2（上下）/ 4（2×2）
- 一键导出 PDF，自动下载（文件名可改）。
- i18n：zh / en。
- 后端：无（jsPDF 在浏览器内生成，不上传）。

## Impact
- **Specs affected**: 新增能力 `image-to-pdf`。
- **Code affected**: 新工具目录 `tools/tool-image-to-pdf/`；manifest 自动注册。
- **Dependencies**: 复用 jsPDF（仓库其他工具如 tool-resume / tool-business-card 已使用 `^4.2.0`）。
- **Bundle**: jsPDF 已经在已用工具的 chunk 中；本工具新增 < 10 KB。

## Out of Scope
- OCR / 文本识别后写入 PDF。
- 添加水印 / 页码 / 元数据编辑（首版可加 P2，不阻塞）。
- 加密 / 密码保护。
- 上传到云端 / 分享链接。
