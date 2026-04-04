import type { ToolManifest } from '../../../apps/web/src/types/tool';

const manifest: ToolManifest = {
  id: 'time-logger',
  name: 'TimeLogger',
  path: '/time-logger',
  categoryKey: 'life',
  icon: '⏱️',
  title: {
    zh: '时间日志分析',
    en: 'Time Logger',
  },
  description: {
    zh: '记录和分析你的时间都去哪了，优化时间分配',
    en: 'Track and analyze where your time goes, optimize time allocation',
  },
  keywords: {
    zh: ['时间管理', '时间追踪', '时间日志', '效率分析', '时间统计'],
    en: ['time management', 'time tracking', 'time log', 'efficiency analysis', 'time statistics'],
  },
};

export default manifest;
