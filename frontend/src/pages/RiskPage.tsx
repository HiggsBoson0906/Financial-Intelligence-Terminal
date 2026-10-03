import React from 'react';
import type { PortfolioMetric } from '../types';
import { ShieldAlert } from 'lucide-react';

interface RiskPageProps {
  metrics: PortfolioMetric;
}

export const RiskPage: React.FC<RiskPageProps> = ({ metrics }) => {
  return (
    <div className="p-4 space-y-4 max-w-[1600px] mx-auto font-mono-data">
      <div className="flex items-center justify-between pb-3 border-b border-[#1e2333]">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          <h1 className="text-base font-bold text-slate-100 uppercase tracking-wider">
            QUANTITATIVE RISK MODEL & MONTE CARLO LAB
          </h1>
        </div>
        <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-bold">
          50,000 SIMULATIONS
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0b0e1a] p-4 rounded border border-[#1e273e]">
          <span className="text-xs text-slate-400 block mb-1">1D 95% Value at Risk (VaR)</span>
          <span className="text-2xl font-bold text-rose-400">{metrics.var95}</span>
          <p className="text-[11px] text-slate-400 font-sans mt-2">
            Maximum expected 1-day portfolio loss at 95% statistical confidence interval.
          </p>
        </div>

        <div className="bg-[#0b0e1a] p-4 rounded border border-[#1e273e]">
          <span className="text-xs text-slate-400 block mb-1">Expected Shortfall (CVaR)</span>
          <span className="text-2xl font-bold text-rose-400">{metrics.expectedShortfall}</span>
          <p className="text-[11px] text-slate-400 font-sans mt-2">
            Average expected loss in tail scenarios exceeding the 95% VaR threshold.
          </p>
        </div>

        <div className="bg-[#0b0e1a] p-4 rounded border border-[#1e273e]">
          <span className="text-xs text-slate-400 block mb-1">Portfolio Beta Sensitivity</span>
          <span className="text-2xl font-bold text-cyan-300">{metrics.beta}</span>
          <p className="text-[11px] text-slate-400 font-sans mt-2">
            Systematic exposure relative to benchmark market indices under hurricane shock.
          </p>
        </div>
      </div>
    </div>
  );
};
