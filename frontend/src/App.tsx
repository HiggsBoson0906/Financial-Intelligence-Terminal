import { useState, useEffect, useRef } from 'react';
import { ActivePage } from './types';
import { TopNav } from './components/layout/TopNav';
import { QueryBar } from './components/layout/QueryBar';
import { GlobalMarketTicker } from './components/ticker/GlobalMarketTicker';
import { IntelligenceStream } from './components/intelligence/IntelligenceStream';
import { EventImpactMap } from './components/intelligence/EventImpactMap';
import { AnalyticalChain } from './components/intelligence/AnalyticalChain';
import { DecisionIntelligence } from './components/intelligence/DecisionIntelligence';
import { AgentAnalysisSection } from './components/bottom/AgentAnalysisSection';
import { ScenarioLabSection } from './components/bottom/ScenarioLabSection';

import { SourcesAndData } from './components/intelligence/SourcesAndData';
import { AiIntelligenceBrief } from './components/intelligence/AiIntelligenceBrief';
import { MarketView } from './components/intelligence/MarketView';
import { RiskView } from './components/intelligence/RiskView';
import { useAnalysisQuery } from './hooks/useAnalysisQuery';
import { PortfolioPage } from './pages/PortfolioPage';
import { NewsPage } from './pages/NewsPage';
import { WeatherPage } from './pages/WeatherPage';
import { curatedNews } from './data/curatedNews';

