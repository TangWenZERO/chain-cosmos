# Chain Cosmos 区块链浏览器前端

一个基于 React 18 + TypeScript + Vite 构建的现代化区块链浏览器前端应用，用于可视化和管理 Chain Cosmos 区块链网络。

## 📋 项目概述

Chain Cosmos 前端是一个全功能的区块链浏览器应用，提供直观的用户界面来浏览区块链数据、管理钱包和监控网络状态。采用现代化的前端技术栈，提供流畅的用户体验和实时的数据更新。

## 🏗️ 技术架构

### 技术栈
- **React 18** - 现代化的用户界面库
- **TypeScript** - 类型安全的 JavaScript 超集
- **Vite** - 快速的构建工具和开发服务器
- **React Router DOM** - 客户端路由管理
- **Axios** - HTTP 客户端库
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Lucide React** - 现代化图标库
- **PostCSS + Autoprefixer** - CSS 后处理

### 项目结构
```
chain-cosmos/
├── src/
│   ├── components/           # 可复用组件
│   │   ├── Card.tsx         # 卡片容器组件
│   │   ├── Layout.tsx       # 页面布局组件
│   │   └── LoadingSpinner.tsx # 加载动画组件
│   ├── pages/               # 页面组件
│   │   ├── Dashboard.tsx    # 仪表板页面
│   │   ├── Blocks.tsx       # 区块浏览页面
│   │   └── Wallets.tsx      # 钱包管理页面
│   ├── services/            # 服务层
│   │   └── api.ts           # API 调用封装
│   ├── types/               # TypeScript 类型定义
│   │   └── blockchain.ts    # 区块链相关类型
│   ├── utils/               # 工具函数
│   │   └── format.ts        # 数据格式化工具
│   ├── App.tsx              # 主应用组件
│   ├── main.tsx             # 应用入口点
│   └── index.css            # 全局样式
├── public/                  # 静态资源
├── index.html               # HTML 模板
├── package.json             # 项目配置和依赖
├── vite.config.ts           # Vite 构建配置
├── tsconfig.json            # TypeScript 配置
├── tailwind.config.js       # Tailwind CSS 配置
└── postcss.config.js        # PostCSS 配置
```

## ✨ 核心功能

### 🔹 仪表板（Dashboard）
- **实时网络状态监控** - 每 10 秒自动更新区块链数据
- **关键指标展示** - 区块高度、总供应量、流通供应量、待处理交易
- **最新区块列表** - 显示最近 5 个区块的基本信息
- **最近交易活动** - 展示最近 10 笔交易的详细信息
- **代币信息面板** - 显示 CosmoCoin (COSMO) 代币的详细信息

### 🔹 区块浏览（Blocks）
- **分页区块列表** - 支持无限滚动加载更多区块
- **区块详细信息** - 显示区块高度、哈希值、前一个哈希、随机数、时间戳
- **内嵌交易显示** - 在区块详情中直接查看所有包含的交易
- **交易类型分类** - 转账、铸造、挖矿等不同类型的视觉区分
- **响应式布局** - 适配移动端和桌面端

### 🔹 钱包管理（Wallets）
- **钱包列表展示** - 显示所有已创建的钱包地址
- **实时余额查询** - 自动获取和更新每个钱包的 COSMO 代币余额
- **一键创建钱包** - 快速生成新的区块链钱包地址
- **钱包详情展示** - 显示钱包地址、公钥和余额信息

### 🔹 导航和布局
- **响应式导航栏** - 支持桌面和移动设备的导航体验
- **统一布局组件** - 为所有页面提供一致的视觉风格
- **活跃路由高亮** - 当前页面在导航中的视觉反馈
- **中文本地化界面** - 完全中文化的用户界面

## 📊 业务逻辑实现

### 数据流架构
1. **API 服务层（api.ts）**
   - 统一的 HTTP 客户端配置
   - 类型安全的 API 调用封装
   - 自动错误处理和超时管理
   - RESTful API 端点组织

2. **状态管理**
   - 使用 React Hooks（useState, useEffect）管理组件状态
   - 实时数据轮询机制
   - 加载状态和错误状态管理

3. **类型系统（blockchain.ts）**
   ```typescript
   interface Transaction {
     id: string;
     fromAddress: string | null;
     toAddress: string | null;
     amount: number;
     type: 'transfer' | 'mint' | 'burn' | 'mine';
     timestamp: number;
   }

   interface Block {
     timestamp: number;
     transactions: Transaction[];
     hash: string;
     previousHash: string;
     nonce: number;
     height?: number;
   }
   ```

