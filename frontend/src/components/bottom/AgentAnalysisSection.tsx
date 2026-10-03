import React from 'react';
import { CheckCircle2, ArrowRight, Hourglass } from 'lucide-react';

interface AgentAnalysisSectionProps {
  onSelectAgent?: (agentName: string) => void;
}

export const AgentAnalysisSection: React.FC<AgentAnalysisSectionProps> = ({ onSelectAgent }) => {
  return (
    <div className="fit-card p-6 select-none h-full flex flex-col justify-between">
      {/* Header */}
      <div className="pb-4 border-b border-[#F1F5F9] mb-4">
        <h2 className="text-[21px] font-bold text-[#0F172A]">
          Agent Analysis
        </h2>
      </div>

      {/* 4 Agent Connected Chain */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-[#F1F5F9] items-stretch border border-[#F1F5F9] rounded-lg">
        {/* Agent 1: Sentiment Agent */}
        <div
          onClick={() => onSelectAgent?.('Sentiment Agent')}
          className="p-5 hover:bg-[#F8FAFC] transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
              <span className="font-semibold text-[14px] text-[#0F172A]">Sentiment Agent</span>
            </div>
            <div className="text-[12px] font-semibold text-[#16A34A] mb-4">Complete</div>

            <div className="space-y-2 tabular-data text-[13px] text-[#475569]">
              <div className="flex items-center justify-between">
                <span>Sources</span>
                <span className="font-semibold text-[16px] text-[#0F172A]">17</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Articles</span>
                <span className="font-semibold text-[16px] text-[#0F172A]">42</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Sentiment</span>
                <span className="font-semibold text-[16px] text-[#DC2626]">-0.72</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-[#F1F5F9] flex justify-between text-[11px] tabular-data text-[#94A3B8]">
            <span>Runtime</span>
            <span>1.8s</span>
          </div>
        </div>

        {/* Agent 2: Weather & Macro */}
        <div
          onClick={() => onSelectAgent?.('WEATHER & MACRO')}
          className="p-5 hover:bg-[#F8FAFC] transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
              <span className="font-semibold text-[14px] text-[#0F172A]">WEATHER & MACRO</span>
            </div>
            <div className="text-[12px] font-semibold text-[#16A34A] mb-4">Complete</div>

            <div className="space-y-2 tabular-data text-[13px] text-[#475569]">
              <div className="flex items-center justify-between">
                <span>Input</span>
                <span className="font-semibold text-[13px] text-[#0F172A] text-right ml-2">Bay of Bengal flood event</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Sources</span>
                <span className="font-semibold text-[13px] text-[#0F172A] text-right ml-2">Weather data, Historical events</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Finding</span>
                <span className="font-semibold text-[13px] text-[#DC2626] text-right ml-2">Elevated infrastructure risk</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Confidence</span>
                <span className="font-semibold text-[16px] text-[#16A34A]">82%</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-[#F1F5F9] flex justify-between text-[11px] tabular-data text-[#94A3B8]">
            <span>Runtime</span>
            <span>1.42s</span>
          </div>
        </div>

        {/* Agent 3: Quant Risk */}
        <div
          onClick={() => onSelectAgent?.('Quant Risk')}
          className="p-5 hover:bg-[#F8FAFC] transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] pulse-dot inline-block shrink-0" />
              <span className="font-semibold text-[14px] text-[#0F172A]">Quant Risk</span>
            </div>
            <div className="text-[12px] font-semibold text-[#2563EB] mb-4">Running</div>

            <div className="space-y-2 tabular-data text-[13px] text-[#475569]">
              <div className="flex items-center justify-between">
                <span>VaR</span>
                <span className="font-semibold text-[16px] text-[#DC2626]">+14.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>ES</span>
                <span className="font-semibold text-[16px] text-[#DC2626]">+18.7%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Method</span>
                <span className="font-semibold text-[14px] text-[#0F172A]">Monte Carlo</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-[#F1F5F9] flex justify-between text-[11px] tabular-data text-[#94A3B8]">
            <span>Runtime</span>
            <span>2.1s</span>
          </div>
        </div>

        {/* Agent 4: Hedging Agent */}
        <div
          onClick={() => onSelectAgent?.('Hedging Agent')}
          className="p-5 hover:bg-[#F8FAFC] transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Hourglass className="w-4 h-4 text-[#D97706]" />
              <span className="font-semibold text-[14px] text-[#0F172A]">Hedging Agent</span>
            </div>
            <div className="text-[12px] font-semibold text-[#64748B] mb-4">Ready</div>

            <div className="space-y-2 tabular-data text-[13px] text-[#475569]">
              <div className="flex items-center justify-between">
                <span>Strategy</span>
                <span className="font-semibold text-[14px] text-[#0F172A]">20% Hedge</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Est. Reduction</span>
                <span className="font-semibold text-[16px] text-[#16A34A]">-7.4%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Status</span>
                <span className="text-[10px] font-bold text-[#16A34A] bg-[#DCFCE7] px-1.5 py-0.5 rounded uppercase">
                  Simulation
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-[#F1F5F9] flex justify-between text-[11px] tabular-data text-[#94A3B8]">
            <span>Runtime</span>
            <span>—</span>
          </div>
        </div>
      </div>
    </div>
  );
};
