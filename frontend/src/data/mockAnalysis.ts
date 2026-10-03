import { AnalysisSnapshot } from '../utils/intelligenceDiff';

export const mockInitialAnalysis: AnalysisSnapshot = {
  queryId: "q1",
  wtiPrice: 78.4,
  vix: 18.2,
  energyExposure: 43,
  historicalMatch: null,
  historicalSimilarity: null,
  scenarioImpact: null,
  hedgeRecommendation: null,
  riskVaR: 184000
};

export const mockNewAnalysis: AnalysisSnapshot = {
  queryId: "q2",
  wtiPrice: 81.7,
  vix: 22.1,
  energyExposure: 43,
  historicalMatch: "Hurricane Ida",
  historicalSimilarity: 68,
  scenarioImpact: -3.7,
  hedgeRecommendation: "SPY allocation +5%",
  riskVaR: 248000
};
