import React, { useState, useEffect } from 'react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
}

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    const saved = localStorage.getItem('todos');
    if (saved) setTodos(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (!newTodo.trim()) return;
    const todo: Todo = {
      id: Date.now().toString(),
      text: newTodo,
      completed: false,
      priority,
      createdAt: Date.now()
    };
    setTodos([todo, ...todos]);
    setNewTodo('');
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const clearCompleted = () => {
    setTodos(todos.filter(t => !t.completed));
  };

  const filteredTodos = todos.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };

  const priorityLabels = {
    low: '低',
    medium: '中',
    high: '高'
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6">✅ 待办清单</h1>
        
        <div className="mb-6">
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              placeholder="添加新任务..."
              className="flex-1 px-4 py-2 border rounded-lg"
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="low">低优先级</option>
              <option value="medium">中优先级</option>
              <option value="high">高优先级</option>
            </select>
            <button
              onClick={addTodo}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              添加
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            全部 ({todos.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg ${filter === 'active' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            进行中 ({todos.filter(t => !t.completed).length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg ${filter === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            已完成 ({todos.filter(t => t.completed).length})
          </button>
          <button
            onClick={clearCompleted}
            className="ml-auto px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            清除已完成
          </button>
        </div>

        <div className="space-y-2">
          {filteredTodos.map(todo => (
            <div
              key={todo.id}
              className={`flex items-center gap-3 p-4 rounded-lg border ${
                todo.completed ? 'bg-gray-50' : 'bg-white'
              }`}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className="w-5 h-5 cursor-pointer"
              />
              <span className={`flex-1 ${todo.completed ? 'line-through text-gray-400' : ''}`}>
                {todo.text}
              </span>
              <span className={`px-2 py-1 rounded text-xs ${priorityColors[todo.priority]}`}>
                {priorityLabels[todo.priority]}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="text-red-500 hover:text-red-700"
              >
                删除
              </button>
            </div>
          ))}
        </div>

        {filteredTodos.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            {filter === 'all' ? '还没有任务，添加一个开始吧！' : 
             filter === 'active' ? '没有进行中的任务' : '没有已完成的任务'}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoList;
