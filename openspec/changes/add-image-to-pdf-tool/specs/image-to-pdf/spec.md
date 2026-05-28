# Spec Delta: image-to-pdf

## ADDED Requirements

### Requirement: 多图导入与排序
工具 SHALL 支持拖拽和点击两种方式批量导入图片，并允许用户对图片排序、删除、旋转。

#### Scenario: 拖拽导入多张
- **WHEN** 用户把 N 张图片文件拖入上传区
- **THEN** 工具按拖入顺序追加到当前图片列表，并显示缩略图。

#### Scenario: 拒绝非图片
- **WHEN** 用户拖入非 image/* 文件
- **THEN** 工具跳过该文件，并在提示区展示被忽略的文件名。

#### Scenario: 拖拽排序
- **WHEN** 用户在缩略图网格中把第 i 张拖到第 j 位
- **THEN** 列表顺序按拖放结果更新；导出 PDF 时按此顺序。

#### Scenario: 单张旋转 / 删除
- **WHEN** 用户点击某张缩略图上的旋转按钮
- **THEN** 图片旋转 90° 累加（0/90/180/270），缩略图与导出 PDF 同步反映。

### Requirement: 页面与版式选项
工具 SHALL 提供纸张大小、方向、边距、每页图片数四组选项，组合输出。

#### Scenario: 纸张选择
- **WHEN** 用户选择 A4 / Letter / Legal / A3 / A5
- **THEN** 工具用对应的标准尺寸（mm）作为页面物理大小。

#### Scenario: 适应图片比例
- **WHEN** 用户选择 "Fit"（按图片）
- **THEN** 每页的物理大小自动取该页图片的宽高比，无白边。

#### Scenario: 每页 N 张排版
- **WHEN** 用户选择"每页 2 张"
- **THEN** 一页被切分为两个等高的子区域，图片按等比缩放放入，剩余空间留作边距。

### Requirement: 本地导出 PDF
工具 SHALL 在浏览器本地用 jsPDF 生成 PDF 并触发下载，不上传图片。

#### Scenario: 一键导出
- **WHEN** 用户点击"导出 PDF"
- **THEN** 工具按当前选项生成 PDF Blob，触发浏览器下载（默认文件名 `images.pdf`，可在导出前编辑）。

#### Scenario: 没图片时禁用导出
- **WHEN** 图片列表为空
- **THEN** 导出按钮处于禁用状态。

#### Scenario: 进度反馈
- **WHEN** 正在生成 PDF（大批量图片）
- **THEN** 工具显示 busy 状态防止重复点击。
