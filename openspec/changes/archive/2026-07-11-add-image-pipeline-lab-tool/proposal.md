# Change: 新增图像处理实验工作台（image-pipeline-lab）

## Why

`docs/TOOLS_ROADMAP.md`「三、待开发」中最后一个具名条目（P3，调研中）。现有 `tool-image-filter` 只能一次性套一组滤镜参数，无法表达「先做 A 再做 B」的有序效果链，也没有撤销/重做和流程保存。本工具补齐「责任链式图像处理实验」场景：叠加多个效果步骤、逐步调参、随时回退、保存/复用整条流程。

## What Changes

新增纯前端工具 `tools/tool-image-pipeline-lab/`，路由 `/image-pipeline-lab`，分类 `utils`：

- **图像加载**：本地选择/拖拽图片，`FileReader` 读取，不上传服务器。
- **效果管线**：有序步骤列表，支持添加、删除、上移/下移、启用/禁用；每步一种效果 + 自身参数。
- **效果集（v1，共 10 种）**：亮度、对比度、饱和度、灰度、褐色、色相旋转、反色、模糊（`ctx.filter` 实现）；像素化、二值化（`getImageData` 像素级实现）。
- **实时预览**：管线任何变化后按顺序重新渲染到 canvas。
- **撤销/重做**：对管线结构与参数的编辑历史（不含图像本身）。
- **流程保存**：命名保存管线到 `localStorage`，可加载/删除；支持导出/导入 JSON。
- **导出**：处理结果导出 PNG。

不新增依赖、不触碰后端（`apps/api-gateway` 无改动）。i18n（zh/en）随工具包内置，manifest 自动发现，不改 `apps/web/src/config/a-*.ts`。

## Acceptance Criteria

- 加载图片后添加 ≥2 个效果步骤，预览按链式顺序生效；调整任一步参数即时反映。
- 删除/排序/禁用步骤后预览正确更新；撤销/重做可逐步回放这些编辑。
- 保存的流程刷新页面后可重新加载并复现同样效果；JSON 导出可再导入。
- `pnpm lint`、`pnpm test`、`pnpm -C apps/web build` 全部通过。
