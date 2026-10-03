import React from 'react';
import type { MarketTicker, ChartDataPoint, AiEventImpact, AgentNode, PortfolioMetric, SectorExposure, RiskHeatmapItem, WeatherDisruption, NewsItem, AiRecommendation } from '../types';
import { KpiStrip } from '../components/kpi/KpiStrip';
import { MarketIntelligenceChart } from '../components/intelligence/MarketIntelligenceChart';
import { AiIntelligencePanel } from '../components/intelligence/AiIntelligencePanel';
import { AgentOrchestrator } from '../components/agents/AgentOrchestrator';
import { PortfolioRiskSection } from '../components/portfolio/PortfolioRiskSection';
import { WeatherIntelligencePanel } from '../components/weather/WeatherIntelligencePanel';
import { NewsIntelligenceFeed } from '../components/news/NewsIntelligenceFeed';
import { RecommendationPanel } from '../components/recommendations/RecommendationPanel';

interface OverviewPageProps {
  tickers: MarketTicker[];
  chartData: Record<string, ChartDataPoint[]>;
  eventImpact: AiEventImpact;
  agents: AgentNode[];
  portfolioMetrics: PortfolioMetric;
  sectorExposures: SectorExposure[];
  riskHeatmap: RiskHeatmapItem[];
  weatherData: WeatherDisruption;
  news: NewsItem[];
  recommendation: AiRecommendation;
  onOpenAudit: () => void;
  onSelectAsset: (symbol: string) => void;
  onOpenWeather: () => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  tickers,
  chartData,
  eventImpact,
  agents,
  portfolioMetrics,
  sectorExposures,
  riskHeatmap,
  weatherData,
  news,
  recommendation,
  onOpenAudit,
  onSelectAsset,
  onOpenWeather,
}) => {
  return (
    <div className="space-y-4 p-4 max-w-[1600px] mx-auto">
      {/* Top KPI Strip */}
      <KpiStrip tickers={tickers} onSelectTicker={(t) => onSelectAsset(t.symbol)} />

      {/* Main Intelligence Grid: Chart (Left) + Active AI Threat (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <MarketIntelligenceChart data={chartData} activeAsset="CRUDE OIL (WTI)" />
        </div>
        <div>
          <AiIntelligencePanel
            eventImpact={eventImpact}
            onOpenWeatherDetail={onOpenWeather}
            onSelectAsset={onSelectAsset}
          />
        </div>
      </div>

      {/* Multi-Agent Orchestration Graph */}
      <AgentOrchestrator agents={agents} />

      {/* AI Recommendation & Evidence Chain */}
      <RecommendationPanel recommendation={recommendation} onOpenAudit={onOpenAudit} />

      {/* Portfolio Risk & Heatmap */}
      <PortfolioRiskSection
        metrics={portfolioMetrics}
        sectors={sectorExposures}
        heatmap={riskHeatmap}
        onSelectAsset={onSelectAsset}
      />

      {/* Bottom Grid: Weather Intelligence + Live News Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WeatherIntelligencePanel weatherData={weatherData} onSelectAsset={onSelectAsset} />
        <NewsIntelligenceFeed news={news} onSelectAsset={onSelectAsset} />
      </div>
    </div>
  );
};
