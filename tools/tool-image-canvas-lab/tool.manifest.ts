import type { ToolManifest } from '../../../apps/web/src/types/tool';

const manifest: ToolManifest = {
  id: 'image-canvas-lab',
  name: 'ImageCanvasLab',
  path: '/image-canvas-lab',
  categoryKey: 'utils',
  icon: '🎨',
  title: {
    zh: 'Canvas 图像工作台',
    en: 'Image Canvas Lab',
  },
  description: {
    zh: '多图层合成、水印添加、像素级处理',
    en: 'Multi-layer composition, watermark addition, pixel-level processing',
  },
  keywords: {
    zh: ['Canvas', '图像合成', '多图层', '水印添加', '图像处理'],
    en: ['Canvas', 'image composition', 'multi-layer', 'watermark', 'image processing'],
  },
};

export default manifest;
