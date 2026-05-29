# Change: Add AI Detector Tool

## Why
随着 LLM 与图像生成模型普及，用户在审稿、内容审核、教育评估场景下越来越需要"一眼判断是不是 AI 生成"的能力。商用方案（GPTZero / Sapling / 腾讯 Matrix 等）多为黑盒+计费。本工具在 toolbox 中提供一个**完全本地、纯前端的启发式 AI 检测器**：不联网、不需要 API key、对中英文文本与本地图片都给出"AI 倾向"评分与可解释的特征明细，作为低成本初筛工具。

## What Changes
- 新增工具包 `tools/tool-ai-detector/`（manifest-first），路径 `/ai-detector`，归类 `ai`。
- 双 Tab 模式：
  - **文本 Tab**：粘贴或键入 → 计算多个启发式特征（perplexity 近似、TTR、句长方差、n-gram 重复、过渡词密度、高频 AI 倾向词等），加权得出 0–100 的 AI 倾向分。
  - **图片 Tab**：拖拽 / 选择本地图片 → 解析 EXIF 与 PNG textual chunks、统计颜色直方图、计算高频能量占比，加权得出 AI 倾向分。
- 三档分类：人工 (0–35) / 疑似 (35–65) / AI (65–100)。
- 结果面板：环形分数 + 三档徽章 + 特征贡献明细表（每项给"特征值 → 该特征的 AI 倾向贡献"），保证可解释。
- 明确"启发式估计"免责说明：分数不可作为版权 / 学术诚信仲裁依据。
- i18n：zh / en 双语。
- 后端：无（纯前端，不触 api-gateway）。

## Impact
- **Specs affected**: 新增能力 `ai-detector`。
- **Code affected**: 新工具目录 `tools/tool-ai-detector/`，manifest 自动注册。
- **Bundle**: 仅原生 JS（File API / Image / DOM），无重型依赖；预计 < 30 KB gzip。
- **Tests**: 单元测试覆盖文本特征器与综合打分函数。

## Out of Scope
- 接入第三方 AI 检测 API（保留接口形态，但本次不实现）。
- 训练或加载本地神经网络模型。
- 真正的 2D FFT；仅做简化的 1D 频率/边缘特征。
- 公开排行 / 历史记录服务端持久化。
