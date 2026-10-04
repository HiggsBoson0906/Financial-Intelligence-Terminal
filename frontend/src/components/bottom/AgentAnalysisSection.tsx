import React from 'react';
import { CheckCircle2, Hourglass, XCircle } from 'lucide-react';
import { QueryResponse, AgentTraceStep } from '../../types/api';

interface AgentAnalysisSectionProps {
  data?: QueryResponse | null;
  onSelectAgent?: (agentName: string) => void;
}

export const AgentAnalysisSection: React.FC<AgentAnalysisSectionProps> = ({ data, onSelectAgent }) => {
  const agentTrace = data?.agent_trace || [];
  
  const getAgentStatus = (name: string) => {
    if (!data) return { status: 'Waiting', latency: '—' };
    const trace = agentTrace.find(a => a.agent.toLowerCase().includes(name.toLowerCase()));
    if (!trace) return { status: 'COMPLETED', latency: '—' };
    
    const statusUpper = trace.status.toUpperCase();
    const isDone = statusUpper === 'SUCCESS' || statusUpper === 'COMPLETED';
    return { 
      status: isDone ? 'COMPLETED' : statusUpper === 'ERROR' ? 'ERROR' : 'COMPLETED',
      latency: trace.latency_ms ? `${(trace.latency_ms / 1000).toFixed(2)}s` : '—'
    };
  };

  const sentimentStats = getAgentStatus('sentiment');
  const marketStats = getAgentStatus('market');
  const riskStats = getAgentStatus('risk');
  const hedgeStats = getAgentStatus('hedge');

  return (
    <div className="fit-card p-6 select-none h-full flex flex-col justify-between">
      {/* Header */}
      <div className="pb-4 border-b border-[#F1F5F9] dark:border-[#1F2937] mb-4">
        <h2 className="text-[21px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
          Agent Analysis
        </h2>
      </div>

      {/* 4 Agent Connected Chain */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-[#F1F5F9] dark:divide-[#1F2937] items-stretch border border-[#F1F5F9] dark:border-[#1F2937] rounded-lg">
        {/* Agent 1: Sentiment Agent */}
        <div
          onClick={() => onSelectAgent?.('Sentiment Agent')}
          className="p-5 hover:bg-[#F8FAFC] dark:hover:bg-[#161F30] transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              {sentimentStats.status === 'COMPLETED' ? <CheckCircle2 className="w-4 h-4 text-[#16A34A] dark:text-green-400" /> : <Hourglass className="w-4 h-4 text-[#D97706] dark:text-amber-400" />}
              <span className="font-semibold text-[14px] text-[#0F172A] dark:text-[#F8FAFC]">Sentiment Agent</span>
            </div>
            <div className="text-[12px] font-semibold text-[#16A34A] dark:text-green-400 mb-4">{sentimentStats.status}</div>

            <div className="space-y-2 tabular-data text-[13px] text-[#475569] dark:text-[#94A3B8]">
              <div className="flex items-center justify-between">
                <span>Sources</span>
                <span className="font-semibold text-[16px] text-[#0F172A] dark:text-[#F8FAFC]">
                  {data?.sentiment?.articles ? new Set(data.sentiment.articles.map((a: any) => a.source)).size : (data?.sentiment?.metrics?.sources_analyzed ?? 'N/A')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Articles</span>
                <span className="font-semibold text-[16px] text-[#0F172A] dark:text-[#F8FAFC]">
                  {data?.sentiment?.article_count ?? data?.sentiment?.metrics?.articles_analyzed ?? 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Sentiment</span>
                <span className="font-semibold text-[#DC2626] dark:text-red-400 text-right capitalize">
                  {data?.sentiment?.overall_sentiment !== undefined 
                    ? <span className="text-[16px]">{data.sentiment.overall_sentiment}</span>
                    : data?.sentiment?.sentiment_score !== undefined 
                      ? <span className="text-[16px]">{data.sentiment.sentiment_score.toFixed(2)}</span>
                      : <span className="text-[10px] leading-tight w-24 inline-block">SEMANTIC MODEL UNAVAILABLE</span>}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-[#F1F5F9] dark:border-[#1F2937] flex justify-between text-[11px] tabular-data text-[#94A3B8] dark:text-[#64748B]">
            <span>Runtime</span>
            <span>{sentimentStats.latency}</span>
          </div>
        </div>

        {/* Agent 2: Weather & Macro */}
        <div
          onClick={() => onSelectAgent?.('WEATHER & MACRO')}
          className="p-5 hover:bg-[#F8FAFC] dark:hover:bg-[#161F30] transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              {marketStats.status === 'COMPLETED' ? <CheckCircle2 className="w-4 h-4 text-[#16A34A] dark:text-green-400" /> : <Hourglass className="w-4 h-4 text-[#D97706] dark:text-amber-400" />}
              <span className="font-semibold text-[14px] text-[#0F172A] dark:text-[#F8FAFC]">WEATHER & MACRO</span>
            </div>
            <div className="text-[12px] font-semibold text-[#16A34A] dark:text-green-400 mb-4">{marketStats.status}</div>

            <div className="space-y-2 tabular-data text-[13px] text-[#475569] dark:text-[#94A3B8]">
              <div className="flex items-center justify-between">
                <span>Input</span>
                <span className="font-semibold text-[13px] text-[#0F172A] dark:text-[#F8FAFC] text-right ml-2">{data?.event?.event_name || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Condition</span>
                <span className="font-semibold text-[13px] text-[#0F172A] dark:text-[#F8FAFC] text-right ml-2 truncate w-32" title={data?.macro_weather?.weather?.forecast?.shortForecast || data?.macro_weather?.weather?.error || 'N/A'}>{data?.macro_weather?.weather?.forecast?.shortForecast || (data?.macro_weather?.weather?.error ? 'Unavailable' : 'N/A')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Alerts</span>
                <span className="font-semibold text-[13px] text-[#DC2626] dark:text-red-400 text-right ml-2 truncate w-32" title={data?.macro_weather?.weather?.alerts?.[0]?.event || 'N/A'}>{data?.macro_weather?.weather?.alerts?.[0]?.event || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Confidence</span>
                <span className="font-semibold text-[16px] text-[#16A34A] dark:text-green-400">{data?.answer?.confidence ? `${Math.round(data.answer.confidence * 100)}%` : 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-[#F1F5F9] dark:border-[#1F2937] flex justify-between text-[11px] tabular-data text-[#94A3B8] dark:text-[#64748B]">
            <span>Runtime</span>
            <span>{marketStats.latency}</span>
          </div>
        </div>

        {/* Agent 3: Quant Risk */}
        <div
          onClick={() => onSelectAgent?.('Quant Risk')}
          className="p-5 hover:bg-[#F8FAFC] dark:hover:bg-[#161F30] transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              {riskStats.status === 'COMPLETED' ? <CheckCircle2 className="w-4 h-4 text-[#16A34A] dark:text-green-400" /> : riskStats.status === 'Waiting' ? <Hourglass className="w-4 h-4 text-[#D97706] dark:text-amber-400" /> : <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] pulse-dot inline-block shrink-0" />}
              <span className="font-semibold text-[14px] text-[#0F172A] dark:text-[#F8FAFC]">Quant Risk</span>
            </div>
            <div className="text-[12px] font-semibold text-[#2563EB] dark:text-blue-400 mb-4">{riskStats.status}</div>

            <div className="space-y-2 tabular-data text-[13px] text-[#475569] dark:text-[#94A3B8]">
              <div className="flex items-center justify-between">
                <span>VaR (95%)</span>
                <span className="font-semibold text-[16px] text-[#DC2626] dark:text-red-400">{data?.risk?.metrics?.var_95 !== undefined ? `$${Math.round(data.risk.metrics.var_95 / 1000)}K` : 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>ES</span>
                <span className="font-semibold text-[16px] text-[#DC2626] dark:text-red-400">{data?.risk?.metrics?.expected_shortfall !== undefined ? `$${Math.round(data.risk.metrics.expected_shortfall / 1000)}K` : 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Method</span>
                <span className="font-semibold text-[14px] text-[#0F172A] dark:text-[#F8FAFC]">Statistical</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-[#F1F5F9] dark:border-[#1F2937] flex justify-between text-[11px] tabular-data text-[#94A3B8] dark:text-[#64748B]">
            <span>Runtime</span>
            <span>{riskStats.latency}</span>
          </div>
        </div>

        {/* Agent 4: Hedging Agent */}
        <div
          onClick={() => onSelectAgent?.('Hedging Agent')}
          className="p-5 hover:bg-[#F8FAFC] dark:hover:bg-[#161F30] transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              {hedgeStats.status === 'COMPLETED' ? <CheckCircle2 className="w-4 h-4 text-[#16A34A] dark:text-green-400" /> : <Hourglass className="w-4 h-4 text-[#D97706] dark:text-amber-400" />}
              <span className="font-semibold text-[14px] text-[#0F172A] dark:text-[#F8FAFC]">Hedging Agent</span>
            </div>
            <div className="text-[12px] font-semibold text-[#64748B] dark:text-[#94A3B8] mb-4">{hedgeStats.status}</div>

            <div className="space-y-2 tabular-data text-[13px] text-[#475569] dark:text-[#94A3B8]">
              <div className="flex items-center justify-between">
                <span>Strategy</span>
                <span className="font-semibold text-[14px] text-[#0F172A] dark:text-[#F8FAFC] truncate w-24 text-right" title={data?.recommendations?.[0]?.action || 'N/A'}>{data?.recommendations?.[0]?.action || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Est. Reduction</span>
                <span className="font-semibold text-[16px] text-[#16A34A] dark:text-green-400">{data?.recommendations?.[0]?.expected_effect?.stress_loss_change !== undefined ? `${(data.recommendations[0].expected_effect.stress_loss_change * 100).toFixed(1)}%` : 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Status</span>
                <span className="text-[10px] font-bold text-[#16A34A] dark:text-green-400 bg-[#DCFCE7] dark:bg-green-950/40 px-1.5 py-0.5 rounded uppercase">
                  Simulation
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-[#F1F5F9] dark:border-[#1F2937] flex justify-between text-[11px] tabular-data text-[#94A3B8] dark:text-[#64748B]">
            <span>Runtime</span>
            <span>{hedgeStats.latency}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
