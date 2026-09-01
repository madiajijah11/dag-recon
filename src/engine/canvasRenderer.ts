import { GraphEdge, GraphNode } from '../api/types';
import { sompisToKas } from '../utils/formatters';

export interface ViewportTransform {
  x: number;
  y: number;
  scale: number;
}

export interface RenderOptions {
  viewport: ViewportTransform;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  hoveredNodeId: string | null;
  showParticles: boolean;
  filterDustOnly: boolean;
  filterPoisonOnly: boolean;
  searchFilter: string;
  particleOffset: number;
  showMinimap?: boolean;
}

interface BundledEdge {
  id: string;
  source: string;
  target: string;
  totalAmount: number;
  count: number;
  isDust: boolean;
  isPoison: boolean;
  rawEdges: GraphEdge[];
}

export function drawCyberpunkGraph(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  nodes: GraphNode[],
  edges: GraphEdge[],
  options: RenderOptions
): void {
  const {
    viewport,
    selectedNodeId,
    selectedEdgeId,
    hoveredNodeId,
    showParticles,
    filterDustOnly,
    filterPoisonOnly,
    searchFilter,
    particleOffset,
    showMinimap = true,
  } = options;

  // Clear background
  ctx.fillStyle = '#07090e';
  ctx.fillRect(0, 0, width, height);

  // 1. Draw Cyberpunk Grid
  drawGrid(ctx, width, height, viewport);

  ctx.save();
  ctx.translate(viewport.x, viewport.y);
  ctx.scale(viewport.scale, viewport.scale);

  const nodeMap = new Map<string, GraphNode>();
  for (const n of nodes) {
    if (!n.hidden) nodeMap.set(n.id, n);
  }

  // 2. Bundle parallel edges
  const bundleMap = new Map<string, BundledEdge>();

  for (const edge of edges) {
    if (filterDustOnly && !edge.isDust) continue;
    if (filterPoisonOnly && !edge.isPoison) continue;

    const bundleKey = `${edge.source}->${edge.target}`;
    let bundle = bundleMap.get(bundleKey);
    if (!bundle) {
      bundle = {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        totalAmount: 0,
        count: 0,
        isDust: false,
        isPoison: false,
        rawEdges: [],
      };
      bundleMap.set(bundleKey, bundle);
    }
    bundle.totalAmount += edge.amount;
    bundle.count += 1;
    if (edge.isPoison) bundle.isPoison = true;
    if (edge.isDust) bundle.isDust = true;
    bundle.rawEdges.push(edge);
  }

  // 3. Draw Edges
  for (const bundle of bundleMap.values()) {
    const src = nodeMap.get(bundle.source);
    const tgt = nodeMap.get(bundle.target);
    if (!src || !tgt) continue;

    const isSelected =
      bundle.id === selectedEdgeId ||
      bundle.rawEdges.some((e) => e.id === selectedEdgeId);
    const isHovered = src.id === hoveredNodeId || tgt.id === hoveredNodeId;

    let strokeColor = 'rgba(56, 189, 248, 0.25)';
    let lineWidth = 1.5;

    if (bundle.isPoison) {
      strokeColor = isSelected ? '#ff0055' : 'rgba(255, 0, 85, 0.75)';
      lineWidth = 2.5;
    } else if (bundle.isDust) {
      strokeColor = isSelected ? '#ffdd00' : 'rgba(255, 221, 0, 0.55)';
      lineWidth = 2;
    } else if (isSelected || isHovered) {
      strokeColor = '#00f3ff';
      lineWidth = 2.5;
    }

    ctx.beginPath();
    ctx.moveTo(src.x, src.y);
    ctx.lineTo(tgt.x, tgt.y);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    drawArrow(ctx, src.x, src.y, tgt.x, tgt.y, tgt.radius + 6, strokeColor);

    if (showParticles) {
      drawBundledParticles(ctx, src, tgt, bundle, particleOffset);
    }

    if (bundle.count > 1 || isHovered || isSelected) {
      const midX = (src.x + tgt.x) / 2;
      const midY = (src.y + tgt.y) / 2;
      drawEdgeBadge(ctx, midX, midY, bundle, isSelected || isHovered);
    }
  }

  // 4. Draw Nodes
  for (const node of nodes) {
    if (node.hidden) continue;
    if (filterDustOnly && !node.flags.isDustSender) continue;
    if (filterPoisonOnly && !node.flags.isPoisoningSuspect) continue;

    const isSearchMatched =
      searchFilter.length > 0 &&
      Boolean(
        node.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
        node.label.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (node.userLabel && node.userLabel.toLowerCase().includes(searchFilter.toLowerCase()))
      );

    const isSelected = node.id === selectedNodeId;
    const isHovered = node.id === hoveredNodeId;

    drawNode(ctx, node, isSelected, isHovered, isSearchMatched, particleOffset);
  }

  ctx.restore();

  // 5. Draw Cyberpunk Radar Minimap (Screen-space overlay)
  if (showMinimap && nodes.length > 0) {
    drawMinimap(ctx, width, height, nodes, viewport);
  }
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  vp: ViewportTransform
): void {
  const gridSize = 45 * vp.scale;
  if (gridSize < 12) return;

  const offsetX = vp.x % gridSize;
  const offsetY = vp.y % gridSize;

  ctx.beginPath();
  ctx.strokeStyle = 'rgba(27, 35, 51, 0.4)';
  ctx.lineWidth = 1;

  for (let x = offsetX; x < width; x += gridSize) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }

  for (let y = offsetY; y < height; y += gridSize) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();

  const majorGrid = gridSize * 4;
  const majorOffsetX = vp.x % majorGrid;
  const majorOffsetY = vp.y % majorGrid;

  ctx.fillStyle = 'rgba(0, 243, 255, 0.12)';
  for (let x = majorOffsetX; x < width; x += majorGrid) {
    for (let y = majorOffsetY; y < height; y += majorGrid) {
      ctx.fillRect(x - 2, y - 2, 4, 4);
    }
  }
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  offset: number,
  color: string
): void {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 15) return;

  const ux = dx / dist;
  const uy = dy / dist;

  const tipX = x2 - ux * offset;
  const tipY = y2 - uy * offset;

  const arrowLen = 9;
  const arrowAngle = Math.PI / 7;
  const angle = Math.atan2(dy, dx);

  ctx.beginPath();
  ctx.moveTo(tipX, tipY);
  ctx.lineTo(
    tipX - arrowLen * Math.cos(angle - arrowAngle),
    tipY - arrowLen * Math.sin(angle - arrowAngle)
  );
  ctx.lineTo(
    tipX - arrowLen * Math.cos(angle + arrowAngle),
    tipY - arrowLen * Math.sin(angle + arrowAngle)
  );
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawBundledParticles(
  ctx: CanvasRenderingContext2D,
  src: GraphNode,
  tgt: GraphNode,
  bundle: BundledEdge,
  animOffset: number
): void {
  const dx = tgt.x - src.x;
  const dy = tgt.y - src.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 25) return;

  const count = Math.min(3, Math.max(1, Math.floor(bundle.count / 3) + 1));

  for (let i = 0; i < count; i++) {
    const t = (animOffset + i / count) % 1;
    const px = src.x + dx * t;
    const py = src.y + dy * t;

    let pColor = '#00f3ff';
    if (bundle.isPoison) pColor = '#ff0055';
    else if (bundle.isDust) pColor = '#ffdd00';

    ctx.beginPath();
    ctx.arc(px, py, 2.4, 0, Math.PI * 2);
    ctx.fillStyle = pColor;
    ctx.shadowColor = pColor;
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function drawEdgeBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  bundle: BundledEdge,
  highlight: boolean
): void {
  const text =
    bundle.count > 1
      ? `${bundle.count} txs (${sompisToKas(bundle.totalAmount).toFixed(1)} KAS)`
      : `${sompisToKas(bundle.totalAmount).toFixed(1)} KAS`;
  ctx.font = '9px "JetBrains Mono", monospace';
  const metrics = ctx.measureText(text);
  const padding = 4;

  ctx.fillStyle = 'rgba(7, 9, 14, 0.92)';
  ctx.strokeStyle = highlight ? '#00f3ff' : 'rgba(75, 85, 99, 0.5)';
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.roundRect(x - metrics.width / 2 - padding, y - 7, metrics.width + padding * 2, 14, 3);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = highlight ? '#00f3ff' : '#94a3b8';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

function drawNode(
  ctx: CanvasRenderingContext2D,
  node: GraphNode,
  isSelected: boolean,
  isHovered: boolean,
  isSearchMatched: boolean,
  animOffset: number
): void {
  const { x, y, radius, flags, color } = node;

  let baseColor = color || '#a855f7';
  if (flags.isRoot) baseColor = '#00f3ff';
  if (flags.isPoisoningSuspect) baseColor = '#ff0055';
  if (flags.isDustSender && !flags.isPoisoningSuspect) baseColor = '#ffdd00';
  if (node.flags.isExchange) baseColor = '#38bdf8';
  if (node.flags.isMiningPool) baseColor = '#a855f7';

  // Pulse ring
  if (isSelected || isHovered || flags.isPoisoningSuspect || isSearchMatched) {
    const pulseRadius = radius + 8 + Math.sin(animOffset * Math.PI * 2) * 2;
    ctx.beginPath();
    ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
    ctx.strokeStyle = isSelected || isSearchMatched ? '#00f3ff' : baseColor;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Outer glow
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.shadowColor = baseColor;
  ctx.shadowBlur = isSelected ? 22 : 12;
  ctx.fillStyle = '#0d111a';
  ctx.fill();
  ctx.shadowBlur = 0;

  // Node boundary
  ctx.strokeStyle = baseColor;
  ctx.lineWidth = isSelected ? 3 : 2;
  ctx.stroke();

  // Center core
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.45, 0, Math.PI * 2);
  ctx.fillStyle = baseColor;
  ctx.fill();

  // Label banner
  drawNodeLabel(ctx, node, x, y + radius + 15, isSelected);
}

function drawNodeLabel(
  ctx: CanvasRenderingContext2D,
  node: GraphNode,
  x: number,
  y: number,
  isSelected: boolean
): void {
  const label = node.userLabel ? `${node.userLabel} (${node.label})` : node.label;
  ctx.font = isSelected ? 'bold 11px "JetBrains Mono", monospace' : '10px "JetBrains Mono", monospace';
  const metrics = ctx.measureText(label);
  const textWidth = metrics.width;
  const padding = 6;

  ctx.fillStyle = 'rgba(7, 9, 14, 0.94)';
  ctx.strokeStyle = node.userLabel ? '#ffdd00' : isSelected ? '#00f3ff' : 'rgba(75, 85, 99, 0.6)';
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.roundRect(x - textWidth / 2 - padding, y - 8, textWidth + padding * 2, 16, 4);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = node.userLabel ? '#ffdd00' : isSelected ? '#00f3ff' : '#e2e8f0';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x, y);

  if (node.balance !== undefined && node.balance > 0) {
    const balText = `${sompisToKas(node.balance).toFixed(2)} KAS`;
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(balText, x, y + 14);
  }
}

