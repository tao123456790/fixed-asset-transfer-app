import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Divider,
  Chip,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import Header from './Header';
import AppSidebar from './Sidebar';
import { AssetRow } from './AssetTransferReportMUI';

const AssetDetailPage: React.FC = () => {
  const [assetData, setAssetData] = useState<AssetRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { assetNo } = useParams<{ assetNo: string }>();

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleMobileClose = () => {
    setMobileOpen(false);
  };

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/');
      return;
    }

    loadAssetDetail();
  }, [navigate, assetNo]);

  const loadAssetDetail = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Load all assets and find the specific one
      const response = await fetch('/data/asset-transfers.json');
      const data = await response.json();
      const asset = data.assetData.find((item: AssetRow) => item.oracleAssetNo === assetNo);
      
      setAssetData(asset || null);
      setLoading(false);
    } catch (error) {
      console.error('Error loading asset detail:', error);
      setLoading(false);
    }
  };

  const handleBackToReport = () => {
    navigate('/detail-list');
  };

  const formatMoney = (n?: number | null) => {
    if (n == null || typeof n !== 'number' || !Number.isFinite(n)) return "-";
    const abs = Math.abs(n);
    const base = abs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (n < 0) return `(${base})`;
    if (n === 0) return "-";
    return base;
  };

  const formatDate = (d?: string | null) => {
    if (!d) return "-";
    const dt = new Date(d);
    if (isNaN(+dt)) return "-";
    return new Intl.DateTimeFormat("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(dt);
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

  if (!assetData) {
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
          <Box sx={{ p: 3, paddingTop: '80px' }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={handleBackToReport}
              sx={{ mb: 2 }}
            >
              กลับไปรายงาน
            </Button>
            <Typography variant="h6">ไม่พบข้อมูลทรัพย์สิน</Typography>
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
              onClick={handleBackToReport}
              sx={{ mr: 2 }}
            >
              กลับไปรายงาน
            </Button>
            <Typography variant="h4" sx={{ color: '#1976d2' }}>
              รายละเอียดทรัพย์สิน: {assetData.oracleAssetNo}
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Asset Information */}
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                    ข้อมูลทรัพย์สิน
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Oracle Asset No.</Typography>
                    <Typography variant="body1" fontWeight={600}>{assetData.oracleAssetNo}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Asset Barcode</Typography>
                    <Typography variant="body1">{assetData.assetBarcode || '-'}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                    <Typography variant="body1">{assetData.description}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Oracle Category</Typography>
                    <Typography variant="body1">{assetData.oracleCategory || '-'}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Life Year</Typography>
                    <Typography variant="body1">{assetData.lifeYear?.toFixed(2) || '-'}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Location Information */}
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                    ข้อมูลสถานที่
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">From Cost Center</Typography>
                    <Typography variant="body1" fontWeight={600}>{assetData.fromCostCenter}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">From Location</Typography>
                    <Typography variant="body1">{assetData.fromLocation}</Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">To Cost Center</Typography>
                    <Typography variant="body1" fontWeight={600}>{assetData.toCostCenter}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">To Location</Typography>
                    <Typography variant="body1">{assetData.toLocation}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Financial Information */}
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                    ข้อมูลทางการเงิน
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Asset Cost</Typography>
                    <Typography variant="body1" fontWeight={600} color={assetData.assetCost && assetData.assetCost < 0 ? 'error' : 'text.primary'}>
                      {formatMoney(assetData.assetCost)} บาท
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Net Book Value (NBV)</Typography>
                    <Typography variant="body1" fontWeight={600} color={assetData.nbv && assetData.nbv < 0 ? 'error' : 'text.primary'}>
                      {formatMoney(assetData.nbv)} บาท
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Unit</Typography>
                    <Typography variant="body1">{assetData.unit || '-'}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Transfer Information */}
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                    ข้อมูลการโอน
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Asset Started Date</Typography>
                    <Typography variant="body1">{formatDate(assetData.assetStartDate)}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Transfer Date</Typography>
                    <Typography variant="body1" fontWeight={600}>{formatDate(assetData.transferDate)}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Transfer Report Amount</Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {formatMoney(assetData.transferReport)} บาท
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Remark</Typography>
                    <Typography variant="body1">{assetData.remark || '-'}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Reconciliation Status */}
            <Grid item xs={12}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                    สถานะการตรวจสอบ (Reconciliation)
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">Transfer Form vs. NBV</Typography>
                        {assetData.transferVsNBV && (
                          <Chip 
                            label={assetData.transferVsNBV} 
                            color={assetData.transferVsNBV === "Matched" ? "success" : "error"}
                            sx={{ mt: 1 }}
                          />
                        )}
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">Transfer Report vs. FBDI</Typography>
                        {assetData.transferVsFBDI && (
                          <Chip 
                            label={assetData.transferVsFBDI} 
                            color={assetData.transferVsFBDI === "Matched" ? "success" : "error"}
                            sx={{ mt: 1 }}
                          />
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default AssetDetailPage;