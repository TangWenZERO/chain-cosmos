import React, { useState, useEffect } from "react";
import { Hash } from "lucide-react";
import Card from "../components/Card";
import LoadingSpinner from "../components/LoadingSpinner";
import api from "../services/api";
import { formatHash, formatTimeAgo, formatNumber } from "../utils/format";
import type { Block } from "../types/blockchain";

const Blocks: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    fetchBlocks(0);
  }, []);

  const fetchBlocks = async (newOffset: number) => {
    try {
      setLoading(true);
      const response = await api.blockchain.getBlocks(20, newOffset);

      if (response.data.success && response.data.data) {
        if (newOffset === 0) {
          setBlocks(response.data.data.blocks);
        } else {
          setBlocks((prev) => [...prev, ...response.data.data!.blocks]);
        }
        setHasMore(response.data.data.hasMore);
        setOffset(newOffset + 20);
      }
    } catch (error) {
      console.error("Failed to fetch blocks:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchBlocks(offset);
    }
  };

  if (loading && blocks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">区块</h1>
        <p className="mt-2 text-gray-600">浏览 Chain Cosmos 区块链上的区块</p>
      </div>

      <div className="space-y-4">
        {blocks.map((block) => (
          <Card key={block.hash} className="p-0">
            <div className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Hash className="w-5 h-5 text-primary-600" />
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-medium text-gray-900">
                      区块 #{block.height}
                    </div>
                    <div className="text-sm text-gray-600">
                      哈希: {formatHash(block.hash)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900">
                        {block.transactions.length}
                      </div>
                      <div className="text-xs text-gray-500">交易</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900">
                        {formatTimeAgo(block.timestamp)}
                      </div>
                      <div className="text-xs text-gray-500">时间</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Block Details */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">前一个哈希:</span>
                    <div className="font-mono text-xs break-all">
                      {formatHash(block.previousHash)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">随机数:</span>
                    <div>{formatNumber(block.nonce || 0)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">时间戳:</span>
                    <div>
                      {new Date(block.timestamp)?.toLocaleString() || "0"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Transactions */}
              {block.transactions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    交易 ({block.transactions.length})
                  </h4>
                  <div className="space-y-2">
                    {block.transactions.map((tx) => (
                      <div key={tx.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
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
                              {formatNumber(tx.amount || 0)} COSMO
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div>从: {tx.fromAddress || "创世区块"}</div>
                          <div>到: {tx.toAddress || "销毁"}</div>
                          <div className="font-mono">
                            ID: {formatHash(tx.id)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {hasMore && (
        <div className="text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
            加载更多区块
          </button>
        </div>
      )}
    </div>
  );
};

export default Blocks;
