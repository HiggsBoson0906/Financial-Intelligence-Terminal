import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Activity, CornerDownRight } from 'lucide-react';
import { QueryResponse } from '../../types/api';
import { API_BASE_URL } from '../../services/api';

interface FollowUpItem {
  id: string;
  question: string;
  answer: string;
}

interface AiIntelligenceBriefProps {
  data?: QueryResponse | null;
  onViewEvidence?: () => void;
}

export const AiIntelligenceBrief: React.FC<AiIntelligenceBriefProps> = ({ data, onViewEvidence }) => {
  const [followUps, setFollowUps] = useState<FollowUpItem[]>([]);
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [followUpError, setFollowUpError] = useState<string | null>(null);
  
  // Stages for staggering the reveal
  const [stage, setStage] = useState(0); 

  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset state when data (run_id) changes
  useEffect(() => {
    setFollowUps([]);
    setFollowUpLoading(false);
    setFollowUpError(null);
    setStage(0);
    
    // Start stagger sequence
    const t1 = setTimeout(() => setStage(1), 0); // Result + Confidence
    const t2 = setTimeout(() => setStage(2), 500); // Why section
    const t3 = setTimeout(() => setStage(3), 1000); // Factors section
    
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [data?.run_id]);

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

  // Derive pieces
  const finalResult = summary || "MAINTAIN CORE EXPOSURE WITH SELECTIVE DOWNSIDE PROTECTION"; // Fallback to first sentence if needed, but summary is usually good
  const confidence = answer.confidence ? Math.round(answer.confidence * 100) : null;
  const whyText = executive_assessment || 'Analysis details synthesized from available models.';

  // Determine semantic color
  let semantic = 'neutral';
  if (data.sentiment?.overall_sentiment === 'positive') semantic = 'positive';
  else if (data.sentiment?.overall_sentiment === 'negative') semantic = 'negative';
  else if (data.sentiment?.overall_sentiment === 'neutral') semantic = 'neutral';
  else if (data.recommendations?.[0]?.action === 'REDUCE') semantic = 'negative';
  else if (data.recommendations?.[0]?.action === 'MAINTAIN') semantic = 'positive';

  const accentColor = semantic === 'positive' ? 'text-green-600' : semantic === 'negative' ? 'text-red-600' : 'text-amber-600';
  const accentBg = semantic === 'positive' ? 'bg-green-600' : semantic === 'negative' ? 'bg-red-600' : 'bg-amber-600';
  const accentText = semantic === 'positive' ? 'text-green-700' : semantic === 'negative' ? 'text-red-700' : 'text-amber-700';

  const handleFollowUpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const question = formData.get('followup') as string;
    
    if (!question || !question.trim()) return;

    setFollowUpLoading(true);
    setFollowUpError(null);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/query/follow-up`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ query: question, parent_run_id: data.run_id })
      });
      const json = await res.json();
      
      if (res.ok) {
        setFollowUps(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          question,
          answer: json.answer || JSON.stringify(json)
        }]);
        setTimeout(() => {
          scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 100);
      } else {
        setFollowUpError(json.detail || 'Failed to fetch follow-up.');
      }
    } catch (err: any) {
      setFollowUpError('Request failed: ' + err.message);
    } finally {
      setFollowUpLoading(false);
      form.reset();
    }
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden text-[#0F172A] relative">
      
      {/* Header */}
      <div className="px-8 py-5 border-b border-[#F1F5F9] flex items-center justify-between bg-[#F8FAFC]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded flex items-center justify-center text-[#0F172A] bg-white border border-[#E2E8F0] shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-[16px] font-bold tracking-widest uppercase text-[#0F172A]">FINBUDDY</h2>
            <div className="text-[11px] text-[#64748B] font-mono-tech mt-0.5 uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              FINBUDDY READY
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        
        {/* FINAL RESULT & CONFIDENCE */}
        <div className={`transition-opacity duration-700 ease-in-out ${stage >= 1 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-10 items-center">
            <div className="md:col-span-9">
              <div className={`text-[11px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2 ${accentText}`}>
                <div className={`w-2 h-2 rounded-full ${accentBg}`} />
                FINAL RESULT
              </div>
              <h1 className="text-[28px] md:text-[32px] font-bold leading-tight tracking-tight uppercase text-[#0F172A]">
                {finalResult}
              </h1>
            </div>
            
            {confidence !== null && (
              <div className="md:col-span-3 flex flex-col md:items-end justify-center md:pl-8">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-[#F1F5F9]" />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="transparent" 
                      stroke="currentColor" 
                      strokeWidth="8" 
                      strokeDasharray="282.74" 
                      strokeDashoffset={282.74 - (282.74 * confidence) / 100}
                      strokeLinecap="round"
                      className={`${accentText} transition-all duration-1000 ease-out`} 
                      style={{ strokeDashoffset: stage >= 1 ? (282.74 - (282.74 * confidence) / 100) : 282.74 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[20px] font-bold text-[#0F172A] leading-none tabular-nums mt-1">{confidence}%</span>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mt-3">
                  CONFIDENCE
                </div>
              </div>
            )}
          </div>
        </div>

        <hr className="border-[#F1F5F9] my-8" />

        {/* REASONING & KEY FACTORS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-7 space-y-8">
            <div>
              <h3 className="text-[12px] font-bold text-[#64748B] uppercase tracking-widest mb-2">
                WHY THIS MATTERS
              </h3>
              <div className={`text-[14px] leading-relaxed font-['Times_New_Roman',_Times,_serif] text-[#0F172A] min-h-[80px] transition-opacity duration-1000 ${stage >= 2 ? 'opacity-100' : 'opacity-0'}`}>
                {whyText}
              </div>
            </div>

            {/* Supporting Analysis */}
            <div className={`transition-opacity duration-500 ${stage >= 3 ? 'opacity-100' : 'opacity-0'}`}>
               <h3 className="text-[12px] font-bold text-[#64748B] uppercase tracking-widest mb-2">
                SUPPORTING ANALYSIS
               </h3>
               {recommendation_explanations && recommendation_explanations.length > 0 ? (
                  <div className="space-y-3">
                    {recommendation_explanations.map((rec, idx) => (
                      <div key={idx} className="text-[14px] font-['Times_New_Roman',_Times,_serif] text-[#0F172A] leading-relaxed">
                        <span className="font-bold font-sans uppercase tracking-wide text-[11px] mr-2">
                          {rec.rec_id}
                        </span>
                        {rec.narrative}
                      </div>
                    ))}
                  </div>
               ) : (
                  <div className="text-[14px] font-['Times_New_Roman',_Times,_serif] text-[#0F172A]">
                    No additional supporting narratives provided by model.
                  </div>
               )}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-8">
            <div className={`transition-opacity duration-500 ${stage >= 3 ? 'opacity-100' : 'opacity-0'}`}>
              <h3 className="text-[12px] font-bold text-[#64748B] uppercase tracking-widest mb-3 flex items-center gap-2">
                KEY FACTORS
              </h3>
              <div className="border-t border-[#E2E8F0] mb-6">
                <table className="w-full text-[14px] font-['Times_New_Roman',_Times,_serif] text-[#0F172A]">
                  <tbody>
                    <tr className="border-b border-[#F1F5F9]">
                      <td className="py-2 text-[#64748B] font-sans text-[11px] uppercase tracking-wider w-1/3">Event</td>
                      <td className="py-2 text-right">{data.event?.severity ? `${data.event.severity} Hurricane` : 'Unspecified'}</td>
                    </tr>
                    <tr className="border-b border-[#F1F5F9]">
                      <td className="py-2 text-[#64748B] font-sans text-[11px] uppercase tracking-wider">Region</td>
                      <td className="py-2 text-right">{data.event?.region || 'Global'}</td>
                    </tr>
                    <tr className="border-b border-[#F1F5F9]">
                      <td className="py-2 text-[#64748B] font-sans text-[11px] uppercase tracking-wider">Assets</td>
                      <td className="py-2 text-right">{Object.keys(data.market_context || {}).join(' · ') || 'Portfolio'}</td>
                    </tr>
                    <tr className="border-b border-[#F1F5F9]">
                      <td className="py-2 text-[#64748B] font-sans text-[11px] uppercase tracking-wider">Risk Signal</td>
                      <td className="py-2 text-right capitalize">{data.sentiment?.overall_sentiment || 'Elevated'}</td>
                    </tr>
                    <tr className="border-b border-[#F1F5F9]">
                      <td className="py-2 text-[#64748B] font-sans text-[11px] uppercase tracking-wider">Hedge</td>
                      <td className="py-2 text-right">{data.recommendations?.[0]?.action === 'REDUCE' ? 'De-risk portfolio exposure' : 'Selective downside protection'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>


            </div>
          </div>
          
        </div>
        
        {/* FOLLOW UP SECTION */}
        <div className={`mt-12 pt-8 border-t border-[#E2E8F0] transition-opacity duration-500 ${stage >= 3 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="mb-6">
            <h3 className="text-[12px] font-bold text-[#0F172A] uppercase tracking-widest mb-1">
              ASK A FOLLOW-UP
            </h3>
            <p className="text-[13px] text-[#64748B]">
              Query the intelligence synthesis model for deeper clarity.
            </p>
          </div>
          
          <form onSubmit={handleFollowUpSubmit} className="flex gap-3 mb-8">
            <input 
              type="text" 
              name="followup"
              placeholder="E.g., Why is XOM more exposed than SPY?" 
              className="flex-1 bg-white border border-[#CBD5E1] rounded px-4 py-3 text-[14px] text-[#0F172A] focus:outline-none focus:border-blue-600 transition-colors shadow-sm"
              required
              disabled={followUpLoading}
            />
            <button 
              type="submit"
              disabled={followUpLoading}
              className="px-6 py-3 bg-[#0F172A] hover:bg-[#1E293B] disabled:opacity-50 text-white font-bold text-[12px] uppercase tracking-widest rounded shadow-sm transition-colors whitespace-nowrap"
            >
              ASK FINBUDDY &rarr;
            </button>
          </form>

          {/* Follow-up Loading State */}
          {followUpLoading && (
            <div className="flex items-center gap-3 p-4 bg-[#F8FAFC] border border-[#F1F5F9] rounded-lg mb-6">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-widest">
                FINBUDDY FOLLOW-UP... FinBuddy is thinking.
              </span>
            </div>
          )}

          {/* Follow-up Error State */}
          {followUpError && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-lg mb-6">
              <span className="text-[12px] font-bold text-red-600 uppercase tracking-widest block mb-1">
                FOLLOW-UP UNAVAILABLE
              </span>
              <span className="text-[13px] text-red-800">
                {followUpError}
              </span>
            </div>
          )}

          {/* Follow-up History */}
          <div className="space-y-6">
            {followUps.map((fu, idx) => (
              <div key={fu.id} className="p-6 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                <div className="mb-4">
                  <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <CornerDownRight className="w-3 h-3" />
                    FOLLOW-UP QUESTION {idx + 1}
                  </div>
                  <div className="text-[15px] font-semibold text-[#0F172A]">
                    {fu.question}
                  </div>
                </div>
                
                <div className="border-t border-[#F1F5F9] pt-4">
                  <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-2">
                    FOLLOW-UP ANSWER
                  </div>
                  <div className="text-[14px] leading-relaxed text-[#334155]">
                    {fu.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div ref={scrollRef} />
        </div>
        
      </div>
    </div>
  );
};
