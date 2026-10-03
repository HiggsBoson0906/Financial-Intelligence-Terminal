import React from 'react';
import { IntelligenceFinding } from '../../utils/intelligenceDiff';
import { Sparkles, ArrowRight } from 'lucide-react';

interface NewIntelligenceStreamProps {
  findings: IntelligenceFinding[];
  isAnalyzing: boolean;
  onItemClick: (sectionId?: string) => void;
}

export const NewIntelligenceStream: React.FC<NewIntelligenceStreamProps> = ({
  findings,
  isAnalyzing,
  onItemClick
}) => {
  if (findings.length === 0 && !isAnalyzing) return null;

  return (
    <div className="w-full fit-card mb-6 animate-in slide-in-from-top-4 fade-in duration-500 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-[#F1F5F9] flex items-center justify-between bg-white">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-[#2563EB]" />
          <h2 className="text-[18px] font-bold text-[#0F172A] tracking-tight">
            NEW INTELLIGENCE
          </h2>
          {!isAnalyzing && (
            <span className="text-[12px] text-[#64748B] font-medium ml-2 border-l border-[#E2E8F0] pl-4 hidden sm:block">
              What's new from this analysis
            </span>
          )}
        </div>
        
        {isAnalyzing ? (
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-[#2563EB] uppercase tracking-wider pulse-dot">
              ANALYZING NEW INFORMATION...
            </span>
          </div>
        ) : (
          <div className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">
            {findings.length} NEW {findings.length === 1 ? 'FINDING' : 'FINDINGS'}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2 sm:p-5 bg-[#F8FAFC]">
        {isAnalyzing ? (
          <div className="flex flex-col sm:flex-row gap-4 px-3 py-2">
            {['Sentiment Agent', 'Weather & Macro', 'Risk Agent', 'Historical RAG'].map((agent, i) => (
              <div key={i} className="flex-1 bg-white p-3 rounded shadow-sm border border-[#E2E8F0] flex items-center justify-between">
                <span className="text-[13px] font-semibold text-[#0F172A]">{agent}</span>
                <span className={`text-[10px] font-bold uppercase ${i % 2 === 0 ? 'text-[#2563EB]' : 'text-[#64748B]'}`}>
                  {i % 2 === 0 ? 'RUNNING' : 'WAITING'}
                </span>
              </div>
            ))}
          </div>
        ) : findings.length === 0 ? (
          <div className="text-[13px] text-[#64748B] font-medium text-center py-4 bg-white rounded border border-[#E2E8F0]">
            NO NEW INTELLIGENCE — Nothing materially changed from the previous analysis.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {findings.map((finding, idx) => {
              const severityColors = {
                CRITICAL: 'text-[#DC2626]',
                WARNING: 'text-[#D97706]',
                INFO: 'text-[#2563EB]',
                POSITIVE: 'text-[#16A34A]'
              };
              
              const isInitial = finding.id === 'initial';

              return (
                <div 
                  key={finding.id}
                  onClick={() => onItemClick(finding.targetSectionId)}
                  className="bg-white p-4 rounded-lg shadow-sm border border-[#E2E8F0] hover:border-[#CBD5E1] hover:shadow transition-all cursor-pointer group flex flex-col justify-between"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3B82F6] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2563EB]"></span>
                      </span>
                      <span className={`text-[12px] font-bold uppercase tracking-wider ${isInitial ? 'text-[#0F172A]' : severityColors[finding.severity]}`}>
                        {finding.title}
                      </span>
                    </div>
                    
                    <div className="text-[14px] font-medium text-[#334155] leading-snug mb-3">
                      {finding.message}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider pt-2 border-t border-[#F1F5F9]">
                    <div className="text-[#64748B] flex items-center gap-1.5 truncate pr-2">
                      <span className="truncate">{finding.source}</span>
                      <span>•</span>
                      <span className={finding.dataStatus === 'LIVE' ? 'text-[#2563EB]' : finding.dataStatus.includes('SIMULATION') ? 'text-[#16A34A]' : 'text-[#64748B]'}>
                        {finding.dataStatus}
                      </span>
                    </div>
                    {finding.targetSectionId && (
                      <ArrowRight className="w-3.5 h-3.5 text-[#CBD5E1] group-hover:text-[#2563EB] group-hover:translate-x-0.5 transition-transform shrink-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
