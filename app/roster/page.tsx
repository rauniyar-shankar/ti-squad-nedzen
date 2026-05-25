"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase'; // Verify this path matches your setup

interface RosterUser {
  userid: string;
  first_name: string;
  last_name: string;
  nick_name: string;
  role: string;
  power_level: number;
  theme: { border: string; text: string; bg: string; bar: string; shadow: string };
  stats: { label: string; value: number }[];
}

export default function CyberpunkRoster() {
  const router = useRouter();
  const [teamData, setTeamData] = useState<RosterUser[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [animate, setAnimate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Cyberpunk theme allocator based on role
 // Cyberpunk theme allocator based strictly on POWER LEVEL
  const getTheme = (power: number) => {
    // TIER 1: SUPREME (Purple) - Power 9500+
    if (power > 9500) {
      return { 
        border: 'border-purple-500', text: 'text-purple-400', bg: 'bg-purple-500/10', 
        bar: 'from-purple-600 to-purple-400', shadow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]' 
      };
    }
    
    // TIER 2: ELITE (Emerald) - Power 9000 to 9499
    if (power >= 9000 && power < 9501) {
      return { 
        border: 'border-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500/10', 
        bar: 'from-emerald-600 to-emerald-400', shadow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
      };
    }
    
    // TIER 3: ADVANCED (Blue) - Power 8500 to 8999
    if (power >= 8500 && power < 9000) {
      return { 
        border: 'border-blue-500', text: 'text-blue-400', bg: 'bg-blue-500/10', 
        bar: 'from-blue-600 to-blue-400', shadow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]' 
      };
    }
    
    // TIER 4: OPERATIVE (Amber) - Power 5000 to 8499
    if (power >= 5000 && power < 8500) {
      return { 
        border: 'border-amber-500', text: 'text-amber-400', bg: 'bg-amber-500/10', 
        bar: 'from-amber-600 to-amber-400', shadow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]' 
      };
    }

    // TIER 5: RECRUIT / FALLBACK (Slate) - Below 5000
    return { 
      border: 'border-slate-500', text: 'text-slate-400', bg: 'bg-slate-500/10', 
      bar: 'from-slate-600 to-slate-400', shadow: 'shadow-[0_0_20px_rgba(148,163,184,0.3)]' 
    };
  };

  const generateStats = (power: number) => {
    const base = Math.min(99, Math.floor(power / 100));
    return [
      { label: 'MAINFRAME EXECUTION', value: base },
      { label: 'SYSTEM ARCHITECTURE', value: Math.max(85, base - 4) },
      { label: 'CODE RELIABILITY', value: Math.max(88, base - 2) },
      { label: 'SQUAD SYNERGY', value: 95 },
    ];
  };

