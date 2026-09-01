# ⚡ DAG-Recon

> **High-Performance On-Chain Forensic & UTXO Money Flow Tracer for the Kaspa BlockDAG Network.**

DAG-Recon is a client-side on-chain forensic investigation tool built for the Kaspa BlockDAG network. It visualizes multi-hop UTXO fund movements, detects address poisoning mimic fraud and dusting attacks, tags known entities (Exchanges, Mining Pools, Dev Fund), and renders an interactive cyberpunk 2D canvas with animated particle flow lines and selective focus illumination.

---

## 🚀 Key Features

- **UTXO Multi-Hop Flow Tracing**:
  - Traverses incoming (inputs/sources) and outgoing (outputs/destinations) fund paths across configurable depth (1–5 hops).
  - Bi-directional, forward-only, or backward-only scanning.
  - Aggregates multi-transfer volume between addresses to eliminate visual clutter.

- **Selective Focus & Inflow/Outflow Illumination**:
  - Hover or select any wallet node to instantly dim unrelated background paths and brightly illuminate direct **📥 Inflows (+KAS)** in Neon Green and **📤 Outflows (-KAS)** in Cyan.
  - Interactive counterparty breakdown in the Inspector sidebar with 1-click camera jumps to counterparties.

- **Automated Threat & Fraud Detection**:
  - **Address Poisoning (Mimic) Detection**: Flags vanity addresses crafted by attackers that share the same 4+ prefix and 4+ suffix characters of legitimate counterparties.
  - **Dusting Attack Analyzer**: Highlights micro-UTXO transfers (< 0.001 KAS) used to pollute wallet histories.

- **Cyberpunk 2D Canvas Engine**:
  - Custom HTML5 2D canvas with glowing neon bloom, coordinate grid, and animated directional particle flow.
  - **Physics Simulation with Auto-Sleep**: Force-directed layout engine that automatically sleeps when kinetic energy stabilizes (0% idle CPU/GPU drain).
  - **Stable Zoom & Pan**: Moving or pinning bubbles preserves your exact camera zoom level without resetting.
  - **Auto Zoom-to-Fit**: Automatically frames and centers all nodes on screen.
  - **Radar Minimap**: Real-time overview of the graph topology and active viewport camera.

