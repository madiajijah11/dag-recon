# AGENTS.md — Master Build Plan for DAG-Recon

## Project Overview
DAG-Recon is a client-side Web-based on-chain forensic & UTXO money tracking tool for Kaspa, featuring a cyberpunk 2D canvas visualization engine, multi-hop flow analysis, and address poisoning/dusting heuristics.

- **Stack**: Vite + React 19 + TypeScript + Tailwind CSS + Lucide React + HTML5 Canvas
- **API**: Kaspa Public REST API (`https://api.kaspa.org`)
- **Key Features**: Multi-hop UTXO tracing, Address poisoning mimic detection, Dusting attack analyzer, Interactive glowing 2D Canvas with particle flows, Telemetry HUD.

---

## Build Phases

### Phase 1: Project Scaffolding & API Client
- **Task 1.1**: Initialize Vite React TypeScript project with Tailwind CSS & Lucide icons.
- **Task 1.2**: Implement Kaspa REST client in `src/api/kaspaApi.ts` with in-memory caching and request rate limiting.
- **Task 1.3**: Implement data models & types in `src/api/types.ts`.

### Phase 2: Forensic Analysis Engine & Graph Store
- **Task 2.1**: Implement UTXO traversal engine (Forward / Backward BFS) in `src/engine/forensic.ts`.
- **Task 2.2**: Implement address poisoning & dusting heuristic detectors.
- **Task 2.3**: Setup Zustand store in `src/engine/graphStore.ts` for graph nodes, edges, filters, and logs.

### Phase 3: Cyberpunk 2D Canvas Engine
- **Task 3.1**: Implement high-performance 2D Canvas renderer with neon glow, dark grid, and bloom effects in `src/engine/canvasRenderer.ts`.
- **Task 3.2**: Add animated particle flows along edges to visualize UTXO movement direction and volume.
- **Task 3.3**: Implement pan, zoom, node selection, and physics/force-directed layout simulation in `src/engine/layout.ts`.

### Phase 4: UI Shell & Forensic Tooling
- **Task 4.1**: Build TopNav HUD with address/TXID search, hop depth selector, and scan controls.
- **Task 4.2**: Build Inspector sidebar for address balance, transaction metrics, and risk flags.
- **Task 4.3**: Build TerminalLog component streaming ASCII telemetry and forensic events.
- **Task 4.4**: Build FilterBar with dust threshold slider, poisoning filter, and export (JSON/CSV).

### Phase 5: Verification & End-to-End Testing
- **Task 5.1**: Test with live Kaspa addresses / transactions (e.g. known exchange addresses, mining pools, active wallets).
- **Task 5.2**: Verify build bundle (`pnpm build` / `npm run build`) with zero TypeScript or lint errors.
