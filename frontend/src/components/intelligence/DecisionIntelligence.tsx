import React, { useState } from 'react';
import { ExternalLink, ShieldAlert, Brain, CloudRain, TrendingUp, BarChart3, AlertCircle } from 'lucide-react';

import { QueryResponse } from '../../types/api';
import { calculateEnergyExposure } from '../../utils/portfolio';

interface DecisionIntelligenceProps {
  data?: QueryResponse | null;
  onExploreScenario: () => void;
  onViewEvidence: () => void;
}

export const DecisionIntelligence: React.FC<DecisionIntelligenceProps> = ({
  data,
  onExploreScenario,
  onViewEvidence,
}) => {
  const [activeTab, setActiveTab] = useState<'Overview' | 'WhyItMatters' | 'AgentViews'>('Overview');
  
  const eventName = data?.event?.event_name && data.event.event_name !== 'Not specified' ? data.event.event_name : (data?.event?.event_type && data.event.event_type !== 'Not specified' ? data.event.event_type : 'Event Analysis');
  
  // Deterministic Data State mapping (good -> LIVE, degraded -> DEGRADED, unavailable -> UNAVAILABLE)
  const rawDqStatus = data?.data_quality?.overall_status?.toLowerCase();
  const dataStatus = rawDqStatus === 'good'
    ? 'LIVE'
    : (rawDqStatus === 'degraded'
        ? 'DEGRADED'
        : (rawDqStatus === 'unavailable'
            ? 'UNAVAILABLE'
            : (data?.data_quality?.overall_status || 'SIMULATION').toUpperCase()));

  // Dynamic Impact Level based on real scenario shock data
  const rawImpactPct = data?.scenario?.portfolio_impact?.total_impact_percent 
    ?? (data?.risk?.scenario?.portfolio_shock_pct != null ? data.risk.scenario.portfolio_shock_pct * 100 : undefined);
    
  const impactLevel = data?.scenario?.portfolio_impact?.impact_level
    || data?.risk?.scenario?.impact_level
    || (rawImpactPct !== undefined
        ? (Math.abs(rawImpactPct) >= 5.0
            ? 'HIGH IMPACT'
            : Math.abs(rawImpactPct) >= 2.0
              ? 'MODERATE IMPACT'
              : 'LOW IMPACT')
        : 'IMPACT UNAVAILABLE');

  const impactBadgeClass = impactLevel === 'HIGH IMPACT'
    ? 'text-[#DC2626] dark:text-red-400 bg-[#FEE2E2] dark:bg-red-950/40'
    : impactLevel === 'MODERATE IMPACT'
      ? 'text-[#D97706] dark:text-amber-400 bg-[#FEF3C7] dark:bg-amber-950/40'
      : impactLevel === 'LOW IMPACT'
        ? 'text-[#16A34A] dark:text-green-400 bg-[#DCFCE7] dark:bg-green-950/40'
        : 'text-[#64748B] dark:text-slate-400 bg-[#F1F5F9] dark:bg-slate-800';

  // Energy exposure derived dynamically from portfolio weights
  const energyExposure = data?.portfolio_context?.energy_exposure !== undefined
    ? data.portfolio_context.energy_exposure
    : calculateEnergyExposure(data?.portfolio_context?.weights);

  // Baseline VaR (historical portfolio risk)
  const baselineVar = data?.risk?.baseline?.var_95 ?? data?.risk?.metrics?.var_95;

  // Scenario Impact (query-specific hypothetical impact)
  const scenarioImpactPct = data?.scenario?.portfolio_impact?.total_impact_percent;
  const scenarioLossVal = data?.scenario?.portfolio_impact?.expected_loss_value;

  return (
    <div className="flex flex-col justify-between h-full flex-1 select-none">
      <div>
        {/* Header & Impact Classification Badge */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] dark:border-[#1F2937]">
          <h2 className="text-[21px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            Decision Intelligence
          </h2>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${impactBadgeClass}`}>
            {impactLevel}
          </span>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-5 text-[13px] font-medium border-b border-[#F1F5F9] dark:border-[#1F2937] my-3 pb-2 text-[#64748B] dark:text-[#94A3B8]">
          <button
            onClick={() => setActiveTab('Overview')}
            className={`transition-colors relative pb-1 ${
              activeTab === 'Overview' ? 'text-[#2563EB] dark:text-blue-400 font-bold' : 'hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
            }`}
          >
            Overview
            {activeTab === 'Overview' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2563EB] dark:bg-blue-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('WhyItMatters')}
            className={`transition-colors relative pb-1 ${
              activeTab === 'WhyItMatters' ? 'text-[#2563EB] dark:text-blue-400 font-bold' : 'hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
            }`}
          >
            Why It Matters
            {activeTab === 'WhyItMatters' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2563EB] dark:bg-blue-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('AgentViews')}
            className={`transition-colors relative pb-1 ${
              activeTab === 'AgentViews' ? 'text-[#2563EB] dark:text-blue-400 font-bold' : 'hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
            }`}
          >
            Agent Views
            {activeTab === 'AgentViews' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2563EB] dark:bg-blue-400" />
            )}
          </button>
          <button
            onClick={() => onViewEvidence()}
            className="hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors relative pb-1 flex items-center gap-1 cursor-pointer"
          >
            <span>Evidence</span>
            <ExternalLink className="w-3 h-3 text-[#94A3B8]" />
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'Overview' && (
          <div className="animate-in fade-in duration-200">
            {/* Active Event Hero Card */}
            <div className="flex items-center justify-between py-4 border-b border-[#F1F5F9] dark:border-[#1F2937] mb-4">
              <div>
                <div className="text-[20px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{eventName}</div>
                <div className="text-[13px] font-medium text-[#475569] dark:text-[#94A3B8] mt-0.5">{dataStatus}</div>
                <div className="text-[12px] text-[#94A3B8] dark:text-[#64748B] font-mono-tech mt-1">
                  {dataStatus} • {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })} UTC
                </div>
              </div>

              <div className="w-12 h-12 rounded-lg bg-[#0F172A] dark:bg-[#1E293B] relative overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
                <div className="w-10 h-10 rounded-full border border-blue-500/30 animate-pulse absolute" />
                <span className="text-[24px]">🌊</span>
              </div>
            </div>

            {/* Portfolio Impact Section */}
            <div className="my-3">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] text-[14px]">
                  Portfolio Impact
                </span>
                <button 
                  onClick={onExploreScenario}
                  className="text-[11px] font-semibold text-[#2563EB] dark:text-blue-400 hover:text-[#1D4ED8] dark:hover:text-blue-300 flex items-center gap-0.5 cursor-pointer"
                >
                  <span>View in Lab</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div className="space-y-2.5 tabular-data text-[13px]">
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748B] dark:text-[#94A3B8]">Energy Exposure</span>
                    <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] text-[18px]">
                      {(energyExposure * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748B] dark:text-[#94A3B8]">Baseline VaR (95%)</span>
                    <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] text-[20px] font-mono-tech">
                      {baselineVar !== undefined ? `$${(baselineVar / 1000).toFixed(1)}K` : 'Unavailable'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748B] dark:text-[#94A3B8]">Scenario Impact</span>
                    <span className={`font-semibold text-[15px] font-mono-tech ${
                      scenarioImpactPct !== undefined
                        ? (scenarioImpactPct < 0 
                            ? 'text-[#DC2626] dark:text-red-400' 
                            : 'text-[#16A34A] dark:text-green-400')
                        : 'text-[#64748B] dark:text-[#94A3B8]'
                    }`}>
                      {scenarioImpactPct !== undefined
                        ? `${scenarioImpactPct > 0 ? '+' : ''}${scenarioImpactPct.toFixed(1)}%${scenarioLossVal !== undefined ? ` (${scenarioLossVal >= 0 ? '+$' : '-$'}${(Math.abs(scenarioLossVal) / 1000).toFixed(1)}K)` : ''}`
                        : 'Unavailable'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748B] dark:text-[#94A3B8]">Confidence</span>
                    <span className="font-semibold text-[#16A34A] dark:text-green-400 text-[14px]">
                      {data?.answer?.confidence !== undefined ? `${Math.round(data.answer.confidence * 100)}%` : 'Unavailable'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748B] dark:text-[#94A3B8]">Data State</span>
                    <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] uppercase ${
                      dataStatus === 'LIVE'
                        ? 'text-[#16A34A] dark:text-green-400 bg-[#DCFCE7] dark:bg-green-950/40'
                        : dataStatus === 'DEGRADED'
                          ? 'text-[#D97706] dark:text-amber-400 bg-[#FEF3C7] dark:bg-amber-950/40'
                          : 'text-[#64748B] dark:text-slate-400 bg-[#F1F5F9] dark:bg-slate-800'
                    }`}>
                      {dataStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RECOMMENDATION DETAILS */}
            <div className="mt-5 pt-3 border-t border-[#F1F5F9] dark:border-[#1F2937]">
              <div className="text-[14px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-3">
                Recommended Action
              </div>

              <div className="space-y-2 tabular-data text-[13px] max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {data?.recommendations && data.recommendations.length > 0 ? (
                  Object.entries(
                    data.recommendations.reduce((acc: any, rec: any) => {
                      if (!acc[rec.action]) {
                        acc[rec.action] = { ...rec, assets: [] };
                      }
                      if (rec.asset && !acc[rec.action].assets.includes(rec.asset)) {
                        acc[rec.action].assets.push(rec.asset);
                      }
                      return acc;
                    }, {})
                  ).map(([action, rec]: [string, any], idx: number) => (
                    <div key={idx} className="bg-[#F8FAFC] dark:bg-[#161F30] border border-[#F1F5F9] dark:border-[#1F2937] rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{action}</div>
                        {rec.confidence && (
                          <div className="text-[10px] font-bold text-[#16A34A] dark:text-green-400 bg-[#DCFCE7] dark:bg-green-950/40 px-1.5 py-0.5 rounded">
                            {(rec.confidence * 100).toFixed(0)}% CONFIDENCE
                          </div>
                        )}
                      </div>
                      <div className="text-[12px] text-[#475569] dark:text-[#94A3B8] leading-snug mb-2">{rec.reason || rec.rationale}</div>
                      <div className="flex flex-wrap gap-1.5">
                        {rec.assets.map((asset: string, aIdx: number) => (
                          <span key={aIdx} className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] px-1.5 py-0.5 rounded text-[11px] font-medium text-[#334155] dark:text-[#E2E8F0]">
                            {asset}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-[#F8FAFC] dark:bg-[#161F30] border border-[#F1F5F9] dark:border-[#1F2937] rounded-lg p-3">
                    <div className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] text-[13px] mb-1">Hedge Recommendation Available</div>
                    <div className="text-[12px] text-[#475569] dark:text-[#94A3B8]">
                      Execute protective put overlays on XOM and CVX to insulate against refining disruptions and oil volatility.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WHY IT MATTERS */}
        {activeTab === 'WhyItMatters' && (
          <div className="py-2 space-y-4 animate-in fade-in duration-200">
            {/* Core Thesis Card */}
            <div className="bg-[#F8FAFC] dark:bg-[#161F30] border border-[#E2E8F0] dark:border-[#1F2937] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-[13px] font-bold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC]">
                  Portfolio Vulnerability Thesis
                </span>
              </div>
              <p className="text-[13px] text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                {data?.scenario?.shock_description || 
                 data?.answer?.executive_assessment || 
                 "Severe weather and supply shocks directly impact Gulf Coast refining capacity and offshore production, creating acute asymmetric downside risk for energy-heavy portfolios."}
              </p>
            </div>

            {/* Transmission Channels */}
            <div className="space-y-2">
              <div className="text-[12px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                Key Transmission Channels
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-lg">
                  <div className="text-[10px] font-bold text-[#DC2626] dark:text-red-400 uppercase tracking-wider">1. Infrastructure</div>
                  <div className="text-[13px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] mt-1">Refinery Shocks</div>
                  <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1 leading-snug">Offshore shut-ins & processing halts restrict crude throughput.</div>
                </div>

                <div className="p-3 bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-lg">
                  <div className="text-[10px] font-bold text-[#D97706] dark:text-amber-400 uppercase tracking-wider">2. Margins</div>
                  <div className="text-[13px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] mt-1">Crack Spreads</div>
                  <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1 leading-snug">Product spreads widen, causing divergence between upstream and downstream.</div>
                </div>

                <div className="p-3 bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-lg">
                  <div className="text-[10px] font-bold text-[#2563EB] dark:text-blue-400 uppercase tracking-wider">3. Tail Risk</div>
                  <div className="text-[13px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] mt-1">VaR Escalation</div>
                  <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1 leading-snug">
                    {data?.risk?.metrics?.var_95 !== undefined ? `95% VaR expands to $${(data.risk.metrics.var_95 / 1000).toFixed(0)}K.` : 'High tail-risk concentration across energy.'}
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Factor Breakdown */}
            <div className="bg-[#F8FAFC] dark:bg-[#161F30] border border-[#E2E8F0] dark:border-[#1F2937] rounded-lg p-3">
              <div className="text-[12px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] mb-2.5">
                Factor Risk Attribution
              </div>
              <div className="grid grid-cols-3 gap-2 text-[12px] tabular-data">
                <div className="p-2 bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded">
                  <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase">Energy Sector</div>
                  <div className="text-[16px] font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                    {((data?.risk?.factor_contributions?.Energy || 0.6) * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="p-2 bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded">
                  <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase">Market Beta</div>
                  <div className="text-[16px] font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                    {((data?.risk?.factor_contributions?.Market || 0.3) * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="p-2 bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded">
                  <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase">Rates / Macro</div>
                  <div className="text-[16px] font-bold text-[#0F172A] dark:text-[#F8FAFC] mt-0.5">
                    {((data?.risk?.factor_contributions?.Rates || 0.1) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AGENT VIEWS */}
        {activeTab === 'AgentViews' && (
          <div className="py-2 space-y-2.5 animate-in fade-in duration-200 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
            {/* Agent 1: Sentiment */}
            <div className="p-3 bg-[#F8FAFC] dark:bg-[#161F30] border border-[#E2E8F0] dark:border-[#1F2937] rounded-lg">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="font-bold text-[13px] text-[#0F172A] dark:text-[#F8FAFC]">FinBERT Sentiment Agent</span>
                </div>
                <span className="text-[10px] font-bold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-950/40 px-1.5 py-0.5 rounded uppercase">
                  {data?.sentiment?.status || 'Active'}
                </span>
              </div>
              <div className="text-[12px] text-[#475569] dark:text-[#94A3B8] flex items-center justify-between">
                <span>Signal: <strong className="text-[#0F172A] dark:text-[#F8FAFC] uppercase">{data?.sentiment?.overall_sentiment || 'Neutral'}</strong></span>
                {data?.sentiment?.positive !== undefined && (
                  <span className="font-mono-tech text-[11px]">
                    POS: {(data.sentiment.positive * 100).toFixed(1)}% | NEG: {(data.sentiment.negative * 100).toFixed(1)}%
                  </span>
                )}
              </div>
              {data?.sentiment?.articles?.[0] && (
                <div className="mt-1.5 text-[11px] text-[#64748B] dark:text-[#94A3B8] italic truncate">
                  Top story: "{data.sentiment.articles[0].title}"
                </div>
              )}
            </div>

            {/* Agent 2: Weather & Macro */}
            <div className="p-3 bg-[#F8FAFC] dark:bg-[#161F30] border border-[#E2E8F0] dark:border-[#1F2937] rounded-lg">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <CloudRain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-bold text-[13px] text-[#0F172A] dark:text-[#F8FAFC]">Weather & Macro Agent</span>
                </div>
                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/40 px-1.5 py-0.5 rounded uppercase">
                  NWS + FRED
                </span>
              </div>
              <div className="text-[12px] text-[#475569] dark:text-[#94A3B8] flex items-center justify-between">
                <span>Event: <strong className="text-[#0F172A] dark:text-[#F8FAFC]">{data?.event?.event_name && data.event.event_name !== 'Not specified' ? data.event.event_name : (data?.event?.event_type && data.event.event_type !== 'Not specified' ? data.event.event_type : 'Not specified')}</strong></span>
                <span className="font-mono-tech text-[11px]">
                  WTI: ${data?.macro_weather?.macro?.WTI?.value ?? '82.40'} | Fed: {data?.macro_weather?.macro?.FedFunds?.value ?? '3.88'}%
                </span>
              </div>
            </div>

            {/* Agent 3: Quant Risk Agent */}
            <div className="p-3 bg-[#F8FAFC] dark:bg-[#161F30] border border-[#E2E8F0] dark:border-[#1F2937] rounded-lg">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="font-bold text-[13px] text-[#0F172A] dark:text-[#F8FAFC]">Quant Risk Engine</span>
                </div>
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/40 px-1.5 py-0.5 rounded uppercase">
                  {data?.risk?.status || 'Calculated'}
                </span>
              </div>
              <div className="text-[12px] text-[#475569] dark:text-[#94A3B8] flex items-center justify-between font-mono-tech">
                <span>VaR 95%: <strong className="text-red-600 dark:text-red-400">{baselineVar !== undefined ? `$${Math.round(baselineVar / 1000)}K` : 'N/A'}</strong></span>
                <span>ES: <strong className="text-red-600 dark:text-red-400">{data?.risk?.baseline?.expected_shortfall !== undefined ? `$${Math.round(data.risk.baseline.expected_shortfall / 1000)}K` : (data?.risk?.metrics?.expected_shortfall !== undefined ? `$${Math.round(data.risk.metrics.expected_shortfall / 1000)}K` : 'N/A')}</strong></span>
                <span>Vol: <strong className="text-[#0F172A] dark:text-[#F8FAFC]">{data?.risk?.baseline?.volatility !== undefined ? `${(data.risk.baseline.volatility * 100).toFixed(1)}%` : (data?.risk?.metrics?.volatility !== undefined ? `${(data.risk.metrics.volatility * 100).toFixed(1)}%` : 'N/A')}</strong></span>
              </div>
              {scenarioImpactPct !== undefined && (
                <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1.5 pt-1.5 border-t border-[#F1F5F9] dark:border-[#1F2937] flex items-center justify-between font-mono-tech">
                  <span>Scenario Shock:</span>
                  <strong className={scenarioImpactPct < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                    {scenarioImpactPct > 0 ? '+' : ''}{scenarioImpactPct.toFixed(1)}% {scenarioLossVal !== undefined ? `(${scenarioLossVal >= 0 ? '+$' : '-$'}${Math.round(Math.abs(scenarioLossVal) / 1000)}K)` : ''}
                  </strong>
                </div>
              )}
            </div>

            {/* Agent 4: Hedging Strategy Agent */}
            <div className="p-3 bg-[#F8FAFC] dark:bg-[#161F30] border border-[#E2E8F0] dark:border-[#1F2937] rounded-lg">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-bold text-[13px] text-[#0F172A] dark:text-[#F8FAFC]">Hedging Strategy Agent</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded uppercase">
                  Synthesized
                </span>
              </div>
              <div className="text-[12px] text-[#475569] dark:text-[#94A3B8]">
                {data?.recommendations?.[0] ? (
                  <div>
                    <strong className="text-[#0F172A] dark:text-[#F8FAFC]">{data.recommendations[0].action}:</strong> {data.recommendations[0].reason || (data.recommendations[0] as any).rationale}
                  </div>
                ) : (
                  <div>Structured defensive options overlay with delta-neutral energy reallocation.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#F1F5F9] dark:border-[#1F2937] mt-4">
        <button
          onClick={onExploreScenario}
          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-medium py-2.5 px-4 rounded-lg shadow-sm transition-colors text-center cursor-pointer"
        >
          Explore Scenario
        </button>

        <button
          onClick={onViewEvidence}
          className="bg-white dark:bg-[#161F30] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#1F2937] text-[#0F172A] dark:text-[#F8FAFC] text-[13px] font-medium py-2.5 px-4 rounded-lg shadow-xs transition-colors text-center cursor-pointer"
        >
          View Evidence
        </button>
      </div>
    </div>
  );
};
