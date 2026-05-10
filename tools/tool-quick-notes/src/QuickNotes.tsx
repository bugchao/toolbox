import React, { useState, useEffect } from 'react';
import './QuickNotes.css';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  color: string;
}

const COLORS = [
  '#fff9c4', // 黄色
  '#ffccbc', // 橙色
  '#f8bbd0', // 粉色
  '#e1bee7', // 紫色
  '#c5cae9', // 蓝色
  '#b2dfdb', // 青色
  '#c8e6c9', // 绿色
  '#ffffff', // 白色
];

export const QuickNotes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    saveNotes();
  }, [notes]);

  const loadNotes = () => {
    const saved = localStorage.getItem('quick-notes');
    if (saved) {
      setNotes(JSON.parse(saved));
    }
  };

  const saveNotes = () => {
    localStorage.setItem('quick-notes', JSON.stringify(notes));
  };

  const createNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: '新笔记',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      color: COLORS[0],
    };
    setNotes([newNote, ...notes]);
    setCurrentNote(newNote);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(notes.map(note => 
      note.id === id 
        ? { ...note, ...updates, updatedAt: Date.now() }
        : note
    ));
    if (currentNote?.id === id) {
      setCurrentNote({ ...currentNote, ...updates, updatedAt: Date.now() });
    }
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    if (currentNote?.id === id) {
      setCurrentNote(null);
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`;
    
    return date.toLocaleDateString('zh-CN');
  };

  const exportNotes = () => {
    const dataStr = JSON.stringify(notes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importNotes = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setNotes([...imported, ...notes]);
        alert('导入成功！');
      } catch (error) {
        alert('导入失败，文件格式错误');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="quick-notes">
      <div className="tool-header">
        <h1>📝 快速笔记</h1>
        <p>简洁高效的笔记工具</p>
      </div>

      <div className="notes-container">
        <div className="sidebar">
          <div className="sidebar-header">
            <button className="new-note-btn" onClick={createNote}>
              ➕ 新建笔记
            </button>
            <div className="search-box">
              <input
                type="text"
                placeholder="搜索笔记..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="notes-list">
            {filteredNotes.map(note => (
              <div
                key={note.id}
                className={`note-item ${currentNote?.id === note.id ? 'active' : ''}`}
                style={{ borderLeftColor: note.color }}
                onClick={() => setCurrentNote(note)}
              >
                <div className="note-item-title">{note.title || '无标题'}</div>
                <div className="note-item-preview">
                  {note.content.slice(0, 50) || '空笔记'}
                </div>
                <div className="note-item-date">{formatDate(note.updatedAt)}</div>
              </div>
            ))}
          </div>

          <div className="sidebar-footer">
            <button onClick={exportNotes}>导出</button>
            <label className="import-btn">
              导入
              <input
                type="file"
                accept=".json"
                onChange={importNotes}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>

        <div className="editor">
          {currentNote ? (
            <>
              <div className="editor-header">
                <input
                  type="text"
                  className="note-title-input"
                  value={currentNote.title}
                  onChange={e => updateNote(currentNote.id, { title: e.target.value })}
                  placeholder="笔记标题..."
                />
                <div className="editor-actions">
                  <div className="color-picker">
                    {COLORS.map(color => (
                      <button
                        key={color}
                        className={`color-btn ${currentNote.color === color ? 'active' : ''}`}
                        style={{ background: color }}
                        onClick={() => updateNote(currentNote.id, { color })}
                      />
                    ))}
                  </div>
                  <button
                    className="delete-btn"
                    onClick={() => {
                      if (confirm('确定删除这条笔记吗？')) {
                        deleteNote(currentNote.id);
                      }
                    }}
                  >
                    🗑️ 删除
                  </button>
                </div>
              </div>
              <textarea
                className="note-content-input"
                value={currentNote.content}
                onChange={e => updateNote(currentNote.id, { content: e.target.value })}
                placeholder="开始写笔记..."
                style={{ background: currentNote.color }}
              />
              <div className="editor-footer">
                <span>创建于 {formatDate(currentNote.createdAt)}</span>
                <span>更新于 {formatDate(currentNote.updatedAt)}</span>
                <span>{currentNote.content.length} 字符</span>
              </div>
            </>
          ) : (
            <div className="empty-editor">
              <p>选择一条笔记或创建新笔记</p>
            </div>
          )}
        </div>
      </div>

      <div className="info-section">
        <h3>💡 快捷键</h3>
        <ul>
          <li>Ctrl/Cmd + N - 新建笔记</li>
          <li>Ctrl/Cmd + S - 自动保存（实时保存）</li>
          <li>Ctrl/Cmd + F - 搜索笔记</li>
          <li>数据存储在浏览器本地，不会上传</li>
        </ul>
      </div>
    </div>
  );
};

export default QuickNotes;
