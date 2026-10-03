import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar 
} from 'recharts';
import { ChartDataPoint } from '../../types';
import { Layers, Activity, AlertTriangle, Radio } from 'lucide-react';

interface MarketIntelligenceChartProps {
  data: Record<string, ChartDataPoint[]>;
  activeAsset?: string;
  onSelectEventMarker?: (event: string) => void;
}

export const MarketIntelligenceChart: React.FC<MarketIntelligenceChartProps> = ({
  data,
  activeAsset = 'CRUDE OIL (WTI)',
  onSelectEventMarker,
}) => {
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1D');
  const [showVolume, setShowVolume] = useState(true);

  const chartPoints = data[timeframe] || data['1D'];
  const minPrice = Math.min(...chartPoints.map((d) => d.price)) * 0.98;
  const maxPrice = Math.max(...chartPoints.map((d) => d.price)) * 1.02;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint: ChartDataPoint = payload[0].payload;
      return (
        <div className="bg-[#0b0e17] border border-[#00f0ff]/40 p-2.5 rounded text-xs font-mono-data shadow-2xl z-50">
          <div className="text-slate-400 font-bold mb-1 border-b border-[#1d2334] pb-1 flex justify-between">
            <span>TIME: {dataPoint.timestamp}</span>
            <span className="text-[#00f0ff]">{activeAsset}</span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">PRICE:</span>
              <span className="font-bold text-slate-100">${dataPoint.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">VOLUME:</span>
              <span className="text-slate-200">{dataPoint.volume.toLocaleString()}</span>
            </div>

            {dataPoint.event && (
              <div className="mt-1 pt-1 border-t border-rose-500/30 text-rose-400 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                <span>EVENT: {dataPoint.event}</span>
              </div>
            )}

            {dataPoint.news && (
              <div className="mt-1 pt-1 border-t border-cyan-500/30 text-cyan-300 flex items-center gap-1">
                <Radio className="w-3 h-3 text-cyan-400" />
                <span>NEWS: {dataPoint.news}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="terminal-card p-4 rounded flex flex-col justify-between h-full select-none">
      {/* Chart Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[#1e2333]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-slate-100 tracking-wider uppercase font-mono-data flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#00f0ff]" />
              MARKET INTELLIGENCE
            </h2>
            <span className="px-1.5 py-0.5 rounded bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 text-[9px] font-mono-data font-bold">
              LIVE MULTI-SOURCE ANALYSIS
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans mt-0.5">
            Synchronized pricing, news wire events, and GIS satellite threat markers
          </p>
        </div>

        {/* Controls & Timeframes */}
        <div className="flex items-center gap-2">
          {/* Timeframe selector */}
          <div className="flex items-center bg-[#080a10] p-0.5 rounded border border-[#1e2333]">
            {(['1D', '1W', '1M', '3M', '1Y'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-1 rounded text-[10px] font-mono-data transition-colors ${
                  timeframe === tf
                    ? 'bg-[#141a2a] text-[#00f0ff] font-bold border border-[#00f0ff]/30 shadow-[0_0_8px_rgba(0,240,255,0.15)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Volume toggle */}
          <button
            onClick={() => setShowVolume(!showVolume)}
            className={`p-1.5 rounded border transition-colors ${
              showVolume
                ? 'bg-[#141a2a] text-cyan-300 border-[#00f0ff]/40'
                : 'bg-[#080a10] text-slate-500 border-[#1e2333]'
            }`}
            title="Toggle Volume Overlay"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Chart Canvas Area */}
      <div className="flex-1 w-full min-h-[260px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#00f0ff" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />

            <XAxis
              dataKey="timestamp"
              stroke="#475569"
              tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
              tickLine={{ stroke: '#1e2333' }}
            />

            <YAxis
              domain={[minPrice, maxPrice]}
              stroke="#475569"
              tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
              tickFormatter={(v) => `$${v.toFixed(1)}`}
              tickLine={{ stroke: '#1e2333' }}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="price"
              stroke="#00f0ff"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#priceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Interactive Marker Legend */}
      <div className="mt-3 pt-2.5 border-t border-[#1e2333] flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono-data text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#00f0ff] inline-block" />
            SPOT PRICE (${chartPoints[chartPoints.length - 1]?.price.toFixed(2)})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block pulse-dot" />
            CAT 4 HURRICANE MARKER
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-400 inline-block" />
            FED PAUSE SIGNAL
          </span>
        </div>

        <div className="text-slate-500">
          CANVAS RENDERER: SVG 120FPS • SOURCE: BLOOMBERG B-PIPE
        </div>
      </div>
    </div>
  );
};
