export interface CuratedNewsItem {
  id: string;
  headline: string;
  source: string;
  publishedAt: string;
  category: 'Energy' | 'Markets' | 'Macro' | 'Corporate';
  summary: string;
  affectedAssets: string[];
  importance: 'HIGH' | 'MEDIUM' | 'LOW';
  sentiment?: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  url: string;
}

export const curatedNews: CuratedNewsItem[] = [
  {
    id: "bloomberg-1",
    headline: "China Cancels Some Fuel Shipments to Support Domestic Supply",
    source: "Bloomberg",
    publishedAt: "2026-10-01T08:00:00Z",
    category: "Energy",
    summary: "Chinese fuel exporters canceled some October oil-product cargoes as domestic supply was prioritized amid disruption in global energy markets, indicating tighter regional gasoline and diesel conditions.",
    affectedAssets: ["XOM", "CVX", "COP", "XLE"],
    importance: "HIGH",
    sentiment: "BULLISH",
    url: "https://bloomberg.com/news/articles/2026-10-01/china-cancels-some-fuel-shipments-to-support-domestic-supply"
  },
  {
    id: "bloomberg-2",
    headline: "Exxon Signs Shale Deal With Azerbaijan",
    source: "Bloomberg",
    publishedAt: "2026-09-26T10:30:00Z",
    category: "Corporate",
    summary: "ExxonMobil agreed to develop unconventional oil and gas resources in Azerbaijan's Middle Kura Basin in a deal that expands its international upstream footprint.",
    affectedAssets: ["XOM"],
    importance: "MEDIUM",
    sentiment: "BULLISH",
    url: "https://bloomberg.com/news/articles/2026-09-26/exxon-signs-shale-deal-with-azerbaijan-for-middle-kura-basin"
  },
  {
    id: "bloomberg-3",
    headline: "JPMorgan and Goldman See Mideast Oil Flows Near Pre-War Levels",
    source: "Bloomberg",
    publishedAt: "2026-09-30T14:15:00Z",
    category: "Markets",
    summary: "JPMorgan and Goldman Sachs estimated Middle East crude flows were moving back toward pre-war levels despite continued shipping risks.",
    affectedAssets: ["XOM", "CVX", "COP", "XLE"],
    importance: "HIGH",
    sentiment: "BEARISH",
    url: "https://bloomberg.com/news/articles/2026-09-30/mideast-crude-oil-flows-hit-98-of-pre-war-level-jpmorgan-says"
  },
  {
    id: "bloomberg-4",
    headline: "Stocks Fall as US-Iran Standoff Boosts Bond Yields: Markets Wrap",
    source: "Bloomberg",
    publishedAt: "2026-09-28T16:45:00Z",
    category: "Macro",
    summary: "Geopolitical tensions increased oil-market volatility and bond yields while weighing on broader equity markets.",
    affectedAssets: ["SPY", "XLE", "XOM", "CVX", "COP"],
    importance: "HIGH",
    sentiment: "BEARISH",
    url: "https://bloomberg.com/news/articles/2026-09-27/stock-market-today-dow-s-p-live-updates"
  }
];
