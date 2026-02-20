'use client';

import { useEffect, useState, useRef } from 'react';

interface FlowNode {
  id: string;
  label: string;
  type: 'main' | 'subagent' | 'tool' | 'external' | 'database';
  tier?: number;
  status: 'idle' | 'active' | 'spawning' | 'executing' | 'complete' | 'error';
  cost?: number;
  x: number;
  y: number;
}

interface FlowEdge {
  from: string;
  to: string;
  label: string;
  type: 'command' | 'data' | 'spawn' | 'return';
  animated?: boolean;
}

interface SimulationStep {
  timestamp: number;
  nodeId: string;
  action: string;
  edges: string[];
  description: string;
}

// Architecture definition
const NODES: FlowNode[] = [
  // Main Agent Layer
  { id: 'you', label: 'YOU (Zed)', type: 'main', status: 'idle', x: 400, y: 50 },
  { id: 'main-agent', label: 'Main Agent\n(JARVIS)', type: 'main', status: 'idle', x: 400, y: 120 },
  
  // Spawner Layer
  { id: 'spawner', label: 'Agent Spawner\n(Max 8)', type: 'main', status: 'idle', x: 400, y: 200 },
  
  // Sub-Agents Layer
  { id: 'sourcer', label: 'Sourcer Agent\nTier 1 ($0.05)', type: 'subagent', tier: 1, status: 'idle', cost: 0, x: 100, y: 320 },
  { id: 'qualifier', label: 'Qualifier Agent\nTier 1 ($0.05)', type: 'subagent', tier: 1, status: 'idle', cost: 0, x: 250, y: 320 },
  { id: 'proposal', label: 'Proposal Agent\nTier 2 ($0.20)', type: 'subagent', tier: 2, status: 'idle', cost: 0, x: 400, y: 320 },
  { id: 'builder', label: 'Builder Agent\nTier 2 ($0.50)', type: 'subagent', tier: 2, status: 'idle', cost: 0, x: 550, y: 320 },
  { id: 'qa', label: 'QA Agent\nTier 2 ($0.20)', type: 'subagent', tier: 2, status: 'idle', cost: 0, x: 700, y: 320 },
  
  // Tools Layer
  { id: 'browser', label: 'Browser Tool\n(Web Scraping)', type: 'tool', status: 'idle', x: 100, y: 440 },
  { id: 'web-search', label: 'Web Search\n(Upwork Jobs)', type: 'tool', status: 'idle', x: 250, y: 440 },
  { id: 'memory', label: 'Memory\n(Context DB)', type: 'database', status: 'idle', x: 400, y: 440 },
  { id: 'exec', label: 'Exec Tool\n(Build & Test)', type: 'tool', status: 'idle', x: 550, y: 440 },
  { id: 'sessions', label: 'Sessions\n(Message Routing)', type: 'tool', status: 'idle', x: 700, y: 440 },
  
  // External Layer
  { id: 'upwork', label: 'Upwork.com\n(Job Feed)', type: 'external', status: 'idle', x: 175, y: 560 },
  { id: 'client', label: 'Client\n(Proposal)', type: 'external', status: 'idle', x: 400, y: 560 },
  { id: 'delivery', label: 'Delivered\nAutomation', type: 'external', status: 'idle', x: 625, y: 560 },
];

