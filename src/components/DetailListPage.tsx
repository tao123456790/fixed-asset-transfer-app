import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import { ArrowBack, Description, AttachFile } from '@mui/icons-material';
import Header from './Layout/Header/Header';
import AppSidebar from './Layout/Sidebar/Sidebar';
import AssetTransferReport, { AssetRow } from './AssetTransferReport';
import AttachmentsPage from './AttachmentsPage';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const DetailListPage: React.FC = () => {
  const [assetData, setAssetData] = useState<AssetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the latest data from localStorage instead of just using location.state
  const getLatestTransferFormData = () => {
    const initialData = location.state;
    if (!initialData?.transferFormId) return initialData;
    
    // Try to get latest data from localStorage
    const storedData = localStorage.getItem('dashboardData');
    if (storedData) {
      try {
        const dashboardData = JSON.parse(storedData);
        const latestData = dashboardData.find((item: any) => 
          item.transferFormId === initialData.transferFormId
        );
        
        if (latestData) {
          // Merge latest data with initial data (latest data takes precedence)
          return {
            ...initialData,
            historyLog: latestData.historyLog || [],
            status: latestData.status,
            rejectReason: latestData.rejectReason
          };
        }
      } catch (error) {
        console.error('Error loading latest data from localStorage:', error);
      }
    }
    
    return initialData;
  };
  
  const transferFormData = getLatestTransferFormData();

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
          assetNoWithChild: "Y",
          transferType: "Fully",
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
          assetNoWithChild: "N",
          transferType: "Partial",
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
          assetNoWithChild: "Y",
          transferType: "Partial",
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
          assetNoWithChild: "N",
          transferType: "Fully",
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
          assetNoWithChild: "Y",
          transferType: "Fully",
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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

          <Paper sx={{ width: '100%', mb: 2 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="detail tabs"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab 
                label="Asset Transfer Report" 
                icon={<Description />} 
                iconPosition="start"
                {...a11yProps(0)} 
              />
              <Tab 
                label="Attachments" 
                icon={<AttachFile />} 
                iconPosition="start"
                {...a11yProps(1)} 
              />
            </Tabs>
          </Paper>

          <TabPanel value={tabValue} index={0}>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              จำนวนรายการทั้งหมด: {assetData.length} รายการ
            </Typography>
            <AssetTransferReport 
              title="Asset Transfer Report"
              rows={assetData}
              transferFormData={transferFormData}
            />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <AttachmentsPage transferFormData={transferFormData} />
          </TabPanel>
        </Box>
      </Box>
    </Box>
  );
};

export default DetailListPage;