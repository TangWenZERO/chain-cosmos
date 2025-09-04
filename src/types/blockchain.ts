export interface Transaction {
  id: string;
  fromAddress: string | null;
  toAddress: string | null;
  amount: number;
  type: 'transfer' | 'mint' | 'burn' | 'mine';
  timestamp: number;
  signature: string | null;
  date?: string;
}

export interface Block {
  timestamp: number;
  transactions: Transaction[];
  previousHash: string;
  nonce: number;
  hash: string;
  height?: number;
  confirmations?: number;
}

export interface BlockchainInfo {
  length: number;
  difficulty: number;
  totalSupply: number;
  circulatingSupply: number;
  pendingTransactions: number;
  isValid?: boolean;
  token?: TokenInfo;
}

export interface TokenInfo {
  name: string;
  symbol: string;
  totalSupply: number;
  circulatingSupply: number;
  decimal: number;
}

export interface Wallet {
  id: string;
  address: string;
  publicKey: string;
  balance?: number;
}

export interface Miner {
  address: string;
  name: string;
  registeredAt: number;
  blocksMinedCount: number;
  totalRewards: number;
  isActive: boolean;
  blocksFound?: number;
  totalHashrate?: number;
  lastBlockTime?: number;
  averageBlockTime?: number;
  totalMiningTime?: number;
  currentBalance?: number;
}

export interface MiningStatus {
  isMining: boolean;
  currentMiner: string | null;
  miningStartTime: number | null;
  difficulty: number;
  pendingTransactions: number;
  miningReward: number;
  estimatedTimeToBlock: number | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}