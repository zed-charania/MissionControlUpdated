'use client';

import { useState } from 'react';

interface Agent {
  id: string;
  name: string;
  role: string;
  tier: 'you' | 'free' | 'cheap' | 'mid' | 'future';
  cost: string;
  description: string;
  status: 'active' | 'pending' | 'future';
  dailyBudget: string;
  tools: string[];
}

const AGENTS: Agent[] = [
  {
    id: 'you',
    name: 'You',
    role: 'Human Operator',
    tier: 'you',
    cost: 'Time',
    description: 'Strategy, approve leads, send proposals, own client relationships. The decision maker.',
    status: 'active',
    dailyBudget: 'Variable',
    tools: ['Mission Control', 'Upwork', 'Email'],
  },
  {
    id: 'sourcer',
    name: 'Sourcer',
    role: 'Job Finder',
    tier: 'cheap',
    cost: '$0.02/run',
    description: 'Scans Upwork every 30min. Finds 20-30 jobs/day. Delivers top 5 to your inbox.',
    status: 'active',
    dailyBudget: '~$0.40',
    tools: ['Browser', 'Web Search', 'Upwork API'],
  },
  {
    id: 'qualifier',
    name: 'Qualifier',
    role: 'Evaluator',
    tier: 'cheap',
    cost: '$0.02/run',
    description: 'Scores jobs 60+/100. Checks client rating, budget fit, complexity. Go/No-Go.',
    status: 'active',
    dailyBudget: '~$0.20',
    tools: ['Memory DB', 'Client Research'],
  },
  {
    id: 'proposal',
    name: 'Proposal',
    role: 'Writer',
    tier: 'mid',
    cost: '$0.10/run',
    description: 'Generates 3 proposal variants from templates. You edit before sending.',
    status: 'active',
    dailyBudget: '~$0.30',
    tools: ['Templates', 'Memory', 'Context'],
  },
  {
    id: 'builder',
    name: 'Builder',
    role: 'Developer',
    tier: 'future',
    cost: '$0.30/run',
    description: 'Full automation build in Make/Zapier/Airtable. Activates after $3k MRR.',
    status: 'future',
    dailyBudget: 'Locked',
    tools: ['Make', 'Zapier', 'Airtable', 'n8n'],
  },
  {
    id: 'qa',
    name: 'QA',
    role: 'Tester',
    tier: 'future',
    cost: '$0.20/run',
    description: 'Tests edge cases, verifies permissions, produces QA reports.',
    status: 'future',
    dailyBudget: 'Locked',
    tools: ['Test Suites', 'Exec', 'Browser'],
  },
  {
    id: 'nurture',
    name: 'Nurture',
    role: 'Retention',
    tier: 'future',
    cost: '$0.05/run',
    description: 'Follow-ups, check-ins, client retention. Automated relationship management.',
    status: 'future',
    dailyBudget: 'Locked',
    tools: ['Email', 'Calendar', 'CRM'],
  },
  {
    id: 'content',
    name: 'Content',
    role: 'Marketing',
    tier: 'future',
    cost: '$0.05/run',
    description: 'Turns deliveries into LinkedIn posts, case studies, marketing content.',
    status: 'future',
    dailyBudget: 'Locked',
    tools: ['Memory', 'Templates', 'Social'],
  },
];

