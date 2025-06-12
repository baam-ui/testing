import React, { useState, useEffect } from 'react';
import { User, Settings, Edit2, Save, X } from 'lucide-react';
import { PageType } from '../App';

interface UserProfile {
  name: string;
  bio: string;
  avatar: string;
}

interface HeaderProps {
  setCurrentPage: (page: PageType) => void;
}

const Header: React.FC<HeaderProps> = ({ setCurrentPage }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : { name: 'Baam', bio: '', avatar: '' };
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userProfile.name);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      const updatedProfile = { ...userProfile, name: tempName.trim() };
      setUserProfile(updatedProfile);
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      setIsEditingName(false);
    }
  };

  const handleCancelEdit = () => {
    setTempName(userProfile.name);
    setIsEditingName(false);
  };

  return (
    <header className="glass-panel m-4 p-6 transition-all">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Time and Date */}
        <div className="text-center lg:text-left">
          <h1 className="orbitron text-2xl lg:text-3xl font-bold text-primary mb-1">
            {formatTime(currentTime)}
          </h1>
          <p className="text-secondary text-sm lg:text-base">
            {formatDate(currentTime)}
          </p>
        </div>

        {/* User Greeting and Controls */}
        <div className="flex items-center gap-4">
          <div className="text-center lg:text-right">
            <div className="flex items-center gap-2 justify-center lg:justify-end">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="px-3 py-1 bg-glass border border-primary/30 rounded-lg text-primary 
                             focus:outline-none focus:border-primary transition-all text-lg font-semibold orbitron"
                    onKeyPress={(e) => e.key === 'Enter' && handleSaveName()}
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1 text-green-500 hover:scale-110 transition-all"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-1 text-red-500 hover:scale-110 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="orbitron text-lg font-semibold text-primary">
                    {getGreeting()}, {userProfile.name}
                  </p>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-1 text-primary hover:scale-110 transition-all opacity-60 hover:opacity-100"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-muted text-sm">Ready to conquer the day?</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage('profile')}
              className="p-3 rounded-full bg-gradient-to-r from-primary to-primary-dark 
                       text-white golden-glow transition-all hover:scale-110"
            >
              {userProfile.avatar ? (
                <img 
                  src={userProfile.avatar} 
                  alt="Profile" 
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <User className="w-5 h-5" />
              )}
            </button>
            
            <button 
              onClick={() => setCurrentPage('settings')}
              className="p-3 rounded-full bg-glass border border-primary/30 
                       text-primary hover:bg-glass-hover transition-all hover:scale-110"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;