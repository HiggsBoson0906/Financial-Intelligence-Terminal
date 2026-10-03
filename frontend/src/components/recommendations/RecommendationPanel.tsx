import React, { useState } from 'react';
import type { AiRecommendation } from '../../types';
import { Sparkles, CheckCircle2, ChevronDown, ChevronUp, ShieldCheck, ArrowRight, Layers, FileText } from 'lucide-react';

interface RecommendationPanelProps {
  recommendation: AiRecommendation;
  onOpenAudit: () => void;
}

export const RecommendationPanel: React.FC<RecommendationPanelProps> = ({
  recommendation,
  onOpenAudit,
}) => {
  const [showEvidence, setShowEvidence] = useState(true);

  return (
    <div className="terminal-card p-4 rounded select-none border-t-2 border-t-[#00f0ff] relative overflow-hidden">
      {/* Visual Pipeline Header Stream */}
      <div className="bg-[#080b14] p-2 rounded border border-[#1d2538] mb-4 font-mono-data text-[10px] text-slate-300 flex items-center justify-between overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 font-bold text-[#00f0ff] shrink-0">
          <Layers className="w-3.5 h-3.5 text-[#00f0ff]" />
          <span>EVIDENCE CHAIN PIPELINE:</span>
        </div>

        <div className="flex items-center gap-2 text-slate-400 shrink-0">
          <span className="bg-[#121828] px-2 py-0.5 rounded text-cyan-300">DATA</span>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <span className="bg-[#121828] px-2 py-0.5 rounded text-amber-300">ANALYSIS</span>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <span className="bg-[#121828] px-2 py-0.5 rounded text-emerald-300">EVIDENCE</span>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <span className="bg-[#00f0ff]/20 px-2 py-0.5 rounded text-[#00f0ff] font-bold border border-[#00f0ff]/40">
            RECOMMENDATION
          </span>
        </div>
      </div>

      {/* Main Recommendation Header */}
      <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-[#1e2333] gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#00f0ff] pulse-dot" />
          <h2 className="text-xs font-bold text-slate-100 tracking-wider uppercase font-mono-data">
            AI EXECUTIVE RECOMMENDATION
          </h2>
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono-data font-bold">
            ACTION READY
          </span>
        </div>

        <button
          onClick={onOpenAudit}
          className="flex items-center gap-1.5 bg-[#00f0ff]/15 hover:bg-[#00f0ff]/25 text-[#00f0ff] border border-[#00f0ff]/40 px-3 py-1 rounded text-xs font-mono-data font-bold transition-all shadow-[0_0_12px_rgba(0,240,255,0.15)]"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>VIEW FULL REASONING TRACE</span>
        </button>
      </div>

      {/* Primary Action Hero Card */}
      <div className="bg-[#0b0e1a] p-4 rounded border border-[#1e273e] mb-4">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-rose-500 text-white font-mono-data text-xs font-bold tracking-wider">
                ACTION: {recommendation.action}
              </span>
              <span className="text-sm font-bold text-slate-100 font-mono-data">
                {recommendation.title}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {recommendation.rationale}
            </p>
          </div>

          <div className="bg-[#070912] p-3 rounded border border-[#1a2236] text-right shrink-0 font-mono-data">
            <span className="text-[10px] text-slate-400 block">MODEL CONFIDENCE</span>
            <span className="text-lg font-bold text-emerald-400">{recommendation.confidence}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-[#182033] font-mono-data text-xs">
          <div className="bg-[#080a13] p-2.5 rounded border border-[#161d2e]">
            <span className="text-[10px] text-slate-400 block">TARGET EXPOSURE</span>
            <span className="font-bold text-rose-400">{recommendation.targetAsset}</span>
          </div>

          <div className="bg-[#080a13] p-2.5 rounded border border-[#161d2e]">
            <span className="text-[10px] text-slate-400 block">SUGGESTED DERIVATIVE HEDGE</span>
            <span className="font-bold text-cyan-300">{recommendation.suggestedHedge}</span>
          </div>

          <div className="bg-[#080a13] p-2.5 rounded border border-[#161d2e]">
            <span className="text-[10px] text-slate-400 block">EXPECTED IMPACT &amp; RISK</span>
            <span className="font-bold text-emerald-400">{recommendation.expectedImpact}</span>
          </div>
        </div>
      </div>

      {/* Expandable Evidence Chain Section */}
      <div className="bg-[#090b12] rounded border border-[#1e2333] font-mono-data">
        <button
          onClick={() => setShowEvidence(!showEvidence)}
          className="w-full p-3 flex items-center justify-between text-xs font-bold text-slate-200 hover:bg-[#0f1424] transition-colors rounded-t"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>VERIFIED EVIDENCE CHAIN ({recommendation.evidenceChain.length} ARTIFACTS)</span>
          </div>
          {showEvidence ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {showEvidence && (
          <div className="p-3 pt-0 border-t border-[#171c2b] space-y-2">
            {recommendation.evidenceChain.map((item) => (
              <div key={item.id} className="bg-[#0b0e18] p-2.5 rounded border border-[#172033] flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-200 mb-0.5">
                    <span>{item.title}</span>
                    <span className="text-[9px] text-emerald-400 uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans leading-snug mb-1">
                    {item.details}
                  </p>
                  <div className="text-[9px] text-slate-500">
                    SOURCE: <span className="text-cyan-400">{item.source}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
