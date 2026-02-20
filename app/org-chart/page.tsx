'use client';

import { useState } from 'react';

interface Stage {
  id: string;
  name: string;
  agent: string;
  tier: 0 | 1 | 2 | 3;
  description: string;
  outputs: string[];
  next: string[];
}

const PIPELINE_STAGES: Stage[] = [
  {
    id: 'source',
    name: '1. Source',
    agent: 'Sourcer Agent',
    tier: 1,
    description: 'Finds Upwork jobs matching your service templates',
    outputs: ['Job list', 'Fit score', 'Why + angle'],
    next: ['qualify'],
  },
  {
    id: 'qualify',
    name: '2. Qualify',
    agent: 'Qualifier Agent',
    tier: 1,
    description: 'Turns job post into scope, risk, timeline, price range',
    outputs: ['Scope guess', 'Risk assessment', 'Go/no-go'],
    next: ['respond', 'nurture'],
  },
  {
    id: 'respond',
    name: '3. Respond',
    agent: 'Proposal Agent',
    tier: 2,
    description: 'Drafts proposal + clarifying questions + proofs',
    outputs: ['3 proposal versions', '3 questions', '2 proofs'],
    next: ['close'],
  },
  {
    id: 'close',
    name: '4. Close',
    agent: 'You (Human)',
    tier: 3,
    description: 'Approve and submit proposal, external side effect',
    outputs: ['Signed contract', 'Deposit milestone'],
    next: ['deliver'],
  },
  {
    id: 'deliver',
    name: '5. Deliver',
    agent: 'Builder Agent',
    tier: 2,
    description: 'Builds automation in Make/Zapier/Airtable/Sheets',
    outputs: ['Working automation', 'Tested artifacts'],
    next: ['wrap'],
  },
  {
    id: 'wrap',
    name: '6. Wrap',
    agent: 'QA Agent',
    tier: 2,
    description: 'Checks edge cases, permissions, produces test plan',
    outputs: ['Test checklist', 'Docs', 'Loom script'],
    next: ['nurture'],
  },
  {
    id: 'nurture',
    name: '7. Nurture',
    agent: 'Nurture Agent',
    tier: 1,
    description: 'Follow-ups, check-ins, lightweight updates',
    outputs: ['Weekly updates', 'Upsell offers'],
    next: [],
  },
];

const TIER_COLORS: Record<number, string> = {
  0: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  1: 'bg-green-500/20 text-green-300 border-green-500/30',
  2: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  3: 'bg-red-500/20 text-red-300 border-red-500/30',
};

const TIER_NAMES: Record<number, string> = {
  0: 'Tier 0: Free (scripts)',
  1: 'Tier 1: Cheap (Kimi)',
  2: 'Tier 2: Mid (Kimi+thinking)',
  3: 'Tier 3: Expensive (GPT)',
};

