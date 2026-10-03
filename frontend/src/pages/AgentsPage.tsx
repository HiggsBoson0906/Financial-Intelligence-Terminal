import React from 'react';
import type { AgentNode } from '../types';
import { AgentOrchestrator } from '../components/agents/AgentOrchestrator';

interface AgentsPageProps {
  agents: AgentNode[];
}

export const AgentsPage: React.FC<AgentsPageProps> = ({ agents }) => {
  return (
    <div className="p-4 space-y-4 max-w-[1600px] mx-auto">
      <AgentOrchestrator agents={agents} />
    </div>
  );
};
