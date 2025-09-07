import React, { useState, useEffect } from "react";
import { Search, Filter, Send, Plus } from "lucide-react";
import Card from "../components/Card";
import LoadingSpinner from "../components/LoadingSpinner";
import api from "../services/api";
import { formatAddress, formatBalance, formatTimeAgo, formatTransactionType } from "../utils/format";
import type { Transaction, Wallet } from "../types/blockchain";

const Transactions: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [transactionType, setTransactionType] = useState("all");
  
  // 转账相关状态
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState("");

  useEffect(() => {
    fetchTransactions();
    fetchWallets();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, transactionType]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.blockchain.getTransactions(50);
      
      if (response.data.success && response.data.data) {
        setTransactions(response.data.data.transactions);
        setFilteredTransactions(response.data.data.transactions);
      }
    } catch (error: any) {
      console.error("Failed to fetch transactions:", error);
      if (typeof window !== 'undefined' && (window as any).showToast) {
        (window as any).showToast(`获取交易列表失败: ${error.message}`, 'error');
      }
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
    } catch (error: any) {
      console.error("Failed to fetch wallets:", error);
      if (typeof window !== 'undefined' && (window as any).showToast) {
        (window as any).showToast(`获取钱包列表失败: ${error.message}`, 'error');
      }
    }
  };

  const filterTransactions = () => {
    let result = transactions;
    
    // 根据搜索词过滤
    if (searchTerm) {
      result = result.filter(tx => 
        tx.fromAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.toAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // 根据交易类型过滤
    if (transactionType !== "all") {
      result = result.filter(tx => tx.type === transactionType);
    }
    
    setFilteredTransactions(result);
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromAddress || !toAddress || !amount) return;
    
    try {
      setTransferLoading(true);
      setTransferError("");
      
      const response = await api.transfer.createTransfer(
        fromAddress,
        toAddress,
        parseFloat(amount)
      );
      
      if (response.data.success) {
        // 重置表单
        setFromAddress("");
        setToAddress("");
        setAmount("");
        setShowTransferForm(false);
        // 重新获取交易列表
        await fetchTransactions();
        if (typeof window !== 'undefined' && (window as any).showToast) {
          (window as any).showToast('转账成功', 'success');
        }
      } else {
        setTransferError(response.data.message || "转账失败");
        if (typeof window !== 'undefined' && (window as any).showToast) {
          (window as any).showToast(response.data.message || "转账失败", 'error');
        }
      }
    } catch (error: any) {
      setTransferError(error.message || "转账失败");
      if (typeof window !== 'undefined' && (window as any).showToast) {
        (window as any).showToast(`转账失败: ${error.message}`, 'error');
      }
    } finally {
      setTransferLoading(false);
    }
  };

  if (loading) {
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
          <p className="mt-2 text-gray-600">浏览区块链上的交易记录</p>
        </div>
        <button
          onClick={() => setShowTransferForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Send className="w-4 h-4 mr-2" />
          发起转账
        </button>
      </div>

      {/* 转账表单模态框 */}
      {showTransferForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">发起转账</h3>
              <button
                onClick={() => {
                  setShowTransferForm(false);
                  setTransferError("");
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">发送方钱包</label>
                <select
                  value={fromAddress}
                  onChange={(e) => setFromAddress(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  required
                >
                  <option value="">选择发送方钱包</option>
                  {wallets.map((wallet) => (
                    <option key={wallet.address} value={wallet.address}>
                      {formatAddress(wallet.address)} (余额: {formatBalance(wallet.balance || 0)} COSMO)
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">接收方地址</label>
                <input
                  type="text"
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="输入接收方钱包地址"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">转账金额</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="输入转账金额"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              {transferError && (
                <div className="text-red-500 text-sm">{transferError}</div>
              )}
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowTransferForm(false);
                    setTransferError("");
                  }}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={transferLoading || !fromAddress || !toAddress || !amount}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {transferLoading ? <LoadingSpinner size="sm" className="mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                  确认转账
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* 搜索和过滤 */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="搜索地址或交易ID..."
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-400 mr-2" />
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="all">所有类型</option>
                <option value="transfer">转账</option>
                <option value="mint">铸造</option>
                <option value="burn">销毁</option>
                <option value="mine">挖矿奖励</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* 交易列表 */}
      <Card title={`交易记录 (${filteredTransactions.length})`}>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <Search className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">未找到交易</h3>
            <p className="mt-1 text-sm text-gray-500">尝试调整搜索条件</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    交易ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    类型
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    发送方
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    接收方
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    金额
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    时间
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="font-mono text-xs">{formatAddress(tx.id, 6)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        tx.type === "transfer"
                          ? "bg-blue-100 text-blue-800"
                          : tx.type === "mint"
                          ? "bg-green-100 text-green-800"
                          : tx.type === "burn"
                          ? "bg-red-100 text-red-800"
                          : "bg-purple-100 text-purple-800"
                      }`}>
                        {formatTransactionType(tx.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tx.fromAddress ? formatAddress(tx.fromAddress) : "系统"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tx.toAddress ? formatAddress(tx.toAddress) : "销毁"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatBalance(tx.amount || 0)} COSMO
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTimeAgo(tx.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Transactions;