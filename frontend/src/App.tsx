import { useState, useEffect } from 'react';
import { ActivePage } from './types';
import { TopNav } from './components/layout/TopNav';
import { QueryBar } from './components/layout/QueryBar';
import { GlobalMarketTicker } from './components/ticker/GlobalMarketTicker';
import { IntelligenceStream, StreamEvent } from './components/intelligence/IntelligenceStream';
import { EventImpactMap } from './components/intelligence/EventImpactMap';
import { AnalyticalChain } from './components/intelligence/AnalyticalChain';
import { DecisionIntelligence } from './components/intelligence/DecisionIntelligence';
import { AgentAnalysisSection } from './components/bottom/AgentAnalysisSection';
import { ScenarioLabSection } from './components/bottom/ScenarioLabSection';
import { HistoricalAnalogsSection } from './components/bottom/HistoricalAnalogsSection';
import { AuditDrawer } from './components/terminal/AuditDrawer';
import { mockAuditTrace } from './data/mockRecommendations';

export function App() {
  const [activePage, setActivePage] = useState<ActivePage>('overview');
  const [currentTime, setCurrentTime] = useState<string>('12:43:08 EST');
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState<boolean>(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);

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
      setIsAuditDrawerOpen(true);
    }, 1000);
  };

  const handleSelectStreamEvent = (_event: StreamEvent) => {
    // When clicking an intelligence stream event, we can open audit or highlight
    setIsAuditDrawerOpen(true);
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

        {/* 3. GLOBAL MARKET TICKER */}
        <GlobalMarketTicker
          onSelectTicker={() => setIsAuditDrawerOpen(true)}
        />

        {/* 4. MAIN 3-COLUMN WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* LEFT: INTELLIGENCE STREAM (~22% -> 3 cols) */}
          <div className="lg:col-span-3">
            <IntelligenceStream onSelectEvent={handleSelectStreamEvent} />
          </div>

          {/* CENTER: EVENT IMPACT ANALYSIS & ANALYTICAL CHAIN (~58% -> 6 cols) */}
          <div className="lg:col-span-6 fit-card p-5 flex flex-col justify-between">
            <EventImpactMap
              onOpenInfrastructureModal={() => setIsAuditDrawerOpen(true)}
            />
            <AnalyticalChain
              onSelectNode={() => setIsAuditDrawerOpen(true)}
            />
          </div>

          {/* RIGHT: DECISION INTELLIGENCE (~20% -> 3 cols) */}
          <div className="lg:col-span-3">
            <DecisionIntelligence
              onExploreScenario={() => {
                // Smooth scroll down to Scenario Lab
                document.getElementById('scenario-lab')?.scrollIntoView({ behavior: 'smooth' });
              }}
              onViewEvidence={() => setIsAuditDrawerOpen(true)}
            />
          </div>
        </div>

        {/* 5. ROW 1 — SCENARIO LAB + HISTORICAL ANALOGS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* SCENARIO LAB (~65% -> 8 cols) */}
          <div id="scenario-lab" className="lg:col-span-8">
            <ScenarioLabSection />
          </div>

          {/* HISTORICAL ANALOGS (~35% -> 4 cols) */}
          <div className="lg:col-span-4">
            <HistoricalAnalogsSection
              onSelectAnalog={() => setIsAuditDrawerOpen(true)}
              onViewAll={() => setIsAuditDrawerOpen(true)}
            />
          </div>
        </div>

        {/* 6. ROW 2 — AGENT ANALYSIS */}
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
