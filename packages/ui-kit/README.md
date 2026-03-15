# @toolbox/ui-kit

公共 UI 组件库，**统一主题**（浅色/暗色）。

## 主题控制

- 主题由**应用层**通过 `html.dark` / `html` class 切换（如 `ThemeContext`）。
- 本包内组件使用 Tailwind 的 `dark:` 前缀，自动跟随应用主题。
- 主应用需在 `tailwind.config.js` 的 `content` 中包含本包源码路径，以便生成对应样式：
  ```js
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui-kit/src/**/*.{js,ts,jsx,tsx}",
  ],
  ```

## 组件与能力

| 类别 | 导出 | 说明 |
|------|------|------|
| 基础 | `Button`, `Card`, `Input`, `PageHero` | 按钮/卡片/输入/页面标题区，统一 dark 样式 |
| 工具 | `cn` | 类名合并（clsx + tailwind-merge），shadcn/ui 风格基础 |
| 动画 | `FadeIn`, `StaggerChildren` | Motion 淡入、列表错开入场 |
| 弹簧 | `FlipCard`, `Parallax` | @react-spring 卡片翻转、视差滚动 |
| 背景 | `ParticlesBackground`, `BackgroundVisibilityProvider`, `useBackgroundVisibility`, `particlesPresets` | 粒子背景（每工具可选预设），全局显示/隐藏 |
| 图表 | `ChartContainer`, `LineChart`, `Line`, `BarChart`, … | Recharts 容器与常用图表组件 |

## 使用

```tsx
import { Button, Card, Input, PageHero, cn, FadeIn, FlipCard, ParticlesBackground, ChartContainer, LineChart, Line, XAxis, YAxis } from '@toolbox/ui-kit'

<PageHero title="工具名" description="描述" />
<FadeIn delay={0.1}><Card>...</Card></FadeIn>
<FlipCard front={<div>正面</div>} back={<div>背面</div>} />
<ParticlesBackground preset="minimal" className="absolute inset-0" />
<ChartContainer title="趋势"><LineChart data={data}><Line dataKey="value" />...</LineChart></ChartContainer>
```

应用根需包裹 `BackgroundVisibilityProvider` 以控制粒子背景全局开关。

## 扩展

- 新增组件时在 `src/` 下实现并带齐 `dark:` 样式，再在 `src/index.ts` 中导出。
- 风格以 **shadcn/ui** 为参考：使用 `cn()`、可选 `class-variance-authority`，与现有 token（`src/theme.ts`）一致。
- 各工具开发前请参考 [docs/UI_KIT_USAGE_BY_TOOL.md](../../docs/UI_KIT_USAGE_BY_TOOL.md)：是否用 Motion/Spring/粒子/图表，**先在 ui-kit 封装再在工具内使用**。