### 实时数据更新机制
- **轮询策略** - Dashboard 组件每 10 秒自动刷新数据
- **错误处理** - 网络请求失败时的优雅降级
- **加载状态** - 提供用户友好的加载反馈

### 用户体验优化
- **响应式设计** - 使用 Tailwind CSS 实现移动端适配
- **加载动画** - 自定义 LoadingSpinner 组件提供视觉反馈
- **数据格式化** - format.ts 工具函数处理时间、数值和哈希值格式化

## 🚀 快速开始

### 环境要求
- Node.js 16+
- pnpm 8+

### 安装和运行
```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

### 开发配置
应用将在 `http://localhost:3001` 启动，并自动连接到 `http://localhost:3000` 的后端 API 服务。

## 🔧 API 集成

### 区块链数据 API
```typescript
// 获取区块链基本信息
const info = await api.blockchain.getInfo();

// 获取区块列表（支持分页）
const blocks = await api.blockchain.getBlocks(limit, offset);

// 获取交易列表
const transactions = await api.blockchain.getTransactions(limit);
```

### 钱包操作 API
```typescript
// 创建新钱包
const newWallet = await api.wallet.createWallet();

// 获取所有钱包
const wallets = await api.wallet.getAllWallets();

// 查询钱包余额
const balance = await api.wallet.getBalance(address);
```

## 🎨 UI/UX 设计

### 设计原则
- **简洁直观** - 清晰的信息层次和导航结构
- **数据可视化** - 合理的图标和颜色编码系统
- **响应式设计** - 适配各种屏设备尺寸
- **中文本土化** - 完全中文化的界面和术语

### 组件系统
- **Card 组件** - 统一的内容容器样式
- **LoadingSpinner** - 一致的加载状态指示器
- **Layout** - 标准化的页面布局和导航

### 颜色和视觉
- 使用 Tailwind CSS 的设计系统
- 蓝色系主色调，符合区块链技术的专业形象
- 不同交易类型使用不同颜色标识（转账-蓝色、铸造-绿色、挖矿-紫色）

## 📱 功能特性

### 已实现功能
- ✅ 实时区块链数据展示
- ✅ 分页式区块浏览
- ✅ 钱包管理界面
- ✅ 交易历史查看
- ✅ 响应式设计
- ✅ 中文本地化

### 待实现功能
- ⏳ 交易详情页面
- ⏳ 挖矿功能页面
- ⏳ 代币详情页面
- ⏳ 区块搜索功能
- ⏳ 交易搜索功能
- ⏳ 钱包详情页面
- ⏳ 高级过滤和排序功能

## 🛠️ 开发指南

### 添加新页面
1. 在 `src/pages/` 目录下创建新页面组件
2. 在 `src/App.tsx` 中添加路由配置
3. 在 `src/components/Layout.tsx` 中添加导航项

### 添加新API接口
1. 在 `src/types/blockchain.ts` 中定义相关类型
2. 在 `src/services/api.ts` 中添加对应的API调用函数
3. 在需要的页面组件中使用新添加的API

### 自定义样式
1. 使用 Tailwind CSS 的实用类进行样式设计
2. 在 `src/index.css` 中添加全局样式
3. 如需添加新的主题颜色，可在 `tailwind.config.js` 中进行配置

## 🧪 测试

目前项目包含以下测试策略：
- 使用 TypeScript 进行静态类型检查
- 使用 ESLint 进行代码质量检查
- 计划添加 Jest 进行单元测试
- 计划添加 Cypress 进行端到端测试

## 📦 部署

### 构建生产版本
```bash
pnpm build
```

构建后的文件将位于 `dist/` 目录中，可以部署到任何静态文件服务器上。

### Docker 部署（推荐）
```dockerfile
FROM node:16-alpine as build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install
COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进项目。请遵循以下步骤：

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [React](https://reactjs.org/) - 用于构建用户界面的 JavaScript 库
- [TypeScript](https://www.typescriptlang.org/) - JavaScript 的超集，添加了静态类型
- [Vite](https://vitejs.dev/) - 下一代前端工具链
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [Lucide Icons](https://lucide.dev/) - 开源图标库