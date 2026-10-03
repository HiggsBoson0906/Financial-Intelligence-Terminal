import React, { useState } from 'react';
import { ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';

interface DecisionIntelligenceProps {
  onExploreScenario: () => void;
  onViewEvidence: () => void;
}

export const DecisionIntelligence: React.FC<DecisionIntelligenceProps> = ({
  onExploreScenario,
  onViewEvidence,
}) => {
  const [activeTab, setActiveTab] = useState<'Overview' | 'WhyItMatters' | 'AgentViews' | 'Evidence'>('Overview');

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
            <div className="text-[20px] font-semibold text-[#0F172A]">Bay of Bengal Flood</div>
            <div className="text-[13px] font-medium text-[#475569] mt-0.5">SIMULATION</div>
            <div className="text-[12px] text-[#94A3B8] font-mono-tech mt-1">
              SIMULATION • 12:41 UTC
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
            {/* Impact Metrics */}
            <div className="space-y-2.5 tabular-data text-[13px]">
              <div className="flex justify-between items-center">
                <span className="text-[#64748B]">Energy Exposure</span>
                <span className="font-semibold text-[#0F172A] text-[18px]">43%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#64748B]">Risk Change</span>
                <span className="font-semibold text-[#DC2626] text-[22px]">+11.4%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#64748B]">Portfolio Impact</span>
                <span className="font-semibold text-[#DC2626] text-[14px]">+8.7%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#64748B]">Confidence</span>
                <span className="font-semibold text-[#16A34A] text-[14px]">78%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#64748B]">Data State</span>
                <span className="font-bold text-[#D97706] bg-[#FEF3C7] px-1.5 py-0.5 rounded text-[10px]">MODEL</span>
              </div>
            </div>

            {/* Mini Area Chart: Portfolio Risk (VaR) */}
            <div className="py-2">
              <div className="text-[11px] font-semibold text-[#64748B] mb-1">
                Portfolio Risk (VaR)
              </div>
              <div className="h-16 relative">
                <svg width="100%" height="100%" viewBox="0 0 100 50" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="varGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Fill area */}
                  <polygon
                    points="0,40 15,35 35,45 50,30 65,32 85,15 100,8 100,50 0,50"
                    fill="url(#varGrad)"
                  />
                  {/* Line */}
                  <polyline
                    points="0,40 15,35 35,45 50,30 65,32 85,15 100,8"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Peak alert dot */}
                  <circle cx="100" cy="8" r="3" fill="#DC2626" stroke="#FFFFFF" strokeWidth="1.5" />
                </svg>
              </div>
              <div className="flex justify-between text-[10px] text-[#94A3B8] font-plex-mono mt-0.5">
                <span>Jun 1</span>
                <span>Jun 15</span>
                <span>Jun 30</span>
              </div>
            </div>
          </div>
        </div>

        {/* WHAT CHANGED? (Last 15 min) */}
        <div className="mt-5 pt-3 border-t border-[#F1F5F9]">
          <div className="text-[14px] font-semibold text-[#0F172A] mb-3">
            What Changed? <span className="font-normal text-[#94A3B8]">(Last 15 min)</span>
          </div>

          <div className="space-y-2 tabular-data text-[13px]">
            <div className="flex items-center justify-between text-[12px] py-0.5">
              <span className="text-[#94A3B8]">12:31</span>
              <span className="text-[#334155] font-medium">Flood Severity Upgrade</span>
              <ArrowUp className="w-3.5 h-3.5 text-[#DC2626]" />
            </div>

            <div className="flex items-center justify-between text-[12px] py-0.5">
              <span className="text-[#94A3B8]">12:34</span>
              <span className="text-[#334155] font-medium">Infrastructure Risk ↑</span>
              <div className="flex items-center gap-1 text-[#DC2626] font-bold">
                <span>High</span>
                <ArrowUp className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex items-center justify-between text-[12px] py-0.5">
              <span className="text-[#94A3B8]">12:37</span>
              <span className="text-[#334155] font-medium">Sentiment -0.51 → -0.72</span>
              <ArrowDown className="w-3.5 h-3.5 text-[#DC2626]" />
            </div>

            <div className="flex items-center justify-between text-[12px] py-0.5">
              <span className="text-[#94A3B8]">12:40</span>
              <span className="text-[#334155] font-medium">Energy exposure 38% → 43%</span>
              <ArrowUp className="w-3.5 h-3.5 text-[#DC2626]" />
            </div>

            <div className="flex items-center justify-between text-[11px] py-0.5">
              <span className="text-[#94A3B8]">12:42</span>
              <span className="text-[#334155] font-medium">Risk Change +8.7% → +11.4%</span>
              <ArrowUp className="w-3.5 h-3.5 text-[#DC2626]" />
            </div>
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
