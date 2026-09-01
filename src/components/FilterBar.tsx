import React, { useState } from 'react';
import { useGraphStore } from '../engine/graphStore';
import { arrangeRadialLayout } from '../engine/layout';
import { exportGraphToJson, exportTransfersToCsv } from '../utils/export';
import {
  Filter,
  ShieldAlert,
  Coins,
  Sparkles,
  Zap,
  RotateCcw,
  Download,
  FileSpreadsheet,
  Trash2,
  Sliders,
  Search,
  Palette,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const FilterBar: React.FC = () => {
  const {
    nodes,
    edges,
    alerts,
    filterPoisonOnly,
    setFilterPoisonOnly,
    filterDustOnly,
    setFilterDustOnly,
    dustThresholdKas,
    setDustThresholdKas,
    searchFilter,
    setSearchFilter,
    showParticles,
    setShowParticles,
    physicsRunning,
    setPhysicsRunning,
    setNodesAndEdges,
    clearGraph,
    addLog,
  } = useGraphStore();

  const [isLegendOpen, setIsLegendOpen] = useState(false);

  const handleRadialLayout = () => {
    arrangeRadialLayout(nodes);
    setNodesAndEdges([...nodes], [...edges], alerts);
    addLog('Arranged nodes in radial hop layout.', 'info');
  };

  return (
    <div className="absolute top-4 left-4 z-10 w-64 bg-[#0d111a]/90 backdrop-blur border border-[#1b2333] rounded-lg p-3 space-y-3.5 shadow-xl text-xs font-mono select-none max-h-[calc(100vh-5rem)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1b2333] pb-2">
        <div className="flex items-center space-x-1.5 text-cyan-400 font-bold">
          <Filter className="w-3.5 h-3.5" />
          <span>GRAPH CONTROLS</span>
        </div>
        <span className="text-[10px] text-gray-500">{nodes.length} N / {edges.length} E</span>
      </div>

      {/* In-Graph Search */}
      <div className="relative">
        <input
          type="text"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Filter nodes in view..."
          className="w-full h-7 bg-[#07090e] border border-[#1b2333] focus:border-cyan-500/60 rounded px-2 pl-7 text-[11px] text-slate-100 placeholder:text-gray-600 outline-none"
        />
        <Search className="w-3 h-3 text-gray-500 absolute left-2 top-2" />
      </div>

      {/* Forensic Filters */}
      <div className="space-y-1.5">
        <span className="text-[10px] text-gray-500 tracking-wider">ATTACK FILTERS</span>

        <button
          onClick={() => setFilterPoisonOnly(!filterPoisonOnly)}
          className={`w-full py-1.5 px-2.5 rounded flex items-center justify-between text-[11px] transition ${
            filterPoisonOnly
              ? 'bg-rose-950/80 border border-rose-500 text-rose-300'
              : 'bg-[#07090e] border border-[#1b2333] text-gray-400 hover:text-gray-200'
          }`}
        >
          <span className="flex items-center space-x-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Poisoning Only</span>
          </span>
          <span className="text-[10px] font-bold">
            {alerts.filter((a) => a.type === 'poison').length}
          </span>
        </button>

        <button
          onClick={() => setFilterDustOnly(!filterDustOnly)}
          className={`w-full py-1.5 px-2.5 rounded flex items-center justify-between text-[11px] transition ${
            filterDustOnly
              ? 'bg-amber-950/80 border border-amber-500 text-amber-300'
              : 'bg-[#07090e] border border-[#1b2333] text-gray-400 hover:text-gray-200'
          }`}
        >
          <span className="flex items-center space-x-1.5">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>Dust Only</span>
          </span>
          <span className="text-[10px] font-bold">
            {alerts.filter((a) => a.type === 'dust').length}
          </span>
        </button>
      </div>

      {/* Dust Threshold Slider */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[10px] text-gray-400">
          <span className="flex items-center space-x-1">
            <Sliders className="w-3 h-3 text-gray-500" />
            <span>Dust Limit:</span>
          </span>
          <span className="text-cyan-400 font-bold">{dustThresholdKas} KAS</span>
        </div>
        <input
          type="range"
          min="0.0001"
          max="0.01"
          step="0.0005"
          value={dustThresholdKas}
          onChange={(e) => setDustThresholdKas(parseFloat(e.target.value))}
          className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
      </div>

      {/* Collapsible Color Legend */}
      <div className="space-y-1 pt-1 border-t border-[#1b2333]">
        <button
          onClick={() => setIsLegendOpen(!isLegendOpen)}
          className="w-full flex items-center justify-between text-[10px] text-gray-400 hover:text-gray-200 py-1"
        >
          <span className="flex items-center space-x-1.5">
            <Palette className="w-3 h-3 text-cyan-400" />
            <span>COLOR LEGEND</span>
          </span>
          {isLegendOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {isLegendOpen && (
          <div className="space-y-1.5 p-2 bg-[#07090e] border border-gray-800 rounded text-[10px] text-gray-400">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00f3ff] flex-shrink-0" />
              <span>Cyan: Root Target / Dev Fund</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff0055] flex-shrink-0" />
              <span className="text-rose-300">Red: Poisoning Mimic Suspect</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffdd00] flex-shrink-0" />
              <span className="text-amber-300">Yellow: Dust Sender / Custom Tag</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] flex-shrink-0" />
              <span>Sky Blue: Exchange Hot Wallet</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7] flex-shrink-0" />
              <span>Purple: Mining Pool / Inflow</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00ff66] flex-shrink-0" />
              <span>Green: Outflow / Recipient</span>
            </div>
          </div>
        )}
      </div>

      {/* Engine Toggles */}
      <div className="space-y-2 pt-1 border-t border-[#1b2333]">
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => setShowParticles(!showParticles)}
            className={`py-1 px-2 rounded flex items-center justify-center space-x-1 text-[10px] transition ${
              showParticles
                ? 'bg-cyan-950/60 border border-cyan-500/40 text-cyan-300'
                : 'bg-[#07090e] border border-[#1b2333] text-gray-500'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Particles</span>
          </button>

          <button
            onClick={() => setPhysicsRunning(!physicsRunning)}
            className={`py-1 px-2 rounded flex items-center justify-center space-x-1 text-[10px] transition ${
              physicsRunning
                ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                : 'bg-[#07090e] border border-[#1b2333] text-gray-500'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>Physics</span>
          </button>
        </div>

        <button
          onClick={handleRadialLayout}
          className="w-full py-1.5 rounded bg-[#07090e] hover:bg-gray-800 border border-[#1b2333] text-gray-300 flex items-center justify-center space-x-1.5 transition text-[10px]"
        >
          <RotateCcw className="w-3 h-3 text-cyan-400" />
          <span>Radial Hop Layout</span>
        </button>
      </div>

      {/* Export & Actions */}
      <div className="space-y-1.5 pt-1 border-t border-[#1b2333]">
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => {
              exportGraphToJson(nodes, edges, alerts);
              addLog('Exported graph data to JSON.', 'info');
            }}
            disabled={nodes.length === 0}
            className="py-1 px-2 rounded bg-[#07090e] hover:bg-gray-800 border border-[#1b2333] text-gray-300 flex items-center justify-center space-x-1 text-[10px] disabled:opacity-40"
          >
            <Download className="w-3 h-3 text-cyan-400" />
            <span>JSON</span>
          </button>

          <button
            onClick={() => {
              exportTransfersToCsv(edges);
              addLog('Exported transfers to CSV.', 'info');
            }}
            disabled={edges.length === 0}
            className="py-1 px-2 rounded bg-[#07090e] hover:bg-gray-800 border border-[#1b2333] text-gray-300 flex items-center justify-center space-x-1 text-[10px] disabled:opacity-40"
          >
            <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
            <span>CSV</span>
          </button>
        </div>

        <button
          onClick={clearGraph}
          className="w-full py-1 rounded bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/30 text-rose-400/80 hover:text-rose-300 flex items-center justify-center space-x-1 text-[10px] transition"
        >
          <Trash2 className="w-3 h-3" />
          <span>Clear Canvas</span>
        </button>
      </div>
    </div>
  );
};
