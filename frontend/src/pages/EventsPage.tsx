import React from 'react';
import { mockHistoricalEvents } from '../data/mockEvents';
import { History, Sparkles } from 'lucide-react';

export const EventsPage: React.FC = () => {
  return (
    <div className="p-4 space-y-4 max-w-[1600px] mx-auto font-mono-data">
      <div className="flex items-center justify-between pb-3 border-b border-[#1e2333]">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-[#00f0ff]" />
          <h1 className="text-base font-bold text-slate-100 uppercase tracking-wider">
            HISTORICAL SHOCK EVENT MATCHING ENGINE
          </h1>
        </div>
        <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-[#00f0ff] border border-cyan-500/30 text-xs font-bold flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> VECTOR SIMILARITY SEARCH
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mockHistoricalEvents.map((event) => (
          <div key={event.id} className="terminal-card p-4 rounded flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>{event.date}</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  {event.similarityScore}% MATCH SCORE
                </span>
              </div>

              <h2 className="text-sm font-bold text-slate-100 font-sans mb-1">{event.name}</h2>
              <div className="text-[10px] text-cyan-400 font-bold mb-2">{event.category}</div>

              <p className="text-xs text-slate-300 font-sans leading-relaxed mb-3">
                {event.description}
              </p>

              <div className="bg-[#090b12] p-2.5 rounded border border-[#1a2133] space-y-1.5 text-xs mb-3">
                <span className="text-[10px] text-slate-500 font-bold block">REFINING CAPACITY DISRUPTION</span>
                <span className="text-rose-400 font-bold">{event.refiningDisruption}</span>
              </div>

              <div className="bg-[#090b12] p-2.5 rounded border border-[#1a2133] space-y-1 text-[11px]">
                <span className="text-[10px] text-slate-500 font-bold block">HISTORICAL ASSET REACTIONS</span>
                <div className="flex justify-between">
                  <span className="text-slate-400">CRUDE OIL:</span>
                  <span className="font-bold text-emerald-400">{event.priceReaction.crude}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">NATURAL GAS:</span>
                  <span className="font-bold text-emerald-400">{event.priceReaction.natgas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">REFINERIES:</span>
                  <span className="font-bold text-rose-400">{event.priceReaction.refiners}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
