import { KaspaAddressBalance, KaspaTransaction, KaspaUtxoEntry } from './types';

const BASE_URL = 'https://api.kaspa.org';

// In-memory LRU-like cache
const cache = new Map<string, { data: unknown; expiry: number }>();
const CACHE_TTL_MS = 60_000 * 5; // 5 minutes

function getCached<T>(key: string): T | null {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }
  return item.data as T;
}

function setCache<T>(key: string, data: T, ttlMs = CACHE_TTL_MS): void {
  // Cap cache size
  if (cache.size > 2000) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }
  cache.set(key, { data, expiry: Date.now() + ttlMs });
}

// Request rate limiter / queue
class RequestQueue {
  private queue: Array<() => Promise<void>> = [];
  private activeCount = 0;
  private maxConcurrent = 6;
  private minIntervalMs = 80;
  private lastRequestTime = 0;

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const now = Date.now();
          const elapsed = now - this.lastRequestTime;
          if (elapsed < this.minIntervalMs) {
            await new Promise((r) => setTimeout(r, this.minIntervalMs - elapsed));
          }
          this.lastRequestTime = Date.now();
          const result = await fn();
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
      this.process();
    });
  }

  private async process() {
    if (this.activeCount >= this.maxConcurrent || this.queue.length === 0) return;
    const task = this.queue.shift();
    if (!task) return;

    this.activeCount++;
    try {
      await task();
    } finally {
      this.activeCount--;
      this.process();
    }
  }
}

const queue = new RequestQueue();

async function fetchWithRetry<T>(url: string, retries = 2): Promise<T> {
  const cached = getCached<T>(url);
  if (cached) return cached;

  return queue.add(async () => {
    let lastError: unknown;
    for (let i = 0; i <= retries; i++) {
      try {
        const res = await fetch(url, {
          headers: {
            'Accept': 'application/json',
          }
        });
        if (!res.ok) {
          if (res.status === 429) {
            // Backoff on rate limit
            await new Promise(r => setTimeout(r, 1000 * (i + 1)));
            continue;
          }
          throw new Error(`Kaspa API error: ${res.status} ${res.statusText}`);
        }
        const data = (await res.json()) as T;
        setCache<T>(url, data);
        return data;
      } catch (err) {
        lastError = err;
        if (i < retries) {
          await new Promise(r => setTimeout(r, 400 * (i + 1)));
        }
      }
    }
    throw lastError;
  });
}

export const KaspaApi = {
  async getAddressBalance(address: string): Promise<KaspaAddressBalance> {
    const url = `${BASE_URL}/addresses/${encodeURIComponent(address)}/balance`;
    return fetchWithRetry<KaspaAddressBalance>(url);
  },

  async getAddressTransactions(
    address: string,
    limit = 20,
    offset = 0
  ): Promise<KaspaTransaction[]> {
    const url = `${BASE_URL}/addresses/${encodeURIComponent(address)}/full-transactions?limit=${limit}&offset=${offset}&resolve_previous_outpoints=light`;
    return fetchWithRetry<KaspaTransaction[]>(url);
  },

  async getTransaction(txid: string): Promise<KaspaTransaction> {
    const url = `${BASE_URL}/transactions/${encodeURIComponent(txid)}?inputs=true&outputs=true&resolve_previous_outpoints=light`;
    return fetchWithRetry<KaspaTransaction>(url);
  },

  async getAddressUtxos(address: string): Promise<KaspaUtxoEntry[]> {
    const url = `${BASE_URL}/addresses/${encodeURIComponent(address)}/utxos`;
    return fetchWithRetry<KaspaUtxoEntry[]>(url);
  },

  async getHealth(): Promise<{ isSynced: boolean; serverVersion: string }> {
    const url = `${BASE_URL}/info/kaspad`;
    return fetchWithRetry<{ isSynced: boolean; serverVersion: string }>(url, 1);
  }
};
