import React, { useState, useEffect } from 'react';
import { Video, Plus, Trash2, Play } from 'lucide-react';

interface VideoItem {
  id: string;
  title: string;
  url: string;
  embedUrl: string;
  createdAt: Date;
}

const VideosPage: React.FC = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ title: '', url: '' });

  useEffect(() => {
    const saved = localStorage.getItem('videos');
    if (saved) {
      const parsed = JSON.parse(saved);
      setVideos(parsed.map((v: any) => ({ ...v, createdAt: new Date(v.createdAt) })));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('videos', JSON.stringify(videos));
  }, [videos]);

  const getEmbedUrl = (url: string): string => {
    // YouTube
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    // Vimeo
    const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    return url;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.url.trim()) return;

    const newVideo: VideoItem = {
      id: Date.now().toString(),
      title: formData.title,
      url: formData.url,
      embedUrl: getEmbedUrl(formData.url),
      createdAt: new Date()
    };

    setVideos(prev => [newVideo, ...prev]);
    setFormData({ title: '', url: '' });
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    setVideos(prev => prev.filter(video => video.id !== id));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="glass-panel p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Video className="w-6 h-6 text-primary" />
            <h1 className="orbitron text-2xl font-bold text-primary">Videos</h1>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-primary-dark 
                     text-white rounded-full golden-glow transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Video</span>
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-glass rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Video title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="px-4 py-2 bg-glass border border-primary/30 
                         rounded-lg text-secondary placeholder-muted 
                         focus:outline-none focus:border-primary transition-all"
                required
              />
              <input
                type="url"
                placeholder="YouTube or Vimeo URL"
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
                Add Video
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setFormData({ title: '', url: '' });
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:scale-105 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

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
                    <h3 className="font-semibold text-secondary truncate mb-2">
                      {video.title}
                    </h3>
                    <p className="text-sm text-muted">
                      {video.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(video.id)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:scale-105 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {videos.length === 0 && (
          <div className="text-center py-12">
            <Video className="w-16 h-16 text-muted mx-auto mb-4" />
            <p className="text-muted">No videos yet. Add your first video!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideosPage;