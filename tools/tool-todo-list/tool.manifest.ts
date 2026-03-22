import { defineToolManifest } from '@toolbox/tool-registry'

const toolTodoListManifest = defineToolManifest({
  id: 'tool-todo-list',
  path: '/todo-list',
  namespace: 'toolTodoList',
  mode: 'client',
  meta: {
    zh: {
      title: '待办清单',
      description: '管理每日任务，按优先级和分类整理，完成打卡',
    },
    en: {
      title: 'Todo List',
      description: 'Manage daily tasks with priority and categories, track completion',
    },
  },
  loadComponent: () => import('./src/TodoList'),
  loadMessages: {
    zh: () => import('./src/locales/zh.json'),
    en: () => import('./src/locales/en.json'),
  },
})

export default toolTodoListManifest
