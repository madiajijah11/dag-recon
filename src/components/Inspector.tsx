import React from 'react';
import { useGraphStore } from '../engine/graphStore';
import { shortenAddress, formatTimestamp, formatKas } from '../utils/formatters';
import {
  ExternalLink,
  Copy,
  ShieldAlert,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  Radar,
  Check,
  Tag,
  Pin,
  PinOff,
  Building,
  Pickaxe,
} from 'lucide-react';
import { LabelModal } from './LabelModal';
import { GraphNode } from '../api/types';

export const Inspector: React.FC = () => {
  const {
    nodes,
    edges,
    alerts,
    selectedNodeId,
    selectedEdgeId,
    selectNode,
    selectEdge,
    startTrace,
    toggleNodePin,
    addLog,
  } = useGraphStore();

  const [copied, setCopied] = React.useState(false);
  const [labelModalNode, setLabelModalNode] = React.useState<GraphNode | null>(null);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const selectedEdge = edges.find((e) => e.id === selectedEdgeId);

  if (!selectedNode && !selectedEdge) {
    return null;
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    addLog(`Copied to clipboard: ${text.slice(0, 16)}...`, 'info');
  };

  const incomingEdges = selectedNode ? edges.filter((e) => e.target === selectedNode.id) : [];
  const outgoingEdges = selectedNode ? edges.filter((e) => e.source === selectedNode.id) : [];
  const nodeAlerts = selectedNode
    ? alerts.filter(
        (a) => a.suspectAddress === selectedNode.id || a.targetAddress === selectedNode.id
      )
    : [];

  const totalInSompis = incomingEdges.reduce((sum, e) => sum + e.amount, 0);
  const totalOutSompis = outgoingEdges.reduce((sum, e) => sum + e.amount, 0);

  return (
    <>
      <aside className="w-80 bg-[#0d111a]/95 backdrop-blur border-l border-[#1b2333] flex flex-col h-[calc(100vh-3.5rem)] z-10 select-none overflow-y-auto text-xs font-mono">
        {/* Header */}
        <div className="p-3 border-b border-[#1b2333] flex items-center justify-between bg-[#07090e]/50">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-bold text-gray-200 tracking-wider">
              {selectedNode ? 'NODE INSPECTOR' : 'TRANSFER INSPECTOR'}
            </span>
          </div>
          <button
            onClick={() => {
              selectNode(null);
              selectEdge(null);
            }}
            className="p-1 text-gray-500 hover:text-gray-300 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4 flex-1">
          {/* NODE VIEW */}
          {selectedNode && (
            <>
              {/* Entity Tag Banner */}
              {selectedNode.entityTag && (
                <div className="p-2.5 rounded bg-sky-950/60 border border-sky-500/50 text-sky-300 space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold text-sky-400">
                    {selectedNode.flags.isMiningPool ? (
                      <Pickaxe className="w-3.5 h-3.5" />
                    ) : (
                      <Building className="w-3.5 h-3.5" />
                    )}
                    <span>KNOWN ENTITY</span>
                  </div>
                  <p className="text-[11px] text-sky-200/90 font-bold">{selectedNode.entityTag}</p>
                </div>
              )}

              {/* Custom User Tag Banner */}
              {selectedNode.userLabel && (
                <div className="p-2.5 rounded bg-amber-950/40 border border-amber-500/50 text-amber-300 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Tag className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-bold text-amber-300">{selectedNode.userLabel}</span>
                  </div>
                  <button
                    onClick={() => setLabelModalNode(selectedNode)}
                    className="text-[10px] text-amber-400 hover:underline"
                  >
                    Edit
                  </button>
                </div>
              )}

              {/* Risk Banner */}
              {selectedNode.flags.isPoisoningSuspect && (
                <div className="p-3 rounded bg-rose-950/60 border border-rose-500/60 text-rose-300 space-y-1 shadow-[0_0_12px_rgba(255,0,85,0.2)]">
                  <div className="flex items-center space-x-2 font-bold text-rose-400">
                    <ShieldAlert className="w-4 h-4" />
                    <span>ADDRESS POISONING SUSPECT</span>
                  </div>
                  <p className="text-[11px] text-rose-200/80 leading-relaxed">
                    Mimic vanity address detected targeting frequent counterparties with micro-UTXO transfers.
                  </p>
                </div>
              )}

              {selectedNode.flags.isDustSender && !selectedNode.flags.isPoisoningSuspect && (
                <div className="p-2.5 rounded bg-amber-950/50 border border-amber-500/50 text-amber-300 space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold text-amber-400">
                    <Coins className="w-3.5 h-3.5" />
                    <span>DUST SENDER FLAGGED</span>
                  </div>
                  <p className="text-[10px] text-amber-200/80">
                    Broadcasted UTXO transfers below dust threshold (&lt;0.001 KAS).
                  </p>
                </div>
              )}

              {/* Address / ID Box */}
              <div className="p-3 rounded bg-[#07090e] border border-[#1b2333] space-y-2">
                <div className="flex items-center justify-between text-[10px] text-gray-500">
                  <span>{selectedNode.type.toUpperCase()} IDENTIFIER</span>
                  <span className="text-cyan-400">HOP {selectedNode.hop}</span>
                </div>
                <div className="p-2 rounded bg-black/40 border border-gray-800 text-[11px] text-cyan-300 break-all font-mono">
                  {selectedNode.id}
                </div>
                <div className="flex items-center space-x-2 pt-1">
                  <button
                    onClick={() => handleCopy(selectedNode.id)}
                    className="flex-1 py-1.5 px-2 rounded bg-[#1b2333] hover:bg-gray-800 text-gray-300 flex items-center justify-center space-x-1.5 transition"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'COPIED' : 'COPY ID'}</span>
                  </button>

                  <button
                    onClick={() => setLabelModalNode(selectedNode)}
                    title="Set Custom Note/Tag"
                    className="py-1.5 px-2.5 rounded bg-[#1b2333] hover:bg-gray-800 text-amber-400 flex items-center justify-center transition"
                  >
                    <Tag className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => toggleNodePin(selectedNode.id)}
                    title={selectedNode.pinned ? 'Unpin' : 'Pin Position'}
                    className={`py-1.5 px-2.5 rounded bg-[#1b2333] hover:bg-gray-800 flex items-center justify-center transition ${
                      selectedNode.pinned ? 'text-cyan-400' : 'text-gray-400'
                    }`}
                  >
                    {selectedNode.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                  </button>

                  <a
                    href={`https://explorer.kaspa.org/addresses/${selectedNode.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-1.5 px-2.5 rounded bg-[#1b2333] hover:bg-gray-800 text-cyan-400 flex items-center justify-center transition"
                    title="Open in Kaspa Explorer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Balance & Financial Metrics */}
              <div className="p-3 rounded bg-[#07090e] border border-[#1b2333] space-y-2.5">
                <span className="text-[10px] text-gray-500 tracking-wider">BALANCE & FLOWS</span>

                <div className="flex justify-between items-baseline border-b border-gray-800/80 pb-2">
                  <span className="text-gray-400">Current Balance:</span>
                  <span className="text-cyan-400 font-bold">
                    {selectedNode.balance !== undefined
                      ? formatKas(selectedNode.balance)
                      : 'Querying...'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-400 flex items-center space-x-1">
                    <ArrowDownLeft className="w-3 h-3 text-emerald-400" />
                    <span>Observed In:</span>
                  </span>
                  <span className="text-emerald-400 font-semibold">{formatKas(totalInSompis)}</span>
                </div>

                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-400 flex items-center space-x-1">
                    <ArrowUpRight className="w-3 h-3 text-rose-400" />
                    <span>Observed Out:</span>
                  </span>
                  <span className="text-rose-400 font-semibold">{formatKas(totalOutSompis)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <button
                onClick={() => startTrace(selectedNode.id)}
                className="w-full py-2.5 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-bold flex items-center justify-center space-x-2 transition shadow-[0_0_10px_rgba(0,243,255,0.15)]"
              >
                <Radar className="w-4 h-4 text-cyan-400" />
                <span>RE-CENTER & EXPAND TRACE</span>
              </button>

              {/* Forensic Alerts */}
              {nodeAlerts.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] text-gray-500 tracking-wider">DETECTED ANOMALIES</span>
                  {nodeAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-2.5 rounded bg-rose-950/30 border border-rose-900/50 space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px] text-rose-400 font-bold">
                        <span>{alert.title}</span>
                        <span className="text-[9px] text-gray-500">{formatTimestamp(alert.timestamp)}</span>
                      </div>
                      <p className="text-[10px] text-gray-400">{alert.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* EDGE VIEW */}
          {selectedEdge && (
            <div className="space-y-4">
              <div className="p-3 rounded bg-[#07090e] border border-[#1b2333] space-y-2.5">
                <span className="text-[10px] text-gray-500 tracking-wider">TRANSFER DETAILS</span>

                <div className="flex justify-between items-baseline border-b border-gray-800 pb-2">
                  <span className="text-gray-400">Transferred:</span>
                  <span className="text-cyan-400 font-bold text-sm">
                    {formatKas(selectedEdge.amount)}
                  </span>
                </div>

                <div className="space-y-1 text-[11px]">
                  <div className="text-gray-500">Source:</div>
                  <div className="text-gray-300 font-mono break-all bg-black/40 p-1.5 rounded">
                    {shortenAddress(selectedEdge.source, 12, 10)}
                  </div>
                </div>

                <div className="space-y-1 text-[11px]">
                  <div className="text-gray-500">Destination:</div>
                  <div className="text-gray-300 font-mono break-all bg-black/40 p-1.5 rounded">
                    {shortenAddress(selectedEdge.target, 12, 10)}
                  </div>
                </div>

                <div className="space-y-1 text-[11px]">
                  <div className="text-gray-500">TXID:</div>
                  <div className="text-gray-400 font-mono break-all bg-black/40 p-1.5 rounded">
                    {selectedEdge.txid}
                  </div>
                </div>

                <div className="flex justify-between text-[11px] text-gray-400 pt-1">
                  <span>Timestamp:</span>
                  <span>{formatTimestamp(selectedEdge.timestamp)}</span>
                </div>

                <a
                  href={`https://explorer.kaspa.org/txs/${selectedEdge.txid}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 w-full py-2 rounded bg-[#1b2333] hover:bg-gray-800 text-cyan-400 flex items-center justify-center space-x-1.5 transition"
                >
                  <span>OPEN TRANSACTION IN EXPLORER</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>
      </aside>

      <LabelModal
        node={labelModalNode}
        isOpen={labelModalNode !== null}
        onClose={() => setLabelModalNode(null)}
      />
    </>
  );
};
