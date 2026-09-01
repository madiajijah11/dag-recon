export interface KaspaTxInput {
  transaction_id: string;
  index: number;
  previous_outpoint_hash?: string;
  previous_outpoint_index?: string | number;
  previous_outpoint_address?: string;
  previous_outpoint_amount?: number;
  signature_script?: string;
  sig_op_count?: string;
}

export interface KaspaTxOutput {
  transaction_id: string;
  index: number;
  amount: number; // Sompis
  script_public_key?: string;
  script_public_key_address?: string;
  script_public_key_type?: string;
}

export interface KaspaTransaction {
  subnetwork_id?: string;
  transaction_id: string;
  hash?: string;
  mass?: number | null;
  payload?: string | null;
  block_hash?: string[];
  block_time: number;
  is_accepted?: boolean;
  accepting_block_hash?: string | null;
  accepting_block_blue_score?: number;
  accepting_block_time?: number;
  inputs: KaspaTxInput[] | null;
  outputs: KaspaTxOutput[];
}

export interface KaspaAddressBalance {
  address: string;
  balance: number; // Sompis
}

export interface KaspaUtxoEntry {
  address: string;
  outpoint: {
    transactionId: string;
    index: number;
  };
  utxoEntry: {
    amount: string | number;
    scriptPublicKey: {
      scriptPublicKey: string;
      version: number;
    };
    blockDaaScore: string | number;
    isCoinbase: boolean;
  };
}

export type NodeType = "address" | "transaction";

export interface NodeFlags {
  isRoot?: boolean;
  isDustSender?: boolean;
  isPoisoningSuspect?: boolean;
  isHighRisk?: boolean;
  isExchange?: boolean;
  isMiningPool?: boolean;
  isDevFund?: boolean;
}

export interface GraphNode {
  id: string; // address or txid
  type: NodeType;
  label: string;
  userLabel?: string;
  entityTag?: string;
  address?: string;
  txid?: string;
  balance?: number; // Sompis
  hop: number; // 0 = origin, 1 = first hop, etc.
  flags: NodeFlags;
  txCount?: number;
  inVolume?: number; // Sompis
  outVolume?: number; // Sompis
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pinned?: boolean;
  hidden?: boolean;
  color?: string;
}

export interface GraphEdge {
  id: string;
  source: string; // Node id
  target: string; // Node id
  amount: number; // Sompis
  txid: string;
  timestamp: number;
  isDust: boolean;
  isPoison: boolean;
  confidenceScore?: number; // 0 - 100 for poisoning suspicion
}

export interface ForensicAlert {
  id: string;
  timestamp: number;
  type: "dust" | "poison" | "high_volume" | "rapid_dispersion";
  severity: "info" | "warning" | "danger";
  title: string;
  description: string;
  targetAddress?: string;
  suspectAddress?: string;
  txid?: string;
  amountSompis?: number;
}

export interface TraceOptions {
  rootAddressOrTx: string;
  maxHops: number;
  direction: "forward" | "backward" | "both";
  txLimitPerAddress: number;
  dustThresholdSompis: number;
  mimicThresholdLength: number;
}
