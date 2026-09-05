import { defineToolManifest } from '@toolbox/tool-registry'
import { TerminalSquare } from 'lucide-react'

const toolRemoteShellManifest = defineToolManifest({
  id: 'tool-remote-shell',
  path: '/remote-shell',
  namespace: 'toolRemoteShell',
  mode: 'server',
  categoryKey: 'network',
  icon: TerminalSquare,
  keywords: [
    'ssh', '终端', '远程', '服务器', '运维', 'shell', 'terminal',
    'web ssh', 'remote', 'console', 'sftp',
  ],
  meta: {
    zh: {
      title: 'Web SSH 终端',
      shortTitle: 'SSH 终端',
      description:
        '在浏览器里直接 SSH 登录服务器。密码与私钥用主密码在本地加密保存，服务端不落盘；host key 首次连接需手动确认。',
    },
    en: {
      title: 'Web SSH Terminal',
      shortTitle: 'SSH Terminal',
      description:
        'SSH into a server straight from the browser. Passwords and keys are encrypted locally under a master password and never persisted server-side; host keys require explicit first-use confirmation.',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolRemoteShellManifest
