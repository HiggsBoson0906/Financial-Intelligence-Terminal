import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Briefcase, PieChart as PieIcon, BarChart2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const TOTAL_VALUE = 10000000;

const portfolioData = [
  { ticker: 'XOM', name: 'Exxon Mobil', weight: 0.30, type: 'ENERGY', color: '#0369A1' }, // sky-700
  { ticker: 'CVX', name: 'Chevron', weight: 0.20, type: 'ENERGY', color: '#0284C7' }, // sky-600
  { ticker: 'COP', name: 'ConocoPhillips', weight: 0.20, type: 'ENERGY', color: '#0EA5E9' }, // sky-500
  { ticker: 'OXY', name: 'Occidental Petroleum', weight: 0.10, type: 'ENERGY', color: '#38BDF8' }, // sky-400
  { ticker: 'XLE', name: 'Energy Select Sector SPDR', weight: 0.10, type: 'ENERGY ETF', color: '#0F766E' }, // teal-700
  { ticker: 'SPY', name: 'SPDR S&P 500 ETF', weight: 0.10, type: 'INDEX ETF', color: '#64748B' } // slate-500
].map(item => ({
  ...item,
  value: TOTAL_VALUE * item.weight,
  formattedWeight: `${(item.weight * 100).toFixed(0)}%`,
  formattedValue: `$${(TOTAL_VALUE * item.weight / 1000000).toFixed(2)}M`
}));

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 p-3 rounded shadow-lg text-sm font-sans">
        <div className="font-bold text-[#0F172A] dark:text-slate-100 mb-1">{data.ticker} <span className="text-[#64748B] dark:text-slate-400 font-normal">| {data.name}</span></div>
        <div className="flex justify-between gap-6 mb-1">
          <span className="text-[#64748B] dark:text-slate-400">Weight:</span>
          <span className="font-mono-tech font-bold text-[#0F172A] dark:text-slate-100">{data.formattedWeight}</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-[#64748B] dark:text-slate-400">Value:</span>
          <span className="font-mono-tech font-bold text-[#0F172A] dark:text-slate-100">{data.formattedValue}</span>
        </div>
      </div>
    );
  }
  return null;
};

