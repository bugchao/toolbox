import { defineToolManifest } from '@toolbox/tool-registry'
import { Video } from 'lucide-react'

const toolScreenRecorderManifest = defineToolManifest({
  id: 'tool-screen-recorder',
  path: '/screen-recorder',
  namespace: 'toolScreenRecorder',
  mode: 'client',
  categoryKey: 'utility',
  icon: Video,
  keywords: [
    'screen recorder',
    'screen capture',
    'record screen',
    'webm',
    'mediarecorder',
    'getDisplayMedia',
    '屏幕录制',
    '录屏',
    '本地录屏',
    '隐私',
    '无上传',
  ],
  meta: {
    zh: {
      title: '屏幕录制 Studio',
      description: '浏览器内录制屏幕/窗口/标签，支持系统音+麦克风，完全本地无上传',
    },
    en: {
      title: 'Screen Recorder Studio',
      description: 'Record screen/window/tab in-browser with system audio + mic, fully local with zero uploads',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolScreenRecorderManifest
