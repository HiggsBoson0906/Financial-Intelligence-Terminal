import React from 'react';
import { Sparkles, AlertTriangle, Lightbulb, Activity, ChevronRight } from 'lucide-react';
import { QueryResponse } from '../../types/api';

interface AiIntelligenceBriefProps {
  data?: QueryResponse | null;
  onViewEvidence?: () => void;
}

export const AiIntelligenceBrief: React.FC<AiIntelligenceBriefProps> = ({ data, onViewEvidence }) => {
  if (!data) return null;

  const { answer } = data;
  if (!answer) return null;

  const { 
    summary, 
    executive_assessment, 
    key_findings, 
    risk_explanation, 
    recommendation_explanations 
  } = answer;

  return (
    <div className="w-full bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-xl shadow-lg border border-[#334155] overflow-hidden text-white relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      {/* Header */}
      <div className="px-6 py-4 border-b border-[#334155] flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-[18px] font-bold tracking-tight">AI INTELLIGENCE BRIEF</h2>
            <div className="text-[12px] text-[#94A3B8] font-mono-tech mt-0.5 uppercase">
              Synthesized via Groq & Agent Ensemble • Confidence: {answer.confidence ? Math.round(answer.confidence * 100) : '--'}%
            </div>
          </div>
        </div>
        <button 
          onClick={onViewEvidence}
          className="text-[12px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20"
        >
          View Evidence <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content Grid */}
      <div className="p-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Executive Summary (Left) */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <h3 className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-2 flex items-center gap-2">
                Executive Assessment
              </h3>
              <p className="text-[16px] leading-relaxed font-medium text-[#F8FAFC]">
                {executive_assessment || summary || 'Analysis unavailable.'}
              </p>
              {data?.answer?.details && data.answer.details.length > 0 && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-[13px] text-red-400 font-mono-tech whitespace-pre-wrap">
                    {data.answer.details[0]}
                  </p>
                </div>
              )}
            </div>

            {key_findings && key_findings.length > 0 && (
              <div>
                <h3 className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Key Findings
                </h3>
                <ul className="space-y-2.5">
                  {key_findings.map((finding, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-[14px] text-[#CBD5E1]">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                      <span className="leading-snug">{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column (Risk & Recommendations) */}
          <div className="lg:col-span-5 space-y-6">
            {risk_explanation && risk_explanation.length > 0 && (
              <div className="bg-[#1E293B]/50 rounded-lg border border-[#334155] p-4">
                <h3 className="text-[12px] font-bold text-[#F43F5E] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Risk Explanation
                </h3>
                <ul className="space-y-2">
                  {risk_explanation.map((risk, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-[13px] text-[#CBD5E1]">
                      <span className="text-[#F43F5E] font-bold mt-0.5">•</span>
                      <span className="leading-snug">{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {recommendation_explanations && recommendation_explanations.length > 0 && (
              <div className="bg-[#1E293B]/50 rounded-lg border border-[#334155] p-4">
                <h3 className="text-[12px] font-bold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Recommendations
                </h3>
                <div className="space-y-3">
                  {recommendation_explanations.map((rec, idx) => (
                    <div key={idx} className="text-[13px]">
                      <span className="text-[#F8FAFC] font-semibold block mb-1">
                        {rec.rec_id}
                      </span>
                      <span className="text-[#CBD5E1] leading-snug block">
                        {rec.narrative}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
      
      {/* Follow-up Section */}
      <div className="border-t border-[#334155] bg-[#1E293B]/30 p-4">
        <form 
          className="flex gap-3"
          onSubmit={async (e) => {
             e.preventDefault();
             const form = e.currentTarget;
             const formData = new FormData(form);
             const followup = formData.get('followup');
             const btn = form.querySelector('button');
             if (btn) btn.disabled = true;
             try {
                const res = await fetch('http://localhost:8000/api/v1/query/follow-up', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ query: followup, parent_run_id: data.run_id })
                });
                const json = await res.json();
                if (res.ok) {
                   alert(`GROQ FOLLOW-UP:\n\n${json.answer}`);
                } else {
                   alert('Error: ' + json.detail);
                }
             } catch (err: any) {
                alert('Request failed: ' + err.message);
             } finally {
                if (btn) btn.disabled = false;
                form.reset();
             }
          }}
        >
          <input 
            type="text" 
            name="followup"
            placeholder="Ask Groq a follow-up question..." 
            className="flex-1 bg-[#0F172A] border border-[#334155] rounded px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            required
          />
          <button 
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-sm rounded transition-colors"
          >
            FOLLOW-UP WITH GROQ
          </button>
        </form>
      </div>
    </div>
  );
};
