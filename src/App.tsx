import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login/Login';
import DashboardPage from './components/DashboardPage';
import DetailListPage from './components/DetailListPage';
import AssetDetailPage from './components/AssetDetailPage';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/detail-list" element={<DetailListPage />} />
        <Route path="/asset-detail/:assetNo" element={<AssetDetailPage />} />
      </Routes>
    </div>
  );
}

export default App;