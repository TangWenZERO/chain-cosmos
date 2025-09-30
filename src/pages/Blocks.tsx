import React, { useState, useEffect } from "react";
import { Search, Hash, Clock, Database } from "lucide-react";
import Card from "../components/Card";
import LoadingSpinner from "../components/LoadingSpinner";
import api from "../services/api";
import { formatAddress, formatNumber, formatTimeAgo } from "../utils/format";
import type { Block } from "../types/blockchain";

const Blocks: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [filteredBlocks, setFilteredBlocks] = useState<Block[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchBlocks();
  }, []);

  useEffect(() => {
    filterBlocks();
  }, [blocks, searchTerm]);

  const fetchBlocks = async (loadMore = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await api.blockchain.getBlocks(10, loadMore ? offset : 0);
      
      if (response.data.success && response.data.data) {
        const blockData = response.data.data; // 创建一个中间变量确保类型安全
        if (loadMore) {
          setBlocks(prev => [...prev, ...blockData.blocks]);
          setOffset(prev => prev + 10);
          setHasMore(blockData.hasMore);
        } else {
          setBlocks(blockData.blocks);
          setOffset(10);
          setHasMore(blockData.hasMore);
        }
      }
    } catch (error: any) {
      console.error("Failed to fetch blocks:", error);
      if (typeof window !== 'undefined' && (window as any).showToast) {
        (window as any).showToast(`获取区块数据失败: ${error.message}`, 'error');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const filterBlocks = () => {
    let result = blocks;
    
    if (searchTerm) {
      result = result.filter(block => 
        block.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
        block.previousHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
        block.miner?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredBlocks(result);
  };

  const loadMore = () => {
    fetchBlocks(true);
  };

  const fetchBlockDetails = async (hash: string) => {
    try {
      const response = await api.blockchain.getBlockByHash(hash);
      if (response.data.success && response.data.data) {
        // 这里可以处理区块详情，例如打开模态框显示详细信息
        console.log("Block details:", response.data.data);
      }
    } catch (error: any) {
      console.error("Failed to fetch block details:", error);
      if (typeof window !== 'undefined' && (window as any).showToast) {
        (window as any).showToast(`获取区块详情失败: ${error.message}`, 'error');
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">区块</h1>
        <p className="mt-2 text-gray-600">浏览区块链上的区块信息</p>
      </div>

      {/* 搜索框 */}
      <Card className="p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="搜索区块哈希或矿工地址..."
          />
        </div>
      </Card>

      {/* 区块列表 */}
      <Card title={`区块列表 (${filteredBlocks.length})`}>
        {filteredBlocks.length === 0 ? (
          <div className="text-center py-8">
            <Database className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">未找到区块</h3>
            <p className="mt-1 text-sm text-gray-500">尝试调整搜索条件</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    区块哈希
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    高度
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    交易数
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    矿工
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    时间戳
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBlocks.map((block) => (
                  <tr 
                    key={block.hash} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => fetchBlockDetails(block.hash)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="font-mono text-xs">{formatAddress(block.hash, 8)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {block.index !== undefined ? formatNumber(block.index) : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {block.transactions?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {block.miner ? formatAddress(block.miner) : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTimeAgo(block.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {hasMore && !searchTerm && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loadingMore ? <LoadingSpinner size="sm" className="mr-2" /> : null}
              {loadingMore ? "加载中..." : "加载更多"}
            </button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Blocks;