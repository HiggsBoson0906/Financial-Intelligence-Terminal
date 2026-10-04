import React, { useState, useMemo } from 'react';
import { ExternalLink, Search } from 'lucide-react';
import { curatedNews } from '../data/curatedNews';

export const NewsPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['ALL', 'ENERGY', 'MARKETS', 'MACRO', 'CORPORATE'];

  const filteredNews = useMemo(() => {
    return curatedNews.filter(item => {
      const matchCat = activeCategory === 'ALL' || item.category.toUpperCase() === activeCategory;
      const matchSearch = searchQuery === '' || 
        item.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.affectedAssets.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  const featuredStory = filteredNews.length > 0 ? filteredNews[0] : null;
  const secondaryStories = filteredNews.length > 1 ? filteredNews.slice(1, 4) : [];

  return (
    <div className="w-full bg-[#F8FAFC] dark:bg-[#0B0F19] min-h-[calc(100vh-64px)] text-[#0F172A] dark:text-[#F8FAFC] font-sans animate-in fade-in duration-500 pb-12 transition-colors duration-300">
      
      {/* 1. STATUS BAR */}
      <div className="bg-white dark:bg-slate-900 px-6 py-1.5 flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-[#64748B] dark:text-slate-400 border-b border-[#E2E8F0] dark:border-slate-800">
        <div className="flex gap-4 items-center">
          <span className="text-slate-500 dark:text-slate-400">BLOOMBERG SOURCE</span>
          <span className="text-slate-500 dark:text-slate-400">STATIC FEED</span>
        </div>
        <div>
          UPDATED: {new Date('2026-10-01T08:00:00Z').toLocaleString()}
        </div>
      </div>

      {/* 2. PRIMARY NEWS HEADER */}
      <div className="px-6 py-8 border-b border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900">
        <h1 className="text-[36px] font-bold tracking-tight text-[#0F172A] dark:text-slate-100 leading-none">
          NEWS <span className="text-[#94A3B8] dark:text-slate-500 font-light text-[24px]">| MARKET INTELLIGENCE</span>
        </h1>
        
        {/* Ticker / Search */}
        <div className="flex items-center justify-between mt-8 flex-wrap gap-4">
          <div className="flex gap-6 text-[12px] font-mono-tech">
            <div className="flex gap-2"><span className="text-[#64748B] dark:text-slate-400">S&P 500</span><span className="text-red-600 dark:text-red-400 font-medium">5,820.14 ▼</span></div>
            <div className="flex gap-2"><span className="text-[#64748B] dark:text-slate-400">WTI</span><span className="text-green-600 dark:text-emerald-400 font-medium">$82.40 ▲</span></div>
            <div className="flex gap-2"><span className="text-[#64748B] dark:text-slate-400">BRENT</span><span className="text-green-600 dark:text-emerald-400 font-medium">$86.15 ▲</span></div>
            <div className="flex gap-2"><span className="text-[#64748B] dark:text-slate-400">VIX</span><span className="text-red-600 dark:text-red-400 font-medium">18.50 ▲</span></div>
          </div>
          
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] dark:text-slate-500" />
            <input 
              type="text" 
              placeholder="Search news..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 text-[#0F172A] dark:text-slate-100 placeholder-[#94A3B8] dark:placeholder-slate-500 rounded-sm pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow w-64 shadow-sm"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-6 mt-8 text-[11px] font-bold tracking-widest overflow-x-auto">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`pb-2 border-b-2 transition-colors whitespace-nowrap ${activeCategory === cat ? 'border-blue-600 dark:border-blue-500 text-[#0F172A] dark:text-slate-100' : 'border-transparent text-[#64748B] dark:text-slate-400 hover:text-[#334155] dark:hover:text-slate-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-8 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT: FEATURED STORY */}
          <div className="lg:col-span-5 pr-6 border-r border-[#E2E8F0] dark:border-slate-800">
            {featuredStory ? (
              <div className="group">
                <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">
                  {featuredStory.category}
                </div>
                <h2 className="text-[36px] font-bold leading-[1.1] mb-4 text-[#0F172A] dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors cursor-pointer">
                  {featuredStory.headline}
                </h2>
                <p className="text-[15px] text-[#475569] dark:text-slate-300 leading-relaxed mb-6">
                  {featuredStory.summary}
                </p>
                <div className="flex items-center justify-between border-t border-[#E2E8F0] dark:border-slate-800 pt-4">
                  <div className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
                    {featuredStory.source} • {new Date(featuredStory.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <a href={featuredStory.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 uppercase tracking-wider">
                    READ SOURCE <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                {/* Why it Matters Block */}
                <div className="mt-6 bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 p-5 rounded-md shadow-sm">
                  <h3 className="text-[11px] font-bold text-[#0F172A] dark:text-slate-100 uppercase tracking-widest mb-3">WHY IT MATTERS</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {featuredStory.affectedAssets.map(a => (
                      <span key={a} className="bg-slate-50 dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 px-2 py-0.5 text-[10px] font-bold rounded-sm text-[#475569] dark:text-slate-300 shadow-sm">{a}</span>
                    ))}
                  </div>
                  <div className="text-[12px] text-[#64748B] dark:text-slate-400 flex items-center gap-2">
                    Analyst Tag: 
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${
                      featuredStory.sentiment === 'BULLISH' ? 'bg-green-100 dark:bg-emerald-950/60 text-green-700 dark:text-emerald-400 border border-green-200 dark:border-emerald-800' : 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                    }`}>
                      {featuredStory.sentiment}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-[#64748B] dark:text-slate-400 text-sm">No stories found matching your criteria.</div>
            )}
          </div>

          {/* CENTER: SECONDARY STORIES */}
          <div className="lg:col-span-4 pr-6 border-r border-[#E2E8F0] dark:border-slate-800 flex flex-col gap-8">
            {secondaryStories.map((story, idx) => (
              <div key={story.id} className={`group ${idx !== secondaryStories.length - 1 ? 'border-b border-[#E2E8F0] dark:border-slate-800 pb-8' : ''}`}>
                <div className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-widest mb-2">
                  {story.category}
                </div>
                <h3 className="text-[20px] font-bold leading-tight mb-2 text-[#0F172A] dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors cursor-pointer">
                  {story.headline}
                </h3>
                <p className="text-[13px] text-[#475569] dark:text-slate-300 leading-relaxed mb-4 line-clamp-2">
                  {story.summary}
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
                    {story.source} • {new Date(story.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <a href={story.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 uppercase tracking-wider">
                    READ <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: MARKET INTELLIGENCE RAIL */}
          <div className="lg:col-span-3">
            <h3 className="text-[11px] font-bold text-[#0F172A] dark:text-slate-100 uppercase tracking-widest border-b border-[#E2E8F0] dark:border-slate-800 pb-2 mb-4">MARKET SNAPSHOT</h3>
            <div className="space-y-3 mb-10">
              <div className="flex justify-between items-center text-[12px]"><span className="text-[#64748B] dark:text-slate-400 font-semibold">ENERGY</span><span className="text-green-600 dark:text-emerald-400 font-mono-tech font-semibold">+1.24%</span></div>
              <div className="flex justify-between items-center text-[12px]"><span className="text-[#64748B] dark:text-slate-400 font-semibold">GLOBAL MARKETS</span><span className="text-red-600 dark:text-red-400 font-mono-tech font-semibold">-0.45%</span></div>
              <div className="flex justify-between items-center text-[12px]"><span className="text-[#64748B] dark:text-slate-400 font-semibold">MACRO</span><span className="text-red-600 dark:text-red-400 font-mono-tech font-semibold">VIX +2.1%</span></div>
            </div>

            <h3 className="text-[11px] font-bold text-[#0F172A] dark:text-slate-100 uppercase tracking-widest border-b border-[#E2E8F0] dark:border-slate-800 pb-2 mb-4">MARKET MOVERS</h3>
            <div className="space-y-3 mb-10">
              <div className="flex justify-between items-center text-[12px]"><span className="text-[#0F172A] dark:text-slate-100 font-bold">XOM</span><span className="text-green-600 dark:text-emerald-400 font-mono-tech font-semibold">+1.8%</span></div>
              <div className="flex justify-between items-center text-[12px]"><span className="text-[#0F172A] dark:text-slate-100 font-bold">CVX</span><span className="text-green-600 dark:text-emerald-400 font-mono-tech font-semibold">+1.4%</span></div>
              <div className="flex justify-between items-center text-[12px]"><span className="text-[#0F172A] dark:text-slate-100 font-bold">COP</span><span className="text-green-600 dark:text-emerald-400 font-mono-tech font-semibold">+2.1%</span></div>
              <div className="flex justify-between items-center text-[12px]"><span className="text-[#0F172A] dark:text-slate-100 font-bold">SPY</span><span className="text-red-600 dark:text-red-400 font-mono-tech font-semibold">-0.8%</span></div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 p-5 rounded-md shadow-sm">
              <h3 className="text-[11px] font-bold text-[#0F172A] dark:text-slate-100 uppercase tracking-widest mb-1">YOUR PORTFOLIO</h3>
              <div className="text-[28px] font-bold text-[#0F172A] dark:text-slate-100 mb-4 font-mono-tech tracking-tight">$10,000,000</div>
              
              <div className="space-y-3 pt-4 border-t border-[#E2E8F0] dark:border-slate-800">
                <div className="flex justify-between items-center text-[12px]">
                  <span className="text-[#64748B] dark:text-slate-400 font-semibold">Energy Exposure</span>
                  <span className="text-[#0F172A] dark:text-slate-100 font-mono-tech font-bold">90.0%</span>
                </div>
                <div className="flex justify-between items-center text-[12px]">
                  <span className="text-[#64748B] dark:text-slate-400 font-semibold">Holdings</span>
                  <span className="text-[#0F172A] dark:text-slate-100 font-mono-tech font-bold">6</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
