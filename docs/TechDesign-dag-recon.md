# Technical Design Document (TechDesign): DAG-Recon

## 1. System Architecture

```
+-----------------------------------------------------------------------------------+
|                                Browser Client (SPA)                               |
|                                                                                   |
|  +---------------------+  +----------------------------------------------------+  |
|  |  Control & Search   |  |        Cyberpunk 2D Canvas Graph Engine            |  |
|  |  - Address / TXID   |  |  - Force / Layered DAG Layout                      |  |
|  |  - Hop Depth Config |  |  - Neon Glow Nodes & Animated Particle Edges       |  |
|  |  - Dust Filter      |  |  - Pan / Zoom / Multi-Select / Dragging            |  |
|  +----------+----------+  +-------------------------+--------------------------+  |
|             |                                       |                             |
|             v                                       v                             |
|  +-----------------------------------------------------------------------------+  |
|  |                   Forensic State & Analysis Engine                          |  |
|  |  - UTXO Multi-hop Graph Traversal (Forward/Backward BFS)                    |  |
|  |  - Poisoning / Mimic Detector (Levenshtein + Prefix/Suffix heuristic)       |  |
|  |  - Dusting Attack Analyzer (< 0.001 KAS / 0-value spam detection)          |  |
|  |  - Export / Import Manager (JSON / CSV export)                              |  |
|  +-------------------------------------+---------------------------------------+  |
|                                        |                                          |
|                                        v                                          |
|  +-----------------------------------------------------------------------------+  |
|  |                     Kaspa API Client & Cache Layer                          |  |
|  |  - LRU In-memory Cache & Request Queue / Throttler                          |  |
|  |  - Target: Kaspa Public REST API (`https://api.kaspa.org`)                   |  |
|  +-------------------------------------+---------------------------------------+  |
+----------------------------------------|------------------------------------------+
                                         | HTTPS REST
                                         v
                         +-------------------------------+
                         |  Kaspa Public REST API        |
                         |  https://api.kaspa.org        |
                         |  - /addresses/{addr}/full-txs |
                         |  - /transactions/{txid}       |
                         |  - /addresses/{addr}/utxos    |
                         +-------------------------------+
```

---

## 2. Tech Stack & Dependencies

- **Build / Tooling**: Vite + TypeScript
- **UI Framework**: React + Tailwind CSS + Lucide React (Icons)
- **Canvas Rendering**: Pure HTML5 2D Canvas API (Zero heavy graph dependency overhead, 60fps neon styling, animated flow particles)
- **State Management**: Lightweight Zustand store
- **Networking**: Native `fetch` with custom rate-limiter & request deduplication

---

## 3. Data Models

### 3.1 Node & Edge Schema
```typescript
export type NodeType = "address" | "transaction";

export interface GraphNode {
  id: string; // address or txid
  type: NodeType;
  label: string;
  balance?: number; // Sompis or KAS
  hop: number; // Discovery depth (0 = root search)
  flags: {
    isDustSender?: boolean;
    isPoisoningSuspect?: boolean;
    isHighVolume?: boolean;
    isMiningReward?: boolean;
  };
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pinned?: boolean;
}

export interface GraphEdge {
  id: string; // `${source}->${target}:${txid}`
  source: string; // Node id
  target: string; // Node id
  amount: number; // KAS
  sompis: number;
  txid: string;
  timestamp: number;
  isDust: boolean;
  isPoison: boolean;
}
```

### 3.2 Kaspa API Endpoints Used
1. `GET /addresses/{address}/full-transactions?limit={limit}&offset={offset}`
   - Retrieve transaction history for an address including inputs and outputs.
2. `GET /transactions/{txid}?inputs=true&outputs=true`
   - Retrieve transaction graph linkage.
3. `GET /addresses/{address}/balance`
   - Current balance and UTXO count.

---

## 4. Forensic Detection Algorithms

### 4.1 Address Poisoning (Mimic Counterparty Detection)
- **Problem**: Attackers generate vanity addresses sharing leading 4-6 characters and trailing 4-6 characters of legitimate transaction partners, then send 0-value or micro-dust transactions to pollute transaction history.
- **Algorithm**:
  1. For a target address, collect top frequent outgoing counterparty addresses.
  2. For any incoming micro/dust transaction, compare sender address against frequent counterparty addresses.
  3. Compute Prefix Match Length (PML) and Suffix Match Length (SML).
  4. If `PML >= 4` and `SML >= 4` but full address differs $\rightarrow$ Flag as **High Confidence Poisoning Attempt**.

### 4.2 Dusting Attack Analyzer
- Flag any UTXO transfer where `amount < 100,000 Sompi (0.001 KAS)` accompanied by non-standard OP_RETURN or uniform multi-output spam.

---

## 5. UI Layout & Component Hierarchy

- **Header / Topbar**: Cyberpunk status HUD, target address/TXID input, hop depth slider (1–5), trace direction (Forward / Backward / Both), Run Scan button.
- **Main Canvas**: Fullscreen 2D interactive canvas with grid background, glowing bloom effects, animated particle flows along edges, minimap.
- **Left Sidebar / Filter Panel**: Dust threshold, poison alert filters, node aggregation toggles, search within graph.
- **Right Sidebar / Inspector Panel**: Selected node/edge telemetry, address balance, transaction hash, input/output breakdown, risk score badge.
- **Bottom Terminal Log**: Retro monospaced ASCII event log streaming API fetch events, node discovery, risk alerts.

---

## 6. Directory Structure

```
dag-recon/
├── docs/
│   ├── PRD-dag-recon.md
│   └── TechDesign-dag-recon.md
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── api/
    │   ├── kaspaApi.ts       # Kaspa REST client, caching & rate limiter
    │   └── types.ts          # API response types
    ├── engine/
    │   ├── canvasRenderer.ts # 2D Canvas cyberpunk renderer & particle effects
    │   ├── layout.ts         # Force-directed & DAG hop placement
    │   ├── forensic.ts       # Poisoning & dusting heuristic detectors
    │   └── graphStore.ts     # Zustand store for nodes, edges & selections
    ├── components/
    │   ├── CanvasGraph.tsx   # Interactive canvas container (pan/zoom/drag)
    │   ├── TopNav.tsx        # Search bar, depth config & scan triggers
    │   ├── Inspector.tsx     # Node & TX detail sidebar
    │   ├── TerminalLog.tsx   # Cyberpunk ASCII event log
    │   └── FilterBar.tsx     # Risk filter & display toggles
    └── utils/
        ├── formatters.ts     # Sompi to KAS, short addresses, date helpers
        └── export.ts         # JSON & CSV export utilities
```

---

## 7. Next Steps & Agent Config
- Proceed to Step 4: Agent Configuration (`AGENTS.md` and `agent_docs/`).
