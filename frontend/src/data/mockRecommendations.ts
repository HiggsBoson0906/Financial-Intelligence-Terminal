import type { AiRecommendation, AuditTrace } from '../types';

export const mockPrimaryRecommendation: AiRecommendation = {
  id: 'REC-2026-0941',
  title: 'HEDGE ENERGY EXPOSURE & SHIFT TO LNG FUTURES',
  action: 'REDUCE',
  targetAsset: 'Gulf-based refinery exposure (XOM, CVX, MPC)',
  suggestedHedge: 'Natural Gas October Futures (NG=F)',
  confidence: 84,
  expectedImpact: '+8% short-term natural gas price scenario / -6.2% downside protection',
  riskLevel: 'MEDIUM',
  rationale: 'Category 4 Hurricane Aurelia poses immediate landfall threat to Gulf refining infrastructure. Multi-agent model indicates 40% capacity reduction over 3-5 days. Refiners face margin compression while natural gas export disruptions drive short-term price spikes.',
  evidenceChain: [
    {
      id: 'EVID-01',
      title: 'NOAA Weather GIS Model',
      type: 'weather',
      status: 'verified',
      details: 'Storm track vector intersects Sabine Pass and Port Arthur refining grid with 87% probability within 72h.',
      source: 'NOAA Advisory #18 Data Feed'
    },
    {
      id: 'EVID-02',
      title: 'Historical Shock Benchmark',
      type: 'historical',
      status: 'strong',
      details: '91% pattern correlation with Hurricane Ida (2021) & Katrina (2005) price movement vectors.',
      source: 'FIT Quant Historical Database'
    },
    {
      id: 'EVID-03',
      title: 'Refinery Capacity Telemetry',
      type: 'capacity',
      status: 'verified',
      details: '1.8M bpd active crude refining capacity confirmed undergoing emergency shutdown procedures.',
      source: 'S&P Global Platts Satellite Monitor'
    },
    {
      id: 'EVID-04',
      title: 'Real-Time News Sentiment',
      type: 'sentiment',
      status: 'strong',
      details: 'NLP sentiment score -0.74 (Strong Bearish) across 142 aggregated financial news feeds.',
      source: 'Reuters / Bloomberg NLP Pipeline'
    },
    {
      id: 'EVID-05',
      title: 'Portfolio Weight Violation',
      type: 'portfolio',
      status: 'verified',
      details: 'Energy sector exposure currently stands at 28%, exceeding target risk mandate by +8.4%.',
      source: 'FIT Risk Management Engine'
    }
  ]
};

