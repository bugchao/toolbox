import { defineToolManifest } from '@toolbox/tool-registry'
import { Scissors } from 'lucide-react'

const toolAudioCutterManifest = defineToolManifest({
  id: 'tool-audio-cutter',
  path: '/audio-cutter',
  namespace: 'toolAudioCutter',
  mode: 'client',
  categoryKey: 'utils',
  icon: Scissors,
  keywords: ['audio', 'cutter', 'trim', 'waveform', 'mp3', 'wav', '音频', '剪辑', '裁剪'],
  meta: {
    zh: {
      title: '音频剪辑',
      description: '在线音频裁剪工具，支持多种音频格式，可视化波形编辑',
    },
    en: {
      title: 'Audio Cutter',
      description: 'Online audio trimming tool with waveform visualization and multiple format support',
    },
  },
  loadComponent: () => import('./src/AudioCutter'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolAudioCutterManifest
