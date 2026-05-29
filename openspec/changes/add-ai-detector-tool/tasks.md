# Tasks for Adding AI Detector Tool

## 组 1 — 基础设施
- [ ] 1.1 `pnpm create:tool ai-detector` 脚手架；`pnpm install` 链接。
- [ ] 1.2 配置 `tool.manifest.ts`：`categoryKey='ai'`、`icon=Bot`、`keywords`、`meta.zh/en`。

## 组 2 — 算法核心（可并行）
- [ ] 2.1 `lib/textFeatures.ts`：中英文检测分流，统一计算（TTR / 句长方差 / n-gram 重复 / 过渡词密度 / 高频 AI 词命中 / 字符熵），输出特征数组 + 单元测试。
- [ ] 2.2 `lib/imageFeatures.ts`：EXIF 解析（PNG textual chunks + JPEG EXIF "Software" 字段）、颜色直方图熵、Sobel 边缘比、典型 AI 分辨率检测；返回特征数组 + 单元测试。
- [ ] 2.3 `lib/score.ts`：通用打分聚合（features → totalScore + category），单元测试覆盖三档边界。

## 组 3 — UI（可并行）
- [ ] 3.1 `components/TextTab.tsx`：大 textarea + 字数显示 + 结果面板。
- [ ] 3.2 `components/ImageTab.tsx`：拖拽区 + 预览 + 结果面板。
- [ ] 3.3 `components/ResultPanel.tsx`：通用展示（环形分数 + 标签徽章 + 特征明细表）。

## 组 4 — 集成
- [ ] 4.1 `AiDetector.tsx`：Tab 切换、免责 NoticeCard、调度 TextTab/ImageTab。
- [ ] 4.2 i18n: zh/en 完整覆盖。

## 组 5 — 质量
- [ ] 5.1 单测全绿；lint 0 warning；build 成功；consistency 不引入新告警。
