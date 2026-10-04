export interface HistoricalEventRecord {
  id: string;
  eventName: string;
  year: number;
  date: string;
  category: string;
  region: string;
  returns5d: {
    XOM: number; // in percent, e.g. 5.36 means +5.36%
    CVX: number;
    COP: number;
    OXY: number;
    XLE: number;
    SPY: number;
  };
  observation: string;
}

export interface AssetBehaviorRecord {
  symbol: string;
  name: string;
  sector: string;
  mean5dReturn: number; // +0.26%
  volatility: number;   // 3.52%
  positiveEventFreq: number; // 54.3%
  eventsCount: number; // 291
}

/**
 * Verified historical event observations from project dataset
 * (data/processed/event_impact_dataset.csv).
 * IMPORTANT: These values are historical context examples, NOT forecasts.
 */
export const HISTORICAL_EVENTS: HistoricalEventRecord[] = [
  {
    id: 'rafael_2024',
    eventName: 'Hurricane Rafael',
    year: 2024,
    date: '2024-11-03',
    category: 'Category 3',
    region: 'US Gulf Coast / Gulf of Mexico',
    returns5d: {
      XOM: 5.36,
      CVX: 2.52,
      COP: 4.20,
      OXY: 1.94,
      XLE: 6.50,
      SPY: 4.75,
    },
    observation: 'Energy assets showed uniform positive 5-day reactions in this historical episode, led by XLE (+6.50%) and XOM (+5.36%).',
  },
  {
    id: 'idalia_2023',
    eventName: 'Hurricane Idalia',
    year: 2023,
    date: '2023-08-26',
    category: 'Category 4',
    region: 'US Gulf Coast / Gulf of Mexico',
    returns5d: {
      XOM: 4.87,
      CVX: 3.26,
      COP: 4.82,
      OXY: 4.41,
      XLE: 3.60,
      SPY: 2.55,
    },
    observation: 'Gulf energy producers experienced broad positive 5-day post-event performance, outperforming the S&P 500 benchmark (+2.55%).',
  },
  {
    id: 'ian_2022',
    eventName: 'Hurricane Ian',
    year: 2022,
    date: '2022-09-22',
    category: 'Category 5',
    region: 'US Gulf Coast / Gulf of Mexico',
    returns5d: {
      XOM: -2.09,
      CVX: -6.53,
      COP: -4.46,
      OXY: 0.37,
      XLE: -4.10,
      SPY: -3.05,
    },
    observation: 'Major Category 5 episode coincided with negative 5-day reactions across energy equities (CVX -6.53%, COP -4.46%) amidst broader market declines.',
  },
  {
    id: 'ida_2021',
    eventName: 'Hurricane Ida',
    year: 2021,
    date: '2021-08-26',
    category: 'Category 4',
    region: 'US Gulf Coast / Gulf of Mexico',
    returns5d: {
      XOM: 0.68,
      CVX: 0.50,
      COP: 2.67,
      OXY: 10.75,
      XLE: 1.81,
      SPY: 1.55,
    },
    observation: 'Upstream exploration assets posted strong 5-day post-landfall gains (OXY +10.75%, COP +2.67%) while integrated majors saw modest gains.',
  },
  {
    id: 'beryl_2024',
    eventName: 'Hurricane Beryl',
    year: 2024,
    date: '2024-06-28',
    category: 'Category 5',
    region: 'Caribbean Basin',
    returns5d: {
      XOM: -2.55,
      CVX: -1.34,
      COP: -1.88,
      OXY: -3.30,
      XLE: -1.76,
      SPY: 2.03,
    },
    observation: 'Early-season Category 5 storm exhibited negative 5-day energy returns across all 5 monitored oil equities while SPY advanced +2.03%.',
  },
  {
    id: 'laura_2020',
    eventName: 'Hurricane Laura',
    year: 2020,
    date: '2020-08-20',
    category: 'Category 4',
    region: 'US Gulf Coast / Gulf of Mexico',
    returns5d: {
      XOM: -3.82,
      CVX: 0.12,
      COP: -1.60,
      OXY: -2.69,
      XLE: -1.27,
      SPY: 2.97,
    },
    observation: 'Refining and production hub landfall saw divergent reactions; CVX remained flat (+0.12%) while XOM contracted (-3.82%).',
  },
  {
    id: 'harvey_2017',
    eventName: 'Hurricane Harvey',
    year: 2017,
    date: '2017-08-16',
    category: 'Category 4',
    region: 'US Gulf Coast / Gulf of Mexico',
    returns5d: {
      XOM: -1.11,
      CVX: -0.22,
      COP: 0.00,
      OXY: -0.17,
      XLE: -0.35,
      SPY: -0.96,
    },
    observation: 'Massive Texas coastal flooding resulted in muted, mildly negative 5-day equity price adjustments across Gulf producers.',
  },
];

/**
 * Verified aggregate historical statistics across 291 tropical cyclone events
 * from data/processed/event_impact_dataset.csv.
 * NOTE: These are dataset statistics, NOT current market values.
 */
export const ASSET_HISTORICAL_BEHAVIOR: AssetBehaviorRecord[] = [
  {
    symbol: 'XOM',
    name: 'ExxonMobil Corp.',
    sector: 'Integrated Oil & Gas',
    mean5dReturn: 0.26,
    volatility: 3.52,
    positiveEventFreq: 54.3,
    eventsCount: 291,
  },
  {
    symbol: 'CVX',
    name: 'Chevron Corp.',
    sector: 'Integrated Oil & Gas',
    mean5dReturn: 0.17,
    volatility: 3.40,
    positiveEventFreq: 56.0,
    eventsCount: 291,
  },
  {
    symbol: 'COP',
    name: 'ConocoPhillips',
    sector: 'Exploration & Production',
    mean5dReturn: 0.42,
    volatility: 4.58,
    positiveEventFreq: 54.3,
    eventsCount: 291,
  },
  {
    symbol: 'OXY',
    name: 'Occidental Petroleum Corp.',
    sector: 'Exploration & Production',
    mean5dReturn: 0.23,
    volatility: 7.03,
    positiveEventFreq: 49.8,
    eventsCount: 291,
  },
  {
    symbol: 'XLE',
    name: 'Energy Select Sector SPDR',
    sector: 'Energy ETF Benchmark',
    mean5dReturn: 0.23,
    volatility: 3.81,
    positiveEventFreq: 51.9,
    eventsCount: 291,
  },
  {
    symbol: 'SPY',
    name: 'SPDR S&P 500 ETF Trust',
    sector: 'Broad Market Benchmark',
    mean5dReturn: 0.27,
    volatility: 2.19,
    positiveEventFreq: 58.8,
    eventsCount: 291,
  },
];

export const DATASET_METADATA = {
  totalEvents: 291,
  eventType: 'Tropical Cyclone Events (Atlantic & Gulf Basins)',
  monitoredAssetsCount: 6,
  assets: ['XOM', 'CVX', 'COP', 'OXY', 'XLE', 'SPY'],
  dateRange: '2010 – 2024',
  disclaimer: 'Historical observations are contextual evidence, not forecasts. Historical performance does not guarantee future results.',
};
