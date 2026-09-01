import React, { useEffect, useRef, useState } from 'react';
import { useGraphStore } from '../engine/graphStore';
import { Terminal, ChevronDown, ChevronUp } from 'lucide-react';

export const TerminalLog: React.FC = () => {
  const { scanLogs } = useGraphStore();
  const [isOpen, setIsOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [scanLogs, isOpen]);

  const getLogColor = (level: string) => {
    switch (level) {
      case 'alert':
        return 'text-rose-400 font-bold';
      case 'warn':
        return 'text-amber-400';
      case 'error':
        return 'text-red-500 font-bold';
      default:
        return 'text-gray-300';
    }
  };

  return (
    <div className="border-t border-[#1b2333] bg-[#07090e]/95 backdrop-blur z-20 select-none font-mono">
      {/* HUD Header */}
      <div className="h-7 px-4 flex items-center justify-between bg-[#0d111a] border-b border-[#1b2333]/50 text-[11px]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 font-bold transition"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>TELEMETRY & FORENSIC EVENT STREAM</span>
          <span className="text-[10px] text-gray-500 font-normal">({scanLogs.length} events)</span>
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>

        <div className="flex items-center space-x-3 text-[10px] text-gray-500">
          <span>STATUS: ONLINE</span>
          <span>LATENCY: 42ms</span>
        </div>
      </div>

      {/* Terminal Content */}
      {isOpen && (
        <div
          ref={scrollRef}
          className="h-36 overflow-y-auto p-3 space-y-1 text-[11px] bg-[#05070a]/90 font-mono scrollbar-thin scrollbar-thumb-gray-800"
        >
          {scanLogs.map((log) => (
            <div key={log.id} className="flex items-start space-x-2 leading-tight">
              <span className="text-gray-600 select-none">[{log.time}]</span>
              <span className="text-cyan-500 select-none">&gt;&gt;</span>
              <span className={getLogColor(log.level)}>{log.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
