import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  TrendingUp, 
  Activity, 
  CloudLightning, 
  ShieldAlert, 
  Sliders, 
  Crosshair, 
  Layers, 
  Sparkles, 
  Check, 
  AlertTriangle,
  RefreshCw,
  Cpu
} from 'lucide-react';

interface PipelineAnimationProps {
  queryText: string;
  backendStatus: string;
  onAnimationComplete: () => void;
}

interface StageConfig {
  id: string;
  title: string;
  subtitle: string;
  activeText: string;
  completedBadge: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STAGES: StageConfig[] = [
  {
    id: 'query-parsing',
    title: 'QUERY PARSING',
    subtitle: 'Structuring the question and extracting portfolio exposure',
    activeText: 'Deconstructing semantic intent & mapping asset tickers...',
    completedBadge: 'Intent & Exposure Parsed',
    icon: Search
  },
  {
    id: 'market-context',
    title: 'MARKET CONTEXT',
    subtitle: 'Cross-checking current market conditions',
    activeText: 'Calibrating asset pricing across global telemetry feeds...',
    completedBadge: '6 Asset Baselines Calibrated',
    icon: TrendingUp
  },
  {
    id: 'sentiment-analysis',
    title: 'SENTIMENT ANALYSIS',
    subtitle: 'Evaluating financial-news sentiment',
    activeText: 'Scoring news stream distribution via FinBERT transformer...',
    completedBadge: 'FinBERT Sentiment Scored',
    icon: Activity
  },
  {
    id: 'weather-macro',
    title: 'WEATHER & MACRO',
    subtitle: 'Correlating environmental and macro conditions',
    activeText: 'Cross-referencing NOAA radar, wind-speed & regional assets...',
    completedBadge: 'Severe Weather Correlated',
    icon: CloudLightning
  },
  {
    id: 'quantitative-risk',
    title: 'QUANTITATIVE RISK',
    subtitle: 'Calculating deterministic portfolio exposure',
    activeText: 'Executing factor covariance & computing 95% VaR / ES...',
    completedBadge: 'Deterministic Risk Computed',
    icon: ShieldAlert
  },
  {
    id: 'scenario-analysis',
    title: 'SCENARIO ANALYSIS',
    subtitle: 'Estimating scenario-level asset impacts',
    activeText: 'Simulating severe stress-test distribution & shocks...',
    completedBadge: '1 Stressed Scenario Modeled',
    icon: Sliders
  },
  {
    id: 'hedging-strategy',
    title: 'HEDGING STRATEGY',
    subtitle: 'Evaluating defensive allocation strategies',
    activeText: 'Formulating optimal capital preservation allocations...',
    completedBadge: 'Defensive Vectors Formulated',
    icon: Crosshair
  },
  {
    id: 'evidence-synthesis',
    title: 'EVIDENCE SYNTHESIS',
    subtitle: 'Consolidating grounded supporting signals',
    activeText: 'Grounding citations & validating cross-agent telemetry...',
    completedBadge: 'Telemetry Cross-Verified',
    icon: Layers
  },
  {
    id: 'finbuddy-intelligence',
    title: 'FINBUDDY INTELLIGENCE',
    subtitle: 'Generating the final decision brief',
    activeText: 'Synthesizing institutional decision brief & confidence index...',
    completedBadge: 'Decision Brief Synthesized',
    icon: Sparkles
  }
];

export const PipelineAnimation: React.FC<PipelineAnimationProps> = ({ 
  queryText, 
  backendStatus, 
  onAnimationComplete 
}) => {
  // Current active stage index: 0 to 8
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  // Whether the 9 stages visual sequence has reached completion
  const [isVisualSequenceComplete, setIsVisualSequenceComplete] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const backendStatusRef = useRef(backendStatus);
  backendStatusRef.current = backendStatus;

  // Track elapsed timer for subtle institutional telemetry display
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => +(prev + 0.1).toFixed(1));
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // Progression of the 9 stages
  // Target: ~850ms per stage => total visual sequence ~7.65s
  useEffect(() => {
    if (backendStatus === 'ERROR') {
      return; // Stop animation if backend outright failed
    }

    if (currentStageIndex < STAGES.length - 1) {
      const stepTimer = setTimeout(() => {
        setCurrentStageIndex(prev => prev + 1);
      }, 850);
      return () => clearTimeout(stepTimer);
    } else if (currentStageIndex === STAGES.length - 1) {
      // Reached final stage (FinBuddy Intelligence)
      const finalStepTimer = setTimeout(() => {
        setIsVisualSequenceComplete(true);
      }, 950);
      return () => clearTimeout(finalStepTimer);
    }
  }, [currentStageIndex, backendStatus]);

  // Two-condition completion gate:
  // ANIMATION COMPLETE + BACKEND RESULT AVAILABLE = SHOW RESULT
  useEffect(() => {
    if (isVisualSequenceComplete && backendStatus === 'COMPLETED') {
      // Small graceful buffer for the final checkmark reveal
      const finishTimer = setTimeout(() => {
        onAnimationComplete();
      }, 600);
      return () => clearTimeout(finishTimer);
    }
  }, [isVisualSequenceComplete, backendStatus, onAnimationComplete]);

  // Overall progress percentage for header indicator
  const progressPercent = Math.min(
    100, 
    Math.round(((currentStageIndex + (isVisualSequenceComplete ? 1 : 0.5)) / STAGES.length) * 100)
  );

  const activeStage = STAGES[currentStageIndex];

  return (
    <div className="w-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden transition-colors duration-300">
      
      {/* 1. INSTITUTIONAL TOP BAR */}
      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Pulsing Core Indicator */}
          <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-blue-600/10 dark:bg-blue-500/20 border border-blue-500/30 text-blue-600 dark:text-blue-400">
            <Cpu className="w-4 h-4 animate-pulse" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-extrabold tracking-wider text-slate-900 dark:text-slate-100 uppercase">
                FINBUDDY MULTI-AGENT ORCHESTRATION PIPELINE
              </span>
              <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold">
                STAGE {Math.min(currentStageIndex + 1, 9)}/9
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono-tech mt-0.5">
              AUTONOMOUS INTELLIGENCE CHAIN · REASONING & RISK SYNTHESIS
            </p>
          </div>
        </div>

        {/* Telemetry Clock & Progress */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block font-mono-tech">
            <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              ELAPSED: {elapsedSeconds.toFixed(1)}s
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500">
              LATENCY TARGET: ~7.8s
            </div>
          </div>
          <div className="w-24 sm:w-32 flex flex-col items-end">
            <span className="text-[11px] font-mono-tech font-bold text-blue-600 dark:text-blue-400 mb-1">
              {progressPercent}%
            </span>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. QUERY CONTEXT HEADER */}
      <div className="px-6 py-5 bg-gradient-to-b from-slate-50/60 to-white dark:from-slate-900/40 dark:to-[#0F172A] border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between flex-wrap gap-4">
        <div className="flex-1 min-w-[280px]">
          <div className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-1">
            TARGET INQUIRY UNDER EVALUATION
          </div>
          <div className="text-[15px] sm:text-[16px] font-semibold text-slate-900 dark:text-slate-100 italic tracking-tight line-clamp-2">
            "{queryText}"
          </div>
        </div>
        
        {/* Active Stage Callout Pill */}
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600 dark:bg-blue-400"></span>
          </span>
          <span className="text-[11px] font-mono-tech font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300">
            {isVisualSequenceComplete && backendStatus !== 'COMPLETED'
              ? 'SYNCHRONIZING WITH BACKEND...'
              : activeStage?.activeText || 'Processing...'}
          </span>
        </div>
      </div>

      {/* 3. CONNECTED STAGE PIPELINE (Grid / Rail Layout) */}
      <div className="p-6 sm:p-8 relative">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] opacity-40 pointer-events-none" />

        {/* ERROR STATE BANNER IF BACKEND FAILED */}
        {backendStatus === 'ERROR' && (
          <div className="relative z-10 mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-900 dark:text-red-200 flex items-start gap-3 animate-in fade-in duration-300">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-[13px] font-bold uppercase tracking-wider">
                INTELLIGENCE PIPELINE INTERRUPTED
              </h4>
              <p className="text-[12px] text-red-700 dark:text-red-300 mt-1">
                FinBuddy could not complete the multi-agent analysis. Check network connectivity or retry the analysis.
              </p>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        )}

        {/* STAGES LIST - Responsive: 1 column on mobile, 3 columns on desktop */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isCompleted = idx < currentStageIndex || (idx === STAGES.length - 1 && isVisualSequenceComplete);
            const isProcessing = idx === currentStageIndex && !isVisualSequenceComplete;
            const isWaiting = idx > currentStageIndex;

            return (
              <div 
                key={stage.id}
                className={`relative rounded-xl border p-4 transition-all duration-500 flex flex-col justify-between overflow-hidden
                  ${isCompleted 
                    ? 'bg-slate-50/80 dark:bg-slate-900/60 border-emerald-500/40 dark:border-emerald-500/30 shadow-sm' 
                    : isProcessing
                    ? 'bg-white dark:bg-slate-900 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                    : 'bg-slate-50/40 dark:bg-slate-950/40 border-slate-200/80 dark:border-slate-800/80 opacity-60'}
                `}
              >
                {/* Active scan-line effect on processing node */}
                {isProcessing && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent pointer-events-none animate-[pulse-subtle_2s_ease-in-out_infinite]" />
                )}

                {/* Top: Step Number & Icon & State */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    {/* Node Icon Avatar */}
                    <div 
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-all duration-500
                        ${isCompleted 
                          ? 'bg-emerald-500 text-white shadow-sm' 
                          : isProcessing
                          ? 'bg-blue-600 text-white ring-4 ring-blue-500/20 shadow-sm animate-pulse'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}
                      `}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono-tech font-bold text-slate-400 dark:text-slate-500">
                          0{idx + 1}
                        </span>
                        <h4 className="text-[12px] font-bold text-slate-900 dark:text-slate-100 tracking-wide uppercase">
                          {stage.title}
                        </h4>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span 
                    className={`text-[9px] font-mono-tech font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border
                      ${isCompleted 
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/80' 
                        : isProcessing
                        ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 animate-pulse'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-800'}
                    `}
                  >
                    {isCompleted ? 'COMPLETED' : isProcessing ? 'PROCESSING' : 'WAITING'}
                  </span>
                </div>

                {/* Subtitle / Description */}
                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                  {isProcessing ? stage.activeText : stage.subtitle}
                </p>

                {/* Bottom: Completion Signal / Animated Progress Line */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  {isCompleted ? (
                    <span className="text-[10px] font-mono-tech font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {stage.completedBadge}
                    </span>
                  ) : isProcessing ? (
                    <div className="w-full flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-ping shrink-0" />
                      <span className="text-[10px] font-mono-tech text-blue-600 dark:text-blue-400 font-bold truncate">
                        ACTIVE AGENT SIGNAL
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] font-mono-tech text-slate-400 dark:text-slate-600">
                      QUEUED IN SEQUENCE
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. FOOTER STATUS BAR */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] font-mono-tech text-slate-500 dark:text-slate-400 gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>
              {isVisualSequenceComplete && backendStatus === 'COMPLETED'
                ? 'SYNTHESIS COMPLETE · PRESENTING INTELLIGENCE BRIEF'
                : isVisualSequenceComplete && backendStatus === 'RUNNING'
                ? 'COMPLETING BACKEND INFERENCE (HOLDING PIPELINE READY)...'
                : `PROCESSING PIPELINE NODE ${currentStageIndex + 1} OF 9...`}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            SECURE FINANCIAL TELEMETRY PIPELINE
          </div>
        </div>

      </div>
    </div>
  );
};
