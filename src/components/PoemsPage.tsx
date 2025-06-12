import React, { useState, useEffect } from 'react';
import { FileText, Plus, Edit2, Trash2, Heart } from 'lucide-react';

interface Poem {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  likes: number;
}

const PoemsPage: React.FC = () => {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '' });

  useEffect(() => {
    const saved = localStorage.getItem('poems');
    if (saved) {
      const parsed = JSON.parse(saved);
      setPoems(parsed.map((p: any) => ({ ...p, createdAt: new Date(p.createdAt) })));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('poems', JSON.stringify(poems));
  }, [poems]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    if (editingId) {
      setPoems(prev => prev.map(poem => 
        poem.id === editingId 
          ? { ...poem, title: formData.title, content: formData.content }
          : poem
      ));
      setEditingId(null);
    } else {
      const newPoem: Poem = {
        id: Date.now().toString(),
        title: formData.title,
        content: formData.content,
        createdAt: new Date(),
        likes: 0
      };
      setPoems(prev => [newPoem, ...prev]);
    }

    setFormData({ title: '', content: '' });
    setIsWriting(false);
  };

  const handleEdit = (poem: Poem) => {
    setFormData({ title: poem.title, content: poem.content });
    setEditingId(poem.id);
    setIsWriting(true);
  };

  const handleDelete = (id: string) => {
    setPoems(prev => prev.filter(poem => poem.id !== id));
  };

  const handleLike = (id: string) => {
    setPoems(prev => prev.map(poem => 
      poem.id === id ? { ...poem, likes: poem.likes + 1 } : poem
    ));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="glass-panel p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary" />
            <h1 className="orbitron text-2xl font-bold text-primary">Poems</h1>
          </div>
          <button
            onClick={() => setIsWriting(!isWriting)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-primary-dark 
                     text-white rounded-full golden-glow transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Write Poem</span>
          </button>
        </div>

        {isWriting && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-glass rounded-lg">
            <input
              type="text"
              placeholder="Poem title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 mb-4 bg-glass border border-primary/30 
                       rounded-lg text-secondary placeholder-muted 
                       focus:outline-none focus:border-primary transition-all"
              required
            />
            <textarea
              placeholder="Write your poem here..."
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={8}
              className="w-full px-4 py-2 mb-4 bg-glass border border-primary/30 
                       rounded-lg text-secondary placeholder-muted 
                       focus:outline-none focus:border-primary transition-all resize-none"
              required
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-green-400 to-green-600 text-white 
                         rounded-lg hover:scale-105 transition-all"
              >
                {editingId ? 'Update' : 'Publish'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsWriting(false);
                  setEditingId(null);
                  setFormData({ title: '', content: '' });
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:scale-105 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="space-y-6">
          {poems.map(poem => (
            <div key={poem.id} className="p-6 bg-glass rounded-lg hover:bg-glass-hover transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-secondary mb-2">
                    {poem.title}
                  </h3>
                  <p className="text-sm text-muted">
                    {poem.createdAt.toLocaleDateString()} • {poem.likes} likes
                  </p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleLike(poem.id)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:scale-105 transition-all"
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(poem)}
                    className="p-2 bg-primary text-white rounded-lg hover:scale-105 transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(poem.id)}
                    className="p-2 bg-red-600 text-white rounded-lg hover:scale-105 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-secondary font-serif leading-relaxed">
                  {poem.content}
                </pre>
              </div>
            </div>
          ))}
        </div>

        {poems.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-muted mx-auto mb-4" />
            <p className="text-muted">No poems yet. Write your first poem!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PoemsPage;