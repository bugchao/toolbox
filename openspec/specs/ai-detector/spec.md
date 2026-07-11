# ai-detector Specification

## Purpose
TBD - created by archiving change add-ai-detector-tool. Update Purpose after archive.
## Requirements
### Requirement: 文本 AI 倾向评估
工具 SHALL 接受用户提交的中文 / 英文文本，并在本地计算一组启发式特征汇总成 0–100 的"AI 倾向分"，附带特征贡献明细。

#### Scenario: 短文本拒绝评估
- **WHEN** 用户提交少于阈值（< 80 字符）的文本
- **THEN** 工具不输出分数，而提示"样本过短不足以评估"。

#### Scenario: 长文本输出分数与特征明细
- **WHEN** 用户提交 ≥ 80 字符的文本
- **THEN** 工具计算各特征值，给出 0–100 的总分，并按特征列出（特征名 / 原始值 / 倾向贡献）的明细表。

#### Scenario: 三档分类
- **WHEN** 总分落在 [0,35)
- **THEN** 标签为"人工"；分数 [35,65) 标"疑似 AI"；[65,100] 标"AI 生成可能性高"。

#### Scenario: 中英文双语适配
- **WHEN** 文本主体为中文
- **THEN** 工具采用以字为单位的统计（不依赖空格分词）；当文本主体为英文则采用以词为单位的统计。

### Requirement: 图片 AI 倾向评估
工具 SHALL 接受本地图片输入（拖拽或文件选择），并在本地解析元数据 + 像素统计得出 AI 倾向分。

#### Scenario: 拒绝非图片
- **WHEN** 用户拖入非 image/* 的 MIME 文件
- **THEN** 工具显示错误并不进行分析。

#### Scenario: 元数据强信号
- **WHEN** PNG textual chunks 出现 "Stable Diffusion" / "parameters" / "Software: Midjourney" / "Software: DALL·E" 等关键串
- **THEN** 该特征贡献设为高值（≥ 80），整体分数显著上偏。

#### Scenario: 元数据缺失的中性处理
- **WHEN** 文件没有 EXIF 且没有可识别的 AI 元数据
- **THEN** 元数据特征仅给中性贡献（≈ 50），由其他像素特征主导评分。

### Requirement: 可解释明细
工具 SHALL 对每个特征同时输出：原始值（如 "TTR = 0.36"）+ 该特征向总分贡献（0–100 区间）+ 权重，便于用户理解结果。

#### Scenario: 鼠标悬停或展开明细
- **WHEN** 用户查看结果
- **THEN** 工具列出每个参与计算的特征行，行内同时显示原始值、贡献分、权重百分比。

### Requirement: 免责声明
工具 SHALL 在主界面明显位置展示"启发式估计，不可作为正式判定依据"的提示。

#### Scenario: 初次打开
- **WHEN** 用户进入 /ai-detector
- **THEN** 顶部展示 NoticeCard / 警示文案。

