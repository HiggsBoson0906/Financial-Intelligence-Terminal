export interface MarketPoint {
  timestamp: string; // ISO 8601 string
  price: number;
  volume?: number;
}

export interface MarketSeries {
  symbol: string;
  points: MarketPoint[];
  currentPrice: number;
  changePercent: number;
  sensitivity: 'LOW' | 'MEDIUM' | 'HIGH';
  estimatedImpact: string;
}

// FUTURE: Set to 'live' when backend is ready
export const MARKET_DATA_MODE: 'demo' | 'live' = 'demo';

// Future API fetching function
export async function fetchLiveMarketData(symbol: string, timeRange: string): Promise<MarketSeries> {
  const response = await fetch(`/api/v1/market/${symbol}?range=${timeRange}`, {
    headers: { 'ngrok-skip-browser-warning': 'true' }
  });
  if (!response.ok) {
    throw new Error('Market data unavailable');
  }
  return response.json();
}
