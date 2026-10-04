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
import { PipelineAnimation } from './components/intelligence/PipelineAnimation';
import { HistoricalDataView } from './components/intelligence/HistoricalDataView';
import { RiskView } from './components/intelligence/RiskView';
import { useAnalysisQuery } from './hooks/useAnalysisQuery';
import { PortfolioPage } from './pages/PortfolioPage';
import { NewsPage } from './pages/NewsPage';
import { WeatherPage } from './pages/WeatherPage';
import { HistoricalDataPage } from './pages/HistoricalDataPage';
import { curatedNews } from './data/curatedNews';

export function App() {
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [currentTime, setCurrentTime] = useState<string>('12:43:08 EST');
  const [animationComplete, setAnimationComplete] = useState<boolean>(false);


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
    setAnimationComplete(false);
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
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 shadow-sm rounded-xl p-6 h-[600px] flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-[12px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-widest">PORTFOLIO SNAPSHOT</h3>
               <span className="text-[10px] font-bold text-blue-900 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded uppercase tracking-wider border border-blue-200 dark:border-blue-800">SYNTHETIC</span>
            </div>
            
            <div className="mb-6">
              <div className="text-[32px] font-bold text-[#0F172A] dark:text-slate-100 leading-none mb-1">$10,000,000</div>
              <div className="text-[11px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-widest">SYNTHETIC DEMO PORTFOLIO</div>
            </div>
            
            <hr className="border-[#F1F5F9] dark:border-slate-800 my-6" />
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                 <div className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-widest mb-1">ENERGY EXPOSURE</div>
                 <div className="text-[24px] font-bold text-[#0F172A] dark:text-slate-100 leading-none">90<span className="text-[16px] text-[#64748B] dark:text-slate-400">%</span></div>
              </div>
              <div>
                 <div className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-widest mb-1">HOLDINGS</div>
                 <div className="text-[24px] font-bold text-[#0F172A] dark:text-slate-100 leading-none">6</div>
              </div>
            </div>
            
            <div className="bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#F1F5F9] dark:border-slate-700/60 rounded-lg p-4 font-mono-tech text-[12px] text-[#334155] dark:text-slate-300">
               <div className="flex justify-between mb-2">
                 <span><span className="font-bold text-[#0F172A] dark:text-slate-100">XOM</span> 30%</span>
                 <span><span className="font-bold text-[#0F172A] dark:text-slate-100">CVX</span> 20%</span>
                 <span><span className="font-bold text-[#0F172A] dark:text-slate-100">COP</span> 20%</span>
               </div>
               <div className="flex justify-between">
                 <span><span className="font-bold text-[#0F172A] dark:text-slate-100">OXY</span> 10%</span>
                 <span><span className="font-bold text-[#0F172A] dark:text-slate-100">XLE</span> 10%</span>
                 <span><span className="font-bold text-[#0F172A] dark:text-slate-100">SPY</span> 10%</span>
               </div>
            </div>
          </div>
          
          <div className="pt-4 mt-auto border-t border-[#F1F5F9] dark:border-slate-800">
            <button onClick={() => setActivePage('portfolio')} className="w-full py-3 text-[#0F172A] dark:text-slate-200 font-bold hover:bg-[#F8FAFC] dark:hover:bg-slate-800 text-[11px] uppercase tracking-widest border border-[#E2E8F0] dark:border-slate-700 rounded shadow-sm transition-colors flex items-center justify-center gap-2">
              VIEW PORTFOLIO &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* COMPACT WIDGETS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* News Widget */}
        <div className="fit-card p-6 flex flex-col h-[380px]">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">
             <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm uppercase tracking-wider">LATEST MARKET NEWS</h3>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {curatedNews.slice(0, 3).map((story, i) => (
              <div key={i} className="border-b border-slate-100 dark:border-slate-800/80 pb-3 last:border-0">
                <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase mb-1">{story.category}</div>
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1 leading-snug">{story.headline}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex justify-between">
                  <span>{story.source}</span>
                  <span>{new Date(story.publishedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4 mt-auto border-t border-slate-200 dark:border-slate-800">
            <button onClick={() => setActivePage('news')} className="w-full py-2 text-blue-600 dark:text-blue-400 font-bold hover:text-blue-800 dark:hover:text-blue-300 text-xs">
              VIEW ALL NEWS &rarr;
            </button>
          </div>
        </div>

        {/* Weather Widget */}
        <div className="fit-card p-0 flex flex-col h-[380px] border border-[#E2E8F0] dark:border-slate-800 relative overflow-hidden bg-gradient-to-b from-sky-300 to-sky-100 dark:from-slate-800 dark:to-slate-900 rounded-lg">
          
          {/* Cloud Visual Elements */}
          <div className="absolute top-[-30px] right-[-30px] opacity-60 dark:opacity-20 pointer-events-none animate-[pulse-subtle_8s_ease-in-out_infinite]">
            <svg width="250" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-white dark:text-slate-600 w-64 h-64 drop-shadow-xl">
              <path d="M17.5 19a4.5 4.5 0 0 0 2.9-7.9c-.3-4.2-3.8-7.1-7.9-7.1-3.6 0-6.7 2.4-7.6 5.8A4.5 4.5 0 0 0 5.5 19h12z" fill="#ffffff" stroke="none" />
            </svg>
          </div>

          <div className="flex flex-col h-full relative z-10 p-6">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/40 dark:border-slate-700/60">
               <h3 className="font-bold text-[#0F172A] dark:text-slate-100 text-sm uppercase tracking-wider flex items-center gap-2">
                 ACTIVE WEATHER
               </h3>
               <span className="text-[10px] font-bold text-blue-900 dark:text-blue-200 bg-white/30 dark:bg-slate-700/50 px-2 py-0.5 rounded uppercase tracking-wider border border-white/50 dark:border-slate-600 backdrop-blur-md">
                 INDIA WEATHER
               </span>
            </div>
            <div className="flex-1 flex flex-col justify-center items-center">
               <div className="text-[10px] text-blue-900/80 dark:text-slate-400 font-bold tracking-widest uppercase mb-2">Regional Conditions</div>
               <div className="w-full bg-white/40 dark:bg-slate-800/60 border border-white/50 dark:border-slate-700 rounded-lg p-5 backdrop-blur-md text-center shadow-sm">
                 <div className="text-[28px] font-bold text-[#0F172A] dark:text-slate-100 mb-1 tracking-widest leading-none">CLEAR SKY</div>
                 <div className="text-[12px] text-[#475569] dark:text-slate-400 font-mono-tech mt-2 uppercase">0 ACTIVE SEVERE ALERTS</div>
               </div>
            </div>
            <div className="pt-4 mt-auto border-t border-white/40 dark:border-slate-700/60">
              <button onClick={() => setActivePage('weather')} className="w-full py-2.5 text-[#0F172A] dark:text-slate-200 font-bold hover:bg-white/50 dark:hover:bg-slate-700/50 text-xs bg-white/40 dark:bg-slate-800/80 rounded border border-white/50 dark:border-slate-700 shadow-sm transition-colors">
                VIEW WEATHER INTELLIGENCE &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col font-sans transition-colors duration-300">
      <TopNav activePage={activePage} setActivePage={setActivePage} currentTime={currentTime} />

      <main className="flex-1 max-w-[1720px] w-full mx-auto p-5 md:p-6 space-y-5 md:space-y-6">
        <QueryBar onRunAnalysis={handleRunAnalysis} isLoading={queryStatus === 'RUNNING'} />

        {queryStatus === 'ERROR' && (
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-800 dark:text-red-200 rounded-lg p-4 font-mono text-sm mt-6">
            <div className="font-bold mb-2">ANALYSIS FAILED</div>
            <div>{queryError}</div>
          </div>
        )}

        {/* ACTIVE QUERY WORKSPACE - ONLY SHOW ON HOME */}
        {activePage === 'home' && (queryStatus === 'RUNNING' || queryStatus === 'COMPLETED') && (
          <div ref={analysisWorkspaceRef} className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* 1. PIPELINE ANIMATION OR QUERY STATUS */}
            {!animationComplete || queryStatus === 'RUNNING' ? (
               <PipelineAnimation 
                  queryText={queryData?.query || "Analyzing Query..."}
                  backendStatus={queryStatus}
                  onAnimationComplete={() => setAnimationComplete(true)}
               />
            ) : (
              <div className="flex items-center justify-between text-xs font-mono text-gray-500 dark:text-slate-400 pb-2 border-b border-gray-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="uppercase tracking-wider font-bold">STATUS:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">COMPLETED</span>
                  </div>
                  {queryData?.run_id && (
                    <div>RUN_ID: {queryData.run_id}</div>
                  )}
                </div>
                {queryData?.latency && (
                  <div>LATENCY: {queryData.latency.total_ms.toFixed(0)}ms</div>
                )}
              </div>
            )}

            {animationComplete && queryStatus === 'COMPLETED' && queryData && (
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
                    <HistoricalDataView onNavigateToFullPage={() => setActivePage('historical')} />
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
                <div className="w-full scroll-m-24" id="sources-and-data">
                  <SourcesAndData data={queryData} />
                </div>

                {/* 11. RETURN TO TERMINAL */}
                <div className="w-full py-8 flex justify-center border-t border-gray-200 dark:border-slate-800 mt-8">
                  <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-200 font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm text-[13px] flex items-center gap-2">
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
        {activePage === 'historical' && <HistoricalDataPage />}

      </main>
    </div>
  );
}

export default App;
