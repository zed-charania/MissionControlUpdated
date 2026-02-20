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

// Node types with custom styling
const nodeTypes = {
  you: YouNode,
  headAgent: HeadAgentNode,
  spawner: SpawnerNode,
  subAgent: SubAgentNode,
  tool: ToolNode,
  external: ExternalNode,
};

// Custom node components
function YouNode({ data }: { data: any }) {
  return (
    <div className="px-4 py-2 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 text-white border-2 border-purple-400 shadow-lg shadow-purple-500/20">
      <div className="text-xs opacity-70">Human Operator</div>
      <div className="font-bold">{data.label}</div>
      <div className="text-xs mt-1">Strategy & Approval</div>
    </div>
  );
}

function HeadAgentNode({ data }: { data: any }) {
  return (
    <div className="px-4 py-2 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 text-white border-2 border-blue-400 shadow-lg shadow-blue-500/20">
      <div className="text-xs opacity-70">Head Agent (Tier 3)</div>
      <div className="font-bold">{data.label}</div>
      <div className="text-xs mt-1">Orchestration & Delegation</div>
      <div className="text-[10px] opacity-60 mt-1">GPT-5.3 Codex</div>
    </div>
  );
}

function SpawnerNode({ data }: { data: any }) {
  return (
    <div className="px-4 py-2 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border-2 border-indigo-400 shadow-lg shadow-indigo-500/20">
      <div className="text-xs opacity-70">Agent Spawner</div>
      <div className="font-bold">{data.label}</div>
      <div className="text-xs mt-1">Max 8 Concurrent</div>
    </div>
  );
}

function SubAgentNode({ data }: { data: any }) {
  const tierColors = {
    1: 'from-green-600 to-green-800 border-green-400',
    2: 'from-amber-600 to-amber-800 border-amber-400',
    3: 'from-red-600 to-red-800 border-red-400',
  };
  
  return (
    <div className={`px-3 py-2 rounded-xl bg-gradient-to-br ${tierColors[data.tier as keyof typeof tierColors]} text-white border-2 shadow-lg`}>
      <div className="text-[10px] opacity-70">Sub-Agent (Tier {data.tier})</div>
      <div className="font-bold text-sm">{data.label}</div>
      <div className="text-xs mt-1">{data.cost}</div>
    </div>
  );
}

function ToolNode({ data }: { data: any }) {
  return (
    <div className="px-3 py-2 rounded-xl bg-gradient-to-br from-cyan-600 to-cyan-800 text-white border-2 border-cyan-400 shadow-lg shadow-cyan-500/20">
      <div className="text-[10px] opacity-70">Tool</div>
      <div className="font-bold text-sm">{data.label}</div>
    </div>
  );
}

function ExternalNode({ data }: { data: any }) {
  return (
    <div className="px-3 py-2 rounded-xl bg-gradient-to-br from-pink-600 to-pink-800 text-white border-2 border-pink-400 shadow-lg shadow-pink-500/20">
      <div className="text-[10px] opacity-70">External</div>
      <div className="font-bold text-sm">{data.label}</div>
    </div>
  );
}

