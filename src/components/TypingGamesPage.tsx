import React, { useState, useEffect, useRef } from 'react';
import { Keyboard, Play, Pause, RotateCcw, Target, Zap, Clock, Trophy, Flame, Shield, Heart, Star } from 'lucide-react';

interface TypingStats {
  wpm: number;
  accuracy: number;
  score: number;
  timeElapsed: number;
}

interface GameWord {
  id: string;
  text: string;
  x: number;
  y: number;
  speed: number;
  typed: string;
  completed: boolean;
  color: string;
}

interface CodeSequence {
  id: string;
  code: string;
  timeLimit: number;
  points: number;
  typed: string;
  completed: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

const TypingGamesPage: React.FC = () => {
  const [activeGame, setActiveGame] = useState<'sprint' | 'codebreaker' | null>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameOver'>('menu');
  
  // Typing Sprint Game State
  const [sprintWords, setSprintWords] = useState<GameWord[]>([]);
  const [sprintInput, setSprintInput] = useState('');
  const [sprintStats, setSprintStats] = useState<TypingStats>({ wpm: 0, accuracy: 100, score: 0, timeElapsed: 0 });
  const [sprintLevel, setSprintLevel] = useState(1);
  const [sprintLives, setSprintLives] = useState(3);
  
  // Code Breaker Game State
  const [codeSequences, setCodeSequences] = useState<CodeSequence[]>([]);
  const [codeInput, setCodeInput] = useState('');
  const [codeStats, setCodeStats] = useState<TypingStats>({ wpm: 0, accuracy: 100, score: 0, timeElapsed: 0 });
  const [currentSequenceIndex, setCurrentSequenceIndex] = useState(0);
  const [bombTimer, setBombTimer] = useState(30);
  const [defusedBombs, setDefusedBombs] = useState(0);
  
  const gameLoopRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const totalKeystrokesRef = useRef(0);
  const correctKeystrokesRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Word lists for Typing Sprint
  const wordLists = {
    easy: ['cat', 'dog', 'run', 'jump', 'fast', 'slow', 'big', 'small', 'red', 'blue', 'green', 'yellow', 'happy', 'sad', 'good', 'bad'],
    medium: ['computer', 'keyboard', 'monitor', 'software', 'hardware', 'internet', 'website', 'programming', 'function', 'variable', 'array', 'object'],
    hard: ['algorithm', 'development', 'architecture', 'optimization', 'implementation', 'documentation', 'configuration', 'authentication', 'synchronization', 'polymorphism']
  };

  // Code sequences for Code Breaker
  const codeTemplates = {
    easy: [
      'for(i=0;i<10;i++)',
      'if(x > 0)',
      'let x = 5',
      'const arr = []',
      'function test()',
      'return true',
      'console.log(x)',
      'var name = "test"'
    ],
    medium: [
      'for(let i=0; i<arr.length; i++)',
      'if(x > 0 && y < 5)',
      'function getData(url)',
      'const result = await fetch()',
      'try { code(); } catch(e)',
      'while(condition) { break; }',
      'import { useState } from "react"',
      'export default function App()'
    ],
    hard: [
      'const memoizedCallback = useCallback(() => {})',
      'async function* asyncGenerator()',
      'Promise.all([fetch(url1), fetch(url2)])',
      'Object.defineProperty(obj, "prop", {})',
      'Array.from({length: 10}, (_, i) => i)',
      'const proxy = new Proxy(target, handler)',
      'class Component extends React.Component',
      'const [state, dispatch] = useReducer(reducer)'
    ]
  };

  useEffect(() => {
    if (gameState === 'playing') {
      startTimeRef.current = Date.now();
      totalKeystrokesRef.current = 0;
      correctKeystrokesRef.current = 0;
      
      if (activeGame === 'sprint') {
        startSprintGame();
      } else if (activeGame === 'codebreaker') {
        startCodeBreakerGame();
      }
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, activeGame]);

  useEffect(() => {
    if (inputRef.current && gameState === 'playing') {
      inputRef.current.focus();
    }
  }, [gameState, activeGame]);

  const startSprintGame = () => {
    setSprintWords([]);
    setSprintInput('');
    setSprintStats({ wpm: 0, accuracy: 100, score: 0, timeElapsed: 0 });
    setSprintLevel(1);
    setSprintLives(3);
    
    const gameLoop = () => {
      if (gameState !== 'playing') return;
      
      setSprintWords(prev => {
        const updated = prev.map(word => ({
          ...word,
          x: word.x - word.speed
        })).filter(word => {
          if (word.x < -200 && !word.completed) {
            setSprintLives(lives => {
              const newLives = lives - 1;
              if (newLives <= 0) {
                setGameState('gameOver');
              }
              return newLives;
            });
            return false;
          }
          return !word.completed;
        });
        
        // Add new words
        if (Math.random() < 0.015 + (sprintLevel * 0.003)) {
          const wordList = sprintLevel <= 3 ? wordLists.easy : 
                          sprintLevel <= 6 ? wordLists.medium : wordLists.hard;
          const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
          
          const newWord: GameWord = {
            id: Date.now().toString() + Math.random(),
            text: wordList[Math.floor(Math.random() * wordList.length)],
            x: window.innerWidth,
            y: Math.random() * 350 + 50,
            speed: 0.8 + (sprintLevel * 0.2),
            typed: '',
            completed: false,
            color: colors[Math.floor(Math.random() * colors.length)]
          };
          updated.push(newWord);
        }
        
        return updated;
      });
      
      // Update stats
      const timeElapsed = (Date.now() - startTimeRef.current!) / 1000;
      const wpm = totalKeystrokesRef.current > 0 ? 
        Math.round((correctKeystrokesRef.current / 5) / (timeElapsed / 60)) : 0;
      const accuracy = totalKeystrokesRef.current > 0 ? 
        Math.round((correctKeystrokesRef.current / totalKeystrokesRef.current) * 100) : 100;
      
      setSprintStats(prev => ({
        ...prev,
        wpm,
        accuracy,
        timeElapsed: Math.round(timeElapsed)
      }));
      
      // Level progression
      if (timeElapsed > sprintLevel * 20) {
        setSprintLevel(prev => prev + 1);
      }
      
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  };

  const startCodeBreakerGame = () => {
    const sequences: CodeSequence[] = [];
    const difficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'easy', 'medium', 'medium', 'hard'];
    
    for (let i = 0; i < 5; i++) {
      const difficulty = difficulties[i];
      const templates = codeTemplates[difficulty];
      sequences.push({
        id: i.toString(),
        code: templates[Math.floor(Math.random() * templates.length)],
        timeLimit: difficulty === 'easy' ? 45 : difficulty === 'medium' ? 35 : 25,
        points: difficulty === 'easy' ? 100 : difficulty === 'medium' ? 200 : 300,
        typed: '',
        completed: false,
        difficulty
      });
    }
    
    setCodeSequences(sequences);
    setCodeInput('');
    setCodeStats({ wpm: 0, accuracy: 100, score: 0, timeElapsed: 0 });
    setCurrentSequenceIndex(0);
    setBombTimer(sequences[0]?.timeLimit || 30);
    setDefusedBombs(0);
    
    const timerLoop = () => {
      if (gameState !== 'playing') return;
      
      setBombTimer(prev => {
        if (prev <= 1) {
          setGameState('gameOver');
          return 0;
        }
        return prev - 1;
      });
      
      const timeElapsed = (Date.now() - startTimeRef.current!) / 1000;
      const wpm = totalKeystrokesRef.current > 0 ? 
        Math.round((correctKeystrokesRef.current / 5) / (timeElapsed / 60)) : 0;
      const accuracy = totalKeystrokesRef.current > 0 ? 
        Math.round((correctKeystrokesRef.current / totalKeystrokesRef.current) * 100) : 100;
      
      setCodeStats(prev => ({
        ...prev,
        wpm,
        accuracy,
        timeElapsed: Math.round(timeElapsed)
      }));
      
      setTimeout(timerLoop, 1000);
    };
    
    setTimeout(timerLoop, 1000);
  };

  const handleSprintInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSprintInput(value);
    
    if (value.endsWith(' ')) {
      const word = value.trim().toLowerCase();
      setSprintWords(prev => {
        const targetWord = prev.find(w => w.text.toLowerCase() === word && !w.completed);
        if (targetWord) {
          correctKeystrokesRef.current += word.length;
          const points = word.length * 10 * sprintLevel;
          setSprintStats(prevStats => ({
            ...prevStats,
            score: prevStats.score + points
          }));
          return prev.map(w => 
            w.id === targetWord.id ? { ...w, completed: true } : w
          );
        }
        return prev;
      });
      setSprintInput('');
    }
    
    totalKeystrokesRef.current++;
  };

  const handleCodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCodeInput(value);
    
    const currentSequence = codeSequences[currentSequenceIndex];
    if (!currentSequence) return;
    
    totalKeystrokesRef.current++;
    
    if (currentSequence.code.startsWith(value)) {
      correctKeystrokesRef.current++;
      
      if (value === currentSequence.code) {
        // Sequence completed
        const timeBonus = bombTimer * 10;
        const difficultyMultiplier = currentSequence.difficulty === 'easy' ? 1 : 
                                   currentSequence.difficulty === 'medium' ? 1.5 : 2;
        const totalPoints = Math.floor((currentSequence.points + timeBonus) * difficultyMultiplier);
        
        setCodeStats(prev => ({
          ...prev,
          score: prev.score + totalPoints
        }));
        
        setCodeSequences(prev => 
          prev.map((seq, index) => 
            index === currentSequenceIndex ? { ...seq, completed: true } : seq
          )
        );
        
        setDefusedBombs(prev => prev + 1);
        
        const nextIndex = currentSequenceIndex + 1;
        if (nextIndex < codeSequences.length) {
          setCurrentSequenceIndex(nextIndex);
          setBombTimer(codeSequences[nextIndex].timeLimit);
          setCodeInput('');
        } else {
          setGameState('gameOver');
        }
      }
    }
  };