function drawMinimap(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  nodes: GraphNode[],
  viewport: ViewportTransform
): void {
  const mmW = 140;
  const mmH = 95;
  const mmX = canvasWidth - mmW - 16;
  const mmY = canvasHeight - mmH - 16;

  // Minimap background
  ctx.fillStyle = 'rgba(13, 17, 26, 0.85)';
  ctx.strokeStyle = 'rgba(0, 243, 255, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(mmX, mmY, mmW, mmH, 6);
  ctx.fill();
  ctx.stroke();

  // Radar grid crosshairs
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(0, 243, 255, 0.15)';
  ctx.moveTo(mmX + mmW / 2, mmY);
  ctx.lineTo(mmX + mmW / 2, mmY + mmH);
  ctx.moveTo(mmX, mmY + mmH / 2);
  ctx.lineTo(mmX + mmW, mmY + mmH / 2);
  ctx.stroke();

  // Bounding box of all nodes
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const n of nodes) {
    if (n.hidden) continue;
    if (n.x < minX) minX = n.x;
    if (n.x > maxX) maxX = n.x;
    if (n.y < minY) minY = n.y;
    if (n.y > maxY) maxY = n.y;
  }

  const rangeX = Math.max(maxX - minX, 600);
  const rangeY = Math.max(maxY - minY, 400);
  const midX = (minX + maxX) / 2 || 0;
  const midY = (minY + maxY) / 2 || 0;

  const mmScale = Math.min((mmW - 16) / rangeX, (mmH - 16) / rangeY);

  // Draw node dots in minimap
  for (const n of nodes) {
    if (n.hidden) continue;
    const nx = mmX + mmW / 2 + (n.x - midX) * mmScale;
    const ny = mmY + mmH / 2 + (n.y - midY) * mmScale;

    ctx.fillStyle = n.flags.isRoot ? '#00f3ff' : n.flags.isPoisoningSuspect ? '#ff0055' : '#a855f7';
    ctx.beginPath();
    ctx.arc(nx, ny, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw camera viewport rectangle in minimap
  const viewWorldLeft = -viewport.x / viewport.scale;
  const viewWorldTop = -viewport.y / viewport.scale;
  const viewWorldRight = (canvasWidth - viewport.x) / viewport.scale;
  const viewWorldBottom = (canvasHeight - viewport.y) / viewport.scale;

  const camX = mmX + mmW / 2 + (viewWorldLeft - midX) * mmScale;
  const camY = mmY + mmH / 2 + (viewWorldTop - midY) * mmScale;
  const camW = (viewWorldRight - viewWorldLeft) * mmScale;
  const camH = (viewWorldBottom - viewWorldTop) * mmScale;

  ctx.strokeStyle = '#00f3ff';
  ctx.lineWidth = 1;
  ctx.strokeRect(
    Math.max(mmX, camX),
    Math.max(mmY, camY),
    Math.min(mmW, camW),
    Math.min(mmH, camH)
  );

  // Minimap Label
  ctx.font = '8px "JetBrains Mono", monospace';
  ctx.fillStyle = '#64748b';
  ctx.fillText('RADAR', mmX + 6, mmY + 10);
}
