# Product Requirements Document (PRD): DAG-Recon

## Overview
- **Product Name**: DAG-Recon
- **Type**: Web-based On-chain Forensic & UTXO Money Tracking Tool for Kaspa
- **Target Audience**: Blockchain investigators, Kaspa users, security analysts, node operators
- **Primary Interface**: Web application with interactive Cyberpunk / ASCII Canvas Graph UI
- **Data Backend**: Client-side queries to Kaspa Public REST API (`https://api.kaspa.org`)

---

## Problem Statement
Kaspa uses the GHOSTDAG consensus protocol with high block rates and UTXO-based transactions. Investigating funds movement, tracking stolen assets, and identifying address poisoning/dusting attacks on Kaspa is challenging with standard block explorers that lack interactive multi-hop graph visualization and automated attack pattern heuristics.

---

## Target Personas
1. **Security Analyst / Investigator**: Needs to trace fund outflows across multiple hops, identify split/merge patterns, and detect wash/dusting behavior.
2. **Casual / Power User**: Wants to inspect suspicious incoming micro-transactions (address poisoning/dusting) and trace counterparties.

---

## MVP Scope & Core Features

### 1. UTXO Multi-Hop Flow Tracing
- **Address / TXID Lookup**: Input any Kaspa address (`kaspa:...`) or Transaction ID.
- **Forward & Backward Tracing**: Traverse inputs (fund sources) and outputs (fund destinations) across configurable hop depth (1–5 hops).
- **Hop Graph Construction**: Directed acyclic graph showing addresses as nodes and UTXO transfers as edges with amounts (KAS) and timestamps.
- **Node Aggregation**: Collapse change addresses and multi-output distributions into readable clusters.

### 2. Poisoning & Dusting Detection
- **Dust Threshold Filter**: Detect incoming transactions below configurable threshold (< 0.001 KAS or custom).
- **Address Similarity Scoring**: Flag vanity/mimic address poisoning attempts where attacker address shares prefix/suffix with user's frequent counterparties.
- **Suspicious Tagging**: Visual badges on graph nodes/edges flagged as dust or poison vectors.

### 3. Cyberpunk / ASCII Graph UI
- **Canvas / WebGL Graph Engine**: Dark mode, neon/cyberpunk aesthetics with smooth zoom, pan, and node dragging.
- **Inspector Panel**: Sidebar detailing selected transaction/address metrics:
  - Balance, UTXO count, total in/out volume.
  - Transaction fee, block DAA score, timestamp.
- **Telemetry / Activity Feed**: Retro terminal-style log output stream tracking API requests, node expansion, and forensic alerts.

### 4. Client-side Performance & Rate Limit Handling
- **Direct API Integration**: Pure client-side calls to `https://api.kaspa.org` without mandatory custom backend server.
- **Request Throttling & Caching**: In-memory LRU / IndexedDB caching for blocks, transactions, and addresses to stay within public API rate limits.
- **Export Data**: One-click export of current investigation graph to JSON and CSV.

---

## Non-Goals (Out of Scope for MVP)
- Private full-node gRPC streaming (Kaspad RPC) — deferred to v2.
- Server-side account tracking / user logins / database storage.
- Automated fiat-gateway identity resolution (KYC clustering).

---

## Success Metrics
- Graph loads and renders 3-hop trace (< 50 nodes) within 2 seconds.
- 100% client-side execution; zero external infrastructure dependencies outside Kaspa public API.
- Accurate detection and visual isolation of 0-value / dust poisoning attacks.

---

## Handoff Context
- **App**: DAG-Recon
- **Platform**: Web (Client-side TypeScript, Canvas/SVG Graph, Vite/React or Vanilla/Solid)
- **Data Source**: Kaspa Public REST API (`https://api.kaspa.org`)
- **Next Phase**: Step 3 — Technical Design (`docs/TechDesign-dag-recon.md`)
