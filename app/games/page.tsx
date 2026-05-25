"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GamesDirectory() {
  const router = useRouter();
  const [selection, setSelection] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(selection);
    }
  };

  const executeCommand = (cmd: string) => {
    setErrorMsg(''); 
    
    switch (cmd) {
      case '1':
        router.push('/games/terminal'); // <-- Change this line to route to the game!
        break;
      case '2':
        router.push('/games/arcade'); // <-- Change this line to route to the game!
        break;
      case '3':
        router.push('/menu'); // Routes back up to the Main Menu
        break;
      default:
        setErrorMsg('DFHCE3549 INVALID COMMAND ENTERED');
    }
    setSelection('');
  };

  const handleMouseClick = (cmd: string) => {
    executeCommand(cmd);
  };

  return (
    <div 
      className="relative crt font-mono w-screen h-screen p-8 flex flex-col uppercase terminal-glow overflow-hidden"
      style={{ backgroundColor: '#000000', color: '#33ff00' }}
    >
      <div className="flex justify-between w-full max-w-4xl tracking-widest text-sm md:text-base z-20 opacity-70">
        <span>DIR: /GAMES</span>
        <span>ACCESS=GRANTED</span>
        <span>MODE=ENTERTAINMENT</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center -mt-20 tracking-widest z-20">
        <h1 className="text-xl md:text-2xl mb-12 border-b-2 border-[#33ff00] pb-2 text-center text-[#33ff00]">
          TI SQUAD GAMES DIRECTORY
        </h1>
        
        <div className="w-full max-w-md">
          <p className="mb-6 text-center text-emerald-700 font-bold tracking-widest">
            ** WARNING: NON-PRODUCTIVE ZONE **
          </p>
          
          <ul className="space-y-6 mb-12 border border-[#33ff00]/30 p-8 rounded-sm bg-[#33ff00]/5">
            <li>
              <button onClick={() => handleMouseClick('1')} className="hover:bg-[#33ff00] hover:text-black transition-colors px-2 w-full text-left">
                1. TERMINAL MINIGAMES
              </button>
            </li>
            <li>
              <button onClick={() => handleMouseClick('2')} className="hover:bg-[#33ff00] hover:text-black transition-colors px-2 w-full text-left">
                2. MODERN ARCADE CLASSICS
              </button>
            </li>
            <li className="pt-4 border-t border-[#33ff00]/30">
              <button onClick={() => handleMouseClick('3')} className="hover:bg-[#33ff00] hover:text-black transition-colors px-2 w-full text-left">
                3. RETURN TO MAIN MENU
              </button>
            </li>
          </ul>

          <div className="flex items-center">
            <span className="w-24 text-right">COMMAND</span>
            <span className="mx-2">{"===>"}</span>
            <input
              autoFocus
              type="text"
              maxLength={8}
              value={selection}
              onChange={(e) => setSelection(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              className="terminal-input w-24 border-b border-transparent focus:border-[#33ff00] bg-transparent text-[#33ff00] outline-none"
              spellCheck="false"
            />
          </div>

          <div className="h-8 mt-6 text-center text-red-500 animate-pulse">
            {errorMsg}
          </div>
        </div>
      </div> 

      <div className="absolute bottom-8 left-8 tracking-widest text-sm z-20 opacity-70">
        <p>PF3=BACK  ENTER=EXECUTE</p>
      </div>
    </div>
  );
}