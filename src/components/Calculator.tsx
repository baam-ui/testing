import React, { useState, useEffect } from 'react';
import { Calculator as CalcIcon, Delete, RotateCcw, History, Zap, Brain } from 'lucide-react';

interface CalculatorProps {
  className?: string;
}

const Calculator: React.FC<CalculatorProps> = ({ className = '' }) => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isScientific, setIsScientific] = useState(false);
  const [memory, setMemory] = useState(0);
  const [angleMode, setAngleMode] = useState<'deg' | 'rad'>('deg');

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
      
      const historyEntry = `${currentValue} ${operation} ${inputValue} = ${newValue}`;
      setHistory(prev => [historyEntry, ...prev.slice(0, 19)]);
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
      case 'log':
        result = Math.log10(inputValue);
        break;
      case 'ln':
        result = Math.log(inputValue);
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
      case 'abs':
        result = Math.abs(inputValue);
        break;
      case 'rand':
        result = Math.random();
        break;
      default:
        result = inputValue;
    }

    setDisplay(String(result));
    setWaitingForOperand(true);
    
    const historyEntry = `${func}(${inputValue}) = ${result}`;
    setHistory(prev => [historyEntry, ...prev.slice(0, 19)]);
  };

  const factorial = (n: number): number => {
    if (n < 0) return 0;
    if (n === 0 || n === 1) return 1;
    if (n > 170) return Infinity; // Prevent overflow
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
      
      const historyEntry = `${previousValue} ${operation} ${inputValue} = ${newValue}`;
      setHistory(prev => [historyEntry, ...prev.slice(0, 19)]);
      
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const memoryStore = () => {
    setMemory(parseFloat(display));
    setHistory(prev => [`M = ${display}`, ...prev.slice(0, 19)]);
  };

  const memoryRecall = () => {
    setDisplay(String(memory));
    setWaitingForOperand(true);
  };

  const memoryClear = () => {
    setMemory(0);
    setHistory(prev => ['Memory Cleared', ...prev.slice(0, 19)]);
  };

  const memoryAdd = () => {
    setMemory(memory + parseFloat(display));
    setHistory(prev => [`M+ ${display}`, ...prev.slice(0, 19)]);
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
      return num.toString();
    }
    
    return parseFloat(num.toPrecision(12)).toString();
  };

  const basicButtons = [
    { label: 'MC', action: memoryClear, className: 'bg-purple-500 hover:bg-purple-600 text-white text-xs' },
    { label: 'MR', action: memoryRecall, className: 'bg-purple-500 hover:bg-purple-600 text-white text-xs' },
    { label: 'M+', action: memoryAdd, className: 'bg-purple-500 hover:bg-purple-600 text-white text-xs' },
    { label: 'MS', action: memoryStore, className: 'bg-purple-500 hover:bg-purple-600 text-white text-xs' },
    
    { label: 'C', action: clear, className: 'bg-red-500 hover:bg-red-600 text-white' },
    { label: 'CE', action: clearEntry, className: 'bg-orange-500 hover:bg-orange-600 text-white' },
    { label: '⌫', action: () => {
      if (display.length > 1) {
        setDisplay(display.slice(0, -1));
      } else {
        setDisplay('0');
      }
    }, className: 'bg-gray-500 hover:bg-gray-600 text-white' },
    { label: '÷', action: () => performOperation('÷'), className: 'bg-primary hover:bg-primary-dark text-white' },
    
    { label: '7', action: () => inputNumber('7'), className: 'bg-glass hover:bg-glass-hover' },
    { label: '8', action: () => inputNumber('8'), className: 'bg-glass hover:bg-glass-hover' },
    { label: '9', action: () => inputNumber('9'), className: 'bg-glass hover:bg-glass-hover' },
    { label: '×', action: () => performOperation('×'), className: 'bg-primary hover:bg-primary-dark text-white' },
    
    { label: '4', action: () => inputNumber('4'), className: 'bg-glass hover:bg-glass-hover' },
    { label: '5', action: () => inputNumber('5'), className: 'bg-glass hover:bg-glass-hover' },
    { label: '6', action: () => inputNumber('6'), className: 'bg-glass hover:bg-glass-hover' },
    { label: '-', action: () => performOperation('-'), className: 'bg-primary hover:bg-primary-dark text-white' },
    
    { label: '1', action: () => inputNumber('1'), className: 'bg-glass hover:bg-glass-hover' },
    { label: '2', action: () => inputNumber('2'), className: 'bg-glass hover:bg-glass-hover' },
    { label: '3', action: () => inputNumber('3'), className: 'bg-glass hover:bg-glass-hover' },
    { label: '+', action: () => performOperation('+'), className: 'bg-primary hover:bg-primary-dark text-white' },
    
    { label: '±', action: () => setDisplay(String(-parseFloat(display))), className: 'bg-glass hover:bg-glass-hover' },
    { label: '0', action: () => inputNumber('0'), className: 'bg-glass hover:bg-glass-hover col-span-2' },
    { label: '.', action: inputDecimal, className: 'bg-glass hover:bg-glass-hover' },
    { label: '=', action: performEquals, className: 'bg-green-500 hover:bg-green-600 text-white' },
  ];

  const scientificButtons = [
    { label: angleMode, action: () => setAngleMode(angleMode === 'deg' ? 'rad' : 'deg') },
    { label: 'sin', action: () => performScientificOperation('sin') },
    { label: 'cos', action: () => performScientificOperation('cos') },
    { label: 'tan', action: () => performScientificOperation('tan') },
    { label: 'asin', action: () => performScientificOperation('asin') },
    { label: 'acos', action: () => performScientificOperation('acos') },
    { label: 'atan', action: () => performScientificOperation('atan') },
    { label: 'log', action: () => performScientificOperation('log') },
    { label: 'ln', action: () => performScientificOperation('ln') },
    { label: '10ˣ', action: () => performScientificOperation('10ˣ') },
    { label: 'eˣ', action: () => performScientificOperation('eˣ') },
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
    { label: '%', action: () => performOperation('%') },
  ];

  return (
    <div className={`glass-panel p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <CalcIcon className="w-5 h-5 text-primary" />
          <h3 className="orbitron text-lg font-bold text-secondary">Advanced Calculator</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setAngleMode(angleMode === 'deg' ? 'rad' : 'deg')}
            className={`px-2 py-1 text-xs rounded-lg transition-all ${
              angleMode === 'deg' 
                ? 'bg-primary text-white' 
                : 'bg-glass hover:bg-glass-hover text-secondary'
            }`}
          >
            {angleMode.toUpperCase()}
          </button>
          <button
            onClick={() => setIsScientific(!isScientific)}
            className={`px-3 py-1 text-xs rounded-lg transition-all ${
              isScientific 
                ? 'bg-primary text-white' 
                : 'bg-glass hover:bg-glass-hover text-secondary'
            }`}
          >
            <Brain className="w-3 h-3 inline mr-1" />
            {isScientific ? 'Basic' : 'Scientific'}
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`px-3 py-1 text-xs rounded-lg transition-all ${
              showHistory 
                ? 'bg-primary text-white' 
                : 'bg-glass hover:bg-glass-hover text-secondary'
            }`}
          >
            <History className="w-3 h-3 inline mr-1" />
            History
          </button>
        </div>
      </div>

      {/* Display */}
      <div className="mb-4 p-4 bg-glass rounded-lg border border-primary/30">
        <div className="text-right">
          {previousValue && operation && (
            <div className="text-sm text-muted mb-1">
              {previousValue} {operation}
            </div>
          )}
          <div className="text-2xl font-mono text-secondary break-all min-h-[2rem]">
            {formatDisplay(display)}
          </div>
          {memory !== 0 && (
            <div className="text-xs text-primary mt-1">
              M: {memory}
            </div>
          )}
        </div>
      </div>

      {/* History Panel */}
      {showHistory && (
        <div className="mb-4 p-3 bg-glass rounded-lg border border-primary/30 max-h-40 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-secondary">Calculation History</h4>
            <button
              onClick={clearHistory}
              className="p-1 text-muted hover:text-secondary transition-all"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
          {history.length === 0 ? (
            <p className="text-xs text-muted">No calculations yet</p>
          ) : (
            <div className="space-y-1">
              {history.map((entry, index) => (
                <div
                  key={index}
                  className="text-xs text-muted font-mono cursor-pointer hover:text-secondary transition-all p-1 rounded hover:bg-glass-hover"
                  onClick={() => {
                    const result = entry.split(' = ')[1];
                    if (result && !isNaN(parseFloat(result))) {
                      setDisplay(result);
                      setWaitingForOperand(true);
                    }
                  }}
                >
                  {entry}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Scientific Functions */}
      {isScientific && (
        <div className="mb-4 grid grid-cols-6 gap-2">
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
            className={`p-3 rounded-lg transition-all hover:scale-105 font-semibold text-secondary ${
              button.className || 'bg-glass hover:bg-glass-hover'
            } ${button.label === '0' ? 'col-span-2' : ''}`}
          >
            {button.label}
          </button>
        ))}
      </div>

      {/* Keyboard Shortcuts Info */}
      <div className="mt-4 text-xs text-muted text-center">
        <p>Keyboard: Numbers, +, -, *, /, Enter (=), Esc (Clear), Backspace</p>
        {isScientific && <p>Scientific mode: Advanced mathematical functions available</p>}
      </div>
    </div>
  );
};

export default Calculator;