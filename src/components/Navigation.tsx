import React from 'react';
import { Home, FileText, User, Settings, Zap, Keyboard } from 'lucide-react';
import { PageType } from '../App';

interface NavigationProps {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, setCurrentPage }) => {
  const navItems = [
    { id: 'dashboard' as PageType, label: 'Dashboard', icon: Home },
    { id: 'content' as PageType, label: 'Content Hub', icon: FileText },
    { id: 'cultivation' as PageType, label: 'Cultivation', icon: Zap },
    { id: 'typing' as PageType, label: 'Typing Games', icon: Keyboard },
    { id: 'profile' as PageType, label: 'Profile', icon: User },
    { id: 'settings' as PageType, label: 'Settings', icon: Settings }
  ];

  return (
    <nav className="glass-panel mx-4 mb-4 p-4">
      <div className="flex flex-wrap justify-center gap-2">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all hover:scale-105 ${
                isActive 
                  ? 'bg-gradient-to-r from-primary to-primary-dark text-white golden-glow' 
                  : 'bg-glass text-secondary hover:bg-glass-hover'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;