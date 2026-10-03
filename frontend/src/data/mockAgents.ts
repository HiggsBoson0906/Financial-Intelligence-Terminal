import type { AgentNode } from '../types';

export const mockAgentNodes: AgentNode[] = [
  {
    id: 'agent-news',
    name: 'NEWS SENTIMENT',
    role: 'NLP & Real-Time Media Parsing',
    status: 'completed',
    confidence: 91,
    lastActive: '12s ago',
    inputs: ['Reuters Wire', 'Bloomberg Terminal API', 'Dow Jones Feed'],
    outputs: ['Bearish Energy Sentiment Index: -0.74', 'Asset Correlation: XOM, CVX'],
    logs: [
      '[09:42:01] Ingested 142 articles regarding Gulf Hurricane Aurelia',
      '[09:42:04] Extracted key terms: "refinery shutdown", "capacity idling", "force majeure"',
      '[09:42:08] Classified sentiment score: -0.74 (Strongly Bearish Refiners)'
    ],
    x: 120,
    y: 100
  },
  {
    id: 'agent-weather',
    name: 'WEATHER ANALYST',
    role: 'GIS & NOAA Telemetry Modeling',
    status: 'analyzing',
    confidence: 94,
    lastActive: 'Active now',
    inputs: ['NOAA Hurricane Track', 'ECMWF Pressure Grid', 'Gulf Sea Temp'],
    outputs: ['Category 4 Landfall Vector: Port Arthur / Galveston', 'Refinery Facility Overlay'],
    logs: [
      '[09:42:10] Loaded NOAA Advisory #18 model grid',
      '[09:42:15] Storm surge projection: 12-16 ft along Sabine Pass',
      '[09:42:19] Intersecting trajectory with 11 major refinery coordinates'
    ],
    x: 320,
    y: 100
  },
  {
    id: 'agent-macro',
    name: 'MACRO ANALYST',
    role: 'Macroeconomic & Commodities Engine',
    status: 'completed',
    confidence: 86,
    lastActive: '28s ago',
    inputs: ['US Crude Inventory Data', 'SPR Reserve Levels', 'Inflation Matrix'],
    outputs: ['Short-Term WTI Crude Premium: +$4.20/bbl', 'NatGas Henry Hub Surge'],
    logs: [
      '[09:41:45] Evaluated current US commercial crude stocks (421M bbls)',
      '[09:41:52] Calculated supply buffer: 14 days of refinery downtime resilience',
      '[09:41:58] Outputted macro shock vector for crude and refined products'
    ],
    x: 520,
    y: 100
  },
  {
    id: 'agent-quant',
    name: 'QUANT RISK',
    role: 'Monte Carlo & Historical Stress Testing',
    status: 'analyzing',
    confidence: 89,
    lastActive: 'Active now',
    inputs: ['Portfolio Covariance Matrix', 'Historical Hurricane Shock Data (2005, 2017, 2021)'],
    outputs: ['Portfolio 1D 95% VaR: +$42,800 increase', 'Beta Drift: 1.18 -> 1.34'],
    logs: [
      '[09:42:22] Executing 50,000 Monte Carlo simulations under Cat 4 hurricane scenario',
      '[09:42:26] Matched historical vectors: Hurricane Katrina (2005) & Ida (2021)',
      '[09:42:31] Sector tail risk calculated: Energy holdings downside variance 8.4%'
    ],
    x: 220,
    y: 260
  },
  {
    id: 'agent-portfolio',
    name: 'PORTFOLIO MANAGER',
    role: 'Exposure & Mandate Alignment',
    status: 'idle',
    confidence: 88,
    lastActive: '1m ago',
    inputs: ['Fund Mandate Limits', 'Current Energy Sector Weight (28%)', 'Cash Buffer ($4.2M)'],
    outputs: ['Target Weight Reduction: Energy 28% -> 18%', 'Rebalance Triggers'],
    logs: [
      '[09:41:10] Checked portfolio policy: Maximum allowable sector risk exceedance flag',
      '[09:41:15] Recommended risk mitigation: Liquidate $6.2M XOM/CVX long exposure'
    ],
    x: 420,
    y: 260
  },
  {
    id: 'agent-hedge',
    name: 'HEDGE STRATEGIST',
    role: 'Derivatives & Cross-Asset Optimization',
    status: 'completed',
    confidence: 84,
    lastActive: '5s ago',
    inputs: ['Option Vol Surface', 'NatGas Henry Hub Futures Curve', 'Crack Spread Swaps'],
    outputs: ['Optimal Action: Reduce Refiners / Long NG=F Oct Futures', 'Hedge Efficiency Ratio: 92%'],
    logs: [
      '[09:42:35] Priced Henry Hub Natural Gas October Futures (NG=F) upside call spread',
      '[09:42:39] Simulated cross-hedging correlation: NG=F / Energy equity inverse delta',
      '[09:42:43] Finalizing optimal zero-cost collar hedge recommendation'
    ],
    x: 620,
    y: 260
  }
];