// Initial nodes
const initialNodes: Node[] = [
  // Control Layer
  { id: 'you', type: 'you', position: { x: 400, y: 0 }, data: { label: 'You (Zed)' } },
  { id: 'head', type: 'headAgent', position: { x: 400, y: 100 }, data: { label: 'JARVIS Head' } },
  
  // Spawner Layer
  { id: 'spawner', type: 'spawner', position: { x: 400, y: 200 }, data: { label: 'Agent Spawner' } },
  
  // Sub-Agent Layer (Tier 1 - Cheap)
  { id: 'sourcer', type: 'subAgent', position: { x: 50, y: 320 }, data: { label: 'Sourcer', tier: 1, cost: '$0.05/run' } },
  { id: 'qualifier', type: 'subAgent', position: { x: 200, y: 320 }, data: { label: 'Qualifier', tier: 1, cost: '$0.05/run' } },
  { id: 'nurture', type: 'subAgent', position: { x: 600, y: 320 }, data: { label: 'Nurture', tier: 1, cost: '$0.05/run' } },
  { id: 'content', type: 'subAgent', position: { x: 750, y: 320 }, data: { label: 'Content', tier: 1, cost: '$0.05/run' } },
  
  // Sub-Agent Layer (Tier 2 - Mid)
  { id: 'proposal', type: 'subAgent', position: { x: 300, y: 320 }, data: { label: 'Proposal', tier: 2, cost: '$0.20/run' } },
  { id: 'builder', type: 'subAgent', position: { x: 450, y: 320 }, data: { label: 'Builder', tier: 2, cost: '$0.50/run' } },
  { id: 'qa', type: 'subAgent', position: { x: 550, y: 320 }, data: { label: 'QA', tier: 2, cost: '$0.20/run' } },
  
  // Tool Layer
  { id: 'browser', type: 'tool', position: { x: 50, y: 450 }, data: { label: 'Browser' } },
  { id: 'web-search', type: 'tool', position: { x: 200, y: 450 }, data: { label: 'Web Search' } },
  { id: 'memory', type: 'tool', position: { x: 400, y: 450 }, data: { label: 'Memory DB' } },
  { id: 'exec', type: 'tool', position: { x: 550, y: 450 }, data: { label: 'Exec' } },
  { id: 'sessions', type: 'tool', position: { x: 700, y: 450 }, data: { label: 'Sessions' } },
  
  // External Layer
  { id: 'upwork', type: 'external', position: { x: 125, y: 580 }, data: { label: 'Upwork.com' } },
  { id: 'client', type: 'external', position: { x: 400, y: 580 }, data: { label: 'Client' } },
  { id: 'delivery', type: 'external', position: { x: 625, y: 580 }, data: { label: 'Delivery' } },
];

// Initial edges
const initialEdges: Edge[] = [
  // You to Head
  { id: 'e1', source: 'you', target: 'head', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 3 }, label: 'Delegate' },
  
  // Head to Spawner
  { id: 'e2', source: 'head', target: 'spawner', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 }, label: 'Spawn Request' },
  
  // Spawner to Sub-Agents (Spawn arrows)
  { id: 'e3', source: 'spawner', target: 'sourcer', style: { stroke: '#22c55e' }, label: 'spawn' },
  { id: 'e4', source: 'spawner', target: 'qualifier', style: { stroke: '#22c55e' }, label: 'spawn' },
  { id: 'e5', source: 'spawner', target: 'proposal', style: { stroke: '#f59e0b' }, label: 'spawn' },
  { id: 'e6', source: 'spawner', target: 'builder', style: { stroke: '#f59e0b' }, label: 'spawn' },
  { id: 'e7', source: 'spawner', target: 'qa', style: { stroke: '#f59e0b' }, label: 'spawn' },
  { id: 'e8', source: 'spawner', target: 'nurture', style: { stroke: '#22c55e' }, label: 'spawn' },
  { id: 'e9', source: 'spawner', target: 'content', style: { stroke: '#22c55e' }, label: 'spawn' },
  
  // Sub-Agents to Tools
  { id: 'e10', source: 'sourcer', target: 'browser', style: { stroke: '#06b6d4' } },
  { id: 'e11', source: 'sourcer', target: 'web-search', style: { stroke: '#06b6d4' } },
  { id: 'e12', source: 'qualifier', target: 'memory', style: { stroke: '#06b6d4' } },
  { id: 'e13', source: 'proposal', target: 'memory', style: { stroke: '#06b6d4' } },
  { id: 'e14', source: 'builder', target: 'exec', style: { stroke: '#06b6d4' } },
  { id: 'e15', source: 'builder', target: 'memory', style: { stroke: '#06b6d4' } },
  { id: 'e16', source: 'qa', target: 'exec', style: { stroke: '#06b6d4' } },
  { id: 'e17', source: 'qa', target: 'sessions', style: { stroke: '#06b6d4' } },
  
  // Tools to External
  { id: 'e18', source: 'browser', target: 'upwork', style: { stroke: '#ec4899' } },
  { id: 'e19', source: 'web-search', target: 'upwork', style: { stroke: '#ec4899' } },
  { id: 'e20', source: 'proposal', target: 'client', style: { stroke: '#ec4899' } },
  { id: 'e21', source: 'builder', target: 'delivery', style: { stroke: '#ec4899' } },
  { id: 'e22', source: 'qa', target: 'delivery', style: { stroke: '#ec4899' } },
  { id: 'e23', source: 'nurture', target: 'client', style: { stroke: '#ec4899' } },
];

