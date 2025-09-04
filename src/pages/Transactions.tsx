import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Clock, Filter } from 'lucide-react';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import { formatHash, formatTimeAgo, formatBalance } from '../utils/format';
import type { Transaction } from '../types/blockchain';

const Transactions: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [showCreateTransfer, setShowCreateTransfer] = useState(false);
  const [wallets, setWallets] = useState<any[]>([]);

  // Transfer form state
  const [transferForm, setTransferForm] = useState({
    fromAddress: '',
    toAddress: '',
    amount: ''
  });
  const [transferLoading, setTransferLoading] = useState(false);

  useEffect(() => {
    fetchTransactionsData();
    fetchWallets();
    const interval = setInterval(fetchTransactionsData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [filterType]);

  const fetchTransactionsData = async () => {
    try {
      setLoading(true);
      const [txRes, pendingRes] = await Promise.all([
        api.blockchain.getTransactions(50, filterType === 'all' ? undefined : filterType),
        api.blockchain.getPendingTransactions()
      ]);

      if (txRes.data.success && txRes.data.data) {
        setTransactions(txRes.data.data.transactions);
      }
      
      if (pendingRes.data.success && pendingRes.data.data) {
        setPendingTransactions(pendingRes.data.data.transactions);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWallets = async () => {
    try {
      const response = await api.wallet.getAllWallets();
      if (response.data.success && response.data.data) {
        setWallets(response.data.data.wallets);
      }
    } catch (error) {
      console.error('Failed to fetch wallets:', error);
    }
  };

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferForm.fromAddress || !transferForm.toAddress || !transferForm.amount) {
      alert('请填写所有字段');
      return;
    }

    try {
      setTransferLoading(true);
      const response = await api.transfer.createTransfer(
        transferForm.fromAddress,
        transferForm.toAddress,
        parseFloat(transferForm.amount)
      );

      if (response.data.success) {
        alert(`转账成功！交易ID: ${response.data.data?.transaction?.id}`);
        setTransferForm({ fromAddress: '', toAddress: '', amount: '' });
        setShowCreateTransfer(false);
        fetchTransactionsData(); // Refresh data
      }
    } catch (error: any) {
      alert(`转账失败: ${error.response?.data?.error || error.message}`);
    } finally {
      setTransferLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'transfer':
        return <ArrowUpRight className="w-4 h-4" />;
      case 'mint':
        return <ArrowDownRight className="w-4 h-4" />;
      case 'mine':
        return <Clock className="w-4 h-4" />;
      default:
        return <ArrowUpRight className="w-4 h-4" />;
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'transfer':
        return 'bg-blue-100 text-blue-800';
      case 'mint':
        return 'bg-green-100 text-green-800';
      case 'mine':
        return 'bg-purple-100 text-purple-800';
      case 'burn':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransactionTypeName = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'transfer': '转账',
      'mint': '铸造',
      'mine': '挖矿',
      'burn': '销毁'
    };
    return typeMap[type] || type;
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">交易</h1>
          <p className="mt-2 text-gray-600">浏览 Chain Cosmos 区块链上的所有交易</p>
        </div>
        <button
          onClick={() => setShowCreateTransfer(!showCreateTransfer)}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          {showCreateTransfer ? '取消' : '创建转账'}
        </button>
      </div>

      {/* Create Transfer Form */}
      {showCreateTransfer && (
        <Card title="创建转账">
          <form onSubmit={handleCreateTransfer} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">发送方地址</label>
              <select
                value={transferForm.fromAddress}
                onChange={(e) => setTransferForm(prev => ({ ...prev, fromAddress: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">选择钱包地址</option>
                {wallets.map(wallet => (
                  <option key={wallet.address} value={wallet.address}>
                    {wallet.address} (余额: {formatBalance(wallet.balance || 0)} COSMO)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">接收方地址</label>
              <select
                value={transferForm.toAddress}
                onChange={(e) => setTransferForm(prev => ({ ...prev, toAddress: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">选择钱包地址</option>
                {wallets.map(wallet => (
                  <option key={wallet.address} value={wallet.address}>
                    {wallet.address} (余额: {formatBalance(wallet.balance || 0)} COSMO)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">金额 (COSMO)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={transferForm.amount}
                onChange={(e) => setTransferForm(prev => ({ ...prev, amount: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="输入转账金额"
                required
              />
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={transferLoading}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {transferLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                {transferLoading ? '处理中...' : '创建转账'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateTransfer(false)}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                取消
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Filter */}
      <div className="flex items-center space-x-4">
        <Filter className="w-5 h-5 text-gray-400" />
        <div className="flex space-x-2">
          {['all', 'transfer', 'mint', 'mine', 'burn'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 text-sm font-medium rounded-full ${
                filterType === type
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type === 'all' ? '全部' : getTransactionTypeName(type)}
            </button>
          ))}
        </div>
      </div>

      {/* Pending Transactions */}
      {pendingTransactions.length > 0 && (
        <Card title={`待处理交易 (${pendingTransactions.length})`}>
          <div className="space-y-3">
            {pendingTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      {getTransactionIcon(tx.type)}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTransactionTypeColor(tx.type)}`}>
                        {getTransactionTypeName(tx.type)}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatBalance(tx.amount || 0)} COSMO
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      从: {tx.fromAddress || '创世区块'} → 到: {tx.toAddress || '销毁'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-yellow-600 font-medium">待处理</div>
                  <div className="text-xs text-gray-500">{formatTimeAgo(tx.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Confirmed Transactions */}
      <Card title="已确认交易">
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    {getTransactionIcon(tx.type)}
                  </div>
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTransactionTypeColor(tx.type)}`}>
                      {getTransactionTypeName(tx.type)}
                    </span>
                    <div className="text-lg font-semibold text-gray-900">
                      {formatBalance(tx.amount || 0)} COSMO
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>从: {tx.fromAddress || '创世区块'}</div>
                    <div>到: {tx.toAddress || '销毁'}</div>
                    <div className="font-mono text-xs">ID: {formatHash(tx.id)}</div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-green-600 font-medium">已确认</div>
                <div className="text-sm text-gray-500">{formatTimeAgo(tx.timestamp)}</div>
                <div className="text-xs text-gray-400">{new Date(tx.timestamp).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {transactions.length === 0 && !loading && (
        <div className="text-center py-12">
          <Clock className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">暂无交易</h3>
          <p className="mt-1 text-sm text-gray-500">还没有任何交易记录</p>
        </div>
      )}
    </div>
  );
};

export default Transactions;