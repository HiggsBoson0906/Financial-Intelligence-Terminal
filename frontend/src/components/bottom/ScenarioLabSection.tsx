import React, { useState } from 'react';

export const ScenarioLabSection: React.FC = () => {
  const [intensity, setIntensity] = useState<number>(4);
  const [energyExposure, setEnergyExposure] = useState<number>(43);
  const [hedgeSize, setHedgeSize] = useState<number>(20);
  const [activeView, setActiveView] = useState<'Current' | 'Simulated'>('Simulated');

  // Dynamic simulation calculations
  const simVaR = Math.round(184 - (hedgeSize / 20) * 43);
  const simES = Math.round(241 - (hedgeSize / 20) * 48);
  const simRisk = (14.2 - (hedgeSize / 20) * 7.4).toFixed(1);
  const riskReduction = (-(hedgeSize / 20) * 7.4).toFixed(1);
  const lossReduction = Math.round((hedgeSize / 20) * 41);
  const hedgeCost = Math.round((hedgeSize / 20) * 12);

  return (
    <div className="fit-card p-6 select-none h-full flex flex-col justify-between">
      {/* Header */}
      <div className="pb-4 border-b border-[#F1F5F9] mb-4 flex items-center justify-between">
        <div>
          <span className="text-[18px] font-semibold text-[#0F172A]">
            Scenario Lab
          </span>
          <span className="text-[11px] text-[#94A3B8] ml-1.5 font-normal">
            (Simulate different outcomes)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Interactive Controls */}
        <div className="space-y-5 font-plex-mono text-[13px]">
          {/* Slider 1: Hurricane Intensity */}
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-[#475569] font-medium">Hurricane Intensity (Category)</span>
              <span className="font-bold text-[#2563EB] bg-[#EFF6FF] px-1.5 py-0.5 rounded text-[10px]">
                CAT {intensity}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full accent-[#2563EB] cursor-pointer h-1.5 bg-[#E2E8F0] rounded-lg"
            />
            <div className="flex justify-between text-[9px] text-[#94A3B8] mt-0.5">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
            </div>
          </div>

          {/* Slider 2: Energy Exposure */}
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-[#475569] font-medium">Energy Exposure</span>
              <span className="font-bold text-[#2563EB]">{energyExposure}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={energyExposure}
              onChange={(e) => setEnergyExposure(Number(e.target.value))}
              className="w-full accent-[#2563EB] cursor-pointer h-1.5 bg-[#E2E8F0] rounded-lg"
            />
            <div className="flex justify-between text-[9px] text-[#94A3B8] mt-0.5">
              <span>0%</span>
              <span className="text-[#2563EB] font-bold">{energyExposure}%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Slider 3: Hedge Size */}
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-[#475569] font-medium">Hedge Size</span>
              <span className="font-bold text-[#16A34A]">{hedgeSize}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={hedgeSize}
              onChange={(e) => setHedgeSize(Number(e.target.value))}
              className="w-full accent-[#16A34A] cursor-pointer h-1.5 bg-[#E2E8F0] rounded-lg"
            />
            <div className="flex justify-between text-[9px] text-[#94A3B8] mt-0.5">
              <span>0%</span>
              <span className="text-[#16A34A] font-bold">{hedgeSize}%</span>
              <span>50%</span>
            </div>
          </div>
        </div>

        {/* Right: Simulation Comparison & Result Box */}
        <div className="flex flex-col justify-between tabular-data text-[13px]">
          <div>
            {/* View Toggle */}
            <div className="flex justify-end mb-2">
              <div className="inline-flex bg-[#F1F5F9] p-0.5 rounded-md border border-[#E2E8F0] text-[10px]">
                <button
                  onClick={() => setActiveView('Current')}
                  className={`px-2.5 py-0.5 rounded transition-colors ${
                    activeView === 'Current'
                      ? 'bg-white text-[#0F172A] font-bold shadow-xs'
                      : 'text-[#64748B]'
                  }`}
                >
                  Current
                </button>
                <button
                  onClick={() => setActiveView('Simulated')}
                  className={`px-2.5 py-0.5 rounded transition-colors ${
                    activeView === 'Simulated'
                      ? 'bg-[#2563EB] text-white font-bold shadow-xs'
                      : 'text-[#64748B]'
                  }`}
                >
                  Simulated
                </button>
              </div>
            </div>

            {/* Comparison Rows */}
            <div className="space-y-1 mb-2.5 text-[11px]">
              <div className="flex justify-between items-center py-0.5 border-b border-[#F8FAFC]">
                <span className="text-[#64748B] font-sans">VaR (95%)</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#64748B]">$184K</span>
                  <span className="text-[#94A3B8]">→</span>
                  <span className="text-[#16A34A] font-bold">${simVaR}K</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-0.5 border-b border-[#F8FAFC]">
                <span className="text-[#64748B] font-sans">Expected Shortfall</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#64748B]">$241K</span>
                  <span className="text-[#94A3B8]">→</span>
                  <span className="text-[#16A34A] font-bold">${simES}K</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-0.5">
                <span className="text-[#64748B] font-sans">Risk Change</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#DC2626] font-semibold">+14.2%</span>
                  <span className="text-[#94A3B8]">→</span>
                  <span className="text-[#16A34A] font-bold">+{simRisk}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Green Simulation Result Card */}
          <div className="pt-3 border-t border-[#F1F5F9] space-y-1.5 text-[12px]">
            <div className="text-[14px] font-semibold text-[#16A34A] mb-2">
              Simulation Result
            </div>
            <div className="flex justify-between">
              <span className="text-[#475569] font-sans">Estimated risk reduction</span>
              <span className="font-bold text-[#16A34A]">{riskReduction}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#475569] font-sans">Expected loss reduction</span>
              <span className="font-bold text-[#16A34A]">-${lossReduction}K</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#475569] font-sans">Hedge cost</span>
              <span className="font-bold text-[#0F172A]">${hedgeCost}K</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
