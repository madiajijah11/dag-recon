# AGENTS.md — Master Build & Architecture Specification for DAG-Recon

## Project Overview
DAG-Recon is a client-side Web-based on-chain forensic & UTXO money tracking tool for the Kaspa BlockDAG network. It features a cyberpunk 2D canvas visualization engine, multi-hop flow analysis, address poisoning/dusting heuristics, known entity tagging, and interactive investigation tools.

- **Stack**: Vite 6 + React 19 + TypeScript + Tailwind CSS + Lucide React + HTML5 Canvas + Zustand
- **API**: Kaspa Public REST API (`https://api.kaspa.org`)
- **Key Capabilities**: Multi-hop UTXO tracing (1–5 hops), Address poisoning mimic detection, Dusting attack analyzer, Force physics with kinetic energy auto-sleep, Radar minimap, Right-click context actions, Custom address tagging, JSON/CSV exports.

---

## Architecture & Module Breakdown

```
src/
├── api/
│   ├── kaspaApi.ts       # REST client, request throttler & LRU in-memory cache
│   └── types.ts          # Kaspa transaction schemas, GraphNode, GraphEdge, Alerts
├── engine/
│   ├── canvasRenderer.ts # 2D Canvas engine, neon bloom, particle flow, radar minimap
│   ├── layout.ts         # Force-directed physics, collision spacing, auto-sleep & zoom-to-fit
│   ├── forensic.ts       # Multi-hop BFS traversal, prefix/suffix mimic detection & dust heuristics
│   ├── entities.ts       # Known Kaspa entity database (Exchanges, Mining Pools, Dev Fund)
│   └── graphStore.ts     # Central Zustand state store & action dispatcher
├── components/
│   ├── TopNav.tsx        # Search bar, hop depth selector, direction filters, Guide & Donation
│   ├── CanvasGraph.tsx   # Interactive canvas container, pan/zoom, empty state & canvas HUD
│   ├── Inspector.tsx     # Sidebar with address balances, UTXO flows, threat alerts & explorer links
│   ├── TerminalLog.tsx   # Collapsible ASCII telemetry stream
│   ├── FilterBar.tsx     # Threat toggles, dust threshold slider, collapsible color legend & export
│   ├── StatsHUD.tsx      # Top-right live telemetry badge (nodes, edges, volume, threats)
│   ├── ContextMenu.tsx   # Right-click context menu (Pin, Custom Tag, Expand Hops, Hide)
│   ├── LabelModal.tsx    # Modal for assigning custom notes/tags to addresses
│   └── InfoModals.tsx    # Comprehensive Guide modal & Kaspa donation QR modal
├── utils/
│   ├── formatters.ts     # Sompi to KAS conversion, address shortener, relative time
│   └── export.ts         # Graph export to JSON & transfer logs to CSV
├── App.tsx               # Main SPA layout shell
├── main.tsx              # Application mount
└── index.css             # Tailwind base & custom scrollbar styling
```

---

## Completed Phases

### Phase 1: Project Scaffolding & API Client
- [x] Initialized Vite + React 19 + TypeScript with Tailwind CSS & Lucide icons.
- [x] Implemented Kaspa REST client in `src/api/kaspaApi.ts` with LRU caching, retry backoff, and request queue throttling.
- [x] Defined TypeScript models for nodes, edges, Kaspa API responses, and forensic alerts in `src/api/types.ts`.

### Phase 2: Forensic Engine & State Store
- [x] Built UTXO BFS traversal engine in `src/engine/forensic.ts` supporting forward, backward, and bi-directional tracing.
- [x] Implemented Address Poisoning (Mimic) detector using prefix/suffix heuristic matching.
- [x] Implemented Dusting attack detection with customizable Sompi threshold.
- [x] Created pre-indexed entity catalog in `src/engine/entities.ts` for exchanges, mining pools, and dev funds.
- [x] Setup reactive Zustand store in `src/engine/graphStore.ts`.

### Phase 3: Cyberpunk 2D Canvas Engine & Optimizations
- [x] Built HTML5 Canvas engine with glowing bloom, directional arrows, and animated particle flows in `src/engine/canvasRenderer.ts`.
- [x] Implemented multi-transfer edge bundling to eliminate visual clutter.
- [x] Added hard collision separation (`minSeparation = 115px`) to prevent node label overlapping.
- [x] Implemented kinetic energy auto-sleep in `src/engine/layout.ts` to eliminate idle CPU/GPU drain.
- [x] Implemented dynamic `calculateZoomToFit` bounding box calculation.
- [x] Built real-time Radar Minimap overlay.

### Phase 4: UI Shell, Interactivity & Forensics Tooling
- [x] Built TopNav with address/TXID search, sample presets, hop depth selector, and status badges.
- [x] Built Inspector sidebar for address balances, observed flows, threat badges, and external explorer links.
- [x] Built right-click ContextMenu for pinning, custom tagging, single-direction hop expansion, and hiding nodes.
- [x] Built LabelModal for assigning custom investigation notes.
- [x] Built FilterBar with attack toggles, dust threshold slider, and collapsible Color Legend.
- [x] Built InfoModals with Quick Guide (full color legend) and Kaspa donation QR modal.
- [x] Added empty state overlay with quick sample buttons when no scan is active.
- [x] Added export tools for JSON graph states and CSV transaction tables.

### Phase 5: Verification & Production Deployment
- [x] Verified live mainnet API integration with real Kaspa addresses and transactions.
- [x] Fixed all TypeScript compilation warnings and bundle optimizations.
- [x] Successfully verified production build (`npm run build`).

---

## Future Roadmap (v2 Ideas)
- [ ] Private Kaspad node gRPC streaming integration.
- [ ] Time-lapse playback of UTXO movements across historical block blue scores.
- [ ] Graph image export (PNG / SVG canvas snapshot).
