import type { PortfolioMetric, SectorExposure, RiskHeatmapItem } from '../types';

export const mockPortfolioMetrics: PortfolioMetric = {
  totalExposure: '$24,850,000',
  var95: '$240,500',
  expectedShortfall: '$385,200',
  beta: 1.18,
  volatility: '18.4%',
  sharpeRatio: 2.42,
  dailyPnL: '+$142,600',
  dailyPnLPercent: +0.58
};

export const mockSectorExposures: SectorExposure[] = [
  { sector: 'Technology', percentage: 42, value: '$10,437,000', riskScore: 'MEDIUM' },
  { sector: 'Energy', percentage: 28, value: '$6,958,000', riskScore: 'CRITICAL' },
  { sector: 'Financials', percentage: 15, value: '$3,727,500', riskScore: 'LOW' },
  { sector: 'Healthcare', percentage: 10, value: '$2,485,000', riskScore: 'LOW' },
  { sector: 'Industrials', percentage: 5, value: '$1,242,500', riskScore: 'HIGH' }
];

export const mockRiskHeatmap: RiskHeatmapItem[] = [
  {
    symbol: 'XOM',
    name: 'ExxonMobil Corp',
    exposure: '$3,840,000',
    varContribution: '$72,400',
    eventSensitivity: 89,
    riskLevel: 'EXTREME'
  },
  {
    symbol: 'CVX',
    name: 'Chevron Corp',
    exposure: '$2,450,000',
    varContribution: '$51,200',
    eventSensitivity: 82,
    riskLevel: 'HIGH'
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corp',
    exposure: '$4,920,000',
    varContribution: '$48,100',
    eventSensitivity: 42,
    riskLevel: 'MED'
  },
  {
    symbol: 'COP',
    name: 'ConocoPhillips',
    exposure: '$1,280,000',
    varContribution: '$29,600',
    eventSensitivity: 76,
    riskLevel: 'HIGH'
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corp',
    exposure: '$3,510,000',
    varContribution: '$21,000',
    eventSensitivity: 25,
    riskLevel: 'LOW'
  },
  {
    symbol: 'JPM',
    name: 'JPMorgan Chase',
    exposure: '$2,100,000',
    varContribution: '$14,500',
    eventSensitivity: 31,
    riskLevel: 'LOW'
  }
];
