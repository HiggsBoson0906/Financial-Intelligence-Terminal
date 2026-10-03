import React from 'react';
import { mockRiskData } from '../../data/mockEventImpactData';

export const RiskView: React.FC<{
  isSimulation: boolean;
  selectedAsset: string | null;
}> = ({ isSimulation, selectedAsset }) => {
  return (
    <div className="w-full h-full p-5 flex flex-col animate-in fade-in duration-200 overflow-y-auto custom-scrollbar bg-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[16px] font-semibold text-[#0F172A]">Risk Snapshot</h3>
        {isSimulation && (
          <span className="text-[10px] font-bold text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded uppercase tracking-wider">
            SIMULATION
          </span>
        )}
      </div>

      {/* 1. Risk Snapshot - Minimal horizontal metrics */}
      <div className="flex items-baseline justify-between mb-8 pb-5 border-b border-gray-100 group/snapshot relative">
        {/* Tooltip trigger area */}
        <div className="absolute inset-0 z-10" title="Risk increased primarily due to simulated event exposure." />
        
        <div className="flex flex-col relative z-0">
          <div className="text-[28px] font-bold text-red-600 tabular-nums leading-none tracking-tight mb-1">
            {mockRiskData.riskChange}
          </div>
          <div className="text-[11px] text-gray-500 font-medium">Risk Change</div>
        </div>

        <div className="h-10 w-px bg-gray-100"></div>

        <div className="flex flex-col relative z-0">
          <div className="text-[20px] font-bold text-[#0F172A] tabular-nums leading-none tracking-tight mb-1">
            {mockRiskData.var95}
          </div>
          <div className="text-[11px] text-gray-500 font-medium">VaR (95%)</div>
        </div>

        <div className="flex flex-col relative z-0">
          <div className="text-[20px] font-bold text-[#0F172A] tabular-nums leading-none tracking-tight mb-1">
            {mockRiskData.expectedShortfall}
          </div>
          <div className="text-[11px] text-gray-500 font-medium">Expected Shortfall</div>
        </div>

        <div className="h-10 w-px bg-gray-100"></div>

        <div className="flex flex-col relative z-0">
          <div className="text-[18px] font-bold text-[#0F172A] tabular-nums leading-none tracking-tight mb-1">
            {mockRiskData.exposure}
          </div>
          <div className="text-[11px] text-gray-500 font-medium">Portfolio Exposure</div>
        </div>

        <div className="flex flex-col relative z-0">
          <div className="text-[18px] font-bold text-[#0F172A] tabular-nums leading-none tracking-tight mb-1">
            {mockRiskData.volatility}
          </div>
          <div className="text-[11px] text-gray-500 font-medium">Volatility</div>
        </div>
      </div>

      {/* Grid for Risk Contribution and Event Sensitivity */}
      <div className="grid grid-cols-[1fr_1.2fr] gap-10 mb-8">
        
        {/* 2. Risk Contribution By Sector */}
        <div>
          <h3 className="text-[14px] font-semibold text-[#0F172A] mb-4">Risk Contribution</h3>
          <div className="flex flex-col gap-3">
            {mockRiskData.contributions.map((c, i) => (
              <div 
                key={i} 
                className="flex items-center group relative cursor-default"
                title={`${c.sector}\n${c.percent}% contribution to risk`}
              >
                <div className="w-[85px] text-[12px] font-medium text-gray-600 transition-colors group-hover:text-gray-900">
                  {c.sector}
                </div>
                <div className="flex-1 h-[6px] bg-gray-100 rounded-full overflow-hidden mx-3">
                  <div 
                    className="h-full rounded-full transition-all duration-300 ease-out" 
                    style={{ width: `${c.percent}%`, backgroundColor: c.color }}
                  />
                </div>
                <div className="w-[30px] text-right text-[12px] font-bold text-[#0F172A] tabular-nums">
                  {c.percent}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Event-Sensitive Assets */}
        <div>
          <h3 className="text-[14px] font-semibold text-[#0F172A] mb-4">Event-Sensitive Assets</h3>
          <div className="flex flex-col border-t border-gray-100">
            {mockRiskData.sensitivities.map((s, i) => {
              const isSelected = selectedAsset === s.asset;
              
              // We'll calculate a mock estimated risk string based on the existing sensitivity level for demo purposes.
              const estRisk = s.sensitivity === 'HIGH' ? '+8.2%' : s.sensitivity === 'MEDIUM' ? '+3.4%' : '+1.1%';
              
              return (
                <div 
                  key={i} 
                  className={`flex items-center justify-between py-2 border-b border-gray-100 transition-colors duration-200 cursor-default group relative ${
                    isSelected ? 'bg-blue-50/50' : 'hover:bg-gray-50/50'
                  }`}
                  title={`${s.asset}\n${s.exposure} portfolio exposure\n${s.sensitivity} event sensitivity`}
                >
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-[#0F172A]">{s.asset}</span>
                    <span className="text-[11px] text-gray-500">{i === 0 || i === 1 ? 'Energy' : i === 2 ? 'Energy ETF' : 'S&P 500 ETF'}</span>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="text-gray-500"><span className="font-semibold text-gray-700">{s.exposure}</span> exp</span>
                      <span className="text-red-600 font-semibold">{estRisk} <span className="font-normal text-gray-500">est</span></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {/* Visual dots for sensitivity */}
                      <span className="text-[10px] text-gray-400 font-medium">Sens:</span>
                      <div className="flex gap-0.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${s.sensitivity === 'LOW' || s.sensitivity === 'MEDIUM' || s.sensitivity === 'HIGH' ? 'bg-[#D97706]' : 'bg-gray-200'}`}></div>
                        <div className={`w-1.5 h-1.5 rounded-full ${s.sensitivity === 'MEDIUM' || s.sensitivity === 'HIGH' ? 'bg-[#D97706]' : 'bg-gray-200'}`}></div>
                        <div className={`w-1.5 h-1.5 rounded-full ${s.sensitivity === 'HIGH' ? 'bg-[#D97706]' : 'bg-gray-200'}`}></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Why Risk Moved */}
      <div className="mt-auto">
        <h3 className="text-[14px] font-semibold text-[#0F172A] mb-3">Why Risk Moved</h3>
        <div className="bg-[#F8FAFC] border border-gray-100 rounded-lg p-4 flex items-center justify-between">
          <div className="flex flex-col items-center flex-1 text-center group cursor-default">
            <span className="text-[12px] font-semibold text-[#0F172A] transition-colors group-hover:text-blue-600">Flood Scenario</span>
            <span className="text-[10px] text-gray-500 mt-0.5">Simulated Event</span>
          </div>
          <div className="text-gray-300 px-2">→</div>
          
          <div className="flex flex-col items-center flex-1 text-center group cursor-default">
            <span className="text-[12px] font-semibold text-[#0F172A] transition-colors group-hover:text-blue-600">Infrastructure</span>
            <span className="text-[10px] text-gray-500 mt-0.5">Exposure hit</span>
          </div>
          <div className="text-gray-300 px-2">→</div>
          
          <div className="flex flex-col items-center flex-1 text-center group cursor-default">
            <span className="text-[12px] font-semibold text-[#0F172A] transition-colors group-hover:text-blue-600">Energy Assets</span>
            <span className="text-[10px] text-gray-500 mt-0.5">High Sensitivity</span>
          </div>
          <div className="text-gray-300 px-2">→</div>
          
          <div className="flex flex-col items-center flex-1 text-center group cursor-default bg-red-50 py-1.5 px-2 rounded">
            <span className="text-[12px] font-bold text-red-600">Portfolio Risk</span>
            <span className="text-[10px] text-red-500/80 font-semibold mt-0.5">+11.4%</span>
          </div>
        </div>
      </div>
      
    </div>
  );
};
