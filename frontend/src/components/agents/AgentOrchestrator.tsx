import React, { useEffect, useState, useRef } from 'react';
import { AgentNode } from '../../types';
import { Bot, Play, CheckCircle2, Loader2, FileCode, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { pulseElement } from '../../utils/animeUtils';

interface AgentOrchestratorProps {
  agents: AgentNode[];
  onSelectAgent?: (agent: AgentNode) => void;
}

export const AgentOrchestrator: React.FC<AgentOrchestratorProps> = ({
  agents,
  onSelectAgent,
}) => {
  const [selectedAgent, setSelectedAgent] = useState<AgentNode>(agents[0]);
  const [activePulse, setActivePulse] = useState(true);

  useEffect(() => {
    // Apply pulse on active analyzing nodes using Anime.js
    const animation = pulseElement('.active-agent-pulse');
    return () => {
      animation?.pause();
    };
  }, []);

  const getStatusBadge = (status: AgentNode['status']) => {
    switch (status) {
      case 'analyzing':
        return (
          <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[9px] font-mono-data font-bold flex items-center gap-1">
            <Loader2 className="w-2.5 h-2.5 animate-spin" /> ANALYZING
          </span>
        );
      case 'completed':
        return (
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 text-[9px] font-mono-data font-bold flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" /> COMPLETED
          </span>
        );
      case 'alert':
        return (
          <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-400/40 text-[9px] font-mono-data font-bold flex items-center gap-1">
            ALERT
          </span>
        );
      default:
        return (
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px] font-mono-data">
            IDLE
          </span>
        );
    }
  };

  return (
    <div className="terminal-card p-4 rounded select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-3 mb-4 border-b border-[#1e2333]">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-[#00f0ff]" />
            <h2 className="text-xs font-bold text-slate-100 tracking-wider uppercase font-mono-data">
              MULTI-AGENT ANALYSIS GRAPH
            </h2>
            <span className="px-2 py-0.5 rounded bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 text-[9px] font-mono-data">
              AUTONOMOUS INTELLIGENCE PIPELINE
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Inter-agent data pass, consensus voting, and quantitative risk validation chain
          </p>
        </div>

        <button 
          onClick={() => setActivePulse(!activePulse)}
          className="px-2.5 py-1 rounded bg-[#0d1220] hover:bg-[#131b2e] border border-[#1e273e] text-slate-300 text-xs font-mono-data flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3 h-3 text-cyan-400" />
          <span>RE-SIMULATE FLOW</span>
        </button>
      </div>

      {/* Visual Agent Flow Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-4 relative">
        {agents.map((agent, idx) => {
          const isSelected = selectedAgent?.id === agent.id;
          const isAnalyzing = agent.status === 'analyzing';

          return (
            <div
              key={agent.id}
              onClick={() => {
                setSelectedAgent(agent);
                onSelectAgent?.(agent);
              }}
              className={`p-3 rounded border transition-all cursor-pointer flex flex-col justify-between h-32 relative ${
                isAnalyzing ? 'active-agent-pulse' : ''
              } ${
                isSelected
                  ? 'bg-[#101628] border-[#00f0ff] shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                  : 'bg-[#090b12] hover:bg-[#0f1422] border-[#1e2436]'
              }`}
            >
              {/* Connector Arrow for desktop */}
              {idx < agents.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <ArrowRight className="w-3.5 h-3.5 text-[#00f0ff]/60" />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-mono-data text-slate-500">NODE 0{idx + 1}</span>
                  {getStatusBadge(agent.status)}
                </div>

                <div className="text-xs font-bold text-slate-100 font-mono-data tracking-tight group-hover:text-[#00f0ff]">
                  {agent.name}
                </div>
                <div className="text-[9px] text-slate-400 truncate mt-0.5">{agent.role}</div>
              </div>

              <div className="pt-2 border-t border-[#1a2030] flex items-center justify-between text-[10px] font-mono-data">
                <span className="text-slate-500">CONF:</span>
                <span className="font-bold text-emerald-400">{agent.confidence}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Agent Detail Inspector Drawer */}
      {selectedAgent && (
        <div className="bg-[#090c16] p-3.5 rounded border border-[#1e263c] font-mono-data text-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1b2234]">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#00f0ff]" />
              <span className="font-bold text-slate-100 text-xs">INSPECTING: {selectedAgent.name}</span>
              <span className="text-slate-400 text-[10px]">({selectedAgent.role})</span>
            </div>

            <div className="text-[10px] text-slate-400">
              LAST ACTIVITY: <span className="text-slate-200">{selectedAgent.lastActive}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            {/* Inputs */}
            <div className="bg-[#06080f] p-2.5 rounded border border-[#161c2c]">
              <span className="text-[10px] font-bold text-slate-400 block mb-1">INPUT DATA SOURCES</span>
              <ul className="space-y-1 text-[11px] text-slate-300">
                {selectedAgent.inputs.map((inp, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-cyan-400" />
                    <span>{inp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Outputs */}
            <div className="bg-[#06080f] p-2.5 rounded border border-[#161c2c]">
              <span className="text-[10px] font-bold text-slate-400 block mb-1">COMPUTED OUTPUT ARTIFACTS</span>
              <ul className="space-y-1 text-[11px] text-slate-300">
                {selectedAgent.outputs.map((out, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-emerald-400" />
                    <span className="text-emerald-300 font-semibold">{out}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Real-time Agent Execution Log Stream */}
          <div className="bg-[#040509] p-2.5 rounded border border-[#141a29]">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5 font-bold">
              <span className="flex items-center gap-1 text-slate-300">
                <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                EXECUTION LOG TELEMETRY
              </span>
              <span className="text-emerald-400">STREAMING ACTIVE</span>
            </div>

            <div className="space-y-1 font-mono text-[10px] text-slate-300 max-h-24 overflow-y-auto no-scrollbar">
              {selectedAgent.logs.map((log, i) => (
                <div key={i} className="leading-snug text-slate-400 hover:text-slate-200 transition-colors">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
