import React, { useState, useEffect } from "react";
import { Activity, Lock, Coins, TrendingUp } from "lucide-react";
import Card from "../components/Card";
import LoadingSpinner from "../components/LoadingSpinner";
import api from "../services/api";
import { formatNumber, formatTimeAgo, formatBalance } from "../utils/format";
import type { BlockchainInfo, Block, Transaction } from "../types/blockchain";

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [blockchainInfo, setBlockchainInfo] = useState<BlockchainInfo | null>(
    null
  );
  const [latestBlocks, setLatestBlocks] = useState<Block[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    []
  );

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [infoRes, blocksRes, txRes] = await Promise.all([
          api.blockchain.getInfo(),
          api.blockchain.getBlocks(5),
          api.blockchain.getTransactions(10),
        ]);

        if (infoRes.data.success) setBlockchainInfo(infoRes.data.data!);
        if (blocksRes.data.success)
          setLatestBlocks(blocksRes.data.data!.blocks);
        if (txRes.data.success)
          setRecentTransactions(txRes.data.data!.transactions);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = [
    {
      name: "区块高度",
      value: blockchainInfo?.length
        ? formatNumber(blockchainInfo.length - 1)
        : "0",
      icon: Lock,
      color: "text-blue-600",
    },
    {
      name: "总供应量",
      value: blockchainInfo?.totalSupply
        ? formatBalance(blockchainInfo.totalSupply)
        : "0",
      icon: Coins,
      color: "text-green-600",
    },
    {
      name: "流通供应量",
      value: blockchainInfo?.circulatingSupply
        ? formatBalance(blockchainInfo.circulatingSupply)
        : "0",
      icon: TrendingUp,
      color: "text-purple-600",
    },
    {
      name: "待处理交易",
      value: blockchainInfo?.pendingTransactions
        ? formatNumber(blockchainInfo.pendingTransactions)
        : "0",
      icon: Activity,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Chain Cosmos 区块链浏览器
        </h1>
        <p className="mt-2 text-gray-600">区块链网络状态和最新活动</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="p-0">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Blocks */}
        <Card title="最新区块">
          <div className="space-y-3">
            {latestBlocks.map((block) => (
              <div
                key={block.hash}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    区块 #{block.height}
                  </div>
                  <div className="text-sm text-gray-600">
                    {block.transactions.length} 笔交易
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    {formatTimeAgo(block.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Transactions */}
        <Card title="最近交易">
          <div className="space-y-3">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        tx.type === "transfer"
                          ? "bg-blue-100 text-blue-800"
                          : tx.type === "mint"
                          ? "bg-green-100 text-green-800"
                          : tx.type === "mine"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {tx.type === "transfer"
                        ? "转账"
                        : tx.type === "mint"
                        ? "铸造"
                        : tx.type === "mine"
                        ? "挖矿"
                        : tx.type}
                    </span>
                    <div className="text-sm font-medium text-gray-900">
                      {formatBalance(tx.amount || 0)} COSMO
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {tx.fromAddress
                      ? `${tx.fromAddress.slice(0, 10)}...`
                      : "创世区块"}{" "}
                    →{" "}
                    {tx.toAddress ? `${tx.toAddress.slice(0, 10)}...` : "销毁"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    {formatTimeAgo(tx.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Token Info */}
      {blockchainInfo?.token && (
        <Card title="代币信息">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <div className="text-sm font-medium text-gray-500">名称</div>
              <div className="text-lg font-semibold text-gray-900">
                {blockchainInfo.token.name}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">符号</div>
              <div className="text-lg font-semibold text-gray-900">
                {blockchainInfo.token.symbol}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">
                供应量比例
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {(
                  (blockchainInfo.circulatingSupply /
                    blockchainInfo.totalSupply) *
                  100
                ).toFixed(2)}
                %
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
