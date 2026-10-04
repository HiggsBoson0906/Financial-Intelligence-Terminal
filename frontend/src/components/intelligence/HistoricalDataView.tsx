import React, { useState } from 'react';
import { Database, Info, Layers, BarChart3, ChevronRight } from 'lucide-react';
import { 
  HISTORICAL_EVENTS, 
  ASSET_HISTORICAL_BEHAVIOR, 
  DATASET_METADATA 
} from '../../data/historicalEventsData';

interface HistoricalDataViewProps {
  onNavigateToFullPage?: () => void;
  selectedAsset?: string | null;
  onSelectAsset?: (asset: string) => void;
}

export const HistoricalDataView: React.FC<HistoricalDataViewProps> = ({
  onNavigateToFullPage,
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>(HISTORICAL_EVENTS[0].id);

  const selectedEvent = HISTORICAL_EVENTS.find(e => e.id === selectedEventId) || HISTORICAL_EVENTS[0];

  const formatReturn = (val: number) => {
    const sign = val > 0 ? '+' : '';
    return `${sign}${val.toFixed(2)}%`;
  };

  const getReturnClass = (val: number) => {
    if (val > 0.05) return 'text-emerald-600 dark:text-emerald-400';
    if (val < -0.05) return 'text-rose-600 dark:text-rose-400';
    return 'text-slate-500 dark:text-slate-400';
  };

  return (
    <div className="w-full h-full p-5 flex flex-col animate-in fade-in duration-200 bg-white dark:bg-[#111827] rounded-xl border border-[#E2E8F0] dark:border-[#1F2937] text-[#0F172A] dark:text-[#F8FAFC] font-sans overflow-hidden shadow-sm">
      
      {/* Sub-header */}
      <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-[#F1F5F9] dark:border-[#1F2937] gap-2">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-[15px] font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wider">
            HISTORICAL DATA (5D REACTION BENCHMARKS)
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 border border-[#E2E8F0] dark:border-[#1F2937] bg-[#F8FAFC] dark:bg-[#1E293B] px-2 py-0.5 rounded uppercase tracking-wider">
            STATIC HISTORICAL REFERENCE
          </span>
          {onNavigateToFullPage && (
            <button
              onClick={onNavigateToFullPage}
              className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-0.5"
            >
              Full View <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 flex-1 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: EVENT SELECTOR & OBSERVATION */}
        <div className="col-span-1 md:col-span-5 flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1">
          <div className="text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest">
            HISTORICAL EPISODES
          </div>

          <div className="space-y-2">
            {HISTORICAL_EVENTS.slice(0, 4).map(evt => {
              const isSelected = evt.id === selectedEventId;
              return (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEventId(evt.id)}
                  className={`cursor-pointer p-3 rounded-lg border transition-all text-[12px] ${
                    isSelected 
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500/50 shadow-xs' 
                      : 'bg-[#F8FAFC] dark:bg-[#161F30] border-[#E2E8F0] dark:border-[#1F2937] hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">{evt.eventName}</span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{evt.year}</span>
                  </div>
                  <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5 truncate">
                    {evt.category} • {evt.region}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stored Observation */}
          <div className="mt-auto p-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-[11px]">
            <div className="font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider text-[9px] mb-1 flex items-center gap-1">
              <Info className="w-3 h-3" />
              HISTORICAL OBSERVATION
            </div>
            <p className="text-amber-900/90 dark:text-amber-200/90 leading-tight">
              "{selectedEvent.observation}"
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: 5D ASSET REACTION BARS */}
        <div className="col-span-1 md:col-span-7 flex flex-col justify-between overflow-y-auto custom-scrollbar">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest flex items-center gap-1">
                <BarChart3 className="w-3.5 h-3.5" />
                5D ASSET REACTION ({selectedEvent.eventName})
              </span>
              <span className="text-[10px] text-slate-400 font-mono-tech">
                {DATASET_METADATA.dateRange}
              </span>
            </div>

            <div className="space-y-2 bg-[#F8FAFC] dark:bg-[#161F30] border border-[#E2E8F0] dark:border-[#1F2937] rounded-lg p-3">
              {[
                { symbol: 'XOM', name: 'ExxonMobil', ret: selectedEvent.returns5d.XOM },
                { symbol: 'CVX', name: 'Chevron', ret: selectedEvent.returns5d.CVX },
                { symbol: 'COP', name: 'ConocoPhillips', ret: selectedEvent.returns5d.COP },
                { symbol: 'OXY', name: 'Occidental', ret: selectedEvent.returns5d.OXY },
                { symbol: 'XLE', name: 'Energy ETF', ret: selectedEvent.returns5d.XLE },
                { symbol: 'SPY', name: 'S&P 500 ETF', ret: selectedEvent.returns5d.SPY },
              ].map(item => {
                const isPos = item.ret >= 0;
                const widthPct = Math.min(Math.abs(item.ret) * 9, 100);
                return (
                  <div key={item.symbol} className="flex items-center text-[11px]">
                    <div className="w-12 font-bold font-mono-tech text-[#0F172A] dark:text-slate-200">
                      {item.symbol}
                    </div>
                    <div className="flex-1 h-3.5 bg-slate-200/70 dark:bg-slate-800 rounded mx-2 overflow-hidden flex items-center">
                      <div 
                        style={{ width: `${widthPct}%` }}
                        className={`h-full rounded transition-all duration-300 ${
                          isPos ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-rose-500 dark:bg-rose-400'
                        }`}
                      />
                    </div>
                    <div className={`w-14 text-right font-mono-tech font-bold ${getReturnClass(item.ret)}`}>
                      {formatReturn(item.ret)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Asset Benchmark Averages */}
          <div className="mt-3 pt-2 border-t border-[#E2E8F0] dark:border-[#1F2937]">
            <div className="text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-1 flex items-center gap-1">
              <Layers className="w-3 h-3" />
              HISTORICAL DATASET VOLATILITY (291 EVENTS)
            </div>
            <div className="grid grid-cols-3 gap-2 text-[10px] font-mono-tech">
              <div className="bg-white dark:bg-slate-800 p-1.5 rounded border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400">XOM Vol: </span>
                <span className="font-bold text-slate-700 dark:text-slate-200">3.52%</span>
              </div>
              <div className="bg-white dark:bg-slate-800 p-1.5 rounded border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400">CVX Vol: </span>
                <span className="font-bold text-slate-700 dark:text-slate-200">3.40%</span>
              </div>
              <div className="bg-white dark:bg-slate-800 p-1.5 rounded border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400">SPY Vol: </span>
                <span className="font-bold text-slate-700 dark:text-slate-200">2.19%</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
