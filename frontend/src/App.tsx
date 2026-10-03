import { useState, useEffect } from 'react';
import { ActivePage } from './types';
import { TopNav } from './components/layout/TopNav';
import { QueryBar } from './components/layout/QueryBar';
import { GlobalMarketTicker } from './components/ticker/GlobalMarketTicker';
import { EventImpactMap } from './components/intelligence/EventImpactMap';
import { AnalyticalChain } from './components/intelligence/AnalyticalChain';
import { DecisionIntelligence } from './components/intelligence/DecisionIntelligence';
import { AgentAnalysisSection } from './components/bottom/AgentAnalysisSection';
import { ScenarioLabSection } from './components/bottom/ScenarioLabSection';
import { HistoricalAnalogsSection } from './components/bottom/HistoricalAnalogsSection';
import { AuditDrawer } from './components/terminal/AuditDrawer';
import { mockAuditTrace } from './data/mockRecommendations';
import { AnalysisSnapshot, IntelligenceFinding, detectNewIntelligence } from './utils/intelligenceDiff';
import { mockInitialAnalysis, mockNewAnalysis } from './data/mockAnalysis';
import { NewIntelligenceStream } from './components/intelligence/NewIntelligenceStream';

export function App() {
  const [activePage, setActivePage] = useState<ActivePage>('overview');
  const [currentTime, setCurrentTime] = useState<string>('12:43:08 EST');
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState<boolean>(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);
  const [isEventImpactExpanded, setIsEventImpactExpanded] = useState<boolean>(false);

  // New Intelligence State
  const [previousAnalysis, setPreviousAnalysis] = useState<AnalysisSnapshot | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisSnapshot | null>(null);
  const [newFindings, setNewFindings] = useState<IntelligenceFinding[]>([]);

  // Live clock simulation
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        timeZone: 'America/New_York',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setCurrentTime(`${timeStr} EST`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle Query Execution
  const handleRunAnalysis = (_query: string) => {
    setIsLoadingAnalysis(true);
    
    setTimeout(() => {
      setIsLoadingAnalysis(false);
      
      // Simulate backend response
      const isFirstQuery = !currentAnalysis;
      const response = isFirstQuery ? mockInitialAnalysis : mockNewAnalysis;
      
      const findings = detectNewIntelligence(currentAnalysis, response);
      setPreviousAnalysis(currentAnalysis);
      setCurrentAnalysis(response);
      setNewFindings(findings);
    }, 2500);
  };

  const handleIntelligenceItemClick = (sectionId?: string) => {
    if (!sectionId) return;
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans">
      {/* 1. TOP NAVIGATION */}
      <TopNav
        activePage={activePage}
        setActivePage={setActivePage}
        currentTime={currentTime}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-5 md:p-6 space-y-5 md:space-y-6">
        {/* 2. ASK FIT QUERY BAR */}
        <QueryBar
          onRunAnalysis={handleRunAnalysis}
          isLoading={isLoadingAnalysis}
        />

        {/* NEW INTELLIGENCE STREAM */}
        {(newFindings.length > 0 || isLoadingAnalysis) && (
          <NewIntelligenceStream 
            findings={newFindings} 
            isAnalyzing={isLoadingAnalysis} 
            onItemClick={handleIntelligenceItemClick} 
          />
        )}

        {/* 3. GLOBAL MARKET TICKER */}
        <div id="market-pulse">
          <GlobalMarketTicker
            onSelectTicker={() => setIsAuditDrawerOpen(true)}
          />
        </div>

        {/* 4. MAIN ANALYSIS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch transition-all duration-300">
          {/* EVENT IMPACT ANALYSIS */}
          <div className={`${isEventImpactExpanded ? 'lg:col-span-12' : 'lg:col-span-8'} fit-card p-6 transition-all duration-300 flex flex-col`}>
            <EventImpactMap
              isExpanded={isEventImpactExpanded}
              onToggleExpand={() => setIsEventImpactExpanded(!isEventImpactExpanded)}
              onOpenInfrastructureModal={() => setIsAuditDrawerOpen(true)}
            />
          </div>

          {/* DECISION INTELLIGENCE */}
          <div className={`${isEventImpactExpanded ? 'lg:col-span-12' : 'lg:col-span-4'} fit-card p-6 transition-all duration-300 flex flex-col`}>
            <DecisionIntelligence
              onExploreScenario={() => {
                document.getElementById('scenario-lab')?.scrollIntoView({ behavior: 'smooth' });
              }}
              onViewEvidence={() => setIsAuditDrawerOpen(true)}
            />
          </div>
        </div>

        {/* 5. BOTTOM MODULES: KEY EVENT / PORTFOLIO / QUANT RISK / STRATEGY */}
        <div id="risk" className="w-full bg-white rounded-xl shadow-sm border border-[#E2E8F0]">
          <AnalyticalChain
            onSelectNode={(nodeName) => {
              if (nodeName === 'STRATEGY') {
                const el = document.getElementById('strategy');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              } else {
                setIsAuditDrawerOpen(true);
              }
            }}
          />
        </div>

        {/* 6. REMAINING DASHBOARD CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* SCENARIO LAB */}
          <div id="scenario-lab" className="lg:col-span-12">
            <ScenarioLabSection />
          </div>
        </div>

        {/* 7. HISTORICAL ANALOGS ROW */}
        <div id="historical-analogs" className="w-full">
          <HistoricalAnalogsSection
            onSelectAnalog={() => setIsAuditDrawerOpen(true)}
            onViewAll={() => setIsAuditDrawerOpen(true)}
          />
        </div>

        {/* 8. AGENT ANALYSIS */}
        <div className="w-full">
          <AgentAnalysisSection
            onSelectAgent={() => setIsAuditDrawerOpen(true)}
          />
        </div>
      </main>

      {/* Audit & Explainability Drawer (Triggers on 'View Evidence' or analysis run) */}
      <AuditDrawer
        isOpen={isAuditDrawerOpen}
        onClose={() => setIsAuditDrawerOpen(false)}
        auditTrace={mockAuditTrace}
      />
    </div>
  );
}

export default App;
