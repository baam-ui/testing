import React, { useState, useEffect } from 'react';
import { Bookmark, Plus, Edit2, Trash2, ExternalLink, FileText, Heart, Video, Play, StickyNote, Check, Calendar, CheckSquare } from 'lucide-react';

interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  createdAt: Date;
}

interface Poem {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  likes: number;
}

interface VideoItem {
  id: string;
  title: string;
  url: string;
  embedUrl: string;
  createdAt: Date;
}

interface Note {
  id: string;
  title: string;
  content: string;
  type: 'note' | 'task';
  completed?: boolean;
  dueDate?: Date;
  createdAt: Date;
}

type ContentType = 'bookmarks' | 'poems' | 'videos' | 'notes';

const ContentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ContentType>('bookmarks');
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [poems, setPoems] = useState<Poem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states for different content types
  const [bookmarkForm, setBookmarkForm] = useState({ title: '', url: '' });
  const [poemForm, setPoemForm] = useState({ title: '', content: '' });
  const [videoForm, setVideoForm] = useState({ title: '', url: '' });
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    type: 'note' as 'note' | 'task',
    dueDate: ''
  });

  // Load data from localStorage
  useEffect(() => {
    const loadData = (key: string, setter: Function) => {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        setter(parsed.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          dueDate: item.dueDate ? new Date(item.dueDate) : undefined
        })));
      }
    };

    loadData('bookmarks', setBookmarks);
    loadData('poems', setPoems);
    loadData('videos', setVideos);
    loadData('notesAndTasks', setNotes);
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('poems', JSON.stringify(poems));
  }, [poems]);

  useEffect(() => {
    localStorage.setItem('videos', JSON.stringify(videos));
  }, [videos]);

  useEffect(() => {
    localStorage.setItem('notesAndTasks', JSON.stringify(notes));
  }, [notes]);

  const resetForms = () => {
    setBookmarkForm({ title: '', url: '' });
    setPoemForm({ title: '', content: '' });
    setVideoForm({ title: '', url: '' });
    setNoteForm({ title: '', content: '', type: 'note', dueDate: '' });
    setIsAdding(false);
    setEditingId(null);
  };

  const getEmbedUrl = (url: string): string => {
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    return url;
  };

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  // Bookmark handlers
  const handleBookmarkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookmarkForm.title.trim() || !bookmarkForm.url.trim()) return;

    let url = bookmarkForm.url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    if (editingId) {
      setBookmarks(prev => prev.map(bookmark => 
        bookmark.id === editingId 
          ? { ...bookmark, title: bookmarkForm.title, url }
          : bookmark
      ));
    } else {
      const newBookmark: BookmarkItem = {
        id: Date.now().toString(),
        title: bookmarkForm.title,
        url,
        createdAt: new Date()
      };
      setBookmarks(prev => [newBookmark, ...prev]);
    }
    resetForms();
  };

  // Poem handlers
  const handlePoemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!poemForm.title.trim() || !poemForm.content.trim()) return;

    if (editingId) {
      setPoems(prev => prev.map(poem => 
        poem.id === editingId 
          ? { ...poem, title: poemForm.title, content: poemForm.content }
          : poem
      ));
    } else {
      const newPoem: Poem = {
        id: Date.now().toString(),
        title: poemForm.title,
        content: poemForm.content,
        createdAt: new Date(),
        likes: 0
      };
      setPoems(prev => [newPoem, ...prev]);
    }
    resetForms();
  };

  // Video handlers
  const handleVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoForm.title.trim() || !videoForm.url.trim()) return;

    if (editingId) {
      setVideos(prev => prev.map(video => 
        video.id === editingId 
          ? { ...video, title: videoForm.title, url: videoForm.url, embedUrl: getEmbedUrl(videoForm.url) }
          : video
      ));
    } else {
      const newVideo: VideoItem = {
        id: Date.now().toString(),
        title: videoForm.title,
        url: videoForm.url,
        embedUrl: getEmbedUrl(videoForm.url),
        createdAt: new Date()
      };
      setVideos(prev => [newVideo, ...prev]);
    }
    resetForms();
  };

  // Note handlers
  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteForm.title.trim()) return;

    const noteData = {
      title: noteForm.title,
      content: noteForm.content,
      type: noteForm.type,
      dueDate: noteForm.dueDate ? new Date(noteForm.dueDate) : undefined,
      completed: noteForm.type === 'task' ? false : undefined
    };

    if (editingId) {
      setNotes(prev => prev.map(note => 
        note.id === editingId ? { ...note, ...noteData } : note
      ));
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        ...noteData,
        createdAt: new Date()
      };
      setNotes(prev => [newNote, ...prev]);
    }
    resetForms();
  };

  const handleEdit = (item: any, type: ContentType) => {
    setEditingId(item.id);
    setIsAdding(true);
    
    switch (type) {
      case 'bookmarks':
        setBookmarkForm({ title: item.title, url: item.url });
        break;
      case 'poems':
        setPoemForm({ title: item.title, content: item.content });
        break;
      case 'videos':
        setVideoForm({ title: item.title, url: item.url });
        break;
      case 'notes':
        setNoteForm({
          title: item.title,
          content: item.content,
          type: item.type,
          dueDate: item.dueDate ? item.dueDate.toISOString().split('T')[0] : ''
        });
        break;
    }
  };

  const handleDelete = (id: string, type: ContentType) => {
    switch (type) {
      case 'bookmarks':
        setBookmarks(prev => prev.filter(item => item.id !== id));
        break;
      case 'poems':
        setPoems(prev => prev.filter(item => item.id !== id));
        break;
      case 'videos':
        setVideos(prev => prev.filter(item => item.id !== id));
        break;
      case 'notes':
        setNotes(prev => prev.filter(item => item.id !== id));
        break;
    }
  };

  const handleLike = (id: string) => {
    setPoems(prev => prev.map(poem => 
      poem.id === id ? { ...poem, likes: poem.likes + 1 } : poem
    ));
  };

  const toggleTask = (id: string) => {
    setNotes(prev => prev.map(note => 
      note.id === id ? { ...note, completed: !note.completed } : note
    ));
  };

  const isOverdue = (note: Note) => {
    return note.type === 'task' && note.dueDate && !note.completed && note.dueDate < new Date();
  };

  const tabs = [
    { id: 'bookmarks' as ContentType, label: 'Bookmarks', icon: Bookmark, count: bookmarks.length },
    { id: 'poems' as ContentType, label: 'Poems', icon: FileText, count: poems.length },
    { id: 'videos' as ContentType, label: 'Videos', icon: Video, count: videos.length },
    { id: 'notes' as ContentType, label: 'Notes & Tasks', icon: StickyNote, count: notes.length }
  ];

  const renderForm = () => {
    if (!isAdding) return null;

    switch (activeTab) {
      case 'bookmarks':
        return (
          <form onSubmit={handleBookmarkSubmit} className="mb-6 p-4 bg-glass rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Bookmark title"
                value={bookmarkForm.title}
                onChange={(e) => setBookmarkForm(prev => ({ ...prev, title: e.target.value }))}
                className="px-4 py-2 bg-glass border border-primary/30 rounded-lg text-secondary placeholder-muted focus:outline-none focus:border-primary transition-all"
                required
              />
              <input
                type="url"
                placeholder="https://example.com"
                value={bookmarkForm.url}
                onChange={(e) => setBookmarkForm(prev => ({ ...prev, url: e.target.value }))}
                className="px-4 py-2 bg-glass border border-primary/30 rounded-lg text-secondary placeholder-muted focus:outline-none focus:border-primary transition-all"
                required
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-lg hover:scale-105 transition-all">
                {editingId ? 'Update' : 'Save'}
              </button>
              <button type="button" onClick={resetForms} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:scale-105 transition-all">
                Cancel
              </button>
            </div>
          </form>
        );

      case 'poems':
        return (
          <form onSubmit={handlePoemSubmit} className="mb-6 p-4 bg-glass rounded-lg">
            <input
              type="text"
              placeholder="Poem title"
              value={poemForm.title}
              onChange={(e) => setPoemForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 mb-4 bg-glass border border-primary/30 rounded-lg text-secondary placeholder-muted focus:outline-none focus:border-primary transition-all"
              required
            />
            <textarea
              placeholder="Write your poem here..."
              value={poemForm.content}
              onChange={(e) => setPoemForm(prev => ({ ...prev, content: e.target.value }))}
              rows={8}
              className="w-full px-4 py-2 mb-4 bg-glass border border-primary/30 rounded-lg text-secondary placeholder-muted focus:outline-none focus:border-primary transition-all resize-none"
              required
            />
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-lg hover:scale-105 transition-all">
                {editingId ? 'Update' : 'Publish'}
              </button>
              <button type="button" onClick={resetForms} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:scale-105 transition-all">
                Cancel
              </button>
            </div>
          </form>
        );

      case 'videos':
        return (
          <form onSubmit={handleVideoSubmit} className="mb-6 p-4 bg-glass rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Video title"
                value={videoForm.title}
                onChange={(e) => setVideoForm(prev => ({ ...prev, title: e.target.value }))}
                className="px-4 py-2 bg-glass border border-primary/30 rounded-lg text-secondary placeholder-muted focus:outline-none focus:border-primary transition-all"
                required
              />
              <input
                type="url"
                placeholder="YouTube or Vimeo URL"
                value={videoForm.url}
                onChange={(e) => setVideoForm(prev => ({ ...prev, url: e.target.value }))}
                className="px-4 py-2 bg-glass border border-primary/30 rounded-lg text-secondary placeholder-muted focus:outline-none focus:border-primary transition-all"
                required
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-lg hover:scale-105 transition-all">
                {editingId ? 'Update' : 'Add Video'}
              </button>
              <button type="button" onClick={resetForms} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:scale-105 transition-all">
                Cancel
              </button>
            </div>
          </form>
        );

      case 'notes':
        return (
          <form onSubmit={handleNoteSubmit} className="mb-6 p-4 bg-glass rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Title"
                value={noteForm.title}
                onChange={(e) => setNoteForm(prev => ({ ...prev, title: e.target.value }))}
                className="px-4 py-2 bg-glass border border-primary/30 rounded-lg text-secondary placeholder-muted focus:outline-none focus:border-primary transition-all"
                required
              />
              <select
                value={noteForm.type}
                onChange={(e) => setNoteForm(prev => ({ ...prev, type: e.target.value as 'note' | 'task' }))}
                className="px-4 py-2 bg-glass border border-primary/30 rounded-lg text-secondary focus:outline-none focus:border-primary transition-all"
              >
                <option value="note">Note</option>
                <option value="task">Task</option>
              </select>
            </div>
            
            {noteForm.type === 'task' && (
              <input
                type="date"
                value={noteForm.dueDate}
                onChange={(e) => setNoteForm(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-4 py-2 mb-4 bg-glass border border-primary/30 rounded-lg text-secondary focus:outline-none focus:border-primary transition-all"
              />
            )}
            
            <textarea
              placeholder="Content (optional)"
              value={noteForm.content}
              onChange={(e) => setNoteForm(prev => ({ ...prev, content: e.target.value }))}
              rows={4}
              className="w-full px-4 py-2 mb-4 bg-glass border border-primary/30 rounded-lg text-secondary placeholder-muted focus:outline-none focus:border-primary transition-all resize-none"
            />
            
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-lg hover:scale-105 transition-all">
                {editingId ? 'Update' : 'Save'}
              </button>
              <button type="button" onClick={resetForms} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:scale-105 transition-all">
                Cancel
              </button>
            </div>
          </form>
        );

      default:
        return null;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'bookmarks':
        return (
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
                    <h3 className="font-semibold text-secondary truncate mb-1">{bookmark.title}</h3>
                    <p className="text-sm text-muted truncate mb-2">{bookmark.url}</p>
                    <p className="text-xs text-muted">{bookmark.createdAt.toLocaleDateString()}</p>
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
                    onClick={() => handleEdit(bookmark, 'bookmarks')}
                    className="p-2 bg-primary text-white rounded-lg hover:scale-105 transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(bookmark.id, 'bookmarks')}
                    className="p-2 bg-red-500 text-white rounded-lg hover:scale-105 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        );

      case 'poems':
        return (
          <div className="space-y-6">
            {poems.map(poem => (
              <div key={poem.id} className="p-6 bg-glass rounded-lg hover:bg-glass-hover transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-secondary mb-2">{poem.title}</h3>
                    <p className="text-sm text-muted">{poem.createdAt.toLocaleDateString()} • {poem.likes} likes</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleLike(poem.id)}
                      className="p-2 bg-red-500 text-white rounded-lg hover:scale-105 transition-all"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(poem, 'poems')}
                      className="p-2 bg-primary text-white rounded-lg hover:scale-105 transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(poem.id, 'poems')}
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
        );

      case 'videos':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map(video => (
              <div key={video.id} className="bg-glass rounded-lg overflow-hidden hover:bg-glass-hover transition-all group">
                <div className="aspect-video bg-gray-200 relative">
                  <iframe
                    src={video.embedUrl}
                    title={video.title}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-secondary truncate mb-2">{video.title}</h3>
                      <p className="text-sm text-muted">{video.createdAt.toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(video, 'videos')}
                        className="p-2 bg-primary text-white rounded-lg hover:scale-105 transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(video.id, 'videos')}
                        className="p-2 bg-red-500 text-white rounded-lg hover:scale-105 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'notes':
        return (
          <div className="space-y-4">
            {notes.map(note => (
              <div 
                key={note.id} 
                className={`p-4 rounded-lg transition-all group ${
                  note.type === 'task' && note.completed
                    ? 'bg-green-100/20'
                    : isOverdue(note)
                    ? 'bg-red-100/20'
                    : 'bg-glass hover:bg-glass-hover'
                }`}
              >
                <div className="flex items-start gap-3">
                  {note.type === 'task' && (
                    <button
                      onClick={() => toggleTask(note.id)}
                      className={`mt-1 p-1 rounded transition-all ${
                        note.completed
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
                        note.type === 'task' && note.completed ? 'line-through opacity-60' : ''
                      }`}>
                        {note.title}
                      </h3>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(note, 'notes')}
                          className="p-2 bg-primary text-white rounded-lg hover:scale-105 transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(note.id, 'notes')}
                          className="p-2 bg-red-500 text-white rounded-lg hover:scale-105 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {note.content && (
                      <p className={`text-muted mb-2 ${
                        note.type === 'task' && note.completed ? 'line-through opacity-60' : ''
                      }`}>
                        {note.content}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-muted">
                      <span className="flex items-center gap-1">
                        {note.type === 'note' ? <FileText className="w-4 h-4" /> : <CheckSquare className="w-4 h-4" />}
                        {note.type}
                      </span>
                      
                      {note.dueDate && (
                        <span className={`flex items-center gap-1 ${
                          isOverdue(note) ? 'text-red-500' : ''
                        }`}>
                          <Calendar className="w-4 h-4" />
                          {note.dueDate.toLocaleDateString()}
                        </span>
                      )}
                      
                      <span>{note.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const getEmptyMessage = () => {
    const messages = {
      bookmarks: 'No bookmarks yet. Add your first bookmark!',
      poems: 'No poems yet. Write your first poem!',
      videos: 'No videos yet. Add your first video!',
      notes: 'No notes or tasks yet. Create your first item!'
    };
    return messages[activeTab];
  };

  const getCurrentData = () => {
    const data = {
      bookmarks,
      poems,
      videos,
      notes
    };
    return data[activeTab];
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="orbitron text-2xl font-bold text-primary">Content Hub</h1>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-primary-dark 
                     text-white rounded-full golden-glow transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add {activeTab.slice(0, -1)}</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  resetForms();
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-primary to-primary-dark text-white golden-glow'
                    : 'bg-glass text-secondary hover:bg-glass-hover'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{tab.count}</span>
              </button>
            );
          })}
        </div>

        {renderForm()}

        {getCurrentData().length > 0 ? (
          renderContent()
        ) : (
          <div className="text-center py-12">
            {tabs.find(tab => tab.id === activeTab)?.icon && (
              React.createElement(tabs.find(tab => tab.id === activeTab)!.icon, {
                className: "w-16 h-16 text-muted mx-auto mb-4"
              })
            )}
            <p className="text-muted">{getEmptyMessage()}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentPage;