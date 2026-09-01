# AGENTS.md — Master Build & Architecture Specification for DAG-Recon

## Project Overview
DAG-Recon is a client-side Web-based on-chain forensic & UTXO money tracking tool for the Kaspa BlockDAG network. It features a cyberpunk 2D canvas visualization engine, multi-hop flow analysis, address poisoning/dusting heuristics, known entity tagging, selective flow illumination, and interactive investigation tools.

- **Stack**: Vite 6 + React 19 + TypeScript + Tailwind CSS + Lucide React + HTML5 Canvas + Zustand
- **API**: Kaspa Public REST API (`https://api.kaspa.org`)
- **Key Capabilities**: Multi-hop UTXO tracing (1–5 hops), Address poisoning mimic detection, Dusting attack analyzer, Force physics with kinetic energy auto-sleep, Selective flow dimming & focus mode, Radar minimap, Right-click context actions, Custom address tagging, Hotkeys navigation, JSON/CSV exports.

---

## Architecture & Module Breakdown

```
src/
├── api/
│   ├── kaspaApi.ts       # REST client, request throttler & LRU in-memory cache
│   └── types.ts          # Kaspa transaction schemas, GraphNode, GraphEdge, Alerts
├── engine/
│   ├── canvasRenderer.ts # 2D Canvas engine, neon bloom, selective focus illumination, particles, radar minimap
│   ├── layout.ts         # Force-directed physics, collision spacing, auto-sleep & zoom-to-fit
│   ├── forensic.ts       # Multi-hop BFS traversal, prefix/suffix mimic detection & dust heuristics
│   ├── entities.ts       # Known Kaspa entity database (Whales, Exchanges, Mining Pools, Dev Fund)
│   └── graphStore.ts     # Central Zustand state store & action dispatcher
├── components/
│   ├── TopNav.tsx        # Search bar with 1-click clear, hop depth selector, HOTKEYS & Guide modals
│   ├── CanvasGraph.tsx   # Interactive canvas container, pan/zoom, hover tooltips, empty state & canvas HUD
│   ├── Inspector.tsx     # Sidebar with address balances, counterparty inflow/outflow lists, threat alerts
│   ├── TerminalLog.tsx   # Collapsible ASCII telemetry stream
│   ├── FilterBar.tsx     # Collapsible filter dock, dust threshold slider, color legend & export
│   ├── StatsHUD.tsx      # Top-right live telemetry badge (nodes, edges, volume, threats)
│   ├── ContextMenu.tsx   # Right-click context menu (Pin, Custom Tag, Expand Hops, Hide)
│   ├── LabelModal.tsx    # Modal for assigning custom notes/tags to addresses
│   └── InfoModals.tsx    # Comprehensive Knowledge Base, Visual Reading Guide, Hotkeys modal & Donation modal
├── utils/
│   ├── formatters.ts     # Sompi to KAS conversion, address shortener, relative time
│   └── export.ts         # Graph export to JSON & transfer logs to CSV
├── App.tsx               # Main SPA layout shell
├── main.tsx              # Application mount
└── index.css             # Tailwind base & custom scrollbar styling
```

---

## Completed Phases & Changelog

### Phase 1: Project Scaffolding & API Client
- [x] Initialized Vite + React 19 + TypeScript with Tailwind CSS & Lucide icons.
- [x] Implemented Kaspa REST client in `src/api/kaspaApi.ts` with LRU caching, retry backoff, and request queue throttling.
- [x] Defined TypeScript models for nodes, edges, Kaspa API responses, and forensic alerts in `src/api/types.ts`.

### Phase 2: Forensic Engine & State Store
- [x] Built UTXO BFS traversal engine in `src/engine/forensic.ts` supporting forward, backward, and bi-directional tracing.
- [x] Implemented Address Poisoning (Mimic) detector using prefix/suffix heuristic matching.
- [x] Implemented Dusting attack detection with customizable Sompi threshold.
- [x] Created pre-indexed entity catalog in `src/engine/entities.ts` for top whales, exchanges, mining pools, and dev funds.
- [x] Setup reactive Zustand store in `src/engine/graphStore.ts`.

### Phase 3: Cyberpunk 2D Canvas Engine & Optimizations
- [x] Built HTML5 Canvas engine with glowing bloom, directional arrows, and animated particle flows in `src/engine/canvasRenderer.ts`.
- [x] Implemented selective focus & dimming: hovering/selecting a wallet dims unrelated paths and illuminates green Inflows and cyan Outflows.
- [x] Clean directional edge badges placed on top layer with collision clearance.
- [x] Implemented multi-transfer edge bundling to eliminate visual clutter.
- [x] Added hard collision separation (`minSeparation = 115px`) to prevent node label overlapping.
- [x] Implemented kinetic energy auto-sleep in `src/engine/layout.ts` to eliminate idle CPU/GPU drain.
- [x] Fixed drag-zoom behavior: moving/dragging nodes preserves exact zoom scale without auto-reset.
- [x] Built real-time Radar Minimap overlay.

### Phase 4: UI Shell, Interactivity & Forensics Tooling
- [x] Built TopNav with wide search bar, 1-click clear button, sample presets, hop depth selector, and HOTKEYS button.
- [x] Built Inspector sidebar with counterparty inflow/outflow breakdown list and visual ratio progress bar.
- [x] Built right-click ContextMenu for pinning, custom tagging, single-direction hop expansion, and hiding nodes.
- [x] Built LabelModal for assigning custom investigation notes.
- [x] Built FilterBar with collapsible dock mode, attack toggles, dust slider, and Color Legend.
- [x] Built InfoModals with Visual Reading Guide, Color Codes, Hotkeys modal, and Kaspa donation QR modal.
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