export default function CleanArchitecturePage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id);
  }, []);

  const nodeInfo: Record<string, { title: string; desc: string; cost: string }> = {
    you: { title: 'You (Zed)', desc: 'Human operator. Sets strategy, approves high-value decisions, owns client relationships.', cost: 'N/A' },
    head: { title: 'JARVIS Head Agent', desc: 'GPT-5.3 Codex orchestrator. Delegates tasks, manages sub-agents, handles complex decisions.', cost: '$0.10-0.50/call' },
    spawner: { title: 'Agent Spawner', desc: 'Creates up to 8 concurrent sub-agents. Monitors budget, enforces timeouts.', cost: 'Free (orchestration)' },
    sourcer: { title: 'Sourcer Agent', desc: 'Finds Upwork jobs. Uses browser + web search. Runs every 30 min during peak.', cost: '$0.05/run' },
    qualifier: { title: 'Qualifier Agent', desc: 'Evaluates job fit, estimates scope, checks client quality. Go/No-Go decisions.', cost: '$0.05/run' },
    proposal: { title: 'Proposal Agent', desc: 'Drafts proposals with 3 variants. Reads templates from Memory.', cost: '$0.20/run' },
    builder: { title: 'Builder Agent', desc: 'Builds automations in Make/Zapier/Airtable. Full computer access.', cost: '$0.50/run' },
    qa: { title: 'QA Agent', desc: 'Tests edge cases, checks permissions, produces QA report.', cost: '$0.20/run' },
    nurture: { title: 'Nurture Agent', desc: 'Follow-ups, check-ins, client retention. Weekly automated touches.', cost: '$0.05/run' },
    content: { title: 'Content Agent', desc: 'Turns deliveries into LinkedIn posts, case studies, marketing content.', cost: '$0.05/run' },
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex items-center justify-between mb-2 p-4">
        <div>
          <h1 className="page-title mb-0">Clean Architecture Flow</h1>
          <p className="text-sm text-gray-500">
            GPT-5.3 Head Agent → Sub-Agents (Kimi) → Tools → External
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-purple-600"></span>You</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-600"></span>Head (5.3)</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-600"></span>Tier 1</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-600"></span>Tier 2</div>
        </div>
      </div>

      <div className="flex-1 flex">
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
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
            
            <Panel position="top-right" className="bg-surface-2/90 p-3 rounded-lg border border-white/10">
              <div className="text-xs space-y-1">
                <div className="text-gray-400">Daily Budgets:</div>
                <div className="flex justify-between gap-4"><span>Tier 1 Agents:</span><span className="text-green-400">$14/day</span></div>
                <div className="flex justify-between gap-4"><span>Tier 2 Agents:</span><span className="text-amber-400">$16/day</span></div>
                <div className="flex justify-between gap-4"><span>Head (5.3):</span><span className="text-blue-400">~$5/day</span></div>
                <div className="pt-1 border-t border-white/10 flex justify-between font-bold">
                  <span>Total:</span><span className="text-white">$35/day</span>
                </div>
              </div>
            </Panel>
          </ReactFlow>
        </div>

        {selectedNode && nodeInfo[selectedNode] && (
          <div className="w-80 p-4 border-l border-white/10 bg-surface-2/50">
            <h3 className="font-bold text-lg text-white mb-2">{nodeInfo[selectedNode].title}</h3>
            <p className="text-sm text-gray-300 mb-4">{nodeInfo[selectedNode].desc}</p>
            <div className="text-xs">
              <span className="text-gray-500">Cost: </span>
              <span className={nodeInfo[selectedNode].cost.includes('5.3') ? 'text-blue-400' : nodeInfo[selectedNode].cost.includes('0.05') ? 'text-green-400' : 'text-amber-400'}>
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
    </div>
  );
}
