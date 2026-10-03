import React from 'react';
import type { MarketTicker } from '../types';
import { TrendingUp } from 'lucide-react';

interface MarketsPageProps {
  tickers: MarketTicker[];
  onSelectAsset: (symbol: string) => void;
}

export const MarketsPage: React.FC<MarketsPageProps> = ({ tickers, onSelectAsset }) => {
  return (
    <div className="p-4 space-y-4 max-w-[1600px] mx-auto font-mono-data">
      <div className="flex items-center justify-between pb-3 border-b border-[#1e2333]">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#00f0ff]" />
          <h1 className="text-base font-bold text-slate-100 uppercase tracking-wider">
            GLOBAL MARKETS & MULTI-ASSET MONITOR
          </h1>
        </div>
        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
          REAL-TIME STREAMING
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Ticker Table */}
        <div className="lg:col-span-2 terminal-card p-4 rounded">
          <div className="text-xs font-bold text-slate-200 mb-3 pb-2 border-b border-[#1b2132]">
            BENCHMARK TICKERS & DERIVATIVES
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[10px] text-slate-500 border-b border-[#1a2032]">
                  <th className="pb-2">SYMBOL</th>
                  <th className="pb-2">NAME</th>
                  <th className="pb-2">PRICE</th>
                  <th className="pb-2">24H CHANGE</th>
                  <th className="pb-2">HIGH / LOW</th>
                  <th className="pb-2 text-right">VOLUME</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#171c2d]">
                {tickers.map((t) => (
                  <tr
                    key={t.symbol}
                    onClick={() => onSelectAsset(t.symbol)}
                    className="hover:bg-[#0f1424] cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 font-bold text-slate-100 hover:text-[#00f0ff]">{t.symbol}</td>
                    <td className="py-2.5 text-slate-400 text-[11px] font-sans">{t.name}</td>
                    <td className="py-2.5 font-bold text-slate-200">${t.value.toFixed(2)}</td>
                    <td className={`py-2.5 font-bold ${t.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {t.change >= 0 ? '+' : ''}{t.changePercent.toFixed(2)}%
                    </td>
                    <td className="py-2.5 text-slate-400 text-[10px]">
                      {t.low} - {t.high}
                    </td>
                    <td className="py-2.5 text-right text-slate-300">{t.volume}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Depth & Liquidity Simulator */}
        <div className="terminal-card p-4 rounded flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-slate-200 mb-3 pb-2 border-b border-[#1b2132] flex items-center justify-between">
              <span>ORDER BOOK DEPTH (NG=F)</span>
              <span className="text-emerald-400 text-[10px]">SPREAD: $0.002</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="text-[10px] text-rose-400 font-bold">ASKS (SELL ORDERS)</div>
              <div className="space-y-1">
                <div className="flex justify-between bg-rose-500/10 p-1 rounded text-rose-300">
                  <span>$2.845</span>
                  <span>14,200 LOTS</span>
                </div>
                <div className="flex justify-between bg-rose-500/10 p-1 rounded text-rose-300">
                  <span>$2.842</span>
                  <span>8,400 LOTS</span>
                </div>
              </div>

              <div className="my-2 py-1 text-center font-bold text-[#00f0ff] bg-[#101628] rounded border border-[#00f0ff]/30">
                LAST MATCH: $2.840
              </div>

              <div className="text-[10px] text-emerald-400 font-bold">BIDS (BUY ORDERS)</div>
              <div className="space-y-1">
                <div className="flex justify-between bg-emerald-500/10 p-1 rounded text-emerald-300">
                  <span>$2.838</span>
                  <span>19,500 LOTS</span>
                </div>
                <div className="flex justify-between bg-emerald-500/10 p-1 rounded text-emerald-300">
                  <span>$2.835</span>
                  <span>32,100 LOTS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
