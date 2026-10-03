import React, { useState } from 'react';
import { Search, ChevronDown, ArrowRight, Command, FileText, ChevronRight } from 'lucide-react';

interface QueryBarProps {
  onRunAnalysis: (query: string) => void;
  isLoading?: boolean;
}

export const QueryBar: React.FC<QueryBarProps> = ({ onRunAnalysis, isLoading }) => {
  const [query, setQuery] = useState(
    'How will a Category 4 hurricane in the Gulf affect my energy holdings?'
  );
  const [showQuickQueries, setShowQuickQueries] = useState(false);

  const quickQueries = [
    "What is driving today's market?",
    "What changed in my portfolio?",
    "Show events affecting my portfolio",
    "Simulate a 20% energy hedge",
  ];

  const handleRun = (selectedQuery?: string) => {
    const q = selectedQuery || query;
    if (q.trim()) {
      setQuery(q);
      setShowQuickQueries(false);
      onRunAnalysis(q);
    }
  };

  return (
    <div className="relative z-30">
      <div className="bg-white border border-[#F1F5F9] rounded-xl px-5 py-3 shadow-sm flex items-center justify-between gap-4">
        {/* Left: Search Icon + Ask FIT dropdown */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Search className="w-4 h-4 text-[#2563EB]" />
          <button 
            onClick={() => setShowQuickQueries(!showQuickQueries)}
            className="flex items-center gap-1.5 text-[14px] font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors pr-4 border-r border-[#F1F5F9]"
          >
            <span>Ask FIT</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#2563EB]" />
          </button>
        </div>

        {/* Center: Search input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleRun()}
          placeholder="Ask FIT about market events, portfolio risk, or hedging..."
          className="flex-1 bg-transparent text-[14px] text-[#0F172A] placeholder-[#94A3B8] font-normal focus:outline-none"
        />

        {/* Right: Run Analysis Button & Shortcut */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => handleRun()}
            disabled={isLoading}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-medium px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm disabled:opacity-60"
          >
            <span>{isLoading ? 'Analyzing...' : 'Run Analysis'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button 
            onClick={() => setShowQuickQueries(!showQuickQueries)}
            className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] font-mono-tech text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
            title="Quick queries"
          >
            <Command className="w-3 h-3" />
            <span>K</span>
          </button>
        </div>
      </div>

      {/* Floating Quick Queries Popover */}
      {showQuickQueries && (
        <div className="absolute top-14 right-0 w-72 bg-white border border-[#E2E8F0] rounded-xl shadow-lg p-2.5 text-xs select-none">
          <div className="text-[11px] font-medium text-[#64748B] uppercase tracking-wider px-2 py-1 mb-1">
            Quick Queries
          </div>
          <div className="space-y-0.5">
            {quickQueries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleRun(q)}
                className="w-full flex items-center justify-between p-2 rounded-lg text-left text-[#334155] hover:text-[#2563EB] hover:bg-[#F8FAFC] transition-colors group"
              >
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#2563EB] shrink-0" />
                  <span className="truncate text-xs">{q}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#CBD5E1] group-hover:text-[#2563EB] shrink-0 ml-1" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
