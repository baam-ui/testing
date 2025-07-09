import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SchedulePanel from './components/SchedulePanel';
import ParticleBackground from './components/ParticleBackground';
import FloatingActionButton from './components/FloatingActionButton';
import Navigation from './components/Navigation';
import ContentPage from './components/ContentPage';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import CultivationGame from './components/CultivationGame';
import TypingGamesPage from './components/TypingGamesPage';
import CalculatorPage from './components/CalculatorPage';

export type PageType = 'dashboard' | 'content' | 'profile' | 'settings' | 'cultivation' | 'typing' | 'calculator';
export type ThemeType = 'peach' | 'ocean' | 'forest' | 'sunset' | 'midnight' | 'lavender' | 'crimson' | 'emerald' | 'sapphire' | 'amethyst' | 'golden' | 'silver' | 'cosmic' | 'phoenix' | 'dragon' | 'celestial' | 'void' | 'eternal' | 'divine' | 'primordial' | 'chaos' | 'omnipotent';
export type FontType = 'inter' | 'orbitron' | 'poppins' | 'roboto' | 'playfair' | 'montserrat' | 'lato' | 'opensans' | 'nunito' | 'raleway' | 'merriweather' | 'sourcecodepro';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as ThemeType) || 'peach';
  });
  const [currentFont, setCurrentFont] = useState<FontType>(() => {
    const saved = localStorage.getItem('font');
    return (saved as FontType) || 'inter';
  });

  // Get unlocked themes from cultivation progress
  const getUnlockedThemes = (): ThemeType[] => {
    const cultivationData = localStorage.getItem('cultivationGame');
    if (!cultivationData) return ['peach', 'ocean', 'forest', 'sunset', 'midnight', 'lavender'];
    
    const { player } = JSON.parse(cultivationData);
    const baseThemes: ThemeType[] = ['peach', 'ocean', 'forest', 'sunset', 'midnight', 'lavender'];
    const cultivationThemes: ThemeType[] = ['crimson', 'emerald', 'sapphire', 'amethyst', 'golden', 'silver', 'cosmic', 'phoenix', 'dragon', 'celestial', 'void', 'eternal', 'divine', 'primordial', 'chaos', 'omnipotent'];
    
    // Unlock themes based on realm (starting from realm 1)
    const unlockedCultivationThemes = cultivationThemes.slice(0, Math.max(0, player.realm - 1));
    
    return [...baseThemes, ...unlockedCultivationThemes];
  };

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    localStorage.setItem('theme', currentTheme);
    localStorage.setItem('font', currentFont);
    
    // Apply theme and font classes
    document.documentElement.className = '';
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
    document.documentElement.classList.add(`theme-${currentTheme}`);
    document.documentElement.classList.add(`font-${currentFont}`);
  }, [isDarkMode, currentTheme, currentFont]);

  const renderPage = () => {
    switch (currentPage) {
      case 'content':
        return <ContentPage />;
      case 'profile':
        return <ProfilePage />;
      case 'cultivation':
        return <CultivationGame />;
      case 'typing':
        return <TypingGamesPage />;
      case 'calculator':
        return <CalculatorPage />;
      case 'settings':
        return <SettingsPage 
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          currentTheme={currentTheme}
          setCurrentTheme={setCurrentTheme}
          currentFont={currentFont}
          setCurrentFont={setCurrentFont}
          unlockedThemes={getUnlockedThemes()}
        />;
      default:
        return (
          <main className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <SchedulePanel />
            </div>
          </main>
        );
    }
  };

  return (
    <div className="min-h-screen relative transition-colors duration-300">
      <ParticleBackground />
      
      <div className="relative z-10">
        <Header 
          setCurrentPage={setCurrentPage}
        />
        <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
        
        {renderPage()}
      </div>
      
      <FloatingActionButton />
    </div>
  );
}

export default App;