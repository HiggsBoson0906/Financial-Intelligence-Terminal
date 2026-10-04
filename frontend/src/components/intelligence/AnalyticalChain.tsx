import React from 'react';

// Data models for risk & hedge charts
// Architected so data can be replaced by:
// GET /api/v1/risk/{symbol} or GET /api/v1/risk/portfolio
import { QueryResponse } from '../../types/api';

export interface RiskTrendPoint {
  time: string;
  varValue: number; // in $K
}

export interface HedgeEffectPoint {
  stage: string;
  exposure: number; // relative risk %
}

interface AnalyticalChainProps {
  data?: QueryResponse | null;
  onSelectNode?: (nodeName: string) => void;
  riskTrendData?: RiskTrendPoint[];
  hedgeEffectData?: HedgeEffectPoint[];
}

const DEFAULT_RISK_TREND: RiskTrendPoint[] = [
  { time: '9 AM', varValue: 162 },
  { time: '10 AM', varValue: 168 },
  { time: '11 AM', varValue: 175 },
  { time: '12 PM', varValue: 184 },
  { time: '1 PM', varValue: 179 },
  { time: '2 PM', varValue: 171 },
  { time: '3 PM', varValue: 166 },
];

export const AnalyticalChain: React.FC<AnalyticalChainProps> = ({
  data,
  onSelectNode,
  riskTrendData = DEFAULT_RISK_TREND,
}) => {
  // Use real data if available
  const riskVar = data?.risk?.metrics?.var_95 ? data.risk.metrics.var_95 / 1000 : 0; // $K
  const expectedShortfall = data?.risk?.metrics?.expected_shortfall ? data.risk.metrics.expected_shortfall / 1000 : 0; // $K
  const energyExposure = React.useMemo(() => {
    if (!data?.portfolio_context?.weights) return 'N/A';
    const w = data.portfolio_context.weights;
    // Sum energy symbols
    const total = (w['XOM'] || 0) + (w['CVX'] || 0) + (w['COP'] || 0) + (w['OXY'] || 0) + (w['XLE'] || 0);
    return total > 0 ? (total * 100).toFixed(0) : 'N/A';
  }, [data]);
  const simulatedHedge = data?.recommendations?.[0]?.expected_effect?.stress_loss_change
    ? (data.recommendations[0].expected_effect.stress_loss_change * 100).toFixed(1)
    : '0.0';

  // SVG coordinates calculation for Quant Risk line chart
  const minVal = 155;
  const maxVal = 190;
  const width = 140;
  const height = 48;
  const xStart = 8;
  const xEnd = width - 8;
  const yTop = 10;
  const yBottom = 34;

  const points = riskTrendData.map((pt, i) => {
    const x = xStart + (i / Math.max(riskTrendData.length - 1, 1)) * (xEnd - xStart);
    const y = yBottom - ((pt.varValue - minVal) / (maxVal - minVal)) * (yBottom - yTop);
    return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)), ...pt };
  });

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');
  const peakPoint = points.reduce((prev, curr) => (curr.varValue > prev.varValue ? curr : prev), points[0]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#F1F5F9] items-stretch w-full overflow-hidden">
      
      {/* Node 1: PORTFOLIO */}
      <div
        onClick={() => onSelectNode?.('PORTFOLIO')}
        className="px-4 py-3 hover:bg-[#F8FAFC] transition-colors cursor-pointer group flex flex-col justify-between"
      >
        <div className="text-[16px] font-semibold text-[#0F172A] mb-1.5 flex items-center justify-between">
          <span>Portfolio</span>
          <span className="text-[11px] font-medium text-[#64748B]">Allocation</span>
        </div>
        
        {/* Horizontal composition: ~38% Donut on Left, ~62% Info on Right */}
        <div className="flex items-center w-full my-auto">
          {/* Left: Donut Chart (~64px, vertically centered) */}
          <div className="w-[38%] shrink-0 flex items-center justify-center">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg width="64" height="64" viewBox="0 0 36 36" className="shrink-0">
                {/* Background circle */}
                <circle cx="18" cy="18" r="14" fill="none" stroke="#F1F5F9" strokeWidth="4.5" />
                {/* Segments rotated from top (-90deg) */}
                <g transform="rotate(-90 18 18)">
                  {/* Energy 43% */}
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#F43F5E"
                    strokeWidth="4.5"
                    pathLength="100"
                    strokeDasharray="43 100"
                    strokeDashoffset="0"
                  />
                  {/* Tech 28% */}
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="4.5"
                    pathLength="100"
                    strokeDasharray="28 100"
                    strokeDashoffset="-43"
                  />
                  {/* Finance 15% */}
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="4.5"
                    pathLength="100"
                    strokeDasharray="15 100"
                    strokeDashoffset="-71"
                  />
                  {/* Other 14% */}
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#CBD5E1"
                    strokeWidth="4.5"
                    pathLength="100"
                    strokeDasharray="14 100"
                    strokeDashoffset="-86"
                  />
                </g>
              </svg>
              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[12px] font-bold text-[#0F172A] leading-none tabular-nums">{energyExposure}%</span>
              </div>
            </div>
          </div>

          {/* Right: Portfolio breakdown */}
          <div className="w-[62%] pl-3 min-w-0 flex flex-col justify-center">
            <div className="flex items-baseline justify-between mb-1 pb-1 border-b border-[#F1F5F9]">
              <div>
                <span className="text-[13px] font-semibold text-[#0F172A] leading-tight block">Energy</span>
                <span className="text-[11px] text-[#64748B] font-medium leading-none block">
                  {data?.portfolio_context?.type === 'synthetic' ? (
                    <span className="text-[#D97706] font-bold uppercase tracking-wider">Synthetic Demo Portfolio</span>
                  ) : (
                    'Your Portfolio'
                  )}
                </span>
              </div>
              <span className="text-[18px] font-bold text-[#F43F5E] tabular-nums leading-tight">{energyExposure}%</span>
            </div>

            <div className="space-y-0.5 text-[12px] font-medium text-[#475569]">
              <div className="flex justify-between items-center">
                <span className="flex items-center truncate">
                  <span className="w-1.5 h-1.5 rounded-sm bg-[#F43F5E] mr-1.5 shrink-0" />
                  Energy
                </span>
                <span className="font-semibold text-[#0F172A] tabular-nums">{energyExposure !== 'N/A' ? energyExposure : '0'}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center truncate">
                  <span className="w-1.5 h-1.5 rounded-sm bg-[#3B82F6] mr-1.5 shrink-0" />
                  Tech
                </span>
                <span className="font-semibold text-[#0F172A] tabular-nums">0%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center truncate">
                  <span className="w-1.5 h-1.5 rounded-sm bg-[#F59E0B] mr-1.5 shrink-0" />
                  Finance
                </span>
                <span className="font-semibold text-[#0F172A] tabular-nums">0%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Node 2: QUANT RISK */}
      <div
        onClick={() => onSelectNode?.('RISK')}
        className="px-4 py-3 hover:bg-[#F8FAFC] transition-colors cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[16px] font-semibold text-[#0F172A]">Quant Risk</div>
          <span className="text-[10px] font-semibold text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded uppercase tracking-wider">
            {data?.data_quality?.overall_status === 'good' ? 'LIVE' : (data?.data_quality?.overall_status || 'MODEL').toUpperCase()}
          </span>
        </div>
        
        {/* Horizontal composition: Metrics on Left, Risk Trend Line Chart on Right */}
        <div className="grid grid-cols-2 gap-2.5 items-center my-auto">
          {/* Left Column: Metrics */}
          <div className="space-y-1.5 min-w-0 col-span-2">
            <div>
              <span className="text-[12px] text-[#64748B] font-medium block leading-none mb-0.5">VaR (95%)</span>
              <div className="flex items-baseline gap-1.5">
                <span className="tabular-nums font-bold text-[18px] text-[#0F172A] leading-tight">${riskVar.toFixed(0)}K</span>
                <span className="text-[12px] font-semibold text-[#DC2626] tabular-nums">+11.4%</span>
              </div>
            </div>

            <div>
              <span className="text-[12px] text-[#64748B] font-medium block leading-none mb-0.5">Expected Shortfall</span>
              <div className="flex items-baseline gap-1.5">
                <span className="tabular-nums font-bold text-[18px] text-[#0F172A] leading-tight">${expectedShortfall.toFixed(0)}K</span>
                <span className="text-[12px] font-semibold text-[#DC2626] tabular-nums">+18.7%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Node 3: STRATEGY */}
      <div
        id="strategy"
        onClick={() => onSelectNode?.('STRATEGY')}
        className="px-4 py-3 hover:bg-[#F8FAFC] transition-colors cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[16px] font-semibold text-[#0F172A]">Strategy</div>
          <span className="text-[10px] font-semibold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded uppercase tracking-wider">
            Simulation
          </span>
        </div>
        
        {/* Horizontal composition: Hedge Metrics on Left, Simulated Hedge Effect on Right */}
        <div className="grid grid-cols-2 gap-2.5 items-center my-auto">
          {/* Left Column: Metric */}
          <div className="min-w-0">
            <div className="text-[12px] text-[#64748B] font-medium leading-none mb-1">
              Simulated Hedge
            </div>
            <div className="tabular-nums font-bold text-[20px] text-[#16A34A] leading-tight mb-0.5">
              {simulatedHedge}%
            </div>
            <div className="text-[11px] text-[#64748B] leading-tight">
              Risk reduction vs unhedged
            </div>
          </div>

          {/* Right Column: Hedge Effect Curve */}
          <div className="flex flex-col justify-center bg-white border border-[#E2E8F0]/70 rounded p-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-0.5">
              <span>Hedge Effect</span>
              <span className="text-[10px] text-[#16A34A] font-medium">Simulation</span>
            </div>
            <div className="w-full h-[46px]">
              <svg viewBox="0 0 140 48" className="w-full h-full overflow-visible">
                {/* Unhedged baseline */}
                <line x1="8" y1="12" x2="132" y2="12" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="2 2" />
                <text x="8" y="9" fontSize="8.5" fill="#94A3B8" fontWeight="600">Base Risk</text>
                
                {/* Risk reduction trajectory */}
                <path
                  d="M 8,12 C 40,12 65,31 132,31"
                  fill="none"
                  stroke="#16A34A"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />

                {/* Target point indicator */}
                <circle cx="132" cy="31" r="2.5" fill="#16A34A" />
                <text
                  x="132"
                  y="26"
                  fontSize="9.5"
                  fontWeight="700"
                  fill="#16A34A"
                  textAnchor="end"
                >
                  {simulatedHedge}%
                </text>

                {/* X-axis labels */}
                <text x="8" y="44" fontSize="9" fill="#94A3B8" textAnchor="start">Current</text>
                <text x="70" y="44" fontSize="9" fill="#94A3B8" textAnchor="middle">Hedge</text>
                <text x="132" y="44" fontSize="9" fill="#16A34A" fontWeight="600" textAnchor="end">Protected</text>
              </svg>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

