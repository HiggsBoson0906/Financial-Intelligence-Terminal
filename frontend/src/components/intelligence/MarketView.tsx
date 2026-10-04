import React from 'react';
import { QueryResponse } from '../../types/api';
import { curatedNews } from '../../data/curatedNews';
import { Brain, Radio, MessageSquare, AlertCircle, Activity } from 'lucide-react';
import { defaultTickers } from '../ticker/GlobalMarketTicker';

export const MarketView: React.FC<{
  selectedAsset: string | null;
  onSelectAsset: (asset: string) => void;
  isSimulation: boolean;
  data?: QueryResponse | null;
}> = ({ data }) => {

  const sentiment = data?.sentiment;
  const hasFinbert = Boolean(sentiment?.overall_sentiment && sentiment?.status !== 'fallback' && sentiment?.status !== 'unavailable' && sentiment?.model === 'ProsusAI/finbert');
  
  // Try to use real FinBERT values if available and valid
  const isPositive = sentiment?.overall_sentiment === 'positive';
  const isNegative = sentiment?.overall_sentiment === 'negative';
  
  const overallSignal = hasFinbert ? 
    (isPositive ? 'POSITIVE' : isNegative ? 'NEGATIVE' : 'NEUTRAL') 
    : 'MIXED / NEUTRAL';

  // Extract query semantics
  const queryStr = data?.query || '';
  const eventName = data?.event?.event_name && data.event.event_name !== 'Not specified' ? data.event.event_name : (data?.event?.event_type && data.event.event_type !== 'Not specified' ? data.event.event_type : 'Not specified');
  const regionName = data?.event?.region && data.event.region !== 'Not specified' ? data.event.region : 'Not specified';
  
  // We can derive assets from query or market_context
  const assets = data?.market_context ? Object.keys(data.market_context).join(' · ') : 'XOM · CVX · COP';

  return (
    <div className="w-full h-full p-6 flex flex-col animate-in fade-in duration-200 bg-white dark:bg-[#111827] rounded-xl border border-[#E2E8F0] dark:border-[#1F2937] text-[#0F172A] dark:text-[#F8FAFC] font-sans overflow-hidden shadow-sm">
      
      <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#F1F5F9] dark:border-[#1F2937]">
        <h3 className="text-[18px] font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-widest flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          SEMANTIC MARKET ANALYSIS
        </h3>
        {!hasFinbert && (
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 border border-[#E2E8F0] dark:border-[#1F2937] bg-[#F8FAFC] dark:bg-[#1E293B] px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            SEMANTIC MODEL UNAVAILABLE
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 flex-1 min-h-0">
        
        {/* LEFT COLUMN: QUERY SEMANTICS & NEWS SIGNAL */}
        <div className="col-span-1 md:col-span-4 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
          
          {/* NEWS SIGNAL */}
          <div className="bg-[#F8FAFC] dark:bg-[#161F30] border border-[#E2E8F0] dark:border-[#1F2937] rounded-lg p-4">
            <div className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5" />
              NEWS SIGNAL
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className={`text-[24px] font-mono-tech leading-none ${
                  overallSignal === 'POSITIVE' ? 'text-green-600 dark:text-green-400' :
                  overallSignal === 'NEGATIVE' ? 'text-red-600 dark:text-red-400' :
                  'text-amber-500 dark:text-amber-400'
                }`}>
                  {overallSignal}
                </div>
              </div>

              {hasFinbert && sentiment?.positive !== undefined && (
                <div className="flex justify-between items-center text-[11px] font-mono-tech mt-2">
                  <div className="flex flex-col text-green-600 dark:text-green-400"><span>POS</span><span>{(sentiment.positive * 100).toFixed(1)}%</span></div>
                  <div className="flex flex-col text-[#64748B] dark:text-[#94A3B8]"><span>NEU</span><span>{(sentiment.neutral * 100).toFixed(1)}%</span></div>
                  <div className="flex flex-col text-red-600 dark:text-red-400"><span>NEG</span><span>{(sentiment.negative * 100).toFixed(1)}%</span></div>
                </div>
              )}
            </div>
          </div>

          {/* QUERY SEMANTICS */}
          <div className="bg-[#F8FAFC] dark:bg-[#161F30] border border-[#E2E8F0] dark:border-[#1F2937] rounded-lg p-4">
            <div className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest mb-4">
              QUERY SEMANTICS
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="text-[10px] text-[#94A3B8] dark:text-[#64748B] uppercase font-bold">Event</span>
                <span className="text-[13px] text-[#0F172A] dark:text-[#F8FAFC] font-medium">{eventName}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[#94A3B8] dark:text-[#64748B] uppercase font-bold">Region</span>
                <span className="text-[13px] text-[#0F172A] dark:text-[#F8FAFC] font-medium">{regionName}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[#94A3B8] dark:text-[#64748B] uppercase font-bold">Asset Focus</span>
                <span className="text-[13px] text-blue-600 dark:text-blue-400 font-medium">{assets}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[#94A3B8] dark:text-[#64748B] uppercase font-bold">Risk Theme</span>
                <span className="text-[13px] text-[#0F172A] dark:text-[#F8FAFC] font-medium">Energy Supply / Market Volatility</span>
              </div>
            </div>
          </div>

          {/* MARKET SIGNALS HEATMAP */}
          <div className="bg-[#F8FAFC] dark:bg-[#161F30] border border-[#E2E8F0] dark:border-[#1F2937] rounded-lg p-4">
            <div className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              MARKET SIGNALS
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {defaultTickers.map(t => (
                <div key={t.symbol} className={`flex items-center justify-between p-2 border rounded shadow-sm bg-white dark:bg-[#1E293B] ${
                  t.isPositive ? 'border-green-200 dark:border-green-800/40' : 'border-red-200 dark:border-red-800/40'
                }`}>
                   <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{t.symbol}</span>
                   <span className={`text-[10px] font-mono-tech font-bold ${t.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                     {t.change}
                   </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: ARTICLE BREAKDOWN */}
        <div className="col-span-1 md:col-span-8 flex flex-col min-h-0">
          <div className="flex justify-between items-center mb-3">
             <div className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest flex items-center gap-1.5">
               <MessageSquare className="w-3.5 h-3.5" />
               ARTICLE BREAKDOWN
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
            {curatedNews.map((article, idx) => (
              <div key={idx} className="bg-white dark:bg-[#161F30] border border-[#E2E8F0] dark:border-[#1F2937] hover:border-[#CBD5E1] dark:hover:border-[#334155] hover:shadow-sm transition-all rounded-lg p-4 flex flex-col gap-2">
                
                <div className="flex justify-between items-start">
                  <h4 className="text-[14px] font-bold text-[#0F172A] dark:text-[#F8FAFC] leading-snug w-[75%]">{article.headline}</h4>
                  
                  {/* Sentiment Badge */}
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase border ${
                    article.sentiment === 'BULLISH' ? 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50' :
                    article.sentiment === 'BEARISH' ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50' :
                    'bg-[#F8FAFC] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] border-[#E2E8F0] dark:border-[#334155]'
                  }`}>
                    {hasFinbert ? 'MODEL INF' : 'ANALYST TAG'}: {article.sentiment}
                  </span>
                </div>
                
                <p className="text-[12px] text-[#475569] dark:text-[#94A3B8] line-clamp-1">{article.summary}</p>
                
                <div className="flex justify-between items-end mt-2 pt-2 border-t border-[#F1F5F9] dark:border-[#1F2937]">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-[#94A3B8] dark:text-[#64748B] uppercase tracking-widest">AFFECTED ASSETS</span>
                    <span className="text-[11px] font-mono-tech text-blue-600 dark:text-blue-400 mt-0.5">{article.affectedAssets.join(' · ')}</span>
                  </div>
                  <div className="text-[9px] text-[#64748B] dark:text-[#94A3B8] font-mono-tech uppercase">
                    SOURCE: {article.source}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-[#E2E8F0] dark:border-[#1F2937]">
             <div className="text-[10px] text-[#94A3B8] dark:text-[#64748B] uppercase tracking-widest mb-1.5">TOP THEMES IDENTIFIED</div>
             <div className="flex flex-wrap gap-2">
               {['Energy Supply', 'Geopolitical Risk', 'Oil Markets', 'Macro Conditions'].map(theme => (
                 <span key={theme} className="text-[10px] bg-[#F1F5F9] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#475569] dark:text-[#CBD5E1] px-2 py-1 rounded">
                   {theme}
                 </span>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
