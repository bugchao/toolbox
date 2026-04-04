import type { ToolManifest } from '../../../apps/web/src/types/tool';

const manifest: ToolManifest = {
  id: 'travel-conversation',
  name: 'TravelConversation',
  path: '/travel-conversation',
  categoryKey: 'travel',
  icon: '💬',
  title: {
    zh: '旅行对话模拟',
    en: 'Travel Conversation Practice',
  },
  description: {
    zh: '选择场景，练习旅行中的常用英语对话',
    en: 'Choose scenarios and practice common English conversations for travel',
  },
  keywords: {
    zh: ['旅行英语', '对话练习', '英语口语', '旅游英语', '场景对话'],
    en: ['travel English', 'conversation practice', 'spoken English', 'travel language', 'scenario dialogue'],
  },
};

export default manifest;
