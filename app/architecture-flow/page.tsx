'use client';

import { useState } from 'react';

interface Agent {
  id: string;
  name: string;
  role: string;
  tier: 'you' | 'free' | 'cheap' | 'mid' | 'future';
  cost: string;
  responsibilities: string;
  status: 'active' | 'pending' | 'future';
  dailyRuns: string;
}

const AGENTS: Agent[] = [
  {
    id: 'you',
    name: 'You',
    role: 'Operator',
    tier: 'you',
    cost: 'Your time',
    responsibilities: 'Strategy, approve leads, send proposals, client relationships. The human in the loop.',
    status: 'active',
    dailyRuns: 'Continuous',
  },
  {
    id: 'sourcer',
    name: 'Sourcer',
    role: 'Job Finder',
    tier: 'cheap',
    cost: '$0.02/run',
    responsibilities: 'Scans Upwork every 30min. Finds 20-30 jobs/day. Filters by budget & keywords. Delivers top 5.',
    status: 'active',
    dailyRuns: '~20 runs',
  },
  {
    id: 'qualifier',
    name: 'Qualifier',
    role: 'Evaluator',
    tier: 'cheap',
    cost: '$0.02/run',
    responsibilities: 'Scores jobs 60+/100. Checks client rating, payment verified, scope estimate. Go/No-Go.',
    status: 'active',
    dailyRuns: '~10 runs',
  },
  {
    id: 'proposal',
    name: 'Proposal Writer',
    role: 'Drafter',
    tier: 'mid',
    cost: '$0.10/run',
    responsibilities: 'Generates 3 proposal variants from templates. You edit & personalize before sending.',
    status: 'active',
    dailyRuns: '~3 runs',
  },
  {
    id: 'builder',
    name: 'Builder',
    role: 'Developer',
    tier: 'future',
    cost: '$0.30/run',
    responsibilities: 'FULLY AUTOMATED build in Make/Zapier/Airtable. Only activate after $3k MRR.',
    status: 'future',
    dailyRuns: 'Locked until profitable',
  },
  {
    id: 'qa',
    name: 'QA Tester',
    role: 'Verifier',
    tier: 'future',
    cost: '$0.20/run',
    responsibilities: 'Tests edge cases, checks permissions, produces QA report. Part of full automation.',
    status: 'future',
    dailyRuns: 'Locked until profitable',
  },
  {
    id: 'nurture',
    name: 'Nurture',
    role: 'Retention',
    tier: 'future',
    cost: '$0.05/run',
    responsibilities: 'Follow-ups, check-ins, client retention. Automated relationship management.',
    status: 'future',
    dailyRuns: 'Locked until profitable',
  },
  {
    id: 'content',
    name: 'Content',
    role: 'Marketing',
    tier: 'future',
    cost: '$0.05/run',
    responsibilities: 'Turns deliveries into LinkedIn posts, case studies, marketing content.',
    status: 'future',
    dailyRuns: 'Locked until profitable',
  },
];

const TIER_COLORS: Record<string, string> = {
  you: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  free: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  cheap: 'bg-green-500/20 text-green-300 border-green-500/30',
  mid: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  future: 'bg-amber-500/10 text-amber-300/50 border-amber-500/20',
};

const TIER_LABELS: Record<string, string> = {
  you: 'You',
  free: 'Free',
  cheap: 'Cheap ($0.02)',
  mid: 'Mid ($0.10)',
  future: 'Future ($0.20-0.30)',
};

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function CleanArchitecturePage() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  
  const activeAgents = AGENTS.filter(a => a.status === 'active');
  const futureAgents = AGENTS.filter(a => a.status === 'future');
  
  const dailyCost = activeAgents
    .filter(a => a.tier !== 'you')
    .reduce((sum, a) => {
      const cost = parseFloat(a.cost.replace('$', '').replace('/run', ''));
      const runs = parseInt(a.dailyRuns.replace(/[^0-9]/g, '')) || 0;
      return sum + (cost * runs);
    }, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="page-title mb-0">Agent Architecture</h1>
          <p className="text-sm text-gray-500">
            {activeAgents.length} active agents, {futureAgents.length} future agents
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
            <span className="text-gray-400">Daily Cost: </span>
            <span className="text-green-400 font-bold">${dailyCost.toFixed(2)}</span>
          </div>
          <div className="px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <span className="text-gray-400">Monthly: </span>
            <span className="text-blue-400 font-bold">${(dailyCost * 30).toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* Workflow Summary */}
      <div className="card mb-6">
        <h3 className="text-sm font-semibold text-white mb-3">Workflow</h3>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300">You</span>
          <span className="text-gray-500">→</span>
          <span className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-300">Sourcer finds jobs</span>
          <span className="text-gray-500">→</span>
          <span className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-300">Qualifier scores</span>
          <span className="text-gray-500">→</span>
          <span className="text-amber-400 font-medium">You approve</span>
          <span className="text-gray-500">→</span>
          <span className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300">Proposal drafts</span>
          <span className="text-gray-500">→</span>
          <span className="text-amber-400 font-medium">You send</span>
          <span className="text-gray-500">→</span>
          <span className="px-3 py-1.5 rounded-lg bg-pink-500/20 text-pink-300">Client</span>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          You control every external action. AI assists, you decide. Zero risk of runaway costs.
        </p>
      </div>

      {/* Active Agents */}
      <h2 className="text-lg font-semibold text-white mb-3">Active Agents</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {activeAgents.map(agent => (
          <div 
            key={agent.id}
            className="card-hover group cursor-pointer"
            onClick={() => setSelectedAgent(agent)}
          >
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${TIER_COLORS[agent.tier]}`}>
                {getInitials(agent.name)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white">{agent.name}</h3>
                <p className="text-xs text-gray-400">{agent.role}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${TIER_COLORS[agent.tier]}`}>
                {TIER_LABELS[agent.tier]}
              </span>
            </div>
            <p className="mt-3 text-xs text-gray-400 line-clamp-2">{agent.responsibilities}</p>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-gray-500">{agent.cost}</span>
              <span className="text-gray-500">{agent.dailyRuns}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Future Agents */}
      <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
        Future Agents
        <span className="text-xs font-normal text-gray-500">(Unlock after $3k MRR)</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {futureAgents.map(agent => (
          <div 
            key={agent.id}
            className="card opacity-50 hover:opacity-75 transition-opacity cursor-pointer"
            onClick={() => setSelectedAgent(agent)}
          >
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${TIER_COLORS[agent.tier]}`}>
                {getInitials(agent.name)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white">{agent.name}</h3>
                <p className="text-xs text-gray-400">{agent.role}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${TIER_COLORS[agent.tier]}`}>
                {TIER_LABELS[agent.tier]}
              </span>
            </div>
            <p className="mt-3 text-xs text-gray-400 line-clamp-2">{agent.responsibilities}</p>
            <div className="mt-3 text-xs text-amber-400/70">
              🔒 {agent.dailyRuns}
            </div>
          </div>
        ))}
      </div>

      {/* Cost Breakdown */}
      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
          <div className="text-xs text-gray-400 mb-1">Cheap Agents</div>
          <div className="text-lg font-bold text-green-400">$0.80/day</div>
          <div className="text-xs text-gray-500">Sourcer + Qualifier</div>
        </div>
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <div className="text-xs text-gray-400 mb-1">Mid Agent</div>
          <div className="text-lg font-bold text-blue-400">$0.30/day</div>
          <div className="text-xs text-gray-500">Proposal (3 runs)</div>
        </div>
        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <div className="text-xs text-gray-400 mb-1">Total Daily</div>
          <div className="text-lg font-bold text-white">${dailyCost.toFixed(2)}</div>
          <div className="text-xs text-gray-500">~${(dailyCost * 30).toFixed(0)}/month</div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedAgent && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setSelectedAgent(null)}
        >
          <div 
            className="w-full max-w-md card"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold ${TIER_COLORS[selectedAgent.tier]}`}>
                  {getInitials(selectedAgent.name)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedAgent.name}</h3>
                  <p className="text-sm text-gray-400">{selectedAgent.role}</p>
                </div>
              </div>
              <button onClick={() => setSelectedAgent(null)} className="text-gray-500 hover:text-white">✕</button>
            </div>
            
            <div className={`inline-block px-3 py-1 rounded-full text-xs border mb-4 ${TIER_COLORS[selectedAgent.tier]}`}>
              {TIER_LABELS[selectedAgent.tier]}
            </div>
            
            <p className="text-sm text-gray-300 mb-4">{selectedAgent.responsibilities}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 block text-xs">Cost</span>
                <span className={selectedAgent.tier === 'cheap' ? 'text-green-400' : selectedAgent.tier === 'mid' ? 'text-blue-400' : 'text-gray-400'}>
                  {selectedAgent.cost}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">Daily Runs</span>
                <span className="text-gray-300">{selectedAgent.dailyRuns}</span>
              </div>
            </div>

            {selectedAgent.status === 'future' && (
              <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                🔒 Unlock after hitting $3,000 MRR. This agent enables full automation.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
