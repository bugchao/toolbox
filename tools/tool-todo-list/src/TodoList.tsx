import React, { useState, useEffect } from 'react'
import { PageHero, ParticlesBackground } from '@toolbox/ui-kit'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, Check, CheckSquare, Square, Calendar, Tag } from 'lucide-react'
import { useToolStorage } from '@toolbox/storage'

interface Todo {
  id: string
  text: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  category: string
  createdAt: string
}

interface TodoData {
  todos: Todo[]
  categories: string[]
}

const DEFAULT_DATA: TodoData = {
  todos: [
    { id: '1', text: '欢迎使用待办清单', completed: false, priority: 'medium', category: '默认', createdAt: new Date().toISOString() },
    { id: '2', text: '点击右侧复选框完成任务', completed: true, priority: 'low', category: '默认', createdAt: new Date().toISOString() },
    { id: '3', text: '左滑或点击删除按钮删除任务', completed: false, priority: 'high', category: '工作', createdAt: new Date().toISOString() },
  ],
  categories: ['默认', '工作', '生活', '学习'],
}

const PRIORITY_COLORS = {
  low: 'bg-green-100 dark:bg-green-900/30 text-green-600',
  medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600',
  high: 'bg-red-100 dark:bg-red-900/30 text-red-600',
}

const PRIORITY_LABELS = {
  low: '低',
  medium: '中',
  high: '高',
}

const TodoList: React.FC = () => {
  const { t } = useTranslation('toolTodoList')
  const { data, save, loading, backend } = useToolStorage<TodoData>(
    'todo-list',
    'data',
    DEFAULT_DATA
  )

  const [newTodo, setNewTodo] = useState('')
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [newCategory, setNewCategory] = useState('默认')
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const addTodo = () => {
    if (!newTodo.trim()) return
    const todo: Todo = {
      id: String(Date.now()),
      text: newTodo.trim(),
      completed: false,
      priority: newPriority,
      category: newCategory,
      createdAt: new Date().toISOString(),
    }
    save({ ...data, todos: [todo, ...data.todos] })
    setNewTodo('')
  }

  const toggleTodo = (id: string) => {
    save({
      ...data,
      todos: data.todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    })
  }

  const deleteTodo = (id: string) => {
    save({ ...data, todos: data.todos.filter((t) => t.id !== id) })
  }

  const clearCompleted = () => {
    save({ ...data, todos: data.todos.filter((t) => !t.completed) })
  }

  const filteredTodos = data.todos.filter((todo) => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  }).filter((todo) => {
    if (categoryFilter === 'all') return true
    return todo.category === categoryFilter
  })

  const stats = {
    total: data.todos.length,
    completed: data.todos.filter((t) => t.completed).length,
    active: data.todos.filter((t) => !t.completed).length,
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center text-gray-400 py-20">
        加载中...
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('title')}</h1>
        <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500">
          💾 {backend === 'server' ? '云端' : '本地'}
        </span>
      </div>
      <p className="text-gray-500 dark:text-gray-400">{t('description')}</p>

      {/* 统计 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</div>
          <div className="text-xs text-gray-500 mt-1">总任务</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
          <div className="text-xs text-gray-500 mt-1">已完成</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-orange-500">{stats.active}</div>
          <div className="text-xs text-gray-500 mt-1">进行中</div>
        </div>
      </div>

      {/* 添加任务 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <div className="flex gap-2">
          <input
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
            placeholder="输入任务内容..."
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value as 'low' | 'medium' | 'high')}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none"
          >
            <option value="low">低</option>
            <option value="medium">中</option>
            <option value="high">高</option>
          </select>
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none"
          >
            {data.categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <button
            onClick={addTodo}
            disabled={!newTodo.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            添加
          </button>
        </div>
      </div>

      {/* 筛选 */}
      <div className="flex gap-2 flex-wrap items-center">
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-gray-100'
                  : 'text-gray-500'
              }`}
            >
              {f === 'all' ? '全部' : f === 'active' ? '进行中' : '已完成'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Tag className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-xs focus:outline-none"
          >
            <option value="all">全部分类</option>
            {data.categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {stats.completed > 0 && (
            <button
              onClick={clearCompleted}
              className="text-xs text-gray-400 hover:text-red-400 transition-colors"
            >
              清理已完成
            </button>
          )}
        </div>
      </div>

      {/* 任务列表 */}
      <div className="space-y-2">
        {filteredTodos.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <div className="text-sm">暂无任务</div>
          </div>
        ) : (
          filteredTodos.map((todo) => (
            <div
              key={todo.id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                todo.completed
                  ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}
            >
              <button onClick={() => toggleTodo(todo.id)} className="shrink-0">
                {todo.completed ? (
                  <CheckSquare className="w-5 h-5 text-green-500" />
                ) : (
                  <Square className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div
                  className={`text-sm truncate ${
                    todo.completed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-100'
                  }`}
                >
                  {todo.text}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${PRIORITY_COLORS[todo.priority]}`}
                  >
                    {PRIORITY_LABELS[todo.priority]}
                  </span>
                  <span className="text-xs text-gray-400">{todo.category}</span>
                  <span className="text-xs text-gray-300">
                    {new Date(todo.createdAt).toLocaleDateString('zh-CN', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="text-gray-300 hover:text-red-400 transition-colors p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default TodoList
