import React, { useState } from 'react';
import { Plus, Settings, RefreshCw, Bell, X } from 'lucide-react';

const FloatingActionButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { icon: RefreshCw, label: 'Refresh Data', color: 'from-blue-400 to-blue-600' },
    { icon: Bell, label: 'Notifications', color: 'from-purple-400 to-purple-600' },
    { icon: Settings, label: 'Settings', color: 'from-gray-400 to-gray-600' }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Action Buttons */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 space-y-3">
          {actions.map((action, index) => (
            <div
              key={index}
              className="flex items-center gap-3 transform transition-all duration-300"
              style={{
                transform: `translateY(${isOpen ? 0 : 20}px)`,
                opacity: isOpen ? 1 : 0,
                transitionDelay: `${index * 100}ms`
              }}
            >
              <span className="bg-white/90 backdrop-filter backdrop-blur-sm px-3 py-1 
                             rounded-full text-sm font-medium text-gray-700 whitespace-nowrap
                             shadow-lg border border-yellow-300/30">
                {action.label}
              </span>
              <button
                className={`p-3 rounded-full bg-gradient-to-r ${action.color} text-white
                          shadow-lg hover:scale-110 transition-all golden-glow`}
                onClick={() => {
                  // Handle action click
                  console.log(`Clicked: ${action.label}`);
                  setIsOpen(false);
                }}
              >
                <action.icon className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white
                 shadow-xl hover:scale-110 transition-all golden-glow relative overflow-hidden"
      >
        <div className="absolute inset-0 rounded-full shimmer" />
        {isOpen ? (
          <X className="w-6 h-6 relative z-10" />
        ) : (
          <Plus className="w-6 h-6 relative z-10" />
        )}
      </button>
    </div>
  );
};

export default FloatingActionButton;