  const resetGame = () => {
    setGameState('menu');
    setActiveGame(null);
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
  };

  const pauseGame = () => {
    setGameState(gameState === 'paused' ? 'playing' : 'paused');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const renderGameMenu = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Keyboard className="w-8 h-8 text-primary" />
          <h1 className="orbitron text-3xl font-bold text-primary">Typing Arena</h1>
        </div>
        <p className="text-secondary max-w-2xl mx-auto">
          Master your typing skills with these challenging and engaging games!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Typing Sprint */}
        <div className="glass-panel p-6 hover:scale-105 transition-all cursor-pointer group"
             onClick={() => { setActiveGame('sprint'); setGameState('playing'); }}>
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-blue-500" />
            <h3 className="orbitron text-xl font-bold text-secondary">Typing Sprint</h3>
          </div>
          <p className="text-muted mb-4">
            Type falling words before they hit the ground! Progressive difficulty with colorful visuals.
          </p>
          <div className="space-y-2 text-sm text-muted mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span>Lives system - don't let words fall!</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Increasing speed and difficulty</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4" />
              <span>Colorful word effects</span>
            </div>
          </div>
          <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg hover:scale-105 transition-all group-hover:shadow-lg">
            <Play className="w-4 h-4 inline mr-2" />
            Start Sprint
          </button>
        </div>

