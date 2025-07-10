import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Heart, Brain, Star, Sparkles, Save, RotateCcw, Play, Pause, Clock, Flame, Shield, Sword, Crown, Eye, Trophy, Gift, Scroll, Gem } from 'lucide-react';

interface Player {
  name: string;
  realm: number;
  level: number;
  experience: number;
  experienceToNext: number;
  health: number;
  maxHealth: number;
  qi: number;
  maxQi: number;
  spiritualPower: number;
  luck: number;
  karma: number;
  cultivationPoints: number;
  lifespan: number;
  maxLifespan: number;
  techniques: string[];
  artifacts: string[];
  pills: { [key: string]: number };
  achievements: string[];
  reincarnations: number;
  lastOnline: number;
  autoCultivating: boolean;
  stats: {
    attack: number;
    defense: number;
    speed: number;
    wisdom: number;
  };
  totalExperience: number;
  breakthroughAttempts: number;
  successfulBreakthroughs: number;
}

interface Realm {
  name: string;
  description: string;
  experienceRequired: number;
  tribulationChance: number;
  lifespanBonus: number;
  statMultiplier: number;
  color: string;
  icon: string;
  unlockMessage: string;
}

interface Encounter {
  id: string;
  title: string;
  description: string;
  choices: {
    text: string;
    karmaChange: number;
    luckChange: number;
    reward?: string;
    risk?: string;
    statBonus?: { [key: string]: number };
    experienceGain?: number;
    pillReward?: string;
  }[];
}

interface Technique {
  id: string;
  name: string;
  description: string;
  cost: number;
  effect: string;
  unlockRealm: number;
  category: 'combat' | 'cultivation' | 'utility' | 'legendary';
}

interface Artifact {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'divine';
  effects: string[];
  unlockRealm: number;
}

