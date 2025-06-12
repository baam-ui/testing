import React, { useState, useEffect } from 'react';
import { User, Camera, Save, Edit2 } from 'lucide-react';

interface UserProfile {
  name: string;
  bio: string;
  avatar: string;
  joinDate: string;
  stats: {
    bookmarks: number;
    poems: number;
    videos: number;
    notes: number;
  };
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('userProfile');
    const defaultProfile = {
      name: 'Baam',
      bio: 'Welcome to my digital space! I love organizing my thoughts and creative works.',
      avatar: '',
      joinDate: new Date().toISOString(),
      stats: { bookmarks: 0, poems: 0, videos: 0, notes: 0 }
    };
    
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultProfile, ...parsed };
    }
    return defaultProfile;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: profile.name,
    bio: profile.bio,
    avatar: profile.avatar
  });

  useEffect(() => {
    // Calculate stats from localStorage
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    const poems = JSON.parse(localStorage.getItem('poems') || '[]');
    const videos = JSON.parse(localStorage.getItem('videos') || '[]');
    const notesAndTasks = JSON.parse(localStorage.getItem('notesAndTasks') || '[]');

    const updatedProfile = {
      ...profile,
      stats: {
        bookmarks: bookmarks.length,
        poems: poems.length,
        videos: videos.length,
        notes: notesAndTasks.length
      }
    };

    setProfile(updatedProfile);
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
  }, []);

  const handleSave = () => {
    const updatedProfile = {
      ...profile,
      name: editForm.name,
      bio: editForm.bio,
      avatar: editForm.avatar
    };
    
    setProfile(updatedProfile);
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      name: profile.name,
      bio: profile.bio,
      avatar: profile.avatar
    });
    setIsEditing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setEditForm(prev => ({ ...prev, avatar: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="glass-panel p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar Section */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-primary to-primary-dark 
                            flex items-center justify-center overflow-hidden border-4 border-primary/30">
                {profile.avatar ? (
                  <img 
                    src={profile.avatar} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-white" />
                )}
              </div>
              
              {isEditing && (
                <label className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full 
                                cursor-pointer hover:scale-110 transition-all golden-glow">
                  <Camera className="w-4 h-4" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="text-2xl font-bold bg-glass border border-primary/30 rounded-lg px-4 py-2 
                             text-primary focus:outline-none focus:border-primary transition-all w-full md:w-auto"
                  />
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                    className="w-full bg-glass border border-primary/30 rounded-lg px-4 py-2 
                             text-secondary focus:outline-none focus:border-primary transition-all resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              ) : (
                <div>
                  <h1 className="orbitron text-3xl font-bold text-primary mb-2">{profile.name}</h1>
                  <p className="text-secondary mb-4 max-w-md">{profile.bio}</p>
                  <p className="text-muted text-sm">Member since {formatDate(profile.joinDate)}</p>
                </div>
              )}
            </div>

            {/* Edit Button */}
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-400 to-green-600 
                             text-white rounded-full hover:scale-105 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white 
                             rounded-full hover:scale-105 transition-all"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-primary-dark 
                           text-white rounded-full golden-glow hover:scale-105 transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Object.entries(profile.stats).map(([key, value]) => (
            <div key={key} className="glass-panel p-6 text-center hover:scale-105 transition-all">
              <div className="text-3xl font-bold text-primary orbitron mb-2">{value}</div>
              <div className="text-secondary capitalize">{key}</div>
            </div>
          ))}
        </div>

        {/* Activity Summary */}
        <div className="glass-panel p-6">
          <h2 className="orbitron text-xl font-bold text-primary mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {profile.stats.bookmarks > 0 && (
              <div className="flex items-center gap-3 p-3 bg-glass rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-secondary">You have {profile.stats.bookmarks} saved bookmarks</span>
              </div>
            )}
            {profile.stats.poems > 0 && (
              <div className="flex items-center gap-3 p-3 bg-glass rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-secondary">You've written {profile.stats.poems} poems</span>
              </div>
            )}
            {profile.stats.videos > 0 && (
              <div className="flex items-center gap-3 p-3 bg-glass rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-secondary">You have {profile.stats.videos} saved videos</span>
              </div>
            )}
            {profile.stats.notes > 0 && (
              <div className="flex items-center gap-3 p-3 bg-glass rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-secondary">You have {profile.stats.notes} notes and tasks</span>
              </div>
            )}
            
            {Object.values(profile.stats).every(stat => stat === 0) && (
              <div className="text-center py-8">
                <User className="w-16 h-16 text-muted mx-auto mb-4" />
                <p className="text-muted">Start using the dashboard to see your activity here!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;