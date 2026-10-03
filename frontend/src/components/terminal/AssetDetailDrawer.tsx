import React from 'react';
import { X, Activity } from 'lucide-react';
import type { MarketTicker } from '../../types';

interface AssetDetailDrawerProps {
  symbol: string | null;
  onClose: () => void;
  ticker?: MarketTicker;
}

export const AssetDetailDrawer: React.FC<AssetDetailDrawerProps> = ({
  symbol,
  onClose,
  ticker,
}) => {
  if (!symbol) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#090c16] border-l border-[#1e2538] h-full p-4 flex flex-col justify-between shadow-2xl font-mono-data">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1e2333]">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#00f0ff]" />
              <h2 className="text-sm font-bold text-slate-100">{symbol} INSPECTOR</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-100 rounded bg-[#131828] border border-[#1e263d]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="bg-[#0b0e1a] p-3 rounded border border-[#1d263b] mb-4 space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-400">SPOT PRICE</span>
              <span className="text-base font-bold text-slate-100">
                ${ticker ? ticker.value.toFixed(2) : '78.45'}
              </span>
            </div>

            <div className="flex items-baseline justify-between text-xs">
              <span className="text-slate-400">24H CHANGE</span>
              <span className="text-emerald-400 font-bold">+3.77%</span>
            </div>

            <div className="flex items-baseline justify-between text-xs">
              <span className="text-slate-400">PORTFOLIO EXPOSURE</span>
              <span className="text-[#00f0ff] font-bold">$3,840,000</span>
            </div>

            <div className="flex items-baseline justify-between text-xs">
              <span className="text-slate-400">EVENT SENSITIVITY</span>
              <span className="text-rose-400 font-bold">89% (HIGH THREAT)</span>
            </div>
          </div>

          {/* Asset Summary */}
          <div className="bg-[#06080f] p-3 rounded border border-[#161c2d] space-y-2 text-xs">
            <span className="text-[10px] font-bold text-slate-400 block">AI ANALYST SUMMARY</span>
            <p className="text-slate-300 font-sans leading-relaxed text-[11px]">
              {symbol} exhibits extreme sensitivity to the ongoing Gulf of Mexico Category 4 storm.
              Offshore production idling reduces refined throughput by estimated 180K bpd.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]/40 rounded font-bold text-xs hover:bg-[#00f0ff]/25 transition-colors"
        >
          CLOSE INSPECTOR
        </button>
      </div>
    </div>
  );
};
