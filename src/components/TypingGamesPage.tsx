import React, { useState, useEffect, useRef } from 'react';
import { Keyboard, Play, Pause, RotateCcw, Target, Zap, Clock, Trophy } from 'lucide-react';

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
}

interface CodeSequence {
  id: string;
  code: string;
  timeLimit: number;
  points: number;
  typed: string;
  completed: boolean;
}

const TypingGamesPage: React.FC = () => {
  const [activeGame, setActiveGame] = useState<'sprint' | 'codebreaker' | null>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameOver'>('menu');
  
  // Typing Sprint Game State
  const [sprintWords, setSprintWords] = useState<GameWord[]>([]);
  const [sprintInput, setSprintInput] = useState('');
  const [sprintStats, setSprintStats] = useState<TypingStats>({ wpm: 0, accuracy: 100, score: 0, timeElapsed: 0 });
  const [sprintLevel, setSprintLevel] = useState(1);
  
  // Code Breaker Game State
  const [codeSequences, setCodeSequences] = useState<CodeSequence[]>([]);
  const [codeInput, setCodeInput] = useState('');
  const [codeStats, setCodeStats] = useState<TypingStats>({ wpm: 0, accuracy: 100, score: 0, timeElapsed: 0 });
  const [currentSequenceIndex, setCurrentSequenceIndex] = useState(0);
  const [bombTimer, setBombTimer] = useState(30);
  
  const gameLoopRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const totalKeystrokesRef = useRef(0);
  const correctKeystrokesRef = useRef(0);

  // Word lists for Typing Sprint
  const wordLists = {
    easy: ['cat', 'dog', 'run', 'jump', 'fast', 'slow', 'big', 'small', 'red', 'blue'],
    medium: ['computer', 'keyboard', 'monitor', 'software', 'hardware', 'internet', 'website', 'programming'],
    hard: ['algorithm', 'development', 'architecture', 'optimization', 'implementation', 'documentation', 'configuration']
  };

  // Code sequences for Code Breaker
  const codeTemplates = [
    'for(i=0;i<10;i++)',
    'if(x > 0 && y < 5)',
    'function getData()',
    'const arr = [1,2,3]',
    'while(true) { break; }',
    'try { code(); } catch(e)',
    '@X9f!zK3#mP2$',
    '&Qw8*Rt5^Yp1%',
    'npm install react',
    'git commit -m "fix"',
    'SELECT * FROM users',
    'console.log("hello")',
    'import { useState }',
    'export default App',
    'async function fetch()'
  ];

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

  const startSprintGame = () => {
    setSprintWords([]);
    setSprintInput('');
    setSprintStats({ wpm: 0, accuracy: 100, score: 0, timeElapsed: 0 });
    setSprintLevel(1);
    
    const gameLoop = () => {
      if (gameState !== 'playing') return;
      
      setSprintWords(prev => {
        const updated = prev.map(word => ({
          ...word,
          x: word.x - word.speed
        })).filter(word => word.x > -200 && !word.completed);
        
        // Add new words
        if (Math.random() < 0.02 + (sprintLevel * 0.005)) {
          const wordList = sprintLevel <= 3 ? wordLists.easy : 
                          sprintLevel <= 6 ? wordLists.medium : wordLists.hard;
          const newWord: GameWord = {
            id: Date.now().toString(),
            text: wordList[Math.floor(Math.random() * wordList.length)],
            x: window.innerWidth,
            y: Math.random() * 400 + 100,
            speed: 1 + (sprintLevel * 0.3),
            typed: '',
            completed: false
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
      if (timeElapsed > sprintLevel * 15) {
        setSprintLevel(prev => prev + 1);
      }
      
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  };

  const startCodeBreakerGame = () => {
    const sequences: CodeSequence[] = [];
    for (let i = 0; i < 5; i++) {
      sequences.push({
        id: i.toString(),
        code: codeTemplates[Math.floor(Math.random() * codeTemplates.length)],
        timeLimit: 30 - (i * 2),
        points: (i + 1) * 100,
        typed: '',
        completed: false
      });
    }
    
    setCodeSequences(sequences);
    setCodeInput('');
    setCodeStats({ wpm: 0, accuracy: 100, score: 0, timeElapsed: 0 });
    setCurrentSequenceIndex(0);
    setBombTimer(sequences[0]?.timeLimit || 30);
    
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
      const word = value.trim();
      setSprintWords(prev => {
        const targetWord = prev.find(w => w.text === word && !w.completed);
        if (targetWord) {
          correctKeystrokesRef.current += word.length;
          setSprintStats(prevStats => ({
            ...prevStats,
            score: prevStats.score + word.length * 10 * sprintLevel
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
        setCodeStats(prev => ({
          ...prev,
          score: prev.score + currentSequence.points + (bombTimer * 10)
        }));
        
        setCodeSequences(prev => 
          prev.map((seq, index) => 
            index === currentSequenceIndex ? { ...seq, completed: true } : seq
          )
        );
        
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

  const renderGameMenu = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Keyboard className="w-8 h-8 text-primary" />
          <h1 className="orbitron text-3xl font-bold text-primary">Typing Games</h1>
        </div>
        <p className="text-secondary max-w-2xl mx-auto">
          Improve your typing speed and accuracy with these engaging games!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Typing Sprint */}
        <div className="glass-panel p-6 hover:scale-105 transition-all cursor-pointer"
             onClick={() => { setActiveGame('sprint'); setGameState('playing'); }}>
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-blue-500" />
            <h3 className="orbitron text-xl font-bold text-secondary">Typing Sprint</h3>
          </div>
          <p className="text-muted mb-4">
            Type words quickly before they scroll off the screen. Speed increases over time!
          </p>
          <div className="space-y-2 text-sm text-muted">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span>Points for speed and accuracy</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Progressive difficulty</span>
            </div>
          </div>
          <button className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg hover:scale-105 transition-all">
            <Play className="w-4 h-4 inline mr-2" />
            Start Sprint
          </button>
        </div>

        {/* Code Breaker */}
        <div className="glass-panel p-6 hover:scale-105 transition-all cursor-pointer"
             onClick={() => { setActiveGame('codebreaker'); setGameState('playing'); }}>
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-red-500" />
            <h3 className="orbitron text-xl font-bold text-secondary">Code Breaker</h3>
          </div>
          <p className="text-muted mb-4">
            Type code sequences precisely to defuse digital bombs before time runs out!
          </p>
          <div className="space-y-2 text-sm text-muted">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span>Accuracy bonus points</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Time pressure challenges</span>
            </div>
          </div>
          <button className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-red-400 to-red-600 text-white rounded-lg hover:scale-105 transition-all">
            <Play className="w-4 h-4 inline mr-2" />
            Start Code Breaker
          </button>
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
              <div className="font-bold text-primary">{sprintStats.score}</div>
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
      <div className="glass-panel p-6 relative" style={{ height: '500px', overflow: 'hidden' }}>
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
            className={`absolute text-lg font-bold transition-all ${
              word.completed ? 'text-green-500' : 'text-secondary'
            }`}
            style={{
              left: `${word.x}px`,
              top: `${word.y}px`,
              transform: word.completed ? 'scale(1.2)' : 'scale(1)',
              opacity: word.completed ? 0.5 : 1
            }}
          >
            {word.text}
          </div>
        ))}

        {/* Input Area */}
        <div className="absolute bottom-4 left-4 right-4">
          <input
            type="text"
            value={sprintInput}
            onChange={handleSprintInput}
            placeholder="Type the words as they appear..."
            className="w-full px-4 py-3 bg-glass border border-primary/30 rounded-lg text-secondary 
                     placeholder-muted focus:outline-none focus:border-primary transition-all text-lg"
            disabled={gameState !== 'playing'}
            autoFocus
          />
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
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-sm text-muted">Timer</div>
                <div className={`font-bold text-2xl ${bombTimer <= 10 ? 'text-red-500' : 'text-primary'}`}>
                  {bombTimer}s
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted">WPM</div>
                <div className="font-bold text-primary">{codeStats.wpm}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted">Score</div>
                <div className="font-bold text-primary">{codeStats.score}</div>
              </div>
              <button onClick={resetGame} className="p-2 bg-gray-500 text-white rounded-lg hover:scale-105 transition-all">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bomb Display */}
        <div className="glass-panel p-8 text-center">
          <div className="mb-6">
            <div className={`text-6xl mb-4 ${bombTimer <= 10 ? 'animate-pulse' : ''}`}>💣</div>
            <h3 className="orbitron text-xl font-bold text-secondary mb-2">
              Defuse the Digital Bomb!
            </h3>
            <p className="text-muted">Type the code sequence exactly as shown</p>
          </div>

          {currentSequence && (
            <div className="space-y-6">
              {/* Code to Type */}
              <div className="p-4 bg-glass rounded-lg">
                <div className="text-2xl font-mono text-primary mb-2">
                  {currentSequence.code.split('').map((char, index) => (
                    <span
                      key={index}
                      className={`${
                        index < codeInput.length
                          ? codeInput[index] === char
                            ? 'text-green-500 bg-green-100/20'
                            : 'text-red-500 bg-red-100/20'
                          : 'text-secondary'
                      } px-1 rounded`}
                    >
                      {char}
                    </span>
                  ))}
                </div>
                <div className="text-sm text-muted">
                  Points: {currentSequence.points} + Time Bonus
                </div>
              </div>

              {/* Input */}
              <input
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
                {codeSequences.map((_, index) => (
                  <div
                    key={index}
                    className={`w-4 h-4 rounded-full ${
                      index < currentSequenceIndex
                        ? 'bg-green-500'
                        : index === currentSequenceIndex
                        ? 'bg-primary'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
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
    
    return (
      <div className="glass-panel p-8 text-center">
        <div className="mb-6">
          <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="orbitron text-2xl font-bold text-primary mb-2">Game Over!</h2>
          <p className="text-muted">{gameTitle} Results</p>
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
            <div className="text-2xl font-bold text-primary">{stats.score}</div>
            <div className="text-sm text-muted">Score</div>
          </div>
          <div className="p-4 bg-glass rounded-lg">
            <div className="text-2xl font-bold text-secondary">{stats.timeElapsed}s</div>
            <div className="text-sm text-muted">Time</div>
          </div>
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