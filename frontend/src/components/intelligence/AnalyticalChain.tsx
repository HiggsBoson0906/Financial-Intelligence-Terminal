import React from 'react';
import { ArrowRight, TrendingUp } from 'lucide-react';

interface AnalyticalChainProps {
  onSelectNode?: (nodeName: string) => void;
}

export const AnalyticalChain: React.FC<AnalyticalChainProps> = ({ onSelectNode }) => {
  return (
    <div className="mt-4 pt-3 border-t border-[#F1F5F9] select-none">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-0 divide-y md:divide-y-0 md:divide-x divide-[#F1F5F9] items-stretch relative border border-[#F1F5F9] rounded-xl overflow-hidden">
        {/* Node 1: EVENT */}
        <div
          onClick={() => onSelectNode?.('EVENT')}
          className="p-4 hover:bg-[#F8FAFC] transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="text-[14px] font-semibold text-[#0F172A] mb-1.5">
              Event
            </div>
            {/* Hurricane radar graphic */}
            <div className="w-full h-14 rounded bg-[#0F172A] relative overflow-hidden flex items-center justify-center mb-1.5">
              {/* Spiral radar simulation */}
              <div className="w-12 h-12 rounded-full border border-red-500/40 animate-ping absolute" />
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" style={{ animationDuration: '8s' }}>
                <path d="M12 6a6 6 0 0 1 5.66 4M12 18a6 6 0 0 1-5.66-4M6.34 10A6 6 0 0 1 12 6M17.66 14A6 6 0 0 1 12 18" />
                <circle cx="12" cy="12" r="2" fill="#F43F5E" />
              </svg>
            </div>
            <div className="font-bold text-xs text-[#0F172A] leading-tight">
              Gulf Hurricane
            </div>
            <div className="text-[11px] text-[#475569]">Category 4</div>
          </div>

          <div className="mt-2 pt-1 border-t border-[#F1F5F9] flex items-center justify-between">
            <span className="text-[9px] font-bold text-[#DC2626] bg-[#FEE2E2] px-1.5 py-0.5 rounded uppercase">
              Observed
            </span>
            <span className="text-[9px] text-[#94A3B8] font-plex-mono">12:41 UTC</span>
          </div>
        </div>

        {/* Node 2: REGION / INDUSTRY */}
        <div
          onClick={() => onSelectNode?.('REGION')}
          className="p-4 hover:bg-[#F8FAFC] transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="text-[14px] font-semibold text-[#0F172A] mb-1.5">
              Region / Industry
            </div>
            {/* Refinery Complex Graphic */}
            <div className="w-full h-14 rounded bg-gradient-to-br from-[#1E293B] to-[#334155] relative overflow-hidden flex items-end justify-center p-1 mb-1.5">
              {/* Silhouette of refinery towers */}
              <div className="flex items-end gap-1 opacity-80">
                <div className="w-2 h-8 bg-amber-400/80 rounded-t-xs" />
                <div className="w-3 h-10 bg-amber-500 rounded-t-xs" />
                <div className="w-1.5 h-6 bg-slate-300 rounded-t-xs" />
                <div className="w-4 h-11 bg-amber-400 rounded-t-xs" />
                <div className="w-2 h-7 bg-amber-600 rounded-t-xs" />
              </div>
            </div>
            <div className="font-bold text-xs text-[#0F172A] leading-tight">
              Gulf Energy Infrastructure
            </div>
            <div className="text-[10px] text-[#DC2626] font-semibold mt-0.5">
              High Disruption Risk
            </div>
          </div>

          <div className="mt-2 pt-1 border-t border-[#F1F5F9] flex gap-1 flex-wrap text-[9px] text-[#64748B]">
            <span className="bg-[#F1F5F9] px-1 py-0.5 rounded">Refineries</span>
            <span className="bg-[#F1F5F9] px-1 py-0.5 rounded">Ports</span>
            <span className="bg-[#F1F5F9] px-1 py-0.5 rounded">Pipelines</span>
          </div>
        </div>

        {/* Node 3: KEY ASSETS */}
        <div
          onClick={() => onSelectNode?.('ASSETS')}
          className="p-4 hover:bg-[#F8FAFC] transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="text-[14px] font-semibold text-[#0F172A] mb-1.5">
              Key Assets
            </div>
            <div className="space-y-1.5 tabular-data text-[12px]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 font-bold text-[#0F172A]">
                  <span className="w-2 h-2 rounded-full bg-red-600 inline-block" /> XOM
                </span>
                <span className="text-[#16A34A] font-semibold">+1.9%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 font-bold text-[#0F172A]">
                  <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" /> CVX
                </span>
                <span className="text-[#16A34A] font-semibold">+2.4%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 font-bold text-[#0F172A]">
                  <span className="w-2 h-2 rounded-full bg-amber-600 inline-block" /> COP
                </span>
                <span className="text-[#16A34A] font-semibold">+2.1%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 font-bold text-[#0F172A]">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> WTI
                </span>
                <span className="text-[#16A34A] font-semibold">+2.8%</span>
              </div>
            </div>
          </div>

          <div className="mt-2 pt-1 border-t border-[#F1F5F9] text-[9px] text-[#64748B]">
            Supply Tightening
          </div>
        </div>

        {/* Node 4: PORTFOLIO */}
        <div
          onClick={() => onSelectNode?.('PORTFOLIO')}
          className="p-4 hover:bg-[#F8FAFC] transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="text-[14px] font-semibold text-[#0F172A] mb-1.5">
              Portfolio
            </div>
            {/* Donut chart simulation */}
            <div className="flex items-center gap-2 my-1">
              <svg width="40" height="40" viewBox="0 0 36 36" className="shrink-0 -rotate-90">
                {/* Background circle */}
                <circle cx="18" cy="18" r="14" fill="none" stroke="#E2E8F0" strokeWidth="4" />
                {/* Energy 43% */}
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#F43F5E"
                  strokeWidth="4"
                  strokeDasharray="38 100"
                  strokeDashoffset="0"
                />
                {/* Tech 28% */}
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="4"
                  strokeDasharray="25 100"
                  strokeDashoffset="-38"
                />
                {/* Finance 15% */}
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="4"
                  strokeDasharray="13 100"
                  strokeDashoffset="-63"
                />
              </svg>

              <div className="leading-tight">
                <div className="text-[11px] font-bold text-[#0F172A]">Energy</div>
                <div className="text-[15px] font-semibold text-[#F43F5E] tabular-data">43%</div>
                <div className="text-[9px] text-[#94A3B8]">Your Portfolio</div>
              </div>
            </div>

            {/* Micro legend */}
            <div className="space-y-0.5 text-[9px] font-plex-mono text-[#64748B]">
              <div className="flex justify-between">
                <span>■ Energy</span>
                <span className="font-semibold text-[#0F172A]">43%</span>
              </div>
              <div className="flex justify-between">
                <span>■ Tech</span>
                <span className="font-semibold text-[#0F172A]">28%</span>
              </div>
              <div className="flex justify-between">
                <span>■ Finance</span>
                <span className="font-semibold text-[#0F172A]">15%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Node 5: QUANT RISK */}
        <div
          onClick={() => onSelectNode?.('RISK')}
          className="p-4 hover:bg-[#F8FAFC] transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="text-[14px] font-semibold text-[#0F172A] mb-1.5">
              Quant Risk
            </div>
            
            <div className="mb-2">
              <span className="text-[9px] text-[#64748B] block">VaR (95%)</span>
              <div className="flex items-baseline gap-1">
                <span className="tabular-data font-semibold text-[15px] text-[#0F172A]">$184K</span>
                <span className="text-[12px] font-medium text-[#DC2626] tabular-data">+14.2%</span>
              </div>
            </div>

            <div>
              <span className="text-[9px] text-[#64748B] block">Expected Shortfall</span>
              <div className="flex items-baseline gap-1">
                <span className="font-plex-mono font-bold text-xs text-[#0F172A]">$241K</span>
                <span className="text-[10px] font-bold text-[#DC2626] font-plex-mono">+18.7%</span>
              </div>
            </div>
          </div>

          <div className="mt-2 pt-1 border-t border-[#F1F5F9]">
            <span className="text-[9px] font-bold text-[#D97706] bg-[#FEF3C7] px-1.5 py-0.5 rounded uppercase">
              Model
            </span>
          </div>
        </div>

        {/* Node 6: STRATEGY */}
        <div
          onClick={() => onSelectNode?.('STRATEGY')}
          className="p-4 hover:bg-[#F8FAFC] transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="text-[14px] font-semibold text-[#0F172A] mb-1.5">
              Strategy
            </div>
            
            {/* Sparkline curve upward */}
            <div className="w-full h-8 flex items-center mb-1">
              <svg width="100%" height="24" viewBox="0 0 80 24" fill="none">
                <path d="M 0,20 Q 20,18 40,10 T 80,4" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" />
                <circle cx="80" cy="4" r="2.5" fill="#16A34A" />
              </svg>
            </div>

            <div className="font-bold text-xs text-[#0F172A] leading-tight">
              Simulated Hedge
            </div>
            <div className="font-plex-mono font-extrabold text-sm text-[#16A34A] mt-0.5">
              -7.4%
            </div>
          </div>

          <div className="mt-2 pt-1 border-t border-[#F1F5F9]">
            <span className="text-[9px] font-bold text-[#16A34A] bg-[#DCFCE7] px-1.5 py-0.5 rounded uppercase">
              Simulation
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
