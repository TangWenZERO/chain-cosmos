import React, { useState, useEffect } from "react";
import { 
  Coins, 
  TrendingUp, 
  Users, 
  Activity,
  Plus,
  Minus,
  BarChart2
} from "lucide-react";
import Card from "../components/Card";
import LoadingSpinner from "../components/LoadingSpinner";
import api from "../services/api";
import { formatAddress, formatBalance, formatNumber } from "../utils/format";
import type { TokenInfo, Wallet } from "../types/blockchain";

const Tokens: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [holders, setHolders] = useState<any[]>([]);
  const [topHolders, setTopHolders] = useState<any[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState("");
  const [amount, setAmount] = useState("");
  const [operation, setOperation] = useState<"mint" | "burn">("mint");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchTokenData();
    fetchWallets();
  }, []);

  const fetchTokenData = async () => {
    try {
      setLoading(true);
      const [infoRes, statsRes] = await Promise.all([
        api.token.getTokenInfo(),
        api.token.getStats()
      ]);

      if (infoRes.data.success && infoRes.data.data) {
        setTokenInfo(infoRes.data.data);
      }

      if (statsRes.data.success && statsRes.data.data) {
        setHolders(statsRes.data.data.topHolders || []);
        setTopHolders(statsRes.data.data.topHolders?.slice(0, 5) || []);
      }
    } catch (error: any) {
      console.error("Failed to fetch token data:", error);
      if (typeof window !== 'undefined' && (window as any).showToast) {
        (window as any).showToast(`获取代币数据失败: ${error.message}`, 'error');
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

  const handleOperation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWallet || !amount) return;

    try {
      setProcessing(true);
      let response;
      
      if (operation === "mint") {
        response = await api.token.mintTokens(selectedWallet, parseFloat(amount));
      } else {
        response = await api.token.burnTokens(selectedWallet, parseFloat(amount));
      }

      if (response.data.success) {
        await fetchTokenData();
        setSelectedWallet("");
        setAmount("");
        if (typeof window !== 'undefined' && (window as any).showToast) {
          (window as any).showToast(
            operation === "mint" ? "代币铸造成功" : "代币销毁成功", 
            'success'
          );
        }
      } else {
        if (typeof window !== 'undefined' && (window as any).showToast) {
          (window as any).showToast(response.data.message || "操作失败", 'error');
        }
      }
    } catch (error: any) {
      console.error("Operation failed:", error);
      if (typeof window !== 'undefined' && (window as any).showToast) {
        (window as any).showToast(`操作失败: ${error.message}`, 'error');
      }
    } finally {
      setProcessing(false);
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">代币</h1>
        <p className="mt-2 text-gray-600">管理 {tokenInfo?.name} ({tokenInfo?.symbol}) 代币</p>
      </div>

      {/* 代币概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-0">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Coins className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">代币名称</dt>
                <dd className="text-lg font-medium text-gray-900">{tokenInfo?.name}</dd>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-0">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">总供应量</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {formatNumber(tokenInfo?.totalSupply || 0)} {tokenInfo?.symbol}
                </dd>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-0">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">流通量</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {formatNumber(tokenInfo?.circulatingSupply || 0)} {tokenInfo?.symbol}
                </dd>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-0">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">持有者</dt>
                <dd className="text-lg font-medium text-gray-900">{formatNumber(holders.length)}</dd>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 操作面板 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="代币操作" className="lg:col-span-1">
          <form onSubmit={handleOperation} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">操作类型</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <button
                  type="button"
                  onClick={() => setOperation("mint")}
                  className={`flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-l-md border ${
                    operation === "mint"
                      ? "bg-primary-600 text-white border-primary-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  铸造
                </button>
                <button
                  type="button"
                  onClick={() => setOperation("burn")}
                  className={`flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-r-md border ${
                    operation === "burn"
                      ? "bg-red-600 text-white border-red-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <Minus className="w-4 h-4 mr-2" />
                  销毁
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">钱包地址</label>
              <select
                value={selectedWallet}
                onChange={(e) => setSelectedWallet(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                required
              >
                <option value="">选择钱包</option>
                {wallets.map((wallet) => (
                  <option key={wallet.address} value={wallet.address}>
                    {formatAddress(wallet.address)} (余额: {formatBalance(wallet.balance || 0)} {tokenInfo?.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">数量</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="输入数量"
                min="0"
                step="0.01"
                required
              />
            </div>

            <button
              type="submit"
              disabled={processing || !selectedWallet || !amount}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {processing ? <LoadingSpinner size="sm" className="mr-2" /> : null}
              {operation === "mint" ? "铸造代币" : "销毁代币"}
            </button>
          </form>
        </Card>

        {/* 持有者统计 */}
        <Card title="主要持有者" className="lg:col-span-2">
          {topHolders.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">暂无持有者</h3>
              <p className="mt-1 text-sm text-gray-500">还没有钱包持有代币</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      地址
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      余额
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      占比
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topHolders.map((holder, index) => (
                    <tr key={holder.address} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatAddress(holder.address)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatBalance(holder.balance)} {tokenInfo?.symbol}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tokenInfo && tokenInfo.circulatingSupply && tokenInfo.circulatingSupply > 0
                          ? `${((holder.balance / tokenInfo.circulatingSupply) * 100).toFixed(2)}%`
                          : '0%'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* 持有者列表 */}
      <Card title={`所有持有者 (${holders.length})`}>
        {holders.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">暂无持有者</h3>
            <p className="mt-1 text-sm text-gray-500">还没有钱包持有代币</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    地址
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    余额
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    占比
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {holders.map((holder, index) => (
                  <tr key={holder.address} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatAddress(holder.address)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatBalance(holder.balance)} {tokenInfo?.symbol}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tokenInfo && tokenInfo.circulatingSupply && tokenInfo.circulatingSupply > 0
                        ? `${((holder.balance / tokenInfo.circulatingSupply) * 100).toFixed(2)}%`
                        : '0%'}
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

export default Tokens;