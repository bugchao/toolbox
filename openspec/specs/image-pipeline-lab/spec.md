# image-pipeline-lab Specification

## Purpose
TBD - created by archiving change add-image-pipeline-lab-tool. Update Purpose after archive.
## Requirements
### Requirement: 本地图像加载

工具 SHALL 支持通过文件选择或拖拽加载本地图片（PNG/JPEG/WebP），全程在浏览器内处理，不向任何服务器上传图像数据。

#### Scenario: 选择本地图片

- **WHEN** 用户选择或拖入一张图片
- **THEN** 原图渲染到预览 canvas，并显示尺寸等基本信息

### Requirement: 效果管线编辑

工具 SHALL 维护一个有序的效果步骤列表；每个步骤包含效果类型、参数与启用开关。用户 SHALL 能添加、删除、上移/下移、启用/禁用步骤，并调整每步参数。

#### Scenario: 叠加两个效果

- **WHEN** 用户依次添加「灰度」和「模糊」两个步骤
- **THEN** 预览显示先灰度后模糊的叠加结果

#### Scenario: 调整步骤顺序

- **WHEN** 用户将「模糊」步骤上移到「灰度」之前
- **THEN** 预览按新顺序重新渲染

#### Scenario: 禁用步骤

- **WHEN** 用户关闭某个步骤的启用开关
- **THEN** 该步骤被跳过，预览等同于该步骤不存在，但步骤仍保留在列表中

### Requirement: 效果集

工具 SHALL 提供至少 10 种效果：亮度、对比度、饱和度、灰度、褐色、色相旋转、反色、模糊、像素化、二值化。每种效果 SHALL 定义自己的参数范围与默认值。

#### Scenario: 参数即时生效

- **WHEN** 用户拖动「亮度」步骤的滑杆
- **THEN** 预览随参数变化即时更新

#### Scenario: 像素级效果

- **WHEN** 用户添加「像素化」步骤并设置块大小
- **THEN** 预览显示按块平均后的马赛克效果

### Requirement: 撤销与重做

工具 SHALL 记录管线结构与参数的编辑历史，支持撤销/重做（含快捷键 Cmd/Ctrl+Z、Shift+Cmd/Ctrl+Z）。历史仅针对管线编辑，不包含更换图片。

#### Scenario: 撤销一次编辑

- **WHEN** 用户删除一个步骤后按下 Cmd/Ctrl+Z
- **THEN** 该步骤连同参数恢复到删除前的位置，预览同步恢复

#### Scenario: 重做

- **WHEN** 用户撤销后触发重做
- **THEN** 管线回到撤销前的状态

### Requirement: 流程保存与导入导出

工具 SHALL 支持将当前管线以名称保存到 localStorage，并可加载、删除已存流程；SHALL 支持将管线导出为 JSON 文件与从 JSON 文件导入。导入非法 JSON SHALL 给出错误提示且不破坏当前管线。

#### Scenario: 保存并加载流程

- **WHEN** 用户保存名为「老照片」的管线，刷新页面后加载它
- **THEN** 步骤列表与各步参数完全复现

#### Scenario: 导入非法 JSON

- **WHEN** 用户导入一个不符合管线结构的 JSON 文件
- **THEN** 显示错误提示，当前管线保持不变

### Requirement: 结果导出

工具 SHALL 支持将当前管线处理后的图像导出为 PNG 文件。

#### Scenario: 导出 PNG

- **WHEN** 用户点击导出
- **THEN** 浏览器下载应用了全部启用步骤的 PNG 图像

