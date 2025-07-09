import React, { useState, useEffect } from 'react';
import { Calculator as CalcIcon, Delete, RotateCcw, History, Zap, Brain, Save, Download, Upload } from 'lucide-react';

interface CalculationHistory {
  expression: string;
  result: string;
  timestamp: Date;
}

const CalculatorPage: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isScientific, setIsScientific] = useState(false);
  const [memory, setMemory] = useState(0);
  const [angleMode, setAngleMode] = useState<'deg' | 'rad'>('deg');
  const [theme, setTheme] = useState<'default' | 'dark' | 'neon'>('default');

  // Load data from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('calculatorHistory');
    const savedMemory = localStorage.getItem('calculatorMemory');
    const savedTheme = localStorage.getItem('calculatorTheme');
    const savedMode = localStorage.getItem('calculatorMode');
    
    if (savedHistory) {
      const parsed = JSON.parse(savedHistory);
      setHistory(parsed.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      })));
    }
    if (savedMemory) setMemory(parseFloat(savedMemory));
    if (savedTheme) setTheme(savedTheme as any);
    if (savedMode) setIsScientific(JSON.parse(savedMode));
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('calculatorHistory', JSON.stringify(history));
    localStorage.setItem('calculatorMemory', memory.toString());
    localStorage.setItem('calculatorTheme', theme);
    localStorage.setItem('calculatorMode', JSON.stringify(isScientific));
  }, [history, memory, theme, isScientific]);

  const addToHistory = (expression: string, result: string) => {
    const newEntry: CalculationHistory = {
      expression,
      result,
      timestamp: new Date()
    };
    setHistory(prev => [newEntry, ...prev.slice(0, 49)]); // Keep last 50 entries
  };

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const clearEntry = () => {
    setDisplay('0');
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(display);
    } else if (operation) {
      const currentValue = previousValue || '0';
      const newValue = calculate(parseFloat(currentValue), inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(String(newValue));
      
      addToHistory(`${currentValue} ${operation} ${inputValue}`, String(newValue));
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return secondValue !== 0 ? firstValue / secondValue : 0;
      case '%':
        return firstValue % secondValue;
      case '^':
        return Math.pow(firstValue, secondValue);
      case 'xʸ':
        return Math.pow(firstValue, secondValue);
      case 'mod':
        return firstValue % secondValue;
      case 'root':
        return Math.pow(firstValue, 1 / secondValue);
      default:
        return secondValue;
    }
  };

  const performScientificOperation = (func: string) => {
    const inputValue = parseFloat(display);
    let result: number;

    switch (func) {
      case 'sin':
        result = Math.sin(angleMode === 'deg' ? inputValue * Math.PI / 180 : inputValue);
        break;
      case 'cos':
        result = Math.cos(angleMode === 'deg' ? inputValue * Math.PI / 180 : inputValue);
        break;
      case 'tan':
        result = Math.tan(angleMode === 'deg' ? inputValue * Math.PI / 180 : inputValue);
        break;
      case 'asin':
        result = angleMode === 'deg' ? Math.asin(inputValue) * 180 / Math.PI : Math.asin(inputValue);
        break;
      case 'acos':
        result = angleMode === 'deg' ? Math.acos(inputValue) * 180 / Math.PI : Math.acos(inputValue);
        break;
      case 'atan':
        result = angleMode === 'deg' ? Math.atan(inputValue) * 180 / Math.PI : Math.atan(inputValue);
        break;
      case 'sinh':
        result = Math.sinh(inputValue);
        break;
      case 'cosh':
        result = Math.cosh(inputValue);
        break;
      case 'tanh':
        result = Math.tanh(inputValue);
        break;
      case 'log':
        result = Math.log10(inputValue);
        break;
      case 'ln':
        result = Math.log(inputValue);
        break;
      case 'log2':
        result = Math.log2(inputValue);
        break;
      case 'sqrt':
        result = Math.sqrt(inputValue);
        break;
      case '∛':
        result = Math.cbrt(inputValue);
        break;
      case '1/x':
        result = 1 / inputValue;
        break;
      case 'x²':
        result = inputValue * inputValue;
        break;
      case 'x³':
        result = inputValue * inputValue * inputValue;
        break;
      case '!':
        result = factorial(inputValue);
        break;
      case 'π':
        result = Math.PI;
        break;
      case 'e':
        result = Math.E;
        break;
      case '10ˣ':
        result = Math.pow(10, inputValue);
        break;
      case 'eˣ':
        result = Math.exp(inputValue);
        break;
      case '2ˣ':
        result = Math.pow(2, inputValue);
        break;
      case 'abs':
        result = Math.abs(inputValue);
        break;
      case 'rand':
        result = Math.random();
        break;
      case 'floor':
        result = Math.floor(inputValue);
        break;
      case 'ceil':
        result = Math.ceil(inputValue);
        break;
      case 'round':
        result = Math.round(inputValue);
        break;
      default:
        result = inputValue;
    }

    setDisplay(String(result));
    setWaitingForOperand(true);
    
    addToHistory(`${func}(${inputValue})`, String(result));
  };

  const factorial = (n: number): number => {
    if (n < 0) return 0;
    if (n === 0 || n === 1) return 1;
    if (n > 170) return Infinity;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  };

  const performEquals = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const currentValue = parseFloat(previousValue);
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      
      addToHistory(`${previousValue} ${operation} ${inputValue}`, String(newValue));
      
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const memoryStore = () => {
    setMemory(parseFloat(display));
    addToHistory('M Store', display);
  };

  const memoryRecall = () => {
    setDisplay(String(memory));
    setWaitingForOperand(true);
  };

  const memoryClear = () => {
    setMemory(0);
    addToHistory('Memory Clear', '0');
  };

  const memoryAdd = () => {
    setMemory(memory + parseFloat(display));
    addToHistory(`M+ ${display}`, String(memory + parseFloat(display)));
  };

  const memorySubtract = () => {
    setMemory(memory - parseFloat(display));
    addToHistory(`M- ${display}`, String(memory - parseFloat(display)));
  };

  const exportHistory = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `calculator-history-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    const { key } = e;
    
    if (key >= '0' && key <= '9') {
      inputNumber(key);
    } else if (key === '.') {
      inputDecimal();
    } else if (key === '+' || key === '-') {
      performOperation(key);
    } else if (key === '*') {
      performOperation('×');
    } else if (key === '/') {
      e.preventDefault();
      performOperation('÷');
    } else if (key === 'Enter' || key === '=') {
      performEquals();
    } else if (key === 'Escape') {
      clear();
    } else if (key === 'Backspace') {
      if (display.length > 1) {
        setDisplay(display.slice(0, -1));
      } else {
        setDisplay('0');
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [display, previousValue, operation, waitingForOperand]);

  const formatDisplay = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    
    if (Math.abs(num) >= 1e15 || (Math.abs(num) < 1e-10 && num !== 0)) {
      return num.toExponential(8);
    }
    
    if (num % 1 === 0 && Math.abs(num) < 1e10) {
      return num.toLocaleString();
    }
    
    return parseFloat(num.toPrecision(12)).toLocaleString();
  };

  const getThemeClasses = () => {
    switch (theme) {
      case 'dark':
        return {
          panel: 'bg-gray-900 border-gray-700',
          button: 'bg-gray-800 hover:bg-gray-700 text-white',
          display: 'bg-gray-800 border-gray-600 text-green-400',
          operator: 'bg-blue-600 hover:bg-blue-700 text-white',
          equals: 'bg-green-600 hover:bg-green-700 text-white',
          clear: 'bg-red-600 hover:bg-red-700 text-white'
        };
      case 'neon':
        return {
          panel: 'bg-black border-cyan-400',
          button: 'bg-gray-900 hover:bg-gray-800 text-cyan-400 border border-cyan-400',
          display: 'bg-black border-cyan-400 text-cyan-400',
          operator: 'bg-purple-600 hover:bg-purple-700 text-white border border-purple-400',
          equals: 'bg-green-500 hover:bg-green-600 text-black border border-green-400',
          clear: 'bg-red-500 hover:bg-red-600 text-white border border-red-400'
        };
      default:
        return {
          panel: 'glass-panel',
          button: 'bg-glass hover:bg-glass-hover text-secondary',
          display: 'bg-glass border-primary/30 text-secondary',
          operator: 'bg-primary hover:bg-primary-dark text-white',
          equals: 'bg-green-500 hover:bg-green-600 text-white',
          clear: 'bg-red-500 hover:bg-red-600 text-white'
        };
    }
  };

  const themeClasses = getThemeClasses();

  const basicButtons = [
    { label: 'MC', action: memoryClear, className: 'bg-purple-500 hover:bg-purple-600 text-white text-xs' },
    { label: 'MR', action: memoryRecall, className: 'bg-purple-500 hover:bg-purple-600 text-white text-xs' },
    { label: 'M+', action: memoryAdd, className: 'bg-purple-500 hover:bg-purple-600 text-white text-xs' },
    { label: 'M-', action: memorySubtract, className: 'bg-purple-500 hover:bg-purple-600 text-white text-xs' },
    
    { label: 'C', action: clear, className: themeClasses.clear },
    { label: 'CE', action: clearEntry, className: 'bg-orange-500 hover:bg-orange-600 text-white' },
    { label: '⌫', action: () => {
      if (display.length > 1) {
        setDisplay(display.slice(0, -1));
      } else {
        setDisplay('0');
      }
    }, className: 'bg-gray-500 hover:bg-gray-600 text-white' },
    { label: '÷', action: () => performOperation('÷'), className: themeClasses.operator },
    
    { label: '7', action: () => inputNumber('7'), className: themeClasses.button },
    { label: '8', action: () => inputNumber('8'), className: themeClasses.button },
    { label: '9', action: () => inputNumber('9'), className: themeClasses.button },
    { label: '×', action: () => performOperation('×'), className: themeClasses.operator },
    
    { label: '4', action: () => inputNumber('4'), className: themeClasses.button },
    { label: '5', action: () => inputNumber('5'), className: themeClasses.button },
    { label: '6', action: () => inputNumber('6'), className: themeClasses.button },
    { label: '-', action: () => performOperation('-'), className: themeClasses.operator },
    
    { label: '1', action: () => inputNumber('1'), className: themeClasses.button },
    { label: '2', action: () => inputNumber('2'), className: themeClasses.button },
    { label: '3', action: () => inputNumber('3'), className: themeClasses.button },
    { label: '+', action: () => performOperation('+'), className: themeClasses.operator },
    
    { label: '±', action: () => setDisplay(String(-parseFloat(display))), className: themeClasses.button },
    { label: '0', action: () => inputNumber('0'), className: themeClasses.button },
    { label: '.', action: inputDecimal, className: themeClasses.button },
    { label: '=', action: performEquals, className: themeClasses.equals },
  ];

  const scientificButtons = [
    { label: angleMode, action: () => setAngleMode(angleMode === 'deg' ? 'rad' : 'deg') },
    { label: 'sin', action: () => performScientificOperation('sin') },
    { label: 'cos', action: () => performScientificOperation('cos') },
    { label: 'tan', action: () => performScientificOperation('tan') },
    { label: 'asin', action: () => performScientificOperation('asin') },
    { label: 'acos', action: () => performScientificOperation('acos') },
    { label: 'atan', action: () => performScientificOperation('atan') },
    { label: 'sinh', action: () => performScientificOperation('sinh') },
    { label: 'cosh', action: () => performScientificOperation('cosh') },
    { label: 'tanh', action: () => performScientificOperation('tanh') },
    { label: 'log', action: () => performScientificOperation('log') },
    { label: 'ln', action: () => performScientificOperation('ln') },
    { label: 'log₂', action: () => performScientificOperation('log2') },
    { label: '10ˣ', action: () => performScientificOperation('10ˣ') },
    { label: 'eˣ', action: () => performScientificOperation('eˣ') },
    { label: '2ˣ', action: () => performScientificOperation('2ˣ') },
    { label: '√', action: () => performScientificOperation('sqrt') },
    { label: '∛', action: () => performScientificOperation('∛') },
    { label: 'x²', action: () => performScientificOperation('x²') },
    { label: 'x³', action: () => performScientificOperation('x³') },
    { label: 'xʸ', action: () => performOperation('xʸ') },
    { label: '!', action: () => performScientificOperation('!') },
    { label: 'π', action: () => performScientificOperation('π') },
    { label: 'e', action: () => performScientificOperation('e') },
    { label: '1/x', action: () => performScientificOperation('1/x') },
    { label: 'abs', action: () => performScientificOperation('abs') },
    { label: 'rand', action: () => performScientificOperation('rand') },
    { label: 'floor', action: () => performScientificOperation('floor') },
    { label: 'ceil', action: () => performScientificOperation('ceil') },
    { label: 'round', action: () => performScientificOperation('round') },
    { label: '%', action: () => performOperation('%') },
    { label: 'mod', action: () => performOperation('mod') },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="glass-panel p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CalcIcon className="w-8 h-8 text-primary" />
              <h1 className="orbitron text-3xl font-bold text-primary">Advanced Calculator</h1>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as any)}
                className="px-3 py-2 bg-glass border border-primary/30 rounded-lg text-secondary focus:outline-none focus:border-primary"
              >
                <option value="default">Default</option>
                <option value="dark">Dark</option>
                <option value="neon">Neon</option>
              </select>
              <button
                onClick={() => setAngleMode(angleMode === 'deg' ? 'rad' : 'deg')}
                className={`px-3 py-2 text-sm rounded-lg transition-all ${
                  angleMode === 'deg' 
                    ? 'bg-primary text-white' 
                    : 'bg-glass hover:bg-glass-hover text-secondary'
                }`}
              >
                {angleMode.toUpperCase()}
              </button>
              <button
                onClick={() => setIsScientific(!isScientific)}
                className={`px-4 py-2 text-sm rounded-lg transition-all ${
                  isScientific 
                    ? 'bg-primary text-white' 
                    : 'bg-glass hover:bg-glass-hover text-secondary'
                }`}
              >
                <Brain className="w-4 h-4 inline mr-2" />
                {isScientific ? 'Basic' : 'Scientific'}
              </button>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`px-4 py-2 text-sm rounded-lg transition-all ${
                  showHistory 
                    ? 'bg-primary text-white' 
                    : 'bg-glass hover:bg-glass-hover text-secondary'
                }`}
              >
                <History className="w-4 h-4 inline mr-2" />
                History
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calculator */}
          <div className={`lg:col-span-2 p-6 ${themeClasses.panel}`}>
            {/* Display */}
            <div className={`mb-6 p-6 rounded-lg border-2 ${themeClasses.display}`}>
              <div className="text-right">
                {previousValue && operation && (
                  <div className="text-lg text-muted mb-2">
                    {previousValue} {operation}
                  </div>
                )}
                <div className="text-4xl font-mono break-all min-h-[3rem] flex items-center justify-end">
                  {formatDisplay(display)}
                </div>
                {memory !== 0 && (
                  <div className="text-sm text-primary mt-2">
                    Memory: {memory.toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            {/* Scientific Functions */}
            {isScientific && (
              <div className="mb-6 grid grid-cols-8 gap-2">
                {scientificButtons.map((button, index) => (
                  <button
                    key={index}
                    onClick={button.action}
                    className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg 
                             transition-all hover:scale-105 text-xs font-semibold"
                  >
                    {button.label}
                  </button>
                ))}
              </div>
            )}

            {/* Basic Calculator Buttons */}
            <div className="grid grid-cols-4 gap-3">
              {basicButtons.map((button, index) => (
                <button
                  key={index}
                  onClick={button.action}
                  className={`p-4 rounded-lg transition-all hover:scale-105 font-semibold ${
                    button.className
                  } ${button.label === '0' ? 'col-span-2' : ''}`}
                >
                  {button.label}
                </button>
              ))}
            </div>

            {/* Keyboard Shortcuts Info */}
            <div className="mt-6 text-sm text-muted text-center">
              <p>Keyboard: Numbers, +, -, *, /, Enter (=), Esc (Clear), Backspace</p>
              {isScientific && <p>Scientific mode: Advanced mathematical functions available</p>}
            </div>
          </div>

          {/* History Panel */}
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="orbitron text-xl font-bold text-secondary">History</h3>
              <div className="flex gap-2">
                <button
                  onClick={exportHistory}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:scale-105 transition-all"
                  title="Export History"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={clearHistory}
                  className="p-2 bg-red-500 text-white rounded-lg hover:scale-105 transition-all"
                  title="Clear History"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-muted text-center py-8">No calculations yet</p>
              ) : (
                history.map((entry, index) => (
                  <div
                    key={index}
                    className="p-3 bg-glass rounded-lg cursor-pointer hover:bg-glass-hover transition-all"
                    onClick={() => {
                      setDisplay(entry.result);
                      setWaitingForOperand(true);
                    }}
                  >
                    <div className="font-mono text-sm text-secondary">
                      {entry.expression} = {entry.result}
                    </div>
                    <div className="text-xs text-muted mt-1">
                      {entry.timestamp.toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="glass-panel p-6 text-center">
            <Brain className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="orbitron text-lg font-bold text-secondary mb-2">Scientific Mode</h3>
            <p className="text-muted text-sm">
              Advanced mathematical functions including trigonometry, logarithms, and more
            </p>
          </div>
          <div className="glass-panel p-6 text-center">
            <History className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="orbitron text-lg font-bold text-secondary mb-2">Calculation History</h3>
            <p className="text-muted text-sm">
              Keep track of all your calculations with timestamps and export functionality
            </p>
          </div>
          <div className="glass-panel p-6 text-center">
            <Save className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="orbitron text-lg font-bold text-secondary mb-2">Memory Functions</h3>
            <p className="text-muted text-sm">
              Store, recall, and perform operations on memory values
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorPage;