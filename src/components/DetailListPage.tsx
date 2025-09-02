import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import Header from './Header';
import AppSidebar from './Sidebar';
import AssetTransferReportMUI, { AssetRow } from './AssetTransferReportMUI';

const DetailListPage: React.FC = () => {
  const [assetData, setAssetData] = useState<AssetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const transferFormData = location.state;

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleMobileClose = () => {
    setMobileOpen(false);
  };

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/');
      return;
    }

    // Load asset data
    loadAssetData();
  }, [navigate]);

  const loadAssetData = async () => {
    try {
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Try to load data from local JSON file using axios
      const response = await axios.get('/data/asset-transfers.json');
      setAssetData(response.data.assetData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading asset data:', error);
      
      // Fallback to mock data if JSON file fails to load
      const mockAssetData: AssetRow[] = [
        {
          fromCostCenter: "20003",
          fromLocation: "POOL MINI SUPERMARKET",
          toCostCenter: "20240",
          toLocation: "MINI SUPERMARKET - CPFM / THANASIT POINT2",
          oracleAssetNo: "TH2101760",
          assetBarcode: "BC001234",
          description: "Bracket, Bracket D350, x 35 x - (Model: D350, Serial: SN12345, Color: white)",
          lifeYear: 6.08,
          assetStartDate: "2021-10-05",
          transferDate: "2025-03-10",
          unit: 152,
          assetCost: 7522.48,
          nbv: 3398.52,
          oracleCategory: "Leg.Store Shelving&Display",
          remark: "Transfer for store expansion",
        },
        {
          fromCostCenter: "20003",
          fromLocation: "POOL MINI SUPERMARKET",
          toCostCenter: "20240",
          toLocation: "MINI SUPERMARKET - CPFM / THANASIT POINT2",
          oracleAssetNo: "TH2101761",
          assetBarcode: "BC001235",
          description: "Display Shelf Unit, 5-Tier (Model: SH500, Serial: SN23456)",
          lifeYear: 5.50,
          assetStartDate: "2021-10-21",
          transferDate: "2025-03-10",
          unit: 10,
          assetCost: 45000.00,
          nbv: 22500.00,
          oracleCategory: "Leg.Store Shelving&Display",
          remark: "Store renovation",
        },
        {
          fromCostCenter: "20005",
          fromLocation: "WAREHOUSE A",
          toCostCenter: "20250",
          toLocation: "MINI SUPERMARKET - CPFM / SIAM SQUARE",
          oracleAssetNo: "TH2101800",
          assetBarcode: "BC001300",
          description: "Refrigerator, Commercial 2-Door (Model: RF2000, Serial: RF45678)",
          lifeYear: 8.00,
          assetStartDate: "2020-05-15",
          transferDate: "2025-02-28",
          unit: 1,
          assetCost: 85000.00,
          nbv: 42500.00,
          oracleCategory: "Leg.Store Equipment",
          remark: "Replacement for damaged unit",
        },
        {
          fromCostCenter: "20005",
          fromLocation: "WAREHOUSE A",
          toCostCenter: "20250",
          toLocation: "MINI SUPERMARKET - CPFM / SIAM SQUARE",
          oracleAssetNo: "TH2101801",
          assetBarcode: "BC001301",
          description: "Cash Register System (Model: CR300, Serial: CR78901)",
          lifeYear: 4.00,
          assetStartDate: "2022-01-10",
          transferDate: "2025-02-28",
          unit: 2,
          assetCost: 32000.00,
          nbv: 16000.00,
          oracleCategory: "Leg.IT Equipment",
          remark: "New store setup",
        },
        {
          fromCostCenter: "20010",
          fromLocation: "HEAD OFFICE",
          toCostCenter: "20260",
          toLocation: "MINI SUPERMARKET - CPFM / CENTRAL WORLD",
          oracleAssetNo: "TH2101900",
          assetBarcode: "BC001400",
          description: "Air Conditioning Unit, 36000 BTU (Model: AC36K, Serial: AC34567)",
          lifeYear: 10.00,
          assetStartDate: "2019-06-20",
          transferDate: "2025-01-15",
          unit: 1,
          assetCost: 65000.00,
          nbv: 26000.00,
          oracleCategory: "Leg.Building Equipment",
          remark: "Store upgrade",
        }
      ];
      
      setAssetData(mockAssetData);
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <AppSidebar 
          collapsed={sidebarCollapsed}
          isMobile={false}
          mobileOpen={mobileOpen}
          onMobileClose={handleMobileClose}
        />
        <Box 
          component="main" 
          sx={{ 
            width: sidebarCollapsed ? 'calc(100% - 60px)' : 'calc(100% - 240px)',
            position: 'absolute',
            left: sidebarCollapsed ? '60px' : '240px',
            top: 0,
            transition: 'width 0.3s ease, left 0.3s ease',
            minHeight: '100vh',
            display: 'flex', 
            flexDirection: 'column' 
          }}
        >
          <Header 
            onToggleSidebar={handleToggleSidebar}
            collapsed={sidebarCollapsed}
            isMobile={false}
          />
          <Box sx={{ p: 3, paddingTop: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <Typography variant="h6">กำลังโหลดข้อมูล...</Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar 
        collapsed={sidebarCollapsed}
        isMobile={false}
        mobileOpen={mobileOpen}
        onMobileClose={handleMobileClose}
      />
      <Box 
        component="main" 
        sx={{ 
          width: sidebarCollapsed ? 'calc(100% - 60px)' : 'calc(100% - 240px)',
          position: 'absolute',
          left: sidebarCollapsed ? '60px' : '240px',
          top: 0,
          transition: 'width 0.3s ease, left 0.3s ease',
          minHeight: '100vh',
          display: 'flex', 
          flexDirection: 'column' 
        }}
      >
        <Header 
          onToggleSidebar={handleToggleSidebar}
          collapsed={sidebarCollapsed}
          isMobile={false}
        />
        <Box sx={{ p: 3, paddingTop: '80px', flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={handleBackToDashboard}
              sx={{ mr: 2 }}
            >
              Back
            </Button> 
          </Box>

          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            จำนวนรายการทั้งหมด: {assetData.length} รายการ
          </Typography>

          <AssetTransferReportMUI 
            title="Asset Transfer Report"
            rows={assetData}
            transferFormData={transferFormData}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default DetailListPage;