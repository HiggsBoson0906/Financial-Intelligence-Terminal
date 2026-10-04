export interface QueryRequest {
  query: string;
  include_risk_metrics?: boolean;
  conversation_id?: string | null;
  parent_run_id?: string | null;
}

export interface LLMMetadata {
  provider?: string | null;
  model_used?: string | null;
  attempts: number;
  fallback_used: boolean;
  status?: string | null;
}

export interface PortfolioAction {
  available: boolean;
  mode: string;
  target: string;
  execution_enabled: boolean;
}

export interface ExecutionStatus {
  mode: string;
  executed: boolean;
}

export interface ExpectedEffect {
  portfolio_risk_change: number;
  stress_loss_change: number;
  description: string;
}

export interface RecommendationResponse {
  id: string;
  type: string;
  asset: string;
  action: string;
  target_weight?: number | null;
  allocation_change?: number | null;
  confidence: number;
  reason: string;
  expected_effect: ExpectedEffect;
  assumptions: string[];
  supporting_evidence: string[];
  portfolio_action: PortfolioAction;
  execution: ExecutionStatus;
  data_status: string;
}

export interface RecommendationExplanation {
  rec_id: string;
  narrative: string;
}

export interface AnswerResponse {
  summary: string;
  executive_assessment: string;
  key_findings: string[];
  risk_explanation: string[];
  historical_context: string[];
  recommendation_explanations: RecommendationExplanation[] | any[];
  next_steps: string[];
  what_to_watch: string[];
  limitations: string[];
  details: string[];
  key_insights: string[];
  confidence: number;
}

export interface DataQualityResponse {
  overall_status: string;
  sources: Record<string, string>;
  warnings: string[];
}

export interface SourceLink {
  id: string;
  name: string;
  category: "dataset" | "api" | "article" | "historical_event" | "other";
  url: string;
  title?: string;
  description?: string;
  status: "used" | "fallback" | "unavailable";
  provider?: string;
  citation?: string;
}

export interface LatencyResponse {
  total_ms: number;
  agents_ms: number;
  rag_ms: number;
  risk_ms: number;
  llm_ms: number;
}

export interface AgentTraceStep {
  agent: string;
  status: string;
  latency_ms?: number;
  [key: string]: any;
}

export interface QueryResponse {
  run_id: string;
  status: string;
  query: string;
  
  answer: AnswerResponse;
  
  market_context: Record<string, any>;
  portfolio_context?: Record<string, any>;
  event: Record<string, any>;
  sentiment: Record<string, any>;
  macro_weather: Record<string, any>;
  historical_matches: any[];
  cross_asset_context: any[];
  
  risk: Record<string, any>;
  scenario: Record<string, any>;
  recommendations: RecommendationResponse[];
  
  agent_trace: AgentTraceStep[];
  evidence: any[];
  
  data_quality: DataQualityResponse;
  latency: LatencyResponse;
  llm: LLMMetadata;

  sources?: SourceLink[];
  data_sources?: SourceLink[];
  web_sources?: SourceLink[];
}