- **Interactive Investigation Tools & Ergonomics**:
  - **Right-Click Context Menu**: Pin/unpin node positions, add custom investigation notes/tags, expand single-direction hops, or hide noisy nodes.
  - **Collapsible Control Dock**: Minimize the left filter panel into a sleek icon dock for full-screen canvas immersion.
  - **Global Hotkeys**: Quick keyboard navigation (`F` to Fit View, `+`/`-` to Zoom, `Esc` to Deselect, `Del` to Hide node).
  - **Known Entity Tagging**: Pre-indexed database for top whales (#1 Rank), exchanges (MEXC #2 Rank, KuCoin, Gate.io), mining pools (ViaBTC, HumPool), and Kaspa Dev Fund.
  - **Export Suite**: Export entire graph structure and forensic alerts to JSON, or download raw transfer records as CSV.

---

## 🎨 Color Legend & Visual Indicator Guide

| Node / Element | Color | Description |
| :--- | :--- | :--- |
| **Root Target** | `Cyan (#00f3ff)` | Origin address or transaction searched / Kaspa Dev Fund |
| **Poisoning Mimic** | `Crimson Red (#ff0055)` | ⚠️ Attacker address matching legitimate counterparty prefix & suffix |
| **Dust / Custom Tag** | `Yellow (#ffdd00)` | Dust transfer sender (< 0.001 KAS) or User Custom Tagged address |
| **Exchange** | `Sky Blue (#38bdf8)` | Verified Centralized Exchange hot wallet (MEXC, KuCoin, Gate.io) |
| **Mining Pool / Inflow** | `Purple (#a855f7)` | Mining Pool payout (ViaBTC, HumPool) or Upstream source wallet |
| **Recipient / Outflow** | `Neon Green (#00ff66)` | Normal downstream recipient wallet |
| **Dashed Pulsing Ring** | `Animated Glow` | Active node selection, threat alert, or search filter match |

---

## ⌨️ Keyboard & Mouse Controls

| Action | Shortcut / Gesture | Description |
| :--- | :--- | :--- |
| **Fit View** | `F` or **Double-Click Canvas** | Centers and frames all active nodes |
| **Zoom In / Out** | `+` / `-` or **Scroll Wheel** | Smooth zoom centered on cursor |
| **Deselect** | `Escape` | Clears current node selection and closes menus |
| **Hide Node** | `Delete` / `Backspace` | Temporarily hides selected node from workspace |
| **Action Menu** | **Right-Click on Node** | Opens Pin, Tag, Trace Forward/Backward, and Hide menu |
| **Pan Workspace** | **Left-Click & Drag Canvas** | Moves the viewport camera |
| **Move Node** | **Left-Click & Drag Node** | Moves and pins the wallet node position |

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Visualization Engine**: Pure HTML5 2D Canvas API (Zero heavy graph dependencies)
- **Data Backend**: 100% Client-side queries to Kaspa Public REST API (`https://api.kaspa.org`) with in-memory LRU caching and rate limiter.

---

## 📦 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ (tested on Node v20/v22)
- `npm` or `pnpm`

### Installation

```bash
# Clone repository
git clone git@github.com:madiajijah11/dag-recon.git
cd dag-recon

# Install dependencies
npm install

# Start local dev server
npm run dev
```

Open your browser at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```
The bundled production assets will be output to `dist/`.

---

## 📁 Project Structure

```
dag-recon/
├── docs/
│   ├── PRD-dag-recon.md          # Product requirements document
│   └── TechDesign-dag-recon.md   # Architecture & algorithm spec
├── src/
│   ├── api/
│   │   ├── kaspaApi.ts           # Kaspa REST client, queue & LRU cache
│   │   └── types.ts              # Data types & graph schemas
│   ├── engine/
│   │   ├── canvasRenderer.ts     # 2D Canvas renderer, particles, selective focus & minimap
│   │   ├── layout.ts             # Force physics with auto-sleep & zoom-to-fit
│   │   ├── forensic.ts           # Multi-hop BFS & poisoning mimic detector
│   │   ├── entities.ts           # Known exchange & mining pool database
│   │   └── graphStore.ts         # Reactive Zustand state store
│   ├── components/
│   │   ├── TopNav.tsx            # Search bar, clear button, presets & hotkeys/guide buttons
│   │   ├── CanvasGraph.tsx       # Canvas container with pan/zoom/context menu & hover tooltips
│   │   ├── Inspector.tsx         # Node/edge inspection sidebar with counterparty flow list
│   │   ├── TerminalLog.tsx       # Collapsible cyberpunk telemetry event stream
│   │   ├── FilterBar.tsx         # Collapsible attack filters & color legend dock
│   │   ├── StatsHUD.tsx          # Top-right live volume & node counter
│   │   ├── ContextMenu.tsx       # Right-click context actions
│   │   ├── LabelModal.tsx        # Custom user tagging modal
│   │   └── InfoModals.tsx        # Guide, Knowledge Base & Kaspa donation QR modals
│   ├── App.tsx                   # Main application layout
│   ├── main.tsx                  # React DOM entry
│   └── index.css                 # Cyberpunk Tailwind styles
├── package.json
└── vite.config.ts
```

---

## ☕ Support / Donations

DAG-Recon is free and open-source software. If this tool helped your investigation or saved you from poisoning scams, tips are appreciated in **KAS**:

```
kaspa:qypgw7xw60yvxv5pcjncdv4f30wanju0g64hw3204wreayajt3025qgde344ycq
```

---

## 📄 License
MIT License. Free for personal, research, and commercial on-chain investigations.
