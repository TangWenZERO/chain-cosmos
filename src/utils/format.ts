export const formatAddress = (address: string, length = 8): string => {
  if (!address) return "";
  if (address.length <= length * 2) return address;
  return `${address.slice(0, length)}...${address.slice(-length)}`;
};

export const formatHash = (hash: string, length = 12): string => {
  if (!hash) return "";
  if (hash.length <= length * 2) return hash;
  return `${hash.slice(0, length)}...${hash.slice(-length)}`;
};

export const formatNumber = (num: number, decimals = 2): string => {
  if (num === 0) return "0";
  if (num < 0.001) return "< 0.001";
  return num?.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
};

export const formatBalance = (balance: number): string => {
  return formatNumber(balance, 6);
};

export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp)?.toLocaleString();
};

export const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} 天前`;
  if (hours > 0) return `${hours} 小时前`;
  if (minutes > 0) return `${minutes} 分钟前`;
  if (seconds > 0) return `${seconds} 秒前`;
  return "刚刚";
};

export const formatTransactionType = (type: string): string => {
  const types = {
    transfer: "转账",
    mint: "铸造",
    burn: "销毁",
    mine: "挖矿奖励",
  };
  return types[type as keyof typeof types] || type;
};
