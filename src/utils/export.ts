import { ForensicAlert, GraphEdge, GraphNode } from '../api/types';
import { sompisToKas } from './formatters';

export function exportGraphToJson(
  nodes: GraphNode[],
  edges: GraphEdge[],
  alerts: ForensicAlert[]
): void {
  const data = {
    exportedAt: new Date().toISOString(),
    tool: 'DAG-Recon',
    summary: {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      totalAlerts: alerts.length,
    },
    nodes,
    edges,
    alerts,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dag-recon-trace-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportTransfersToCsv(edges: GraphEdge[]): void {
  const headers = ['Source', 'Target', 'Amount_KAS', 'Amount_Sompis', 'TXID', 'Timestamp', 'IsDust', 'IsPoison'];
  const rows = edges.map((e) => [
    e.source,
    e.target,
    sompisToKas(e.amount),
    e.amount,
    e.txid,
    new Date(e.timestamp > 1e11 ? e.timestamp : e.timestamp * 1000).toISOString(),
    e.isDust ? 'YES' : 'NO',
    e.isPoison ? 'YES' : 'NO',
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dag-recon-transfers-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
