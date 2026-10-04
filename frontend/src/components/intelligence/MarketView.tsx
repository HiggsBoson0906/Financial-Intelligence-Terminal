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
  const hasFinbert = sentiment?.overall_sentiment !== undefined && sentiment?.status !== 'fallback' && sentiment?.model === 'ProsusAI/finbert';
  
  // Try to use real FinBERT values if available and valid
  const isPositive = sentiment?.overall_sentiment === 'positive';
  const isNegative = sentiment?.overall_sentiment === 'negative';
  
  const overallSignal = hasFinbert ? 
    (isPositive ? 'POSITIVE' : isNegative ? 'NEGATIVE' : 'NEUTRAL') 
    : 'MIXED / NEUTRAL';

  // Extract query semantics
  const queryStr = data?.query || '';
  const eventName = data?.event?.event_name || 'Hurricane';
  const regionName = data?.event?.region || 'US Gulf Coast';
  
  // We can derive assets from query or market_context
  const assets = data?.market_context ? Object.keys(data.market_context).join(' · ') : 'XOM · CVX · COP';

  return (
    <div className="w-full h-full p-6 flex flex-col animate-in fade-in duration-200 bg-white rounded-xl border border-[#E2E8F0] text-[#0F172A] font-sans overflow-hidden shadow-sm">
      
      <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#F1F5F9]">
        <h3 className="text-[18px] font-bold text-[#0F172A] uppercase tracking-widest flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-600" />
          SEMANTIC MARKET ANALYSIS
        </h3>
        {!hasFinbert && (
          <span className="text-[10px] font-bold text-slate-500 border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            SEMANTIC MODEL UNAVAILABLE
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 flex-1 min-h-0">
        
        {/* LEFT COLUMN: QUERY SEMANTICS & NEWS SIGNAL */}
        <div className="col-span-1 md:col-span-4 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
          
          {/* NEWS SIGNAL */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4">
            <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5" />
              NEWS SIGNAL
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className={`text-[24px] font-mono-tech leading-none ${
                  overallSignal === 'POSITIVE' ? 'text-green-600' :
                  overallSignal === 'NEGATIVE' ? 'text-red-600' :
                  'text-amber-500'
                }`}>
                  {overallSignal}
                </div>
              </div>

              {hasFinbert && sentiment?.positive !== undefined && (
                <div className="flex justify-between items-center text-[11px] font-mono-tech mt-2">
                  <div className="flex flex-col text-green-600"><span>POS</span><span>{(sentiment.positive * 100).toFixed(1)}%</span></div>
                  <div className="flex flex-col text-[#64748B]"><span>NEU</span><span>{(sentiment.neutral * 100).toFixed(1)}%</span></div>
                  <div className="flex flex-col text-red-600"><span>NEG</span><span>{(sentiment.negative * 100).toFixed(1)}%</span></div>
                </div>
              )}
            </div>
          </div>

          {/* QUERY SEMANTICS */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4">
            <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest mb-4">
              QUERY SEMANTICS
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="text-[10px] text-[#94A3B8] uppercase font-bold">Event</span>
                <span className="text-[13px] text-[#0F172A] font-medium">{eventName}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[#94A3B8] uppercase font-bold">Region</span>
                <span className="text-[13px] text-[#0F172A] font-medium">{regionName}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[#94A3B8] uppercase font-bold">Asset Focus</span>
                <span className="text-[13px] text-blue-600 font-medium">{assets}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[#94A3B8] uppercase font-bold">Risk Theme</span>
                <span className="text-[13px] text-[#0F172A] font-medium">Energy Supply / Market Volatility</span>
              </div>
            </div>
          </div>

          {/* MARKET SIGNALS HEATMAP */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4">
            <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              MARKET SIGNALS
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {defaultTickers.map(t => (
                <div key={t.symbol} className={`flex items-center justify-between p-2 border rounded shadow-sm bg-white ${t.isPositive ? 'border-green-200' : 'border-red-200'}`}>
                   <span className="text-[10px] font-bold text-slate-700">{t.symbol}</span>
                   <span className={`text-[10px] font-mono-tech font-bold ${t.isPositive ? 'text-green-600' : 'text-red-600'}`}>
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
             <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest flex items-center gap-1.5">
               <MessageSquare className="w-3.5 h-3.5" />
               ARTICLE BREAKDOWN
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
            {curatedNews.map((article, idx) => (
              <div key={idx} className="bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] hover:shadow-sm transition-all rounded-lg p-4 flex flex-col gap-2">
                
                <div className="flex justify-between items-start">
                  <h4 className="text-[14px] font-bold text-[#0F172A] leading-snug w-[75%]">{article.headline}</h4>
                  
                  {/* Sentiment Badge */}
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase border ${
                    article.sentiment === 'BULLISH' ? 'bg-green-50 text-green-700 border-green-200' :
                    article.sentiment === 'BEARISH' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]'
                  }`}>
                    {hasFinbert ? 'MODEL INF' : 'ANALYST TAG'}: {article.sentiment}
                  </span>
                </div>
                
                <p className="text-[12px] text-[#475569] line-clamp-1">{article.summary}</p>
                
                <div className="flex justify-between items-end mt-2 pt-2 border-t border-[#F1F5F9]">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-[#94A3B8] uppercase tracking-widest">AFFECTED ASSETS</span>
                    <span className="text-[11px] font-mono-tech text-blue-600 mt-0.5">{article.affectedAssets.join(' · ')}</span>
                  </div>
                  <div className="text-[9px] text-[#64748B] font-mono-tech uppercase">
                    SOURCE: {article.source}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-[#E2E8F0]">
             <div className="text-[10px] text-[#94A3B8] uppercase tracking-widest mb-1.5">TOP THEMES IDENTIFIED</div>
             <div className="flex flex-wrap gap-2">
               {['Energy Supply', 'Geopolitical Risk', 'Oil Markets', 'Macro Conditions'].map(theme => (
                 <span key={theme} className="text-[10px] bg-[#F1F5F9] border border-[#E2E8F0] text-[#475569] px-2 py-1 rounded">
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
