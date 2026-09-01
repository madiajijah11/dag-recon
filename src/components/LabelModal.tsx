import React, { useState, useEffect } from 'react';
import { GraphNode } from '../api/types';
import { useGraphStore } from '../engine/graphStore';
import { Tag, X, Check } from 'lucide-react';

interface LabelModalProps {
  node: GraphNode | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LabelModal: React.FC<LabelModalProps> = ({ node, isOpen, onClose }) => {
  const { setNodeUserLabel, addLog } = useGraphStore();
  const [labelInput, setLabelInput] = useState('');

  useEffect(() => {
    if (node) {
      setLabelInput(node.userLabel || '');
    }
  }, [node]);

  if (!isOpen || !node) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setNodeUserLabel(node.id, labelInput);
    addLog(`Set custom tag for ${node.label} -> "${labelInput || 'Cleared'}"`, 'info');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none font-mono">
      <div className="bg-[#0d111a] border border-cyan-500/40 rounded-xl max-w-sm w-full p-4 space-y-3 shadow-[0_0_25px_rgba(0,243,255,0.2)] relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 text-gray-500 hover:text-gray-300 rounded"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2 text-cyan-400">
          <Tag className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-xs tracking-wider">CUSTOM NODE TAG</span>
        </div>

        <p className="text-[11px] text-gray-400">
          Assign an investigation tag or note to this address:
        </p>

        <form onSubmit={handleSave} className="space-y-3">
          <input
            type="text"
            value={labelInput}
            onChange={(e) => setLabelInput(e.target.value)}
            placeholder="e.g. Victim Wallet, Suspect A, Cashout..."
            autoFocus
            className="w-full h-8 bg-[#07090e] border border-gray-700 focus:border-cyan-500 rounded px-2.5 text-xs text-slate-100 placeholder:text-gray-600 outline-none"
          />

          <div className="flex items-center space-x-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setNodeUserLabel(node.id, '');
                onClose();
              }}
              className="flex-1 py-1.5 rounded bg-[#1b2333] hover:bg-gray-800 text-gray-300 text-xs transition"
            >
              Clear
            </button>
            <button
              type="submit"
              className="flex-1 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold flex items-center justify-center space-x-1.5 text-xs transition"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Tag</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
