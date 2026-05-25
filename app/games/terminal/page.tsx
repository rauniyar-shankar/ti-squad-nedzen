"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

// All exactly 9 letters to fit the grid perfectly
const WORD_LIST = [
  "MAINFRAME", "DATABASES", "PROCESSOR", "BANDWIDTH", "ALGORITHM", 
  "ENCRYPTED", "FIREWALLS", "PROTOCOLS", "DEBUGGING", "TERMINALS",
  "EXECUTION", "INTERFACE", "VARIABLES", "FUNCTIONS", "COMPILERS"
];

const SYMBOLS = "!@#$%^&*()_+{}|[]\\:;\"'<>,.?/~`";

export default function TerminalHacker() {
  const router = useRouter();
  
  const [targetWord, setTargetWord] = useState('');
  const [activeWords, setActiveWords] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(4);
  const [history, setHistory] = useState<{guess: string, matches: number}[]>([]);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');

  // Initialize Game Board
  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    // Pick 10 random words from the list
    const shuffled = [...WORD_LIST].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10);
    
    setActiveWords(selected);
    setTargetWord(selected[Math.floor(Math.random() * selected.length)]);
    setAttempts(4);
    setHistory([]);
    setGameState('playing');
  };

  // Generate the chaotic hex memory layout
  const memoryDump = useMemo(() => {
    if (activeWords.length === 0) return [];
    
    let dump = [];
    let wordIndex = 0;
    
    // Create 30 rows of data
    for (let i = 0; i < 30; i++) {
      const hexAddress = `0x${(Math.floor(Math.random() * 65535)).toString(16).toUpperCase().padStart(4, '0')}`;
      let rowContent = '';
      let isWordRow = false;
      let wordObj = null;

      // Randomly decide if this row contains a word (until we run out of our 10 words)
      if (wordIndex < activeWords.length && Math.random() > 0.6 || (30 - i) === (activeWords.length - wordIndex)) {
        isWordRow = true;
        const word = activeWords[wordIndex];
        wordObj = word;
        wordIndex++;
        
        // Pad the word with random junk symbols to make it 12 characters total
        const paddingLeft = Math.floor(Math.random() * 3);
        const paddingRight = 12 - word.length - paddingLeft;
        
        for(let j=0; j<paddingLeft; j++) rowContent += SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        rowContent += word;
        for(let j=0; j<paddingRight; j++) rowContent += SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      } else {
        // Just random symbols (12 characters)
        for(let j=0; j<12; j++) rowContent += SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      }

      dump.push({ id: i, hex: hexAddress, text: rowContent, word: wordObj });
    }
    return dump;
  }, [activeWords]);

  // Handle player clicking a word
  const handleGuess = (guess: string) => {
    if (gameState !== 'playing') return;

    // Calculate exact positional matches
    let matches = 0;
    for (let i = 0; i < guess.length; i++) {
      if (guess[i] === targetWord[i]) matches++;
    }

    const newHistory = [...history, { guess, matches }];
    setHistory(newHistory);

    if (matches === targetWord.length) {
      setGameState('won');
    } else {
      const newAttempts = attempts - 1;
      setAttempts(newAttempts);
      if (newAttempts === 0) {
        setGameState('lost');
      }
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') router.push('/games');
      if (e.key === 'Enter' && gameState !== 'playing') startNewGame();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, gameState]);

  return (
    <div className="min-h-screen bg-black text-[#33ff00] font-mono p-4 md:p-8 uppercase crt relative overflow-hidden flex flex-col">
      <div className="terminal-glow absolute inset-0 pointer-events-none"></div>

      {/* Header */}
      <div className="flex justify-between border-b-2 border-[#33ff00] pb-2 mb-6 z-10">
        <span>ROBCO INDUSTRIES UNIFIED OPERATING SYSTEM</span>
        <span>COPYRIGHT 2026-2077</span>
        <span>-Server 1-</span>
      </div>

      <div className="flex flex-col md:flex-row gap-8 flex-1 z-10">
        
        {/* Left/Middle Panels: Memory Dump */}
        <div className="flex-1 flex gap-8">
          {/* Column 1 */}
          <div className="flex flex-col gap-1 text-sm tracking-widest">
            {memoryDump.slice(0, 15).map((row) => (
              <div key={row.id} className="flex gap-4">
                <span className="opacity-70">{row.hex}</span>
                {row.word ? (
                  <span>
                    {row.text.split(row.word)[0]}
                    <button 
                      onClick={() => handleGuess(row.word!)}
                      disabled={gameState !== 'playing'}
                      className="hover:bg-[#33ff00] hover:text-black cursor-pointer transition-none"
                    >
                      {row.word}
                    </button>
                    {row.text.split(row.word)[1]}
                  </span>
                ) : (
                  <span>{row.text}</span>
                )}
              </div>
            ))}
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-1 text-sm tracking-widest">
            {memoryDump.slice(15, 30).map((row) => (
              <div key={row.id} className="flex gap-4">
                <span className="opacity-70">{row.hex}</span>
                {row.word ? (
                  <span>
                    {row.text.split(row.word)[0]}
                    <button 
                      onClick={() => handleGuess(row.word!)}
                      disabled={gameState !== 'playing'}
                      className="hover:bg-[#33ff00] hover:text-black cursor-pointer transition-none"
                    >
                      {row.word}
                    </button>
                    {row.text.split(row.word)[1]}
                  </span>
                ) : (
                  <span>{row.text}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Console & Feedback */}
        <div className="w-full md:w-80 flex flex-col border border-[#33ff00] p-4 bg-[#33ff00]/5">
          <h2 className="mb-4 border-b border-[#33ff00] pb-2 text-xl">TERMINAL LINK</h2>
          
          <div className="mb-6 flex gap-2 text-xl font-bold">
            <span>ATTEMPTS REMAINING:</span>
            <div className="flex gap-2 text-red-500 animate-pulse">
              {Array.from({ length: attempts }).map((_, i) => (
                <span key={i}>#</span>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-2 text-sm custom-scrollbar pr-2">
            <p className="opacity-70">{">"} ENTER PASSWORD NOW</p>
            
            {history.map((entry, idx) => (
              <div key={idx} className="flex flex-col">
                <span>{">"} {entry.guess}</span>
                <span>{">"} ENTRY DENIED ({entry.matches}/9 CORRECT)</span>
              </div>
            ))}

            {gameState === 'won' && (
              <div className="mt-4 p-4 border border-[#33ff00] bg-[#33ff00] text-black animate-pulse font-bold text-center">
                EXACT MATCH! <br/> SYSTEM UNLOCKED. <br/> PRESS ENTER TO RESTART.
              </div>
            )}

            {gameState === 'lost' && (
              <div className="mt-4 p-4 border border-red-500 bg-red-500/20 text-red-500 animate-pulse font-bold text-center">
                LOCKOUT INITIATED. <br/> TARGET WAS: {targetWord} <br/> PRESS ENTER TO RESTART.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex justify-between z-10 text-sm opacity-70">
        <p>PF3=ABORT TO DIRECTORY</p>
        <button onClick={() => router.push('/games')} className="hover:bg-[#33ff00] hover:text-black px-2">
          [EXIT MODULE]
        </button>
      </div>
    </div>
  );
}