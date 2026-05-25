"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// 1. THE CLASSIFIED PERSONAL PAYLOADS
// Keys are strictly UPPERCASE to match the logic lookup
const MASTER_DISPATCHES: Record<string, string> = {
  'MORGAN SIR': "Hey Morgan, it has truly been an honor learning from you. Your mentorship has been invaluable, and the time I spent in your orbit gave me the confidence to take on new challenges. Final goodbyes are always the hardest, but I know we are going to cross paths again and party hard. You are always welcome at my place, and I hope I'm welcome at yours. Thank you for everything.",
  
  'BOSS': "Hi Abdul, your leadership brought me the joy of real learning and growth. I have always admired your ability to be a great leader and mentor, and I hope I can be that for someone else in the future. You were always the one supporting us through the hard times, the good times, and the fun times. We will stay in touch, and hopefully, we will strike back somewhere together. Thank you for everything.",
  
  'SATISH BHAIYA': "Satish Bhaiya, I was just a kid with a fresh mind when I joined TI; you trained me to become a beast and take on real responsibility. You were always there to support us, anytime, anywhere. The personal bond we created throughout this journey is something I will cherish forever. Thank you for being a great mentor and, most importantly, our super Bhaiya.",
  
  'SUSHI': "Sushant, thanks for being the go-to guy for all things code and deployment. I honestly see a replica of myself in you. Keep grinding, keep pushing yourself, and know I am always here to support you. We are practically leaving the TI Squad together—all the best for your future! Keep in touch, we will definitely meet again.",
  
  'KRISHNU': "Krishna, you have always been like a little brother to me. From being flatmates for over a year to traveling and partying together, I have watched you grow from a seedling into a solid plant. You have the potential to grow into a massive tree—keep watering yourself with knowledge and experience. I'm always here for you. Stay sharp and keep in touch.",
  
  'SWATHI': "Hey Swathi, thanks for being the ultimate go-to person for so many tasks—be it the monthly pack reports, handling job abends during on-call support, or anything CASA-related. Having been on the same team for a long time, I have watched you learn and grow so fast. You have the potential to be a massive asset wherever you go. Keep learning, keep growing, and keep in touch!",
  
  'ALATMASH BRO': "Hey Altamash Bro, I'm sure you are going to miss me calling you that. We have been together in the TI Squad since the day we got these projects. We grinded together and learned together. It honestly doesn't feel real to be leaving the squad, but change is the only constant. You have been a great friend and partner in this journey. I wish you the absolute best in your future endeavors.",
  
  'CHANDAN': "Hey Chandan, it hasn't been very long since you took over the projects for the TI Squad, but it feels like you've always been here. We had a few conversations, and they were always incredibly insightful. Thank you for all your support. We will definitely keep in touch and cross paths again.",
  
  'SACHINDRA': "Hey Sachindra, we may not have chatted daily, but whenever we did, it was always insightful. I never hesitated to reach out to you for anything. I'll never forget the good times during our lunches—whether it was the Hyatt, Chaitanya Paratha, or that surprise meetup in Kokan. I admire your banter, your humor, and your leadership. Thank you for the support.",
  
  'VIVEK': "Hey Vivek, my only regret is that you just arrived to lead TI Squad and CASA, and I am leaving so soon, meaning I won't get to learn as much from you as I wanted. Still, we had some really great conversations, and I deeply appreciate your guidance. Let's keep in touch.",
  
  'VARUN': "Hi Varun, I am really grateful for the good times we shared in the office, whether it was during chai breaks or team lunches. I have always seen you as a great leader and an amazing person, and your energy is contagious. Keep that energy high. We will keep in touch and meet again soon.",
};

// 2. THE GLOBAL BROADCAST
const GLOBAL_DISPATCH = "To my favorite TI Squad: It has been an absolute honor working with all of you. Unlocking an ultra-supportive team like this is a rare gem. I learned something from every single one of you, senior and junior alike. The mentorship from Morgan, Abdul, and Satish is a luxury I was lucky to experience. The brother-bond with Alti—I genuinely wonder if I'll ever find that again. I will cherish every moment captured during this chapter of my life. Before signing off, this architecture, 'THE OMNI-CORE', is now yours to command. KEEP INNOVATING. ARCHITECT OUT. Shankyy, Signing Off.";

export default function AideuPage() {
  const router = useRouter();
  const [visitor, setVisitor] = useState<string | null>(null);

  useEffect(() => {
    // Retrieve the logged-in user's nickname from localStorage 
    const nickname = localStorage.getItem('user_nickname') || 'GUEST';
    setVisitor(nickname.toUpperCase());
  }, []);

  // Loading state to maintain the aesthetic
  if (!visitor) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center font-mono">
        <div className="animate-pulse tracking-widest text-emerald-400 font-bold">[ DECRYPTING CLEARANCE... ]</div>
      </div>
    );
  }

  // 3. THE NEW LAYERED LOGIC
  const getDisplayMessages = () => {
    
    // ADMIN OVERRIDE: Your exact database nickname
    if (visitor === 'SHANKYY') {
      const allPersonalNotes = Object.entries(MASTER_DISPATCHES).map(([name, note]) => ({ name, note }));
      return [
        ...allPersonalNotes,
        { name: 'TI SQUAD', note: GLOBAL_DISPATCH }
      ];
    }
    
    // TARGETED DISPATCH + GLOBAL BROADCAST
    const messages = [];
    const personalNote = MASTER_DISPATCHES[visitor || ''];
    
    // If they have a personal message, put it at the top
    if (personalNote) {
      messages.push({ name: visitor, note: personalNote });
    }

    // Everyone always gets the global broadcast at the bottom
    messages.push({ name: 'TI SQUAD // ZENSAR NETWORK', note: GLOBAL_DISPATCH });
    
    return messages;
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8 flex items-center justify-center font-mono selection:bg-emerald-500/30">
      <div className="max-w-2xl w-full border border-emerald-500 p-8 bg-black shadow-[0_0_50px_rgba(16,185,129,0.15)] relative mt-10 md:mt-0">
        
        {/* Decorative Top Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-900 via-emerald-500 to-emerald-900 opacity-50"></div>

        <h1 className="text-emerald-400 font-bold text-2xl mb-8 tracking-widest uppercase">
          // AIDEU: SHANKYY'S FINAL SIGNOFF
        </h1>
        
        <div className="space-y-8 min-h-[150px]">
          {getDisplayMessages().map((msg) => (
            <div key={msg.name} className="border-l-2 border-emerald-500/40 pl-4 py-2 transition-all">
              <span className="text-emerald-400 font-bold block mb-1 tracking-wider">[{msg.name}]</span>
              <p className="text-sm uppercase text-slate-300 leading-relaxed">{msg.note}</p>
            </div>
          ))}
        </div>

        <button 
          onClick={() => router.push('/menu')}
          className="mt-12 text-xs text-slate-500 border border-slate-700 px-6 py-4 hover:text-emerald-400 hover:border-emerald-500 transition-all duration-300 w-full tracking-widest uppercase font-bold"
        >
          [ ACKNOWLEDGE AND EXIT ]
        </button>
      </div>
    </div>
  );
}