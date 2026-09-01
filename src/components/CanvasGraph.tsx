import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useGraphStore } from '../engine/graphStore';
import { drawCyberpunkGraph, ViewportTransform } from '../engine/canvasRenderer';
import { runForceSimulationStep, calculateZoomToFit } from '../engine/layout';
import { GraphNode } from '../api/types';
import { ContextMenu } from './ContextMenu';
import { LabelModal } from './LabelModal';
import { Plus, Minus, Maximize2, RotateCcw, Eye, Radar, Play } from 'lucide-react';

const PRESETS = [
  { label: 'Exchange Hot Wallet (MEXC)', address: 'kaspa:qqkqkzjvr7zwxxmjxjkmxxdwju9kjs6e9u82uh59z07vgaks6gg62v8707g73' },
  { label: 'Mining Pool Distributor (HumPool)', address: 'kaspa:qqje6ps46n6pvjstupfxgrg6v3pegd22q84jachnfrnz2vh5vznqw8redgln6' },
  { label: 'Active Whale / Trader', address: 'kaspa:qp9rv9jvx2kyf6wu4lupuruunq5zsuszyxs0dr3l89ej7wsgs48jqkewy6xtl' },
];

export const CanvasGraph: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const {
    nodes,
    edges,
    selectedNodeId,
    selectedEdgeId,
    selectNode,
    selectEdge,
    updateNodePosition,
    showParticles,
    filterDustOnly,
    filterPoisonOnly,
    searchFilter,
    physicsRunning,
    setPhysicsRunning,
    unhideAllNodes,
    isScanning,
    startTrace,
    setRootInput,
  } = useGraphStore();

  const [viewport, setViewport] = useState<ViewportTransform>({
    x: 0,
    y: 0,
    scale: 1,
  });

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Context Menu & Label Modal state
  const [contextMenu, setContextMenu] = useState<{ node: GraphNode; x: number; y: number } | null>(null);
  const [labelModalNode, setLabelModalNode] = useState<GraphNode | null>(null);

  // Interaction tracking refs
  const isDraggingCanvas = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const draggedNode = useRef<GraphNode | null>(null);
  const animFrameId = useRef<number | null>(null);
  const particleOffset = useRef(0);
  const isPhysicsSleeping = useRef(false);

  // Auto Zoom-to-Fit on initial node load
  const handleZoomToFit = useCallback(() => {
    if (!containerRef.current || nodes.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const fit = calculateZoomToFit(nodes, rect.width, rect.height, 140);
    if (fit) {
      setViewport(fit);
    }
  }, [nodes]);

  useEffect(() => {
    if (nodes.length > 0) {
      handleZoomToFit();
      isPhysicsSleeping.current = false;
    }
  }, [nodes.length, handleZoomToFit]);

  // Coordinate transforms: Screen to World
  const screenToWorld = useCallback(
    (screenX: number, screenY: number): { x: number; y: number } => {
      return {
        x: (screenX - viewport.x) / viewport.scale,
        y: (screenY - viewport.y) / viewport.scale,
      };
    },
    [viewport]
  );

  // Find node at world coordinate
  const getNodeAt = useCallback(
    (worldX: number, worldY: number): GraphNode | null => {
      for (let i = nodes.length - 1; i >= 0; i--) {
        const node = nodes[i];
        if (node.hidden) continue;
        if (filterDustOnly && !node.flags.isDustSender) continue;
        if (filterPoisonOnly && !node.flags.isPoisoningSuspect) continue;

        const dx = worldX - node.x;
        const dy = worldY - node.y;
        if (dx * dx + dy * dy <= (node.radius + 8) * (node.radius + 8)) {
          return node;
        }
      }
      return null;
    },
    [nodes, filterDustOnly, filterPoisonOnly]
  );

  // Main Render & Physics Loop with Auto-Sleep
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const loop = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Update particle offset
      particleOffset.current = (particleOffset.current + delta * 0.4) % 1;

      // Run force simulation with auto-sleep
      if (physicsRunning && !isPhysicsSleeping.current && nodes.length > 1) {
        const hasMotion = runForceSimulationStep(nodes, edges);
        if (!hasMotion) {
          isPhysicsSleeping.current = true;
        }
      }

      // Render
      drawCyberpunkGraph(ctx, canvas.width, canvas.height, nodes, edges, {
        viewport,
        selectedNodeId,
        selectedEdgeId,
        hoveredNodeId,
        showParticles,
        filterDustOnly,
        filterPoisonOnly,
        searchFilter,
        particleOffset: particleOffset.current,
        showMinimap: nodes.length > 0,
      });

      animFrameId.current = requestAnimationFrame(loop);
    };

    animFrameId.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [
    viewport,
    nodes,
    edges,
    selectedNodeId,
    selectedEdgeId,
    hoveredNodeId,
    showParticles,
    filterDustOnly,
    filterPoisonOnly,
    searchFilter,
    physicsRunning,
  ]);

  // Handle Resize
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);

      setViewport((prev) => {
        if (prev.x === 0 && prev.y === 0) {
          return { ...prev, x: rect.width / 2, y: rect.height / 2 };
        }
        return prev;
      });
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Close context menu on global click
  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 2) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    const world = screenToWorld(clientX, clientY);

    setContextMenu(null);

    const hitNode = getNodeAt(world.x, world.y);
    if (hitNode) {
      draggedNode.current = hitNode;
      isPhysicsSleeping.current = false;
      selectNode(hitNode.id);
    } else {
      isDraggingCanvas.current = true;
      dragStart.current = { x: clientX - viewport.x, y: clientY - viewport.y };
      selectNode(null);
      selectEdge(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    const world = screenToWorld(clientX, clientY);

    if (draggedNode.current) {
      isPhysicsSleeping.current = false;
      updateNodePosition(draggedNode.current.id, world.x, world.y, true);
    } else if (isDraggingCanvas.current) {
      setViewport((prev) => ({
        ...prev,
        x: clientX - dragStart.current.x,
        y: clientY - dragStart.current.y,
      }));
    } else {
      const hitNode = getNodeAt(world.x, world.y);
      setHoveredNodeId(hitNode ? hitNode.id : null);
    }
  };

  const handleMouseUp = () => {
    isDraggingCanvas.current = false;
    draggedNode.current = null;
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    const world = screenToWorld(clientX, clientY);

    const hitNode = getNodeAt(world.x, world.y);
    if (hitNode) {
      selectNode(hitNode.id);
      setContextMenu({
        node: hitNode,
        x: e.clientX,
        y: e.clientY,
      });
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.88;
    const newScale = Math.min(Math.max(viewport.scale * zoomFactor, 0.15), 4);

    const newX = clientX - (clientX - viewport.x) * (newScale / viewport.scale);
    const newY = clientY - (clientY - viewport.y) * (newScale / viewport.scale);

    setViewport({
      x: newX,
      y: newY,
      scale: newScale,
    });
  };

  const handleZoomIn = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const newScale = Math.min(viewport.scale * 1.25, 4);
    setViewport({
      x: cx - (cx - viewport.x) * (newScale / viewport.scale),
      y: cy - (cy - viewport.y) * (newScale / viewport.scale),
      scale: newScale,
    });
  };

  const handleZoomOut = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const newScale = Math.max(viewport.scale * 0.8, 0.15);
    setViewport({
      x: cx - (cx - viewport.x) * (newScale / viewport.scale),
      y: cy - (cy - viewport.y) * (newScale / viewport.scale),
      scale: newScale,
    });
  };

  const handleQuickPreset = (addr: string) => {
    setRootInput(addr);
    startTrace(addr);
  };

  const hiddenCount = nodes.filter((n) => n.hidden).length;

  return (
    <div ref={containerRef} className="relative flex-1 w-full h-full overflow-hidden bg-[#07090e]">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={handleContextMenu}
        onDoubleClick={handleZoomToFit}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Empty State Overlay */}
      {nodes.length === 0 && !isScanning && (
        <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none select-none">
          <div className="bg-[#0d111a]/85 backdrop-blur border border-cyan-500/30 rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-[0_0_40px_rgba(0,243,255,0.1)] pointer-events-auto">
            <div className="w-12 h-12 mx-auto rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(0,243,255,0.25)]">
              <Radar className="w-6 h-6 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h2 className="text-sm font-bold text-cyan-300 tracking-wider">DAG-RECON WORKSPACE READY</h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                Enter a Kaspa address or transaction hash in the search bar above to map money trails, or test with sample wallets below:
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-800">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Quick Presets</span>
              <div className="grid grid-cols-1 gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.address}
                    onClick={() => handleQuickPreset(p.address)}
                    className="w-full py-2 px-3 rounded bg-[#07090e] hover:bg-cyan-950/40 border border-[#1b2333] hover:border-cyan-500/40 text-gray-300 hover:text-cyan-300 flex items-center justify-between text-xs transition"
                  >
                    <span className="font-semibold">{p.label}</span>
                    <Play className="w-3 h-3 text-cyan-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Canvas Controls */}
      {nodes.length > 0 && (
        <div className="absolute bottom-4 left-4 z-10 flex items-center space-x-1.5 bg-[#0d111a]/90 backdrop-blur border border-[#1b2333] rounded-lg p-1 shadow-lg text-xs font-mono select-none">
          <button
            onClick={handleZoomIn}
            title="Zoom In (+)"
            className="w-7 h-7 rounded hover:bg-cyan-950/60 hover:text-cyan-300 text-gray-400 flex items-center justify-center transition"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out (-)"
            className="w-7 h-7 rounded hover:bg-cyan-950/60 hover:text-cyan-300 text-gray-400 flex items-center justify-center transition"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-gray-800" />
          <button
            onClick={handleZoomToFit}
            title="Fit All Nodes in View (Double-Click Canvas)"
            className="px-2 h-7 rounded hover:bg-cyan-950/60 hover:text-cyan-300 text-gray-300 flex items-center space-x-1 text-[11px] transition"
          >
            <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>FIT VIEW</span>
          </button>
          <button
            onClick={() => {
              isPhysicsSleeping.current = false;
              setPhysicsRunning(true);
            }}
            title="Wake Physics Simulation"
            className="px-2 h-7 rounded hover:bg-cyan-950/60 hover:text-cyan-300 text-gray-300 flex items-center space-x-1 text-[11px] transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
            <span>RE-SIM</span>
          </button>

          {hiddenCount > 0 && (
            <button
              onClick={unhideAllNodes}
              className="px-2 h-7 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 flex items-center space-x-1 text-[11px] transition"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Unhide ({hiddenCount})</span>
            </button>
          )}
        </div>
      )}

      {/* Context Menu on Right Click */}
      {contextMenu && (
        <ContextMenu
          node={contextMenu.node}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onOpenLabelModal={(n) => setLabelModalNode(n)}
        />
      )}

      {/* Custom Labeling Modal */}
      <LabelModal
        node={labelModalNode}
        isOpen={labelModalNode !== null}
        onClose={() => setLabelModalNode(null)}
      />
    </div>
  );
};
