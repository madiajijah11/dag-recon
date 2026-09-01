import { create } from 'zustand';
import {
  ForensicAlert,
  GraphEdge,
  GraphNode,
  TraceOptions,
} from '../api/types';
import { runForensicTrace } from './forensic';
import { arrangeRadialLayout } from './layout';
import { SOMPI_PER_KAS } from '../utils/formatters';

export interface LogEntry {
  id: string;
  time: string;
  text: string;
  level: 'info' | 'warn' | 'error' | 'alert';
}

interface GraphState {
  // Graph Data
  nodes: GraphNode[];
  edges: GraphEdge[];
  alerts: ForensicAlert[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;

  // Scan state & options
  rootInput: string;
  maxHops: number;
  direction: 'forward' | 'backward' | 'both';
  txLimit: number;
  dustThresholdKas: number;
  isScanning: boolean;
  scanLogs: LogEntry[];

  // Filter state
  filterPoisonOnly: boolean;
  filterDustOnly: boolean;
  searchFilter: string;

  // Visual settings
  showParticles: boolean;
  particleSpeed: number;
  physicsRunning: boolean;

  // Actions
  setRootInput: (input: string) => void;
  setMaxHops: (hops: number) => void;
  setDirection: (dir: 'forward' | 'backward' | 'both') => void;
  setDustThresholdKas: (kas: number) => void;
  setFilterPoisonOnly: (val: boolean) => void;
  setFilterDustOnly: (val: boolean) => void;
  setSearchFilter: (val: string) => void;
  setShowParticles: (val: boolean) => void;
  setPhysicsRunning: (val: boolean) => void;

  selectNode: (id: string | null) => void;
  selectEdge: (id: string | null) => void;
  updateNodePosition: (id: string, x: number, y: number, pinned?: boolean) => void;
  toggleNodePin: (id: string) => void;
  setNodeUserLabel: (id: string, userLabel: string) => void;
  hideNode: (id: string) => void;
  unhideAllNodes: () => void;
  setNodesAndEdges: (nodes: GraphNode[], edges: GraphEdge[], alerts?: ForensicAlert[]) => void;
  clearGraph: () => void;
  addLog: (text: string, level?: 'info' | 'warn' | 'error' | 'alert') => void;

  // Forensic runner
  startTrace: (target?: string, overrideDir?: 'forward' | 'backward' | 'both') => Promise<void>;
}

export const useGraphStore = create<GraphState>((set, get) => ({
  nodes: [],
  edges: [],
  alerts: [],
  selectedNodeId: null,
  selectedEdgeId: null,

  rootInput: '',
  maxHops: 2,
  direction: 'both',
  txLimit: 15,
  dustThresholdKas: 0.001,
  isScanning: false,
  scanLogs: [
    {
      id: 'init-1',
      time: new Date().toLocaleTimeString(),
      text: 'DAG-Recon Forensic Engine initialized. Ready for UTXO trace.',
      level: 'info',
    },
  ],

  filterPoisonOnly: false,
  filterDustOnly: false,
  searchFilter: '',

  showParticles: true,
  particleSpeed: 1,
  physicsRunning: true,

  setRootInput: (input) => set({ rootInput: input }),
  setMaxHops: (hops) => set({ maxHops: hops }),
  setDirection: (dir) => set({ direction: dir }),
  setDustThresholdKas: (kas) => set({ dustThresholdKas: kas }),
  setFilterPoisonOnly: (val) => set({ filterPoisonOnly: val }),
  setFilterDustOnly: (val) => set({ filterDustOnly: val }),
  setSearchFilter: (val) => set({ searchFilter: val }),
  setShowParticles: (val) => set({ showParticles: val }),
  setPhysicsRunning: (val) => set({ physicsRunning: val }),

  selectNode: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),
  selectEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),

  updateNodePosition: (id, x, y, pinned) => {
    set((state) => ({
      physicsRunning: true, // wake simulation on interaction
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, x, y, pinned: pinned !== undefined ? pinned : n.pinned } : n
      ),
    }));
  },

  toggleNodePin: (id) => {
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)),
    }));
  },

  setNodeUserLabel: (id, userLabel) => {
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === id ? { ...n, userLabel: userLabel.trim() || undefined } : n)),
    }));
  },

  hideNode: (id) => {
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === id ? { ...n, hidden: true } : n)),
    }));
  },

  unhideAllNodes: () => {
    set((state) => ({
      nodes: state.nodes.map((n) => ({ ...n, hidden: false })),
    }));
  },

  setNodesAndEdges: (nodes, edges, alerts = []) => {
    set({ nodes, edges, alerts, physicsRunning: true });
  },

  clearGraph: () => {
    set({
      nodes: [],
      edges: [],
      alerts: [],
      selectedNodeId: null,
      selectedEdgeId: null,
      scanLogs: [
        {
          id: `log-${Date.now()}`,
          time: new Date().toLocaleTimeString(),
          text: 'Graph workspace cleared.',
          level: 'info',
        },
      ],
    });
  },

  addLog: (text, level = 'info') => {
    const entry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      time: new Date().toLocaleTimeString(),
      text,
      level,
    };
    set((state) => ({
      scanLogs: [...state.scanLogs.slice(-100), entry],
    }));
  },

  startTrace: async (target, overrideDir) => {
    const state = get();
    const query = (target || state.rootInput).trim();
    if (!query) {
      state.addLog('Error: Please enter a Kaspa address or transaction ID.', 'error');
      return;
    }

    set({ isScanning: true, selectedNodeId: null, selectedEdgeId: null, physicsRunning: true });
    state.addLog(`Starting trace on: ${query}`, 'info');

    const options: TraceOptions = {
      rootAddressOrTx: query,
      maxHops: state.maxHops,
      direction: overrideDir || state.direction,
      txLimitPerAddress: state.txLimit,
      dustThresholdSompis: Math.round(state.dustThresholdKas * SOMPI_PER_KAS),
      mimicThresholdLength: 4,
    };

    try {
      const { nodes, edges, alerts } = await runForensicTrace(options, (msg, alert) => {
        get().addLog(msg, alert ? 'alert' : 'info');
      });

      // Pre-arrange nodes in a spacious radial layout by hop
      arrangeRadialLayout(nodes);

      set({
        nodes,
        edges,
        alerts,
        isScanning: false,
        physicsRunning: true,
        selectedNodeId: nodes[0]?.id || null,
      });

      get().addLog(`Trace finished: ${nodes.length} nodes, ${edges.length} edges, ${alerts.length} alerts.`, 'info');
    } catch (err) {
      set({ isScanning: false });
      get().addLog(`Trace error: ${(err as Error).message}`, 'error');
    }
  },
}));
