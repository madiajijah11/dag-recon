import React, { useState } from 'react';
import { Heart, HelpCircle, Copy, Check, X, Eye, Compass, Palette } from 'lucide-react';

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none font-mono">
      <div className="bg-[#0d111a] border border-cyan-500/40 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-[0_0_30px_rgba(0,243,255,0.15)] relative max-h-[88vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-500 hover:text-gray-300 rounded"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2 text-cyan-400">
          <HelpCircle className="w-5 h-5" />
          <span className="font-bold text-sm tracking-wider">QUICK GUIDE // WHAT IS DAG-RECON?</span>
        </div>

        <div className="space-y-3.5 text-xs text-gray-300">
          {/* Section 1 */}
          <div className="p-3 bg-[#07090e] border border-gray-800 rounded-lg space-y-1.5">
            <div className="flex items-center space-x-1.5 text-cyan-300 font-bold">
              <Eye className="w-4 h-4" />
              <span>1. Overview</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              DAG-Recon is an on-chain visual investigation tool for the Kaspa BlockDAG network. It maps fund movements, multi-hop UTXO paths, and warns against active fraud patterns.
            </p>
          </div>

          {/* Section 2 */}
          <div className="p-3 bg-[#07090e] border border-gray-800 rounded-lg space-y-1.5">
            <div className="flex items-center space-x-1.5 text-cyan-300 font-bold">
              <Compass className="w-4 h-4" />
              <span>2. How to Use</span>
            </div>
            <ol className="list-decimal list-inside text-[11px] text-gray-400 space-y-1 leading-relaxed">
              <li>Paste any Kaspa address (<code className="text-cyan-300">kaspa:...</code>) or TXID into the top search bar.</li>
              <li>Select <strong>Hops</strong> depth (1 to 5 hops, default 2).</li>
              <li>Click <strong>SCAN</strong> to build the interactive graph.</li>
              <li>Click or drag any node to inspect balances, transfers, and risk alerts in the sidebar.</li>
              <li><strong>Right-click</strong> any node for quick actions (Pin, Custom Tag, Trace Forward/Backward, Hide).</li>
            </ol>
          </div>

          {/* Section 3: Complete Color Legend */}
          <div className="p-3 bg-[#07090e] border border-gray-800 rounded-lg space-y-2.5">
            <div className="flex items-center space-x-1.5 text-cyan-300 font-bold">
              <Palette className="w-4 h-4" />
              <span>3. Complete Node & Edge Color Legend</span>
            </div>

            <div className="grid grid-cols-1 gap-2 text-[11px]">
              {/* Cyan */}
              <div className="flex items-start space-x-2.5 bg-black/30 p-1.5 rounded">
                <span className="w-3 h-3 rounded-full bg-[#00f3ff] mt-0.5 flex-shrink-0 shadow-[0_0_8px_#00f3ff]" />
                <div>
                  <strong className="text-[#00f3ff]">Cyan:</strong> Root Origin Target (the address or transaction searched) & Kaspa Dev Fund.
                </div>
              </div>

              {/* Red */}
              <div className="flex items-start space-x-2.5 bg-rose-950/20 p-1.5 rounded border border-rose-900/30">
                <span className="w-3 h-3 rounded-full bg-[#ff0055] mt-0.5 flex-shrink-0 shadow-[0_0_8px_#ff0055] animate-pulse" />
                <div>
                  <strong className="text-rose-400">Crimson Red (Address Poisoning):</strong> ⚠️ <em>Threat Suspect!</em> Vanity address crafted to mimic frequent counterparty prefix/suffix.
                </div>
              </div>

              {/* Yellow */}
              <div className="flex items-start space-x-2.5 bg-amber-950/20 p-1.5 rounded border border-amber-900/30">
                <span className="w-3 h-3 rounded-full bg-[#ffdd00] mt-0.5 flex-shrink-0 shadow-[0_0_8px_#ffdd00]" />
                <div>
                  <strong className="text-amber-300">Yellow / Amber:</strong> Dust Sender (UTXO &lt; 0.001 KAS) or User Custom Tagged address.
                </div>
              </div>

              {/* Sky Blue */}
              <div className="flex items-start space-x-2.5 bg-sky-950/20 p-1.5 rounded">
                <span className="w-3 h-3 rounded-full bg-[#38bdf8] mt-0.5 flex-shrink-0 shadow-[0_0_8px_#38bdf8]" />
                <div>
                  <strong className="text-sky-400">Sky Blue (Exchange):</strong> Verified Centralized Exchange hot wallet (e.g. MEXC, KuCoin, Gate.io).
                </div>
              </div>

              {/* Purple */}
              <div className="flex items-start space-x-2.5 bg-purple-950/20 p-1.5 rounded">
                <span className="w-3 h-3 rounded-full bg-[#a855f7] mt-0.5 flex-shrink-0 shadow-[0_0_8px_#a855f7]" />
                <div>
                  <strong className="text-purple-400">Purple (Mining Pool / Source):</strong> Verified Mining Pool payout (ViaBTC, HumPool) or Upstream Source wallet.
                </div>
              </div>

              {/* Neon Green */}
              <div className="flex items-start space-x-2.5 bg-emerald-950/20 p-1.5 rounded">
                <span className="w-3 h-3 rounded-full bg-[#00ff66] mt-0.5 flex-shrink-0 shadow-[0_0_8px_#00ff66]" />
                <div>
                  <strong className="text-emerald-400">Neon Green (Recipient):</strong> Downstream Outflow / Normal recipient wallet.
                </div>
              </div>

              {/* Dashed Pulse Ring */}
              <div className="flex items-start space-x-2.5 bg-black/30 p-1.5 rounded">
                <span className="w-3 h-3 rounded-full border border-dashed border-cyan-400 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-gray-300">Dashed Pulsing Ring:</strong> Active Selection, Search Filter Match, or Threat Alert.
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 rounded bg-[#1b2333] hover:bg-gray-800 text-gray-200 text-xs font-bold transition"
        >
          CLOSE GUIDE
        </button>
      </div>
    </div>
  );
};
