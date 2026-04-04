import type { ToolManifest } from '../../../apps/web/src/types/tool';

const manifest: ToolManifest = {
  id: 'running-tracker',
  name: 'RunningTracker',
  path: '/running-tracker',
  categoryKey: 'life',
  icon: '🏃',
  title: {
    zh: '跑步数据分析',
    en: 'Running Data Analysis',
  },
  description: {
    zh: '记录跑步数据，分析配速和趋势',
    en: 'Track running data and analyze pace and trends',
  },
  keywords: {
    zh: ['跑步记录', '配速分析', '跑步追踪', '运动数据', '健康管理'],
    en: ['running tracker', 'pace analysis', 'running tracking', 'exercise data', 'health management'],
  },
};

export default manifest;
