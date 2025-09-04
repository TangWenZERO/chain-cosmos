import axios from 'axios';
import type { 
  ApiResponse, 
  Block, 
  BlockchainInfo, 
  Transaction, 
  Wallet, 
  TokenInfo,
  Miner,
  MiningStatus 
} from '../types/blockchain';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const blockchainApi = {
  getInfo: () => api.get<ApiResponse<BlockchainInfo>>('/blockchain/info'),
  
  getBlocks: (limit = 10, offset = 0) => 
    api.get<ApiResponse<{ blocks: Block[]; total: number; hasMore: boolean }>>('/blockchain/blocks', {
      params: { limit, offset }
    }),
    
  getBlockByHash: (hash: string) => 
    api.get<ApiResponse<Block>>(`/blockchain/blocks/${hash}`),
    
  getLatestBlock: () => 
    api.get<ApiResponse<Block>>('/blockchain/blocks/latest'),
    
  getTransactions: (limit = 20, type?: string) => 
    api.get<ApiResponse<{ transactions: Transaction[]; total: number }>>('/blockchain/transactions', {
      params: { limit, type }
    }),
    
  getPendingTransactions: () => 
    api.get<ApiResponse<{ transactions: Transaction[]; count: number }>>('/blockchain/transactions/pending'),
};

export const walletApi = {
  createWallet: () => 
    api.post<ApiResponse<{ wallet: Wallet; message: string }>>('/wallets/create'),
    
  getWallet: (address: string) => 
    api.get<ApiResponse<{ wallet: Wallet; balance: number }>>(`/wallets/${address}`),
    
  getAllWallets: () => 
    api.get<ApiResponse<{ wallets: Wallet[]; count: number }>>('/wallets'),
    
  getBalance: (address: string) => 
    api.get<ApiResponse<{ address: string; balance: number }>>(`/wallets/${address}/balance`),
};

export const tokenApi = {
  getTokenInfo: () => 
    api.get<ApiResponse<TokenInfo>>('/tokens/info'),
    
  mintTokens: (toAddress: string, amount: number) => 
    api.post<ApiResponse<{ transaction: Transaction; message: string }>>('/tokens/mint', {
      toAddress,
      amount
    }),
    
  burnTokens: (fromAddress: string, amount: number) => 
    api.post<ApiResponse<{ transaction: Transaction; message: string }>>('/tokens/burn', {
      fromAddress,
      amount
    }),
    
  getBalance: (address: string) => 
    api.get<ApiResponse<{ address: string; balance: number }>>(`/tokens/balance/${address}`),
    
  getHolders: () => 
    api.get<ApiResponse<{ holders: any[]; count: number }>>('/tokens/holders'),
    
  getStats: () => 
    api.get<ApiResponse<{ tokenInfo: TokenInfo; holders: number; topHolders: any[]; averageBalance: string }>>('/tokens/stats'),
};

export const transferApi = {
  createTransfer: (fromAddress: string, toAddress: string, amount: number) => 
    api.post<ApiResponse<{ transaction: Transaction; message: string }>>('/transfers', {
      fromAddress,
      toAddress,
      amount
    }),
    
  getHistory: (address: string) => 
    api.get<ApiResponse<{ transactions: Transaction[]; count: number }>>(`/transfers/${address}/history`),
    
  estimateFee: (fromAddress: string, toAddress: string, amount: number) => 
    api.post<ApiResponse<{ fee: number; total: number }>>('/transfers/estimate-fee', {
      fromAddress,
      toAddress,
      amount
    }),
    
  getPending: () => 
    api.get<ApiResponse<{ transactions: Transaction[]; count: number }>>('/transfers/pending'),
};

export const miningApi = {
  registerMiner: (minerAddress: string, minerName: string) => 
    api.post<ApiResponse<{ miner: Miner; message: string }>>('/mining/register', {
      minerAddress,
      minerName
    }),
    
  startMining: (minerAddress: string) => 
    api.post<ApiResponse<{ message: string; minerAddress: string; pendingTransactions: number; difficulty: number }>>('/mining/start', {
      minerAddress
    }),
    
  stopMining: (minerAddress: string) => 
    api.post<ApiResponse<{ message: string; minerAddress: string }>>('/mining/stop', {
      minerAddress
    }),
    
  getMiningStatus: () => 
    api.get<ApiResponse<MiningStatus>>('/mining/status'),
    
  getMiners: () => 
    api.get<ApiResponse<{ miners: Miner[]; count: number }>>('/mining/miners'),
    
  getMiner: (address: string) => 
    api.get<ApiResponse<Miner>>(`/mining/miners/${address}`),
    
  getMiningStats: () => 
    api.get<ApiResponse<{ totalMiners: number; activeMiners: number; totalBlocksMined: number; totalRewardsDistributed: number; networkHashrate: string; averageBlockTime: string; difficulty: number; lastBlockTime: number; chainLength: number }>>('/mining/stats'),
    
  unregisterMiner: (minerAddress: string) => 
    api.delete<ApiResponse<{ message: string }>>(`/mining/${minerAddress}`),
};

export default {
  blockchain: blockchainApi,
  wallet: walletApi,
  token: tokenApi,
  transfer: transferApi,
  mining: miningApi,
};