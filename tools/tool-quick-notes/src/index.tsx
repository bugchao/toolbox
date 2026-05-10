import React, { useState, useEffect } from 'react';

interface Note {
  id: string;
  content: string;
  timestamp: number;
  color: string;
}

const QuickNotes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [selectedColor, setSelectedColor] = useState('#fef3c7');

  const colors = [
    { name: '黄色', value: '#fef3c7' },
    { name: '绿色', value: '#d1fae5' },
    { name: '蓝色', value: '#dbeafe' },
    { name: '粉色', value: '#fce7f3' },
    { name: '紫色', value: '#e9d5ff' },
    { name: '橙色', value: '#fed7aa' }
  ];

  useEffect(() => {
    const saved = localStorage.getItem('quickNotes');
    if (saved) setNotes(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('quickNotes', JSON.stringify(notes));
  }, [notes]);

  const addNote = () => {
    if (!newNote.trim()) return;
    const note: Note = {
      id: Date.now().toString(),
      content: newNote,
      timestamp: Date.now(),
      color: selectedColor
    };
    setNotes([note, ...notes]);
    setNewNote('');
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
    return date.toLocaleDateString();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6">📝 快速笔记</h1>
        
        <div className="mb-6">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && e.ctrlKey && addNote()}
            placeholder="输入笔记内容... (Ctrl+Enter 快速添加)"
            className="w-full h-32 p-4 border rounded-lg resize-none"
          />
          
          <div className="flex items-center gap-4 mt-4">
            <div className="flex gap-2">
              {colors.map(c => (
                <button
                  key={c.value}
                  onClick={() => setSelectedColor(c.value)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor === c.value ? 'border-gray-800' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
            
            <button
              onClick={addNote}
              className="ml-auto px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              添加笔记
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map(note => (
            <div
              key={note.id}
              className="p-4 rounded-lg shadow-md relative"
              style={{ backgroundColor: note.color }}
            >
              <button
                onClick={() => deleteNote(note.id)}
                className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
              >
                ✕
              </button>
              <div className="pr-6 whitespace-pre-wrap break-words">{note.content}</div>
              <div className="text-xs text-gray-500 mt-2">{formatTime(note.timestamp)}</div>
            </div>
          ))}
        </div>

        {notes.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            还没有笔记，快速记录你的想法吧！
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">💡 使用提示</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 按 Ctrl+Enter 快速添加笔记</li>
            <li>• 选择不同颜色标记笔记类型</li>
            <li>• 笔记自动保存到本地</li>
            <li>• 点击 ✕ 删除笔记</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QuickNotes;
