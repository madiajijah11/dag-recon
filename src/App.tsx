import { TopNav } from './components/TopNav';
import { CanvasGraph } from './components/CanvasGraph';
import { Inspector } from './components/Inspector';
import { TerminalLog } from './components/TerminalLog';
import { FilterBar } from './components/FilterBar';
import { StatsHUD } from './components/StatsHUD';
import { Analytics } from '@vercel/analytics/react';

export function App() {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#07090e] text-slate-100 font-mono select-none">
      {/* Top Header Navigation */}
      <TopNav />

      {/* Main Forensic Workspace */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* Left Floating Filter/Control Bar */}
        <FilterBar />

        {/* Top-Right Telemetry HUD */}
        <StatsHUD />

        {/* Central 2D Cyberpunk Canvas Graph */}
        <div className="flex-1 relative h-full flex flex-col">
          <CanvasGraph />
          {/* Bottom Cyberpunk Event Terminal */}
          <TerminalLog />
        </div>

        {/* Right Inspector Sidebar */}
        <Inspector />
      </div>

      {/* Vercel Web Analytics */}
      <Analytics />
    </div>
  );
}

export default App;
