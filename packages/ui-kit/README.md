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

## 组件

| 组件 | 说明 |
|------|------|
| `Button` | 按钮，支持 primary/secondary/danger/success/ghost，内置 dark 样式 |
| `Card` | 卡片容器，统一圆角、阴影、浅/暗背景 |
| `Input` | 输入框，统一边框与 focus 环，支持 error、size |

## 使用

```tsx
import { Button, Card, Input } from '@toolbox/ui-kit'

<Card className="mt-4">
  <Input placeholder="请输入" />
  <Button variant="primary">确定</Button>
</Card>
```

## 扩展

- 新增组件时在 `src/` 下实现并带齐 `dark:` 样式，再在 `src/index.ts` 中导出。
- 可选参考 `src/theme.ts` 中的 token 保持与现有组件风格一致。
