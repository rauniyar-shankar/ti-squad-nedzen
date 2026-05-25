"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

// The Upgraded Serious AI Nodes
const AGENTS = [
  {
    id: 'omni',
    name: 'OMNI-CORE SYNTHESIS',
    role: 'ASK THE OMNI-CORE ANYTHING',
    color: 'text-purple-400',
    border: 'border-purple-400/50',
    bg: 'bg-purple-400/10',
    status: 'READY TO GO',
    systemMessage: "SYS_MSG: Omni-Core initialized. Shankyy's personal AI, trained on a secret blend of the most powerful LLMs and fine-tuned with custom system prompts to be the ultimate technical assistant. We're ready to receive your queries."
  },
  {
    id: 'pure',
    name: 'PURE AGENT LAB',
    role: 'CUSTOM LOCAL MODELS (IN DEV)',
    color: 'text-slate-300',
    border: 'border-slate-500/50',
    bg: 'bg-slate-500/10',
    status: 'COMPILING',
    systemMessage: "SYS_MSG: Pure Agent sandbox environment loaded. Ready to receive custom agent parameters and local weights. We are still in the development phase of this node, so expect some instability and missing features. Please check back later for updates."
  }
];

type Message = { sender: 'user' | 'agent' | 'system'; text: string; id: number };

