import React, { useState, useEffect } from 'react';
import { Bookmark, Plus, Edit2, Trash2, ExternalLink } from 'lucide-react';

interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  createdAt: Date;
}

const BookmarksPage: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', url: '' });

  useEffect(() => {
    const saved = localStorage.getItem('bookmarks');
    if (saved) {
      const parsed = JSON.parse(saved);
      setBookmarks(parsed.map((b: any) => ({ ...b, createdAt: new Date(b.createdAt) })));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.url.trim()) return;

    let url = formData.url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    if (editingId) {
      setBookmarks(prev => prev.map(bookmark => 
        bookmark.id === editingId 
          ? { ...bookmark, title: formData.title, url }
          : bookmark
      ));
      setEditingId(null);
    } else {
      const newBookmark: BookmarkItem = {
        id: Date.now().toString(),
        title: formData.title,
        url,
        createdAt: new Date()
      };
      setBookmarks(prev => [newBookmark, ...prev]);
    }

    setFormData({ title: '', url: '' });
    setIsAdding(false);
  };

  const handleEdit = (bookmark: BookmarkItem) => {
    setFormData({ title: bookmark.title, url: bookmark.url });
    setEditingId(bookmark.id);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    setBookmarks(prev => prev.filter(bookmark => bookmark.id !== id));
  };

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="glass-panel p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bookmark className="w-6 h-6 text-primary" />
            <h1 className="orbitron text-2xl font-bold text-primary">Bookmarks</h1>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-primary-dark 
                     text-white rounded-full golden-glow transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Bookmark</span>
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-glass rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Bookmark title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="px-4 py-2 bg-glass border border-primary/30 
                         rounded-lg text-secondary placeholder-muted 
                         focus:outline-none focus:border-primary transition-all"
                required
              />
              <input
                type="url"
                placeholder="https://example.com"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                className="px-4 py-2 bg-glass border border-primary/30 
                         rounded-lg text-secondary placeholder-muted 
                         focus:outline-none focus:border-primary transition-all"
                required
              />
            </div>
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
                  setFormData({ title: '', url: '' });
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:scale-105 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookmarks.map(bookmark => (
            <div key={bookmark.id} className="p-4 bg-glass rounded-lg hover:bg-glass-hover transition-all group">
              <div className="flex items-start gap-3">
                <img
                  src={getFaviconUrl(bookmark.url) || ''}
                  alt=""
                  className="w-6 h-6 mt-1 rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-secondary truncate mb-1">
                    {bookmark.title}
                  </h3>
                  <p className="text-sm text-muted truncate mb-2">
                    {bookmark.url}
                  </p>
                  <p className="text-xs text-muted">
                    {bookmark.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => window.open(bookmark.url, '_blank')}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:scale-105 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEdit(bookmark)}
                  className="p-2 bg-primary text-white rounded-lg hover:scale-105 transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(bookmark.id)}
                  className="p-2 bg-red-500 text-white rounded-lg hover:scale-105 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {bookmarks.length === 0 && (
          <div className="text-center py-12">
            <Bookmark className="w-16 h-16 text-muted mx-auto mb-4" />
            <p className="text-muted">No bookmarks yet. Add your first bookmark!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarksPage;