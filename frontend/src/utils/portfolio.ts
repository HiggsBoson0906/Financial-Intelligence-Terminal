/**
 * Centralized Portfolio Utilities & Asset Classification
 */

export const ENERGY_TICKERS = new Set(['XOM', 'CVX', 'COP', 'OXY', 'XLE']);

export const DEMO_PORTFOLIO_WEIGHTS: Record<string, number> = {
  XOM: 0.3,
  CVX: 0.2,
  COP: 0.2,
  OXY: 0.1,
  XLE: 0.1,
  SPY: 0.1,
};

export const DEMO_PORTFOLIO_VALUE = 10000000.0;

/**
 * Calculates total energy exposure from a weights dictionary.
 * Updates dynamically if portfolio configuration changes.
 */
export function calculateEnergyExposure(weights?: Record<string, number> | null): number {
  const activeWeights = weights && Object.keys(weights).length > 0 ? weights : DEMO_PORTFOLIO_WEIGHTS;
  return Object.entries(activeWeights).reduce((sum, [ticker, weight]) => {
    return ENERGY_TICKERS.has(ticker.toUpperCase()) ? sum + weight : sum;
  }, 0);
}
