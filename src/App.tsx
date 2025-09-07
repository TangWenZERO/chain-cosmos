import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Blocks from "./pages/Blocks";
import Wallets from "./pages/Wallets";
import Transactions from "./pages/Transactions";
import Mining from "./pages/Mining";
import Tokens from "./pages/Tokens";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/blocks" element={<Blocks />} />
          <Route path="/wallets" element={<Wallets />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/mining" element={<Mining />} />
          <Route path="/tokens" element={<Tokens />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
