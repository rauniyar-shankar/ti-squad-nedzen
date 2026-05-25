"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

export default function GlobalChat() {
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [activeSender, setActiveSender] = useState<any>(null);
  const [inputText, setInputText] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        // Get the logged-in user from the browser's memory
        const currentSession = localStorage.getItem('racf_session');

        if (!currentSession) {
          throw new Error("UNAUTHORIZED: No active session found. Please return to Logon.");
        }

        const { data: teamData, error: teamError } = await supabase
          .from('racf_users')
          .select('*')
          .ilike('role', '%TI SQUAD%');
          
        if (teamError) throw new Error(`Team Fetch Error: ${teamError.message}`);
        
        if (teamData && teamData.length > 0) {
          setTeam(teamData);
          // Lock the sender strictly to the logged-in user
          const me = teamData.find(u => u.userid === currentSession);
          if (!me) throw new Error("UNAUTHORIZED: Session invalid.");
          setActiveSender(me);
        } else {
          throw new Error("No TI Squad users found.");
        }

        const { data: msgData, error: msgError } = await supabase
          .from('chat_messages')
          .select('*, racf_users(*)')
          .order('created_at', { ascending: true });
          
        if (msgError) throw new Error(`Message Fetch Error: ${msgError.message}`);
        
        if (msgData) setMessages(msgData);
        
        setIsLoading(false);
        scrollToBottom();

      } catch (err: any) {
        console.error("Supabase Error:", err);
        setErrorMsg(err.message);
        setIsLoading(false);
      }
    }

    loadData();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') router.push('/menu');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeSender) return;

    const newMsg = inputText;
    setInputText('');

    const { error } = await supabase.from('chat_messages').insert([
      { userid: activeSender.userid, message: newMsg }
    ]);
    
    if (error) {
      alert(`Failed to send: ${error.message}`);
      return;
    }

    const { data } = await supabase
      .from('chat_messages')
      .select('*, racf_users(*)')
      .order('created_at', { ascending: true });
    
    if (data) {
      setMessages(data);
      scrollToBottom();
    }
  };

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 font-mono">
        <div className="max-w-2xl bg-red-950/50 border border-red-500 p-8 rounded-xl text-red-400">
          <h2 className="text-xl font-bold mb-4">SYSTEM FAILURE</h2>
          <p className="mb-4">The database rejected the connection. Exact Error:</p>
          <code className="block bg-black/50 p-4 rounded text-sm text-red-300">{errorMsg}</code>
          <button onClick={() => router.push('/')} className="mt-8 px-6 py-2 bg-red-900/50 hover:bg-red-800 transition-colors rounded text-white font-bold">
            RETURN TO LOGON
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center font-mono">
        <div className="text-emerald-500 animate-pulse text-xl tracking-widest">
          ESTABLISHING SECURE COMMS...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 flex items-center justify-center p-6 font-sans">
      
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/20 blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-7xl h-[85vh] flex gap-6 relative z-10">
        
        {/* Left Panel */}
        <div className="w-1/4 h-full flex flex-col gap-6">
          <div className="h-64 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-900/20"></div>
            <div className="relative animate-bounce duration-3000 ease-in-out">
              <svg width="100" height="100" viewBox="0 0 24 24" fill="none" className="drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="2" fill="#34d399" className="animate-pulse"/>
              </svg>
            </div>
            <h3 className="text-emerald-400 font-mono tracking-widest mt-4 text-sm font-bold uppercase">Nexus Bot_v2</h3>
            <p className="text-slate-400 text-xs text-center mt-1 px-4">Monitoring secure channels...</p>
          </div>

          <div className="flex-1 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-2">
            <h3 className="text-slate-300 text-xs font-bold uppercase tracking-widest mb-2 px-2">Comms Directory:</h3>
            {team.map(member => (
              <div
                key={member.userid}
                className={`p-3 rounded-xl flex items-center gap-3 transition-all duration-300 ${activeSender?.userid === member.userid ? 'bg-emerald-500/20 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)] text-white' : 'bg-transparent text-slate-400 border border-transparent'}`}
              >
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs">
                  {member.first_name?.[0]}{member.last_name?.[0]}
                </div>
                <div className="text-left overflow-hidden flex-1">
                  <p className="text-sm font-semibold truncate">{member.nick_name || member.first_name}</p>
                </div>
                {/* Visual Indicator for "You" */}
                {activeSender?.userid === member.userid && (
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">YOU</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 flex flex-col shadow-2xl relative overflow-hidden">
          <div className="h-20 border-b border-white/10 flex justify-between items-center px-8 bg-white/5">
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">Global Comms Network</h1>
              <p className="text-emerald-400 text-xs font-mono">CONNECTION: SECURE 256-BIT ENCRYPTION</p>
            </div>
            <button 
              onClick={() => router.push('/menu')} 
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-full text-sm font-medium hover:bg-slate-700 transition-colors border border-slate-600"
            >
              Disconnect
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 custom-scrollbar">
            {messages.map((msg, i) => {
              const isMe = msg.userid === activeSender?.userid;
              const sender = msg.racf_users;
              
              return (
                <div key={msg.id} className={`flex flex-col max-w-[70%] ${isMe ? 'self-end items-end' : 'self-start items-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`} style={{ animationDelay: `${Math.min(i * 50, 500)}ms` }}>
                  <span className="text-xs text-slate-400 mb-1 ml-1 font-medium tracking-wide uppercase">
                    {sender ? sender.nick_name || sender.first_name : msg.userid}
                  </span>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-lg backdrop-blur-md border ${
                    isMe 
                      ? 'bg-emerald-500/20 text-emerald-50 border-emerald-500/30 rounded-tr-sm' 
                      : 'bg-white/10 text-slate-200 border-white/10 rounded-tl-sm'
                  }`}>
                    {msg.message}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-6 bg-black/20 border-t border-white/10">
            <form onSubmit={sendMessage} className="flex gap-4">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Transmitting as ${activeSender?.nick_name || activeSender?.first_name}...`}
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all font-medium"
              />
              <button 
                type="submit"
                disabled={!inputText.trim()}
                className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(52,211,153,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}