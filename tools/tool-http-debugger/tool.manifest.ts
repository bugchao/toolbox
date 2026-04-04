import type { ToolManifest } from '../../../apps/web/src/types/tool';

const manifest: ToolManifest = {
  id: 'http-debugger',
  name: 'HttpDebugger',
  path: '/http-debugger',
  categoryKey: 'dev',
  icon: '🔧',
  title: {
    zh: 'HTTP 请求调试器',
    en: 'HTTP Request Debugger',
  },
  description: {
    zh: '在线发送 HTTP 请求，调试 API 接口',
    en: 'Send HTTP requests online and debug API endpoints',
  },
  keywords: {
    zh: ['HTTP调试', 'API测试', '请求调试', '接口测试', '开发工具'],
    en: ['HTTP debugger', 'API testing', 'request debugging', 'endpoint testing', 'dev tools'],
  },
};

export default manifest;
