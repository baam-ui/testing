import React, { useState, useEffect } from 'react';
import { StickyNote, Plus, Edit2, Trash2, Check, Calendar, FileText, CheckSquare } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  type: 'note' | 'task';
  completed?: boolean;
  dueDate?: Date;
  createdAt: Date;
}

const NotesTasksPage: React.FC = () => {
  const [items, setItems] = useState<Note[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'notes' | 'tasks'>('all');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'note' as 'note' | 'task',
    dueDate: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem('notesAndTasks');
    if (saved) {
      const parsed = JSON.parse(saved);
      setItems(parsed.map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        dueDate: item.dueDate ? new Date(item.dueDate) : undefined
      })));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('notesAndTasks', JSON.stringify(items));
  }, [items]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const itemData = {
      title: formData.title,
      content: formData.content,
      type: formData.type,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      completed: formData.type === 'task' ? false : undefined
    };

    if (editingId) {
      setItems(prev => prev.map(item => 
        item.id === editingId ? { ...item, ...itemData } : item
      ));
      setEditingId(null);
    } else {
      const newItem: Note = {
        id: Date.now().toString(),
        ...itemData,
        createdAt: new Date()
      };
      setItems(prev => [newItem, ...prev]);
    }

    setFormData({ title: '', content: '', type: 'note', dueDate: '' });
    setIsAdding(false);
  };

  const handleEdit = (item: Note) => {
    setFormData({
      title: item.title,
      content: item.content,
      type: item.type,
      dueDate: item.dueDate ? item.dueDate.toISOString().split('T')[0] : ''
    });
    setEditingId(item.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const toggleTask = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const filteredItems = items.filter(item => {
    if (activeTab === 'notes') return item.type === 'note';
    if (activeTab === 'tasks') return item.type === 'task';
    return true;
  }).sort((a, b) => {
    // Sort tasks by due date, then by creation date
    if (a.type === 'task' && b.type === 'task') {
      if (a.dueDate && b.dueDate) {
        return a.dueDate.getTime() - b.dueDate.getTime();
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
    }
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const isOverdue = (item: Note) => {
    return item.type === 'task' && item.dueDate && !item.completed && item.dueDate < new Date();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="glass-panel p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <StickyNote className="w-6 h-6 text-primary" />
            <h1 className="orbitron text-2xl font-bold text-primary">Notes & Tasks</h1>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-primary-dark 
                     text-white rounded-full golden-glow transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Item</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'all', label: 'All', icon: StickyNote },
            { id: 'notes', label: 'Notes', icon: FileText },
            { id: 'tasks', label: 'Tasks', icon: CheckSquare }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-primary to-primary-dark text-white'
                    : 'bg-glass text-secondary hover:bg-glass-hover'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {isAdding && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-glass rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="px-4 py-2 bg-glass border border-primary/30 
                         rounded-lg text-secondary placeholder-muted 
                         focus:outline-none focus:border-primary transition-all"
                required
              />
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'note' | 'task' }))}
                className="px-4 py-2 bg-glass border border-primary/30 
                         rounded-lg text-secondary focus:outline-none focus:border-primary transition-all"
              >
                <option value="note">Note</option>
                <option value="task">Task</option>
              </select>
            </div>
            
            {formData.type === 'task' && (
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-4 py-2 mb-4 bg-glass border border-primary/30 
                         rounded-lg text-secondary focus:outline-none focus:border-primary transition-all"
              />
            )}
            
            <textarea
              placeholder="Content (optional)"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={4}
              className="w-full px-4 py-2 mb-4 bg-glass border border-primary/30 
                       rounded-lg text-secondary placeholder-muted 
                       focus:outline-none focus:border-primary transition-all resize-none"
            />
            
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-green-400 to-green-600 text-white 
                         rounded-lg hover:scale-105 transition-all"
              >
                {editingId ? 'Update' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                  setFormData({ title: '', content: '', type: 'note', dueDate: '' });
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:scale-105 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {filteredItems.map(item => (
            <div 
              key={item.id} 
              className={`p-4 rounded-lg transition-all group ${
                item.type === 'task' && item.completed
                  ? 'bg-green-100/20'
                  : isOverdue(item)
                  ? 'bg-red-100/20'
                  : 'bg-glass hover:bg-glass-hover'
              }`}
            >
              <div className="flex items-start gap-3">
                {item.type === 'task' && (
                  <button
                    onClick={() => toggleTask(item.id)}
                    className={`mt-1 p-1 rounded transition-all ${
                      item.completed
                        ? 'bg-green-500 text-white'
                        : 'bg-glass hover:bg-green-500 hover:text-white'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className={`font-semibold text-secondary ${
                      item.type === 'task' && item.completed ? 'line-through opacity-60' : ''
                    }`}>
                      {item.title}
                    </h3>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 bg-primary text-white rounded-lg hover:scale-105 transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 bg-red-500 text-white rounded-lg hover:scale-105 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {item.content && (
                    <p className={`text-muted mb-2 ${
                      item.type === 'task' && item.completed ? 'line-through opacity-60' : ''
                    }`}>
                      {item.content}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-muted">
                    <span className="flex items-center gap-1">
                      {item.type === 'note' ? <FileText className="w-4 h-4" /> : <CheckSquare className="w-4 h-4" />}
                      {item.type}
                    </span>
                    
                    {item.dueDate && (
                      <span className={`flex items-center gap-1 ${
                        isOverdue(item) ? 'text-red-500' : ''
                      }`}>
                        <Calendar className="w-4 h-4" />
                        {item.dueDate.toLocaleDateString()}
                      </span>
                    )}
                    
                    <span>{item.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <StickyNote className="w-16 h-16 text-muted mx-auto mb-4" />
            <p className="text-muted">
              No {activeTab === 'all' ? 'items' : activeTab} yet. Create your first {activeTab === 'all' ? 'item' : activeTab.slice(0, -1)}!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesTasksPage;