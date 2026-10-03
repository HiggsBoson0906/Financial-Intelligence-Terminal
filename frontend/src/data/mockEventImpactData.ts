export const mockMarketData = {
  WTI: { price: '$80.42', change: '+2.80%', sensitivity: 'HIGH', impact: '+4.2%' },
  BRENT: { price: '$84.15', change: '+2.50%', sensitivity: 'HIGH', impact: '+3.8%' },
  XOM: { price: '$112.30', change: '-1.20%', sensitivity: 'MEDIUM', impact: '-1.5%' },
  CVX: { price: '$160.45', change: '-1.50%', sensitivity: 'MEDIUM', impact: '-1.8%' },
  XLE: { price: '$88.75', change: '-0.80%', sensitivity: 'MEDIUM', impact: '-1.0%' },
  SPY: { price: '$512.20', change: '-0.30%', sensitivity: 'LOW', impact: '-0.5%' },
  VIX: { price: '14.50', change: '+5.40%', sensitivity: 'HIGH', impact: '+8.2%' },
};

export const mockRiskData = {
  exposure: '43%',
  riskChange: '+11.4%',
  var95: '$184K',
  expectedShortfall: '$241K',
  volatility: '18.7%',
  contributions: [
    { sector: 'Energy', percent: 43, color: '#F43F5E' },
    { sector: 'Technology', percent: 24, color: '#3B82F6' },
    { sector: 'Financials', percent: 18, color: '#F59E0B' },
    { sector: 'Other', percent: 15, color: '#94A3B8' },
  ],
  sensitivities: [
    { asset: 'XOM', exposure: '18%', sensitivity: 'HIGH' },
    { asset: 'CVX', exposure: '12%', sensitivity: 'HIGH' },
    { asset: 'XLE', exposure: '9%', sensitivity: 'MEDIUM' },
    { asset: 'SPY', exposure: '25%', sensitivity: 'LOW' },
  ]
};

export const mockHistoricalAnalogs = [
  {
    id: 'analog-1',
    name: '2013 Odisha Cyclone',
    similarity: '89%',
    date: 'Oct 2013',
    region: 'Eastern India',
    severity: 'Extreme',
    marketResponse: 'Energy sector declined 4.2% within 3 days',
    portfolioRelevance: 'HIGH',
    details: {
      weather: 'Category 5 equivalent cyclone causing massive flooding.',
      news: 'Widespread infrastructure damage reported.',
      market: 'Regional energy assets sold off sharply.',
      impact: 'Portfolio VaR increased by 15%.'
    }
  },
  {
    id: 'analog-2',
    name: '2020 Amphan',
    similarity: '84%',
    date: 'May 2020',
    region: 'Bay of Bengal',
    severity: 'Severe',
    marketResponse: 'Logistics and energy disrupted for 2 weeks',
    portfolioRelevance: 'HIGH',
    details: {
      weather: 'Super Cyclonic Storm causing $13B in damages.',
      news: 'Port closures and supply chain delays heavily covered.',
      market: 'Broad market dip, specific impact on shipping.',
      impact: 'Supply chain related assets underperformed.'
    }
  },
  {
    id: 'analog-3',
    name: '2021 Odisha Flood Event',
    similarity: '78%',
    date: 'Aug 2021',
    region: 'Odisha, India',
    severity: 'Moderate',
    marketResponse: 'Minimal broad impact, localized disruptions',
    portfolioRelevance: 'MEDIUM',
    details: {
      weather: 'Heavy monsoon rains leading to river overflows.',
      news: 'Local evacuations and agriculture impact.',
      market: 'Negligible impact on global energy prices.',
      impact: 'Slight negative impact on local industrials.'
    }
  }
];
