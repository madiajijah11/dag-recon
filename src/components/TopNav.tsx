import React, { useState } from 'react';
import { useGraphStore } from '../engine/graphStore';
import {
  Search,
  Play,
  Layers,
  ArrowLeftRight,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
  Sparkles,
  Heart,
  HelpCircle,
  Keyboard,
  X,
} from 'lucide-react';
import { DonationModal, GuideModal, ShortcutsModal } from './InfoModals';

const PRESET_ADDRESSES = [
  { label: 'Top Whale Wallet (#1 Rank)', address: 'kaspa:qpz2vgvlxhmyhmt22h538pjzmvvd52nuut80y5zulgpvyerlskvvwm7n4uk5a' },
  { label: 'MEXC Exchange Vault (#2 Rank)', address: 'kaspa:qpzpfwcsqsxhxwup26r55fd0ghqlhyugz8cp6y3wxuddc02vcxtjg75pspnwz' },
  { label: 'DAG-Recon Creator Wallet', address: 'kaspa:qypgw7xw60yvxv5pcjncdv4f30wanju0g64hw3204wreayajt3025qgde344ycq' },
];

export const TopNav: React.FC = () => {
  const {
    rootInput,
    setRootInput,
    maxHops,
    setMaxHops,
    direction,
    setDirection,
    isScanning,
    startTrace,
    alerts,
  } = useGraphStore();

  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value) {
      setRootInput(e.target.value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isScanning) {
      startTrace();
    }
  };

  const poisonAlertCount = alerts.filter((a) => a.type === 'poison').length;

  return (
    <>
      <header className="h-14 bg-[#07090e]/95 backdrop-blur border-b border-[#1b2333] px-4 flex items-center justify-between z-20 select-none">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-8 h-8 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 font-bold text-sm shadow-[0_0_12px_rgba(0,243,255,0.25)]">
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm tracking-wider text-cyan-400">DAG-RECON</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300 font-mono">
                KASPA FORENSICS
              </span>
            </div>
            <p className="text-[10px] text-gray-500 font-mono -mt-0.5">UTXO MULTI-HOP & ATTACK ANALYZER</p>
          </div>
        </div>

        {/* Search Bar & Controls */}
        <div className="flex items-center space-x-2 flex-1 max-w-4xl mx-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={rootInput}
              onChange={(e) => setRootInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter Kaspa address (kaspa:...) or Transaction ID..."
              className="w-full h-9 bg-[#0d111a] border border-[#1b2333] focus:border-cyan-500/80 focus:shadow-[0_0_10px_rgba(0,243,255,0.2)] rounded px-3 pl-9 pr-8 text-xs text-slate-100 font-mono placeholder:text-gray-600 outline-none transition"
            />
            <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
            {rootInput.length > 0 && (
              <button
                onClick={() => setRootInput('')}
                title="Clear address (Hapus input)"
                className="absolute right-2.5 top-2 p-0.5 rounded-full hover:bg-gray-800 text-gray-400 hover:text-cyan-300 transition flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Preset Selector */}
          <select
            onChange={handlePresetChange}
            defaultValue=""
            className="h-9 bg-[#0d111a] border border-[#1b2333] hover:border-gray-700 text-[11px] text-gray-400 font-mono rounded px-2 outline-none cursor-pointer"
          >
            <option value="" disabled>Presets...</option>
            {PRESET_ADDRESSES.map((p) => (
              <option key={p.address} value={p.address}>
                {p.label}
              </option>
            ))}
          </select>

          {/* Hops Selector */}
          <div className="flex items-center bg-[#0d111a] border border-[#1b2333] rounded px-2 h-9 space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[10px] text-gray-500 uppercase font-mono">Hops</span>
            <select
              value={maxHops}
              onChange={(e) => setMaxHops(Number(e.target.value))}
              className="bg-transparent text-xs text-cyan-400 font-mono font-bold outline-none cursor-pointer"
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
            </select>
          </div>

          {/* Direction Selector */}
          <div className="flex items-center bg-[#0d111a] border border-[#1b2333] rounded h-9 p-0.5">
            <button
              onClick={() => setDirection('backward')}
              title="Backward flow (Sources / Inputs)"
              className={`px-2 h-full rounded flex items-center text-[11px] font-mono transition ${
                direction === 'backward'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <ArrowLeft className="w-3 h-3" />
            </button>
            <button
              onClick={() => setDirection('both')}
              title="Bi-directional flow"
              className={`px-2 h-full rounded flex items-center text-[11px] font-mono transition ${
                direction === 'both'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <ArrowLeftRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => setDirection('forward')}
              title="Forward flow (Destinations / Outputs)"
              className={`px-2 h-full rounded flex items-center text-[11px] font-mono transition ${
                direction === 'forward'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Run Trace Button */}
          <button
            onClick={() => startTrace()}
            disabled={isScanning}
            className={`h-9 px-4 rounded flex items-center space-x-1.5 text-xs font-mono font-bold uppercase transition ${
              isScanning
                ? 'bg-cyan-950 border border-cyan-800 text-cyan-600 cursor-not-allowed animate-pulse'
                : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_15px_rgba(0,243,255,0.3)] active:scale-95'
            }`}
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'TRACING...' : 'SCAN'}</span>
          </button>
        </div>

        {/* Right Info & Actions */}
        <div className="flex items-center space-x-2">
          {/* Shortcuts Button */}
          <button
            onClick={() => setIsShortcutsOpen(true)}
            className="h-8 px-2.5 rounded bg-[#0d111a] hover:bg-[#1b2333] border border-gray-700 text-gray-300 flex items-center space-x-1.5 text-[11px] font-mono transition"
            title="Keyboard & Mouse Shortcuts"
          >
            <Keyboard className="w-3.5 h-3.5 text-cyan-400" />
            <span>HOTKEYS</span>
          </button>

          {/* Guide Button */}
          <button
            onClick={() => setIsGuideOpen(true)}
            className="h-8 px-2.5 rounded bg-[#0d111a] hover:bg-[#1b2333] border border-cyan-500/30 text-cyan-300 flex items-center space-x-1.5 text-[11px] font-mono transition"
            title="Knowledge Base & Guide"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>GUIDE</span>
          </button>

          {/* Donation Button */}
          <button
            onClick={() => setIsDonationOpen(true)}
            className="h-8 px-2.5 rounded bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/50 text-rose-300 flex items-center space-x-1.5 text-[11px] font-mono transition shadow-[0_0_10px_rgba(255,0,85,0.15)]"
            title="Support Development"
          >
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-500" />
            <span>DONATE</span>
          </button>

          {poisonAlertCount > 0 && (
            <div className="flex items-center space-x-1.5 px-2 py-1 rounded bg-rose-950/60 border border-rose-500/50 text-rose-400 text-[11px] font-mono">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span className="font-bold">{poisonAlertCount}</span>
            </div>
          )}
        </div>
      </header>

      {/* Modals */}
      <DonationModal isOpen={isDonationOpen} onClose={() => setIsDonationOpen(false)} />
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
    </>
  );
};