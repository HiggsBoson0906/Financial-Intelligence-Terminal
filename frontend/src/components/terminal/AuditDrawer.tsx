import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, Shield, FileText } from 'lucide-react';
import type { AuditTrace } from '../../types';

interface AuditDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  auditTrace: AuditTrace;
}

export const AuditDrawer: React.FC<AuditDrawerProps> = ({
  isOpen,
  onClose,
  auditTrace,
}) => {
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'visual' | 'data'>('visual');

  if (!isOpen) return null;

  const currentStep = auditTrace.steps[selectedStepIndex] || auditTrace.steps[0];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-2xs select-none animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white border-l border-[#E2E8F0] h-full flex flex-col justify-between shadow-2xl overflow-hidden">
        {/* Drawer Header */}
        <div className="p-4 bg-white border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[14px] font-semibold text-[#0F172A]">
                Audit & Evidence Trace
              </h2>
              <span className="text-[11px] text-[#64748B] font-mono-tech">
                ID: {auditTrace.id} • {auditTrace.timestamp}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#F1F5F9] p-0.5 rounded-lg border border-[#E2E8F0] font-medium text-[11px]">
              <button
                onClick={() => setViewMode('visual')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  viewMode === 'visual'
                    ? 'bg-white text-[#2563EB] font-semibold shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Stages
              </button>
              <button
                onClick={() => setViewMode('data')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  viewMode === 'data'
                    ? 'bg-white text-[#2563EB] font-semibold shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Source Data
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-[#64748B] hover:text-[#0F172A] rounded-lg bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* User Query Banner */}
        <div className="bg-[#F8FAFC] p-3 border-b border-[#E2E8F0]">
          <span className="text-[12px] text-[#2563EB] font-semibold block mb-1">
            User Query Context
          </span>
          <p className="text-[13px] text-[#0F172A] italic">
            "{auditTrace.userQuery}"
          </p>
        </div>

        {/* Main Content Area */}
        {viewMode === 'visual' ? (
          <div className="flex-1 grid grid-cols-3 divide-x divide-[#E2E8F0] overflow-hidden">
            {/* Left Column: Stages Timeline List */}
            <div className="p-3 space-y-2 overflow-y-auto no-scrollbar tabular-data text-[13px] bg-[#F8FAFC]">
              <div className="text-[12px] text-[#94A3B8] font-semibold mb-2">
                Execution Stages
              </div>
              {auditTrace.steps.map((step, idx) => {
                const isSelected = selectedStepIndex === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedStepIndex(idx)}
                    className={`w-full p-2.5 rounded-lg text-left transition-all border ${
                      isSelected
                        ? 'bg-white border-[#2563EB] text-[#2563EB] shadow-xs'
                        : 'bg-white/60 border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold">Step 0{idx + 1}</span>
                      <span className="text-[#16A34A] font-semibold">{step.confidence}%</span>
                    </div>
                    <div className="font-semibold truncate text-[13px] text-[#0F172A]">
                      {step.title}
                    </div>
                    <div className="text-[11px] text-[#94A3B8] truncate mt-0.5">{step.source}</div>
                  </button>
                );
              })}
            </div>

            {/* Right 2 Columns: Detailed Stage Inspector */}
            <div className="col-span-2 p-4 overflow-y-auto tabular-data text-[13px] space-y-4 bg-white">
              <div className="bg-[#F8FAFC] p-3.5 rounded-lg border border-[#E2E8F0]">
                <div className="text-[12px] font-semibold text-[#2563EB] mb-1 capitalize">
                  {currentStep.stage.toLowerCase().replace(/_/g, ' ')}
                </div>
                <h3 className="text-[15px] font-semibold text-[#0F172A] mb-1">
                  {currentStep.title}
                </h3>
                <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-2 border-t border-[#E2E8F0]">
                  <span>Source: <span className="text-[#0F172A] font-semibold">{currentStep.source}</span></span>
                  <span>Time: <span className="text-[#0F172A]">{currentStep.timestamp}</span></span>
                  <span>Confidence: <span className="text-[#16A34A] font-semibold">{currentStep.confidence}%</span></span>
                </div>
              </div>

              {/* Result Summary Box */}
              <div className="bg-[#F0FDF4] p-3 rounded-lg border border-[#BBF7D0]">
                <span className="text-[12px] font-semibold text-[#16A34A] block mb-1">
                  Stage Result
                </span>
                <p className="text-[13px] font-medium text-[#0F172A] leading-snug">{currentStep.result}</p>
              </div>

              {/* Evidence & Telemetry Bullet Points */}
              <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
                <span className="text-[12px] font-semibold text-[#64748B] block mb-2">
                  Evidence Trace
                </span>
                <ul className="space-y-2 text-[13px] text-[#334155]">
                  {currentStep.details.map((dt, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{dt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          /* Structured Data View */
          <div className="flex-1 p-6 bg-white overflow-y-auto">
            <div className="mb-5">
              <h3 className="text-[15px] font-semibold text-[#0F172A] mb-1">
                {currentStep.title}
              </h3>
              <div className="text-[12px] text-[#64748B] capitalize">
                Source data for {currentStep.stage.toLowerCase().replace(/_/g, ' ')}
              </div>
            </div>
            
            <div className="border border-[#E2E8F0] rounded-lg overflow-hidden">
              <table className="w-full text-[13px] text-left tabular-data">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] text-[11px] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-4 py-2.5">Data Point</th>
                    <th className="px-4 py-2.5">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {currentStep.payload && Object.entries(currentStep.payload).map(([key, value], idx) => (
                    <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3 font-medium text-[#0F172A] capitalize whitespace-nowrap">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </td>
                      <td className="px-4 py-3 text-[#334155]">
                        {typeof value === 'object' && !Array.isArray(value) && value !== null ? (
                          <div className="space-y-1">
                            {Object.entries(value).map(([k, v]) => (
                              <div key={k} className="flex gap-2">
                                <span className="text-[#64748B] capitalize">{k}:</span>
                                <span className="font-medium text-[#0F172A]">{String(v)}</span>
                              </div>
                            ))}
                          </div>
                        ) : Array.isArray(value) ? (
                          value.join(', ')
                        ) : (
                          String(value)
                        )}
                      </td>
                    </tr>
                  ))}
                  {!currentStep.payload && (
                    <tr>
                      <td colSpan={2} className="px-4 py-8 text-center text-[#94A3B8] italic">
                        No telemetry data available for this stage.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Drawer Footer */}
        <div className="p-3 bg-white border-t border-[#E2E8F0] flex items-center justify-between text-[10px] tabular-data text-[#64748B]">
          <span className="flex items-center gap-1.5 font-sans font-medium">
            <Shield className="w-3.5 h-3.5 text-[#16A34A]" />
            Cryptographically Hashed Reasoning Trace
          </span>
          <span className="text-[#94A3B8]">FIT AUDIT V2.4</span>
        </div>
      </div>
    </div>
  );
};
