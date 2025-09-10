import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login/Login';
import DashboardPage from './components/DashboardPage';
import DetailListPage from './components/DetailListPage';
import StoreProfileMaster from './components/MasterData/StoreProfileMaster';
// import LOBMaster from './components/MasterData/LOBMaster';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/detail-list" element={<DetailListPage />} />
        <Route path="/master-data/store-profile" element={<StoreProfileMaster />} />
        {/* <Route path="/master-data/lob" element={<LOBMaster />} /> */}
      </Routes>
    </div>
  );
}

export default App;