export default function AgentNetwork() {
  const router = useRouter();
  
  const [activeAgent, setActiveAgent] = useState(AGENTS[0]);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeUser, setActiveUser] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load the user's alias for the chat logs
  useEffect(() => {
    const currentSession = localStorage.getItem('racf_session');
    if (currentSession) {
      // In a real app we'd fetch from Supabase again, but for speed we can just use the ID
      // or rely on the fact that they are authenticated.
      setActiveUser({ userid: currentSession });
    }
  }, []);

  // Initial connection message when switching agents
  useEffect(() => {
    setMessages([
      { sender: 'system', text: `ESTABLISHING SECURE HANDSHAKE WITH ${activeAgent.name}...`, id: Date.now() },
      { sender: 'agent', text: activeAgent.systemMessage, id: Date.now() + 1 }
    ]);
  }, [activeAgent]);

  // Handle hitting Escape
  useEffect(() => {
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

const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input;
    setInput('');
    
    // Add User Message to the screen
    setMessages(prev => [...prev, { sender: 'user', text: userMsg, id: Date.now() }]);
    scrollToBottom();
    setIsTyping(true);
    
    if (activeAgent.id === 'omni') {
      try {
        // Send the real request to your Next.js backend
        const res = await fetch('/api/omni', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: userMsg })
        });
        
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error);

        setMessages(prev => [...prev, { 
          sender: 'agent', 
          text: data.reply, 
          id: Date.now() + 1 
        }]);
      } catch (err: any) {
        setMessages(prev => [...prev, { 
          sender: 'system', 
          text: err.message, 
          id: Date.now() + 1 
        }]);
      }
    } else {
      // Fake delay for the other unfinished nodes
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          sender: 'system', 
          text: `ERR_NODE_OFFLINE: ${activeAgent.name} is not ready for your bullet's, In the learning phase of dodging it.`, 
          id: Date.now() + 1 
        }]);
      }, 1000);
    }
    
    setIsTyping(false);
    scrollToBottom();
  };

  const switchAgent = (agent: typeof AGENTS[0]) => {
    if (isTyping || activeAgent.id === agent.id) return;
    setActiveAgent(agent);
    setInput('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-mono p-4 md:p-8 uppercase crt relative overflow-hidden flex flex-col">
      <div className="terminal-glow absolute inset-0 pointer-events-none"></div>

      {/* Header */}
      <div className="flex justify-between border-b border-slate-700 pb-2 mb-6 z-10 text-sm opacity-80">
        <span className="text-purple-400 font-bold">Zensar TI.SQUAD NEDBANK</span>
        <span className="hidden md:inline">ENCRYPTION: DO NOT WORRY, YOU ARE SECURED, WE WON'T SELL YOU</span>
        <span>STATUS: ANYTIME FOR YOU</span>
      </div>

      <div className="flex flex-col md:flex-row gap-8 flex-1 z-10 h-full overflow-hidden">
        
        {/* Left Panel: Agent Selection */}
        <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col gap-4">
          <h2 className="border-b border-slate-700 pb-2 mb-2 text-sm tracking-widest text-slate-500">AVAILABLE CORES:</h2>
          
          {AGENTS.map(agent => (
            <button
              key={agent.id}
              onClick={() => switchAgent(agent)}
              disabled={isTyping}
              className={`p-4 border text-left flex flex-col transition-all ${
                activeAgent.id === agent.id 
                  ? `${agent.border} ${agent.bg} shadow-[0_0_20px_rgba(168,85,247,0.15)]` 
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-600'
              }`}
            >
              <span className={`font-bold text-lg tracking-wide ${activeAgent.id === agent.id ? agent.color : 'text-slate-400'}`}>
                {agent.name}
              </span>
              <span className="text-xs mt-1 text-slate-500">{agent.role}</span>
              
              <div className="mt-4 flex items-center justify-between text-[10px]">
                <span className={activeAgent.id === agent.id ? agent.color : 'text-slate-600'}>
                  {activeAgent.id === agent.id ? '[ ACTIVE ]' : '[ OFFLINE ]'}
                </span>
                <span className="opacity-50">{agent.status}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Right Panel: The Terminal Chat */}
        <div className="flex-1 flex flex-col border border-slate-800 bg-black relative shadow-2xl">
          
          {/* Terminal Header */}
          <div className={`p-3 border-b ${activeAgent.border} ${activeAgent.bg} flex justify-between items-center`}>
            <span className={`font-bold tracking-widest ${activeAgent.color}`}>UPLINK: {activeAgent.name}</span>
            <span className="text-xs opacity-50">PORT: 13</span>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar text-sm">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] opacity-40 mb-1 tracking-widest">
                  {msg.sender === 'user' ? (activeUser?.userid || 'GUEST_USER') : (msg.sender === 'system' ? 'SYSTEM' : activeAgent.name)}
                </span>
                <div className={`max-w-[85%] p-4 rounded-sm border whitespace-pre-wrap ${
                    msg.sender === 'user' 
                    ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' 
                    : msg.sender === 'system'
                    ? 'border-red-500/30 text-red-400 bg-red-500/5 font-bold'
                    : `${activeAgent.border} ${activeAgent.color}`
                    }`}>
                    {msg.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="items-start flex flex-col mt-2">
                <span className="text-[10px] opacity-40 mb-1 tracking-widest">SYSTEM</span>
                <div className={`max-w-[80%] p-3 border border-slate-700 text-slate-500 animate-pulse`}>
                  ROUTING QUERY TO BACKEND...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/50">
            <form onSubmit={handleSend} className="flex gap-4 items-center">
              <span className={`opacity-70 ${activeAgent.color}`}>{">"}</span>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isTyping}
                placeholder={`INITIALIZE QUERY TO ${activeAgent.name}...`}
                className="flex-1 bg-transparent border-b border-transparent focus:border-slate-500 outline-none text-white disabled:opacity-50 font-sans tracking-wide"
                spellCheck="false"
                autoFocus
              />
              <button 
                type="submit"
                disabled={!input.trim() || isTyping}
                className={`px-6 py-2 border font-bold tracking-widest transition-colors disabled:opacity-30 ${activeAgent.border} ${activeAgent.color} hover:bg-white/5`}
              >
                EXECUTE
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex justify-between z-10 text-[10px] text-slate-500 tracking-widest">
        <p>ESC = SEVER CONNECTION & RETURN TO DIRECTORY</p>
      </div>
    </div>
  );
}