const CultivationGame: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [currentEncounter, setCurrentEncounter] = useState<Encounter | null>(null);
  const [gameLog, setGameLog] = useState<string[]>([]);
  const [showTribulation, setShowTribulation] = useState(false);
  const [tribulationProgress, setTribulationProgress] = useState(0);
  const [selectedTab, setSelectedTab] = useState<'stats' | 'techniques' | 'artifacts' | 'achievements' | 'pills'>('stats');
  const [offlineProgress, setOfflineProgress] = useState<{
    timeAway: number;
    experienceGained: number;
    breakthroughs: string[];
    encountersFound: number;
    pillsFound: string[];
  } | null>(null);
  const [showRealmInfo, setShowRealmInfo] = useState(false);
  const [animatingStats, setAnimatingStats] = useState<string[]>([]);

  const realms: Realm[] = [
    { 
      name: "Mortal", 
      description: "An ordinary person beginning their journey into cultivation", 
      experienceRequired: 0, 
      tribulationChance: 0, 
      lifespanBonus: 0, 
      statMultiplier: 1, 
      color: "#8B4513", 
      icon: "👤",
      unlockMessage: "Your cultivation journey begins..."
    },
    { 
      name: "Qi Refining", 
      description: "Learning to sense and gather the mystical energy of Qi", 
      experienceRequired: 100, 
      tribulationChance: 0.1, 
      lifespanBonus: 20, 
      statMultiplier: 1.2, 
      color: "#32CD32", 
      icon: "🌱",
      unlockMessage: "You can now sense the flow of Qi around you!"
    },
    { 
      name: "Foundation Establishment", 
      description: "Building a solid foundation for future cultivation", 
      experienceRequired: 300, 
      tribulationChance: 0.15, 
      lifespanBonus: 50, 
      statMultiplier: 1.5, 
      color: "#4169E1", 
      icon: "🏗️",
      unlockMessage: "Your foundation is now solid as a mountain!"
    },
    { 
      name: "Core Formation", 
      description: "Forming a golden core within your dantian", 
      experienceRequired: 600, 
      tribulationChance: 0.2, 
      lifespanBonus: 100, 
      statMultiplier: 2, 
      color: "#FFD700", 
      icon: "⚡",
      unlockMessage: "A golden core forms within you, radiating power!"
    },
    { 
      name: "Nascent Soul", 
      description: "Birth of the nascent soul, a miniature version of yourself", 
      experienceRequired: 1000, 
      tribulationChance: 0.25, 
      lifespanBonus: 200, 
      statMultiplier: 2.5, 
      color: "#9370DB", 
      icon: "👻",
      unlockMessage: "Your nascent soul awakens, granting spiritual sight!"
    },
    { 
      name: "Soul Transformation", 
      description: "Transforming the very essence of your being", 
      experienceRequired: 1500, 
      tribulationChance: 0.3, 
      lifespanBonus: 300, 
      statMultiplier: 3, 
      color: "#FF69B4", 
      icon: "🔮",
      unlockMessage: "Your soul transforms, becoming one with the Dao!"
    },
    { 
      name: "Void Refinement", 
      description: "Refining yourself in the endless void", 
      experienceRequired: 2200, 
      tribulationChance: 0.35, 
      lifespanBonus: 500, 
      statMultiplier: 4, 
      color: "#2F4F4F", 
      icon: "🌌",
      unlockMessage: "You step into the void and emerge refined!"
    },
    { 
      name: "Body Integration", 
      description: "Perfect unity of body, soul, and spirit", 
      experienceRequired: 3000, 
      tribulationChance: 0.4, 
      lifespanBonus: 700, 
      statMultiplier: 5, 
      color: "#DC143C", 
      icon: "💪",
      unlockMessage: "Body and soul unite in perfect harmony!"
    },
    { 
      name: "Mahayana", 
      description: "The great vehicle to enlightenment", 
      experienceRequired: 4000, 
      tribulationChance: 0.45, 
      lifespanBonus: 1000, 
      statMultiplier: 6, 
      color: "#FF4500", 
      icon: "🚗",
      unlockMessage: "You board the great vehicle to enlightenment!"
    },
    { 
      name: "Tribulation Transcendence", 
      description: "Transcending mortal tribulations through will", 
      experienceRequired: 5500, 
      tribulationChance: 0.5, 
      lifespanBonus: 1500, 
      statMultiplier: 8, 
      color: "#8A2BE2", 
      icon: "⚡",
      unlockMessage: "You transcend tribulations through sheer will!"
    },
    
    // Immortal Realms
    { 
      name: "Earth Immortal", 
      description: "First step into true immortality", 
      experienceRequired: 7500, 
      tribulationChance: 0.55, 
      lifespanBonus: 2000, 
      statMultiplier: 10, 
      color: "#228B22", 
      icon: "🌍",
      unlockMessage: "You achieve immortality and transcend mortality!"
    },
    { 
      name: "Heaven Immortal", 
      description: "Immortal of the heavenly realm", 
      experienceRequired: 10000, 
      tribulationChance: 0.6, 
      lifespanBonus: 3000, 
      statMultiplier: 12, 
      color: "#87CEEB", 
      icon: "☁️",
      unlockMessage: "The heavens acknowledge your ascension!"
    },
    { 
      name: "True Immortal", 
      description: "Achieved true immortality beyond death", 
      experienceRequired: 13500, 
      tribulationChance: 0.62, 
      lifespanBonus: 4500, 
      statMultiplier: 15, 
      color: "#FFE4B5", 
      icon: "✨",
      unlockMessage: "You have achieved true immortality!"
    },
    { 
      name: "Spirit Immortal", 
      description: "Immortal spirit transcending physical form", 
      experienceRequired: 18000, 
      tribulationChance: 0.64, 
      lifespanBonus: 6000, 
      statMultiplier: 18, 
      color: "#E6E6FA", 
      icon: "👻",
      unlockMessage: "Your spirit transcends physical limitations!"
    },
    { 
      name: "Mystic Immortal", 
      description: "Master of mystical arts and ancient secrets", 
      experienceRequired: 13000, 
      tribulationChance: 0.65, 
      lifespanBonus: 4000, 
      statMultiplier: 15, 
      color: "#9932CC", 
      icon: "🔯",
      unlockMessage: "Ancient mysteries reveal themselves to you!"
    },
    { 
      name: "Profound Immortal", 
      description: "Understanding profound mysteries of existence", 
      experienceRequired: 25000, 
      tribulationChance: 0.66, 
      lifespanBonus: 8000, 
      statMultiplier: 22, 
      color: "#4B0082", 
      icon: "🌀",
      unlockMessage: "Profound mysteries of existence unfold before you!"
    },
    { 
      name: "Golden Immortal", 
      description: "Immortal with golden radiance and divine power", 
      experienceRequired: 17000, 
      tribulationChance: 0.7, 
      lifespanBonus: 6000, 
      statMultiplier: 18, 
      color: "#FFD700", 
      icon: "👑",
      unlockMessage: "Golden light emanates from your very being!"
    },
    { 
      name: "Supreme Immortal", 
      description: "Supreme among all immortals", 
      experienceRequired: 35000, 
      tribulationChance: 0.68, 
      lifespanBonus: 12000, 
      statMultiplier: 28, 
      color: "#FF1493", 
      icon: "⭐",
      unlockMessage: "You stand supreme among all immortals!"
    },
    { 
      name: "Taiyi Golden Immortal", 
      description: "Supreme golden immortal of the highest order", 
      experienceRequired: 22000, 
      tribulationChance: 0.75, 
      lifespanBonus: 8000, 
      statMultiplier: 22, 
      color: "#FF8C00", 
      icon: "🌟",
      unlockMessage: "You achieve the supreme golden immortal state!"
    },
    { 
      name: "Xuanxian Immortal", 
      description: "Mysterious immortal beyond comprehension", 
      experienceRequired: 50000, 
      tribulationChance: 0.72, 
      lifespanBonus: 15000, 
      statMultiplier: 35, 
      color: "#8B008B", 
      icon: "🔮",
      unlockMessage: "You become a mysterious immortal beyond comprehension!"
    },
    { 
      name: "Daluo Golden Immortal", 
      description: "Transcendent golden immortal beyond time", 
      experienceRequired: 28000, 
      tribulationChance: 0.8, 
      lifespanBonus: 12000, 
      statMultiplier: 28, 
      color: "#FF6347", 
      icon: "✨",
      unlockMessage: "You transcend time itself!"
    },
    
    // Saint Realms
    { 
      name: "Quasi-Saint Early", 
      description: "Early stage quasi-saint power", 
      experienceRequired: 70000, 
      tribulationChance: 0.75, 
      lifespanBonus: 20000, 
      statMultiplier: 45, 
      color: "#F0E68C", 
      icon: "😇",
      unlockMessage: "You enter the early stage of quasi-sainthood!"
    },
    { 
      name: "Quasi-Saint Middle", 
      description: "Middle stage quasi-saint mastery", 
      experienceRequired: 95000, 
      tribulationChance: 0.78, 
      lifespanBonus: 25000, 
      statMultiplier: 55, 
      color: "#DDA0DD", 
      icon: "🌟",
      unlockMessage: "Your quasi-saint mastery reaches the middle stage!"
    },
    { 
      name: "Quasi-Saint Late", 
      description: "Late stage quasi-saint perfection", 
      experienceRequired: 125000, 
      tribulationChance: 0.82, 
      lifespanBonus: 30000, 
      statMultiplier: 65, 
      color: "#FFB6C1", 
      icon: "💫",
      unlockMessage: "You perfect the late stage of quasi-sainthood!"
    },
    { 
      name: "Quasi-Saint", 
      description: "Almost a saint, standing at the threshold", 
      experienceRequired: 35000, 
      tribulationChance: 0.85, 
      lifespanBonus: 15000, 
      statMultiplier: 35, 
      color: "#F0E68C", 
      icon: "😇",
      unlockMessage: "You stand at the threshold of sainthood!"
    },
    { 
      name: "Saint Early", 
      description: "Early stage saint with divine power", 
      experienceRequired: 160000, 
      tribulationChance: 0.85, 
      lifespanBonus: 40000, 
      statMultiplier: 80, 
      color: "#FFFACD", 
      icon: "👼",
      unlockMessage: "You achieve early stage sainthood with divine power!"
    },
    { 
      name: "Saint Middle", 
      description: "Middle stage saint commanding respect", 
      experienceRequired: 200000, 
      tribulationChance: 0.87, 
      lifespanBonus: 50000, 
      statMultiplier: 100, 
      color: "#F5F5DC", 
      icon: "🕊️",
      unlockMessage: "Your sainthood commands universal respect!"
    },
    { 
      name: "Saint Late", 
      description: "Late stage saint approaching perfection", 
      experienceRequired: 250000, 
      tribulationChance: 0.89, 
      lifespanBonus: 60000, 
      statMultiplier: 120, 
      color: "#FFEFD5", 
      icon: "🌅",
      unlockMessage: "You approach the perfection of sainthood!"
    },
    { 
      name: "Saint", 
      description: "A true saint of cultivation, revered by all", 
      experienceRequired: 45000, 
      tribulationChance: 0.9, 
      lifespanBonus: 20000, 
      statMultiplier: 45, 
      color: "#FFFFFF", 
      icon: "👼",
      unlockMessage: "You achieve sainthood! All beings revere you!"
    },
    { 
      name: "Great Saint", 
      description: "Saint of immense power and wisdom", 
      experienceRequired: 320000, 
      tribulationChance: 0.91, 
      lifespanBonus: 80000, 
      statMultiplier: 150, 
      color: "#F8F8FF", 
      icon: "🌈",
      unlockMessage: "You become a Great Saint of immense power!"
    },
    { 
      name: "Saint King", 
      description: "King among saints, ruler of domains", 
      experienceRequired: 400000, 
      tribulationChance: 0.92, 
      lifespanBonus: 100000, 
      statMultiplier: 180, 
      color: "#E0E0E0", 
      icon: "👑",
      unlockMessage: "You rule as a Saint King over vast domains!"
    },
    { 
      name: "Saint Emperor", 
      description: "Emperor of saints, cosmic authority", 
      experienceRequired: 500000, 
      tribulationChance: 0.93, 
      lifespanBonus: 120000, 
      statMultiplier: 220, 
      color: "#D3D3D3", 
      icon: "🏛️",
      unlockMessage: "You wield cosmic authority as a Saint Emperor!"
    },
    
    // Celestial Realms
    { 
      name: "Celestial King", 
      description: "King of celestial beings", 
      experienceRequired: 650000, 
      tribulationChance: 0.94, 
      lifespanBonus: 150000, 
      statMultiplier: 280, 
      color: "#87CEFA", 
      icon: "👑",
      unlockMessage: "You reign as King of celestial beings!"
    },
    { 
      name: "Celestial Emperor", 
      description: "Ruler of celestial realms and cosmic forces", 
      experienceRequired: 60000, 
      tribulationChance: 0.95, 
      lifespanBonus: 30000, 
      statMultiplier: 60, 
      color: "#4B0082", 
      icon: "👑",
      unlockMessage: "You rule over the celestial realms!"
    },
    { 
      name: "Heavenly Monarch", 
      description: "Monarch of the heavenly court", 
      experienceRequired: 850000, 
      tribulationChance: 0.95, 
      lifespanBonus: 200000, 
      statMultiplier: 350, 
      color: "#6495ED", 
      icon: "🏰",
      unlockMessage: "You rule as Monarch of the heavenly court!"
    },
    { 
      name: "Cosmic Overlord", 
      description: "Overlord commanding cosmic forces", 
      experienceRequired: 1100000, 
      tribulationChance: 0.96, 
      lifespanBonus: 250000, 
      statMultiplier: 450, 
      color: "#4682B4", 
      icon: "🌌",
      unlockMessage: "You command cosmic forces as an Overlord!"
    },
    
    // Divine Realms
    { 
      name: "Divine King", 
      description: "King with divine authority", 
      experienceRequired: 1400000, 
      tribulationChance: 0.96, 
      lifespanBonus: 300000, 
      statMultiplier: 550, 
      color: "#FFD700", 
      icon: "👑",
      unlockMessage: "You wield divine authority as a Divine King!"
    },
    { 
      name: "Divine Sovereign", 
      description: "Sovereign of divine power and cosmic law", 
      experienceRequired: 80000, 
      tribulationChance: 0.98, 
      lifespanBonus: 50000, 
      statMultiplier: 80, 
      color: "#8B008B", 
      icon: "🔱",
      unlockMessage: "Divine power flows through your very essence!"
    },
    { 
      name: "Divine Emperor", 
      description: "Emperor wielding divine might", 
      experienceRequired: 1800000, 
      tribulationChance: 0.97, 
      lifespanBonus: 400000, 
      statMultiplier: 700, 
      color: "#DAA520", 
      icon: "⚡",
      unlockMessage: "You wield divine might as a Divine Emperor!"
    },
    { 
      name: "Supreme Divine", 
      description: "Supreme being of divine essence", 
      experienceRequired: 2300000, 
      tribulationChance: 0.97, 
      lifespanBonus: 500000, 
      statMultiplier: 850, 
      color: "#B8860B", 
      icon: "🌟",
      unlockMessage: "You become a Supreme Divine being!"
    },
    
    // Primordial Realms
    { 
      name: "Primordial King", 
      description: "King from primordial times", 
      experienceRequired: 3000000, 
      tribulationChance: 0.98, 
      lifespanBonus: 700000, 
      statMultiplier: 1000, 
      color: "#2F2F2F", 
      icon: "🗿",
      unlockMessage: "You rule as a King from primordial times!"
    },
    { 
      name: "Primordial Ancestor", 
      description: "Ancient being from the dawn of time", 
      experienceRequired: 120000, 
      tribulationChance: 0.99, 
      lifespanBonus: 100000, 
      statMultiplier: 120, 
      color: "#2F2F2F", 
      icon: "🗿",
      unlockMessage: "You become one with primordial forces!"
    },
    { 
      name: "Primordial Emperor", 
      description: "Emperor of primordial chaos", 
      experienceRequired: 3800000, 
      tribulationChance: 0.98, 
      lifespanBonus: 900000, 
      statMultiplier: 1200, 
      color: "#1C1C1C", 
      icon: "👑",
      unlockMessage: "You rule as Emperor of primordial chaos!"
    },
    { 
      name: "Primordial Sovereign", 
      description: "Sovereign of all primordial forces", 
      experienceRequired: 4800000, 
      tribulationChance: 0.985, 
      lifespanBonus: 1200000, 
      statMultiplier: 1500, 
      color: "#0D0D0D", 
      icon: "🌀",
      unlockMessage: "You become Sovereign of all primordial forces!"
    },
    
    // Chaos Realms
    { 
      name: "Chaos Initiate", 
      description: "Initiate into the mysteries of chaos", 
      experienceRequired: 6000000, 
      tribulationChance: 0.985, 
      lifespanBonus: 1500000, 
      statMultiplier: 1800, 
      color: "#4B0082", 
      icon: "🌀",
      unlockMessage: "You are initiated into the mysteries of chaos!"
    },
    { 
      name: "Chaos Adept", 
      description: "Adept manipulator of chaotic forces", 
      experienceRequired: 7500000, 
      tribulationChance: 0.99, 
      lifespanBonus: 2000000, 
      statMultiplier: 2200, 
      color: "#8B008B", 
      icon: "⚡",
      unlockMessage: "You become an adept manipulator of chaotic forces!"
    },
    { 
      name: "Chaos Master", 
      description: "Master of chaotic energies", 
      experienceRequired: 9500000, 
      tribulationChance: 0.99, 
      lifespanBonus: 2500000, 
      statMultiplier: 2700, 
      color: "#9400D3", 
      icon: "🔮",
      unlockMessage: "You master the chaotic energies of creation!"
    },
    { 
      name: "Chaos Lord", 
      description: "Master of primordial chaos and creation", 
      experienceRequired: 200000, 
      tribulationChance: 0.995, 
      lifespanBonus: 200000, 
      statMultiplier: 200, 
      color: "#000000", 
      icon: "🌀",
      unlockMessage: "Chaos bends to your will!"
    },
    { 
      name: "Chaos Sovereign", 
      description: "Sovereign ruling over chaos itself", 
      experienceRequired: 12000000, 
      tribulationChance: 0.992, 
      lifespanBonus: 3000000, 
      statMultiplier: 3300, 
      color: "#FF00FF", 
      icon: "👑",
      unlockMessage: "You rule as Sovereign over chaos itself!"
    },
    { 
      name: "Chaos Emperor", 
      description: "Emperor commanding all chaotic realms", 
      experienceRequired: 15000000, 
      tribulationChance: 0.993, 
      lifespanBonus: 4000000, 
      statMultiplier: 4000, 
      color: "#DC143C", 
      icon: "⚡",
      unlockMessage: "You command all chaotic realms as Emperor!"
    },
    
    // Void Realms
    { 
      name: "Void Walker", 
      description: "Walker between void dimensions", 
      experienceRequired: 19000000, 
      tribulationChance: 0.994, 
      lifespanBonus: 5000000, 
      statMultiplier: 5000, 
      color: "#191970", 
      icon: "🚶",
      unlockMessage: "You walk between void dimensions!"
    },
    { 
      name: "Void Master", 
      description: "Master of void manipulation", 
      experienceRequired: 24000000, 
      tribulationChance: 0.994, 
      lifespanBonus: 6500000, 
      statMultiplier: 6000, 
      color: "#000080", 
      icon: "🌌",
      unlockMessage: "You master the manipulation of the void!"
    },
    { 
      name: "Void Lord", 
      description: "Lord ruling void dimensions", 
      experienceRequired: 30000000, 
      tribulationChance: 0.995, 
      lifespanBonus: 8000000, 
      statMultiplier: 7500, 
      color: "#0000CD", 
      icon: "🕳️",
      unlockMessage: "You rule as Lord of void dimensions!"
    },
    { 
      name: "Void Emperor", 
      description: "Emperor of the endless void between worlds", 
      experienceRequired: 350000, 
      tribulationChance: 0.998, 
      lifespanBonus: 500000, 
      statMultiplier: 350, 
      color: "#191970", 
      icon: "🕳️",
      unlockMessage: "The void itself acknowledges your supremacy!"
    },
    { 
      name: "Void Sovereign", 
      description: "Sovereign of all void realms", 
      experienceRequired: 38000000, 
      tribulationChance: 0.996, 
      lifespanBonus: 10000000, 
      statMultiplier: 9000, 
      color: "#000000", 
      icon: "👑",
      unlockMessage: "You become Sovereign of all void realms!"
    },
    
    // Eternal Realms
    { 
      name: "Eternal Initiate", 
      description: "Initiate into eternal mysteries", 
      experienceRequired: 48000000, 
      tribulationChance: 0.996, 
      lifespanBonus: 12000000, 
      statMultiplier: 11000, 
      color: "#FF1493", 
      icon: "⭐",
      unlockMessage: "You are initiated into eternal mysteries!"
    },
    { 
      name: "Eternal Adept", 
      description: "Adept of eternal principles", 
      experienceRequired: 60000000, 
      tribulationChance: 0.997, 
      lifespanBonus: 15000000, 
      statMultiplier: 13000, 
      color: "#FF69B4", 
      icon: "✨",
      unlockMessage: "You become an adept of eternal principles!"
    },
    { 
      name: "Eternal Master", 
      description: "Master of eternal forces", 
      experienceRequired: 75000000, 
      tribulationChance: 0.997, 
      lifespanBonus: 18000000, 
      statMultiplier: 16000, 
      color: "#FFB6C1", 
      icon: "🌟",
      unlockMessage: "You master the eternal forces of existence!"
    },
    { 
      name: "Eternal Lord", 
      description: "Lord of eternal domains", 
      experienceRequired: 95000000, 
      tribulationChance: 0.997, 
      lifespanBonus: 22000000, 
      statMultiplier: 20000, 
      color: "#FFC0CB", 
      icon: "👑",
      unlockMessage: "You rule as Lord of eternal domains!"
    },
    { 
      name: "Eternal Sovereign", 
      description: "Eternal ruler beyond the constraints of time", 
      experienceRequired: 600000, 
      tribulationChance: 0.999, 
      lifespanBonus: 1000000, 
      statMultiplier: 600, 
      color: "#FF1493", 
      icon: "♾️",
      unlockMessage: "You transcend time and become eternal!"
    },
    { 
      name: "Eternal Emperor", 
      description: "Emperor of all eternal realms", 
      experienceRequired: 120000000, 
      tribulationChance: 0.998, 
      lifespanBonus: 28000000, 
      statMultiplier: 25000, 
      color: "#FF1493", 
      icon: "⚡",
      unlockMessage: "You rule as Emperor of all eternal realms!"
    },
    
    // Transcendent Realms
    { 
      name: "Transcendent Being", 
      description: "Being that transcends all limitations", 
      experienceRequired: 150000000, 
      tribulationChance: 0.998, 
      lifespanBonus: 35000000, 
      statMultiplier: 30000, 
      color: "#FFFFFF", 
      icon: "🌈",
      unlockMessage: "You transcend all limitations of existence!"
    },
    { 
      name: "Transcendent Lord", 
      description: "Lord of transcendent power", 
      experienceRequired: 190000000, 
      tribulationChance: 0.998, 
      lifespanBonus: 45000000, 
      statMultiplier: 38000, 
      color: "#F0F8FF", 
      icon: "👑",
      unlockMessage: "You wield transcendent power as a Lord!"
    },
    { 
      name: "Transcendent Emperor", 
      description: "Emperor beyond all understanding", 
      experienceRequired: 240000000, 
      tribulationChance: 0.999, 
      lifespanBonus: 55000000, 
      statMultiplier: 48000, 
      color: "#E6E6FA", 
      icon: "⚡",
      unlockMessage: "You become an Emperor beyond all understanding!"
    },
    { 
      name: "Transcendent Sovereign", 
      description: "Sovereign of transcendent realms", 
      experienceRequired: 300000000, 
      tribulationChance: 0.999, 
      lifespanBonus: 70000000, 
      statMultiplier: 60000, 
      color: "#F5F5F5", 
      icon: "🌟",
      unlockMessage: "You rule as Sovereign of transcendent realms!"
    },
    
    // Omnipotent Realms
    { 
      name: "Omnipotent Initiate", 
      description: "Initiate approaching omnipotence", 
      experienceRequired: 380000000, 
      tribulationChance: 0.999, 
      lifespanBonus: 90000000, 
      statMultiplier: 75000, 
      color: "#FFFACD", 
      icon: "⭐",
      unlockMessage: "You approach the threshold of omnipotence!"
    },
    { 
      name: "Omnipotent Adept", 
      description: "Adept wielding omnipotent power", 
      experienceRequired: 480000000, 
      tribulationChance: 0.9995, 
      lifespanBonus: 120000000, 
      statMultiplier: 95000, 
      color: "#FFFFE0", 
      icon: "✨",
      unlockMessage: "You wield omnipotent power as an Adept!"
    },
    { 
      name: "Omnipotent Master", 
      description: "Master of omnipotent forces", 
      experienceRequired: 600000000, 
      tribulationChance: 0.9995, 
      lifespanBonus: 150000000, 
      statMultiplier: 120000, 
      color: "#FFFFF0", 
      icon: "🌟",
      unlockMessage: "You master omnipotent forces!"
    },
    { 
      name: "Omnipotent Lord", 
      description: "Lord with omnipotent authority", 
      experienceRequired: 750000000, 
      tribulationChance: 0.9998, 
      lifespanBonus: 200000000, 
      statMultiplier: 150000, 
      color: "#FFFAF0", 
      icon: "👑",
      unlockMessage: "You wield omnipotent authority as a Lord!"
    },
    { 
      name: "Omnipotent Emperor", 
      description: "Emperor of omnipotent might", 
      experienceRequired: 950000000, 
      tribulationChance: 0.9998, 
      lifespanBonus: 250000000, 
      statMultiplier: 200000, 
      color: "#FFF8DC", 
      icon: "⚡",
      unlockMessage: "You rule with omnipotent might as Emperor!"
    },
    { 
      name: "Omnipotent Sovereign", 
      description: "Sovereign of all omnipotent realms", 
      experienceRequired: 1200000000, 
      tribulationChance: 0.9999, 
      lifespanBonus: 350000000, 
      statMultiplier: 250000, 
      color: "#FFFFFF", 
      icon: "🌈",
      unlockMessage: "You become Sovereign of all omnipotent realms!"
    },
    
    // Ultimate Dao Realms
    { 
      name: "Dao Seeker", 
      description: "Seeker of the ultimate Dao", 
      experienceRequired: 1500000000, 
      tribulationChance: 0.9999, 
      lifespanBonus: 500000000, 
      statMultiplier: 350000, 
      color: "#000000", 
      icon: "🔍",
      unlockMessage: "You seek the ultimate Dao!"
    },
    { 
      name: "Dao Comprehender", 
      description: "One who comprehends the Dao", 
      experienceRequired: 2000000000, 
      tribulationChance: 0.9999, 
      lifespanBonus: 750000000, 
      statMultiplier: 500000, 
      color: "#2F2F2F", 
      icon: "🧠",
      unlockMessage: "You comprehend the mysteries of the Dao!"
    },
    { 
      name: "Dao Master", 
      description: "Master of Dao principles", 
      experienceRequired: 2500000000, 
      tribulationChance: 0.99995, 
      lifespanBonus: 1000000000, 
      statMultiplier: 750000, 
      color: "#4F4F4F", 
      icon: "⚡",
      unlockMessage: "You master the principles of the Dao!"
    },
    { 
      name: "Dao Lord", 
      description: "Lord commanding the Dao", 
      experienceRequired: 3200000000, 
      tribulationChance: 0.99995, 
      lifespanBonus: 1500000000, 
      statMultiplier: 1000000, 
      color: "#6F6F6F", 
      icon: "👑",
      unlockMessage: "You command the Dao as a Lord!"
    },
    { 
      name: "Dao Emperor", 
      description: "Emperor of Dao mastery", 
      experienceRequired: 4000000000, 
      tribulationChance: 0.99998, 
      lifespanBonus: 2000000000, 
      statMultiplier: 1500000, 
      color: "#8F8F8F", 
      icon: "⚡",
      unlockMessage: "You rule as Emperor of Dao mastery!"
    },
    { 
      name: "Dao Sovereign", 
      description: "Sovereign of all Dao", 
      experienceRequired: 5000000000, 
      tribulationChance: 0.99998, 
      lifespanBonus: 3000000000, 
      statMultiplier: 2000000, 
      color: "#AAAAAA", 
      icon: "🌟",
      unlockMessage: "You become Sovereign of all Dao!"
    },
    { 
      name: "Ultimate Dao", 
      description: "Unity with the ultimate Dao", 
      experienceRequired: 6500000000, 
      tribulationChance: 0.99999, 
      lifespanBonus: 5000000000, 
      statMultiplier: 3000000, 
      color: "#CCCCCC", 
      icon: "☯️",
      unlockMessage: "You achieve unity with the ultimate Dao!"
    },
    { 
      name: "Eternal Dao", 
      description: "Eternal existence as the Dao", 
      experienceRequired: 8500000000, 
      tribulationChance: 0.99999, 
      lifespanBonus: 10000000000, 
      statMultiplier: 5000000, 
      color: "#FFFFFF", 
      icon: "♾️",
      unlockMessage: "You become eternal existence as the Dao!"
    },
    { 
      name: "Infinite Dao", 
      description: "Infinite power of the Dao", 
      experienceRequired: 12000000000, 
      tribulationChance: 1, 
      lifespanBonus: 50000000000, 
      statMultiplier: 10000000, 
      color: "#RAINBOW", 
      icon: "🌈",
      unlockMessage: "You achieve infinite power of the Dao!"
    },
    { 
      name: "Omnipotent Dao", 
      description: "One with the eternal Dao, omnipotent and omniscient", 
      experienceRequired: 1000000, 
      tribulationChance: 1, 
      lifespanBonus: 10000000, 
      statMultiplier: 1000, 
      color: "#RAINBOW", 
      icon: "☯️",
      unlockMessage: "You become one with the Dao itself!"
    }
  ];

  const techniques: Technique[] = [
    { 
      id: "basic_meditation", 
      name: "Basic Meditation", 
      description: "Fundamental breathing technique for cultivation", 
      cost: 10, 
      effect: "+20% meditation efficiency", 
      unlockRealm: 0,
      category: 'cultivation'
    },
    { 
      id: "qi_gathering", 
      name: "Qi Gathering Palm", 
      description: "Gather qi from the surrounding environment", 
      cost: 50, 
      effect: "+30% qi recovery rate", 
      unlockRealm: 1,
      category: 'cultivation'
    },
    { 
      id: "iron_body", 
      name: "Iron Body Technique", 
      description: "Strengthen your physical form like iron", 
      cost: 100, 
      effect: "+50% defense and health", 
      unlockRealm: 2,
      category: 'combat'
    },
    { 
      id: "lightning_step", 
      name: "Lightning Step", 
      description: "Move with the speed of lightning", 
      cost: 200, 
      effect: "+100% speed and agility", 
      unlockRealm: 3,
      category: 'utility'
    },
    { 
      id: "soul_sight", 
      name: "Soul Sight", 
      description: "See through illusions and perceive truth", 
      cost: 500, 
      effect: "+200% wisdom and perception", 
      unlockRealm: 4,
      category: 'utility'
    },
    { 
      id: "void_palm", 
      name: "Void Palm Strike", 
      description: "Strike through dimensions with void energy", 
      cost: 1000, 
      effect: "+500% attack power", 
      unlockRealm: 6,
      category: 'combat'
    },
    { 
      id: "immortal_body", 
      name: "Immortal Body", 
      description: "Transcend mortal limitations completely", 
      cost: 2000, 
      effect: "+1000% all stats", 
      unlockRealm: 10,
      category: 'legendary'
    },
    { 
      id: "dao_comprehension", 
      name: "Dao Comprehension", 
      description: "Understand the fundamental laws of existence", 
      cost: 5000, 
      effect: "+10000% experience gain", 
      unlockRealm: 17,
      category: 'legendary'
    },
    { 
      id: "heaven_defying", 
      name: "Heaven Defying Art", 
      description: "Defy the will of heaven itself", 
      cost: 10000, 
      effect: "Immunity to tribulations", 
      unlockRealm: 20,
      category: 'legendary'
    }
  ];

  const artifacts: Artifact[] = [
    {
      id: "jade_pendant",
      name: "Jade Pendant of Clarity",
      description: "A simple jade pendant that clears the mind",
      rarity: 'common',
      effects: ["+10% meditation efficiency"],
      unlockRealm: 0
    },
    {
      id: "spirit_sword",
      name: "Spirit Cleaving Sword",
      description: "A sword imbued with spiritual energy",
      rarity: 'rare',
      effects: ["+50% attack power", "+25% speed"],
      unlockRealm: 3
    },
    {
      id: "phoenix_feather",
      name: "Phoenix Feather Robe",
      description: "Robes made from phoenix feathers",
      rarity: 'epic',
      effects: ["+100% health regeneration", "Fire immunity"],
      unlockRealm: 8
    },
    {
      id: "dragon_scale",
      name: "Dragon Scale Armor",
      description: "Armor crafted from ancient dragon scales",
      rarity: 'legendary',
      effects: ["+500% defense", "+200% health", "Physical immunity"],
      unlockRealm: 15
    },
    {
      id: "dao_crystal",
      name: "Dao Comprehension Crystal",
      description: "A crystal containing the essence of the Dao",
      rarity: 'divine',
      effects: ["+1000% all stats", "Perfect Dao understanding"],
      unlockRealm: 22
    }
  ];

  const encounters: Encounter[] = [
    {
      id: "rogue_cultivator",
      title: "Rogue Cultivator",
      description: "A rogue cultivator blocks your path, demanding tribute for safe passage.",
      choices: [
        { 
          text: "Fight them head-on", 
          karmaChange: -5, 
          luckChange: -10, 
          reward: "Combat experience", 
          risk: "Potential injury", 
          statBonus: { attack: 5, speed: 3 },
          experienceGain: 50
        },
        { 
          text: "Pay tribute peacefully", 
          karmaChange: 0, 
          luckChange: 5, 
          reward: "Safe passage and respect",
          experienceGain: 20
        },
        { 
          text: "Try to reason with them", 
          karmaChange: 10, 
          luckChange: 0, 
          reward: "Peaceful resolution", 
          statBonus: { wisdom: 8 },
          experienceGain: 30
        }
      ]
    },
    {
      id: "secret_realm",
      title: "Ancient Secret Realm",
      description: "You discover a hidden secret realm filled with ancient treasures and dangers.",
      choices: [
        { 
          text: "Enter cautiously", 
          karmaChange: 0, 
          luckChange: 20, 
          reward: "Ancient artifact discovered", 
          statBonus: { wisdom: 10, defense: 5 },
          experienceGain: 100,
          pillReward: "Breakthrough Pill"
        },
        { 
          text: "Rush in boldly", 
          karmaChange: -5, 
          luckChange: -10, 
          reward: "Great treasure found", 
          risk: "Dangerous trap triggered", 
          statBonus: { attack: 15, speed: 10 },
          experienceGain: 150
        },
        { 
          text: "Mark location and leave", 
          karmaChange: 5, 
          luckChange: 10, 
          reward: "Future opportunity secured", 
          statBonus: { wisdom: 5 },
          experienceGain: 25
        }
      ]
    },
    {
      id: "injured_cultivator",
      title: "Injured Fellow Cultivator",
      description: "You find a severely injured cultivator who begs for your help.",
      choices: [
        { 
          text: "Help them selflessly", 
          karmaChange: 20, 
          luckChange: 15, 
          reward: "Good karma and eternal gratitude", 
          statBonus: { wisdom: 8, defense: 5 },
          experienceGain: 75,
          pillReward: "Healing Pill"
        },
        { 
          text: "Rob their possessions", 
          karmaChange: -30, 
          luckChange: -20, 
          reward: "Stolen treasures", 
          risk: "Terrible karma", 
          statBonus: { attack: 10 },
          experienceGain: 40
        },
        { 
          text: "Ignore and continue", 
          karmaChange: -5, 
          luckChange: 0, 
          reward: "Nothing gained",
          experienceGain: 10
        }
      ]
    },
    {
      id: "ancient_master",
      title: "Ancient Master",
      description: "An ancient master appears before you, offering to share their wisdom.",
      choices: [
        { 
          text: "Accept humbly", 
          karmaChange: 10, 
          luckChange: 25, 
          reward: "Powerful technique learned", 
          statBonus: { wisdom: 20, spiritualPower: 50 },
          experienceGain: 200
        },
        { 
          text: "Demand more teachings", 
          karmaChange: -15, 
          luckChange: -10, 
          reward: "Master's anger", 
          risk: "Cursed with bad luck",
          experienceGain: 0
        },
        { 
          text: "Politely decline", 
          karmaChange: 5, 
          luckChange: 5, 
          reward: "Respect earned", 
          statBonus: { wisdom: 5 },
          experienceGain: 30
        }
      ]
    },
    {
      id: "heavenly_tribulation",
      title: "Minor Heavenly Tribulation",
      description: "The heavens test your progress with lightning tribulation.",
      choices: [
        { 
          text: "Face it with courage", 
          karmaChange: 0, 
          luckChange: -5, 
          reward: "Tempering of body and soul", 
          statBonus: { defense: 20, attack: 15, wisdom: 10 },
          experienceGain: 300
        },
        { 
          text: "Use protective treasures", 
          karmaChange: -5, 
          luckChange: 10, 
          reward: "Safe passage through tribulation", 
          statBonus: { wisdom: 10 },
          experienceGain: 100
        },
        { 
          text: "Flee from the tribulation", 
          karmaChange: -10, 
          luckChange: 0, 
          reward: "Cowardice brings shame", 
          statBonus: { speed: 5 },
          experienceGain: 20
        }
      ]
    },
    {
      id: "dao_enlightenment",
      title: "Dao Enlightenment",
      description: "A moment of sudden enlightenment about the nature of the Dao.",
      choices: [
        { 
          text: "Embrace the enlightenment", 
          karmaChange: 15, 
          luckChange: 20, 
          reward: "Deep understanding of Dao", 
          statBonus: { wisdom: 30, spiritualPower: 100 },
          experienceGain: 500
        },
        { 
          text: "Question the revelation", 
          karmaChange: 5, 
          luckChange: 5, 
          reward: "Critical thinking developed", 
          statBonus: { wisdom: 15 },
          experienceGain: 200
        },
        { 
          text: "Ignore the moment", 
          karmaChange: -5, 
          luckChange: -10, 
          reward: "Opportunity wasted",
          experienceGain: 50
        }
      ]
    }
  ];

  const [player, setPlayer] = useState<Player>({
    name: "Cultivator",
    realm: 0,
    level: 1,
    experience: 0,
    experienceToNext: 100,
    health: 100,
    maxHealth: 100,
    qi: 50,
    maxQi: 50,
    spiritualPower: 10,
    luck: 50,
    karma: 0,
    cultivationPoints: 0,
    lifespan: 80,
    maxLifespan: 80,
    techniques: [],
    artifacts: [],
    pills: { "Qi Gathering Pill": 3, "Healing Pill": 2, "Breakthrough Pill": 1 },
    achievements: [],
    reincarnations: 0,
    lastOnline: Date.now(),
    autoCultivating: true,
    stats: {
      attack: 10,
      defense: 10,
      speed: 10,
      wisdom: 10
    },
    totalExperience: 0,
    breakthroughAttempts: 0,
    successfulBreakthroughs: 0
  });

  // Calculate offline progress
  const calculateOfflineProgress = useCallback((lastOnline: number, currentTime: number, playerData: Player) => {
    const timeAway = Math.floor((currentTime - lastOnline) / 1000);
    if (timeAway < 60 || !playerData.autoCultivating) return null;

    const hoursAway = Math.min(timeAway / 3600, 24); // Cap at 24 hours
    const baseExpPerHour = 50 + (playerData.realm * 10);
    const luckBonus = Math.max(0, (playerData.luck - 50) / 100);
    const karmaBonus = Math.max(0, playerData.karma / 200);
    const techniqueBonus = playerData.techniques.includes('dao_comprehension') ? 100 : 1;
    
    const expPerHour = Math.floor(baseExpPerHour * (1 + luckBonus + karmaBonus) * techniqueBonus);
    const totalExpGained = Math.floor(expPerHour * hoursAway);

    // Calculate encounters and pills found
    const encountersFound = Math.floor(hoursAway * 0.5);
    const pillsFound: string[] = [];
    
    for (let i = 0; i < Math.floor(hoursAway * 0.3); i++) {
      const pillTypes = ["Qi Gathering Pill", "Healing Pill"];
      if (playerData.realm >= 5) pillTypes.push("Breakthrough Pill");
      pillsFound.push(pillTypes[Math.floor(Math.random() * pillTypes.length)]);
    }

    return {
      timeAway,
      experienceGained: totalExpGained,
      breakthroughs: [],
      encountersFound,
      pillsFound
    };
  }, []);

  // Process offline progress and breakthroughs
  const processOfflineProgress = useCallback((progress: any, currentPlayer: Player) => {
    let updatedPlayer = { ...currentPlayer };
    let breakthroughs: string[] = [];
    
    updatedPlayer.experience += progress.experienceGained;
    updatedPlayer.totalExperience += progress.experienceGained;
    
    // Add found pills
    progress.pillsFound.forEach((pill: string) => {
      updatedPlayer.pills[pill] = (updatedPlayer.pills[pill] || 0) + 1;
    });
    
    while (updatedPlayer.experience >= updatedPlayer.experienceToNext && updatedPlayer.realm < realms.length - 1) {
      const nextRealm = realms[updatedPlayer.realm + 1];
      if (!nextRealm) break;

      const successChance = 0.7 + Math.max(0, (updatedPlayer.luck - 50) / 200) + Math.max(0, updatedPlayer.karma / 300);
      updatedPlayer.breakthroughAttempts++;
      
      if (Math.random() < successChance) {
        breakthroughs.push(nextRealm.name);
        updatedPlayer = advanceRealm(updatedPlayer);
        updatedPlayer.successfulBreakthroughs++;
      } else {
        updatedPlayer.experience = Math.floor(updatedPlayer.experience * 0.9);
        break;
      }
    }

    return { updatedPlayer, breakthroughs };
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('cultivationGame');
    if (saved) {
      const savedData = JSON.parse(saved);
      const currentTime = Date.now();
      
      // Ensure all required fields exist
      const playerData = {
        ...savedData.player,
        totalExperience: savedData.player.totalExperience || 0,
        breakthroughAttempts: savedData.player.breakthroughAttempts || 0,
        successfulBreakthroughs: savedData.player.successfulBreakthroughs || 0
      };
      
      const progress = calculateOfflineProgress(playerData.lastOnline, currentTime, playerData);
      
      if (progress && progress.experienceGained > 0) {
        const { updatedPlayer, breakthroughs } = processOfflineProgress(progress, playerData);
        progress.breakthroughs = breakthroughs;
        
        setPlayer({ ...updatedPlayer, lastOnline: currentTime });
        setOfflineProgress(progress);
        setGameStarted(savedData.gameStarted);
        setGameLog(savedData.gameLog || []);
      } else {
        setPlayer({ ...playerData, lastOnline: currentTime });
        setGameStarted(savedData.gameStarted);
        setGameLog(savedData.gameLog || []);
      }
    }
  }, [calculateOfflineProgress, processOfflineProgress]);

  // Auto-cultivation while online
  useEffect(() => {
    if (!gameStarted || !player.autoCultivating) return;

    const interval = setInterval(() => {
      setPlayer(prev => {
        if (!prev.autoCultivating) return prev;
        
        const baseExp = 2 + Math.floor(prev.realm * 0.5);
        const luckBonus = Math.max(0, (prev.luck - 50) / 200);
        const karmaBonus = Math.max(0, prev.karma / 500);
        const techniqueBonus = prev.techniques.includes('dao_comprehension') ? 100 : 1;
        
        const expGain = Math.floor(baseExp * (1 + luckBonus + karmaBonus) * techniqueBonus);
        
        const newPlayer = {
          ...prev,
          experience: prev.experience + expGain,
          totalExperience: prev.totalExperience + expGain,
          lastOnline: Date.now()
        };

        if (newPlayer.experience >= newPlayer.experienceToNext && newPlayer.realm < realms.length - 1) {
          return attemptBreakthrough(newPlayer);
        }

        return newPlayer;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [gameStarted, player.autoCultivating]);

  useEffect(() => {
    if (gameStarted) {
      const gameData = {
        player: { ...player, lastOnline: Date.now() },
        gameStarted,
        gameLog
      };
      localStorage.setItem('cultivationGame', JSON.stringify(gameData));
    }
  }, [player, gameStarted, gameLog]);

  const addToLog = (message: string) => {
    setGameLog(prev => [...prev.slice(-19), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const animateStatChange = (statName: string) => {
    setAnimatingStats(prev => [...prev, statName]);
    setTimeout(() => {
      setAnimatingStats(prev => prev.filter(s => s !== statName));
    }, 1000);
  };

  const startGame = () => {
    setGameStarted(true);
    addToLog("🌟 Your cultivation journey begins! May you reach the peak of the Dao!");
  };

  const resetGame = () => {
    if (confirm("Are you sure you want to reset your cultivation progress? This action cannot be undone!")) {
      const newPlayer: Player = {
        name: "Cultivator",
        realm: 0,
        level: 1,
        experience: 0,
        experienceToNext: 100,
        health: 100,
        maxHealth: 100,
        qi: 50,
        maxQi: 50,
        spiritualPower: 10,
        luck: 50,
        karma: 0,
        cultivationPoints: 0,
        lifespan: 80,
        maxLifespan: 80,
        techniques: [],
        artifacts: [],
        pills: { "Qi Gathering Pill": 3, "Healing Pill": 2, "Breakthrough Pill": 1 },
        achievements: [],
        reincarnations: 0,
        lastOnline: Date.now(),
        autoCultivating: true,
        stats: {
          attack: 10,
          defense: 10,
          speed: 10,
          wisdom: 10
        },
        totalExperience: 0,
        breakthroughAttempts: 0,
        successfulBreakthroughs: 0
      };
      
      setPlayer(newPlayer);
      setGameLog([]);
      setGameStarted(false);
      localStorage.removeItem('cultivationGame');
    }
  };

  const gainExperience = (amount: number) => {
    setPlayer(prev => {
      const newExp = prev.experience + amount;
      const newPlayer = { 
        ...prev, 
        experience: newExp,
        totalExperience: prev.totalExperience + amount
      };
      
      if (newExp >= prev.experienceToNext && prev.realm < realms.length - 1) {
        return attemptBreakthrough(newPlayer);
      }
      
      return newPlayer;
    });
  };

  const attemptBreakthrough = (currentPlayer: Player): Player => {
    const nextRealm = realms[currentPlayer.realm + 1];
    
    if (!nextRealm) return currentPlayer;

    const tribulationChance = nextRealm.tribulationChance;
    const luckBonus = Math.max(0, (currentPlayer.luck - 50) / 100);
    const karmaBonus = Math.max(0, currentPlayer.karma / 100);
    const techniqueBonus = currentPlayer.techniques.includes('basic_meditation') ? 0.1 : 0;
    const immunityBonus = currentPlayer.techniques.includes('heaven_defying') ? 0.5 : 0;
    
    const successChance = Math.min(0.95, 0.5 + luckBonus + karmaBonus + techniqueBonus + immunityBonus);
    const success = Math.random() < successChance;

    const updatedPlayer = {
      ...currentPlayer,
      breakthroughAttempts: currentPlayer.breakthroughAttempts + 1
    };

    if (Math.random() < tribulationChance && !currentPlayer.techniques.includes('heaven_defying')) {
      setShowTribulation(true);
      setTribulationProgress(0);
      
      const tribulationInterval = setInterval(() => {
        setTribulationProgress(prev => {
          if (prev >= 100) {
            clearInterval(tribulationInterval);
            setShowTribulation(false);
            
            if (success) {
              addToLog(`⚡ Successfully transcended tribulation! Advanced to ${nextRealm.name}!`);
              addToLog(`✨ ${nextRealm.unlockMessage}`);
              setPlayer(prevPlayer => {
                const advanced = advanceRealm(prevPlayer);
                return { ...advanced, successfulBreakthroughs: advanced.successfulBreakthroughs + 1 };
              });
            } else {
              addToLog("💥 Failed tribulation! Suffered severe injuries but survived.");
              setPlayer(prevPlayer => ({
                ...prevPlayer,
                health: Math.max(1, Math.floor(prevPlayer.health * 0.3)),
                experience: Math.floor(prevPlayer.experience * 0.8)
              }));
            }
            return 0;
          }
          return prev + 2;
        });
      }, 100);
      
      return updatedPlayer;
    } else {
      if (success) {
        addToLog(`✨ Breakthrough successful! Advanced to ${nextRealm.name}!`);
        addToLog(`🌟 ${nextRealm.unlockMessage}`);
        const advanced = advanceRealm(updatedPlayer);
        return { ...advanced, successfulBreakthroughs: advanced.successfulBreakthroughs + 1 };
      } else {
        addToLog("💔 Breakthrough failed. Continue cultivating to stabilize your foundation.");
        return {
          ...updatedPlayer,
          experience: Math.floor(updatedPlayer.experience * 0.9)
        };
      }
    }
  };

  const advanceRealm = (currentPlayer: Player): Player => {
    const nextRealm = realms[currentPlayer.realm + 1];
    if (!nextRealm) return currentPlayer;

    const multiplier = nextRealm.statMultiplier;
    
    // Animate stat changes
    animateStatChange('all');
    
    return {
      ...currentPlayer,
      realm: currentPlayer.realm + 1,
      level: 1,
      experience: 0,
      experienceToNext: nextRealm.experienceRequired,
      maxHealth: Math.floor(currentPlayer.maxHealth * multiplier),
      health: Math.floor(currentPlayer.maxHealth * multiplier),
      maxQi: Math.floor(currentPlayer.maxQi * multiplier),
      qi: Math.floor(currentPlayer.maxQi * multiplier),
      spiritualPower: Math.floor(currentPlayer.spiritualPower * multiplier),
      maxLifespan: currentPlayer.maxLifespan + nextRealm.lifespanBonus,
      lifespan: currentPlayer.lifespan + nextRealm.lifespanBonus,
      cultivationPoints: currentPlayer.cultivationPoints + (10 * (currentPlayer.realm + 1)),
      stats: {
        attack: Math.floor(currentPlayer.stats.attack * multiplier),
        defense: Math.floor(currentPlayer.stats.defense * multiplier),
        speed: Math.floor(currentPlayer.stats.speed * multiplier),
        wisdom: Math.floor(currentPlayer.stats.wisdom * multiplier)
      }
    };
  };

  const meditate = () => {
    if (player.qi < 10) {
      addToLog("❌ Not enough Qi to meditate!");
      return;
    }

    setIsTraining(true);
    setTimeout(() => {
      const baseExp = Math.floor(Math.random() * 20) + 10;
      const karmaMultiplier = Math.max(0.5, 1 + (player.karma / 100));
      const techniqueMultiplier = player.techniques.includes('basic_meditation') ? 1.2 : 1;
      const expGain = Math.floor(baseExp * karmaMultiplier * techniqueMultiplier);
      const qiCost = 10;
      
      setPlayer(prev => ({
        ...prev,
        qi: prev.qi - qiCost,
        spiritualPower: prev.spiritualPower + 1
      }));
      
      gainExperience(expGain);
      addToLog(`🧘 Meditated deeply. Gained ${expGain} experience (karma bonus: ${Math.floor((karmaMultiplier - 1) * 100)}%).`);
      setIsTraining(false);
      
      animateStatChange('spiritualPower');
    }, 2000);
  };

  const train = () => {
    if (player.health < 20) {
      addToLog("❌ Too injured to train!");
      return;
    }

    setIsTraining(true);
    setTimeout(() => {
      const expGain = Math.floor(Math.random() * 30) + 15;
      const healthCost = 15;
      const statGain = Math.floor(Math.random() * 3) + 1;
      
      setPlayer(prev => ({
        ...prev,
        health: Math.max(1, prev.health - healthCost),
        stats: {
          ...prev.stats,
          attack: prev.stats.attack + statGain,
          defense: prev.stats.defense + Math.floor(statGain / 2)
        }
      }));
      
      gainExperience(expGain);
      addToLog(`💪 Trained intensively. Gained ${expGain} experience and improved combat stats.`);
      setIsTraining(false);
      
      animateStatChange('attack');
      animateStatChange('defense');
    }, 3000);
  };

  const rest = () => {
    const healthGain = Math.floor(player.maxHealth * 0.3);
    const qiGain = Math.floor(player.maxQi * 0.5);
    
    setPlayer(prev => ({
      ...prev,
      health: Math.min(prev.maxHealth, prev.health + healthGain),
      qi: Math.min(prev.maxQi, prev.qi + qiGain),
      lifespan: Math.max(0, prev.lifespan - 1)
    }));
    
    addToLog(`😴 Rested and recovered. Gained ${healthGain} health and ${qiGain} Qi.`);
    animateStatChange('health');
    animateStatChange('qi');
  };

  const usePill = (pillName: string) => {
    if (player.pills[pillName] <= 0) {
      addToLog(`❌ No ${pillName} remaining!`);
      return;
    }

    setPlayer(prev => {
      const newPills = { ...prev.pills };
      newPills[pillName]--;
      
      let updates: any = { pills: newPills };
      
      if (pillName === "Healing Pill") {
        const healAmount = Math.floor(prev.maxHealth * 0.5);
        updates = { ...updates, health: Math.min(prev.maxHealth, prev.health + healAmount) };
        addToLog(`💊 Used Healing Pill. Restored ${healAmount} health.`);
        animateStatChange('health');
      } else if (pillName === "Qi Gathering Pill") {
        const qiAmount = Math.floor(prev.maxQi * 0.6);
        updates = { ...updates, qi: Math.min(prev.maxQi, prev.qi + qiAmount) };
        addToLog(`💊 Used Qi Gathering Pill. Restored ${qiAmount} Qi.`);
        animateStatChange('qi');
      } else if (pillName === "Breakthrough Pill") {
        const expGain = Math.floor(prev.experienceToNext * 0.15);
        updates = { ...updates, experience: prev.experience + expGain, totalExperience: prev.totalExperience + expGain };
        addToLog(`💊 Used Breakthrough Pill. Gained ${expGain} experience!`);
      }
      
      return { ...prev, ...updates };
    });
  };

  const learnTechnique = (technique: Technique) => {
    if (player.cultivationPoints < technique.cost) {
      addToLog(`❌ Not enough cultivation points! Need ${technique.cost}, have ${player.cultivationPoints}.`);
      return;
    }

    if (player.realm < technique.unlockRealm) {
      addToLog(`❌ Realm too low! Need ${realms[technique.unlockRealm].name} realm.`);
      return;
    }

    if (player.techniques.includes(technique.id)) {
      addToLog("❌ You already know this technique!");
      return;
    }

    setPlayer(prev => ({
      ...prev,
      cultivationPoints: prev.cultivationPoints - technique.cost,
      techniques: [...prev.techniques, technique.id]
    }));

    addToLog(`📚 Learned ${technique.name}! ${technique.effect}`);
  };

  const triggerEncounter = () => {
    if (Math.random() < 0.6) {
      const encounter = encounters[Math.floor(Math.random() * encounters.length)];
      setCurrentEncounter(encounter);
    } else {
      addToLog("🚶 You explored the area but found nothing of interest.");
    }
  };

  const handleEncounterChoice = (choice: any) => {
    if (!currentEncounter) return;

    setPlayer(prev => {
      let updates: any = {
        karma: prev.karma + choice.karmaChange,
        luck: Math.max(0, Math.min(100, prev.luck + choice.luckChange))
      };

      if (choice.experienceGain) {
        updates.experience = prev.experience + choice.experienceGain;
        updates.totalExperience = prev.totalExperience + choice.experienceGain;
      }

      if (choice.statBonus) {
        updates.stats = { ...prev.stats };
        Object.entries(choice.statBonus).forEach(([stat, bonus]) => {
          if (stat === 'spiritualPower') {
            updates.spiritualPower = prev.spiritualPower + (bonus as number);
            animateStatChange('spiritualPower');
          } else if (updates.stats[stat as keyof typeof updates.stats] !== undefined) {
            updates.stats[stat as keyof typeof updates.stats] += bonus as number;
            animateStatChange(stat);
          }
        });
      }

      if (choice.pillReward) {
        updates.pills = { ...prev.pills };
        updates.pills[choice.pillReward] = (updates.pills[choice.pillReward] || 0) + 1;
      }

      return { ...prev, ...updates };
    });

    let logMessage = `${currentEncounter.title}: ${choice.text}. ${choice.reward || ''}`;
    if (choice.experienceGain) {
      logMessage += ` (+${choice.experienceGain} exp)`;
    }
    if (choice.pillReward) {
      logMessage += ` (+1 ${choice.pillReward})`;
    }
    
    addToLog(logMessage);
    
    if (choice.reward === "Ancient artifact discovered") {
      setPlayer(prev => ({
        ...prev,
        artifacts: [...prev.artifacts, "ancient_cultivation_manual"]
      }));
    }

    setCurrentEncounter(null);
  };

  const reincarnate = () => {
    if (player.realm < 10) {
      addToLog("❌ Must reach at least Earth Immortal realm to reincarnate!");
      return;
    }

    if (confirm("Reincarnate and start over with permanent bonuses based on your achievements?")) {
      const bonusMultiplier = 1 + (player.reincarnations * 0.1) + (player.successfulBreakthroughs * 0.01);
      
      setPlayer({
        name: player.name,
        realm: 0,
        level: 1,
        experience: 0,
        experienceToNext: 100,
        health: Math.floor(100 * bonusMultiplier),
        maxHealth: Math.floor(100 * bonusMultiplier),
        qi: Math.floor(50 * bonusMultiplier),
        maxQi: Math.floor(50 * bonusMultiplier),
        spiritualPower: Math.floor(10 * bonusMultiplier),
        luck: Math.min(100, Math.floor(50 * bonusMultiplier)),
        karma: Math.floor(player.karma * 0.5),
        cultivationPoints: Math.floor(player.cultivationPoints * 0.3),
        lifespan: Math.floor(80 * bonusMultiplier),
        maxLifespan: Math.floor(80 * bonusMultiplier),
        techniques: player.techniques.filter(t => techniques.find(tech => tech.id === t)?.category === 'legendary'),
        artifacts: player.artifacts,
        pills: { "Qi Gathering Pill": 5, "Healing Pill": 3, "Breakthrough Pill": 2 },
        achievements: [...player.achievements, `Reincarnation ${player.reincarnations + 1}`],
        reincarnations: player.reincarnations + 1,
        lastOnline: Date.now(),
        autoCultivating: player.autoCultivating,
        stats: {
          attack: Math.floor(10 * bonusMultiplier),
          defense: Math.floor(10 * bonusMultiplier),
          speed: Math.floor(10 * bonusMultiplier),
          wisdom: Math.floor(10 * bonusMultiplier)
        },
        totalExperience: player.totalExperience,
        breakthroughAttempts: player.breakthroughAttempts,
        successfulBreakthroughs: player.successfulBreakthroughs
      });
      
      addToLog(`🔄 Reincarnated! Starting over with ${Math.floor(bonusMultiplier * 100)}% stat bonus.`);
    }
  };

  const toggleAutoCultivation = () => {
    setPlayer(prev => ({
      ...prev,
      autoCultivating: !prev.autoCultivating
    }));
    
    addToLog(player.autoCultivating ? "⏸️ Auto-cultivation disabled." : "▶️ Auto-cultivation enabled.");
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getPowerLevel = () => {
    const { attack, defense, speed, wisdom } = player.stats;
    return attack + defense + speed + wisdom + player.spiritualPower;
  };

  const getSuccessRate = () => {
    if (player.realm >= realms.length - 1) return 100;
    
    const luckBonus = Math.max(0, (player.luck - 50) / 100);
    const karmaBonus = Math.max(0, player.karma / 100);
    const techniqueBonus = player.techniques.includes('basic_meditation') ? 0.1 : 0;
    const immunityBonus = player.techniques.includes('heaven_defying') ? 0.5 : 0;
    
    return Math.min(95, Math.floor((0.5 + luckBonus + karmaBonus + techniqueBonus + immunityBonus) * 100));
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-500';
      case 'rare': return 'text-blue-500';
      case 'epic': return 'text-purple-500';
      case 'legendary': return 'text-yellow-500';
      case 'divine': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'combat': return 'text-red-500';
      case 'cultivation': return 'text-green-500';
      case 'utility': return 'text-blue-500';
      case 'legendary': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  if (!gameStarted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="glass-panel p-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Zap className="w-8 h-8 text-primary" />
            <h1 className="orbitron text-3xl font-bold text-primary">Cultivation Journey</h1>
          </div>
          <p className="text-secondary mb-8 max-w-2xl mx-auto">
            Embark on an epic cultivation journey from a mere mortal to an omnipotent being. 
            Train, meditate, face tribulations, and transcend the heavens themselves!
          </p>
          <div className="mb-6 p-4 bg-glass rounded-lg max-w-md mx-auto">
            <h3 className="font-semibold text-secondary mb-2">✨ Enhanced Features!</h3>
            <ul className="text-sm text-muted space-y-1">
              <li>• Advanced stat system with combat attributes</li>
              <li>• Technique learning and mastery system</li>
              <li>• Enhanced encounters with meaningful choices</li>
              <li>• Beautiful visual realm progression</li>
              <li>• Improved auto-cultivation mechanics</li>
              <li>• Artifact collection and effects</li>
              <li>• Detailed statistics tracking</li>
            </ul>
          </div>
          <button
            onClick={startGame}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-primary-dark 
                     text-white rounded-full golden-glow transition-all hover:scale-105 mx-auto text-lg"
          >
            <Play className="w-5 h-5" />
            Begin Cultivation
          </button>
        </div>
      </div>
    );
  }

  const currentRealm = realms[player.realm];
  const progressPercent = (player.experience / player.experienceToNext) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Offline Progress Modal */}
      {offlineProgress && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-panel p-8 max-w-md mx-4">
            <h3 className="orbitron text-xl font-bold text-primary mb-4 text-center">
              Welcome Back, Cultivator!
            </h3>
            <div className="space-y-3 mb-6">
              <p className="text-secondary text-center">
                You were away for {formatTime(offlineProgress.timeAway)}
              </p>
              <div className="p-3 bg-glass rounded-lg">
                <p className="text-sm text-muted">Experience Gained:</p>
                <p className="font-bold text-primary">{offlineProgress.experienceGained.toLocaleString()}</p>
              </div>
              {offlineProgress.breakthroughs.length > 0 && (
                <div className="p-3 bg-glass rounded-lg">
                  <p className="text-sm text-muted">Breakthroughs:</p>
                  {offlineProgress.breakthroughs.map((realm, index) => (
                    <p key={index} className="font-bold text-primary">🎉 {realm}</p>
                  ))}
                </div>
              )}
              {offlineProgress.encountersFound > 0 && (
                <div className="p-3 bg-glass rounded-lg">
                  <p className="text-sm text-muted">Encounters Found:</p>
                  <p className="font-bold text-secondary">{offlineProgress.encountersFound}</p>
                </div>
              )}
              {offlineProgress.pillsFound.length > 0 && (
                <div className="p-3 bg-glass rounded-lg">
                  <p className="text-sm text-muted">Pills Found:</p>
                  {offlineProgress.pillsFound.map((pill, index) => (
                    <p key={index} className="text-sm text-primary">💊 {pill}</p>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setOfflineProgress(null)}
              className="w-full px-4 py-2 bg-gradient-to-r from-primary to-primary-dark text-white 
                       rounded-lg hover:scale-105 transition-all"
            >
              Continue Cultivation
            </button>
          </div>
        </div>
      )}

      {/* Tribulation Modal */}
      {showTribulation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-panel p-8 max-w-md mx-4">
            <h3 className="orbitron text-xl font-bold text-primary mb-4 text-center">
              ⚡ Heavenly Tribulation! ⚡
            </h3>
            <p className="text-secondary mb-4 text-center">
              The heavens test your worthiness to advance!
            </p>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <div 
                className="bg-gradient-to-r from-purple-500 via-blue-500 to-yellow-500 h-4 rounded-full transition-all duration-100"
                style={{ width: `${tribulationProgress}%` }}
              />
            </div>
            <p className="text-center text-muted">Facing tribulation... {Math.floor(tribulationProgress)}%</p>
          </div>
        </div>
      )}

      {/* Encounter Modal */}
      {currentEncounter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-panel p-6 max-w-lg mx-4">
            <h3 className="orbitron text-xl font-bold text-primary mb-4">
              {currentEncounter.title}
            </h3>
            <p className="text-secondary mb-6">{currentEncounter.description}</p>
            <div className="space-y-3">
              {currentEncounter.choices.map((choice, index) => (
                <button
                  key={index}
                  onClick={() => handleEncounterChoice(choice)}
                  className="w-full p-3 bg-glass hover:bg-glass-hover rounded-lg text-left transition-all"
                >
                  <div className="font-semibold text-secondary">{choice.text}</div>
                  <div className="text-sm text-muted">
                    Karma: {choice.karmaChange > 0 ? '+' : ''}{choice.karmaChange} | 
                    Luck: {choice.luckChange > 0 ? '+' : ''}{choice.luckChange}
                    {choice.experienceGain && (
                      <span className="text-primary ml-2">+{choice.experienceGain} exp</span>
                    )}
                    {choice.statBonus && (
                      <span className="text-primary ml-2">
                        +Stats: {Object.entries(choice.statBonus).map(([stat, bonus]) => `${stat}+${bonus}`).join(', ')}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Realm Info Modal */}
      {showRealmInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-panel p-6 max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="orbitron text-xl font-bold text-primary">Realm Information</h3>
              <button
                onClick={() => setShowRealmInfo(false)}
                className="p-2 hover:bg-glass-hover rounded-lg transition-all"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span style={{ color: currentRealm.color, fontSize: '2rem' }}>{currentRealm.icon}</span>
                <div>
                  <h4 className="font-bold text-secondary">{currentRealm.name}</h4>
                  <p className="text-sm text-muted">{currentRealm.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted">Stat Multiplier:</span>
                  <span className="text-primary ml-2">{currentRealm.statMultiplier}x</span>
                </div>
                <div>
                  <span className="text-muted">Lifespan Bonus:</span>
                  <span className="text-primary ml-2">+{currentRealm.lifespanBonus}</span>
                </div>
                <div>
                  <span className="text-muted">Tribulation Chance:</span>
                  <span className="text-primary ml-2">{Math.floor(currentRealm.tribulationChance * 100)}%</span>
                </div>
                <div>
                  <span className="text-muted">Success Rate:</span>
                  <span className="text-primary ml-2">{getSuccessRate()}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player Stats */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="orbitron text-2xl font-bold text-primary">{player.name}</h2>
                <div className="flex items-center gap-2">
                  <span style={{ color: currentRealm.color }}>{currentRealm.icon}</span>
                  <p className="text-secondary">{currentRealm.name} - Level {player.level}</p>
                  <button
                    onClick={() => setShowRealmInfo(true)}
                    className="p-1 hover:bg-glass-hover rounded transition-all"
                  >
                    <Eye className="w-4 h-4 text-primary" />
                  </button>
                </div>
                <p className="text-muted text-sm">{currentRealm.description}</p>
                <p className="text-primary text-sm font-bold">Power Level: {getPowerLevel().toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted">Reincarnations: {player.reincarnations}</p>
                <p className="text-sm text-muted">Lifespan: {player.lifespan.toLocaleString()}/{player.maxLifespan.toLocaleString()}</p>
                <p className="text-sm text-muted">Success Rate: {getSuccessRate()}%</p>
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className={`text-sm ${player.autoCultivating ? 'text-green-500' : 'text-red-500'}`}>
                    Auto-Cultivation {player.autoCultivating ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-muted mb-2">
                <span>Experience</span>
                <span>{player.experience.toLocaleString()}/{player.experienceToNext.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-primary to-primary-dark h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, progressPercent)}%` }}
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {[
                { id: 'stats', label: 'Stats', icon: Heart },
                { id: 'techniques', label: 'Techniques', icon: Brain },
                { id: 'artifacts', label: 'Artifacts', icon: Crown },
                { id: 'pills', label: 'Pills', icon: Gift },
                { id: 'achievements', label: 'Achievements', icon: Star }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id as any)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      selectedTab === tab.id
                        ? 'bg-primary text-white'
                        : 'bg-glass text-secondary hover:bg-glass-hover'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            {selectedTab === 'stats' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`text-center p-3 bg-glass rounded-lg transition-all ${animatingStats.includes('health') ? 'scale-110 bg-green-200' : ''}`}>
                    <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
                    <div className="text-sm text-muted">Health</div>
                    <div className="font-bold text-secondary">{player.health.toLocaleString()}/{player.maxHealth.toLocaleString()}</div>
                  </div>
                  <div className={`text-center p-3 bg-glass rounded-lg transition-all ${animatingStats.includes('qi') ? 'scale-110 bg-blue-200' : ''}`}>
                    <Zap className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <div className="text-sm text-muted">Qi</div>
                    <div className="font-bold text-secondary">{player.qi.toLocaleString()}/{player.maxQi.toLocaleString()}</div>
                  </div>
                  <div className={`text-center p-3 bg-glass rounded-lg transition-all ${animatingStats.includes('spiritualPower') ? 'scale-110 bg-purple-200' : ''}`}>
                    <Brain className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                    <div className="text-sm text-muted">Spiritual Power</div>
                    <div className="font-bold text-secondary">{player.spiritualPower.toLocaleString()}</div>
                  </div>
                  <div className="text-center p-3 bg-glass rounded-lg">
                    <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                    <div className="text-sm text-muted">Luck</div>
                    <div className="font-bold text-secondary">{player.luck}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`text-center p-3 bg-glass rounded-lg transition-all ${animatingStats.includes('attack') ? 'scale-110 bg-red-200' : ''}`}>
                    <Sword className="w-6 h-6 text-red-600 mx-auto mb-2" />
                    <div className="text-sm text-muted">Attack</div>
                    <div className="font-bold text-secondary">{player.stats.attack.toLocaleString()}</div>
                  </div>
                  <div className={`text-center p-3 bg-glass rounded-lg transition-all ${animatingStats.includes('defense') ? 'scale-110 bg-blue-200' : ''}`}>
                    <Shield className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-sm text-muted">Defense</div>
                    <div className="font-bold text-secondary">{player.stats.defense.toLocaleString()}</div>
                  </div>
                  <div className={`text-center p-3 bg-glass rounded-lg transition-all ${animatingStats.includes('speed') ? 'scale-110 bg-green-200' : ''}`}>
                    <Zap className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <div className="text-sm text-muted">Speed</div>
                    <div className="font-bold text-secondary">{player.stats.speed.toLocaleString()}</div>
                  </div>
                  <div className={`text-center p-3 bg-glass rounded-lg transition-all ${animatingStats.includes('wisdom') ? 'scale-110 bg-purple-200' : ''}`}>
                    <Eye className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <div className="text-sm text-muted">Wisdom</div>
                    <div className="font-bold text-secondary">{player.stats.wisdom.toLocaleString()}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-glass rounded-lg">
                    <div className="text-sm text-muted">Karma</div>
                    <div className={`font-bold ${player.karma >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {player.karma}
                    </div>
                    <div className="text-xs text-muted mt-1">
                      Meditation Bonus: +{Math.floor(Math.max(0, player.karma / 100) * 100)}%
                    </div>
                  </div>
                  <div className="text-center p-3 bg-glass rounded-lg">
                    <div className="text-sm text-muted">Cultivation Points</div>
                    <div className="font-bold text-primary">{player.cultivationPoints.toLocaleString()}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 bg-glass rounded-lg">
                    <div className="text-muted">Total Experience</div>
                    <div className="font-bold text-primary">{player.totalExperience.toLocaleString()}</div>
                  </div>
                  <div className="text-center p-3 bg-glass rounded-lg">
                    <div className="text-muted">Breakthrough Attempts</div>
                    <div className="font-bold text-secondary">{player.breakthroughAttempts}</div>
                  </div>
                  <div className="text-center p-3 bg-glass rounded-lg">
                    <div className="text-muted">Success Rate</div>
                    <div className="font-bold text-green-500">
                      {player.breakthroughAttempts > 0 ? Math.floor((player.successfulBreakthroughs / player.breakthroughAttempts) * 100) : 0}%
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'techniques' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-secondary">Available Techniques</h4>
                  <p className="text-sm text-muted">Cultivation Points: {player.cultivationPoints}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {techniques.map(technique => {
                    const isLearned = player.techniques.includes(technique.id);
                    const canLearn = player.realm >= technique.unlockRealm && player.cultivationPoints >= technique.cost;
                    
                    return (
                      <div
                        key={technique.id}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          isLearned
                            ? 'border-green-500 bg-green-100/20'
                            : canLearn
                            ? 'border-primary bg-glass hover:bg-glass-hover cursor-pointer'
                            : 'border-gray-300 bg-gray-100/20 opacity-50'
                        }`}
                        onClick={() => !isLearned && canLearn && learnTechnique(technique)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-semibold text-secondary">{technique.name}</h5>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(technique.category)} bg-current/10`}>
                              {technique.category}
                            </span>
                            {isLearned && <span className="text-green-500">✓</span>}
                          </div>
                        </div>
                        <p className="text-sm text-muted mb-2">{technique.description}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-primary">{technique.effect}</span>
                          <span className="text-muted">Cost: {technique.cost}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedTab === 'artifacts' && (
              <div className="space-y-3">
                <h4 className="font-semibold text-secondary">Collected Artifacts</h4>
                {player.artifacts.length === 0 ? (
                  <p className="text-muted text-center py-8">No artifacts collected yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {player.artifacts.map((artifactId, index) => {
                      const artifact = artifacts.find(a => a.id === artifactId);
                      if (!artifact) return null;
                      
                      return (
                        <div key={index} className="p-3 bg-glass rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-semibold text-secondary">{artifact.name}</h5>
                            <span className={`text-xs px-2 py-1 rounded ${getRarityColor(artifact.rarity)} bg-current/10`}>
                              {artifact.rarity}
                            </span>
                          </div>
                          <p className="text-sm text-muted mb-2">{artifact.description}</p>
                          <div className="space-y-1">
                            {artifact.effects.map((effect, i) => (
                              <p key={i} className="text-xs text-primary">• {effect}</p>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {selectedTab === 'pills' && (
              <div className="space-y-4">
                <h4 className="font-semibold text-secondary">Pill Collection</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {Object.entries(player.pills).map(([pill, count]) => (
                    <div key={pill} className="p-4 bg-glass rounded-lg text-center">
                      <div className="text-2xl mb-2">💊</div>
                      <h5 className="font-semibold text-secondary mb-1">{pill}</h5>
                      <p className="text-lg font-bold text-primary">{count}</p>
                      <button
                        onClick={() => usePill(pill)}
                        disabled={count <= 0}
                        className="mt-2 px-3 py-1 bg-primary text-white rounded-lg text-sm 
                                 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all"
                      >
                        Use
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === 'achievements' && (
              <div className="space-y-3">
                <h4 className="font-semibold text-secondary">Achievements</h4>
                {player.achievements.length === 0 ? (
                  <p className="text-muted text-center py-8">No achievements unlocked yet.</p>
                ) : (
                  player.achievements.map((achievement, index) => (
                    <div key={index} className="p-3 bg-glass rounded-lg">
                      <h5 className="font-semibold text-secondary">🏆 {achievement}</h5>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="glass-panel p-6">
            <h3 className="orbitron text-xl font-bold text-secondary mb-4">Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={meditate}
                disabled={isTraining || player.qi < 10}
                className="p-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg 
                         hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTraining ? <Pause className="w-5 h-5 mx-auto" /> : "🧘 Meditate"}
              </button>
              <button
                onClick={train}
                disabled={isTraining || player.health < 20}
                className="p-3 bg-gradient-to-r from-red-400 to-red-600 text-white rounded-lg 
                         hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTraining ? <Pause className="w-5 h-5 mx-auto" /> : "💪 Train"}
              </button>
              <button
                onClick={rest}
                className="p-3 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-lg 
                         hover:scale-105 transition-all"
              >
                😴 Rest
              </button>
              <button
                onClick={triggerEncounter}
                className="p-3 bg-gradient-to-r from-purple-400 to-purple-600 text-white rounded-lg 
                         hover:scale-105 transition-all"
              >
                🚶 Explore
              </button>
            </div>

            {/* Advanced Actions */}
            <div className="mt-4 pt-4 border-t border-primary/30">
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={toggleAutoCultivation}
                  className={`px-4 py-2 rounded-lg hover:scale-105 transition-all ${
                    player.autoCultivating 
                      ? 'bg-gradient-to-r from-green-400 to-green-600 text-white'
                      : 'bg-gradient-to-r from-gray-400 to-gray-600 text-white'
                  }`}
                >
                  <Clock className="w-4 h-4 inline mr-2" />
                  Auto-Cultivation
                </button>
                <button
                  onClick={reincarnate}
                  disabled={player.realm < 10}
                  className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-lg 
                           hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-4 h-4 inline mr-2" />
                  Reincarnate
                </button>
                <button
                  onClick={resetGame}
                  className="px-4 py-2 bg-gradient-to-r from-gray-400 to-gray-600 text-white rounded-lg 
                           hover:scale-105 transition-all"
                >
                  <RotateCcw className="w-4 h-4 inline mr-2" />
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Game Log */}
        <div className="glass-panel p-6">
          <h3 className="orbitron text-xl font-bold text-secondary mb-4">Cultivation Log</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {gameLog.map((log, index) => (
              <div key={index} className="text-sm text-muted p-2 bg-glass rounded">
                {log}
              </div>
            ))}
            {gameLog.length === 0 && (
              <div className="text-center text-muted py-8">
                <Scroll className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Your cultivation journey will be recorded here...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CultivationGame;