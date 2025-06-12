import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Heart, Brain, Star, Sparkles, Save, RotateCcw, Play, Pause, Clock } from 'lucide-react';

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
}

interface Realm {
  name: string;
  description: string;
  experienceRequired: number;
  tribulationChance: number;
  lifespanBonus: number;
  statMultiplier: number;
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
  }[];
}

const CultivationGame: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [currentEncounter, setCurrentEncounter] = useState<Encounter | null>(null);
  const [gameLog, setGameLog] = useState<string[]>([]);
  const [showTribulation, setShowTribulation] = useState(false);
  const [tribulationProgress, setTribulationProgress] = useState(0);
  const [offlineProgress, setOfflineProgress] = useState<{
    timeAway: number;
    experienceGained: number;
    breakthroughs: string[];
  } | null>(null);

  const realms: Realm[] = [
    { name: "Mortal", description: "An ordinary person beginning their journey", experienceRequired: 0, tribulationChance: 0, lifespanBonus: 0, statMultiplier: 1 },
    { name: "Qi Refining", description: "Learning to sense and gather Qi", experienceRequired: 100, tribulationChance: 0.1, lifespanBonus: 20, statMultiplier: 1.2 },
    { name: "Foundation Establishment", description: "Building a solid cultivation foundation", experienceRequired: 300, tribulationChance: 0.15, lifespanBonus: 50, statMultiplier: 1.5 },
    { name: "Core Formation", description: "Forming a golden core within", experienceRequired: 600, tribulationChance: 0.2, lifespanBonus: 100, statMultiplier: 2 },
    { name: "Nascent Soul", description: "Birth of the nascent soul", experienceRequired: 1000, tribulationChance: 0.25, lifespanBonus: 200, statMultiplier: 2.5 },
    { name: "Soul Transformation", description: "Transforming the very essence of being", experienceRequired: 1500, tribulationChance: 0.3, lifespanBonus: 300, statMultiplier: 3 },
    { name: "Void Refinement", description: "Refining oneself in the void", experienceRequired: 2200, tribulationChance: 0.35, lifespanBonus: 500, statMultiplier: 4 },
    { name: "Body Integration", description: "Perfect unity of body and soul", experienceRequired: 3000, tribulationChance: 0.4, lifespanBonus: 700, statMultiplier: 5 },
    { name: "Mahayana", description: "The great vehicle to enlightenment", experienceRequired: 4000, tribulationChance: 0.45, lifespanBonus: 1000, statMultiplier: 6 },
    { name: "Tribulation Transcendence", description: "Transcending mortal tribulations", experienceRequired: 5500, tribulationChance: 0.5, lifespanBonus: 1500, statMultiplier: 8 },
    { name: "Earth Immortal", description: "First step into immortality", experienceRequired: 7500, tribulationChance: 0.55, lifespanBonus: 2000, statMultiplier: 10 },
    { name: "Heaven Immortal", description: "Immortal of the heavenly realm", experienceRequired: 10000, tribulationChance: 0.6, lifespanBonus: 3000, statMultiplier: 12 },
    { name: "Mystic Immortal", description: "Master of mystical arts", experienceRequired: 13000, tribulationChance: 0.65, lifespanBonus: 4000, statMultiplier: 15 },
    { name: "Golden Immortal", description: "Immortal with golden radiance", experienceRequired: 17000, tribulationChance: 0.7, lifespanBonus: 6000, statMultiplier: 18 },
    { name: "Taiyi Golden Immortal", description: "Supreme golden immortal", experienceRequired: 22000, tribulationChance: 0.75, lifespanBonus: 8000, statMultiplier: 22 },
    { name: "Daluo Golden Immortal", description: "Transcendent golden immortal", experienceRequired: 28000, tribulationChance: 0.8, lifespanBonus: 12000, statMultiplier: 28 },
    { name: "Quasi-Saint", description: "Almost a saint, but not quite", experienceRequired: 35000, tribulationChance: 0.85, lifespanBonus: 15000, statMultiplier: 35 },
    { name: "Saint", description: "A true saint of cultivation", experienceRequired: 45000, tribulationChance: 0.9, lifespanBonus: 20000, statMultiplier: 45 },
    { name: "Celestial Emperor", description: "Ruler of celestial realms", experienceRequired: 60000, tribulationChance: 0.95, lifespanBonus: 30000, statMultiplier: 60 },
    { name: "Divine Sovereign", description: "Sovereign of divine power", experienceRequired: 80000, tribulationChance: 0.98, lifespanBonus: 50000, statMultiplier: 80 },
    { name: "Primordial Ancestor", description: "Ancient being from primordial times", experienceRequired: 120000, tribulationChance: 0.99, lifespanBonus: 100000, statMultiplier: 120 },
    { name: "Chaos Lord", description: "Master of primordial chaos", experienceRequired: 200000, tribulationChance: 0.995, lifespanBonus: 200000, statMultiplier: 200 },
    { name: "Void Emperor", description: "Emperor of the endless void", experienceRequired: 350000, tribulationChance: 0.998, lifespanBonus: 500000, statMultiplier: 350 },
    { name: "Eternal Sovereign", description: "Eternal ruler beyond time", experienceRequired: 600000, tribulationChance: 0.999, lifespanBonus: 1000000, statMultiplier: 600 },
    { name: "Omnipotent Dao", description: "One with the eternal Dao", experienceRequired: 1000000, tribulationChance: 1, lifespanBonus: 10000000, statMultiplier: 1000 }
  ];

  const encounters: Encounter[] = [
    {
      id: "rogue_cultivator",
      title: "Rogue Cultivator",
      description: "A rogue cultivator blocks your path, demanding tribute.",
      choices: [
        { text: "Fight them", karmaChange: -5, luckChange: -10, reward: "Combat experience", risk: "Injury" },
        { text: "Pay tribute", karmaChange: 0, luckChange: 5, reward: "Safe passage" },
        { text: "Try to reason", karmaChange: 10, luckChange: 0, reward: "Peaceful resolution" }
      ]
    },
    {
      id: "secret_realm",
      title: "Secret Realm",
      description: "You discover a hidden secret realm filled with ancient treasures.",
      choices: [
        { text: "Enter cautiously", karmaChange: 0, luckChange: 20, reward: "Ancient artifact" },
        { text: "Rush in boldly", karmaChange: -5, luckChange: -10, reward: "Great treasure", risk: "Dangerous trap" },
        { text: "Mark location and leave", karmaChange: 5, luckChange: 10, reward: "Future opportunity" }
      ]
    },
    {
      id: "injured_cultivator",
      title: "Injured Cultivator",
      description: "You find a severely injured cultivator who begs for help.",
      choices: [
        { text: "Help them", karmaChange: 20, luckChange: 15, reward: "Good karma and gratitude" },
        { text: "Rob them", karmaChange: -30, luckChange: -20, reward: "Their possessions", risk: "Bad karma" },
        { text: "Ignore them", karmaChange: -5, luckChange: 0, reward: "Nothing" }
      ]
    },
    {
      id: "ancient_master",
      title: "Ancient Master",
      description: "An ancient master offers to teach you a powerful technique.",
      choices: [
        { text: "Accept humbly", karmaChange: 10, luckChange: 25, reward: "Powerful technique" },
        { text: "Demand more", karmaChange: -15, luckChange: -10, reward: "Anger the master", risk: "Curse" },
        { text: "Politely decline", karmaChange: 5, luckChange: 5, reward: "Respect gained" }
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
    pills: { "Qi Gathering Pill": 3, "Healing Pill": 2 },
    achievements: [],
    reincarnations: 0,
    lastOnline: Date.now(),
    autoCultivating: true
  });

  // Calculate offline progress
  const calculateOfflineProgress = useCallback((lastOnline: number, currentTime: number, playerData: Player) => {
    const timeAway = Math.floor((currentTime - lastOnline) / 1000); // seconds
    if (timeAway < 60 || !playerData.autoCultivating) return null; // Less than 1 minute or auto-cultivation disabled

    const hoursAway = timeAway / 3600;
    const baseExpPerHour = 50 + (playerData.realm * 10); // More exp at higher realms
    const luckBonus = Math.max(0, (playerData.luck - 50) / 100);
    const karmaBonus = Math.max(0, playerData.karma / 200);
    
    const expPerHour = Math.floor(baseExpPerHour * (1 + luckBonus + karmaBonus));
    const totalExpGained = Math.floor(expPerHour * Math.min(hoursAway, 24)); // Cap at 24 hours

    return {
      timeAway,
      experienceGained: totalExpGained,
      breakthroughs: []
    };
  }, []);

  // Process offline progress and breakthroughs
  const processOfflineProgress = useCallback((progress: any, currentPlayer: Player) => {
    let updatedPlayer = { ...currentPlayer };
    let breakthroughs: string[] = [];
    
    updatedPlayer.experience += progress.experienceGained;
    
    // Check for breakthroughs
    while (updatedPlayer.experience >= updatedPlayer.experienceToNext && updatedPlayer.realm < realms.length - 1) {
      const nextRealm = realms[updatedPlayer.realm + 1];
      if (!nextRealm) break;

      // Simplified breakthrough for offline progress
      const successChance = 0.7 + Math.max(0, (updatedPlayer.luck - 50) / 200) + Math.max(0, updatedPlayer.karma / 300);
      
      if (Math.random() < successChance) {
        breakthroughs.push(nextRealm.name);
        updatedPlayer = advanceRealm(updatedPlayer);
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
      
      // Calculate offline progress
      const progress = calculateOfflineProgress(savedData.player.lastOnline, currentTime, savedData.player);
      
      if (progress && progress.experienceGained > 0) {
        const { updatedPlayer, breakthroughs } = processOfflineProgress(progress, savedData.player);
        progress.breakthroughs = breakthroughs;
        
        setPlayer({ ...updatedPlayer, lastOnline: currentTime });
        setOfflineProgress(progress);
        setGameStarted(savedData.gameStarted);
        setGameLog(savedData.gameLog || []);
      } else {
        setPlayer({ ...savedData.player, lastOnline: currentTime });
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
        
        const expGain = Math.floor(baseExp * (1 + luckBonus + karmaBonus));
        
        const newPlayer = {
          ...prev,
          experience: prev.experience + expGain,
          lastOnline: Date.now()
        };

        // Check for breakthrough
        if (newPlayer.experience >= newPlayer.experienceToNext && newPlayer.realm < realms.length - 1) {
          return attemptBreakthrough(newPlayer);
        }

        return newPlayer;
      });
    }, 10000); // Gain experience every 10 seconds

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

  const startGame = () => {
    setGameStarted(true);
    addToLog("Your cultivation journey begins!");
  };

  const resetGame = () => {
    if (confirm("Are you sure you want to reset your cultivation progress?")) {
      setPlayer({
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
        pills: { "Qi Gathering Pill": 3, "Healing Pill": 2 },
        achievements: [],
        reincarnations: 0,
        lastOnline: Date.now(),
        autoCultivating: true
      });
      setGameLog([]);
      setGameStarted(false);
      localStorage.removeItem('cultivationGame');
    }
  };

  const gainExperience = (amount: number) => {
    setPlayer(prev => {
      const newExp = prev.experience + amount;
      const newPlayer = { ...prev, experience: newExp };
      
      if (newExp >= prev.experienceToNext && prev.realm < realms.length - 1) {
        return attemptBreakthrough(newPlayer);
      }
      
      return newPlayer;
    });
  };

  const attemptBreakthrough = (currentPlayer: Player): Player => {
    const nextRealm = realms[currentPlayer.realm + 1];
    const currentRealm = realms[currentPlayer.realm];
    
    if (!nextRealm) return currentPlayer;

    const tribulationChance = nextRealm.tribulationChance;
    const luckBonus = Math.max(0, (currentPlayer.luck - 50) / 100);
    const karmaBonus = Math.max(0, currentPlayer.karma / 100);
    
    const successChance = Math.min(0.95, 0.5 + luckBonus + karmaBonus);
    const success = Math.random() < successChance;

    if (Math.random() < tribulationChance) {
      setShowTribulation(true);
      setTribulationProgress(0);
      
      const tribulationInterval = setInterval(() => {
        setTribulationProgress(prev => {
          if (prev >= 100) {
            clearInterval(tribulationInterval);
            setShowTribulation(false);
            
            if (success) {
              addToLog(`Successfully transcended tribulation! Advanced to ${nextRealm.name}!`);
              setPlayer(prevPlayer => advanceRealm(prevPlayer));
            } else {
              addToLog("Failed tribulation! Suffered severe injuries but survived.");
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
      
      return currentPlayer;
    } else {
      if (success) {
        addToLog(`Breakthrough successful! Advanced to ${nextRealm.name}!`);
        return advanceRealm(currentPlayer);
      } else {
        addToLog("Breakthrough failed. Continue cultivating.");
        return {
          ...currentPlayer,
          experience: Math.floor(currentPlayer.experience * 0.9)
        };
      }
    }
  };

  const advanceRealm = (currentPlayer: Player): Player => {
    const nextRealm = realms[currentPlayer.realm + 1];
    if (!nextRealm) return currentPlayer;

    const multiplier = nextRealm.statMultiplier;
    
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
      cultivationPoints: currentPlayer.cultivationPoints + 10
    };
  };

  const meditate = () => {
    if (player.qi < 10) {
      addToLog("Not enough Qi to meditate!");
      return;
    }

    setIsTraining(true);
    setTimeout(() => {
      // Karma-based experience calculation
      const baseExp = Math.floor(Math.random() * 20) + 10;
      const karmaMultiplier = Math.max(0.5, 1 + (player.karma / 100)); // Karma significantly affects meditation
      const expGain = Math.floor(baseExp * karmaMultiplier);
      const qiCost = 10;
      
      setPlayer(prev => ({
        ...prev,
        qi: prev.qi - qiCost,
        spiritualPower: prev.spiritualPower + 1
      }));
      
      gainExperience(expGain);
      addToLog(`Meditated deeply. Gained ${expGain} experience (karma bonus: ${Math.floor((karmaMultiplier - 1) * 100)}%).`);
      setIsTraining(false);
    }, 2000);
  };

  const train = () => {
    if (player.health < 20) {
      addToLog("Too injured to train!");
      return;
    }

    setIsTraining(true);
    setTimeout(() => {
      const expGain = Math.floor(Math.random() * 30) + 15;
      const healthCost = 15;
      
      setPlayer(prev => ({
        ...prev,
        health: Math.max(1, prev.health - healthCost)
      }));
      
      gainExperience(expGain);
      addToLog(`Trained intensively. Gained ${expGain} experience.`);
      setIsTraining(false);
    }, 3000);
  };

  const rest = () => {
    const healthGain = Math.floor(player.maxHealth * 0.3);
    const qiGain = Math.floor(player.maxQi * 0.5);
    
    setPlayer(prev => ({
      ...prev,
      health: Math.min(prev.maxHealth, prev.health + healthGain),
      qi: Math.min(prev.maxQi, prev.qi + qiGain),
      lifespan: prev.lifespan - 1
    }));
    
    addToLog(`Rested and recovered. Gained ${healthGain} health and ${qiGain} Qi.`);
  };

  const usePill = (pillName: string) => {
    if (player.pills[pillName] <= 0) {
      addToLog(`No ${pillName} remaining!`);
      return;
    }

    setPlayer(prev => {
      const newPills = { ...prev.pills };
      newPills[pillName]--;
      
      let updates = { pills: newPills };
      
      if (pillName === "Healing Pill") {
        updates = { ...updates, health: Math.min(prev.maxHealth, prev.health + 50) };
        addToLog("Used Healing Pill. Restored 50 health.");
      } else if (pillName === "Qi Gathering Pill") {
        updates = { ...updates, qi: Math.min(prev.maxQi, prev.qi + 30) };
        addToLog("Used Qi Gathering Pill. Restored 30 Qi.");
      }
      
      return { ...prev, ...updates };
    });
  };

  const triggerEncounter = () => {
    if (Math.random() < 0.3) {
      const encounter = encounters[Math.floor(Math.random() * encounters.length)];
      setCurrentEncounter(encounter);
    }
  };

  const handleEncounterChoice = (choice: any) => {
    if (!currentEncounter) return;

    setPlayer(prev => ({
      ...prev,
      karma: prev.karma + choice.karmaChange,
      luck: Math.max(0, Math.min(100, prev.luck + choice.luckChange))
    }));

    addToLog(`${currentEncounter.title}: ${choice.text}. ${choice.reward || ''}`);
    
    if (choice.reward === "Ancient artifact") {
      setPlayer(prev => ({
        ...prev,
        artifacts: [...prev.artifacts, "Ancient Cultivation Manual"]
      }));
    }

    setCurrentEncounter(null);
  };

  const reincarnate = () => {
    if (player.realm < 10) {
      addToLog("Must reach at least Earth Immortal realm to reincarnate!");
      return;
    }

    if (confirm("Reincarnate and start over with bonuses?")) {
      const bonusMultiplier = 1 + (player.reincarnations * 0.1);
      
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
        techniques: player.techniques,
        artifacts: player.artifacts,
        pills: { "Qi Gathering Pill": 5, "Healing Pill": 3 },
        achievements: [...player.achievements, `Reincarnation ${player.reincarnations + 1}`],
        reincarnations: player.reincarnations + 1,
        lastOnline: Date.now(),
        autoCultivating: player.autoCultivating
      });
      
      addToLog(`Reincarnated! Starting over with ${Math.floor(bonusMultiplier * 100)}% stat bonus.`);
    }
  };

  const toggleAutoCultivation = () => {
    setPlayer(prev => ({
      ...prev,
      autoCultivating: !prev.autoCultivating
    }));
    
    addToLog(player.autoCultivating ? "Auto-cultivation disabled." : "Auto-cultivation enabled.");
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
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
              <li>• Auto-cultivation while online and offline</li>
              <li>• Unlock new color themes with each breakthrough</li>
              <li>• Karma now significantly boosts meditation experience</li>
              <li>• Passive experience gain based on your realm</li>
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
              Welcome Back!
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
              Heavenly Tribulation!
            </h3>
            <p className="text-secondary mb-4 text-center">
              The heavens test your worthiness to advance!
            </p>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <div 
                className="bg-gradient-to-r from-purple-500 to-yellow-500 h-4 rounded-full transition-all duration-100"
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
                  </div>
                </button>
              ))}
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
                <p className="text-secondary">{currentRealm.name} - Level {player.level}</p>
                <p className="text-muted text-sm">{currentRealm.description}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted">Reincarnations: {player.reincarnations}</p>
                <p className="text-sm text-muted">Lifespan: {player.lifespan}/{player.maxLifespan}</p>
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

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-glass rounded-lg">
                <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
                <div className="text-sm text-muted">Health</div>
                <div className="font-bold text-secondary">{player.health.toLocaleString()}/{player.maxHealth.toLocaleString()}</div>
              </div>
              <div className="text-center p-3 bg-glass rounded-lg">
                <Zap className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <div className="text-sm text-muted">Qi</div>
                <div className="font-bold text-secondary">{player.qi.toLocaleString()}/{player.maxQi.toLocaleString()}</div>
              </div>
              <div className="text-center p-3 bg-glass rounded-lg">
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

            <div className="grid grid-cols-2 gap-4 mt-4">
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
                {isTraining ? <Pause className="w-5 h-5 mx-auto" /> : "Meditate"}
              </button>
              <button
                onClick={train}
                disabled={isTraining || player.health < 20}
                className="p-3 bg-gradient-to-r from-red-400 to-red-600 text-white rounded-lg 
                         hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTraining ? <Pause className="w-5 h-5 mx-auto" /> : "Train"}
              </button>
              <button
                onClick={rest}
                className="p-3 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-lg 
                         hover:scale-105 transition-all"
              >
                Rest
              </button>
              <button
                onClick={triggerEncounter}
                className="p-3 bg-gradient-to-r from-purple-400 to-purple-600 text-white rounded-lg 
                         hover:scale-105 transition-all"
              >
                Explore
              </button>
            </div>

            {/* Pills */}
            <div className="mt-4">
              <h4 className="font-semibold text-secondary mb-2">Pills</h4>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(player.pills).map(([pill, count]) => (
                  <button
                    key={pill}
                    onClick={() => usePill(pill)}
                    disabled={count <= 0}
                    className="px-3 py-2 bg-glass hover:bg-glass-hover rounded-lg text-sm 
                             disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {pill} ({count})
                  </button>
                ))}
              </div>
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