useEffect(() => {
    async function loadRoster() {
      const { data, error } = await supabase
        .from('racf_users')
        .select('*')
        .order('power_level', { ascending: false }); 

      if (!error && data) {
        const formattedData = data.map((user) => ({
          ...user,
          theme: getTheme(user.power_level),
          stats: generateStats(user.power_level)
        }));
        
        // STRICT CLEARANCE: Only keep users whose role does NOT contain 'ZENSAR'
        const tiSquadOnly = formattedData.filter(user => !(user.role || '').toUpperCase().includes('ZENSAR'));
        
        setTeamData(tiSquadOnly);
        
        // Auto-select the highest-power TI member on load
        if (tiSquadOnly.length > 0) {
          setSelectedId(tiSquadOnly[0].userid);
        }
      }
      setIsLoading(false);
    }
    loadRoster();
  }, []);

  useEffect(() => {
    if (selectedId) {
      setAnimate(false);
      const timer = setTimeout(() => setAnimate(true), 50);
      return () => clearTimeout(timer);
    }
  }, [selectedId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') router.push('/menu');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-mono text-purple-400">
        <div className="animate-pulse tracking-widest font-bold">[ DECRYPTING DOSSIERS... ]</div>
        <div className="text-xs text-slate-600 mt-2">ESTABLISHING SECURE DATABASE UPLINK</div>
      </div>
    );
  }

  const activePlayer = teamData.find(p => p.userid === selectedId) || teamData[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-mono p-4 md:p-8 flex flex-col items-center uppercase relative overflow-hidden selection:bg-purple-500/30">
      
      {/* 3D Animated Background Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20" 
           style={{
             backgroundImage: 'linear-gradient(rgba(168, 85, 247, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.2) 1px, transparent 1px)',
             backgroundSize: '40px 40px',
             transform: 'perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)',
             animation: 'gridMove 20s linear infinite'
           }}>
      </div>
      <style>{`
        @keyframes gridMove {
          0% { background-position: 0px 0px; }
          100% { background-position: 40px 40px; }
        }
      `}</style>

      {/* Header */}
      <div className="w-full max-w-7xl flex justify-between items-center mb-8 z-10 border-b border-slate-700 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-widest text-white">TI.SQUAD WARRIORS</h1>
          <p className="text-xs text-slate-500 mt-1">AUTHORIZED EYES ONLY</p>
        </div>
        <button 
          onClick={() => router.push('/menu')}
          className="px-6 py-2 bg-transparent text-slate-400 border border-slate-600 hover:text-white hover:border-white transition-all text-xs tracking-widest"
        >
          [ ESC ] RETURN
        </button>
      </div>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 z-10 flex-1">
        
        {/* Left Sidebar: The Roster List */}
        <div className="lg:col-span-4 flex flex-col gap-3 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
          {teamData.map((player) => (
            <button
              key={player.userid}
              onClick={() => setSelectedId(player.userid)}
              className={`text-left p-4 transition-all duration-300 border backdrop-blur-sm ${
                selectedId === player.userid 
                  ? `${player.theme.bg} ${player.theme.border} ${player.theme.shadow} scale-[1.02]` 
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-500 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center text-white font-bold border ${player.theme.border} ${selectedId === player.userid ? player.theme.bg : 'bg-black'} transition-colors`}>
                  {player.first_name.substring(0, 1)}{player.last_name.substring(0, 1)}
                </div>
                <div className="overflow-hidden">
                  <h3 className={`font-bold truncate tracking-wider ${selectedId === player.userid ? 'text-white' : 'text-slate-400'}`}>
                    {player.first_name} {player.last_name}
                  </h3>
                  <p className="text-xs text-slate-600 truncate">{player.role}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Right Panel: The Detailed Dossier */}
        {activePlayer && (
          <div className="lg:col-span-8 flex justify-center items-start">
            <div className={`w-full max-w-3xl bg-black/60 backdrop-blur-md border ${activePlayer.theme.border} ${activePlayer.theme.shadow} transition-all duration-500 overflow-hidden`}>
              
              {/* Header Banner */}
              <div className={`h-24 w-full border-b ${activePlayer.theme.border} ${activePlayer.theme.bg} relative flex items-center px-8`}>
                <span className="text-[10px] tracking-[0.3em] opacity-50 absolute top-4 right-4">ID: {activePlayer.userid}</span>
              </div>

              <div className="p-8 relative">
                {/* Floating Avatar */}
                <div className={`absolute -top-16 left-8 w-24 h-24 border-2 ${activePlayer.theme.border} bg-black flex items-center justify-center text-3xl font-bold ${activePlayer.theme.text} transition-transform duration-700 ${animate ? 'scale-100 rotate-0' : 'scale-50 -rotate-90'}`}>
                  {activePlayer.first_name.substring(0, 1)}{activePlayer.last_name.substring(0, 1)}
                </div>

                <div className="flex justify-between items-start mt-10 mb-8">
                  <div className={`transition-all duration-500 delay-100 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                    <h2 className="text-4xl font-black text-white tracking-tight">
                      {activePlayer.first_name} {activePlayer.last_name}
                    </h2>
                    <p className={`text-sm font-bold tracking-widest mt-1 ${activePlayer.theme.text}`}>{activePlayer.role}</p>
                    <div className="inline-block mt-3 px-3 py-1 bg-white/5 border border-white/10 text-slate-300 text-xs tracking-widest">
                      AKA: {activePlayer.nick_name}
                    </div>
                  </div>
                  
                  <div className={`text-right transition-all duration-500 delay-200 ${animate ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
                    <p className="text-xs text-slate-500 font-bold tracking-widest mb-1">POWER LEVEL</p>
                    <p className={`text-5xl font-black ${activePlayer.theme.text} drop-shadow-[0_0_10px_currentColor]`}>
                      {animate ? activePlayer.power_level : 0}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-800 my-8"></div>

                {/* Animated Stat Bars */}
                <div className="space-y-6">
                  <h3 className="text-xs font-bold text-slate-500 tracking-widest mb-6">[ SYSTEM COMPETENCIES ]</h3>
                  {activePlayer.stats.map((stat, index) => (
                    <div key={stat.label} className={`transition-all duration-500 ${animate ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`} style={{ transitionDelay: `${300 + (index * 100)}ms` }}>
                      <div className="flex justify-between mb-2 text-xs font-bold tracking-wider">
                        <span className="text-slate-400">{stat.label}</span>
                        <span className="text-white">{stat.value}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-900 overflow-hidden border border-slate-800">
                        <div 
                          className={`h-full bg-gradient-to-r ${activePlayer.theme.bar} transition-all ease-out duration-1000`}
                          style={{ width: animate ? `${stat.value}%` : '0%' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}