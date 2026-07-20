# image-kb-resizer

## ADDED Requirements

### Requirement: 本地图片加载与目标设置

工具 SHALL 支持通过文件选择或拖拽加载本地图片（JPG/PNG/WEBP/GIF/BMP），全程在浏览器内处理，不上传服务器；SHALL 允许用户设置目标大小（1~10000 KB）与输出格式（保持原格式/JPEG/PNG/WEBP）。

#### Scenario: 加载图片并设置目标

- **WHEN** 用户选择或拖入一张图片，并输入目标大小
- **THEN** 界面显示原始文件大小，目标大小输入框接受 1~10000 的整数

### Requirement: 增大到目标大小

当目标大小大于原图时，工具 SHALL 重编码图片后，若结果仍小于目标，向文件追加格式安全的无害填充数据，使最终字节数精确等于目标 KB × 1024；填充过程 SHALL NOT 改变图片的可见内容或分辨率。

#### Scenario: 目标大于原图

- **WHEN** 用户设置的目标 KB 大于原始文件大小
- **THEN** 下载的文件字节数精确等于目标大小，且在图片查看器中正常显示、内容与原图一致

### Requirement: 压缩到目标大小

当目标大小小于原图时，工具 SHALL 对支持质量参数的格式（JPEG/WEBP）用二分搜索质量因子逼近目标；仍无法达到时按比例缩小分辨率继续压缩。对无损格式（PNG）SHALL 通过分辨率缩放逼近目标，并明确标注结果为近似值。

#### Scenario: 目标小于原图（JPEG/WEBP）

- **WHEN** 用户对 JPEG 或 WEBP 图片设置的目标 KB 小于原始大小
- **THEN** 处理结果字节数不超过目标，且尽量逼近目标值

#### Scenario: 目标小于原图（PNG）

- **WHEN** 用户对 PNG 图片设置的目标 KB 小于原始大小
- **THEN** 界面明确提示结果为近似值，并展示实际达成的大小

### Requirement: 格式安全填充算法

工具 SHALL 为 JPEG、PNG、WEBP 三种格式分别实现不改变可见内容、可被标准解码器安全忽略的填充算法：JPEG 在 EOI 标记后追加字节；PNG 插入带正确 CRC-32 的 ancillary+safe-to-copy 私有块；WEBP 追加新的 RIFF 子块并更新外层长度字段。

#### Scenario: JPEG 填充后仍可解码

- **WHEN** 对一张 JPEG 图片填充至目标大小
- **THEN** 填充后的文件仍能被标准图片查看器正常打开，内容与填充前一致

#### Scenario: PNG 填充块被解码器忽略

- **WHEN** 对一张 PNG 图片填充至目标大小
- **THEN** 插入的私有块不影响图片显示，标准 PNG 解码器可正常解码

### Requirement: 处理结果展示

工具 SHALL 展示原始大小、目标大小、实际达成大小与达成率，并提供下载。

#### Scenario: 查看处理结果

- **WHEN** 处理完成
- **THEN** 界面显示原始大小、目标大小、实际大小、变化百分比，并提供下载按钮