const EDGES: FlowEdge[] = [
  // You to Main
  { from: 'you', to: 'main-agent', label: 'Command', type: 'command' },
  
  // Main to Spawner
  { from: 'main-agent', to: 'spawner', label: 'Spawn Request', type: 'command' },
  
  // Spawner to Sub-Agents (spawn arrows)
  { from: 'spawner', to: 'sourcer', label: 'sessions_spawn', type: 'spawn', animated: true },
  { from: 'spawner', to: 'qualifier', label: 'sessions_spawn', type: 'spawn', animated: true },
  { from: 'spawner', to: 'proposal', label: 'sessions_spawn', type: 'spawn', animated: true },
  { from: 'spawner', to: 'builder', label: 'sessions_spawn', type: 'spawn', animated: true },
  { from: 'spawner', to: 'qa', label: 'sessions_spawn', type: 'spawn', animated: true },
  
  // Sub-Agents to Tools
  { from: 'sourcer', to: 'browser', label: 'browser.open', type: 'command' },
  { from: 'sourcer', to: 'web-search', label: 'web_search', type: 'command' },
  { from: 'qualifier', to: 'memory', label: 'memory_search', type: 'data' },
  { from: 'proposal', to: 'memory', label: 'read templates', type: 'data' },
  { from: 'builder', to: 'exec', label: 'exec (build)', type: 'command' },
  { from: 'builder', to: 'memory', label: 'write spec', type: 'data' },
  { from: 'qa', to: 'exec', label: 'exec (test)', type: 'command' },
  { from: 'qa', to: 'sessions', label: 'sessions_send', type: 'command' },
  
  // Tools to External
  { from: 'browser', to: 'upwork', label: 'HTTPS GET', type: 'data' },
  { from: 'web-search', to: 'upwork', label: 'API/Scrape', type: 'data' },
  { from: 'proposal', to: 'client', label: 'Proposal Draft', type: 'data' },
  { from: 'builder', to: 'delivery', label: 'Working Automation', type: 'data' },
  { from: 'qa', to: 'delivery', label: 'QA Report', type: 'data' },
  
  // Returns (dashed lines)
  { from: 'upwork', to: 'sourcer', label: 'Job List', type: 'return' },
  { from: 'sourcer', to: 'spawner', label: 'spawn result', type: 'return' },
  { from: 'spawner', to: 'main-agent', label: 'Agent Complete', type: 'return' },
  { from: 'main-agent', to: 'you', label: 'Report', type: 'return' },
];

// Simulation scenarios
const SCENARIOS: SimulationStep[][] = [
  [
    { timestamp: 0, nodeId: 'you', action: 'start', edges: ['you-main-agent'], description: 'You: "Find me Upwork automation jobs"' },
    { timestamp: 500, nodeId: 'main-agent', action: 'spawn', edges: ['main-agent-spawner'], description: 'Main Agent spawns Agent Spawner' },
    { timestamp: 1000, nodeId: 'spawner', action: 'spawn', edges: ['spawner-sourcer'], description: 'Spawner creates Sourcer Agent (Tier 1, $0.05)' },
    { timestamp: 1500, nodeId: 'sourcer', action: 'execute', edges: ['sourcer-browser', 'sourcer-web-search'], description: 'Sourcer uses Browser + Web Search tools' },
    { timestamp: 2000, nodeId: 'browser', action: 'fetch', edges: ['browser-upwork'], description: 'Browser fetches Upwork.com' },
    { timestamp: 2500, nodeId: 'upwork', action: 'return', edges: ['upwork-sourcer'], description: 'Upwork returns job listings' },
    { timestamp: 3000, nodeId: 'sourcer', action: 'complete', edges: ['sourcer-spawner'], description: 'Sourcer returns scored jobs' },
    { timestamp: 3500, nodeId: 'spawner', action: 'spawn', edges: ['spawner-qualifier'], description: 'Spawner creates Qualifier Agent (Tier 1, $0.05)' },
    { timestamp: 4000, nodeId: 'qualifier', action: 'read', edges: ['qualifier-memory'], description: 'Qualifier reads context from Memory' },
    { timestamp: 4500, nodeId: 'qualifier', action: 'complete', edges: ['qualifier-spawner'], description: 'Qualifier returns go/no-go decisions' },
    { timestamp: 5000, nodeId: 'spawner', action: 'spawn', edges: ['spawner-proposal'], description: 'Spawner creates Proposal Agent (Tier 2, $0.20)' },
    { timestamp: 5500, nodeId: 'proposal', action: 'read', edges: ['proposal-memory'], description: 'Proposal Agent reads templates' },
    { timestamp: 6000, nodeId: 'proposal', action: 'write', edges: ['proposal-client'], description: 'Proposal Agent drafts proposal for Client' },
    { timestamp: 6500, nodeId: 'proposal', action: 'complete', edges: ['proposal-spawner'], description: 'Proposal complete, awaiting your approval' },
    { timestamp: 7000, nodeId: 'spawner', action: 'return', edges: ['spawner-main-agent'], description: 'All sub-agents complete' },
    { timestamp: 7500, nodeId: 'main-agent', action: 'report', edges: ['main-agent-you'], description: 'JARVIS: "Found 5 qualified jobs, drafted 3 proposals"' },
  ],
  [
    { timestamp: 0, nodeId: 'you', action: 'start', edges: ['you-main-agent'], description: 'You: "Build the automation"' },
    { timestamp: 500, nodeId: 'main-agent', action: 'spawn', edges: ['main-agent-spawner'], description: 'Main Agent spawns Builder Agent' },
    { timestamp: 1000, nodeId: 'spawner', action: 'spawn', edges: ['spawner-builder'], description: 'Spawner creates Builder Agent (Tier 2, $0.50)' },
    { timestamp: 1500, nodeId: 'builder', action: 'write', edges: ['builder-memory'], description: 'Builder writes automation spec to Memory' },
    { timestamp: 2000, nodeId: 'builder', action: 'execute', edges: ['builder-exec'], description: 'Builder executes build commands' },
    { timestamp: 3000, nodeId: 'builder', action: 'complete', edges: ['builder-spawner'], description: 'Builder returns working automation' },
    { timestamp: 3500, nodeId: 'spawner', action: 'spawn', edges: ['spawner-qa'], description: 'Spawner creates QA Agent (Tier 2, $0.20)' },
    { timestamp: 4000, nodeId: 'qa', action: 'execute', edges: ['qa-exec'], description: 'QA runs test scenarios' },
    { timestamp: 5000, nodeId: 'qa', action: 'complete', edges: ['qa-delivery'], description: 'QA approves, marks delivery complete' },
    { timestamp: 5500, nodeId: 'qa', action: 'return', edges: ['qa-spawner'], description: 'QA report returned' },
    { timestamp: 6000, nodeId: 'spawner', action: 'return', edges: ['spawner-main-agent'], description: 'Build & QA complete' },
    { timestamp: 6500, nodeId: 'main-agent', action: 'report', edges: ['main-agent-you'], description: 'JARVIS: "Automation delivered, all tests pass"' },
  ],
];

