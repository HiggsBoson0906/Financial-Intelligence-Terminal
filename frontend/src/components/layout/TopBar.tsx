import React, { useState, useEffect } from 'react';
import { Search, Bell, Clock, SlidersHorizontal, Sparkles, Command } from 'lucide-react';

interface TopBarProps {
  onSearchSubmit: (query: string) => void;
  onOpenAudit: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onSearchSubmit, onOpenAudit }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [timeZone, setTimeZone] = useState<'EST' | 'UTC'>('EST');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      if (timeZone === 'EST') {
        const estString = now.toLocaleTimeString('en-US', {
          timeZone: 'America/New_York',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        setCurrentTime(`${estString} EST`);
      } else {
        const utcString = now.toISOString().substring(11, 19);
        setCurrentTime(`${utcString} UTC`);
      }
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [timeZone]);

  const sampleQueries = [
    "How will a Gulf hurricane affect energy?",
    "Show semiconductor exposure",
    "Find similar historical events",
    "Why is NVDA moving?"
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      onSearchSubmit(searchQuery);
    }
  };

  return (
    <header className="h-14 bg-[#090b12] border-b border-[#1e2333] px-4 flex items-center justify-between gap-4 select-none shrink-0 z-20">
      {/* Global Search Bar */}
      <div className="flex-1 max-w-2xl relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Ask the terminal... (e.g., "How will a Gulf hurricane affect energy?")'
            className="w-full bg-[#0d101a] text-slate-100 placeholder-slate-500 pl-9 pr-24 py-1.5 rounded border border-[#1e2436] focus:border-[#00f0ff]/50 focus:outline-none focus:ring-1 focus:ring-[#00f0ff]/30 text-xs font-mono-data transition-all"
          />
          <div className="absolute right-2.5 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono-data">
            <span className="bg-[#151a28] px-1.5 py-0.5 rounded border border-[#232a3d] flex items-center gap-0.5">
              <Command className="w-3 h-3" /> K
            </span>
          </div>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="hidden lg:flex items-center gap-1.5 mt-1 overflow-x-auto no-scrollbar">
          <span className="text-[10px] text-slate-500 font-mono-data shrink-0">QUICK PROMPTS:</span>
          {sampleQueries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSearchQuery(q);
                onSearchSubmit(q);
              }}
              className="text-[10px] text-slate-400 hover:text-cyan-300 bg-[#0d101a] hover:bg-[#131929] px-2 py-0.5 rounded border border-[#1e2333] transition-colors truncate max-w-[220px]"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4 shrink-0 font-mono-data text-xs">
        {/* Market Status */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#0d1424] border border-[#17253d]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
          <span className="text-[11px] font-bold text-emerald-400 tracking-wider">MARKET OPEN</span>
        </div>

        {/* Live Clock with Toggle */}
        <button
          onClick={() => setTimeZone(timeZone === 'EST' ? 'UTC' : 'EST')}
          className="flex items-center gap-1.5 text-slate-300 hover:text-cyan-300 bg-[#0c0f18] px-2.5 py-1 rounded border border-[#1e2333] transition-colors"
          title="Click to toggle EST / UTC"
        >
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{currentTime}</span>
        </button>

        {/* View Reasoning / Audit Trigger */}
        <button
          onClick={onOpenAudit}
          className="flex items-center gap-1.5 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30 px-3 py-1 rounded text-xs font-semibold transition-all shadow-[0_0_10px_rgba(0,240,255,0.1)]"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>VIEW REASONING</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button className="p-1.5 text-slate-400 hover:text-slate-200 bg-[#0c0f18] rounded border border-[#1e2333] transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center border border-[#090b12]">
              3
            </span>
          </button>
        </div>

        {/* Profile Avatar */}
        <div className="w-7 h-7 rounded bg-[#161c2e] border border-[#2b354d] flex items-center justify-center font-bold text-slate-200 text-xs shadow-inner">
          QF
        </div>
      </div>
    </header>
  );
};
