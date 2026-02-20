'use client';

import { useCallback, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Connection,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Bootstrapped architecture - minimal cost, maximum output

const nodeTypes = {
  you: YouNode,
  manual: ManualNode,
  auto: AutoNode,
  tool: ToolNode,
  external: ExternalNode,
};

function YouNode({ data }: { data: any }) {
  return (
    <div className="px-4 py-2 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 text-white border-2 border-purple-400 shadow-lg">
      <div className="text-xs opacity-70">Human Operator</div>
      <div className="font-bold">{data.label}</div>
      <div className="text-xs mt-1">Strategy + Orchestration</div>
    </div>
  );
}

function ManualNode({ data }: { data: any }) {
  return (
    <div className="px-3 py-2 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 text-white border-2 border-amber-400 shadow-lg">
      <div className="text-[10px] opacity-70">Manual Step</div>
      <div className="font-bold text-sm">{data.label}</div>
      <div className="text-[10px] mt-1">You approve</div>
    </div>
  );
}

function AutoNode({ data }: { data: any }) {
  const costColors = {
    free: 'from-gray-600 to-gray-800 border-gray-400',
    cheap: 'from-green-600 to-green-800 border-green-400',
    mid: 'from-blue-600 to-blue-800 border-blue-400',
  };
  
  return (
    <div className={`px-3 py-2 rounded-xl bg-gradient-to-br ${costColors[data.cost as keyof typeof costColors]} text-white border-2 shadow-lg`}>
      <div className="text-[10px] opacity-70">{data.cost === 'free' ? 'Scripts' : 'Kimi Agent'}</div>
      <div className="font-bold text-sm">{data.label}</div>
      <div className="text-[10px] mt-1">{data.price}</div>
    </div>
  );
}

function ToolNode({ data }: { data: any }) {
  return (
    <div className="px-3 py-2 rounded-xl bg-gradient-to-br from-cyan-600 to-cyan-800 text-white border-2 border-cyan-400 shadow-lg">
      <div className="text-[10px] opacity-70">Tool</div>
      <div className="font-bold text-sm">{data.label}</div>
    </div>
  );
}

function ExternalNode({ data }: { data: any }) {
  return (
    <div className="px-3 py-2 rounded-xl bg-gradient-to-br from-pink-600 to-pink-800 text-white border-2 border-pink-400 shadow-lg">
      <div className="text-[10px] opacity-70">External</div>
      <div className="font-bold text-sm">{data.label}</div>
    </div>
  );
}

// Bootstrapped: 3-phase rollout

const initialNodes: Node[] = [
  // Phase 1: Manual (Week 1-2) - You do everything
  { id: 'you', type: 'you', position: { x: 400, y: 0 }, data: { label: 'You (Zed)' } },
  
  // Phase 2: Semi-Auto (Week 3-4) - Kimi drafts, you approve
  { id: 'sourcer', type: 'auto', position: { x: 100, y: 120 }, data: { label: 'Sourcer', cost: 'cheap', price: '$0.02/run' } },
  { id: 'qualifier', type: 'auto', position: { x: 300, y: 120 }, data: { label: 'Qualifier', cost: 'cheap', price: '$0.02/run' } },
  { id: 'draft-proposal', type: 'auto', position: { x: 500, y: 120 }, data: { label: 'Draft Proposal', cost: 'mid', price: '$0.10/run' } },
  
  // Approval gates (you control)
  { id: 'approve-leads', type: 'manual', position: { x: 200, y: 220 }, data: { label: 'Approve Leads' } },
  { id: 'approve-proposal', type: 'manual', position: { x: 500, y: 220 }, data: { label: 'Send Proposal' } },
  
  // Phase 3: Full Auto (Month 2+) - Only when profitable
  { id: 'builder', type: 'auto', position: { x: 400, y: 320 }, data: { label: 'Builder (Future)', cost: 'mid', price: '$0.30/run' } },
  
  // Tools
  { id: 'upwork-api', type: 'tool', position: { x: 100, y: 440 }, data: { label: 'Upwork API/Scrape' } },
  { id: 'templates', type: 'tool', position: { x: 300, y: 440 }, data: { label: 'Proposal Templates' } },
  { id: 'make', type: 'tool', position: { x: 400, y: 440 }, data: { label: 'Make/Zapier' } },
  
  // External
  { id: 'upwork', type: 'external', position: { x: 100, y: 560 }, data: { label: 'Upwork Jobs' } },
  { id: 'client', type: 'external', position: { x: 400, y: 560 }, data: { label: 'Client' } },
];

const initialEdges: Edge[] = [
  // You initiate
  { id: 'e1', source: 'you', target: 'sourcer', animated: true, style: { stroke: '#8b5cf6' }, label: 'Daily: Find jobs' },
  
  // Sourcer → Upwork
  { id: 'e2', source: 'sourcer', target: 'upwork-api', style: { stroke: '#22c55e' } },
  { id: 'e3', source: 'upwork-api', target: 'upwork', style: { stroke: '#ec4899' } },
  
  // Results → You approve
  { id: 'e4', source: 'sourcer', target: 'qualifier', style: { stroke: '#22c55e' } },
  { id: 'e5', source: 'qualifier', target: 'approve-leads', style: { stroke: '#22c55e' }, label: 'Top 5 leads' },
  { id: 'e6', source: 'approve-leads', target: 'you', style: { stroke: '#f59e0b', strokeDasharray: '5,5' }, label: 'You pick 2-3' },
  
  // You → Draft proposal
  { id: 'e7', source: 'you', target: 'draft-proposal', style: { stroke: '#8b5cf6' }, label: 'Draft for me' },
  { id: 'e8', source: 'draft-proposal', target: 'templates', style: { stroke: '#3b82f6' } },
  { id: 'e9', source: 'draft-proposal', target: 'approve-proposal', style: { stroke: '#3b82f6' }, label: '3 variants' },
  
  // You send
  { id: 'e10', source: 'approve-proposal', target: 'you', style: { stroke: '#f59e0b', strokeDasharray: '5,5' }, label: 'You edit & send' },
  { id: 'e11', source: 'you', target: 'client', style: { stroke: '#ec4899', strokeWidth: 2 }, label: 'External: Upwork' },
  
  // Future: Builder (Month 2+)
  { id: 'e12', source: 'you', target: 'builder', style: { stroke: '#6b7280', strokeDasharray: '10,5' }, label: 'Month 2+' },
  { id: 'e13', source: 'builder', target: 'make', style: { stroke: '#6b7280', strokeDasharray: '10,5' } },
  { id: 'e14', source: 'builder', target: 'client', style: { stroke: '#6b7280', strokeDasharray: '10,5' } },
];

export default function BootstrapArchitecturePage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [phase, setPhase] = useState(1);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id);
  }, []);

  const nodeInfo: Record<string, { title: string; desc: string; cost: string; phase: number }> = {
    you: { title: 'You (Zed)', desc: 'Orchestrator. Make strategic decisions, approve proposals, own client relationships.', cost: 'Your time', phase: 1 },
    sourcer: { title: 'Sourcer Agent (Kimi)', desc: 'Finds 20-30 Upwork jobs daily. Runs every morning. Filters by budget + keywords.', cost: '$0.02/run (~$0.60/day)', phase: 2 },
    qualifier: { title: 'Qualifier Agent (Kimi)', desc: 'Scores jobs 60+/100. Checks client rating, budget fit, complexity estimate.', cost: '$0.02/run (~$0.40/day)', phase: 2 },
    'draft-proposal': { title: 'Draft Proposal (Kimi)', desc: 'Generates 3 proposal variants from templates. You edit before sending.', cost: '$0.10/run (~$0.30/day)', phase: 2 },
    'approve-leads': { title: 'Approve Leads (Manual)', desc: 'Review Kimi\'s top 5 picks. Pick 2-3 to pursue. 5 min/day.', cost: 'Free (your time)', phase: 2 },
    'approve-proposal': { title: 'Send Proposal (Manual)', desc: 'Edit Kimi\'s draft, personalize, click send. 10 min/proposal.', cost: 'Free (your time)', phase: 2 },
    builder: { title: 'Builder Agent (Kimi)', desc: 'FULLY AUTOMATED build. Only activate after $5k MRR. Reduces your build time to 0.', cost: '$0.30/run (~$3/day)', phase: 3 },
    'upwork-api': { title: 'Upwork API/Scrape', desc: 'Free RSS feed scraping for job alerts. No API costs.', cost: 'Free', phase: 1 },
    templates: { title: 'Proposal Templates', desc: 'Pre-written templates stored in Mission Control Memory. Kimi personalizes them.', cost: 'Free (one-time setup)', phase: 2 },
    upwork: { title: 'Upwork Jobs', desc: 'Source of leads. Target: $500-$5000 projects initially.', cost: 'Free to browse', phase: 1 },
    client: { title: 'Client', desc: 'Revenue source. Close 2-4 deals/month at $1k average = $2-4k MRR.', cost: 'Revenue!', phase: 1 },
  };

  const phaseCosts = {
    1: { daily: 0, monthly: 0, description: 'You do everything. Learn the process.' },
    2: { daily: 1.50, monthly: 45, description: 'Kimi assists, you approve. Sweet spot for bootstrap.' },
    3: { daily: 4.50, monthly: 135, description: 'Full automation. Only when profitable.' },
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex items-center justify-between mb-2 p-4">
        <div>
          <h1 className="page-title mb-0">Bootstrap Architecture</h1>
          <p className="text-sm text-gray-500">
            Phase {phase}: {phaseCosts[phase as keyof typeof phaseCosts].description}
          </p>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map(p => (
            <button
              key={p}
              onClick={() => setPhase(p)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                phase === p 
                  ? 'bg-accent text-white' 
                  : 'bg-surface-2 text-gray-400 hover:text-white'
              }`}
            >
              Phase {p}
            </button>
          ))}
        </div>
      </div>

      {/* Cost Summary */}
      <div className="px-4 pb-2">
        <div className="flex gap-4 text-xs">
          <div className="px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
            <span className="text-gray-400">Daily: </span>
            <span className="text-green-400 font-bold">${phaseCosts[phase as keyof typeof phaseCosts].daily}</span>
          </div>
          <div className="px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <span className="text-gray-400">Monthly: </span>
            <span className="text-blue-400 font-bold">${phaseCosts[phase as keyof typeof phaseCosts].monthly}</span>
          </div>
          <div className="px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <span className="text-gray-400">Target MRR: </span>
            <span className="text-purple-400 font-bold">${phase === 1 ? '1-2k' : phase === 2 ? '3-5k' : '10k+'}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        <div className="flex-1">
          <ReactFlow
            nodes={nodes.filter(n => !n.hidden)}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
          >
            <Background color="#333" gap={16} />
            <Controls />
            <MiniMap nodeStrokeWidth={3} zoomable pannable />
          </ReactFlow>
        </div>

        {selectedNode && nodeInfo[selectedNode] && (
          <div className="w-80 p-4 border-l border-white/10 bg-surface-2/50 overflow-y-auto">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                nodeInfo[selectedNode].phase <= phase ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
              }`}>
                Phase {nodeInfo[selectedNode].phase}
              </span>
              {nodeInfo[selectedNode].phase <= phase ? (
                <span className="text-green-400 text-xs">✓ Active</span>
              ) : (
                <span className="text-gray-500 text-xs">Locked</span>
              )}
            </div>
            <h3 className="font-bold text-lg text-white mb-2">{nodeInfo[selectedNode].title}</h3>
            <p className="text-sm text-gray-300 mb-4">{nodeInfo[selectedNode].desc}</p>
            <div className="text-xs">
              <span className="text-gray-500">Cost: </span>
              <span className={nodeInfo[selectedNode].cost.includes('Free') ? 'text-green-400' : 'text-amber-400'}>
                {nodeInfo[selectedNode].cost}
              </span>
            </div>
            <button 
              onClick={() => setSelectedNode(null)}
              className="mt-4 text-xs text-gray-500 hover:text-white"
            >
              Close
            </button>
          </div>
        )}
      </div>

      {/* Phase Guide */}
      <div className="p-4 border-t border-white/10 bg-surface-2/30">
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className={`p-3 rounded-lg border ${phase === 1 ? 'bg-purple-500/10 border-purple-500/30' : 'bg-surface-2 border-white/5'}`}>
            <div className="font-bold text-white mb-1">Phase 1: Manual (Week 1-2)</div>
            <div className="text-gray-400">You do everything. Learn Upwork, write proposals manually, close first 2 deals. Zero AI cost.</div>
            <div className="text-green-400 mt-2">Cost: $0/day</div>
          </div>
          <div className={`p-3 rounded-lg border ${phase === 2 ? 'bg-blue-500/10 border-blue-500/30' : 'bg-surface-2 border-white/5'}`}>
            <div className="font-bold text-white mb-1">Phase 2: Semi-Auto (Week 3-4)</div>
            <div className="text-gray-400">Kimi finds and drafts. You approve and personalize. 80% time savings, minimal cost.</div>
            <div className="text-blue-400 mt-2">Cost: $1.50/day ($45/month)</div>
          </div>
          <div className={`p-3 rounded-lg border ${phase === 3 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-surface-2 border-white/5'}`}>
            <div className="font-bold text-white mb-1">Phase 3: Full Auto (Month 2+)</div>
            <div className="text-gray-400">Builder agent automates delivery. Only activate after $5k MRR. Scale without you.</div>
            <div className="text-amber-400 mt-2">Cost: $4.50/day ($135/month)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
