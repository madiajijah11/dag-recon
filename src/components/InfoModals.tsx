import React, { useState } from 'react';
import {
  Heart,
  HelpCircle,
  Copy,
  Check,
  X,
  Keyboard,
  ArrowRight,
  MousePointer,
} from 'lucide-react';

export const DONATION_KASPA_ADDRESS = 'kaspa:qypgw7xw60yvxv5pcjncdv4f30wanju0g64hw3204wreayajt3025qgde344ycq';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonationModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(DONATION_KASPA_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(DONATION_KASPA_ADDRESS)}&bgcolor=0d111a&color=00f3ff`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none font-mono">
      <div className="bg-[#0d111a] border border-cyan-500/40 rounded-xl max-w-md w-full p-5 space-y-4 shadow-[0_0_30px_rgba(0,243,255,0.15)] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-500 hover:text-gray-300 rounded"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2 text-cyan-400">
          <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />
          <span className="font-bold text-sm tracking-wider">SUPPORT DAG-RECON</span>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed">
          DAG-Recon is 100% free & open-source. If this tool helped trace funds or detect attacks, consider supporting development with Kaspa.
        </p>

        <div className="flex justify-center p-3 bg-[#07090e] border border-gray-800 rounded-lg">
          <img
            src={qrUrl}
            alt="Kaspa Donation QR"
            className="w-36 h-36 rounded border border-cyan-500/30"
          />
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] text-gray-500 uppercase">Creator Kaspa Address</span>
          <div className="p-2.5 bg-[#07090e] border border-gray-800 rounded text-[11px] text-cyan-300 font-mono break-all select-all">
            {DONATION_KASPA_ADDRESS}
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="w-full py-2.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold flex items-center justify-center space-x-2 transition shadow-[0_0_15px_rgba(0,243,255,0.3)] active:scale-95 text-xs"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'ADDRESS COPIED!' : 'COPY KASPA ADDRESS'}</span>
        </button>
      </div>
    </div>
  );
};

export const GuideModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'reading' | 'colors' | 'shortcuts'>('reading');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none font-mono">
      <div className="bg-[#0d111a] border border-cyan-500/40 rounded-xl max-w-xl w-full p-5 space-y-4 shadow-[0_0_30px_rgba(0,243,255,0.15)] relative max-h-[88vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-500 hover:text-gray-300 rounded"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2 text-cyan-400">
          <HelpCircle className="w-5 h-5" />
          <span className="font-bold text-sm tracking-wider">DAG-RECON KNOWLEDGE BASE</span>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 border-b border-[#1b2333] pb-2">
          <button
            onClick={() => setActiveTab('reading')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition ${
              activeTab === 'reading'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            How to Read Data
          </button>
          <button
            onClick={() => setActiveTab('colors')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition ${
              activeTab === 'colors'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Color Codes
          </button>
          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition ${
              activeTab === 'shortcuts'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Hotkeys & Controls
          </button>
        </div>

        {/* TAB 1: HOW TO READ DATA */}
        {activeTab === 'reading' && (
          <div className="space-y-3.5 text-xs text-gray-300">
            {/* Visual Flow diagram */}
            <div className="p-3 bg-[#07090e] border border-cyan-500/30 rounded-lg space-y-2">
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">
                Visual Flow Interpretation
              </span>
              <div className="p-3 bg-black/50 border border-gray-800 rounded flex items-center justify-between text-[11px]">
                <div className="text-center">
                  <div className="w-8 h-8 rounded-full bg-purple-900/60 border border-purple-400 mx-auto flex items-center justify-center font-bold text-purple-300">
                    A
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 block">Sender Wallet</span>
                </div>

                <div className="flex-1 px-3 text-center space-y-1">
                  <div className="flex items-center justify-center space-x-1 text-cyan-400">
                    <span className="h-[2px] bg-cyan-500/50 flex-1" />
                    <span className="px-2 py-0.5 rounded bg-[#0d111a] border border-cyan-500/40 text-[10px] font-bold">
                      2 txs (9,658.2 KAS)
                    </span>
                    <ArrowRight className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  </div>
                  <span className="text-[9px] text-gray-500 block">
                    Flow direction (Arrow + Moving particles)
                  </span>
                </div>

                <div className="text-center">
                  <div className="w-8 h-8 rounded-full bg-emerald-900/60 border border-emerald-400 mx-auto flex items-center justify-center font-bold text-emerald-300">
                    B
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 block">Recipient Wallet</span>
                </div>
              </div>
            </div>

            {/* Explanation items */}
            <div className="space-y-2 text-[11px] leading-relaxed">
              <div className="p-2.5 bg-[#07090e] border border-gray-800 rounded">
                <strong className="text-cyan-300">1. Arrow Direction & Moving Dots:</strong>
                <p className="text-gray-400 mt-0.5">
                  Money always travels in the direction of the arrow. The animated glowing particles show the active stream of funds from sender to recipient.
                </p>
              </div>

              <div className="p-2.5 bg-[#07090e] border border-gray-800 rounded">
                <strong className="text-cyan-300">2. Badges on Transfer Lines:</strong>
                <p className="text-gray-400 mt-0.5">
                  E.g., <code className="text-cyan-400">3 txs (583,550 KAS)</code> indicates that across 3 transactions, a total of 583,550 KAS moved along that specific path.
                </p>
              </div>

              <div className="p-2.5 bg-[#07090e] border border-gray-800 rounded">
                <strong className="text-cyan-300">3. Node Circles & Labels:</strong>
                <p className="text-gray-400 mt-0.5">
                  Circles represent unique wallet addresses. The top label shows verified identity tags (e.g. <code className="text-sky-300">[MEXC]</code>, <code className="text-purple-300">[ViaBTC]</code>) or shortened address hash. The subtext displays current wallet balance.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COLOR CODES */}
        {activeTab === 'colors' && (
          <div className="space-y-2.5 text-xs text-gray-300">
            <div className="grid grid-cols-1 gap-2 text-[11px]">
              <div className="flex items-start space-x-2.5 bg-black/30 p-2 rounded">
                <span className="w-3 h-3 rounded-full bg-[#00f3ff] mt-0.5 flex-shrink-0 shadow-[0_0_8px_#00f3ff]" />
                <div>
                  <strong className="text-[#00f3ff]">Cyan:</strong> Root Origin Target (the address or transaction searched) & Kaspa Dev Fund.
                </div>
              </div>

              <div className="flex items-start space-x-2.5 bg-rose-950/20 p-2 rounded border border-rose-900/30">
                <span className="w-3 h-3 rounded-full bg-[#ff0055] mt-0.5 flex-shrink-0 shadow-[0_0_8px_#ff0055] animate-pulse" />
                <div>
                  <strong className="text-rose-400">Crimson Red (Address Poisoning):</strong> ⚠️ <em>Threat Suspect!</em> Vanity address crafted to mimic frequent counterparty prefix/suffix.
                </div>
              </div>

              <div className="flex items-start space-x-2.5 bg-amber-950/20 p-2 rounded border border-amber-900/30">
                <span className="w-3 h-3 rounded-full bg-[#ffdd00] mt-0.5 flex-shrink-0 shadow-[0_0_8px_#ffdd00]" />
                <div>
                  <strong className="text-amber-300">Yellow / Amber:</strong> Dust Sender (UTXO &lt; 0.001 KAS) or User Custom Tagged address.
                </div>
              </div>

              <div className="flex items-start space-x-2.5 bg-sky-950/20 p-2 rounded">
                <span className="w-3 h-3 rounded-full bg-[#38bdf8] mt-0.5 flex-shrink-0 shadow-[0_0_8px_#38bdf8]" />
                <div>
                  <strong className="text-sky-400">Sky Blue (Exchange):</strong> Verified Centralized Exchange hot wallet (e.g. MEXC, KuCoin, Gate.io).
                </div>
              </div>

              <div className="flex items-start space-x-2.5 bg-purple-950/20 p-2 rounded">
                <span className="w-3 h-3 rounded-full bg-[#a855f7] mt-0.5 flex-shrink-0 shadow-[0_0_8px_#a855f7]" />
                <div>
                  <strong className="text-purple-400">Purple (Mining Pool / Source):</strong> Verified Mining Pool payout (ViaBTC, HumPool) or Upstream Source wallet.
                </div>
              </div>

              <div className="flex items-start space-x-2.5 bg-emerald-950/20 p-2 rounded">
                <span className="w-3 h-3 rounded-full bg-[#00ff66] mt-0.5 flex-shrink-0 shadow-[0_0_8px_#00ff66]" />
                <div>
                  <strong className="text-emerald-400">Neon Green (Recipient):</strong> Downstream Outflow / Normal recipient wallet.
                </div>
              </div>

              <div className="flex items-start space-x-2.5 bg-black/30 p-2 rounded">
                <span className="w-3 h-3 rounded-full border border-dashed border-cyan-400 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-gray-300">Dashed Pulsing Ring:</strong> Active Selection, Search Filter Match, or Threat Alert.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: HOTKEYS & CONTROLS */}
        {activeTab === 'shortcuts' && (
          <div className="space-y-3 text-xs text-gray-300">
            <div className="p-3 bg-[#07090e] border border-gray-800 rounded-lg space-y-2">
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">
                Keyboard Shortcuts
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center justify-between bg-black/40 p-2 rounded border border-gray-800">
                  <span className="text-gray-400">Fit All Nodes:</span>
                  <kbd className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700 text-cyan-400 font-bold font-mono">
                    F
                  </kbd>
                </div>

                <div className="flex items-center justify-between bg-black/40 p-2 rounded border border-gray-800">
                  <span className="text-gray-400">Zoom In / Out:</span>
                  <kbd className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700 text-cyan-400 font-bold font-mono">
                    + / -
                  </kbd>
                </div>

                <div className="flex items-center justify-between bg-black/40 p-2 rounded border border-gray-800">
                  <span className="text-gray-400">Deselect / Close:</span>
                  <kbd className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700 text-cyan-400 font-bold font-mono">
                    Esc
                  </kbd>
                </div>

                <div className="flex items-center justify-between bg-black/40 p-2 rounded border border-gray-800">
                  <span className="text-gray-400">Hide Node:</span>
                  <kbd className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700 text-rose-400 font-bold font-mono">
                    Del
                  </kbd>
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#07090e] border border-gray-800 rounded-lg space-y-2">
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">
                Mouse & Touch Gestures
              </span>
              <div className="space-y-1.5 text-[11px] text-gray-400">
                <div className="flex items-center space-x-2">
                  <MousePointer className="w-3.5 h-3.5 text-cyan-400" />
                  <span><strong>Left-Click Node:</strong> Inspect wallet balances, flows & explorer links.</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MousePointer className="w-3.5 h-3.5 text-cyan-400" />
                  <span><strong>Right-Click Node:</strong> Open quick actions (Pin, Custom Tag, Expand, Hide).</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MousePointer className="w-3.5 h-3.5 text-cyan-400" />
                  <span><strong>Left-Click & Drag Node:</strong> Move & pin node to custom position.</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MousePointer className="w-3.5 h-3.5 text-cyan-400" />
                  <span><strong>Double-Click Background:</strong> Reset camera & auto-fit graph.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2 rounded bg-[#1b2333] hover:bg-gray-800 text-gray-200 text-xs font-bold transition"
        >
          CLOSE KNOWLEDGE BASE
        </button>
      </div>
    </div>
  );
};

export const ShortcutsModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none font-mono">
      <div className="bg-[#0d111a] border border-cyan-500/40 rounded-xl max-w-md w-full p-5 space-y-4 shadow-[0_0_30px_rgba(0,243,255,0.2)] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-500 hover:text-gray-300 rounded"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2 text-cyan-400">
          <Keyboard className="w-5 h-5" />
          <span className="font-bold text-sm tracking-wider">KEYBOARD & MOUSE CONTROLS</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center justify-between bg-black/40 p-2 rounded border border-gray-800">
              <span className="text-gray-400">Fit All Nodes:</span>
              <kbd className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700 text-cyan-400 font-bold font-mono">
                F
              </kbd>
            </div>

            <div className="flex items-center justify-between bg-black/40 p-2 rounded border border-gray-800">
              <span className="text-gray-400">Zoom In / Out:</span>
              <kbd className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700 text-cyan-400 font-bold font-mono">
                + / -
              </kbd>
            </div>

            <div className="flex items-center justify-between bg-black/40 p-2 rounded border border-gray-800">
              <span className="text-gray-400">Deselect / Close:</span>
              <kbd className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700 text-cyan-400 font-bold font-mono">
                Esc
              </kbd>
            </div>

            <div className="flex items-center justify-between bg-black/40 p-2 rounded border border-gray-800">
              <span className="text-gray-400">Hide Selected:</span>
              <kbd className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700 text-rose-400 font-bold font-mono">
                Del
              </kbd>
            </div>
          </div>

          <div className="p-3 bg-[#07090e] border border-gray-800 rounded-lg space-y-1.5 text-[11px] text-gray-400">
            <p>• <strong>Right-Click Node:</strong> Context menu (Pin, Custom Tag, Expand, Hide)</p>
            <p>• <strong>Double-Click Canvas:</strong> Auto Zoom-to-Fit</p>
            <p>• <strong>Drag Node:</strong> Move & pin position in workspace</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition"
        >
          GOT IT
        </button>
      </div>
    </div>
  );
};