const TIER_STYLES: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  you: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    text: 'text-purple-300',
    dot: 'bg-purple-500',
  },
  cheap: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-300',
    dot: 'bg-emerald-500',
  },
  mid: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-300',
    dot: 'bg-blue-500',
  },
  future: {
    bg: 'bg-amber-500/5',
    border: 'border-amber-500/10',
    text: 'text-amber-300/60',
    dot: 'bg-amber-500/40',
  },
};

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function getAvatarGradient(name: string) {
  const gradients = [
    'from-violet-500 to-purple-600',
    'from-emerald-400 to-teal-500',
    'from-blue-400 to-indigo-500',
    'from-amber-400 to-orange-500',
    'from-rose-400 to-pink-500',
    'from-cyan-400 to-blue-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

export default function ArchitecturePage() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  
  const activeAgents = AGENTS.filter(a => a.status === 'active');
  const futureAgents = AGENTS.filter(a => a.status === 'future');
  
  const dailyCost = activeAgents
    .filter(a => a.tier !== 'you')
    .reduce((sum, a) => {
      const costMatch = a.cost.match(/\$([0-9.]+)/);
      const cost = costMatch ? parseFloat(costMatch[1]) : 0;
      const runs = a.tier === 'cheap' ? 10 : 3;
      return sum + (cost * runs);
    }, 0);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white mb-2">Agent Architecture</h1>
        <p className="text-sm text-gray-400">
          {activeAgents.length} active agents • {futureAgents.length} future agents
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <div className="text-xs text-gray-500 mb-1">Daily Cost</div>
          <div className="text-2xl font-semibold text-emerald-400">${dailyCost.toFixed(2)}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <div className="text-xs text-gray-500 mb-1">Monthly</div>
          <div className="text-2xl font-semibold text-blue-400">${(dailyCost * 30).toFixed(0)}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <div className="text-xs text-gray-500 mb-1">Target MRR</div>
          <div className="text-2xl font-semibold text-purple-400">$3-5k</div>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <div className="text-xs text-gray-500 mb-1">Margin</div>
          <div className="text-2xl font-semibold text-white">98%</div>
        </div>
      </div>

      {/* Workflow Diagram */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] mb-8">
        <h3 className="text-sm font-medium text-white mb-4">Workflow</h3>
        <div className="flex items-center gap-2 text-sm overflow-x-auto pb-2">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            You
          </div>
          <span className="text-gray-600">→</span>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Sourcer
          </div>
          <span className="text-gray-600">→</span>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Qualifier
          </div>
          <span className="text-gray-600">→</span>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            You Approve
          </div>
          <span className="text-gray-600">→</span>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Proposal
          </div>
          <span className="text-gray-600">→</span>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            You Send
          </div>
          <span className="text-gray-600">→</span>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/20 border border-pink-500/30 text-pink-300 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-pink-500"></span>
            Client
          </div>
        </div>
      </div>

      {/* Active Agents */}
      <h2 className="text-lg font-medium text-white mb-4">Active Agents</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {activeAgents.map(agent => {
          const styles = TIER_STYLES[agent.tier];
          return (
            <div
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              className={`group p-5 rounded-2xl ${styles.bg} border ${styles.border} cursor-pointer transition-all hover:scale-[1.02] hover:border-opacity-40`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarGradient(agent.name)} flex items-center justify-center text-white font-semibold shadow-lg`}>
                  {getInitials(agent.name)}
                </div>
                <div className={`w-2 h-2 rounded-full ${styles.dot}`}></div>
              </div>
              
              <h3 className="text-white font-medium mb-1">{agent.name}</h3>
              <p className={`text-sm ${styles.text} mb-3`}>{agent.role}</p>
              
              <p className="text-xs text-gray-400 line-clamp-2 mb-4">{agent.description}</p>
              
              <div className="flex items-center justify-between text-xs">
                <span className={styles.text}>{agent.cost}</span>
                <span className="text-gray-500">{agent.dailyBudget}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Future Agents */}
      <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
        Future Agents
        <span className="text-xs font-normal text-gray-500">Unlock after $3k MRR</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {futureAgents.map(agent => {
          const styles = TIER_STYLES[agent.tier];
          return (
            <div
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              className={`group p-5 rounded-2xl ${styles.bg} border ${styles.border} cursor-pointer opacity-60 hover:opacity-80 transition-all`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarGradient(agent.name)} flex items-center justify-center text-white font-semibold shadow-lg opacity-50`}>
                  {getInitials(agent.name)}
                </div>
                <div className="text-amber-500/40 text-xs">🔒</div>
              </div>
              
              <h3 className="text-white/60 font-medium mb-1">{agent.name}</h3>
              <p className={`text-sm ${styles.text} mb-3`}>{agent.role}</p>
              
              <p className="text-xs text-gray-500 line-clamp-2 mb-4">{agent.description}</p>
              
              <div className="text-xs text-amber-500/40">{agent.dailyBudget}</div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selectedAgent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedAgent(null)}
        >
          <div
            className="w-full max-w-md p-6 rounded-2xl bg-[#0f1117] border border-white/[0.08] shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getAvatarGradient(selectedAgent.name)} flex items-center justify-center text-white text-xl font-semibold shadow-lg`}>
                  {getInitials(selectedAgent.name)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{selectedAgent.name}</h3>
                  <p className={`text-sm ${TIER_STYLES[selectedAgent.tier].text}`}>{selectedAgent.role}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAgent(null)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${TIER_STYLES[selectedAgent.tier].bg} border ${TIER_STYLES[selectedAgent.tier].border} mb-4`}>
              <span className={`w-2 h-2 rounded-full ${TIER_STYLES[selectedAgent.tier].dot}`}></span>
              <span className={`text-xs ${TIER_STYLES[selectedAgent.tier].text}`}>
                {selectedAgent.tier === 'you' ? 'Human Operator' : selectedAgent.tier === 'cheap' ? 'Cheap Agent' : selectedAgent.tier === 'mid' ? 'Mid Agent' : 'Future Agent'}
              </span>
            </div>

            <p className="text-gray-300 text-sm mb-6 leading-relaxed">{selectedAgent.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 rounded-xl bg-white/[0.03]">
                <div className="text-xs text-gray-500 mb-1">Cost</div>
                <div className={TIER_STYLES[selectedAgent.tier].text}>{selectedAgent.cost}</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03]">
                <div className="text-xs text-gray-500 mb-1">Daily Budget</div>
                <div className="text-gray-300">{selectedAgent.dailyBudget}</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs text-gray-500 mb-2">Tools</div>
              <div className="flex flex-wrap gap-2">
                {selectedAgent.tools.map(tool => (
                  <span key={tool} className="px-2.5 py-1 rounded-lg bg-white/[0.05] text-xs text-gray-400">
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            {selectedAgent.status === 'future' && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-2 text-amber-400 text-sm mb-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="font-medium">Locked</span>
                </div>
                <p className="text-xs text-amber-400/70">Activate after reaching $3,000 MRR. This enables full automation.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
