export const SOMPI_PER_KAS = 100_000_000; // 1e8

export function sompisToKas(sompis?: number | null): number {
  if (sompis == null || isNaN(sompis)) return 0;
  return sompis / SOMPI_PER_KAS;
}

export function formatKas(sompis?: number | null, decimals = 4): string {
  if (sompis == null || isNaN(sompis)) return '0.0000 KAS';
  const kas = sompis / SOMPI_PER_KAS;
  return `${kas.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })} KAS`;
}

export function shortenAddress(addr?: string, head = 8, tail = 6): string {
  if (!addr) return '';
  if (addr.startsWith('kaspa:')) {
    const core = addr.slice(6);
    if (core.length <= head + tail) return addr;
    return `kaspa:${core.slice(0, head)}...${core.slice(-tail)}`;
  }
  if (addr.length <= head + tail) return addr;
  return `${addr.slice(0, head)}...${addr.slice(-tail)}`;
}

export function shortenTxid(txid?: string, head = 6, tail = 6): string {
  if (!txid) return '';
  if (txid.length <= head + tail) return txid;
  return `${txid.slice(0, head)}...${txid.slice(-tail)}`;
}

export function formatTimestamp(ts?: number): string {
  if (!ts) return 'N/A';
  // Check if timestamp is in seconds or ms
  const date = new Date(ts > 1e11 ? ts : ts * 1000);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function formatTimeAgo(ts?: number): string {
  if (!ts) return 'N/A';
  const now = Date.now();
  const time = ts > 1e11 ? ts : ts * 1000;
  const diffSec = Math.floor((now - time) / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}d ago`;
}
