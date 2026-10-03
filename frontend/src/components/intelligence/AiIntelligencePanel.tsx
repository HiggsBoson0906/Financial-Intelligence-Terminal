import React from 'react';
import { AiEventImpact } from '../../types';
import { ShieldAlert, AlertTriangle, ChevronRight, Zap, ExternalLink } from 'lucide-react';

interface AiIntelligencePanelProps {
  eventImpact: AiEventImpact;
  onOpenWeatherDetail?: () => void;
  onSelectAsset?: (symbol: string) => void;
}

export const AiIntelligencePanel: React.FC<AiIntelligencePanelProps> = ({
  eventImpact,
  onOpenWeatherDetail,
  onSelectAsset,
}) => {
  return (
    <div className="terminal-card p-4 rounded flex flex-col justify-between h-full select-none border-l-2 border-l-[#00f0ff]">
      {/* Panel Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#1e2333]">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#00f0ff] pulse-dot" />
            <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono-data">
              AI INTELLIGENCE
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[9px] font-mono-data font-bold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            EVENT DETECTED
          </span>
        </div>

        {/* Primary Event Threat Box */}
        <div className="bg-[#101422] p-3 rounded border border-[#1e273c] mb-3">
          <div className="text-[10px] font-mono-data text-[#00f0ff] font-bold tracking-widest uppercase mb-0.5">
            {eventImpact.category}
          </div>
          <div className="text-sm font-bold text-slate-100 font-sans mb-2">
            {eventImpact.title}
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono-data pt-2 border-t border-[#1a2133]">
            <div>
              <span className="text-slate-400 block text-[9px]">IMPACT SECTOR</span>
              <span className="font-bold text-amber-400">{eventImpact.affectedSector}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px]">CONFIDENCE</span>
              <span className="font-bold text-emerald-400">{eventImpact.confidence}%</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px]">EXPECTED DISRUPTION</span>
              <span className="font-bold text-rose-400">{eventImpact.expectedDisruption}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px]">HORIZON</span>
              <span className="font-bold text-slate-200">{eventImpact.horizon}</span>
            </div>
          </div>
        </div>

        {/* Affected Assets List */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-mono-data text-slate-400 mb-2">
            <span>AFFECTED ASSETS</span>
            <span>IMPACT PROBABILITY</span>
          </div>

          <div className="space-y-2">
            {eventImpact.affectedAssets.map((asset) => {
              const isNegative = asset.impactType === 'negative';
              return (
                <div
                  key={asset.symbol}
                  onClick={() => onSelectAsset?.(asset.symbol)}
                  className="bg-[#090b12] hover:bg-[#0f1424] p-2 rounded border border-[#1e2333] hover:border-[#00f0ff]/40 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1 text-xs font-mono-data">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200 group-hover:text-[#00f0ff] transition-colors">
                        {asset.symbol}
                      </span>
                      <span className="text-[10px] text-slate-500 truncate max-w-[110px]">
                        {asset.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">{asset.exposure}</span>
                      <span
                        className={`font-bold ${
                          isNegative ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {asset.probability}%
                      </span>
                    </div>
                  </div>

                  {/* Impact Progress Bar */}
                  <div className="w-full h-1.5 bg-[#141928] rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        isNegative
                          ? 'bg-gradient-to-r from-rose-500 to-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                          : 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                      }`}
                      style={{ width: `${asset.probability}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Weather GIS Detail Trigger */}
      <div className="pt-3 border-t border-[#1e2333] mt-3">
        <button
          onClick={onOpenWeatherDetail}
          className="w-full py-1.5 px-3 rounded bg-[#0f1524] hover:bg-[#141c30] border border-[#1e2942] hover:border-[#00f0ff]/50 text-[#00f0ff] text-xs font-mono-data font-semibold flex items-center justify-between transition-all group"
        >
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#00f0ff]" />
            WEATHER & INFRASTRUCTURE MAP
          </span>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
