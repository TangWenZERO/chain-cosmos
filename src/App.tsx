import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Blocks from './pages/Blocks';
import Wallets from './pages/Wallets';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/blocks" element={<Blocks />} />
          <Route path="/wallets" element={<Wallets />} />
          <Route path="/transactions" element={
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900">交易</h2>
              <p className="mt-2 text-gray-600">敬请期待...</p>
            </div>
          } />
          <Route path="/mining" element={
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900">挖矿</h2>
              <p className="mt-2 text-gray-600">敬请期待...</p>
            </div>
          } />
          <Route path="/tokens" element={
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900">代币</h2>
              <p className="mt-2 text-gray-600">敬请期待...</p>
            </div>
          } />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;