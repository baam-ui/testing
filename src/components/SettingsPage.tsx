import React, { useState } from 'react';
import { Settings, Palette, Moon, Sun, Monitor, Smartphone, Bell, Shield, Database, Info, Lock, Type } from 'lucide-react';
import { ThemeType, FontType } from '../App';

interface SettingsPageProps {
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  currentTheme: ThemeType;
  setCurrentTheme: (theme: ThemeType) => void;
  currentFont: FontType;
  setCurrentFont: (font: FontType) => void;
  unlockedThemes: ThemeType[];
}

const SettingsPage: React.FC<SettingsPageProps> = ({
  isDarkMode,
  setIsDarkMode,
  currentTheme,
  setCurrentTheme,
  currentFont,
  setCurrentFont,
  unlockedThemes
}) => {
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : {
      schedule: true,
      tasks: false
    };
  });

  const themes = [
    // Base themes (always unlocked)
    { 
      id: 'peach' as ThemeType, 
      name: 'Peach Gold', 
      description: 'Warm peach backgrounds with golden accents',
      colors: ['#FFF5EE', '#FFD700'],
      realm: 'Mortal'
    },
    { 
      id: 'ocean' as ThemeType, 
      name: 'Ocean Blue', 
      description: 'Cool blue tones with sky blue accents',
      colors: ['#E0F6FF', '#00BFFF'],
      realm: 'Mortal'
    },
    { 
      id: 'forest' as ThemeType, 
      name: 'Forest Green', 
      description: 'Natural green palette with lime accents',
      colors: ['#F0FFF0', '#32CD32'],
      realm: 'Mortal'
    },
    { 
      id: 'sunset' as ThemeType, 
      name: 'Sunset Orange', 
      description: 'Vibrant orange and purple sunset vibes',
      colors: ['#FFE5B4', '#FF6B35'],
      realm: 'Mortal'
    },
    { 
      id: 'midnight' as ThemeType, 
      name: 'Midnight Purple', 
      description: 'Deep purple with cosmic energy',
      colors: ['#240046', '#9D4EDD'],
      realm: 'Mortal'
    },
    { 
      id: 'lavender' as ThemeType, 
      name: 'Lavender Dream', 
      description: 'Soft lavender with elegant purple tones',
      colors: ['#F3E8FF', '#8B5CF6'],
      realm: 'Mortal'
    },
    // Cultivation themes (unlocked by realm)
    { 
      id: 'crimson' as ThemeType, 
      name: 'Crimson Flame', 
      description: 'Fierce red flames of cultivation',
      colors: ['#FFE4E1', '#DC143C'],
      realm: 'Qi Refining'
    },
    { 
      id: 'emerald' as ThemeType, 
      name: 'Emerald Jade', 
      description: 'Pure jade energy of nature',
      colors: ['#F0FFF0', '#50C878'],
      realm: 'Foundation Establishment'
    },
    { 
      id: 'sapphire' as ThemeType, 
      name: 'Sapphire Sky', 
      description: 'Deep blue wisdom of the heavens',
      colors: ['#E6F3FF', '#0F52BA'],
      realm: 'Core Formation'
    },
    { 
      id: 'amethyst' as ThemeType, 
      name: 'Amethyst Spirit', 
      description: 'Purple spiritual energy awakened',
      colors: ['#F3E5F5', '#9966CC'],
      realm: 'Nascent Soul'
    },
    { 
      id: 'golden' as ThemeType, 
      name: 'Golden Core', 
      description: 'Radiant golden core energy',
      colors: ['#FFFACD', '#FFD700'],
      realm: 'Soul Transformation'
    },
    { 
      id: 'silver' as ThemeType, 
      name: 'Silver Moon', 
      description: 'Ethereal silver moonlight',
      colors: ['#F8F8FF', '#C0C0C0'],
      realm: 'Void Refinement'
    },
    { 
      id: 'cosmic' as ThemeType, 
      name: 'Cosmic Void', 
      description: 'Deep space cosmic energy',
      colors: ['#191970', '#4B0082'],
      realm: 'Body Integration'
    },
    { 
      id: 'phoenix' as ThemeType, 
      name: 'Phoenix Fire', 
      description: 'Rebirth flames of the phoenix',
      colors: ['#FF4500', '#FF6347'],
      realm: 'Mahayana'
    },
    { 
      id: 'dragon' as ThemeType, 
      name: 'Dragon Scale', 
      description: 'Ancient dragon power',
      colors: ['#2F4F4F', '#008B8B'],
      realm: 'Tribulation Transcendence'
    },
    { 
      id: 'celestial' as ThemeType, 
      name: 'Celestial Light', 
      description: 'Divine celestial radiance',
      colors: ['#F0F8FF', '#87CEEB'],
      realm: 'Earth Immortal'
    },
    { 
      id: 'void' as ThemeType, 
      name: 'Void Emperor', 
      description: 'Mastery over the endless void',
      colors: ['#000000', '#483D8B'],
      realm: 'Heaven Immortal'
    },
    { 
      id: 'eternal' as ThemeType, 
      name: 'Eternal Flame', 
      description: 'Flames that burn for eternity',
      colors: ['#FF1493', '#FF69B4'],
      realm: 'Mystic Immortal'
    },
    { 
      id: 'divine' as ThemeType, 
      name: 'Divine Aura', 
      description: 'Pure divine energy manifestation',
      colors: ['#FFFAF0', '#DAA520'],
      realm: 'Golden Immortal'
    },
    { 
      id: 'primordial' as ThemeType, 
      name: 'Primordial Chaos', 
      description: 'Energy from the beginning of time',
      colors: ['#2F2F2F', '#8A2BE2'],
      realm: 'Taiyi Golden Immortal'
    },
    { 
      id: 'chaos' as ThemeType, 
      name: 'Chaos Lord', 
      description: 'Master of primordial chaos',
      colors: ['#1C1C1C', '#FF00FF'],
      realm: 'Daluo Golden Immortal'
    },
    { 
      id: 'omnipotent' as ThemeType, 
      name: 'Omnipotent Dao', 
      description: 'One with the eternal Dao',
      colors: ['#FFFFFF', '#000000'],
      realm: 'Omnipotent Dao'
    }
  ];

  const fonts = [
    { id: 'inter' as FontType, name: 'Inter', description: 'Clean and modern sans-serif', category: 'Sans-serif' },
    { id: 'orbitron' as FontType, name: 'Orbitron', description: 'Futuristic and tech-inspired', category: 'Display' },
    { id: 'poppins' as FontType, name: 'Poppins', description: 'Friendly and approachable', category: 'Sans-serif' },
    { id: 'roboto' as FontType, name: 'Roboto', description: 'Google\'s signature font', category: 'Sans-serif' },
    { id: 'playfair' as FontType, name: 'Playfair Display', description: 'Elegant and sophisticated', category: 'Serif' },
    { id: 'montserrat' as FontType, name: 'Montserrat', description: 'Urban and contemporary', category: 'Sans-serif' },
    { id: 'lato' as FontType, name: 'Lato', description: 'Humanist and warm', category: 'Sans-serif' },
    { id: 'opensans' as FontType, name: 'Open Sans', description: 'Neutral and readable', category: 'Sans-serif' },
    { id: 'nunito' as FontType, name: 'Nunito', description: 'Rounded and friendly', category: 'Sans-serif' },
    { id: 'raleway' as FontType, name: 'Raleway', description: 'Stylish and elegant', category: 'Sans-serif' },
    { id: 'merriweather' as FontType, name: 'Merriweather', description: 'Readable serif for text', category: 'Serif' },
    { id: 'sourcecodepro' as FontType, name: 'Source Code Pro', description: 'Monospace for code', category: 'Monospace' }
  ];

  const handleNotificationChange = (key: string, value: boolean) => {
    const updated = { ...notifications, [key]: value };
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      const keysToKeep = ['darkMode', 'theme', 'font', 'userProfile'];
      const allKeys = Object.keys(localStorage);
      
      allKeys.forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });
      
      alert('All data cleared successfully!');
      window.location.reload();
    }
  };

  const isThemeUnlocked = (themeId: ThemeType) => {
    return unlockedThemes.includes(themeId);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="glass-panel p-6">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-6 h-6 text-primary" />
            <h1 className="orbitron text-2xl font-bold text-primary">Settings</h1>
          </div>
          <p className="text-muted">Customize your dashboard experience</p>
        </div>

        {/* Appearance Settings */}
        <div className="glass-panel p-6">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="w-5 h-5 text-primary" />
            <h2 className="orbitron text-xl font-semibold text-secondary">Appearance</h2>
          </div>

          {/* Dark Mode Toggle */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-secondary mb-1">Dark Mode</h3>
                <p className="text-sm text-muted">Switch between light and dark themes</p>
              </div>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`relative w-16 h-8 rounded-full transition-all ${
                  isDarkMode ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                  isDarkMode ? 'left-9' : 'left-1'
                }`}>
                  {isDarkMode ? (
                    <Moon className="w-4 h-4 text-primary absolute top-1 left-1" />
                  ) : (
                    <Sun className="w-4 h-4 text-yellow-500 absolute top-1 left-1" />
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Font Selection */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Type className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-secondary">Typography</h3>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fonts.map(font => (
                <button
                  key={font.id}
                  onClick={() => setCurrentFont(font.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    currentFont === font.id 
                      ? 'border-primary bg-primary/10' 
                      : 'border-primary/30 bg-glass hover:bg-glass-hover hover:scale-105'
                  }`}
                >
                  <div className={`font-${font.id} text-lg font-semibold text-secondary mb-1`}>
                    {font.name}
                  </div>
                  <p className="text-sm text-muted mb-1">{font.description}</p>
                  <span className="text-xs text-primary font-semibold">{font.category}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Theme Selection */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-secondary">Color Theme</h3>
              <p className="text-sm text-muted">
                Unlock more themes by advancing in cultivation! ({unlockedThemes.length}/{themes.length} unlocked)
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {themes.map(theme => {
                const isUnlocked = isThemeUnlocked(theme.id);
                return (
                  <button
                    key={theme.id}
                    onClick={() => isUnlocked && setCurrentTheme(theme.id)}
                    disabled={!isUnlocked}
                    className={`p-4 rounded-lg border-2 transition-all relative ${
                      currentTheme === theme.id 
                        ? 'border-primary bg-primary/10' 
                        : isUnlocked
                        ? 'border-primary/30 bg-glass hover:bg-glass-hover hover:scale-105'
                        : 'border-gray-300 bg-gray-100 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {!isUnlocked && (
                      <div className="absolute top-2 right-2">
                        <Lock className="w-4 h-4 text-gray-500" />
                      </div>
                    )}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex gap-1">
                        <div 
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: theme.colors[0] }}
                        />
                        <div 
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: theme.colors[1] }}
                        />
                      </div>
                      <div className="text-left">
                        <h4 className={`font-semibold ${isUnlocked ? 'text-secondary' : 'text-gray-500'}`}>
                          {theme.name}
                        </h4>
                      </div>
                    </div>
                    <p className={`text-sm text-left mb-2 ${isUnlocked ? 'text-muted' : 'text-gray-400'}`}>
                      {theme.description}
                    </p>
                    <p className={`text-xs text-left font-semibold ${
                      isUnlocked ? 'text-primary' : 'text-gray-400'
                    }`}>
                      {isUnlocked ? `Unlocked: ${theme.realm}` : `Requires: ${theme.realm}`}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Notifications Settings */}
        <div className="glass-panel p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="orbitron text-xl font-semibold text-secondary">Notifications</h2>
          </div>

          <div className="space-y-4">
            {[
              { key: 'schedule', label: 'Schedule Reminders', description: 'Reminders for upcoming events' },
              { key: 'tasks', label: 'Task Notifications', description: 'Notifications for due tasks' }
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between p-4 bg-glass rounded-lg">
                <div>
                  <h4 className="font-semibold text-secondary">{item.label}</h4>
                  <p className="text-sm text-muted">{item.description}</p>
                </div>
                <button
                  onClick={() => handleNotificationChange(item.key, !notifications[item.key])}
                  className={`relative w-12 h-6 rounded-full transition-all ${
                    notifications[item.key] ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                    notifications[item.key] ? 'left-7' : 'left-1'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Data Management */}
        <div className="glass-panel p-6">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-5 h-5 text-primary" />
            <h2 className="orbitron text-xl font-semibold text-secondary">Data Management</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-glass rounded-lg">
              <h4 className="font-semibold text-secondary mb-2">Storage Usage</h4>
              <p className="text-sm text-muted mb-3">Your data is stored locally in your browser</p>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
                <span className="text-sm text-muted">25% used</span>
              </div>
            </div>

            <div className="p-4 bg-glass rounded-lg">
              <h4 className="font-semibold text-secondary mb-2">Clear All Data</h4>
              <p className="text-sm text-muted mb-3">Remove all content, cultivation progress, and game data</p>
              <button
                onClick={clearAllData}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
              >
                Clear All Data
              </button>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="glass-panel p-6">
          <div className="flex items-center gap-3 mb-6">
            <Info className="w-5 h-5 text-primary" />
            <h2 className="orbitron text-xl font-semibold text-secondary">About</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-glass rounded-lg">
              <h4 className="font-semibold text-secondary mb-2">SJ Widgets</h4>
              <p className="text-sm text-muted mb-2">Version 3.0.0</p>
              <p className="text-sm text-muted">
                A comprehensive dashboard featuring content management, cultivation games, typing challenges, 
                and extensive customization options with multiple themes and fonts.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Monitor, label: 'Responsive Design' },
                { icon: Shield, label: 'Privacy First' },
                { icon: Palette, label: 'Multiple Themes' },
                { icon: Smartphone, label: 'Mobile Friendly' }
              ].map((feature, index) => (
                <div key={index} className="p-3 bg-glass rounded-lg text-center">
                  <feature.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-xs text-muted">{feature.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;