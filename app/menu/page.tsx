"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MainMenu() {
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
        router.push('/roster'); 
        break;
      case '2':
        router.push('/agents'); // <-- Now routes to the new Agents Directory
        break;
      case '3':
        router.push('/games'); 
        break;
      case '4':
        router.push('/chat'); 
        break;
      case '5':
        router.push('/banter'); 
        break;
      case '6':
        setErrorMsg('SYS_ERR: CICS PRINT SPOOLER OFFLINE. CHECK LPT1.');
        break;
      case '7':
        router.push('/aideu'); // <-- Now routes to the AIDEU Farewell Page
        break;
      case '8':
      case 'LOGOFF':
        localStorage.removeItem('racf_session');
        router.push('/'); 
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
      <div className="flex justify-between w-full max-w-4xl tracking-widest text-sm md:text-base z-20">
        <span>DFHCE3549</span>
        <span>APPLID=NEDZEN</span>
        <span>DATE=24.05.26</span>
        <span>TIME=03:42:16</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center -mt-20 tracking-widest z-20">
        <h1 className="text-xl md:text-2xl mb-12 border-b-2 border-[#33ff00] pb-2 text-center">
          TI SQUAD MAIN MENU
        </h1>
        
        <div className="w-full max-w-md">
          <p className="mb-6 text-center text-slate-300">SELECT AN OPTION OR ENTER COMMAND</p>
          
          <ul className="space-y-4 mb-12">
            <li>
              <button onClick={() => handleMouseClick('1')} className="hover:bg-[#33ff00] hover:text-black transition-colors px-2">
                1. TI SQUAD 
              </button>
            </li>
            <li>
              <button onClick={() => handleMouseClick('2')} className="hover:bg-[#33ff00] hover:text-black transition-colors px-2">
                2. AI AGENTS (MUST TRY)
              </button>
            </li>
            <li>
              <button onClick={() => handleMouseClick('3')} className="hover:bg-[#33ff00] hover:text-black transition-colors px-2">
                3. FUN GAMES PDS
              </button>
            </li>
            <li>
              <button onClick={() => handleMouseClick('4')} className="hover:bg-[#33ff00] hover:text-black transition-colors px-2">
                4. GLOBAL SECURE COMMS (GROUP CHAT)
              </button>
            </li>
            
            <li>
              <button onClick={() => handleMouseClick('5')} className="hover:bg-[#33ff00] hover:text-black transition-colors px-2">
                5. CORPORATE BANTERS (GO POST YOURS)
              </button>
            </li>
            <li>
              <button onClick={() => handleMouseClick('6')} className="hover:bg-[#33ff00] hover:text-black transition-colors px-2 text-slate-600 line-through">
                6. PRINTER SPOOL (DISABLED)
              </button>
            </li>
            <li>
              <button onClick={() => handleMouseClick('7')} className="hover:bg-[#33ff00] hover:text-black transition-colors px-2">
                7. AIDEU - THE FINAL SIGNOFF
              </button>
            </li>
            <li>
              <button onClick={() => handleMouseClick('8')} className="hover:bg-red-500 hover:text-white text-red-500 transition-colors px-2 mt-4">
                8. LOGOFF
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

      <div className="absolute bottom-8 left-8 tracking-widest text-sm z-20">
        <p>PF3=LOGOFF  ENTER=EXECUTE</p>
      </div>
    </div>
  );
}