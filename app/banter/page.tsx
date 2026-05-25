"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

export default function BanterBoard() {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState('');
  const [activeUser, setActiveUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Securely load session and fetch posts
  useEffect(() => {
    async function loadData() {
      try {
        const currentSession = localStorage.getItem('racf_session');
        if (!currentSession) throw new Error("UNAUTHORIZED: No active session found.");

        const { data: userData, error: userError } = await supabase
          .from('racf_users')
          .select('*')
          .eq('userid', currentSession)
          .single();
          
        if (userError || !userData) throw new Error("UNAUTHORIZED: Invalid session data.");
        setActiveUser(userData);

        fetchPosts();
      } catch (err: any) {
        setErrorMsg(err.message);
        setIsLoading(false);
      }
    }
    loadData();

    // Escape key returns to menu
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') router.push('/menu');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('banter_posts')
      .select('*, racf_users(*)')
      .order('created_at', { ascending: false });
    
    if (data) setPosts(data);
    setIsLoading(false);
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || !activeUser) return;

    const content = newPost;
    setNewPost('');

    await supabase.from('banter_posts').insert([
      { userid: activeUser.userid, content: content }
    ]);
    
    fetchPosts();
  };

  const handleUpvote = async (postId: string, currentUpvotes: number) => {
    // Optimistic UI update for instant feedback
    setPosts(posts.map(p => p.id === postId ? { ...p, upvotes: currentUpvotes + 1 } : p));
    
    await supabase
      .from('banter_posts')
      .update({ upvotes: currentUpvotes + 1 })
      .eq('id', postId);
      
    fetchPosts();
  };

  // Render Error State
  if (errorMsg) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 font-mono">
        <div className="max-w-2xl bg-red-950/50 border border-red-500 p-8 rounded-xl text-red-400 text-center">
          <h2 className="text-xl font-bold mb-4">SECURITY LOCKOUT</h2>
          <p className="mb-4">{errorMsg}</p>
          <button onClick={() => router.push('/')} className="mt-4 px-6 py-2 bg-red-900/50 hover:bg-red-800 rounded text-white font-bold transition-colors border border-red-700">
            RETURN TO LOGON
          </button>
        </div>
      </div>
    );
  }

  // Render Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center font-mono text-cyan-500 animate-pulse text-xl tracking-widest">
        LOADING BANTER PROTOCOLS...
      </div>
    );
  }

  // Main UI Render
  return (
    <div className="min-h-screen relative bg-slate-950 flex flex-col items-center p-6 font-sans">
      
      {/* Deep Space Background Glow */}
      <div className="fixed top-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-cyan-600/10 blur-[150px] pointer-events-none"></div>
      <div className="fixed bottom-[10%] right-[20%] w-[30%] h-[30%] rounded-full bg-blue-600/10 blur-[150px] pointer-events-none"></div>

      <div className="w-full max-w-3xl flex flex-col h-[90vh] relative z-10">
        
        {/* Header */}
        <div className="flex justify-between items-end border-b border-white/10 pb-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-wide">CORPORATE BANTER</h1>
            <p className="text-cyan-400 text-xs font-mono mt-1">THE TI SQUAD WALL OF FAME/SHAME</p>
          </div>
          <button onClick={() => router.push('/menu')} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-full text-sm font-medium hover:bg-slate-700 transition-colors border border-slate-600 font-mono">
            ESC = DISCONNECT
          </button>
        </div>

        {/* Input Form */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 mb-6 shadow-lg">
          <form onSubmit={handlePost} className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sm text-white shrink-0 border border-slate-600">
              {activeUser?.first_name?.[0]}{activeUser?.last_name?.[0]}
            </div>
            <input
              type="text"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Drop a joke or a legendary quote..."
              className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all font-medium"
            />
            <button 
              type="submit"
              disabled={!newPost.trim()}
              className="px-6 rounded-xl bg-cyan-600 text-white font-bold hover:bg-cyan-500 hover:shadow-[0_0_15px_rgba(8,145,178,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              POST
            </button>
          </form>
        </div>

        {/* The Feed */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4 pr-2 pb-10">
          {posts.map((post) => (
            <div key={post.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 shadow-lg flex gap-4 hover:border-white/20 transition-all">
              
              {/* Upvote Column */}
              <div className="flex flex-col items-center gap-1 shrink-0 w-12">
                <button 
                  onClick={() => handleUpvote(post.id, post.upvotes)}
                  className="w-8 h-8 rounded hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400 flex items-center justify-center transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="18 15 12 9 6 15"></polyline>
                  </svg>
                </button>
                <span className={`font-mono font-bold text-sm ${post.upvotes > 0 ? 'text-cyan-400' : 'text-slate-500'}`}>
                  {post.upvotes}
                </span>
              </div>

              {/* Content Column */}
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-slate-200">
                    {post.racf_users ? (post.racf_users.nick_name || post.racf_users.first_name) : post.userid}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed text-sm">
                  {post.content}
                </p>
              </div>

            </div>
          ))}
          
          {posts.length === 0 && (
            <div className="text-center text-slate-500 font-mono mt-10 opacity-50">
              NO BANTER FOUND. THE SQUAD IS BEING TOO PRODUCTIVE.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}