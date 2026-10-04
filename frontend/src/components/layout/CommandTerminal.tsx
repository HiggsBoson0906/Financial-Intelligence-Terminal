import React, { useState } from 'react';
import { Terminal, Send, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface CommandTerminalProps {
  onExecuteQuery: (query: string) => void;
  isExecuting: boolean;
  activeStepIndex: number;
}

export const CommandTerminal: React.FC<CommandTerminalProps> = ({
  onExecuteQuery,
  isExecuting,
  activeStepIndex,
}) => {
  const [commandText, setCommandText] = useState('');

  const executionSteps = [
    { label: 'QUERY RECEIVED', agent: 'SYSTEM' },
    { label: 'NEWS AGENT', agent: 'NLP NLP' },
    { label: 'WEATHER AGENT', agent: 'GIS NOAA' },
    { label: 'MACRO AGENT', agent: 'COMMODITIES' },
    { label: 'RISK AGENT', agent: 'QUANT VAR' },
    { label: 'PORTFOLIO AGENT', agent: 'ALLOCATION' },
    { label: 'RESPONSE READY', agent: 'DECISION' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandText.trim()) return;
    onExecuteQuery(commandText);
  };

  return (
    <div className="bg-[#080a10] border-t border-[#1e2333] px-4 py-2.5 z-20 shrink-0">
      {/* Execution Pipeline Visualizer when executing */}
      {isExecuting && (
        <div className="mb-2 p-2 rounded bg-[#0d111d] border border-[#00f0ff]/30 flex items-center justify-between gap-2 overflow-x-auto font-mono-data text-[11px] text-slate-300">
          <div className="flex items-center gap-2 text-cyan-400 font-bold shrink-0">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>RUNNING MULTI-AGENT PIPELINE:</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {executionSteps.map((step, idx) => {
              const isDone = idx < activeStepIndex;
              const isCurrent = idx === activeStepIndex;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] transition-all shrink-0 ${
                    isDone
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : isCurrent
                      ? 'bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff] animate-pulse font-bold'
                      : 'bg-[#121624] text-slate-500 border border-[#1d2334]'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
                  )}
                  <span>{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Terminal Command Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-cyan-400 font-mono-data text-xs font-bold shrink-0">
          <Terminal className="w-4 h-4 text-[#00f0ff]" />
          <span>ASK PILLERSTREET &gt;</span>
        </div>

        <input
          type="text"
          value={commandText}
          onChange={(e) => setCommandText(e.target.value)}
          placeholder="How will a Category 4 hurricane in the Gulf affect my energy holdings?"
          disabled={isExecuting}
          className="flex-1 bg-[#0d101a] text-slate-100 placeholder-slate-500 px-3 py-1.5 rounded border border-[#1e2436] focus:border-[#00f0ff]/50 focus:outline-none focus:ring-1 focus:ring-[#00f0ff]/30 text-xs font-mono-data transition-all"
        />

        <button
          type="submit"
          disabled={isExecuting || !commandText.trim()}
          className="flex items-center gap-1.5 bg-[#00f0ff] hover:bg-[#33f3ff] text-slate-950 font-bold px-3 py-1.5 rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono-data shadow-[0_0_12px_rgba(0,240,255,0.25)]"
        >
          <Send className="w-3.5 h-3.5" />
          <span>EXECUTE</span>
        </button>
      </form>
    </div>
  );
};
