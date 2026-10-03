import type { MarketTicker, ChartDataPoint, AiEventImpact } from '../types';

export const mockMarketTickers: MarketTicker[] = [
  {
    symbol: 'S&P 500',
    name: 'S&P 500 Index',
    value: 5842.10,
    change: +24.80,
    changePercent: +0.43,
    high: 5855.30,
    low: 5812.40,
    volume: '3.42B',
    sparkline: [5812, 5820, 5818, 5829, 5835, 5830, 5842],
    category: 'index',
  },
  {
    symbol: 'NASDAQ',
    name: 'Nasdaq Composite',
    value: 18518.61,
    change: +112.45,
    changePercent: +0.61,
    high: 18540.20,
    low: 18390.10,
    volume: '4.89B',
    sparkline: [18390, 18420, 18410, 18460, 18490, 18475, 18518],
    category: 'index',
  },
  {
    symbol: 'DOW',
    name: 'Dow Jones Industrial',
    value: 42352.75,
    change: -48.20,
    changePercent: -0.11,
    high: 42480.00,
    low: 42290.50,
    volume: '410M',
    sparkline: [42450, 42420, 42380, 42390, 42340, 42360, 42352],
    category: 'index',
  },
  {
    symbol: 'VIX',
    name: 'CBOE Volatility Index',
    value: 16.42,
    change: -0.85,
    changePercent: -4.92,
    high: 17.80,
    low: 16.15,
    volume: '--',
    sparkline: [17.8, 17.5, 17.2, 16.9, 16.6, 16.5, 16.42],
    category: 'index',
  },
  {
    symbol: 'USD/INR',
    name: 'US Dollar / Indian Rupee',
    value: 83.94,
    change: +0.12,
    changePercent: +0.14,
    high: 84.02,
    low: 83.81,
    volume: '--',
    sparkline: [83.81, 83.85, 83.89, 83.91, 83.90, 83.93, 83.94],
    category: 'forex',
  },
  {
    symbol: '10Y TREASURY',
    name: 'US Benchmark 10Y Yield',
    value: 3.984,
    change: -0.041,
    changePercent: -1.02,
    high: 4.032,
    low: 3.971,
    volume: '--',
    sparkline: [4.03, 4.02, 4.01, 3.99, 4.00, 3.99, 3.984],
    category: 'rates',
  },
  {
    symbol: 'CRUDE OIL (WTI)',
    name: 'WTI Crude Futures',
    value: 78.45,
    change: +2.85,
    changePercent: +3.77,
    high: 79.20,
    low: 75.10,
    volume: '820K',
    sparkline: [75.1, 75.8, 76.4, 77.2, 77.9, 78.1, 78.45],
    category: 'commodity',
  },
  {
    symbol: 'NATURAL GAS',
    name: 'Natural Gas Henry Hub',
    value: 2.84,
    change: +0.22,
    changePercent: +8.40,
    high: 2.91,
    low: 2.61,
    volume: '410K',
    sparkline: [2.61, 2.64, 2.70, 2.75, 2.81, 2.83, 2.84],
    category: 'commodity',
  }
];

export const mockChartData: Record<string, ChartDataPoint[]> = {
  '1D': [
    { timestamp: '09:30', price: 75.20, volume: 12000 },
    { timestamp: '10:30', price: 75.85, volume: 24000, news: 'NHC upgrades Gulf storm to Cat 3' },
    { timestamp: '11:30', price: 76.40, volume: 38000 },
    { timestamp: '12:30', price: 76.10, volume: 19000 },
    { timestamp: '13:30', price: 77.30, volume: 45000, event: 'Cat 4 Upgrade Alert' },
    { timestamp: '14:30', price: 77.95, volume: 52000 },
    { timestamp: '15:30', price: 78.45, volume: 68000, news: 'Exxon & Chevron evacuate Gulf rigs' }
  ],
  '1W': [
    { timestamp: 'Mon', price: 72.10, volume: 140000 },
    { timestamp: 'Tue', price: 73.05, volume: 165000 },
    { timestamp: 'Wed', price: 74.20, volume: 210000, news: 'Tropical depression forms' },
    { timestamp: 'Thu', price: 75.80, volume: 310000, event: 'Refinery Prep Warning' },
    { timestamp: 'Fri', price: 78.45, volume: 490000, event: 'Cat 4 Gulf Hurricane' }
  ],
  '1M': [
    { timestamp: 'Sep 05', price: 69.40, volume: 950000 },
    { timestamp: 'Sep 12', price: 70.80, volume: 1100000 },
    { timestamp: 'Sep 19', price: 71.30, volume: 1050000, news: 'OPEC+ maintains production freeze' },
    { timestamp: 'Sep 26', price: 73.50, volume: 1400000 },
    { timestamp: 'Oct 03', price: 78.45, volume: 2100000, event: 'Cat 4 Gulf Hurricane' }
  ],
  '3M': [
    { timestamp: 'Jul', price: 81.20, volume: 4200000 },
    { timestamp: 'Aug', price: 74.50, volume: 3800000 },
    { timestamp: 'Sep', price: 71.80, volume: 4100000, news: 'US SPR Refill Announcement' },
    { timestamp: 'Oct', price: 78.45, volume: 5200000, event: 'Cat 4 Gulf Hurricane' }
  ],
  '1Y': [
    { timestamp: 'Q4 23', price: 84.10, volume: 15200000 },
    { timestamp: 'Q1 24', price: 78.90, volume: 14800000 },
    { timestamp: 'Q2 24', price: 82.40, volume: 16100000, event: 'Red Sea Supply Shock' },
    { timestamp: 'Q3 24', price: 73.20, volume: 13900000 },
    { timestamp: 'Q4 24', price: 78.45, volume: 18400000 }
  ]
};

export const mockAiEventImpact: AiEventImpact = {
  id: 'EVT-GULF-HURRICANE-04',
  category: 'CATEGORY 4 HURRICANE',
  title: 'HURRICANE AURELIA - GULF OF MEXICO',
  location: 'GULF OF MEXICO (LAT 25.4N, LON 89.2W)',
  affectedSector: 'ENERGY & REFINING',
  confidence: 87,
  expectedDisruption: 'Refining capacity ↓ 40%',
  horizon: '3–5 DAYS',
  affectedAssets: [
    { symbol: 'XOM', name: 'ExxonMobil Corp', probability: 82, impactType: 'negative', exposure: '$14.2M' },
    { symbol: 'CVX', name: 'Chevron Corp', probability: 78, impactType: 'negative', exposure: '$9.8M' },
    { symbol: 'COP', name: 'ConocoPhillips', probability: 71, impactType: 'negative', exposure: '$6.5M' },
    { symbol: 'NG=F', name: 'Natural Gas Futures', probability: 89, impactType: 'positive', exposure: '$4.1M' },
    { symbol: 'MPC', name: 'Marathon Petroleum', probability: 84, impactType: 'negative', exposure: '$5.3M' }
  ]
};
