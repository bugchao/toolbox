/**
 * 主题 token：与 Tailwind dark: 一致，供组件统一使用
 * 应用层通过 html.dark 切换，ui-kit 组件使用 dark: 前缀即可跟随
 */
export const theme = {
  /** 浅色背景 */
  bgLight: 'bg-white dark:bg-gray-800',
  /** 卡片背景 */
  card: 'bg-white dark:bg-gray-800',
  /** 主色按钮 */
  primary: 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white',
  /** 输入框边框 */
  inputBorder: 'border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400',
  /** 正文文字 */
  text: 'text-gray-900 dark:text-gray-200',
  /** 次要文字 */
  textMuted: 'text-gray-600 dark:text-gray-300',
} as const
