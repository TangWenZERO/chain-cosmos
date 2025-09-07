import React, { useState, useEffect } from 'react';
import { Wallet as WalletIcon, Plus, Copy, Trash2 } from 'lucide-react';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import { formatAddress, formatBalance } from '../utils/format';
import type { Wallet } from '../types/blockchain';

const Wallets: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const response = await api.wallet.getAllWallets();
      if (response.data.success && response.data.data) {
        setWallets(response.data.data.wallets);
      }
    } catch (error: any) {
      console.error('Failed to fetch wallets:', error);
      if (typeof window !== 'undefined' && (window as any).showToast) {
        (window as any).showToast(`获取钱包列表失败: ${error.message}`, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const createWallet = async () => {
    try {
      setCreating(true);
      const response = await api.wallet.createWallet();
      if (response.data.success) {
        await fetchWallets(); // Refresh the list
        if (typeof window !== 'undefined' && (window as any).showToast) {
          (window as any).showToast('钱包创建成功', 'success');
        }
      }
    } catch (error: any) {
      console.error('Failed to create wallet:', error);
      if (typeof window !== 'undefined' && (window as any).showToast) {
        (window as any).showToast(`创建钱包失败: ${error.message}`, 'error');
      }
    } finally {
      setCreating(false);
    }
  };

  const deleteWallet = async (address: string) => {
    try {
      setDeleting(address);
      const response = await api.wallet.deleteWallet(address);
      if (response.data.success) {
        await fetchWallets(); // Refresh the list
        if (typeof window !== 'undefined' && (window as any).showToast) {
          (window as any).showToast('钱包删除成功', 'success');
        }
      }
    } catch (error: any) {
      console.error('Failed to delete wallet:', error);
      if (typeof window !== 'undefined' && (window as any).showToast) {
        (window as any).showToast(`删除钱包失败: ${error.message}`, 'error');
      }
    } finally {
      setDeleting(null);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (typeof window !== 'undefined' && (window as any).showToast) {
        (window as any).showToast('地址已复制到剪贴板', 'success');
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      if (typeof window !== 'undefined' && (window as any).showToast) {
        (window as any).showToast('复制地址失败', 'error');
      }
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
          <h1 className="text-3xl font-bold text-gray-900">钱包</h1>
          <p className="mt-2 text-gray-600">
            管理您的区块链钱包并查看余额
          </p>
        </div>
        <button
          onClick={createWallet}
          disabled={creating}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {creating ? (
            <LoadingSpinner size="sm" className="mr-2" />
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}
          创建钱包
        </button>
      </div>

      {wallets.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <WalletIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">暂无钱包</h3>
            <p className="mt-1 text-sm text-gray-500">
              开始创建一个新钱包吧。
            </p>
            <div className="mt-6">
              <button
                onClick={createWallet}
                disabled={creating}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                创建钱包
              </button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wallets.map((wallet) => (
            <Card key={wallet.id} className="p-0">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <WalletIcon className="w-5 h-5 text-primary-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-lg font-medium text-gray-900">
                      钱包
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatAddress(wallet.address)}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteWallet(wallet.address)}
                    disabled={deleting === wallet.address}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 disabled:opacity-50"
                    title="删除钱包"
                  >
                    {deleting === wallet.address ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-gray-500">地址</div>
                    <div className="flex items-center space-x-2">
                      <div className="text-sm font-mono text-gray-900 break-all">
                        {wallet.address}
                      </div>
                      <button
                        onClick={() => copyToClipboard(wallet.address)}
                        className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-500"
                        title="复制地址"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-500">余额</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {wallet.balance !== undefined ? formatBalance(wallet.balance) : '0'} COSMO
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-500">公钥</div>
                    <div className="text-sm font-mono text-gray-900 break-all">
                      {formatAddress(wallet.publicKey, 16)}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wallets;