export function App() {
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [currentTime, setCurrentTime] = useState<string>('12:43:08 EST');

  // Real Query State
  const { data: queryData, status: queryStatus, error: queryError, runQuery } = useAnalysisQuery();

  const analysisWorkspaceRef = useRef<HTMLDivElement>(null);

  // Live clock simulation
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kolkata',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      });
      const dateStr = now.toLocaleDateString('en-US', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).toUpperCase();
      setCurrentTime(`${dateStr} | ${timeStr} IST`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle Query Execution
  const handleRunAnalysis = (query: string) => {
    runQuery(query);
  };

  useEffect(() => {
    if (queryStatus === 'RUNNING' || queryStatus === 'COMPLETED') {
      setTimeout(() => {
        analysisWorkspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [queryStatus]);

  const renderNormalTerminal = () => (
    <div className="transition-all duration-500">
      
      {/* GLOBAL MARKET TICKER */}
      <GlobalMarketTicker onSelectTicker={() => {}} />

      {/* MAIN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mt-6">
        
        {/* PERMANENT EVENT MAP */}
        <div className="lg:col-span-8 fit-card p-0 flex flex-col justify-between h-[600px] overflow-hidden relative">
          <EventImpactMap onOpenInfrastructureModal={() => {}} isExpanded={false} onToggleExpand={() => {}} />
        </div>
        
        {/* SYNTHETIC PORTFOLIO SNAPSHOT */}
        <div className="lg:col-span-4 fit-card p-6 h-[600px] flex flex-col overflow-y-auto">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
             <h3 className="font-bold text-slate-900">Portfolio Snapshot</h3>
          </div>
          <p className="text-sm text-slate-600 mb-6">
            $10M synthetic energy-heavy portfolio (XOM 30%, CVX 20%, COP 20%, OXY 10%, XLE 10%, SPY 10%).
          </p>
          
          <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
             <div className="text-xs font-bold text-slate-500 mb-2 uppercase">Current Risk (VaR)</div>
             <div className="text-2xl font-bold text-red-600">$450,000</div>
          </div>

          <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
             <div className="text-xs font-bold text-slate-500 mb-2 uppercase">Energy Exposure</div>
             <div className="text-xl font-bold text-slate-900">90%</div>
          </div>

          <div className="flex justify-center mt-auto">
            <button onClick={() => setActivePage('portfolio')} className="w-full py-2.5 bg-slate-100 text-slate-700 font-bold rounded hover:bg-slate-200 text-sm border border-slate-300">
              VIEW FULL PORTFOLIO & RISK
            </button>
          </div>
        </div>
      </div>

      {/* COMPACT WIDGETS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* News Widget */}
        <div className="fit-card p-6 flex flex-col h-[380px]">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
             <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">LATEST MARKET NEWS</h3>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {curatedNews.slice(0, 3).map((story, i) => (
              <div key={i} className="border-b border-slate-100 pb-3 last:border-0">
                <div className="text-[10px] font-bold text-blue-600 uppercase mb-1">{story.category}</div>
                <div className="font-bold text-sm text-slate-900 mb-1 leading-snug">{story.headline}</div>
                <div className="text-xs text-slate-500 flex justify-between">
                  <span>{story.source}</span>
                  <span>{new Date(story.publishedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4 mt-auto border-t border-slate-200">
            <button onClick={() => setActivePage('news')} className="w-full py-2 text-blue-600 font-bold hover:text-blue-800 text-xs">
              VIEW ALL NEWS &rarr;
            </button>
          </div>
        </div>

        {/* Weather Widget */}
        <div className="fit-card p-0 flex flex-col h-[380px] border border-[#E2E8F0] relative overflow-hidden bg-gradient-to-b from-sky-300 to-sky-100 rounded-lg">
          
          {/* Cloud Visual Elements */}
          <div className="absolute top-[-30px] right-[-30px] opacity-60 pointer-events-none animate-[pulse-subtle_8s_ease-in-out_infinite]">
            <svg width="250" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-white w-64 h-64 drop-shadow-xl">
              <path d="M17.5 19a4.5 4.5 0 0 0 2.9-7.9c-.3-4.2-3.8-7.1-7.9-7.1-3.6 0-6.7 2.4-7.6 5.8A4.5 4.5 0 0 0 5.5 19h12z" fill="#ffffff" stroke="none" />
            </svg>
          </div>

          <div className="flex flex-col h-full relative z-10 p-6">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/40">
               <h3 className="font-bold text-[#0F172A] text-sm uppercase tracking-wider flex items-center gap-2">
                 ACTIVE WEATHER
               </h3>
               <span className="text-[10px] font-bold text-blue-900 bg-white/30 px-2 py-0.5 rounded uppercase tracking-wider border border-white/50 backdrop-blur-md">
                 INDIA WEATHER
               </span>
            </div>
            <div className="flex-1 flex flex-col justify-center items-center">
               <div className="text-[10px] text-blue-900/80 font-bold tracking-widest uppercase mb-2">Regional Conditions</div>
               <div className="w-full bg-white/40 border border-white/50 rounded-lg p-5 backdrop-blur-md text-center shadow-sm">
                 <div className="text-[28px] font-bold text-[#0F172A] mb-1 tracking-widest leading-none">CLEAR SKY</div>
                 <div className="text-[12px] text-[#475569] font-mono-tech mt-2 uppercase">0 ACTIVE SEVERE ALERTS</div>
               </div>
            </div>
            <div className="pt-4 mt-auto border-t border-white/40">
              <button onClick={() => setActivePage('weather')} className="w-full py-2.5 text-[#0F172A] font-bold hover:bg-white/50 text-xs bg-white/40 rounded border border-white/50 shadow-sm transition-colors">
                VIEW WEATHER INTELLIGENCE &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans">
      <TopNav activePage={activePage} setActivePage={setActivePage} currentTime={currentTime} />

      <main className="flex-1 max-w-[1720px] w-full mx-auto p-5 md:p-6 space-y-5 md:space-y-6">
        <QueryBar onRunAnalysis={handleRunAnalysis} isLoading={queryStatus === 'RUNNING'} />

        {queryStatus === 'ERROR' && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 font-mono text-sm mt-6">
            <div className="font-bold mb-2">ANALYSIS FAILED</div>
            <div>{queryError}</div>
          </div>
        )}

        {/* ACTIVE QUERY WORKSPACE - ONLY SHOW ON HOME */}
        {activePage === 'home' && (queryStatus === 'RUNNING' || queryStatus === 'COMPLETED') && (
          <div ref={analysisWorkspaceRef} className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* 1. QUERY STATUS / RUN INFORMATION */}
            <div className="flex items-center justify-between text-xs font-mono text-gray-500 pb-2 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="uppercase tracking-wider font-bold">STATUS:</span>
                  <span className={queryStatus === 'RUNNING' ? 'text-amber-600 font-bold' : 'text-green-600 font-bold'}>
                    {queryStatus === 'RUNNING' ? 'ANALYSIS IN PROGRESS...' : 'COMPLETED'}
                  </span>
                </div>
                {queryData?.run_id && (
                  <div>RUN_ID: {queryData.run_id}</div>
                )}
              </div>
              {queryData?.latency && (
                <div>LATENCY: {queryData.latency.total_ms.toFixed(0)}ms</div>
              )}
            </div>

            {queryStatus === 'COMPLETED' && queryData && (
              <>
                {/* 2. AI INTELLIGENCE BRIEF */}
                <div className="w-full">
                  <AiIntelligenceBrief data={queryData} />
                </div>

                {/* 3. EVENT + PORTFOLIO IMPACT */}
                <div className="w-full fit-card p-6 h-[500px] flex flex-col">
                  <EventImpactMap
                    data={queryData}
                    isExpanded={false}
                    onToggleExpand={() => {}}
                  />
                </div>

                {/* 4. AGENT EXECUTION */}
                <div className="w-full">
                  <AgentAnalysisSection data={queryData} />
                </div>

                {/* 5 & 6. SEMANTIC & RISK ANALYSIS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="w-full h-[450px]">
                    <MarketView selectedAsset="WTI" onSelectAsset={() => {}} isSimulation={queryData?.data_quality?.overall_status !== 'good'} data={queryData} />
                  </div>
                  <div className="w-full h-[450px]">
                    <RiskView isSimulation={queryData?.data_quality?.overall_status !== 'good'} selectedAsset="WTI" data={queryData} />
                  </div>
                </div>

                {/* 8. SCENARIO */}
                <div className="w-full" id="scenario-lab">
                  <ScenarioLabSection data={queryData} />
                </div>

                {/* 9. HEDGE RECOMMENDATIONS */}
                <div className="w-full fit-card p-6">
                  <DecisionIntelligence data={queryData} onExploreScenario={() => {
                    document.getElementById('scenario-lab')?.scrollIntoView({ behavior: 'smooth' });
                  }} onViewEvidence={() => {
                    document.getElementById('sources-and-data')?.scrollIntoView({ behavior: 'smooth' });
                  }} />
                </div>

                {/* 10. SOURCES & DATA */}
                <div className="w-full" id="sources-and-data">
                  <SourcesAndData data={queryData} />
                </div>

                {/* 11. RETURN TO TERMINAL */}
                <div className="w-full py-8 flex justify-center border-t border-gray-200 mt-8">
                  <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-[13px] flex items-center gap-2">
                    <span className="text-lg leading-none">&larr;</span> Back to Terminal
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* NORMAL TERMINAL */}
        {activePage === 'home' && queryStatus === 'IDLE' && renderNormalTerminal()}
        
        {/* OTHER PAGES */}
        {activePage === 'portfolio' && <PortfolioPage />}
        {activePage === 'news' && <NewsPage />}
        {activePage === 'weather' && <WeatherPage />}

      </main>
    </div>
  );
}

export default App;
