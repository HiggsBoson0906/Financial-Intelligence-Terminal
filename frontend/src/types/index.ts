export * from './api';

export type ActivePage = 
  | 'home' 
  | 'news' 
  | 'weather' 
  | 'portfolio';

export interface MarketTicker {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: string;
  sparkline: number[];
  category: 'index' | 'equity' | 'commodity' | 'forex' | 'rates';
}

export interface ChartDataPoint {
  timestamp: string;
  price: number;
  volume: number;
  event?: string;
  news?: string;
}

export interface AiEventImpact {
  id: string;
  category: string;
  title: string;
  location: string;
  affectedSector: string;
  confidence: number;
  expectedDisruption: string;
  horizon: string;
  affectedAssets: Array<{
    symbol: string;
    name: string;
    probability: number;
    impactType: 'negative' | 'positive' | 'neutral';
    exposure: string;
  }>;
}

export interface AgentNode {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'analyzing' | 'completed' | 'alert';
  confidence: number;
  lastActive: string;
  inputs: string[];
  outputs: string[];
  logs: string[];
  x?: number;
  y?: number;
}

export interface PortfolioMetric {
  totalExposure: string;
  var95: string;
  expectedShortfall: string;
  beta: number;
  volatility: string;
  sharpeRatio: number;
  dailyPnL: string;
  dailyPnLPercent: number;
}

export interface SectorExposure {
  sector: string;
  percentage: number;
  value: string;
  riskScore: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface RiskHeatmapItem {
  symbol: string;
  name: string;
  exposure: string;
  varContribution: string;
  eventSensitivity: number; // 1-100
  riskLevel: 'LOW' | 'MED' | 'HIGH' | 'EXTREME';
}

export interface WeatherDisruption {
  id: string;
  name: string;
  category: string;
  location: string;
  windSpeed: string;
  landfallHorizon: string;
  affectedInfrastructure: {
    refineries: string[];
    ports: string[];
    pipelines: string[];
  };
  causalChain: Array<{
    stage: number;
    label: string;
    description: string;
    affectedSymbols: string[];
  }>;
}

export interface NewsItem {
  id: string;
  timestamp: string;
  source: string;
  headline: string;
  snippet: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  affectedAssets: string[];
  importance: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number;
  category: 'Macro' | 'Energy' | 'Technology' | 'Geopolitics' | 'Markets';
}

export interface RecommendationEvidence {
  id: string;
  title: string;
  type: 'weather' | 'historical' | 'capacity' | 'sentiment' | 'portfolio';
  status: 'verified' | 'strong' | 'moderate';
  details: string;
  source: string;
}

export interface AiRecommendation {
  id: string;
  title: string;
  action: 'REDUCE' | 'INCREASE' | 'HEDGE' | 'HOLD';
  targetAsset: string;
  suggestedHedge: string;
  confidence: number;
  expectedImpact: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  rationale: string;
  evidenceChain: RecommendationEvidence[];
}

export interface AuditStep {
  stage: string;
  title: string;
  source: string;
  timestamp: string;
  confidence: number;
  result: string;
  details: string[];
  payload?: Record<string, any>;
}

export interface AuditTrace {
  id: string;
  userQuery: string;
  timestamp: string;
  recommendationId: string;
  steps: AuditStep[];
}