        {/* Code Breaker */}
        <div className="glass-panel p-6 hover:scale-105 transition-all cursor-pointer group"
             onClick={() => { setActiveGame('codebreaker'); setGameState('playing'); }}>
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-red-500" />
            <h3 className="orbitron text-xl font-bold text-secondary">Code Breaker</h3>
          </div>
          <p className="text-muted mb-4">
            Defuse digital bombs by typing code sequences precisely! Race against time!
          </p>
          <div className="space-y-2 text-sm text-muted mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span>Progressive difficulty levels</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Time pressure challenges</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Precision typing required</span>
            </div>
          </div>
          <button className="w-full px-4 py-2 bg-gradient-to-r from-red-400 to-red-600 text-white rounded-lg hover:scale-105 transition-all group-hover:shadow-lg">
            <Play className="w-4 h-4 inline mr-2" />
            Start Code Breaker
          </button>
        </div>
      </div>

      {/* High Scores */}
      <div className="glass-panel p-6">
        <h3 className="orbitron text-lg font-bold text-secondary mb-4">Game Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-glass rounded-lg">
            <Keyboard className="w-8 h-8 text-primary mx-auto mb-2" />
            <h4 className="font-semibold text-secondary mb-1">Real-time Stats</h4>
            <p className="text-sm text-muted">WPM, accuracy, and score tracking</p>
          </div>
          <div className="text-center p-4 bg-glass rounded-lg">
            <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
            <h4 className="font-semibold text-secondary mb-1">Progressive Difficulty</h4>
            <p className="text-sm text-muted">Games get harder as you improve</p>
          </div>
          <div className="text-center p-4 bg-glass rounded-lg">
            <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
            <h4 className="font-semibold text-secondary mb-1">Skill Building</h4>
            <p className="text-sm text-muted">Improve speed and accuracy</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSprintGame = () => (
    <div className="space-y-6">
      {/* Game Header */}
      <div className="glass-panel p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="orbitron text-xl font-bold text-primary">Typing Sprint</h2>
            <div className="text-sm text-muted">Level {sprintLevel}</div>
            <div className="flex items-center gap-1">
              {Array.from({ length: sprintLives }, (_, i) => (
                <Heart key={i} className="w-4 h-4 text-red-500 fill-current" />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-sm text-muted">WPM</div>
              <div className="font-bold text-primary">{sprintStats.wpm}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted">Accuracy</div>
              <div className="font-bold text-secondary">{sprintStats.accuracy}%</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted">Score</div>
              <div className="font-bold text-primary">{sprintStats.score.toLocaleString()}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={pauseGame} className="p-2 bg-primary text-white rounded-lg hover:scale-105 transition-all">
                {gameState === 'paused' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
              <button onClick={resetGame} className="p-2 bg-gray-500 text-white rounded-lg hover:scale-105 transition-all">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="glass-panel p-6 relative bg-gradient-to-b from-blue-50/20 to-purple-50/20" style={{ height: '500px', overflow: 'hidden' }}>
        {gameState === 'paused' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <div className="text-center">
              <h3 className="orbitron text-2xl font-bold text-white mb-4">Game Paused</h3>
              <button onClick={pauseGame} className="px-6 py-3 bg-primary text-white rounded-lg hover:scale-105 transition-all">
                Resume Game
              </button>
            </div>
          </div>
        )}

        {/* Falling Words */}
        {sprintWords.map(word => (
          <div
            key={word.id}
            className={`absolute text-lg font-bold transition-all duration-300 ${
              word.completed ? 'scale-125 opacity-50' : 'scale-100'
            }`}
            style={{
              left: `${word.x}px`,
              top: `${word.y}px`,
              color: word.color,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              transform: word.completed ? 'scale(1.2) rotate(10deg)' : 'scale(1)'
            }}
          >
            {word.text}
          </div>
        ))}

        {/* Input Area */}
        <div className="absolute bottom-4 left-4 right-4">
          <input
            ref={inputRef}
            type="text"
            value={sprintInput}
            onChange={handleSprintInput}
            placeholder="Type the falling words..."
            className="w-full px-4 py-3 bg-glass border border-primary/30 rounded-lg text-secondary 
                     placeholder-muted focus:outline-none focus:border-primary transition-all text-lg"
            disabled={gameState !== 'playing'}
            autoFocus
          />
        </div>

        {/* Level Progress */}
        <div className="absolute top-4 left-4 right-4">
          <div className="flex justify-between text-sm text-muted mb-2">
            <span>Level {sprintLevel} Progress</span>
            <span>{sprintStats.timeElapsed}s</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(sprintStats.timeElapsed % 20) / 20 * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderCodeBreakerGame = () => {
    const currentSequence = codeSequences[currentSequenceIndex];
    
    return (
      <div className="space-y-6">
        {/* Game Header */}
        <div className="glass-panel p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="orbitron text-xl font-bold text-primary">Code Breaker</h2>
              <div className="text-sm text-muted">Bomb {currentSequenceIndex + 1}/{codeSequences.length}</div>
              <div className="text-sm text-muted">Defused: {defusedBombs}</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-sm text-muted">Timer</div>
                <div className={`font-bold text-2xl ${bombTimer <= 10 ? 'text-red-500 animate-pulse' : 'text-primary'}`}>
                  {bombTimer}s
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted">WPM</div>
                <div className="font-bold text-primary">{codeStats.wpm}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted">Score</div>
                <div className="font-bold text-primary">{codeStats.score.toLocaleString()}</div>
              </div>
              <button onClick={resetGame} className="p-2 bg-gray-500 text-white rounded-lg hover:scale-105 transition-all">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bomb Display */}
        <div className="glass-panel p-8 text-center bg-gradient-to-b from-red-50/20 to-orange-50/20">
          <div className="mb-6">
            <div className={`text-6xl mb-4 ${bombTimer <= 10 ? 'animate-bounce' : ''}`}>
              {bombTimer <= 10 ? '💥' : '💣'}
            </div>
            <h3 className="orbitron text-xl font-bold text-secondary mb-2">
              Defuse the Digital Bomb!
            </h3>
            <p className="text-muted">Type the code sequence exactly as shown</p>
          </div>

          {currentSequence && (
            <div className="space-y-6">
              {/* Difficulty Indicator */}
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm text-muted">Difficulty:</span>
                <span className={`font-bold ${getDifficultyColor(currentSequence.difficulty)}`}>
                  {currentSequence.difficulty.toUpperCase()}
                </span>
                <span className="text-sm text-muted">
                  Points: {currentSequence.points} + Time Bonus
                </span>
              </div>

              {/* Code to Type */}
              <div className="p-4 bg-glass rounded-lg">
                <div className="text-xl font-mono text-primary mb-2 break-all">
                  {currentSequence.code.split('').map((char, index) => (
                    <span
                      key={index}
                      className={`${
                        index < codeInput.length
                          ? codeInput[index] === char
                            ? 'text-green-500 bg-green-100/20'
                            : 'text-red-500 bg-red-100/20'
                          : 'text-secondary'
                      } px-1 rounded transition-all`}
                    >
                      {char}
                    </span>
                  ))}
                </div>
              </div>

              {/* Input */}
              <input
                ref={inputRef}
                type="text"
                value={codeInput}
                onChange={handleCodeInput}
                placeholder="Type the code here..."
                className="w-full px-4 py-3 bg-glass border border-primary/30 rounded-lg text-secondary 
                         placeholder-muted focus:outline-none focus:border-primary transition-all text-lg font-mono"
                disabled={gameState !== 'playing'}
                autoFocus
              />

              {/* Progress */}
              <div className="flex justify-center space-x-2">
                {codeSequences.map((seq, index) => (
                  <div
                    key={index}
                    className={`w-4 h-4 rounded-full transition-all ${
                      index < currentSequenceIndex
                        ? 'bg-green-500'
                        : index === currentSequenceIndex
                        ? 'bg-primary animate-pulse'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* Typing Progress */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(codeInput.length / currentSequence.code.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderGameOver = () => {
    const stats = activeGame === 'sprint' ? sprintStats : codeStats;
    const gameTitle = activeGame === 'sprint' ? 'Typing Sprint' : 'Code Breaker';
    const isSuccess = activeGame === 'codebreaker' && defusedBombs === codeSequences.length;
    
    return (
      <div className="glass-panel p-8 text-center">
        <div className="mb-6">
          {isSuccess ? (
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          ) : (
            <Target className="w-16 h-16 text-primary mx-auto mb-4" />
          )}
          <h2 className="orbitron text-2xl font-bold text-primary mb-2">
            {isSuccess ? 'Mission Accomplished!' : 'Game Over!'}
          </h2>
          <p className="text-muted">{gameTitle} Results</p>
          {activeGame === 'codebreaker' && (
            <p className="text-secondary mt-2">
              {isSuccess ? 'All bombs defused successfully!' : `Defused ${defusedBombs}/${codeSequences.length} bombs`}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-glass rounded-lg">
            <div className="text-2xl font-bold text-primary">{stats.wpm}</div>
            <div className="text-sm text-muted">WPM</div>
          </div>
          <div className="p-4 bg-glass rounded-lg">
            <div className="text-2xl font-bold text-secondary">{stats.accuracy}%</div>
            <div className="text-sm text-muted">Accuracy</div>
          </div>
          <div className="p-4 bg-glass rounded-lg">
            <div className="text-2xl font-bold text-primary">{stats.score.toLocaleString()}</div>
            <div className="text-sm text-muted">Score</div>
          </div>
          <div className="p-4 bg-glass rounded-lg">
            <div className="text-2xl font-bold text-secondary">{stats.timeElapsed}s</div>
            <div className="text-sm text-muted">Time</div>
          </div>
        </div>

        {/* Performance Rating */}
        <div className="mb-6 p-4 bg-glass rounded-lg">
          <h4 className="font-semibold text-secondary mb-2">Performance Rating</h4>
          <div className="flex justify-center">
            {Array.from({ length: 5 }, (_, i) => (
              <Star 
                key={i} 
                className={`w-6 h-6 ${
                  i < Math.floor(stats.wpm / 20) ? 'text-yellow-500 fill-current' : 'text-gray-300'
                }`} 
              />
            ))}
          </div>
          <p className="text-sm text-muted mt-2">
            {stats.wpm >= 80 ? 'Excellent!' : 
             stats.wpm >= 60 ? 'Great!' : 
             stats.wpm >= 40 ? 'Good!' : 
             stats.wpm >= 20 ? 'Keep practicing!' : 'Room for improvement!'}
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setGameState('playing')}
            className="px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:scale-105 transition-all"
          >
            <Play className="w-4 h-4 inline mr-2" />
            Play Again
          </button>
          <button
            onClick={resetGame}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:scale-105 transition-all"
          >
            <RotateCcw className="w-4 h-4 inline mr-2" />
            Back to Menu
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {gameState === 'menu' && renderGameMenu()}
      {gameState === 'gameOver' && renderGameOver()}
      {(gameState === 'playing' || gameState === 'paused') && activeGame === 'sprint' && renderSprintGame()}
      {gameState === 'playing' && activeGame === 'codebreaker' && renderCodeBreakerGame()}
    </div>
  );
};

export default TypingGamesPage;