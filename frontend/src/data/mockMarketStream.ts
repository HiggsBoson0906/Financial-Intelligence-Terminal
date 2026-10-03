import { MarketSeries, MarketPoint } from '../services/marketApi';

// Initial baseline mock configurations
const ASSET_CONFIGS: Record<string, { basePrice: number, sensitivity: 'LOW'|'MEDIUM'|'HIGH', impact: string, volatility: number }> = {
  WTI: { basePrice: 80.42, sensitivity: 'HIGH', impact: '+4.2%', volatility: 0.15 },
  BRENT: { basePrice: 84.15, sensitivity: 'HIGH', impact: '+3.8%', volatility: 0.14 },
  XOM: { basePrice: 112.30, sensitivity: 'MEDIUM', impact: '-1.5%', volatility: 0.2 },
  CVX: { basePrice: 160.45, sensitivity: 'MEDIUM', impact: '-1.8%', volatility: 0.25 },
  XLE: { basePrice: 88.75, sensitivity: 'MEDIUM', impact: '-1.0%', volatility: 0.18 },
  SPY: { basePrice: 512.20, sensitivity: 'LOW', impact: '-0.5%', volatility: 0.4 },
  VIX: { basePrice: 14.50, sensitivity: 'HIGH', impact: '+8.2%', volatility: 0.1 },
};

// Store current state for smooth continuous updates
const currentStates: Record<string, { currentPrice: number, history: MarketPoint[] }> = {};

/**
 * Initializes or resets the mock data for an asset based on a time range.
 * This simulates pulling historical data for the chart.
 */
export function getInitialDemoMarketData(symbol: string, timeRange: string): MarketSeries {
  const config = ASSET_CONFIGS[symbol] || ASSET_CONFIGS['WTI'];
  
  // Decide how many historical points to generate based on timeRange
  const numPoints = 60; // Fixed window size for the chart
  const history: MarketPoint[] = [];
  
  let price = config.basePrice;
  const now = Date.now();
  
  // Time gap between points based on range
  const timeStepMs = timeRange === '1D' ? 60000 * 5 : // 5 min
                     timeRange === '1W' ? 60000 * 60 : // 1 hour
                     timeRange === '1M' ? 60000 * 60 * 6 : // 6 hours
                     timeRange === '3M' ? 60000 * 60 * 24 : // 1 day
                     60000 * 60 * 24 * 3; // 3 days (1Y)

  // Generate historical points backwards, then reverse
  for (let i = numPoints - 1; i >= 0; i--) {
    history.push({
      timestamp: new Date(now - i * timeStepMs).toISOString(),
      price: price
    });
    // Add random walk
    price = price + (Math.random() - 0.5) * config.volatility;
  }
  
  const currentPrice = history[history.length - 1].price;
  
  currentStates[symbol] = {
    currentPrice,
    history
  };

  const changePercent = ((currentPrice - config.basePrice) / config.basePrice) * 100;

  return {
    symbol,
    points: [...history],
    currentPrice,
    changePercent,
    sensitivity: config.sensitivity,
    estimatedImpact: config.impact
  };
}

/**
 * Generates the next tick for the specified asset to simulate real-time streaming.
 */
export function getNextDemoMarketTick(symbol: string, timeRange: string): MarketSeries {
  const config = ASSET_CONFIGS[symbol] || ASSET_CONFIGS['WTI'];
  
  if (!currentStates[symbol]) {
    return getInitialDemoMarketData(symbol, timeRange);
  }
  
  const state = currentStates[symbol];
  
  // Random walk based on previous price
  const change = (Math.random() - 0.5) * config.volatility;
  const newPrice = state.currentPrice + change;
  
  const newPoint: MarketPoint = {
    timestamp: new Date().toISOString(),
    price: newPrice
  };
  
  // Update rolling history (keep last 60 points)
  state.history.push(newPoint);
  if (state.history.length > 60) {
    state.history.shift();
  }
  state.currentPrice = newPrice;
  
  const changePercent = ((newPrice - config.basePrice) / config.basePrice) * 100;
  
  return {
    symbol,
    points: [...state.history],
    currentPrice: newPrice,
    changePercent,
    sensitivity: config.sensitivity,
    estimatedImpact: config.impact
  };
}
