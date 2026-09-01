import React from 'react';
import { useGraphStore } from '../engine/graphStore';
import { formatKas } from '../utils/formatters';
import { Activity, ShieldAlert, Layers } from 'lucide-react';

export const StatsHUD: React.FC = () => {
  const { nodes, edges, alerts } = useGraphStore();

  if (nodes.length === 0) return null;

  const totalVolumeSompis = edges.reduce((sum, e) => sum + e.amount, 0);
  const poisonCount = alerts.filter((a) => a.type === 'poison').length;
  const dustCount = alerts.filter((a) => a.type === 'dust').length;

  return (
    <div className="absolute top-4 right-4 z-10 flex items-center space-x-2 select-none font-mono text-xs">
      <div className="bg-[#0d111a]/90 backdrop-blur border border-[#1b2333] rounded-lg px-3 py-1.5 flex items-center space-x-4 shadow-lg">
        <div className="flex items-center space-x-1.5">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-gray-400">Nodes:</span>
          <span className="text-cyan-300 font-bold">{nodes.length}</span>
        </div>

        <div className="flex items-center space-x-1.5">
          <span className="text-gray-400">Edges:</span>
          <span className="text-cyan-300 font-bold">{edges.length}</span>
        </div>

        <div className="flex items-center space-x-1.5">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-gray-400">Volume:</span>
          <span className="text-emerald-400 font-bold">
            {formatKas(totalVolumeSompis, 2)}
          </span>
        </div>

        {(poisonCount > 0 || dustCount > 0) && (
          <div className="flex items-center space-x-1.5 pl-2 border-l border-gray-800">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span className="text-rose-400 font-bold">
              {poisonCount + dustCount} Threat{poisonCount + dustCount > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
