export default {
  id: 'analog-clock',
  name: '机械时钟',
  description: '精美的机械表模拟，10种主题可选，支持全屏显示',
  category: 'life',
  tags: ['时钟', '机械表', '全屏', '主题'],
  component: () => import('./src/AnalogClock'),
}
