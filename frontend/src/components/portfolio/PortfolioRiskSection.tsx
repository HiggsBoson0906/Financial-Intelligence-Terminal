import React from 'react';
import type { PortfolioMetric, SectorExposure, RiskHeatmapItem } from '../../types';
import { Shield, PieChart, Flame } from 'lucide-react';

interface PortfolioRiskSectionProps {
  metrics: PortfolioMetric;
  sectors: SectorExposure[];
  heatmap: RiskHeatmapItem[];
  onSelectAsset?: (symbol: string) => void;
}

export const PortfolioRiskSection: React.FC<PortfolioRiskSectionProps> = ({
  metrics,
  sectors,
  heatmap,
  onSelectAsset,
}) => {
  const getRiskBadge = (level: RiskHeatmapItem['riskLevel']) => {
    switch (level) {
      case 'EXTREME':
        return <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold border border-rose-500/40 text-[9px] font-mono-data">EXTREME</span>;
      case 'HIGH':
        return <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/40 text-[9px] font-mono-data">HIGH</span>;
      case 'MED':
        return <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 text-[9px] font-mono-data">MED</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px] font-mono-data">LOW</span>;
    }
  };

  return (
    <div className="terminal-card p-4 rounded select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-3 mb-4 border-b border-[#1e2333]">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#00f0ff]" />
            <h2 className="text-xs font-bold text-slate-100 tracking-wider uppercase font-mono-data">
              PORTFOLIO RISK & TAIL EXPOSURE
            </h2>
            <span className="px-2 py-0.5 rounded bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 text-[9px] font-mono-data">
              MONTE CARLO 95% VAR
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Quantitative factor breakdown, sector weight limits, and stress sensitivity matrix
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono-data">
          <span className="text-slate-400">DAILY P&amp;L:</span>
          <span className="font-bold text-emerald-400">{metrics.dailyPnL} ({metrics.dailyPnLPercent}%)</span>
        </div>
      </div>

      {/* Metric Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 mb-4 font-mono-data">
        <div className="bg-[#090b12] p-2.5 rounded border border-[#1e2333]">
          <span className="text-[9px] text-slate-400 block">TOTAL EXPOSURE</span>
          <span className="text-sm font-bold text-slate-100">{metrics.totalExposure}</span>
        </div>

        <div className="bg-[#090b12] p-2.5 rounded border border-[#1e2333]">
          <span className="text-[9px] text-slate-400 block">1D 95% VaR</span>
          <span className="text-sm font-bold text-rose-400">{metrics.var95}</span>
        </div>

        <div className="bg-[#090b12] p-2.5 rounded border border-[#1e2333]">
          <span className="text-[9px] text-slate-400 block">EXPECTED SHORTFALL</span>
          <span className="text-sm font-bold text-rose-400">{metrics.expectedShortfall}</span>
        </div>

        <div className="bg-[#090b12] p-2.5 rounded border border-[#1e2333]">
          <span className="text-[9px] text-slate-400 block">PORTFOLIO BETA</span>
          <span className="text-sm font-bold text-cyan-300">{metrics.beta}</span>
        </div>

        <div className="bg-[#090b12] p-2.5 rounded border border-[#1e2333]">
          <span className="text-[9px] text-slate-400 block">ANNUAL VOLATILITY</span>
          <span className="text-sm font-bold text-slate-200">{metrics.volatility}</span>
        </div>

        <div className="bg-[#090b12] p-2.5 rounded border border-[#1e2333]">
          <span className="text-[9px] text-slate-400 block">SHARPE RATIO</span>
          <span className="text-sm font-bold text-emerald-400">{metrics.sharpeRatio}</span>
        </div>
      </div>

      {/* Main Grid: Sector Breakdown + Risk Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sector Exposure Progress Bars */}
        <div className="bg-[#090b12] p-3 rounded border border-[#1e2333]">
          <div className="flex items-center justify-between text-xs font-mono-data font-bold text-slate-200 mb-3 pb-2 border-b border-[#1b2132]">
            <span className="flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-cyan-400" />
              SECTOR EXPOSURE WEIGHTS
            </span>
            <span className="text-[10px] text-slate-400">100% ALLOCATED</span>
          </div>

          <div className="space-y-3 font-mono-data">
            {sectors.map((sec) => (
              <div key={sec.sector} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">{sec.sector}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[10px]">{sec.value}</span>
                    <span className="font-bold text-[#00f0ff]">{sec.percentage}%</span>
                  </div>
                </div>

                <div className="w-full h-2 bg-[#131726] rounded-full overflow-hidden flex">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      sec.riskScore === 'CRITICAL'
                        ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                        : sec.riskScore === 'HIGH'
                        ? 'bg-amber-500'
                        : sec.riskScore === 'MEDIUM'
                        ? 'bg-cyan-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${sec.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Heatmap Table */}
        <div className="lg:col-span-2 bg-[#090b12] p-3 rounded border border-[#1e2333]">
          <div className="flex items-center justify-between text-xs font-mono-data font-bold text-slate-200 mb-3 pb-2 border-b border-[#1b2132]">
            <span className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              RISK HEATMAP & EVENT SENSITIVITY MATRIX
            </span>
            <span className="text-[10px] text-slate-400">ORDERED BY EVENT RISK</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono-data text-xs">
              <thead>
                <tr className="text-[10px] text-slate-500 border-b border-[#1a2032]">
                  <th className="pb-1.5 font-bold">ASSET</th>
                  <th className="pb-1.5 font-bold">EXPOSURE</th>
                  <th className="pb-1.5 font-bold">1D VaR CONTRIB</th>
                  <th className="pb-1.5 font-bold">EVENT SENSITIVITY</th>
                  <th className="pb-1.5 font-bold text-right">RISK LEVEL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#171c2d]">
                {heatmap.map((item) => (
                  <tr
                    key={item.symbol}
                    onClick={() => onSelectAsset?.(item.symbol)}
                    className="hover:bg-[#0f1424] transition-colors cursor-pointer"
                  >
                    <td className="py-2">
                      <div className="font-bold text-slate-200 hover:text-[#00f0ff]">{item.symbol}</div>
                      <div className="text-[9px] text-slate-500 truncate max-w-[100px]">{item.name}</div>
                    </td>
                    <td className="py-2 text-slate-300">{item.exposure}</td>
                    <td className="py-2 text-rose-400 font-semibold">{item.varContribution}</td>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-[#141928] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.eventSensitivity > 80
                                ? 'bg-rose-500'
                                : item.eventSensitivity > 50
                                ? 'bg-amber-400'
                                : 'bg-emerald-400'
                            }`}
                            style={{ width: `${item.eventSensitivity}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400">{item.eventSensitivity}%</span>
                      </div>
                    </td>
                    <td className="py-2 text-right">{getRiskBadge(item.riskLevel)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
