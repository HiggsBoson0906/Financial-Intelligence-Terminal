import React, { useState } from 'react';
import { ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';

import { QueryResponse } from '../../types/api';

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
  const [activeTab, setActiveTab] = useState<'Overview' | 'WhyItMatters' | 'AgentViews' | 'Evidence'>('Overview');
  
  const eventName = data?.event?.event_name || 'Event Analysis';
  const dataStatus = data?.data_quality?.overall_status === 'good' ? 'LIVE' : (data?.data_quality?.overall_status || 'SIMULATION').toUpperCase();

  return (
    <div className="flex flex-col justify-between h-full flex-1 select-none">
      <div>
        {/* Header & High Impact Badge */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
          <h2 className="text-[21px] font-bold text-[#0F172A]">
            Decision Intelligence
          </h2>
          <span className="text-[11px] font-semibold text-[#DC2626] bg-[#FEE2E2] px-2 py-0.5 rounded">
            HIGH IMPACT
          </span>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-5 text-[13px] font-medium border-b border-[#F1F5F9] my-3 pb-2 text-[#64748B]">
          <button
            onClick={() => setActiveTab('Overview')}
            className={`transition-colors relative pb-1 ${
              activeTab === 'Overview' ? 'text-[#2563EB] font-bold' : 'hover:text-[#0F172A]'
            }`}
          >
            Overview
            {activeTab === 'Overview' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2563EB]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('WhyItMatters')}
            className={`transition-colors relative pb-1 ${
              activeTab === 'WhyItMatters' ? 'text-[#2563EB] font-bold' : 'hover:text-[#0F172A]'
            }`}
          >
            Why It Matters
          </button>
          <button
            onClick={() => setActiveTab('AgentViews')}
            className={`transition-colors relative pb-1 ${
              activeTab === 'AgentViews' ? 'text-[#2563EB] font-bold' : 'hover:text-[#0F172A]'
            }`}
          >
            Agent Views
          </button>
          <button
            onClick={() => onViewEvidence()}
            className="hover:text-[#0F172A] transition-colors relative pb-1"
          >
            Evidence
          </button>
        </div>

        {/* Active Event Hero Card */}
        <div className="flex items-center justify-between py-4 border-b border-[#F1F5F9] mb-4">
          <div>
            <div className="text-[20px] font-semibold text-[#0F172A]">{eventName}</div>
            <div className="text-[13px] font-medium text-[#475569] mt-0.5">{dataStatus}</div>
            <div className="text-[12px] text-[#94A3B8] font-mono-tech mt-1">
              {dataStatus} • {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })} UTC
            </div>
          </div>

          <div className="w-12 h-12 rounded-lg bg-[#0F172A] relative overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
            <div className="w-10 h-10 rounded-full border border-blue-500/30 animate-pulse absolute" />
            <span className="text-[24px]">🌊</span>
          </div>
        </div>

        {/* Portfolio Impact Section */}
        <div className="my-3">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-[#0F172A] text-[14px]">
              Portfolio Impact
            </span>
            <button className="text-[11px] font-semibold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-0.5">
              <span>View in Portfolio</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 items-center">
            <div className="space-y-2.5 tabular-data text-[13px]">
              <div className="flex justify-between items-center">
                <span className="text-[#64748B]">Energy Exposure</span>
                <span className="font-semibold text-[#0F172A] text-[18px]">
                  {data?.recommendations?.[0]?.expected_effect?.portfolio_risk_change !== undefined ? `${Math.abs(data.recommendations[0].expected_effect.portfolio_risk_change * 100).toFixed(1)}%` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#64748B]">Risk Change</span>
                <span className="font-semibold text-[#DC2626] text-[22px]">
                  {data?.risk?.metrics?.var_95 !== undefined ? `+$${(data.risk.metrics.var_95 / 1000).toFixed(1)}K` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#64748B]">Portfolio Impact</span>
                <span className="font-semibold text-[#DC2626] text-[14px]">
                  {data?.scenario?.portfolio_impact?.total_impact_percent !== undefined ? `${data.scenario.portfolio_impact.total_impact_percent}%` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#64748B]">Confidence</span>
                <span className="font-semibold text-[#16A34A] text-[14px]">
                  {data?.answer?.confidence !== undefined ? `${Math.round(data.answer.confidence * 100)}%` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#64748B]">Data State</span>
                <span className="font-bold text-[#D97706] bg-[#FEF3C7] px-1.5 py-0.5 rounded text-[10px] uppercase">
                  {dataStatus}
                </span>
              </div>
            </div>


          </div>
        </div>

        {/* RECOMMENDATION DETAILS */}
        <div className="mt-5 pt-3 border-t border-[#F1F5F9]">
          <div className="text-[14px] font-semibold text-[#0F172A] mb-3">
            Recommended Action
          </div>

          <div className="space-y-2 tabular-data text-[13px] max-h-48 overflow-y-auto pr-2">
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
                <div key={idx} className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-semibold text-[#0F172A]">{action}</div>
                    {rec.confidence && (
                       <div className="text-[10px] font-bold text-[#16A34A] bg-[#DCFCE7] px-1.5 py-0.5 rounded">
                         {(rec.confidence * 100).toFixed(0)}% CONFIDENCE
                       </div>
                    )}
                  </div>
                  <div className="text-[12px] text-[#475569] leading-snug mb-2">{rec.reason || rec.rationale}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {rec.assets.map((asset: string, aIdx: number) => (
                      <span key={aIdx} className="bg-white border border-[#E2E8F0] px-1.5 py-0.5 rounded text-[11px] font-medium text-[#334155]">
                        {asset}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-[#94A3B8] italic text-[12px]">No hedging recommendations provided.</div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#F1F5F9] mt-4">
        <button
          onClick={onExploreScenario}
          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-medium py-2.5 px-4 rounded-lg shadow-sm transition-colors text-center"
        >
          Explore Scenario
        </button>

        <button
          onClick={onViewEvidence}
          className="bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] text-[13px] font-medium py-2.5 px-4 rounded-lg shadow-xs transition-colors text-center"
        >
          View Evidence
        </button>
      </div>
    </div>
  );
};
