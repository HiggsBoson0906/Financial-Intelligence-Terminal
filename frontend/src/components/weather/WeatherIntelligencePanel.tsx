import React from 'react';
import type { WeatherDisruption } from '../../types';
import { CloudLightning, Wind, Navigation, AlertOctagon, Building2, Anchor, GitCommit } from 'lucide-react';

interface WeatherIntelligencePanelProps {
  weatherData: WeatherDisruption;
  onSelectAsset?: (symbol: string) => void;
}

export const WeatherIntelligencePanel: React.FC<WeatherIntelligencePanelProps> = ({
  weatherData,
  onSelectAsset,
}) => {
  return (
    <div className="terminal-card p-4 rounded select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-3 mb-4 border-b border-[#1e2333]">
        <div>
          <div className="flex items-center gap-2">
            <CloudLightning className="w-4 h-4 text-[#00f0ff] pulse-dot" />
            <h2 className="text-xs font-bold text-slate-100 tracking-wider uppercase font-mono-data">
              GIS WEATHER & INFRASTRUCTURE INTELLIGENCE
            </h2>
            <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[9px] font-mono-data font-bold">
              NOAA SATELLITE LIVE TRACK
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Geospatial storm telemetry intersected with crude oil refining, LNG terminals, and pipelines
          </p>
        </div>

        <div className="text-xs font-mono-data text-slate-300">
          LOCATION: <span className="text-cyan-300 font-bold">{weatherData.location}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Radar Map Simulation Canvas */}
        <div className="bg-[#060810] p-3 rounded border border-[#1d2538] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 terminal-grid-bg opacity-40 pointer-events-none" />

          {/* Simulated Radar Target Circles */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-[#00f0ff]/20 rounded-full animate-ping pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-rose-500/30 rounded-full pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-between text-[10px] font-mono-data text-slate-400 mb-2">
              <span className="flex items-center gap-1 text-[#00f0ff] font-bold">
                <Navigation className="w-3 h-3 text-[#00f0ff] animate-spin" />
                RADAR MATRIX 04
              </span>
              <span>BEARING: 310° NW</span>
            </div>

            <div className="bg-[#0a0f1d]/90 p-2.5 rounded border border-[#1a2336] mb-3">
              <div className="text-sm font-bold text-rose-400 font-mono-data">
                {weatherData.name} ({weatherData.category})
              </div>
              <div className="flex items-center justify-between text-xs font-mono-data text-slate-300 mt-1">
                <span className="flex items-center gap-1">
                  <Wind className="w-3.5 h-3.5 text-cyan-400" /> {weatherData.windSpeed}
                </span>
                <span className="text-amber-400 font-bold">LANDFALL: {weatherData.landfallHorizon}</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-2 border-t border-[#182033] text-[10px] font-mono-data text-slate-400">
            <span>COORDINATES INTERSECTING 11 CRUDE REFINING COMPLEX COORDINATES</span>
          </div>
        </div>

        {/* Affected Infrastructure Breakdown */}
        <div className="lg:col-span-2 bg-[#090b12] p-3 rounded border border-[#1e2333] space-y-3 font-mono-data">
          <div className="text-xs font-bold text-slate-200 border-b border-[#1b2132] pb-1.5 flex items-center justify-between">
            <span>IMPACTED INFRASTRUCTURE MATRIX</span>
            <span className="text-[10px] text-rose-400 font-normal">CRITICAL THREAT ZONE</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Refineries */}
            <div className="bg-[#0b0e18] p-2.5 rounded border border-[#192135]">
              <div className="text-[10px] font-bold text-cyan-400 flex items-center gap-1 mb-1.5">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                REFINERIES (OFFLINE EST.)
              </div>
              <ul className="space-y-1 text-[10px] text-slate-300">
                {weatherData.affectedInfrastructure.refineries.map((ref, idx) => (
                  <li key={idx} className="truncate hover:text-cyan-300">
                    • {ref}
                  </li>
                ))}
              </ul>
            </div>

            {/* Ports */}
            <div className="bg-[#0b0e18] p-2.5 rounded border border-[#192135]">
              <div className="text-[10px] font-bold text-amber-400 flex items-center gap-1 mb-1.5">
                <Anchor className="w-3.5 h-3.5 text-amber-400" />
                CRUDE & LNG PORTS
              </div>
              <ul className="space-y-1 text-[10px] text-slate-300">
                {weatherData.affectedInfrastructure.ports.map((port, idx) => (
                  <li key={idx} className="truncate hover:text-amber-300">
                    • {port}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pipelines */}
            <div className="bg-[#0b0e18] p-2.5 rounded border border-[#192135]">
              <div className="text-[10px] font-bold text-rose-400 flex items-center gap-1 mb-1.5">
                <GitCommit className="w-3.5 h-3.5 text-rose-400" />
                PIPELINES & PUMPS
              </div>
              <ul className="space-y-1 text-[10px] text-slate-300">
                {weatherData.affectedInfrastructure.pipelines.map((pipe, idx) => (
                  <li key={idx} className="truncate hover:text-rose-300">
                    • {pipe}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Causal Chain Section */}
      <div className="bg-[#080a10] p-3 rounded border border-[#1e2436] font-mono-data">
        <div className="text-xs font-bold text-slate-200 mb-2 pb-1.5 border-b border-[#1b2132] flex items-center gap-1.5">
          <AlertOctagon className="w-3.5 h-3.5 text-cyan-400" />
          <span>CAUSAL IMPACT TRANSMISSION CHAIN</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          {weatherData.causalChain.map((chain) => (
            <div
              key={chain.stage}
              className="bg-[#0b0e18] p-2.5 rounded border border-[#172033] flex flex-col justify-between"
            >
              <div>
                <div className="text-[9px] text-[#00f0ff] font-bold mb-0.5">
                  STAGE 0{chain.stage}
                </div>
                <div className="text-xs font-bold text-slate-100 mb-1">{chain.label}</div>
                <p className="text-[10px] text-slate-400 leading-snug font-sans">{chain.description}</p>
              </div>

              <div className="pt-2 mt-2 border-t border-[#171d2e] flex flex-wrap gap-1">
                {chain.affectedSymbols.map((sym) => (
                  <button
                    key={sym}
                    onClick={() => onSelectAsset?.(sym)}
                    className="px-1.5 py-0.5 rounded bg-[#131a2c] hover:bg-[#1a233b] text-slate-300 hover:text-[#00f0ff] text-[9px] border border-[#212b45] transition-colors"
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
