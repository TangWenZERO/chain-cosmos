import React, { useState, useEffect } from "react";
import { 
  Hammer, 
  User, 
  Clock, 
  Zap, 
  BarChart3, 
  Play, 
  Square, 
  Plus,
  Trophy,
  Hash,
  Coins
} from "lucide-react";
import Card from "../components/Card";
import LoadingSpinner from "../components/LoadingSpinner";
import api from "../services/api";
import { formatAddress, formatNumber, formatTimeAgo } from "../utils/format";
import type { Miner, MiningStatus, Wallet } from "../types/blockchain";

const Mining: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [miners, setMiners] = useState<Miner[]>([]);
  const [miningStatus, setMiningStatus] = useState<MiningStatus | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedRegisterMiner, setSelectedRegisterMiner] = useState<string>("");
  const [selectedMiningMiner, setSelectedMiningMiner] = useState<string>("");
  const [minerName, setMinerName] = useState("");
  const [registering, setRegistering] = useState(false);
  const [mining, setMining] = useState(false);

  useEffect(() => {
    fetchMiningData();
    fetchWallets();
  }, []);

  const fetchMiningData = async () => {
    try {
      setLoading(true);
      const [minersRes, statusRes] = await Promise.all([
        api.mining.getMiners(),
        api.mining.getMiningStatus()
      ]);

      if (minersRes.data.success && minersRes.data.data) {
        setMiners(minersRes.data.data.miners);
      }

      if (statusRes.data.success && statusRes.data.data) {
        setMiningStatus(statusRes.data.data);
      }
    } catch (error: any) {
      console.error("Failed to fetch mining data:", error);
      if (typeof window !== 'undefined' && (window as any).showToast) {
        (window as any).showToast(`获取挖矿数据失败: ${error.message}`, 'error');
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

  const handleRegisterMiner = async () => {
    if (!selectedRegisterMiner || !minerName) return;
    
    try {
      setRegistering(true);
      const response = await api.mining.registerMiner(selectedRegisterMiner, minerName);
      if (response.data.success) {
        await fetchMiningData();
        setSelectedRegisterMiner("");
        setMinerName("");
        if (typeof window !== 'undefined' && (window as any).showToast) {
          (window as any).showToast('矿工注册成功', 'success');
        }
      } else {
        if (typeof window !== 'undefined' && (window as any).showToast) {
          (window as any).showToast(response.data.message || "矿工注册失败", 'error');
        }
      }
    } catch (error: any) {
      console.error("Failed to register miner:", error);
      if (typeof window !== 'undefined' && (window as any).showToast) {
        (window as any).showToast(`矿工注册失败: ${error.message}`, 'error');
      }
    } finally {
      setRegistering(false);
    }
  };

  const handleStartMining = async () => {
    if (!selectedMiningMiner) return;
    
    try {
      setMining(true);
      const response = await api.mining.startMining(selectedMiningMiner);
      if (response.data.success) {
        await fetchMiningData();
        if (typeof window !== 'undefined' && (window as any).showToast) {
          (window as any).showToast('开始挖矿成功', 'success');
        }
      } else {
        if (typeof window !== 'undefined' && (window as any).showToast) {
          (window as any).showToast(response.data.message || "开始挖矿失败", 'error');
        }
      }
    } catch (error: any) {
      console.error("Failed to start mining:", error);
      if (typeof window !== 'undefined' && (window as any).showToast) {
        (window as any).showToast(`开始挖矿失败: ${error.message}`, 'error');
      }
    } finally {
      setMining(false);
    }
  };

  const handleStopMining = async () => {
    if (!miningStatus?.currentMiner) return;
    
    try {
      setMining(true);
      const response = await api.mining.stopMining(miningStatus.currentMiner);
      if (response.data.success) {
        await fetchMiningData();
        if (typeof window !== 'undefined' && (window as any).showToast) {
          (window as any).showToast('停止挖矿成功', 'success');
        }
      } else {
        if (typeof window !== 'undefined' && (window as any).showToast) {
          (window as any).showToast(response.data.message || "停止挖矿失败", 'error');
        }
      }
    } catch (error: any) {
      console.error("Failed to stop mining:", error);
      if (typeof window !== 'undefined' && (window as any).showToast) {
        (window as any).showToast(`停止挖矿失败: ${error.message}`, 'error');
      }
    } finally {
      setMining(false);
    }
  };

  // 获取未注册的矿工钱包地址
  const getUnregisteredWallets = (): Wallet[] => {
    const registeredAddresses = new Set(miners.map(miner => miner.address));
    return wallets.filter(wallet => !registeredAddresses.has(wallet.address));
  };

  // 获取已注册的矿工
  const getRegisteredMiners = (): Miner[] => {
    return miners;
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
        <h1 className="text-3xl font-bold text-gray-900">挖矿</h1>
        <p className="mt-2 text-gray-600">管理矿工和挖矿操作</p>
      </div>

      {/* 挖矿状态卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-0">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Hammer className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">挖矿状态</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {miningStatus?.isMining ? "进行中" : "已停止"}
                </dd>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-0">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Zap className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">当前矿工</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {miningStatus?.currentMiner ? formatAddress(miningStatus.currentMiner) : "无"}
                </dd>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-0">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">待处理交易</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {miningStatus?.pendingTransactions || 0}
                </dd>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-0">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Coins className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">挖矿奖励</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {miningStatus?.miningReward || 100} COSMO
                </dd>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 操作面板 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 注册矿工 */}
        <Card title="注册矿工" className="lg:col-span-1">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">钱包地址</label>
              <select
                value={selectedRegisterMiner}
                onChange={(e) => setSelectedRegisterMiner(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="">选择未注册的钱包</option>
                {getUnregisteredWallets().map((wallet: Wallet) => (
                  <option key={wallet.address} value={wallet.address}>
                    {formatAddress(wallet.address)} (余额: {formatNumber(wallet.balance || 0)} COSMO)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">矿工名称</label>
              <input
                type="text"
                value={minerName}
                onChange={(e) => setMinerName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="输入矿工名称"
              />
            </div>

            <button
              onClick={handleRegisterMiner}
              disabled={registering || !selectedRegisterMiner || !minerName}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {registering ? <LoadingSpinner size="sm" className="mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              注册矿工
            </button>
          </div>
        </Card>

        {/* 挖矿控制 */}
        <Card title="挖矿控制" className="lg:col-span-1">
          <div className="space-y-4">
            {!miningStatus?.isMining ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">选择矿工</label>
                  <select
                    value={selectedMiningMiner}
                    onChange={(e) => setSelectedMiningMiner(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  >
                    <option value="">选择已注册的矿工</option>
                    {getRegisteredMiners().map((miner: Miner) => (
                      <option key={miner.address} value={miner.address}>
                        {miner.name} ({formatAddress(miner.address)})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">开始挖矿</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      选择一个已注册的矿工开始挖矿过程
                    </p>
                  </div>
                  <button
                    onClick={handleStartMining}
                    disabled={mining || !selectedMiningMiner}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {mining ? <LoadingSpinner size="sm" className="mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    开始挖矿
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">停止挖矿</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    当前正在挖矿中，请点击按钮停止挖矿
                  </p>
                </div>
                <button
                  onClick={handleStopMining}
                  disabled={mining}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {mining ? <LoadingSpinner size="sm" className="mr-2" /> : <Square className="w-4 h-4 mr-2" />}
                  停止挖矿
                </button>
              </div>
            )}

            {miningStatus?.isMining && miningStatus.miningStartTime && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">挖矿进行中</h3>
                    <div className="mt-1 text-sm text-blue-700">
                      <p>
                        矿工 {formatAddress(miningStatus.currentMiner || "")} 正在挖矿，开始时间:{" "}
                        {formatTimeAgo(miningStatus.miningStartTime)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* 矿工列表 */}
      <Card title="已注册矿工">
        {miners.length === 0 ? (
          <div className="text-center py-8">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">暂无矿工</h3>
            <p className="mt-1 text-sm text-gray-500">注册第一个矿工开始挖矿之旅</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {miners.map((miner) => (
              <div
                key={miner.address}
                className={`p-4 rounded-lg border ${
                  (selectedRegisterMiner === miner.address || selectedMiningMiner === miner.address)
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary-600" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">{miner.name}</h3>
                      <p className="text-xs text-gray-500">{formatAddress(miner.address)}</p>
                    </div>
                  </div>
                  {miner.isActive && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      挖矿中
                    </span>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">挖出区块</p>
                    <p className="text-sm font-medium text-gray-900">{miner.blocksMinedCount}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">总奖励</p>
                    <p className="text-sm font-medium text-gray-900">{formatNumber(miner.totalRewards)} COSMO</p>
                  </div>
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  注册时间: {formatTimeAgo(miner.registeredAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Mining;