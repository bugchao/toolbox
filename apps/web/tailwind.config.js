/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui-kit/src/**/*.{js,ts,jsx,tsx}",
    "../../tools/*/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        // 语义色 token（见 src/index.css 的 CSS 变量定义）：跟随主题自动切换，
        // 用法如 bg-surface text-ink border-edge，不用再手写 dark: 配对。
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-muted': 'rgb(var(--color-surface-muted) / <alpha-value>)',
        'surface-inset': 'rgb(var(--color-surface-inset) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        'ink-muted': 'rgb(var(--color-ink-muted) / <alpha-value>)',
        'ink-subtle': 'rgb(var(--color-ink-subtle) / <alpha-value>)',
        edge: 'rgb(var(--color-edge) / <alpha-value>)',
        'edge-strong': 'rgb(var(--color-edge-strong) / <alpha-value>)',
      }
    },
  },
  plugins: [],
}
