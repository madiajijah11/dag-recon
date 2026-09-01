import { KaspaApi } from '../api/kaspaApi';
import {
  ForensicAlert,
  GraphEdge,
  GraphNode,
  KaspaTransaction,
  TraceOptions,
} from '../api/types';
import { sompisToKas, shortenAddress } from '../utils/formatters';
import { lookupEntity } from './entities';

export function calculateAddressSimilarity(addrA: string, addrB: string): {
  prefixMatch: number;
  suffixMatch: number;
  isMimic: boolean;
  score: number;
} {
  const cleanA = addrA.replace(/^kaspa:/, '');
  const cleanB = addrB.replace(/^kaspa:/, '');

  if (cleanA === cleanB) {
    return { prefixMatch: cleanA.length, suffixMatch: cleanA.length, isMimic: false, score: 0 };
  }

  let prefixMatch = 0;
  const minLen = Math.min(cleanA.length, cleanB.length);
  while (prefixMatch < minLen && cleanA[prefixMatch] === cleanB[prefixMatch]) {
    prefixMatch++;
  }

  let suffixMatch = 0;
  while (
    suffixMatch < minLen &&
    cleanA[cleanA.length - 1 - suffixMatch] === cleanB[cleanB.length - 1 - suffixMatch]
  ) {
    suffixMatch++;
  }

  // A mimic attempt typically matches 4+ chars at prefix and 4+ chars at suffix
  const isMimic = prefixMatch >= 4 && suffixMatch >= 4;
  const score = Math.min(100, (prefixMatch + suffixMatch) * 10);

  return { prefixMatch, suffixMatch, isMimic, score };
}

export async function runForensicTrace(
  options: TraceOptions,
  onProgress?: (msg: string, alert?: ForensicAlert) => void
): Promise<{
  nodes: GraphNode[];
  edges: GraphEdge[];
  alerts: ForensicAlert[];
}> {
  const {
    rootAddressOrTx,
    maxHops,
    direction,
    txLimitPerAddress,
    dustThresholdSompis,
  } = options;

  const nodeMap = new Map<string, GraphNode>();
  const edgeMap = new Map<string, GraphEdge>();
  const alerts: ForensicAlert[] = [];

  const visitedAddresses = new Set<string>();
  const visitedTxids = new Set<string>();
  const legitimateCounterparties = new Map<string, number>(); // addr -> count of normal txs

  // Determine if root is address or txid
  const isRootTx = !rootAddressOrTx.startsWith('kaspa:') && rootAddressOrTx.length === 64;

  const rootId = rootAddressOrTx.trim();
  const rootEntity = !isRootTx ? lookupEntity(rootId) : null;
  const rootNode: GraphNode = {
    id: rootId,
    type: isRootTx ? 'transaction' : 'address',
    label: isRootTx ? `tx:${rootId.slice(0, 8)}...` : (rootEntity ? `[${rootEntity.name}] ${shortenAddress(rootId)}` : shortenAddress(rootId)),
    entityTag: rootEntity?.name,
    address: isRootTx ? undefined : rootId,
    txid: isRootTx ? rootId : undefined,
    hop: 0,
    flags: {
      isRoot: true,
      isExchange: rootEntity?.type === 'exchange',
      isMiningPool: rootEntity?.type === 'pool',
      isDevFund: rootEntity?.type === 'dev',
    },
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    radius: 22,
    pinned: true,
    color: rootEntity?.color || '#00f3ff',
  };
  nodeMap.set(rootId, rootNode);

  onProgress?.(`Initializing forensic scan for ${rootId} (Hops: ${maxHops}, Dir: ${direction.toUpperCase()})`);

  // If address, fetch balance
  if (!isRootTx) {
    try {
      const bal = await KaspaApi.getAddressBalance(rootId);
      rootNode.balance = bal.balance;
      onProgress?.(`Target balance: ${sompisToKas(bal.balance).toLocaleString()} KAS`);
    } catch {
      // ignore
    }
  }

  // BFS Queue: { id: string, type: 'address' | 'transaction', hop: number }
  const queue: Array<{ id: string; type: 'address' | 'transaction'; hop: number }> = [
    { id: rootId, type: rootNode.type, hop: 0 },
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.hop >= maxHops) continue;

    if (current.type === 'address') {
      const addr = current.id;
      if (visitedAddresses.has(addr)) continue;
      visitedAddresses.add(addr);

      onProgress?.(`Scanning address [Hop ${current.hop}]: ${shortenAddress(addr)}`);

      let txList: KaspaTransaction[] = [];
      try {
        txList = await KaspaApi.getAddressTransactions(addr, txLimitPerAddress);
      } catch (err) {
        onProgress?.(`Failed to fetch txs for ${shortenAddress(addr)}: ${(err as Error).message}`);
        continue;
      }

      for (const tx of txList) {
        if (!tx.transaction_id) continue;
        const txid = tx.transaction_id;

        // Process inputs (Backward flow)
        const inputs = tx.inputs || [];
        const outputs = tx.outputs || [];

        // Check legitimate counterparties first for poisoning heuristics
        for (const out of outputs) {
          const outAddr = out.script_public_key_address;
          if (outAddr && outAddr !== addr && out.amount > dustThresholdSompis) {
            legitimateCounterparties.set(
              outAddr,
              (legitimateCounterparties.get(outAddr) || 0) + 1
            );
          }
        }

        // Process incoming & outgoing transfers
        for (const input of inputs) {
          const srcAddr = input.previous_outpoint_address;
          const amount = input.previous_outpoint_amount || 0;
          if (!srcAddr) continue;

          // Check for dust
          const isDust = amount > 0 && amount <= dustThresholdSompis;

          // Check for address poisoning mimic attempt
          let isPoison = false;
          let highestConfidence = 0;
          let mimickedPartner = '';

          for (const [legitAddr] of legitimateCounterparties.entries()) {
            if (legitAddr === srcAddr) continue;
            const sim = calculateAddressSimilarity(srcAddr, legitAddr);
            if (sim.isMimic) {
              isPoison = true;
              highestConfidence = sim.score;
              mimickedPartner = legitAddr;
              break;
            }
          }

          if (isDust) {
            const alert: ForensicAlert = {
              id: `dust-${txid}-${srcAddr}`,
              timestamp: tx.block_time || Date.now(),
              type: 'dust',
              severity: 'warning',
              title: 'Dust Transaction Detected',
              description: `Micro UTXO transfer of ${sompisToKas(amount)} KAS from ${shortenAddress(srcAddr)}`,
              targetAddress: addr,
              suspectAddress: srcAddr,
              txid,
              amountSompis: amount,
            };
            alerts.push(alert);
            onProgress?.(`[FORENSIC ALERT] Dust transfer detected from ${shortenAddress(srcAddr)}`, alert);
          }

          if (isPoison) {
            const alert: ForensicAlert = {
              id: `poison-${txid}-${srcAddr}`,
              timestamp: tx.block_time || Date.now(),
              type: 'poison',
              severity: 'danger',
              title: 'Address Poisoning / Mimic Attack Suspect',
              description: `Sender ${shortenAddress(srcAddr)} mimics legitimate counterparty ${shortenAddress(mimickedPartner)} (${highestConfidence}% confidence)`,
              targetAddress: addr,
              suspectAddress: srcAddr,
              txid,
              amountSompis: amount,
            };
            alerts.push(alert);
            onProgress?.(`[FORENSIC ALERT] POISONING MIMIC detected! Suspect: ${shortenAddress(srcAddr)}`, alert);
          }

          // Add / update source node
          if (!nodeMap.has(srcAddr)) {
            const isDustSender = isDust;
            const isPoisoningSuspect = isPoison;
            const entity = lookupEntity(srcAddr);
            const node: GraphNode = {
              id: srcAddr,
              type: 'address',
              label: entity ? `[${entity.name}] ${shortenAddress(srcAddr)}` : shortenAddress(srcAddr),
              entityTag: entity?.name,
              address: srcAddr,
              hop: current.hop + 1,
              flags: {
                isDustSender,
                isPoisoningSuspect,
                isHighRisk: isPoisoningSuspect,
                isExchange: entity?.type === 'exchange',
                isMiningPool: entity?.type === 'pool',
                isDevFund: entity?.type === 'dev',
              },
              x: (Math.random() - 0.5) * 400,
              y: (Math.random() - 0.5) * 400,
              vx: 0,
              vy: 0,
              radius: isPoisoningSuspect ? 18 : 14,
              color: isPoisoningSuspect ? '#ff0055' : isDustSender ? '#ffdd00' : (entity?.color || '#a855f7'),
            };
            nodeMap.set(srcAddr, node);
          } else {
            const node = nodeMap.get(srcAddr)!;
            if (isPoison) {
              node.flags.isPoisoningSuspect = true;
              node.flags.isHighRisk = true;
              node.color = '#ff0055';
            }
          }

          // Add edge: srcAddr -> addr (via txid)
          const edgeId = `${srcAddr}->${addr}:${txid}`;
          if (!edgeMap.has(edgeId)) {
            edgeMap.set(edgeId, {
              id: edgeId,
              source: srcAddr,
              target: addr,
              amount,
              txid,
              timestamp: tx.block_time || Date.now(),
              isDust,
              isPoison,
              confidenceScore: highestConfidence,
            });
          }

          if (direction === 'backward' || direction === 'both') {
            if (!visitedAddresses.has(srcAddr) && current.hop + 1 < maxHops) {
              queue.push({ id: srcAddr, type: 'address', hop: current.hop + 1 });
            }
          }
        }

        // Process outputs (Forward flow)
        for (const out of outputs) {
          const destAddr = out.script_public_key_address;
          const amount = out.amount || 0;
          if (!destAddr || destAddr === addr) continue;

          const isDust = amount > 0 && amount <= dustThresholdSompis;

          // Check if output address mimics someone
          let isPoison = false;
          let highestConfidence = 0;
          for (const [legitAddr] of legitimateCounterparties.entries()) {
            if (legitAddr === destAddr) continue;
            const sim = calculateAddressSimilarity(destAddr, legitAddr);
            if (sim.isMimic) {
              isPoison = true;
              highestConfidence = sim.score;
              break;
            }
          }

          // Add / update destination node
          if (!nodeMap.has(destAddr)) {
            const entity = lookupEntity(destAddr);
            const node: GraphNode = {
              id: destAddr,
              type: 'address',
              label: entity ? `[${entity.name}] ${shortenAddress(destAddr)}` : shortenAddress(destAddr),
              entityTag: entity?.name,
              address: destAddr,
              hop: current.hop + 1,
              flags: {
                isDustSender: isDust,
                isPoisoningSuspect: isPoison,
                isHighRisk: isPoison,
                isExchange: entity?.type === 'exchange',
                isMiningPool: entity?.type === 'pool',
                isDevFund: entity?.type === 'dev',
              },
              x: (Math.random() - 0.5) * 400,
              y: (Math.random() - 0.5) * 400,
              vx: 0,
              vy: 0,
              radius: isPoison ? 18 : 14,
              color: isPoison ? '#ff0055' : isDust ? '#ffdd00' : (entity?.color || '#00ff66'),
            };
            nodeMap.set(destAddr, node);
          }

          // Add edge: addr -> destAddr
          const edgeId = `${addr}->${destAddr}:${txid}`;
          if (!edgeMap.has(edgeId)) {
            edgeMap.set(edgeId, {
              id: edgeId,
              source: addr,
              target: destAddr,
              amount,
              txid,
              timestamp: tx.block_time || Date.now(),
              isDust,
              isPoison,
              confidenceScore: highestConfidence,
            });
          }

          if (direction === 'forward' || direction === 'both') {
            if (!visitedAddresses.has(destAddr) && current.hop + 1 < maxHops) {
              queue.push({ id: destAddr, type: 'address', hop: current.hop + 1 });
            }
          }
        }
      }
    } else if (current.type === 'transaction') {
      const txid = current.id;
      if (visitedTxids.has(txid)) continue;
      visitedTxids.add(txid);

      onProgress?.(`Fetching transaction [Hop ${current.hop}]: ${txid.slice(0, 10)}...`);

      let tx: KaspaTransaction;
      try {
        tx = await KaspaApi.getTransaction(txid);
      } catch (err) {
        onProgress?.(`Failed to fetch tx ${txid}: ${(err as Error).message}`);
        continue;
      }

      const inputs = tx.inputs || [];
      const outputs = tx.outputs || [];

      for (const inp of inputs) {
        const srcAddr = inp.previous_outpoint_address;
        if (!srcAddr) continue;

        if (!nodeMap.has(srcAddr)) {
          nodeMap.set(srcAddr, {
            id: srcAddr,
            type: 'address',
            label: shortenAddress(srcAddr),
            address: srcAddr,
            hop: current.hop + 1,
            flags: {},
            x: (Math.random() - 0.5) * 300,
            y: (Math.random() - 0.5) * 300,
            vx: 0,
            vy: 0,
            radius: 14,
            color: '#a855f7',
          });
        }

        const edgeId = `${srcAddr}->${txid}`;
        if (!edgeMap.has(edgeId)) {
          edgeMap.set(edgeId, {
            id: edgeId,
            source: srcAddr,
            target: txid,
            amount: inp.previous_outpoint_amount || 0,
            txid,
            timestamp: tx.block_time || Date.now(),
            isDust: (inp.previous_outpoint_amount || 0) <= dustThresholdSompis,
            isPoison: false,
          });
        }

        if (direction === 'backward' || direction === 'both') {
          if (current.hop + 1 < maxHops) {
            queue.push({ id: srcAddr, type: 'address', hop: current.hop + 1 });
          }
        }
      }

      for (const out of outputs) {
        const destAddr = out.script_public_key_address;
        if (!destAddr) continue;

        if (!nodeMap.has(destAddr)) {
          nodeMap.set(destAddr, {
            id: destAddr,
            type: 'address',
            label: shortenAddress(destAddr),
            address: destAddr,
            hop: current.hop + 1,
            flags: {},
            x: (Math.random() - 0.5) * 300,
            y: (Math.random() - 0.5) * 300,
            vx: 0,
            vy: 0,
            radius: 14,
            color: '#00ff66',
          });
        }

        const edgeId = `${txid}->${destAddr}`;
        if (!edgeMap.has(edgeId)) {
          edgeMap.set(edgeId, {
            id: edgeId,
            source: txid,
            target: destAddr,
            amount: out.amount || 0,
            txid,
            timestamp: tx.block_time || Date.now(),
            isDust: (out.amount || 0) <= dustThresholdSompis,
            isPoison: false,
          });
        }

        if (direction === 'forward' || direction === 'both') {
          if (current.hop + 1 < maxHops) {
            queue.push({ id: destAddr, type: 'address', hop: current.hop + 1 });
          }
        }
      }
    }
  }

  const nodes = Array.from(nodeMap.values());
  const edges = Array.from(edgeMap.values());

  onProgress?.(`Forensic scan complete! Found ${nodes.length} nodes, ${edges.length} transfers, ${alerts.length} risk alerts.`);

  return { nodes, edges, alerts };
}