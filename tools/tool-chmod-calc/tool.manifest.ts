import { defineToolManifest } from '@toolbox/tool-registry'
import { FileLock2 } from 'lucide-react'

const toolChmodCalcManifest = defineToolManifest({
  id: 'tool-chmod-calc',
  path: '/chmod-calc',
  namespace: 'toolChmodCalc',
  mode: 'client',
  categoryKey: 'dev',
  icon: FileLock2,
  keywords: [
    'chmod',
    '权限',
    '文件权限',
    'linux',
    'unix',
    '八进制',
    'octal',
    'permission',
    'rwx',
    'umask',
    'setuid',
    'sticky',
  ],
  meta: {
    zh: {
      title: 'Chmod 权限计算器',
      description: '勾选权限矩阵或输入八进制，双向生成 chmod 命令与符号表示',
    },
    en: {
      title: 'Chmod Calculator',
      description: 'Toggle the permission matrix or type octal to build chmod commands both ways',
    },
  },
  loadComponent: () => import('./src/index'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolChmodCalcManifest
