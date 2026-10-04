import type { QueryResponse } from '../types/api';

export type Severity = 'CRITICAL' | 'WARNING' | 'INFO' | 'POSITIVE';
export type DataStatus = 'LIVE' | 'HISTORICAL' | 'SIMULATION' | 'MODEL' | 'FALLBACK' | 'STALE' | 'SIMULATION ONLY';

export interface IntelligenceFinding {
  id: string;
  type: string;
  title: string;
  message: string;
  source: string;
  dataStatus: DataStatus;
  severity: Severity;
  priority: number;
  targetSectionId?: string;
}

export interface AnalysisSnapshot {
  queryId: string;
  wtiPrice: number;
  vix: number;
  energyExposure: number;
  historicalMatch: string | null;
  historicalSimilarity: number | null;
  scenarioImpact: number | null;
  hedgeRecommendation: string | null;
  riskVaR: number;
}

export const createSnapshotFromResponse = (response: QueryResponse): AnalysisSnapshot => {
  return {
    queryId: response.run_id,
    wtiPrice: response.market_context?.prices?.WTI || 0,
    vix: response.market_context?.prices?.VIX || 0,
    energyExposure: response.recommendations?.[0]?.expected_effect?.portfolio_risk_change || 0,
    historicalMatch: response.historical_matches?.[0]?.event_name || null,
    historicalSimilarity: response.historical_matches?.[0]?.similarity_score ? Math.round(response.historical_matches[0].similarity_score * 100) : null,
    scenarioImpact: response.scenario?.portfolio_impact?.total_impact_percent || null,
    hedgeRecommendation: response.recommendations?.[0]?.action || null,
    riskVaR: response.risk?.metrics?.var_95 || 0,
  };
};

export const detectNewIntelligence = (
  prev: AnalysisSnapshot | null,
  curr: AnalysisSnapshot
): IntelligenceFinding[] => {
  const findings: IntelligenceFinding[] = [];

  if (!prev) {
    findings.push({
      id: 'initial',
      type: 'system',
      title: 'INITIAL ANALYSIS',
      message: 'Initial portfolio analysis completed.',
      source: 'System',
      dataStatus: 'MODEL',
      severity: 'INFO',
      priority: 0,
    });
    return findings;
  }

  // 1. Major portfolio risk change (var increase)
  if (curr.riskVaR > prev.riskVaR * 1.05) {
    findings.push({
      id: 'risk-increase',
      type: 'risk',
      title: 'RISK CHANGED',
      message: `Portfolio VaR increased to $${(curr.riskVaR/1000).toFixed(1)}K`,
      source: 'Risk Agent',
      dataStatus: 'MODEL',
      severity: 'CRITICAL',
      priority: 1,
      targetSectionId: 'risk',
    });
  } else if (curr.riskVaR !== prev.riskVaR) {
    findings.push({
      id: 'risk-change',
      type: 'risk',
      title: 'RISK CHANGED',
      message: `Portfolio VaR is now $${(curr.riskVaR/1000).toFixed(1)}K`,
      source: 'Risk Agent',
      dataStatus: 'MODEL',
      severity: 'WARNING',
      priority: 1,
      targetSectionId: 'risk',
    });
  }

  // 2. New scenario impact
  if (curr.scenarioImpact !== prev.scenarioImpact && curr.scenarioImpact !== null) {
    findings.push({
      id: 'scenario',
      type: 'scenario',
      title: 'NEW SCENARIO',
      message: `Estimated portfolio impact: ${curr.scenarioImpact > 0 ? '+' : ''}${curr.scenarioImpact}%`,
      source: 'Risk Agent',
      dataStatus: 'SIMULATION',
      severity: curr.scenarioImpact < 0 ? 'WARNING' : 'POSITIVE',
      priority: 2,
      targetSectionId: 'scenario-lab',
    });
  }

  // 3. New hedge recommendation
  if (curr.hedgeRecommendation !== prev.hedgeRecommendation && curr.hedgeRecommendation !== null) {
    findings.push({
      id: 'hedge',
      type: 'hedge',
      title: 'NEW HEDGE RECOMMENDATION',
      message: curr.hedgeRecommendation,
      source: 'Hedging Agent',
      dataStatus: 'SIMULATION ONLY',
      severity: 'POSITIVE',
      priority: 3,
      targetSectionId: 'strategy',
    });
  }

  // 4. Major market signal
  if (curr.vix !== prev.vix) {
    const isUp = curr.vix > prev.vix;
    findings.push({
      id: 'market-vix',
      type: 'market',
      title: 'MARKET SIGNAL',
      message: `VIX ${isUp ? 'increased' : 'decreased'} to ${curr.vix}`,
      source: 'Weather & Macro Agent',
      dataStatus: 'LIVE',
      severity: isUp ? 'WARNING' : 'INFO',
      priority: 4,
      targetSectionId: 'market-pulse',
    });
  }

  // 5. New historical analogue
  if (curr.historicalMatch !== prev.historicalMatch && curr.historicalMatch !== null) {
    findings.push({
      id: 'historical',
      type: 'historical',
      title: 'NEW HISTORICAL MATCH',
      message: `${curr.historicalMatch} — ${curr.historicalSimilarity}% similarity`,
      source: 'Historical RAG',
      dataStatus: 'HISTORICAL',
      severity: 'INFO',
      priority: 5,
      targetSectionId: 'historical-analogs',
    });
  }

  // Sort by priority
  return findings.sort((a, b) => a.priority - b.priority);
};
