import type { ToolManifest } from '../../../apps/web/src/types/tool';

const manifest: ToolManifest = {
  id: 'sleep-tracker',
  name: 'SleepTracker',
  path: '/sleep-tracker',
  categoryKey: 'life',
  icon: '😴',
  title: {
    zh: '睡眠质量记录',
    en: 'Sleep Quality Tracker',
  },
  description: {
    zh: '记录每日睡眠，追踪睡眠质量',
    en: 'Record daily sleep and track sleep quality',
  },
  keywords: {
    zh: ['睡眠记录', '睡眠质量', '睡眠追踪', '睡眠分析', '健康管理'],
    en: ['sleep tracker', 'sleep quality', 'sleep tracking', 'sleep analysis', 'health management'],
  },
};

export default manifest;
