# Tasks for Adding Image-to-PDF Tool

- [x] 1.1 `pnpm create:tool image-to-pdf`；为 package.json 添加 `jspdf: ^4.2.0`；`pnpm install`。
- [x] 1.2 配置 manifest（categoryKey='utility'、icon=FilePlus2、keywords、meta）。
- [x] 2.1 `lib/pageSize.ts`：标准纸张尺寸表 + 方向切换；纯函数 + 测试。
- [x] 2.2 `lib/layout.ts`：根据"每页 N 张"返回各图的目标 box（x,y,w,h，单位 mm）；测试。
- [x] 2.3 `lib/buildPdf.ts`：组装 jsPDF（图片解码、旋转、等比 contain、addImage）。
- [x] 3.1 `components/ImageGrid.tsx`：缩略图网格 + 删除 + 旋转 + 拖拽排序。
- [x] 3.2 `components/OptionsPanel.tsx`：纸张/方向/边距/每页张数 选项。
- [x] 3.3 `components/DropZone.tsx`：拖拽 / 点击 上传。
- [x] 4.1 `ImageToPdf.tsx` 主组件：连缀以上 + 导出按钮 + busy/错误状态。
- [x] 4.2 i18n: zh / en。
- [x] 5.1 lint 0 warning；test 全绿；build 成功；consistency 不引新告警。
