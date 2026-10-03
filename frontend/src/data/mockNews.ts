import type { NewsItem } from '../types';

export const mockNewsItems: NewsItem[] = [
  {
    id: 'NEWS-001',
    timestamp: '09:42 EST',
    source: 'REUTERS',
    headline: 'Gulf refiners prepare for major storm disruption as Category 4 hurricane approaches',
    snippet: 'ExxonMobil and Chevron have initiated emergency shutdown procedures at key offshore rigs in the Gulf of Mexico, potentially idling 1.8M bpd of crude capacity.',
    sentiment: 'BEARISH',
    affectedAssets: ['XOM', 'CVX', 'MPC', 'WTI'],
    importance: 'CRITICAL',
    confidence: 91,
    category: 'Energy'
  },
  {
    id: 'NEWS-002',
    timestamp: '09:28 EST',
    source: 'BLOOMBERG',
    headline: 'Natural Gas spikes +8.4% on projected Gulf LNG terminal export halts',
    snippet: 'Henry Hub natural gas futures surging as storm trajectory indicates direct hit on Sabine Pass and Cameron LNG facilities.',
    sentiment: 'BULLISH',
    affectedAssets: ['NG=F', 'LNG', 'EQT'],
    importance: 'HIGH',
    confidence: 88,
    category: 'Energy'
  },
  {
    id: 'NEWS-003',
    timestamp: '08:55 EST',
    source: 'WALL STREET JOURNAL',
    headline: 'Fed Governor hints at prolonged pause amid sticky core inflation print',
    snippet: 'Treasury yields push lower as rate futures price in 84% probability of no rate change at the upcoming FOMC meeting.',
    sentiment: 'NEUTRAL',
    affectedAssets: ['10Y TREASURY', 'USD/INR', 'SPY'],
    importance: 'HIGH',
    confidence: 85,
    category: 'Macro'
  },
  {
    id: 'NEWS-004',
    timestamp: '08:15 EST',
    source: 'QUANT RESEARCH LABS',
    headline: 'Semiconductor supply chain resilience index reaches 18-month high',
    snippet: 'Custom AI silicon demand remains robust with TSMC reporting record wafer shipments, buffering tech sector from broader macro headwinds.',
    sentiment: 'BULLISH',
    affectedAssets: ['NVDA', 'AAPL', 'MSFT', 'TSM'],
    importance: 'MEDIUM',
    confidence: 92,
    category: 'Technology'
  },
  {
    id: 'NEWS-005',
    timestamp: '07:30 EST',
    source: 'FINANCIAL TIMES',
    headline: 'OPEC+ emergency panel convenes to evaluate weather-driven crude tightness',
    snippet: 'Delegates state OPEC+ will closely monitor US Gulf refinery offline duration before considering any production quota modifications.',
    sentiment: 'NEUTRAL',
    affectedAssets: ['WTI', 'BRENT', 'XOM'],
    importance: 'HIGH',
    confidence: 83,
    category: 'Geopolitics'
  },
  {
    id: 'NEWS-006',
    timestamp: '06:45 EST',
    source: 'S&P GLOBAL COMMODITIES',
    headline: 'Colonial Pipeline monitors storm surge levels at Louisiana pump stations',
    snippet: 'Precautionary reduced line rates implemented along Segment 1 (Houston to Greensboro), signaling potential East Coast refined product supply constraints.',
    sentiment: 'BEARISH',
    affectedAssets: ['VLO', 'PSX', 'MPC'],
    importance: 'HIGH',
    confidence: 89,
    category: 'Energy'
  }
];