export const mockAuditTrace: AuditTrace = {
  id: 'AUDIT-TRACE-9481',
  userQuery: 'How will a Category 4 hurricane in the Gulf affect my energy holdings and what hedge is advised?',
  timestamp: '2026-10-03 09:42:15 UTC',
  recommendationId: 'REC-2026-0941',
  steps: [
    {
      stage: 'STAGE 1: USER QUERY & PARSING',
      title: 'Natural Language Query Intent Extraction',
      source: 'FIT Command NLP Classifier',
      timestamp: '09:42:01.120',
      confidence: 99,
      result: 'Intent: Weather Risk & Portfolio Hedge Recommendation',
      details: [
        'Entity: Category 4 Hurricane (Gulf of Mexico)',
        'Target Portfolio Holdings: Energy Sector (XOM, CVX, COP, MPC)',
        'Required Output: Impact Analysis & Optimal Derivatives Hedge Strategy'
      ],
      payload: {
        rawQuery: "How will a Category 4 hurricane in the Gulf affect my energy holdings?",
        parsedEntities: ["Hurricane Aurelia", "Gulf Coast Refineries", "Energy Equity Holdings"],
        userPortfolioId: "PORT-MAIN-001"
      }
    },
    {
      stage: 'STAGE 2: MULTI-SOURCE DATA INGESTION',
      title: 'Satellite GIS, News Wire, & Market Feed Ingestion',
      source: 'NOAA / Reuters Wire / Bloomberg API',
      timestamp: '09:42:04.450',
      confidence: 96,
      result: 'Verified Category 4 Storm Trajectory & 1.8M bpd Idling',
      details: [
        'NOAA Coordinates: LAT 25.4N, LON 89.2W, Sustained Winds 145 mph',
        'Refinery Facilities: Port Arthur (Motiva), Garyville (Marathon), Beaumont (Exxon)',
        'News Sentiment: -0.74 Bearish sentiment calculated across 142 live articles'
      ],
      payload: {
        stormCategory: 4,
        windMph: 145,
        refineryDowntimeEstBpd: 1800000,
        newsArticlesParsed: 142
      }
    },
    {
      stage: 'STAGE 3: AGENT ORCHESTRATION',
      title: 'Multi-Agent Analysis Graph Execution',
      source: 'FIT Multi-Agent Pipeline',
      timestamp: '09:42:08.820',
      confidence: 91,
      result: 'Agent Consensus Achieved (5/5 Agents Agree on Downside Risk)',
      details: [
        'NEWS AGENT: High probability of refiner equity margin contraction',
        'WEATHER AGENT: 87% trajectory convergence on refining infrastructure',
        'MACRO AGENT: Projected +8.4% Natural Gas price jump on LNG export pause',
        'QUANT RISK AGENT: Portfolio 1D 95% VaR increases by +$42,800'
      ],
      payload: {
        agentVotes: {
          news: "BEARISH_REFINERS",
          weather: "HIGH_IMPACT",
          macro: "LONG_NATGAS",
          quant: "REDUCE_EXPOSURE"
        }
      }
    },
    {
      stage: 'STAGE 4: HISTORICAL SHOCK BENCHMARKING',
      title: 'Historical Event Vector Similarity Matching',
      source: 'FIT Vector DB Engine',
      timestamp: '09:42:11.200',
      confidence: 94,
      result: 'Matched Hurricane Katrina (2005) & Ida (2021)',
      details: [
        'Ida (2021) Match Score: 91% similarity vector',
        'Katrina (2005) Match Score: 94% similarity vector',
        'Historical Outcome: Natural Gas futures surged average +23.3% while refiners fell -10.7%'
      ],
      payload: {
        bestMatch: "HIST-2005-KATRINA",
        similarityPercentage: 94,
        historicalAvgNatGasSpike: 23.3
      }
    },
    {
      stage: 'STAGE 5: QUANTITATIVE RISK MODELING',
      title: 'Monte Carlo Stress Simulation & Value at Risk',
      source: 'FIT Risk Engine (50,000 Iterations)',
      timestamp: '09:42:13.600',
      confidence: 89,
      result: 'Energy Sector VaR Exceedance Confirmed',
      details: [
        'Unhedged Portfolio Loss Expectation: -$412,000 under Cat 4 Scenario',
        'Hedged Portfolio Loss Expectation: -$68,000 (83.5% Loss Reduction)',
        'Optimal Hedge Target: Natural Gas Futures (NG=F) October Expiry'
      ],
      payload: {
        unhedgedVaR: 412000,
        hedgedVaR: 68000,
        hedgeEfficiencyRatio: 0.835
      }
    },
    {
      stage: 'STAGE 6: FINAL DECISION & ACTION',
      title: 'Synthesis & Recommendation Generation',
      source: 'FIT Executive Decision Engine',
      timestamp: '09:42:15.000',
      confidence: 84,
      result: 'Recommendation REC-2026-0941 Issued',
      details: [
        'Action: REDUCE Gulf Refiner Exposure by $4.2M',
        'Suggested Hedge: Enter Long October Natural Gas Futures (NG=F)',
        'Evidence Base: 5 Verified Data & Analysis Artifacts attached'
      ],
      payload: {
        action: "REDUCE",
        targetAsset: "XOM, CVX, MPC",
        hedgeAsset: "NG=F",
        confidence: 84
      }
    }
  ]
};
