import React, { useState } from 'react';
import { NewsItem } from '../../types';
import { Newspaper, Filter, Search, Tag, ExternalLink } from 'lucide-react';

interface NewsIntelligenceFeedProps {
  news: NewsItem[];
  onSelectAsset?: (symbol: string) => void;
}

export const NewsIntelligenceFeed: React.FC<NewsIntelligenceFeedProps> = ({
  news,
  onSelectAsset,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterSentiment, setFilterSentiment] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', 'Macro', 'Energy', 'Technology', 'Geopolitics'];
  const sentiments = ['All', 'BULLISH', 'BEARISH', 'NEUTRAL'];

  const filteredNews = news.filter((item) => {
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    const matchesSentiment = filterSentiment === 'All' || item.sentiment === filterSentiment;
    const matchesSearch =
      !searchQuery ||
      item.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.snippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSentiment && matchesSearch;
  });

  const getSentimentBadge = (sentiment: NewsItem['sentiment']) => {
    switch (sentiment) {
      case 'BEARISH':
        return <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 font-bold border border-rose-500/30 text-[9px] font-mono-data">BEARISH</span>;
      case 'BULLISH':
        return <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30 text-[9px] font-mono-data">BULLISH</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px] font-mono-data">NEUTRAL</span>;
    }
  };

  const getImportanceBadge = (importance: NewsItem['importance']) => {
    switch (importance) {
      case 'CRITICAL':
        return <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white font-bold text-[9px] font-mono-data pulse-dot">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 text-[9px] font-mono-data">HIGH</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded bg-[#13192a] text-slate-400 text-[9px] font-mono-data">STD</span>;
    }
  };

  return (
    <div className="terminal-card p-4 rounded flex flex-col justify-between h-full select-none">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-[#1e2333] gap-2">
          <div className="flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-[#00f0ff]" />
            <h2 className="text-xs font-bold text-slate-100 tracking-wider uppercase font-mono-data">
              LIVE MULTI-WIRE NEWS INTELLIGENCE
            </h2>
            <span className="px-2 py-0.5 rounded bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 text-[9px] font-mono-data">
              REAL-TIME NLP FEED
            </span>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search wire news..."
              className="bg-[#080a10] text-slate-200 placeholder-slate-500 pl-8 pr-3 py-1 rounded border border-[#1e2333] focus:border-[#00f0ff]/40 text-xs font-mono-data outline-none"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-[#181e2e]">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar font-mono-data text-[10px]">
            <span className="text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-cyan-400" /> CATEGORY:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  filterCategory === cat
                    ? 'bg-[#141a2a] text-[#00f0ff] font-bold border border-[#00f0ff]/30'
                    : 'text-slate-400 hover:text-slate-200 bg-[#080a10]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 font-mono-data text-[10px]">
            <span className="text-slate-500 mr-1">SENTIMENT:</span>
            {sentiments.map((s) => (
              <button
                key={s}
                onClick={() => setFilterSentiment(s)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  filterSentiment === s
                    ? 'bg-[#141a2a] text-[#00f0ff] font-bold border border-[#00f0ff]/30'
                    : 'text-slate-400 hover:text-slate-200 bg-[#080a10]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* News Stream List */}
        <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
          {filteredNews.map((item) => (
            <div
              key={item.id}
              className="bg-[#090b12] hover:bg-[#0f1424] p-3 rounded border border-[#1e2333] hover:border-[#00f0ff]/40 transition-colors group"
            >
              <div className="flex items-center justify-between text-[10px] font-mono-data text-slate-400 mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-bold">{item.timestamp}</span>
                  <span className="text-cyan-400 font-semibold">{item.source}</span>
                  <span className="text-slate-500">• {item.category}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {getImportanceBadge(item.importance)}
                  {getSentimentBadge(item.sentiment)}
                </div>
              </div>

              <h3 className="text-xs font-bold text-slate-100 group-hover:text-[#00f0ff] transition-colors mb-1 font-sans leading-snug">
                {item.headline}
              </h3>

              <p className="text-[11px] text-slate-400 leading-relaxed font-sans mb-2">
                {item.snippet}
              </p>

              {/* Affected Assets & Confidence */}
              <div className="flex items-center justify-between pt-2 border-t border-[#171c2b] text-[10px] font-mono-data">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Tag className="w-3 h-3 text-slate-500" />
                  <span className="text-slate-500">AFFECTED:</span>
                  {item.affectedAssets.map((asset) => (
                    <button
                      key={asset}
                      onClick={() => onSelectAsset?.(asset)}
                      className="px-1.5 py-0.5 rounded bg-[#121828] hover:bg-[#182036] text-slate-300 hover:text-cyan-300 border border-[#212940] transition-colors"
                    >
                      {asset}
                    </button>
                  ))}
                </div>

                <div className="text-slate-400">
                  NLP CONF: <span className="text-emerald-400 font-bold">{item.confidence}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
