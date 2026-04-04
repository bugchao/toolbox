import type { ToolManifest } from '../../../apps/web/src/types/tool';

const manifest: ToolManifest = {
  id: 'sedentary-reminder',
  name: 'SedentaryReminder',
  path: '/sedentary-reminder',
  categoryKey: 'life',
  icon: '🪑',
  title: {
    zh: '久坐提醒工具',
    en: 'Sedentary Reminder',
  },
  description: {
    zh: '定时提醒起身活动，保护颈椎和腰椎健康',
    en: 'Remind you to stand up and move regularly to protect your health',
  },
  keywords: {
    zh: ['久坐提醒', '健康提醒', '拉伸建议', '办公健康', '颈椎保护'],
    en: ['sedentary reminder', 'health reminder', 'stretch suggestions', 'office health', 'posture protection'],
  },
};

export default manifest;