export const PortfolioPage: React.FC = () => {
  const [hoveredTicker, setHoveredTicker] = useState<string | null>(null);
  const { isDark } = useTheme();

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#0F172A] dark:text-[#F8FAFC] font-sans animate-in fade-in duration-500 pb-12 transition-colors duration-300">
      
      {/* HEADER */}
      <div className="bg-white dark:bg-slate-900 px-8 py-10 border-b border-[#E2E8F0] dark:border-slate-800 relative overflow-hidden">
        {/* Subtle background grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-50 dark:opacity-30" />
        
        <div className="relative z-10 max-w-[1400px] mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-[32px] font-bold tracking-tight text-[#0F172A] dark:text-slate-100 leading-none">
              PORTFOLIO
            </h1>
            <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2.5 py-1 rounded-full uppercase tracking-widest mt-1">
              SYNTHETIC DEMO PORTFOLIO
            </span>
          </div>
          
          {/* Top Metrics */}
          <div className="flex flex-wrap gap-8 sm:gap-12 mt-8">
            <div>
              <div className="text-[11px] text-[#64748B] dark:text-slate-400 font-bold tracking-widest uppercase mb-1">Total Value</div>
              <div className="text-[36px] font-mono-tech font-bold text-[#0F172A] dark:text-slate-100 tracking-tight leading-none">$10.0M</div>
            </div>
            <div className="w-px bg-[#E2E8F0] dark:bg-slate-800 hidden sm:block" />
            <div>
              <div className="text-[11px] text-[#64748B] dark:text-slate-400 font-bold tracking-widest uppercase mb-1">Holdings</div>
              <div className="text-[36px] font-mono-tech font-bold text-[#0F172A] dark:text-slate-100 tracking-tight leading-none">6</div>
            </div>
            <div className="w-px bg-[#E2E8F0] dark:bg-slate-800 hidden sm:block" />
            <div>
              <div className="text-[11px] text-[#64748B] dark:text-slate-400 font-bold tracking-widest uppercase mb-1">Energy Holdings</div>
              <div className="text-[36px] font-mono-tech font-bold text-[#0F172A] dark:text-slate-100 tracking-tight leading-none">5</div>
            </div>
            <div className="w-px bg-[#E2E8F0] dark:bg-slate-800 hidden sm:block" />
            <div>
              <div className="text-[11px] text-[#64748B] dark:text-slate-400 font-bold tracking-widest uppercase mb-1">Equity / Index</div>
              <div className="text-[36px] font-mono-tech font-bold text-[#0F172A] dark:text-slate-100 tracking-tight leading-none">1</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-8 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* DONUT CHART */}
          <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-lg shadow-sm p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-6 border-b border-[#F1F5F9] dark:border-slate-800 pb-3">
              <PieIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-[12px] font-bold text-[#0F172A] dark:text-slate-100 uppercase tracking-widest">Composition Donut</h2>
            </div>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={portfolioData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                    onMouseEnter={(_, index) => setHoveredTicker(portfolioData[index].ticker)}
                    onMouseLeave={() => setHoveredTicker(null)}
                  >
                    {portfolioData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        opacity={hoveredTicker && hoveredTicker !== entry.ticker ? 0.3 : 1}
                        className="transition-opacity duration-300 outline-none"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* BAR CHART */}
          <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-lg shadow-sm p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-6 border-b border-[#F1F5F9] dark:border-slate-800 pb-3">
              <BarChart2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-[12px] font-bold text-[#0F172A] dark:text-slate-100 uppercase tracking-widest">Allocation Distribution</h2>
            </div>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={portfolioData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDark ? '#334155' : '#E2E8F0'} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="ticker" type="category" axisLine={false} tickLine={false} tick={{ fill: isDark ? '#94A3B8' : '#475569', fontSize: 12, fontWeight: 'bold' }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? '#1E293B' : '#F8FAFC' }} />
                  <Bar 
                    dataKey="value" 
                    radius={[0, 4, 4, 0]}
                    onMouseEnter={(data) => setHoveredTicker(data.ticker)}
                    onMouseLeave={() => setHoveredTicker(null)}
                  >
                    {portfolioData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        opacity={hoveredTicker && hoveredTicker !== entry.ticker ? 0.3 : 1}
                        className="transition-opacity duration-300"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* HOLDINGS TABLE */}
        <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-[#E2E8F0] dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <Briefcase className="w-4 h-4 text-[#64748B] dark:text-slate-400" />
            <h2 className="text-[12px] font-bold text-[#0F172A] dark:text-slate-100 uppercase tracking-widest">Holdings Details</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#F8FAFC] dark:bg-slate-800/60 border-b border-[#E2E8F0] dark:border-slate-800 text-[10px] uppercase tracking-widest text-[#64748B] dark:text-slate-400 font-bold">
                <tr>
                  <th className="px-6 py-3 font-bold">Ticker</th>
                  <th className="px-6 py-3 font-bold">Company</th>
                  <th className="px-6 py-3 font-bold text-right">Weight</th>
                  <th className="px-6 py-3 font-bold text-right">Value</th>
                  <th className="px-6 py-3 font-bold text-center">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] dark:divide-slate-800">
                {portfolioData.map((holding) => {
                  const isHovered = hoveredTicker === holding.ticker;
                  return (
                    <tr 
                      key={holding.ticker} 
                      className={`transition-colors duration-200 cursor-default ${isHovered ? 'bg-blue-50/50 dark:bg-blue-950/30' : 'hover:bg-[#F8FAFC] dark:hover:bg-slate-800/40'}`}
                      onMouseEnter={() => setHoveredTicker(holding.ticker)}
                      onMouseLeave={() => setHoveredTicker(null)}
                    >
                      <td className="px-6 py-4">
                        <span className="font-bold text-[#0F172A] dark:text-slate-100">{holding.ticker}</span>
                      </td>
                      <td className="px-6 py-4 text-[#475569] dark:text-slate-300 font-medium">
                        {holding.name}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-mono-tech font-bold text-[#0F172A] dark:text-slate-100">{holding.formattedWeight}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-mono-tech font-medium text-[#475569] dark:text-slate-300">{holding.formattedValue}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded ${
                          holding.type.includes('ETF') ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                        }`}>
                          {holding.type}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
