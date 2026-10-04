import React, { useState } from 'react';
import { 
  Database, 
  TrendingUp, 
  TrendingDown, 
  Info, 
  ShieldAlert, 
  Calendar, 
  MapPin, 
  Layers, 
  BarChart3,
  SlidersHorizontal,
  FileText
} from 'lucide-react';
import { 
  HISTORICAL_EVENTS, 
  ASSET_HISTORICAL_BEHAVIOR, 
  DATASET_METADATA,
  HistoricalEventRecord 
} from '../data/historicalEventsData';

export const HistoricalDataPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeEventId, setActiveEventId] = useState<string>(HISTORICAL_EVENTS[0].id);

  const categories = ['ALL', 'Category 3', 'Category 4', 'Category 5'];

  const filteredEvents = selectedCategory === 'ALL'
    ? HISTORICAL_EVENTS
    : HISTORICAL_EVENTS.filter(e => e.category === selectedCategory);

  const activeEvent = HISTORICAL_EVENTS.find(e => e.id === activeEventId) || HISTORICAL_EVENTS[0];

  const formatReturn = (val: number) => {
    const sign = val > 0 ? '+' : '';
    return `${sign}${val.toFixed(2)}%`;
  };

  const getReturnClass = (val: number) => {
    if (val > 0.05) return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50';
    if (val < -0.05) return 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/50';
    return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50';
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#0F172A] dark:text-[#F8FAFC] font-sans animate-in fade-in duration-500 pb-16 transition-colors duration-300">
      
      {/* 1. HEADER SECTION */}
      <div className="bg-white dark:bg-slate-900 px-6 lg:px-8 py-10 border-b border-[#E2E8F0] dark:border-slate-800 relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-60 dark:opacity-20" />
        
        <div className="relative z-10 max-w-[1400px] mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-blue-700 dark:text-blue-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-[28px] sm:text-[32px] font-extrabold tracking-tight text-[#0F172A] dark:text-slate-100 leading-none">
                  Historical Data
                </h1>
                <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 mt-1">
                  Historical event reactions across energy assets and market benchmarks
                </p>
              </div>
            </div>

            {/* Contextual Evidence Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-[11px] font-bold">
              <Info className="w-4 h-4 shrink-0" />
              <span>Historical observations are contextual evidence, not forecasts.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 mt-8 space-y-8">
        
        {/* 2. WHY THIS MATTERS SECTION */}
        <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-blue-700 dark:text-blue-400 shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h2 className="text-[14px] font-bold tracking-widest text-[#0F172A] dark:text-slate-100 uppercase">
                WHY THIS MATTERS
              </h2>
              <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
                Historical data provides contextual evidence for scenario analysis. PillerStreet retrieves similar historical events through its RAG layer and uses their observed asset reactions alongside current market, weather and macro signals.
              </p>
              <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 tracking-wide pt-1">
                Historical performance does not guarantee future results.
              </div>
            </div>
          </div>
        </div>

        {/* 3. EVENT TABLE */}
        <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-[16px] font-bold text-[#0F172A] dark:text-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                HISTORICAL EVENT REACTIONS (5D RETURN)
              </h3>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">
                Observed price changes over the 5-day post-event window across monitored assets
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-bold">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    selectedCategory === cat 
                      ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs border border-slate-200/60 dark:border-slate-700' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px] border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-800/50">
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-3">Year</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Region</th>
                  <th className="py-3 px-3 text-right">XOM</th>
                  <th className="py-3 px-3 text-right">CVX</th>
                  <th className="py-3 px-3 text-right">COP</th>
                  <th className="py-3 px-3 text-right">OXY</th>
                  <th className="py-3 px-3 text-right">XLE</th>
                  <th className="py-3 px-3 text-right">SPY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono-tech">
                {filteredEvents.map(evt => {
                  const isSelected = evt.id === activeEventId;
                  return (
                    <tr 
                      key={evt.id}
                      onClick={() => setActiveEventId(evt.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-blue-50/60 dark:bg-blue-950/30' 
                          : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-sans font-bold text-[#0F172A] dark:text-slate-100 flex items-center gap-2">
                        {evt.eventName}
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">{evt.year}</td>
                      <td className="py-3.5 px-3 font-sans">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {evt.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400 font-sans text-[11px] truncate max-w-[200px]" title={evt.region}>
                        {evt.region}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <span className={`inline-block px-1.5 py-0.5 rounded border text-[11px] font-bold ${getReturnClass(evt.returns5d.XOM)}`}>
                          {formatReturn(evt.returns5d.XOM)}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <span className={`inline-block px-1.5 py-0.5 rounded border text-[11px] font-bold ${getReturnClass(evt.returns5d.CVX)}`}>
                          {formatReturn(evt.returns5d.CVX)}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <span className={`inline-block px-1.5 py-0.5 rounded border text-[11px] font-bold ${getReturnClass(evt.returns5d.COP)}`}>
                          {formatReturn(evt.returns5d.COP)}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <span className={`inline-block px-1.5 py-0.5 rounded border text-[11px] font-bold ${getReturnClass(evt.returns5d.OXY)}`}>
                          {formatReturn(evt.returns5d.OXY)}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <span className={`inline-block px-1.5 py-0.5 rounded border text-[11px] font-bold ${getReturnClass(evt.returns5d.XLE)}`}>
                          {formatReturn(evt.returns5d.XLE)}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <span className={`inline-block px-1.5 py-0.5 rounded border text-[11px] font-bold ${getReturnClass(evt.returns5d.SPY)}`}>
                          {formatReturn(evt.returns5d.SPY)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-4">
              <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">LEGEND:</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                Positive 5D Return (&gt; +0.05%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                Negative 5D Return (&lt; -0.05%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-400" />
                Near-Zero / Neutral
              </span>
            </div>
            <div className="text-[10px] font-mono-tech text-slate-400 dark:text-slate-500">
              * Click any row to inspect detail card below
            </div>
          </div>
        </div>

        {/* 4. EVENT DETAIL CARDS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-bold text-[#0F172A] dark:text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              HISTORICAL EVENT DETAIL CARDS
            </h3>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Selected Episode: <span className="font-bold text-blue-600 dark:text-blue-400">{activeEvent.eventName} ({activeEvent.year})</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {HISTORICAL_EVENTS.slice(0, 3).map(evt => {
              const isSelected = evt.id === activeEventId;
              const assetList = [
                { symbol: 'XOM', ret: evt.returns5d.XOM },
                { symbol: 'CVX', ret: evt.returns5d.CVX },
                { symbol: 'COP', ret: evt.returns5d.COP },
                { symbol: 'XLE', ret: evt.returns5d.XLE },
                { symbol: 'SPY', ret: evt.returns5d.SPY },
              ];

              return (
                <div 
                  key={evt.id}
                  onClick={() => setActiveEventId(evt.id)}
                  className={`cursor-pointer bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-sm transition-all duration-200 flex flex-col justify-between ${
                    isSelected 
                      ? 'border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20 shadow-md' 
                      : 'border-[#E2E8F0] dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-[16px] font-bold text-[#0F172A] dark:text-slate-100 leading-snug">
                          {evt.eventName}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="font-semibold">{evt.year}</span>
                          <span>•</span>
                          <span>{evt.region}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {evt.category}
                      </span>
                    </div>

                    <hr className="border-slate-100 dark:border-slate-800 my-3" />

                    {/* Mini Horizontal Comparison Bars */}
                    <div className="space-y-2 mb-4">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                        5D ASSET REACTION BARS
                      </div>
                      {assetList.map(a => {
                        const isPos = a.ret >= 0;
                        const barWidth = Math.min(Math.abs(a.ret) * 10, 100); // 1% = 10% width
                        return (
                          <div key={a.symbol} className="flex items-center text-[11px]">
                            <span className="w-10 font-bold text-slate-700 dark:text-slate-200 font-mono-tech">
                              {a.symbol}
                            </span>
                            <div className="flex-1 h-3.5 bg-slate-100 dark:bg-slate-800 rounded mx-2 overflow-hidden flex items-center">
                              <div 
                                style={{ width: `${barWidth}%` }}
                                className={`h-full rounded transition-all duration-500 ${
                                  isPos 
                                    ? 'bg-emerald-500 dark:bg-emerald-400' 
                                    : 'bg-rose-500 dark:bg-rose-400'
                                }`}
                              />
                            </div>
                            <span className={`w-14 text-right font-mono-tech font-bold ${
                              isPos ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                            }`}>
                              {formatReturn(a.ret)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Historical Observation */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 -mx-5 -mb-5 p-4 rounded-b-xl">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      HISTORICAL OBSERVATION
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                      "{evt.observation}"
                    </p>
                    <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 italic">
                      Correlation is an observation; do not claim causation.
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. ASSET BEHAVIOR SECTION */}
        <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-[16px] font-bold text-[#0F172A] dark:text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                ASSET BEHAVIOR
              </h3>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">
                Historical dataset aggregates across 291 tropical cyclone episodes (2010–2024)
              </p>
            </div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded uppercase tracking-wider">
              DATASET STATISTICS • NOT CURRENT PRICES
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ASSET_HISTORICAL_BEHAVIOR.map(asset => (
              <div 
                key={asset.symbol}
                className="bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-5 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-[18px] font-extrabold text-[#0F172A] dark:text-slate-100 font-mono-tech">
                      {asset.symbol}
                    </div>
                    <div className="text-[12px] font-medium text-slate-600 dark:text-slate-300">
                      {asset.name}
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 uppercase">
                    {asset.sector}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 font-mono-tech">
                  <div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Mean 5D Ret</div>
                    <div className={`text-[14px] font-bold mt-0.5 ${asset.mean5dReturn >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      +{asset.mean5dReturn.toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Volatility</div>
                    <div className="text-[14px] font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {asset.volatility.toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Positive Freq</div>
                    <div className="text-[14px] font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                      {asset.positiveEventFreq.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-[10px] text-slate-400 dark:text-slate-500 text-right">
                  Sample: {asset.eventsCount} events
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. SOURCE & DISCLAIMER FOOTER */}
        <div className="p-6 bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-[12px] text-slate-500 dark:text-slate-400 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 font-semibold">
            <span>Historical dataset: {DATASET_METADATA.totalEvents} tropical cyclone events • {DATASET_METADATA.monitoredAssetsCount} monitored assets</span>
            <span className="font-mono-tech">Assets: {DATASET_METADATA.assets.join(', ')}</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
            Historical observations are for analytical context only and are not investment advice or forecasts. No live prices or trading execution are connected to this reference view.
          </p>
        </div>

      </div>
    </div>
  );
};
