import React from 'react';
import { GraphNode } from '../api/types';
import { useGraphStore } from '../engine/graphStore';
import {
  Pin,
  PinOff,
  Tag,
  ArrowRight,
  ArrowLeft,
  EyeOff,
  Copy,
  ExternalLink,
  Radar,
} from 'lucide-react';

interface ContextMenuProps {
  node: GraphNode;
  x: number;
  y: number;
  onClose: () => void;
  onOpenLabelModal: (node: GraphNode) => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  node,
  x,
  y,
  onClose,
  onOpenLabelModal,
}) => {
  const { toggleNodePin, hideNode, startTrace, addLog } = useGraphStore();

  const handleCopy = () => {
    navigator.clipboard.writeText(node.id);
    addLog(`Copied to clipboard: ${node.id}`, 'info');
    onClose();
  };

  const handlePin = () => {
    toggleNodePin(node.id);
    addLog(`${node.pinned ? 'Unpinned' : 'Pinned'} node: ${node.label}`, 'info');
    onClose();
  };

  const handleHide = () => {
    hideNode(node.id);
    addLog(`Hidden node from view: ${node.label}`, 'info');
    onClose();
  };

  const handleExpandDir = (dir: 'forward' | 'backward') => {
    startTrace(node.id, dir);
    onClose();
  };

  return (
    <div
      style={{ top: y, left: x }}
      className="fixed z-50 w-52 bg-[#0d111a]/95 backdrop-blur border border-cyan-500/40 rounded-lg p-1.5 shadow-[0_0_20px_rgba(0,243,255,0.2)] text-xs font-mono select-none"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-2 py-1 border-b border-[#1b2333] text-[10px] text-cyan-400 font-bold truncate">
        {node.userLabel || node.label}
      </div>

      <div className="py-1 space-y-0.5">
        <button
          onClick={() => {
            onOpenLabelModal(node);
            onClose();
          }}
          className="w-full px-2 py-1.5 rounded hover:bg-cyan-950/60 hover:text-cyan-300 text-gray-300 flex items-center space-x-2 text-[11px] transition"
        >
          <Tag className="w-3.5 h-3.5 text-amber-400" />
          <span>{node.userLabel ? 'Edit Custom Tag' : 'Add Custom Tag'}</span>
        </button>

        <button
          onClick={handlePin}
          className="w-full px-2 py-1.5 rounded hover:bg-cyan-950/60 hover:text-cyan-300 text-gray-300 flex items-center space-x-2 text-[11px] transition"
        >
          {node.pinned ? <PinOff className="w-3.5 h-3.5 text-cyan-400" /> : <Pin className="w-3.5 h-3.5 text-gray-400" />}
          <span>{node.pinned ? 'Unpin Position' : 'Pin Position'}</span>
        </button>

        <button
          onClick={() => handleExpandDir('forward')}
          className="w-full px-2 py-1.5 rounded hover:bg-cyan-950/60 hover:text-cyan-300 text-gray-300 flex items-center space-x-2 text-[11px] transition"
        >
          <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
          <span>Trace Forward Only</span>
        </button>

        <button
          onClick={() => handleExpandDir('backward')}
          className="w-full px-2 py-1.5 rounded hover:bg-cyan-950/60 hover:text-cyan-300 text-gray-300 flex items-center space-x-2 text-[11px] transition"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
          <span>Trace Backward Only</span>
        </button>

        <button
          onClick={() => {
            startTrace(node.id, 'both');
            onClose();
          }}
          className="w-full px-2 py-1.5 rounded hover:bg-cyan-950/60 hover:text-cyan-300 text-gray-300 flex items-center space-x-2 text-[11px] transition"
        >
          <Radar className="w-3.5 h-3.5 text-cyan-400" />
          <span>Re-Scan Both Hops</span>
        </button>

        <button
          onClick={handleHide}
          className="w-full px-2 py-1.5 rounded hover:bg-rose-950/40 hover:text-rose-300 text-gray-400 flex items-center space-x-2 text-[11px] transition"
        >
          <EyeOff className="w-3.5 h-3.5 text-rose-400" />
          <span>Hide Node</span>
        </button>
      </div>

      <div className="pt-1 border-t border-[#1b2333] space-y-0.5">
        <button
          onClick={handleCopy}
          className="w-full px-2 py-1 rounded hover:bg-gray-800 text-gray-400 hover:text-gray-200 flex items-center space-x-2 text-[10px] transition"
        >
          <Copy className="w-3 h-3" />
          <span>Copy Address</span>
        </button>

        <a
          href={`https://explorer.kaspa.org/addresses/${node.id}`}
          target="_blank"
          rel="noreferrer"
          className="w-full px-2 py-1 rounded hover:bg-gray-800 text-cyan-400 flex items-center space-x-2 text-[10px] transition"
        >
          <ExternalLink className="w-3 h-3" />
          <span>Open in Explorer</span>
        </a>
      </div>
    </div>
  );
};
