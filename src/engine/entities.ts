export interface KnownEntity {
  name: string;
  type: 'exchange' | 'pool' | 'dev' | 'service';
  color: string;
}

// Known public Kaspa addresses & patterns
export const KNOWN_ENTITIES: Record<string, KnownEntity> = {
  // Kaspa Foundation / Development Funds
  'kaspa:precqv0fu6cw3vg4ech8xsrtqq8b0pdusdnc9afmpnv655tlmp0jw2kvlqmc5': {
    name: 'Kaspa Dev Fund (Main)',
    type: 'dev',
    color: '#00f3ff',
  },
  'kaspa:qqje6ps46n6pvjstupfxgrg6v3pegd22q84jachnfrnz2vh5vznqw8redgln6': {
    name: 'HumPool Mining Distributor',
    type: 'pool',
    color: '#a855f7',
  },
  'kaspa:qp9rv9jvx2kyf6wu4lupuruunq5zsuszyxs0dr3l89ej7wsgs48jqkewy6xtl': {
    name: 'ViaBTC Mining Payout',
    type: 'pool',
    color: '#a855f7',
  },
  'kaspa:qqkqkzjvr7zwxxmjxjkmxxdwju9kjs6e9u82uh59z07vgaks6gg62v8707g73': {
    name: 'Exchange Hot Wallet (MEXC)',
    type: 'exchange',
    color: '#38bdf8',
  },
  'kaspa:qr85gz7hvp76mtws6p236uv5xxdk57dzfe4p06ues0rlqhtqy3rtqqx7eeq3u': {
    name: 'KuCoin Hot Wallet',
    type: 'exchange',
    color: '#38bdf8',
  },
  'kaspa:qzuq429y5k2yqvqq8w6e99m8h4cvq6s4m92w4u6u8u4v8s4m92w4u6u8u4v8s': {
    name: 'Gate.io Custody',
    type: 'exchange',
    color: '#38bdf8',
  },
};

export function lookupEntity(address?: string): KnownEntity | null {
  if (!address) return null;
  const clean = address.trim();
  if (KNOWN_ENTITIES[clean]) {
    return KNOWN_ENTITIES[clean];
  }
  return null;
}