export default function VisualOrgChartPage() {
  const [activeScenario, setActiveScenario] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [nodeStates, setNodeStates] = useState<Record<string, FlowNode['status']>>({});
  const [activeEdges, setActiveEdges] = useState<string[]>([]);
  const [costs, setCosts] = useState<Record<string, number>>({});
  const [log, setLog] = useState<string[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  const scenario = SCENARIOS[activeScenario];

  useEffect(() => {
    if (!isPlaying) return;

    if (currentStep >= scenario.length) {
      setIsPlaying(false);
      return;
    }

    const step = scenario[currentStep];
    const timer = setTimeout(() => {
      // Update node state
      setNodeStates(prev => ({ ...prev, [step.nodeId]: 'active' }));
      
      // Activate edges
      setActiveEdges(step.edges);
      
      // Add to log
      setLog(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()} - ${step.description}`]);
      
      // Track costs for sub-agents
      const node = NODES.find(n => n.id === step.nodeId);
      if (node?.type === 'subagent' && node.tier) {
        const tierCosts = { 1: 0.05, 2: 0.20 };
        setCosts(prev => ({ 
          ...prev, 
          [step.nodeId]: (prev[step.nodeId] || 0) + tierCosts[node.tier as 1 | 2]
        }));
      }

      // Mark previous nodes as complete
      if (currentStep > 0) {
        const prevStep = scenario[currentStep - 1];
        setNodeStates(prev => ({ ...prev, [prevStep.nodeId]: 'complete' }));
      }

      setCurrentStep(prev => prev + 1);
    }, step.timestamp - (scenario[currentStep - 1]?.timestamp || 0) + 500);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, scenario]);

  const startSimulation = () => {
    setNodeStates({});
    setActiveEdges([]);
    setCosts({});
    setLog([]);
    setCurrentStep(0);
    setIsPlaying(true);
  });

  const stopSimulation = () => {
    setIsPlaying(false);
    setNodeStates({});
    setActiveEdges([]);
  };

  const getNodeColor = (node: FlowNode) => {
    const state = nodeStates[node.id];
    if (state === 'active') return '#22c55e'; // Green
    if (state === 'complete') return '#3b82f6'; // Blue
    if (state === 'error') return '#ef4444'; // Red
    
    switch (node.type) {
      case 'main': return '#8b5cf6'; // Purple
      case 'subagent':
        if (node.tier === 1) return '#22c55e'; // Green (cheap)
        if (node.tier === 2) return '#f59e0b'; // Amber (mid)
        return '#ef4444'; // Red (expensive)
      case 'tool': return '#06b6d4'; // Cyan
      case 'external': return '#ec4899'; // Pink
      case 'database': return '#10b981'; // Emerald
      default: return '#6b7280';
    }
  };

  const getEdgeColor = (edge: FlowEdge) => {
    switch (edge.type) {
      case 'spawn': return '#8b5cf6';
      case 'command': return '#3b82f6';
      case 'data': return '#10b981';
      case 'return': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const isEdgeActive = (edge: FlowEdge) => {
    return activeEdges.some(e => 
      (e === `${edge.from}-${edge.to}`) ||
      (e === `${edge.to}-${edge.from}`)
    );
  };

  return (
    <div className="min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="page-title mb-0">Live Architecture Flow</h1>
          <p className="text-sm text-gray-500">
            Visual command routing: How sub-agents spawn and execute tools
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            className="bg-surface-2 border border-white/10 rounded-lg px-3 py-2 text-sm"
            value={activeScenario}
            onChange={(e) => setActiveScenario(Number(e.target.value))}
            disabled={isPlaying}
          >
            <option value={0}>Scenario: Find Jobs → Propose</option>
            <option value={1}>Scenario: Build → Deliver</option>
          </select>
          <button 
            onClick={isPlaying ? stopSimulation : startSimulation}
            className={`btn-primary ${isPlaying ? 'bg-red-500/20 text-red-400' : ''}`}
          >
            {isPlaying ? 'Stop' : '▶ Simulate'}
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-purple-500"></span>
          <span>Main Agent</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          <span>Tier 1 (Cheap)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-amber-500"></span>
          <span>Tier 2 (Mid)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-cyan-500"></span>
          <span>Tool</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-pink-500"></span>
          <span>External</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-8 h-0.5 bg-purple-500"></span>
          <span>Spawn</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-8 h-0.5 bg-blue-500"></span>
          <span>Command</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-8 h-0.5 border-t border-dashed border-gray-500"></span>
          <span>Return</span>
        </div>
      </div>

      {/* SVG Diagram */}
      <div className="card mb-4 overflow-auto">
        <svg 
          ref={svgRef}
          viewBox="0 0 800 620" 
          className="w-full h-auto"
          style={{ minHeight: '500px' }}
        >
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
            </pattern>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
            </marker>
            <marker id="arrowhead-active" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#22c55e" />
            </marker>
          </defs>
          <rect width="800" height="620" fill="url(#grid)" />

          {/* Layer labels */}
          <text x="10" y="90" className="text-xs fill-gray-500" fontSize="10">Control Layer</text>
          <text x="10" y="170" className="text-xs fill-gray-500" fontSize="10">Spawner Layer</text>
          <text x="10" y="290" className="text-xs fill-gray-500" fontSize="10">Sub-Agent Layer</text>
          <text x="10" y="410" className="text-xs fill-gray-500" fontSize="10">Tool Layer</text>
          <text x="10" y="530" className="text-xs fill-gray-500" fontSize="10">External Layer</text>

          {/* Edges */}
          {EDGES.map((edge, i) => {
            const fromNode = NODES.find(n => n.id === edge.from)!;
            const toNode = NODES.find(n => n.id === edge.to)!;
            const active = isEdgeActive(edge);
            
            return (
              <g key={i}>
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={active ? '#22c55e' : getEdgeColor(edge)}
                  strokeWidth={active ? 3 : 2}
                  strokeDasharray={edge.type === 'return' ? '5,5' : edge.animated ? '10,5' : undefined}
                  markerEnd={active ? "url(#arrowhead-active)" : "url(#arrowhead)"}
                  opacity={active ? 1 : 0.6}
                >
                  {edge.animated && (
                    <animate
                      attributeName="stroke-dashoffset"
                      from="0"
                      to="20"
                      dur="1s"
                      repeatCount="indefinite"
                    />
                  )}
                </line>
                {/* Edge label */}
                <text
                  x={(fromNode.x + toNode.x) / 2}
                  y={(fromNode.y + toNode.y) / 2 - 5}
                  className="text-xs"
                  fontSize="9"
                  fill={active ? '#22c55e' : '#9ca3af'}
                  textAnchor="middle"
                  style={{ background: 'rgba(0,0,0,0.5)' }}
                >
                  {edge.label}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {NODES.map(node => {
            const isActive = nodeStates[node.id] === 'active';
            const isComplete = nodeStates[node.id] === 'complete';
            
            return (
              <g key={node.id}>
                {/* Glow effect for active nodes */}
                {isActive && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="35"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="2"
                    opacity="0.5"
                  >
                    <animate
                      attributeName="r"
                      from="30"
                      to="40"
                      dur="1s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      from="0.5"
                      to="0"
                      dur="1s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                
                {/* Node circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="28"
                  fill={getNodeColor(node)}
                  stroke={isActive ? '#22c55e' : isComplete ? '#3b82f6' : 'rgba(255,255,255,0.2)'}
                  strokeWidth={isActive ? 4 : 2}
                  style={{ transition: 'all 0.3s ease' }}
                />
                
                {/* Cost badge for sub-agents */}
                {node.type === 'subagent' && costs[node.id] !== undefined && (
                  <g>
                    <circle
                      cx={node.x + 20}
                      cy={node.y - 20}
                      r="14"
                      fill="#1f2937"
                      stroke={costs[node.id] > 0.5 ? '#ef4444' : '#22c55e'}
                      strokeWidth="1"
                    />
                    <text
                      x={node.x + 20}
                      y={node.y - 16}
                      textAnchor="middle"
                      fontSize="8"
                      fill={costs[node.id] > 0.5 ? '#ef4444' : '#22c55e'}
                    >
                      ${costs[node.id].toFixed(2)}
                    </text>
                  </g>
                )}
                
                {/* Node label */}
                <text
                  x={node.x}
                  y={node.y + 45}
                  textAnchor="middle"
                  fontSize="10"
                  fill={isActive ? '#22c55e' : '#e5e7eb'}
                  fontWeight={isActive ? 'bold' : 'normal'}
                >
                  {node.label.split('\n').map((line, i) => (
                    <tspan key={i} x={node.x} dy={i === 0 ? 0 : 14}>
                      {line}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Control Panel */}
      <div className="grid grid-cols-2 gap-4">
        {/* Live Log */}
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-2">Execution Log</h3>
          <div className="h-40 overflow-y-auto space-y-1 text-xs font-mono">
            {log.length === 0 ? (
              <span className="text-gray-500">Click "Simulate" to see command flow...</span>
            ) : (
              log.map((entry, i) => (
                <div key={i} className="text-gray-300">
                  <span className="text-gray-500">[{i + 1}]</span> {entry}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cost Tracking */}
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-2">Real-Time Costs</h3>
          <div className="space-y-2">
            {Object.entries(costs).length === 0 ? (
              <span className="text-xs text-gray-500">No costs yet...</span>
            ) : (
              <>
                {Object.entries(costs).map(([id, cost]) => {
                  const node = NODES.find(n => n.id === id);
                  return (
                    <div key={id} className="flex justify-between items-center text-xs">
                      <span className="text-gray-300">{node?.label.split('\n')[0]}</span>
                      <span className={cost > 0.5 ? 'text-red-400' : 'text-green-400'}>
                        ${cost.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
                <div className="pt-2 border-t border-white/10 flex justify-between items-center text-sm font-semibold">
                  <span className="text-white">Total</span>
                  <span className="text-green-400">
                    ${Object.values(costs).reduce((a, b) => a + b, 0).toFixed(2)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Architecture Notes */}
      <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <span className="text-purple-400 font-medium">sessions_spawn()</span>
          <p className="text-gray-400 mt-1">Creates isolated sub-agent sessions with their own context and tools.</p>
        </div>
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <span className="text-blue-400 font-medium">sessions_send()</span>
          <p className="text-gray-400 mt-1">Routes commands and data between main agent and sub-agents.</p>
        </div>
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
          <span className="text-green-400 font-medium">subagents.list()</span>
          <p className="text-gray-400 mt-1">Monitor active sub-agents, kill runaway processes, enforce budgets.</p>
        </div>
      </div>
    </div>
  );
}
