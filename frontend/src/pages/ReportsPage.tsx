import React from 'react';
import { FileText, Download, CheckCircle2, ShieldCheck } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  return (
    <div className="p-4 space-y-4 max-w-[1600px] mx-auto font-mono-data">
      <div className="flex items-center justify-between pb-3 border-b border-[#1e2333]">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#00f0ff]" />
          <h1 className="text-base font-bold text-slate-100 uppercase tracking-wider">
            AUTOMATED QUANTITATIVE INTELLIGENCE REPORTS
          </h1>
        </div>

        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]/40 text-xs font-bold hover:bg-[#00f0ff]/25 transition-colors">
          <Download className="w-4 h-4" />
          <span>EXPORT EXECUTIVE PDF</span>
        </button>
      </div>

      <div className="terminal-card p-6 rounded space-y-4 max-w-4xl mx-auto border-t-2 border-t-[#00f0ff]">
        <div className="flex items-center justify-between pb-3 border-b border-[#1e2333]">
          <div>
            <div className="text-[10px] text-[#00f0ff] font-bold tracking-widest uppercase">
              CONFIDENTIAL • QUANTITATIVE INTELLIGENCE MEMO
            </div>
            <h2 className="text-lg font-bold text-slate-100 font-sans mt-0.5">
              GULF HURRICANE AURELIA RISK & DERIVATIVES HEDGE BRIEFING
            </h2>
            <div className="text-xs text-slate-400 mt-1">
              GENERATED AT: 2026-10-03 09:42:15 UTC • MODEL VERSION: FIT-V2.4
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              VERIFIED AUDITABLE
            </span>
          </div>
        </div>

        <div className="space-y-3 font-sans text-xs text-slate-300 leading-relaxed">
          <h3 className="text-xs font-bold text-slate-100 font-mono uppercase tracking-wider">
            1. EXECUTIVE SUMMARY
          </h3>
          <p>
            Category 4 Hurricane Aurelia presents immediate threat to Gulf Coast refining hubs, with 1.8M bpd active crude refining capacity idled. Multi-agent model recommends liquidating $4.2M long exposure in Gulf refiners (XOM, CVX, MPC) and initiating zero-cost collar hedge via Natural Gas October Futures (NG=F).
          </p>

          <h3 className="text-xs font-bold text-slate-100 font-mono uppercase tracking-wider pt-2">
            2. MULTI-SOURCE EVIDENCE CONVERGENCE
          </h3>
          <ul className="space-y-1.5 font-mono text-[11px] text-slate-300">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>NOAA Satellite Trajectory: 87% trajectory convergence on Sabine Pass LNG and Port Arthur refiners.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Vector Database Match: 94% pattern correlation with Hurricane Katrina (2005) price movement vectors.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Real-Time Wire NLP: Sentiment score -0.74 (Strongly Bearish Refiners) across 142 aggregated feeds.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
