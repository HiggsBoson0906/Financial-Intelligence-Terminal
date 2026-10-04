import React from 'react';
import { QueryResponse } from '../../types/api';

export const RiskView: React.FC<{
  isSimulation: boolean;
  selectedAsset: string | null;
  data?: QueryResponse | null;
}> = ({ isSimulation, data }) => {
  if (!data?.risk) {
    return (
      <div className="w-full h-full p-5 flex flex-col justify-center items-center bg-white dark:bg-[#111827] text-[#64748B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#1F2937] rounded-xl shadow-sm">
        <h3 className="font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-2">RISK ANALYSIS UNAVAILABLE</h3>
        <p className="text-sm">Quantitative risk computation failed or is not available for this query.</p>
      </div>
    );
  }

  const metrics = data.risk.metrics || {};
  const factorContributions = data.risk.factor_contributions || {};
  
  const hasVar = metrics.var_95 !== undefined;
  const hasEs = metrics.expected_shortfall !== undefined;
  const hasExp = metrics.portfolio_exposure !== undefined;
  const hasVol = metrics.volatility !== undefined;
  const rChange = data?.scenario?.portfolio_impact?.total_impact_percent;
  const hasRChange = rChange !== undefined;

  // Synthetic demo portfolio
  const portfolio = [
    { ticker: 'XOM', weight: 0.3 },
    { ticker: 'CVX', weight: 0.2 },
    { ticker: 'COP', weight: 0.2 },
    { ticker: 'OXY', weight: 0.1 },
    { ticker: 'XLE', weight: 0.1 },
    { ticker: 'SPY', weight: 0.1 },
  ];

  return (
    <div className="w-full h-full p-6 flex flex-col animate-in fade-in duration-200 overflow-y-auto custom-scrollbar bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC] font-sans border border-[#E2E8F0] dark:border-[#1F2937] rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#F1F5F9] dark:border-[#1F2937]">
        <div>
          <h2 className="text-[18px] font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-widest uppercase flex items-center gap-2">
            RISK ANALYSIS
          </h2>
          <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-mono-tech mt-1 tracking-widest uppercase">
            Portfolio Risk Exposure
          </p>
        </div>
        {isSimulation && (
          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 px-2 py-0.5 rounded uppercase tracking-wider">
            SIMULATION
          </span>
        )}
      </div>

      {/* Top Metrics */}
      <div className="flex flex-wrap gap-6 mb-8">
        {hasExp && (
          <div className="flex flex-col">
            <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-bold uppercase tracking-widest mb-1">Portfolio Value</span>
            <span className="text-[24px] font-mono-tech text-[#0F172A] dark:text-[#F8FAFC] leading-none">${(metrics.portfolio_exposure / 1000000).toFixed(1)}M</span>
          </div>
        )}
        
        {hasVar && (
          <div className="flex flex-col border-l border-[#E2E8F0] dark:border-[#1F2937] pl-6">
            <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-bold uppercase tracking-widest mb-1">VaR (95%)</span>
            <span className="text-[24px] font-mono-tech text-red-600 dark:text-red-400 leading-none">${(metrics.var_95 / 1000000).toFixed(1)}M</span>
          </div>
        )}

        {hasEs && (
          <div className="flex flex-col border-l border-[#E2E8F0] dark:border-[#1F2937] pl-6">
            <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-bold uppercase tracking-widest mb-1">Expected Shortfall</span>
            <span className="text-[24px] font-mono-tech text-red-600 dark:text-red-400 leading-none">${(metrics.expected_shortfall / 1000000).toFixed(1)}M</span>
          </div>
        )}

        {hasVol && (
          <div className="flex flex-col border-l border-[#E2E8F0] dark:border-[#1F2937] pl-6">
            <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-bold uppercase tracking-widest mb-1">Volatility</span>
            <span className="text-[24px] font-mono-tech text-[#0F172A] dark:text-[#F8FAFC] leading-none">{(metrics.volatility * 100).toFixed(1)}%</span>
          </div>
        )}
        
        {hasRChange && (
          <div className="flex flex-col border-l border-[#E2E8F0] dark:border-[#1F2937] pl-6">
            <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-bold uppercase tracking-widest mb-1">Scenario Impact</span>
            <span className={`text-[24px] font-mono-tech leading-none ${rChange > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
              {rChange > 0 ? '+' : ''}{rChange}%
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Risk By Holding */}
        <div>
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#F1F5F9] dark:border-[#1F2937]">
            <h3 className="text-[12px] font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-widest">RISK BY HOLDING</h3>
          </div>
          
          <div className="space-y-3">
            {portfolio.map((item, idx) => {
              // Try to find if risk engine gave specific asset impact
              const impact = data?.scenario?.asset_impacts?.find((a: any) => a.asset === item.ticker);
              const impactStr = impact?.expected_impact !== undefined ? `${(impact.expected_impact * 100).toFixed(1)}%` : '---';
              const isPositive = impact?.expected_impact > 0;
              
              return (
                <div key={idx} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3 w-1/2">
                    <span className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC] w-10">{item.ticker}</span>
                    <div className="flex-1 h-[4px] bg-[#F1F5F9] dark:bg-[#1E293B] rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${item.weight * 100}%` }} />
                    </div>
                    <span className="text-[11px] font-mono-tech text-[#64748B] dark:text-[#94A3B8] w-8 text-right">{(item.weight * 100)}%</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-[11px] font-mono-tech">
                    <span className="text-[#64748B] dark:text-[#94A3B8]">Risk:</span>
                    <span className={`w-12 text-right font-bold ${impact?.expected_impact !== undefined ? (isPositive ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400') : 'text-[#64748B] dark:text-[#94A3B8]'}`}>
                      {impactStr}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Factor Contributions */}
        {Object.keys(factorContributions).length > 0 && (
          <div>
            <h3 className="text-[12px] font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-widest mb-4 pb-2 border-b border-[#F1F5F9] dark:border-[#1F2937]">Risk Contribution</h3>
            <div className="space-y-4">
              {Object.entries(factorContributions).map(([factor, pct], i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex justify-between text-[11px] font-mono-tech">
                    <span className="text-[#64748B] dark:text-[#94A3B8] uppercase">{factor}</span>
                    <span className="text-[#0F172A] dark:text-[#F8FAFC] font-bold">{(pct as number * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-[4px] bg-[#F1F5F9] dark:bg-[#1E293B] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-red-600 to-amber-500" 
                      style={{ width: `${(pct as number) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
