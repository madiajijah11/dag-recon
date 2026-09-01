import { GraphEdge, GraphNode } from '../api/types';

export function runForceSimulationStep(
  nodes: GraphNode[],
  edges: GraphEdge[],
  options: {
    repulsion?: number;
    linkDistance?: number;
    linkStrength?: number;
    centerStrength?: number;
    damping?: number;
    minSeparation?: number;
  } = {}
): boolean {
  if (nodes.length <= 1) return false;

  const repulsion = options.repulsion ?? 65000;
  const linkDistance = options.linkDistance ?? 280;
  const linkStrength = options.linkStrength ?? 0.025;
  const centerStrength = options.centerStrength ?? 0.0005;
  const damping = options.damping ?? 0.82;
  const minSeparation = options.minSeparation ?? 115;

  const nodeMap = new Map<string, GraphNode>();
  for (const n of nodes) {
    if (!n.hidden) nodeMap.set(n.id, n);
  }

  const activeNodes = nodes.filter((n) => !n.hidden);

  // 1. Repulsion & Collision
  for (let i = 0; i < activeNodes.length; i++) {
    const nodeA = activeNodes[i];
    for (let j = i + 1; j < activeNodes.length; j++) {
      const nodeB = activeNodes[j];
      const dx = nodeB.x - nodeA.x;
      const dy = nodeB.y - nodeA.y;
      const distSq = dx * dx + dy * dy || 1;
      const dist = Math.sqrt(distSq);

      if (dist < minSeparation) {
        const overlap = minSeparation - dist;
        const pushForce = (overlap / minSeparation) * 8.0;
        const pushX = (dx / dist) * pushForce;
        const pushY = (dy / dist) * pushForce;

        if (!nodeA.pinned) {
          nodeA.vx -= pushX;
          nodeA.vy -= pushY;
        }
        if (!nodeB.pinned) {
          nodeB.vx += pushX;
          nodeB.vy += pushY;
        }
      }

      if (dist < 1200) {
        const force = repulsion / (distSq + 400);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        if (!nodeA.pinned) {
          nodeA.vx -= fx;
          nodeA.vy -= fy;
        }
        if (!nodeB.pinned) {
          nodeB.vx += fx;
          nodeB.vy += fy;
        }
      }
    }
  }

  // 2. Spring attraction along UNIQUE pairs
  const processedPairs = new Set<string>();
  for (const edge of edges) {
    const key = edge.source < edge.target ? `${edge.source}|${edge.target}` : `${edge.target}|${edge.source}`;
    if (processedPairs.has(key)) continue;
    processedPairs.add(key);

    const src = nodeMap.get(edge.source);
    const tgt = nodeMap.get(edge.target);
    if (!src || !tgt) continue;

    const dx = tgt.x - src.x;
    const dy = tgt.y - src.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    const targetDist = linkDistance;
    const displacement = dist - targetDist;
    const force = displacement * linkStrength;

    const fx = (dx / dist) * force;
    const fy = (dy / dist) * force;

    if (!src.pinned) {
      src.vx += fx;
      src.vy += fy;
    }
    if (!tgt.pinned) {
      tgt.vx -= fx;
      tgt.vy -= fy;
    }
  }

  // 3. Center gravity & velocity integration + Kinetic energy check
  let totalKineticEnergy = 0;

  for (const node of activeNodes) {
    if (node.pinned) {
      node.vx = 0;
      node.vy = 0;
      continue;
    }

    node.vx -= node.x * centerStrength;
    node.vy -= node.y * centerStrength;

    node.vx *= damping;
    node.vy *= damping;

    const speedSq = node.vx * node.vx + node.vy * node.vy;
    totalKineticEnergy += speedSq;

    const speed = Math.sqrt(speedSq);
    const maxSpeed = 12;
    if (speed > maxSpeed) {
      node.vx = (node.vx / speed) * maxSpeed;
      node.vy = (node.vy / speed) * maxSpeed;
    }

    // Dead-zone threshold for micro-jitter
    if (speed < 0.05) {
      node.vx = 0;
      node.vy = 0;
    } else {
      node.x += node.vx;
      node.y += node.vy;
    }
  }

  // Returns true if nodes are still actively moving
  return totalKineticEnergy > 0.08;
}

export function arrangeRadialLayout(nodes: GraphNode[]): void {
  const activeNodes = nodes.filter((n) => !n.hidden);
  const hopGroups = new Map<number, GraphNode[]>();
  for (const node of activeNodes) {
    const list = hopGroups.get(node.hop) || [];
    list.push(node);
    hopGroups.set(node.hop, list);
  }

  hopGroups.forEach((group, hop) => {
    if (hop === 0) {
      for (const n of group) {
        n.x = 0;
        n.y = 0;
        n.pinned = true;
      }
      return;
    }

    const radius = hop * 300;
    const count = group.length;
    const step = (Math.PI * 2) / count;

    group.forEach((node, idx) => {
      const angle = idx * step + (hop % 2 === 0 ? 0.35 : 0);
      node.x = Math.cos(angle) * radius;
      node.y = Math.sin(angle) * radius;
      node.vx = 0;
      node.vy = 0;
      node.pinned = false;
    });
  });
}

export function calculateZoomToFit(
  nodes: GraphNode[],
  containerWidth: number,
  containerHeight: number,
  padding = 120
): { x: number; y: number; scale: number } | null {
  const visible = nodes.filter((n) => !n.hidden);
  if (visible.length === 0) return null;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const n of visible) {
    if (n.x < minX) minX = n.x;
    if (n.x > maxX) maxX = n.x;
    if (n.y < minY) minY = n.y;
    if (n.y > maxY) maxY = n.y;
  }

  const graphWidth = maxX - minX || 200;
  const graphHeight = maxY - minY || 200;

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  const availWidth = Math.max(containerWidth - padding * 2, 100);
  const availHeight = Math.max(containerHeight - padding * 2, 100);

  const scaleX = availWidth / graphWidth;
  const scaleY = availHeight / graphHeight;
  const scale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.2), 2.2);

  const x = containerWidth / 2 - centerX * scale;
  const y = containerHeight / 2 - centerY * scale;

  return { x, y, scale };
}
