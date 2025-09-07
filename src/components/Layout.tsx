import React, { useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import Toast from "./Toast";
import {
  Activity,
  Lock,
  Users,
  PackageOpenIcon,
  Coins,
  Wallet,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

interface ToastType {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [toasts, setToasts] = useState<ToastType[]>([]);

  // 显示提示消息的函数
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    // 3秒后自动移除提示
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  }, []);

  // 移除指定提示的函数
  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // 将showToast函数挂载到window对象上，供全局使用
  React.useEffect(() => {
    (window as any).showToast = showToast;
    return () => {
      delete (window as any).showToast;
    };
  }, [showToast]);

  const navigation = [
    { name: "仪表板", href: "/", icon: Activity },
    { name: "区块", href: "/blocks", icon: Lock },
    { name: "交易", href: "/transactions", icon: Activity },
    { name: "钱包", href: "/wallets", icon: Wallet },
    { name: "挖矿", href: "/mining", icon: PackageOpenIcon },
    { name: "代币", href: "/tokens", icon: Coins },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  Chain Cosmos 区块链浏览器
                </h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`${
                        isActive
                          ? "border-primary-500 text-gray-900"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* 全局提示组件 */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default Layout;