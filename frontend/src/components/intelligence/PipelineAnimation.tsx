import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

interface PipelineAnimationProps {
  queryText: string;
  backendStatus: string;
  onAnimationComplete: () => void;
}

const STAGES = [
  { id: 'parsing', label: 'QUERY PARSING' },
  { id: 'market', label: 'MARKET CONTEXT' },
  { id: 'sentiment', label: 'SENTIMENT ANALYSIS' },
  { id: 'weather', label: 'WEATHER & MACRO' },
  { id: 'risk', label: 'QUANT RISK' },
  { id: 'scenario', label: 'SCENARIO' },
  { id: 'hedging', label: 'HEDGING' },
  { id: 'evidence', label: 'EVIDENCE' },
  { id: 'synthesis', label: 'FINBUDDY SYNTHESIS' }
];

export const PipelineAnimation: React.FC<PipelineAnimationProps> = ({ queryText, backendStatus, onAnimationComplete }) => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Total animation time: ~3.5 seconds
    // We have 9 stages. ~380ms per stage.
    // If backend finishes fast, we still wait.
    // If backend is slow, we pause at 95% (last stage).
    
    if (currentStageIndex >= STAGES.length) {
      if (backendStatus === 'COMPLETED' || backendStatus === 'ERROR') {
        setProgress(100);
        const timer = setTimeout(() => {
          onAnimationComplete();
        }, 600);
        return () => clearTimeout(timer);
      } else {
        setProgress(95); // Wait for backend
      }
      return;
    }

    const stageDuration = 380;
    
    const timer = setTimeout(() => {
      setCurrentStageIndex(prev => prev + 1);
      setProgress(((currentStageIndex + 1) / STAGES.length) * 100);
    }, stageDuration);
    
    return () => clearTimeout(timer);
  }, [currentStageIndex, backendStatus, onAnimationComplete]);

  const isPipelineComplete = currentStageIndex >= STAGES.length && backendStatus === 'COMPLETED';
  const currentStage = STAGES[Math.min(currentStageIndex, STAGES.length - 1)];

  return (
    <div className="w-full min-h-[400px] flex flex-col items-center justify-center p-8 bg-white border border-[#E2E8F0] rounded-xl shadow-sm transition-all duration-700 animate-in fade-in">
      
      <div className="text-center mb-10 w-full max-w-2xl">
        <h2 className="text-[12px] font-bold text-[#64748B] tracking-widest uppercase mb-4">
          PILLERSTREET INTELLIGENCE
        </h2>
        <h3 className="text-[18px] font-bold text-[#0F172A] mb-2 uppercase tracking-wide">
          ANALYZING QUERY
        </h3>
        <p className="text-[14px] text-[#475569] italic mx-auto">
          "{queryText}"
        </p>
      </div>

      <div className="w-full max-w-lg mb-8">
        <div className="flex justify-between text-[11px] font-bold text-[#64748B] tracking-widest uppercase mb-3">
          <span>{currentStageIndex >= STAGES.length ? 'SYNTHESIZING' : currentStage.label}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        
        <div className="w-full h-[6px] bg-[#F1F5F9] rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      <div className="text-center h-8 flex items-center justify-center">
        {isPipelineComplete ? (
          <div className="text-[14px] font-bold text-emerald-600 tracking-widest uppercase animate-in fade-in slide-in-from-bottom-2">
            ✓ ANALYSIS COMPLETE
          </div>
        ) : backendStatus === 'ERROR' ? (
          <div className="text-[14px] font-bold text-red-600 tracking-widest uppercase animate-in fade-in">
            ANALYSIS INTERRUPTED
          </div>
        ) : currentStageIndex >= STAGES.length && backendStatus === 'RUNNING' ? (
          <div className="text-[12px] font-bold text-[#64748B] tracking-widest uppercase animate-pulse">
            AWAITING FINAL SYNTHESIS...
          </div>
        ) : (
          <div className="text-[12px] font-bold text-blue-600 tracking-widest uppercase animate-pulse">
            EXTRACTING INTELLIGENCE
          </div>
        )}
      </div>
      
    </div>
  );
};
