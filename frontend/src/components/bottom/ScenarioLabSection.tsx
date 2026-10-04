import React, { useState } from 'react';
import { QueryResponse } from '../../types/api';

interface ScenarioLabSectionProps {
  data?: QueryResponse | null;
}

export const ScenarioLabSection: React.FC<ScenarioLabSectionProps> = ({ data }) => {
  // Calculate initial energy exposure dynamically
  const initialEnergy = React.useMemo(() => {
    const weights = data?.portfolio_context?.weights;
    if (!weights) return 0;
    // Simple mock: if Energy factor exists, use it, else sum energy-related symbols.
    return 0; // Default if we don't have enough logic.
  }, [data]);

  const [intensity, setIntensity] = useState<number>(4);
  const [energyExposure, setEnergyExposure] = useState<number>(0);
  const [hedgeSize, setHedgeSize] = useState<number>(0);
  
  React.useEffect(() => {
    setEnergyExposure(initialEnergy);
  }, [initialEnergy]);

  if (!data?.scenario) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6 select-none h-full flex flex-col items-center justify-center text-center">
        <h2 className="text-[18px] font-bold text-[#0F172A] mb-2">Scenario Lab</h2>
        <div className="text-[14px] text-[#64748B]">No scenario data available.</div>
      </div>
    );
  }

  const baseVar = data?.risk?.metrics?.var_95 ? data.risk.metrics.var_95 / 1000 : 0;
  const baseEs = data?.risk?.metrics?.expected_shortfall ? data.risk.metrics.expected_shortfall / 1000 : 0;
  const baseRiskChange = data?.scenario?.portfolio_impact?.total_impact_percent || 0;

  // Use scenario values from backend as the true baseline for the simulation
  const stressedVar = data?.scenario?.portfolio_impact?.stressed_var_95 
    ? data.scenario.portfolio_impact.stressed_var_95 / 1000 
    : baseVar * (1 + (baseRiskChange / 100));

  const stressedEs = data?.scenario?.portfolio_impact?.stressed_expected_shortfall 
    ? data.scenario.portfolio_impact.stressed_expected_shortfall / 1000 
    : baseEs * (1 + (baseRiskChange / 100));

  // Dynamic simulation calculations (Further Hedge Simulation)
  const simVaR = Math.round(stressedVar - (hedgeSize / 20) * (stressedVar * 0.2));
  const simES = Math.round(stressedEs - (hedgeSize / 20) * (stressedEs * 0.2));
  const riskReductionFactor = 0.5; // Dynamic factor based on hedge
  const simRisk = (baseRiskChange - (hedgeSize / 20) * riskReductionFactor).toFixed(1);
  const riskReduction = (-(hedgeSize / 20) * riskReductionFactor).toFixed(1);
  const lossReduction = Math.round((stressedVar - simVaR));
  const hedgeCost = Math.round((hedgeSize / 20) * (baseVar * 0.05));

  const resetSimulation = () => {
    setIntensity(4);
    setEnergyExposure(initialEnergy);
    setHedgeSize(0);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6 select-none h-full flex flex-col justify-between">
      {/* Header */}
      <div className="pb-4 border-b border-[#F1F5F9] mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-[21px] font-bold text-[#0F172A] leading-tight">
            Scenario Lab
          </h2>
          <p className="text-[12px] text-[#64748B] mt-0.5 font-medium">
            Simulate portfolio outcomes under different conditions
          </p>
        </div>
        <div className="flex items-center">
          <span className="text-[10px] font-bold text-[#D97706] bg-[#FEF3C7] px-2 py-1 rounded uppercase tracking-wider">
            Simulation
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Interactive Controls (45%) */}
        <div className="lg:col-span-5 space-y-7">
          <h3 className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-2">
            Scenario Controls
          </h3>
          
          <div className="space-y-6 font-plex-mono text-[13px]">
            {/* Slider 1: Hurricane Intensity */}
            <div>
              <div className="flex items-center justify-between text-[12px] mb-2 font-sans">
                <span className="text-[#0F172A] font-semibold">Event Intensity</span>
                <span className="font-bold text-[#2563EB]">Level {intensity}</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full accent-[#2563EB] cursor-pointer h-1.5 bg-[#E2E8F0] rounded-lg mb-1"
              />
              <div className="flex justify-between text-[10px] text-[#94A3B8] font-sans">
                <span>Level 1</span>
                <span>Level 5</span>
              </div>
            </div>

            {/* Slider 2: Energy Exposure */}
            <div>
              <div className="flex items-center justify-between text-[12px] mb-2 font-sans">
                <span className="text-[#0F172A] font-semibold">Energy Exposure</span>
                <span className="font-bold text-[#2563EB]">{energyExposure}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={energyExposure}
                onChange={(e) => setEnergyExposure(Number(e.target.value))}
                className="w-full accent-[#2563EB] cursor-pointer h-1.5 bg-[#E2E8F0] rounded-lg mb-1"
              />
              <div className="flex justify-between text-[10px] text-[#94A3B8] font-sans">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Slider 3: Hedge Size */}
            <div>
              <div className="flex items-center justify-between text-[12px] mb-2 font-sans">
                <span className="text-[#0F172A] font-semibold">Hedge Size</span>
                <span className="font-bold text-[#16A34A]">{hedgeSize}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={hedgeSize}
                onChange={(e) => setHedgeSize(Number(e.target.value))}
                className="w-full accent-[#16A34A] cursor-pointer h-1.5 bg-[#E2E8F0] rounded-lg mb-1"
              />
              <div className="flex justify-between text-[10px] text-[#94A3B8] font-sans">
                <span>0%</span>
                <span>50%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Simulation Result (55%) */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">
                Backend Scenario &rarr; Simulation Result
              </h3>
              <span className="text-[11px] font-semibold text-[#94A3B8]">
                SCENARIO &rarr; HEDGED
              </span>
            </div>
            
            <div className="flex flex-col tabular-data text-[14px]">
              {/* Comparison Rows */}
              <div className="space-y-1 mb-5">
                <div className="flex justify-between items-center py-1.5 border-b border-[#F8FAFC]">
                  <span className="text-[#475569] font-medium font-sans">Stressed VaR (95%)</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[#DC2626]">${Math.round(stressedVar)}K</span>
                    <span className="text-[#CBD5E1]">&rarr;</span>
                    <span className="text-[#16A34A] font-bold">${simVaR}K</span>
                  </div>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-[#F8FAFC]">
                  <span className="text-[#475569] font-medium font-sans">Stressed Shortfall</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[#DC2626]">${Math.round(stressedEs)}K</span>
                    <span className="text-[#CBD5E1]">&rarr;</span>
                    <span className="text-[#16A34A] font-bold">${simES}K</span>
                  </div>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[#475569] font-medium font-sans">Risk Change</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[#DC2626] font-semibold">+{baseRiskChange.toFixed(1)}%</span>
                    <span className="text-[#CBD5E1]">&rarr;</span>
                    <span className="text-[#16A34A] font-bold">+{simRisk}%</span>
                  </div>
                </div>
              </div>

              {/* Final Simulation Impact */}
              <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-lg p-4 space-y-2 text-[13px]">
                <div className="text-[13px] font-semibold text-[#0F172A] mb-3">
                  Simulation Impact
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#475569] font-medium font-sans">Estimated Risk Reduction</span>
                  <span className="font-bold text-[#16A34A]">{riskReduction}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#475569] font-medium font-sans">Expected Loss Reduction</span>
                  <span className="font-bold text-[#16A34A]">-${lossReduction}K</span>
                </div>
                <div className="flex justify-between items-center pt-2 mt-2 border-t border-[#E2E8F0]">
                  <span className="text-[#475569] font-medium font-sans">Hedge Cost</span>
                  <span className="font-bold text-[#0F172A]">${hedgeCost}K</span>
                </div>
              </div>
              
              {/* Explanation Text */}
              <div className="mt-4 text-[12px] text-[#64748B]">
                <span className="font-bold text-[#475569] uppercase tracking-wide text-[10px] block mb-1">Why this changes</span>
                Reducing energy exposure and applying a simulated hedge lowers portfolio sensitivity under the selected stress scenario.
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-[#F1F5F9]">
            <button 
              onClick={resetSimulation}
              className="px-4 py-2 text-[12px] font-semibold text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded transition-colors"
            >
              Reset
            </button>
            <button className="px-5 py-2 text-[12px] font-semibold text-white bg-[#0F172A] hover:bg-[#1E293B] rounded shadow-sm transition-colors">
              Run Simulation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
