"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from './lib/supabase'; 

export default function Logon() {
  const [userid, setUserid] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const passwordRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Handles pressing 'Enter' to move from UserID to Password, and then to Logon
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, field: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (field === 'userid' && passwordRef.current) {
        passwordRef.current.focus();
      } else if (field === 'password') {
        handleLogon();
      }
    }
  };

  // The missing function! This checks the database and saves your session.
  const handleLogon = async () => {
    if (!userid || !password) {
      setErrorMsg('DFHCE3549 ENTER USERID AND PASSWORD');
      return;
    }

    setIsLoading(true);
    setErrorMsg('VALIDATING RACF CREDENTIALS...');

    try {
      const { data, error } = await supabase
        .from('racf_users')
        .select('*')
        .eq('userid', userid)
        .eq('pin', password)
        .single();

      if (error || !data) {
        setErrorMsg('DFHCE3549 REJECTED - INVALID LOGON ATTEMPT');
        setUserid('');
        setPassword('');
        if (passwordRef.current) passwordRef.current.focus();
      } else {
        // --- THIS IS THE NEW SESSION LOCK ---
        localStorage.setItem('racf_session', data.userid);
        localStorage.setItem('user_nickname', data.nick_name || data.first_name);
        setErrorMsg(`ACCESS GRANTED. WELCOME ${data.nick_name}.`);
        setTimeout(() => {
          router.push('/menu'); 
        }, 1500); 
      }
    } catch (err) {
      setErrorMsg('SYS_ERR: DATABASE CONNECTION FAILED');
    } finally {
      setIsLoading(false);
    }
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

      <div className="flex-1 flex flex-col items-center justify-center -mt-32 tracking-widest z-20">
        <h1 className="text-xl md:text-2xl mb-12 border-b-2 border-[#33ff00] pb-2 text-center">
          TI SQUAD SECURE GATEWAY
        </h1>
        
        <div className="w-full max-w-md flex flex-col items-center">
          <p className="mb-6 text-center">PLEASE ENTER YOUR RACF CREDENTIALS</p>
          
          <div className="w-64">
            <div className="flex mb-4 items-center">
              <span className="w-24 text-right">USERID</span>
              <span className="mx-2">{"===>"}</span>
              <input
                  autoFocus
                  type="text"
                  maxLength={12}
                  value={userid}
                  onChange={(e) => setUserid(e.target.value.toUpperCase())}
                  onKeyDown={(e) => handleKeyDown(e, 'userid')}
                  disabled={isLoading}
                  className="terminal-input w-32 border-b border-transparent focus:border-[#33ff00] disabled:opacity-50"
                  spellCheck="false"
/>
            </div>

            <div className="flex mb-8 items-center">
              <span className="w-24 text-right">PASSWORD</span>
              <span className="mx-2">{"===>"}</span>
              <input
                    ref={passwordRef}
                    type="password"
                    maxLength={12}
                    value={password}
                    onChange={(e) => setPassword(e.target.value.toUpperCase())}
                    onKeyDown={(e) => handleKeyDown(e, 'password')}
                    disabled={isLoading}
                    className="terminal-input w-32 border-b border-transparent focus:border-[#33ff00] disabled:opacity-50"
                    spellCheck="false"
              />
            </div>
          </div>

          <div className="h-8 text-center text-red-500 animate-pulse">
            {errorMsg}
          </div>
        </div>
      </div> 

      <div className="absolute bottom-8 left-8 tracking-widest text-sm z-20">
        <p>PF3=END  PF12=CANCEL  ENTER=LOGON</p>
      </div>
    </div>
  );
}