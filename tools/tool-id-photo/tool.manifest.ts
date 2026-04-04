import type { ToolManifest } from '../../../apps/web/src/types/tool';

const manifest: ToolManifest = {
  id: 'id-photo',
  name: 'IdPhoto',
  path: '/id-photo',
  categoryKey: 'utils',
  icon: '📸',
  title: {
    zh: '证件照工具',
    en: 'ID Photo Tool',
  },
  description: {
    zh: '标准尺寸裁剪、背景色更换',
    en: 'Standard size cropping and background color replacement',
  },
  keywords: {
    zh: ['证件照', '背景更换', '标准尺寸', '照片处理', '一寸照'],
    en: ['ID photo', 'background replacement', 'standard size', 'photo processing', 'passport photo'],
  },
};

export default manifest;