export default function OrgChartPage() {
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [showTiers, setShowTiers] = useState(true);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="page-title mb-0">Agent Routing Diagram</h1>
          <p className="text-sm text-gray-500">
            Upwork Deal Factory: How jobs flow through the pipeline
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTiers(!showTiers)}
            className={`btn-ghost text-xs ${showTiers ? 'bg-white/5' : ''}`}
          >
            {showTiers ? 'Hide Tiers' : 'Show Tiers'}
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[0, 1, 2, 3].map(tier => (
          <div key={tier} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs ${TIER_COLORS[tier]}`}>
            <span className="font-medium">Tier {tier}</span>
            <span className="opacity-70">{tier === 0 ? 'Free' : tier === 1 ? 'Cheap' : tier === 2 ? 'Mid' : 'Expensive'}</span>
          </div>
        ))}
      </div>

      {/* Pipeline Flow */}
      <div className="relative">
        {/* Connection Lines - Vertical */}
        <div className="absolute left-[50%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent -translate-x-1/2 hidden lg:block" />

        {/* Stages */}
        <div className="space-y-4">
          {PIPELINE_STAGES.map((stage, index) => (
            <div
              key={stage.id}
              className={`relative flex flex-col lg:flex-row items-stretch gap-4 ${
                index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              }`}
            >
              {/* Stage Card */}
              <div
                className={`flex-1 card-hover cursor-pointer border-l-4 ${
                  TIER_COLORS[stage.tier].split(' ')[2]
                }`}
                onClick={() => setSelectedStage(stage)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-white">{stage.name}</h3>
                      {showTiers && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${TIER_COLORS[stage.tier]}`}>
                          Tier {stage.tier}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-accent mb-2">{stage.agent}</p>
                    <p className="text-xs text-gray-400">{stage.description}</p>
                  </div>
                  <div className="text-lg opacity-30">→</div>
                </div>

                {/* Outputs */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {stage.outputs.map((output, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-400"
                    >
                      {output}
                    </span>
                  ))}
                </div>
              </div>

              {/* Center Node */}
              <div className="hidden lg:flex items-center justify-center w-8">
                <div className={`w-3 h-3 rounded-full border-2 ${TIER_COLORS[stage.tier].split(' ')[2]}`} />
              </div>

              {/* Spacer for alternating layout */}
              <div className="flex-1 hidden lg:block" />
            </div>
          ))}
        </div>
      </div>

      {/* Cost Controller Box */}
      <div className="mt-8 p-4 rounded-xl border border-purple-500/30 bg-purple-500/10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-purple-300">🛡️</span>
          <h3 className="text-sm font-semibold text-purple-300">Cost Controller Agent</h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Cross-Cutting
          </span>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Monitors per-job spend, flags overruns, enforces tier downgrade policy
        </p>
        <div className="flex flex-wrap gap-2 text-[10px]">
          <span className="px-2 py-0.5 rounded bg-white/5 text-gray-400">Track: &lt;$0.50/job</span>
          <span className="px-2 py-0.5 rounded bg-white/5 text-gray-400">Alert: &gt;$2.00/job</span>
          <span className="px-2 py-0.5 rounded bg-white/5 text-gray-400">Auto-downgrade on overruns</span>
        </div>
      </div>

      {/* Mission Control Mapping */}
      <div className="mt-8 card">
        <h3 className="text-sm font-semibold text-white mb-4">Mission Control Integration</h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-white/5">
            <span className="text-accent">Tasks</span>
            <p className="text-gray-500 mt-1">Job pipeline stages</p>
          </div>
          <div className="p-3 rounded-lg bg-white/5">
            <span className="text-accent">Team</span>
            <p className="text-gray-500 mt-1">Agent roles & ownership</p>
          </div>
          <div className="p-3 rounded-lg bg-white/5">
            <span className="text-accent">Content</span>
            <p className="text-gray-500 mt-1">LinkedIn posts, case studies</p>
          </div>
          <div className="p-3 rounded-lg bg-white/5">
            <span className="text-accent">Calendar</span>
            <p className="text-gray-500 mt-1">Deadlines & follow-ups</p>
          </div>
          <div className="p-3 rounded-lg bg-white/5">
            <span className="text-accent">Memory</span>
            <p className="text-gray-500 mt-1">Client context & SOPs</p>
          </div>
          <div className="p-3 rounded-lg bg-white/5">
            <span className="text-accent">Operations</span>
            <p className="text-gray-500 mt-1">Weekly cost audits</p>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedStage && (
        <StageModal stage={selectedStage} onClose={() => setSelectedStage(null)} />
      )}
    </div>
  );
}

function StageModal({ stage, onClose }: { stage: Stage; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md card max-h-[80vh] overflow-auto">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">{stage.name}</h3>
            <p className="text-sm text-accent">{stage.agent}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white">✕</button>
        </div>

        <div className={`inline-block px-3 py-1 rounded-full text-xs border mb-4 ${TIER_COLORS[stage.tier]}`}>
          {TIER_NAMES[stage.tier]}
        </div>

        <p className="text-sm text-gray-300 mb-4">{stage.description}</p>

        <div className="mb-4">
          <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Outputs</h4>
          <ul className="space-y-1">
            {stage.outputs.map((output, i) => (
              <li key={i} className="text-sm text-gray-400 flex items-center gap-2">
                <span className="text-accent">→</span> {output}
              </li>
            ))}
          </ul>
        </div>

        {stage.next.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Routes To</h4>
            <div className="flex flex-wrap gap-2">
              {stage.next.map(nextId => {
                const nextStage = PIPELINE_STAGES.find(s => s.id === nextId);
                return nextStage ? (
                  <span key={nextId} className="text-xs px-2 py-1 rounded bg-white/10 text-gray-300">
                    {nextStage.name}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-white/10">
          <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Cost Guardrails</h4>
          <div className="text-xs text-gray-400 space-y-1">
            {stage.tier === 0 && <p>✓ No model cost (scripts only)</p>}
            {stage.tier === 1 && <p>✓ Max $0.05/run (Kimi default)</p>}
            {stage.tier === 2 && <p>⚠ Max $0.20/run (Kimi + thinking)</p>}
            {stage.tier === 3 && <p>🔴 Max $0.50+/run (GPT - requires approval)</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
