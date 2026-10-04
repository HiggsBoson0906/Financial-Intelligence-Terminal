import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Activity, Globe, ShieldAlert, TrendingUp } from 'lucide-react';

interface QueryBarProps {
  onRunAnalysis: (query: string) => void;
  isLoading?: boolean;
}

export const QueryBar: React.FC<QueryBarProps> = ({ onRunAnalysis, isLoading }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const placeholders = [
    "Ask about a market event...",
    "Explore portfolio exposure...",
    "Evaluate a weather-driven risk...",
    "Ask for a hedge strategy...",
    "Analyze energy-market conditions..."
  ];

  useEffect(() => {
    if (isFocused || query) return;
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isFocused, query]);

  const suggestions = [
    { text: "Gulf Coast Hurricane", icon: <Globe className="w-3 h-3" /> },
    { text: "Oil Supply Shock", icon: <Activity className="w-3 h-3" /> },
    { text: "Energy Portfolio", icon: <TrendingUp className="w-3 h-3" /> },
    { text: "Weather Risk", icon: <ShieldAlert className="w-3 h-3" /> }
  ];

  const handleRun = (selectedQuery?: string) => {
    const q = selectedQuery || query;
    if (q.trim()) {
      setQuery(q);
      onRunAnalysis(q);
    }
  };

  return (
    <div className="relative z-30 w-full flex flex-col gap-3">
      {/* Search Input Container */}
      <div className={`relative flex items-center bg-white dark:bg-slate-900 border ${isFocused ? 'border-blue-400 dark:border-blue-500 ring-4 ring-blue-500/10' : 'border-[#E2E8F0] dark:border-slate-800 hover:border-[#CBD5E1] dark:hover:border-slate-700'} rounded-xl shadow-sm transition-all duration-300 px-4 py-2.5`}>
        <div className="flex items-center gap-3 w-full">
          {/* AI Icon */}
          <div className={`flex items-center justify-center shrink-0 w-8 h-8 rounded-lg ${isFocused ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500'} transition-colors`}>
            <Sparkles className="w-4 h-4" />
          </div>

          <div className="flex flex-col flex-1">
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest leading-none mb-1">
              ✦ ASK PILLERSTREET
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => e.key === 'Enter' && handleRun()}
              placeholder={placeholders[placeholderIndex]}
              className="w-full bg-transparent text-[15px] text-[#0F172A] dark:text-slate-100 placeholder-[#94A3B8] dark:placeholder-slate-500 focus:outline-none placeholder-opacity-100 transition-all duration-500"
            />
          </div>

          {/* Action Button */}
          <button
            onClick={() => handleRun()}
            disabled={isLoading || (!query.trim() && !isLoading)}
            className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 disabled:hover:bg-blue-600 shadow-sm"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ANALYZING...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                RUN ANALYSIS
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Suggestion Chips */}
      <div className="flex items-center gap-2 px-1 flex-wrap">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mr-2">Suggestions:</span>
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            onClick={() => setQuery(s.text)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-700 dark:hover:text-blue-300 hover:border-blue-200 dark:hover:border-blue-800 transition-colors shadow-sm"
          >
            {s.icon}
            {s.text}
          </button>
        ))}
      </div>
    </div>
  );
};
