import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Chip,
  IconButton
} from '@mui/material';
import { ViewList, Search, Edit } from '@mui/icons-material';
import Header from './Layout/Header/Header';
import AppSidebar from './Layout/Sidebar/Sidebar';

interface HistoryLogEntry {
  id: string;
  status: string;
  timestamp: string;
  user: string;
  comment?: string;
}

interface DashboardData {
  owner: string;
  transferFormId: string;
  requestDate: string;
  projectName: string;
  locationFrom: string;
  locationTo: string;
  status: string;
  requester: string;
  historyLog?: HistoryLogEntry[];
}

const DashboardPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

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

    // Load dashboard data
    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    // First check if there's updated data in localStorage
    const storedData = localStorage.getItem('dashboardData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setDashboardData(parsedData);
        return;
      } catch (error) {
        console.error('Error parsing stored data:', error);
        localStorage.removeItem('dashboardData');
      }
    }

    // If no localStorage data, load from JSON file or use mock data
    try {
      // Load data from local JSON file using axios
      const response = await axios.get('/data/dashboard.json');
      const data = response.data.dashboardData;
      setDashboardData(data);
      // Store in localStorage for future updates
      localStorage.setItem('dashboardData', JSON.stringify(data));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      
      // Fallback to mock data if JSON file fails to load
      const mockData: DashboardData[] = [
        {
          owner: "IT",
          transferFormId: "TF-2024-0001",
          requestDate: "15/01/2024",
          projectName: "Office Equipment Transfer",
          locationFrom: "Building A - Floor 3",
          locationTo: "Building B - Floor 2",
          status: "Pending Review",
          requester: "Jarinya Phosri"
        },
        {
          owner: "FM",
          transferFormId: "TF-2024-0002",
          requestDate: "14/01/2024",
          projectName: "Furniture Relocation",
          locationFrom: "Warehouse 1",
          locationTo: "Office Floor 5",
          status: "Transfer Report Mismatch",
          requester: "Chanpen Manu"
        },
        {
          owner: "IT",
          transferFormId: "TF-2024-0003",
          requestDate: "13/01/2024",
          projectName: "Server Room Equipment",
          locationFrom: "Data Center",
          locationTo: "Backup Site",
          status: "Completed",
          requester: "Somchai Jaidee"
        },
        {
          owner: "HR",
          transferFormId: "TF-2024-0004",
          requestDate: "12/01/2024",
          projectName: "Training Room Setup",
          locationFrom: "Building C - Floor 2",
          locationTo: "Training Center",
          status: "Transfer Report Mismatch(Re-Process)",
          requester: "Suchada Kaewpong"
        },
        {
          owner: "IT",
          transferFormId: "TF-2024-0005",
          requestDate: "11/01/2024",
          projectName: "Network Equipment Migration",
          locationFrom: "Server Room A",
          locationTo: "Server Room B",
          status: "Reject",
          requester: "Prasit Wongsawat"
        },
        {
          owner: "FM",
          transferFormId: "TF-2024-0006",
          requestDate: "10/01/2024",
          projectName: "Office Renovation Assets",
          locationFrom: "Floor 7",
          locationTo: "Temporary Storage",
          status: "Pending Review",
          requester: "Nattapong Srisuk"
        },
        {
          owner: "ACC",
          transferFormId: "TF-2024-0007",
          requestDate: "09/01/2024",
          projectName: "Finance Office Equipment",
          locationFrom: "Accounting Dept",
          locationTo: "Finance Dept",
          status: "Completed",
          requester: "Wipada Tangthai"
        },
        {
          owner: "IT",
          transferFormId: "TF-2024-0008",
          requestDate: "08/01/2024",
          projectName: "Desktop Computer Transfer",
          locationFrom: "Building A - IT Store",
          locationTo: "Building B - Office",
          status: "Transfer Report Mismatch",
          requester: "Kittipong Jaiyen"
        },
        {
          owner: "HR",
          transferFormId: "TF-2024-0009",
          requestDate: "07/01/2024",
          projectName: "HR Equipment Relocation",
          locationFrom: "HR Department",
          locationTo: "New HR Office",
          status: "Pending Review",
          requester: "Siriporn Chaiyasit"
        },
        {
          owner: "FM",
          transferFormId: "TF-2024-0010",
          requestDate: "06/01/2024",
          projectName: "Cafeteria Equipment",
          locationFrom: "Old Cafeteria",
          locationTo: "New Cafeteria",
          status: "Completed",
          requester: "Anuchit Pongpan"
        }
      ];
      
      setDashboardData(mockData);
      // Store in localStorage for future updates
      localStorage.setItem('dashboardData', JSON.stringify(mockData));
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'Pending Review':
        return (
          <Chip 
            label="Pending Review" 
            color="warning" 
            size="small"
            sx={{ 
              fontWeight: 600,
              fontSize: '0.75rem',
              height: '24px',
              backgroundColor: '#ff9800',
              color: 'white',
              '& .MuiChip-label': {
                px: 1.5
              }
            }}
          />
        );
      case 'Transfer Report Mismatch':
        return (
          <Chip 
            label="Transfer Report Mismatch" 
            color="error" 
            variant="outlined"
            size="small"
            sx={{ 
              fontWeight: 600,
              fontSize: '0.75rem',
              height: '24px',
              borderColor: '#f44336',
              color: '#f44336',
              '& .MuiChip-label': {
                px: 1.5
              }
            }}
          />
        );
      case 'Transfer Report Mismatch(Re-Process)':
        return (
          <Chip 
            label="Mismatch (Re-Process)" 
            color="warning" 
            variant="outlined"
            size="small"
            sx={{ 
              fontWeight: 600,
              fontSize: '0.75rem',
              height: '24px',
              borderColor: '#ff6f00',
              color: '#ff6f00',
              backgroundColor: '#fff3e0',
              '& .MuiChip-label': {
                px: 1.5
              }
            }}
          />
        );
      case 'Reject':
        return (
          <Chip 
            label="Rejected" 
            color="error" 
            size="small"
            sx={{ 
              fontWeight: 600,
              fontSize: '0.75rem',
              height: '24px',
              backgroundColor: '#d32f2f',
              color: 'white',
              '& .MuiChip-label': {
                px: 1.5
              }
            }}
          />
        );
      case 'Completed':
        return (
          <Chip 
            label="Completed" 
            color="success" 
            size="small"
            sx={{ 
              fontWeight: 600,
              fontSize: '0.75rem',
              height: '24px',
              backgroundColor: '#2e7d32',
              color: 'white',
              '& .MuiChip-label': {
                px: 1.5
              }
            }}
          />
        );
      case 'Approved':
        return (
          <Chip 
            label="Approved" 
            color="info" 
            size="small"
            sx={{ 
              fontWeight: 600,
              fontSize: '0.75rem',
              height: '24px',
              backgroundColor: '#0288d1',
              color: 'white',
              '& .MuiChip-label': {
                px: 1.5
              }
            }}
          />
        );
      default:
        return (
          <Chip 
            label={status} 
            color="default" 
            size="small"
            sx={{ 
              fontWeight: 600,
              fontSize: '0.75rem',
              height: '24px',
              '& .MuiChip-label': {
                px: 1.5
              }
            }}
          />
        );
    }
  };

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
          minHeight: '100vh'
        }}
      >
        <Header 
          onToggleSidebar={handleToggleSidebar}
          collapsed={sidebarCollapsed}
          isMobile={false}
        />
        <Box sx={{ p: 3, paddingTop: '80px' }}>
          <Typography variant="h4" sx={{ mb: 3, color: '#1976d2' }}>
            Dashboard
          </Typography>

          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Requests
                  </Typography>
                  <Typography variant="h5" component="h2">
                    {dashboardData.length}
                  </Typography>
                  <Typography color="textSecondary">
                    Transfer Forms
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
           <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Completed
                  </Typography>
                  <Typography variant="h5" component="h2" sx={{ color: '#2e7d32' }}>
                    {dashboardData.filter(item => item.status === 'Completed').length}
                  </Typography>
                  <Typography color="textSecondary">
                    Transfer Forms
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
           <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Pending Review
                  </Typography>
                  <Typography variant="h5" component="h2" sx={{ color: '#ff9800' }}>
                    {dashboardData.filter(item => item.status === 'Pending Review').length}
                  </Typography>
                  <Typography color="textSecondary">
                    Transfer Forms
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
           <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Issues / Rejected
                  </Typography>
                  <Typography variant="h5" component="h2" sx={{ color: '#f44336' }}>
                    {dashboardData.filter(item => 
                      item.status === 'Reject' || 
                      item.status.includes('Transfer Report Mismatch')
                    ).length}
                  </Typography>
                  <Typography color="textSecondary">
                    Transfer Forms
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid> 

          {/* Data Table */}
          <Typography variant="h6" sx={{ mb: 2 }}>
            Recent Transfer Requests
          </Typography>
          <TableContainer component={Paper} elevation={2}>
            <Table sx={{ minWidth: 650, borderCollapse: "separate", borderSpacing: 1 }} aria-label="dashboard table">
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={{ bgcolor: '#2196f3', color: 'white', border: 2, borderColor: '#1976d2', fontWeight: 700 }}>Action</TableCell> 
                  <TableCell sx={{ bgcolor: '#2196f3', color: 'white', border: 2, borderColor: '#1976d2', fontWeight: 700 }}>Owner</TableCell>
                  <TableCell sx={{ bgcolor: '#2196f3', color: 'white', border: 2, borderColor: '#1976d2', fontWeight: 700 }}>Transfer Form ID</TableCell>
                  <TableCell sx={{ bgcolor: '#2196f3', color: 'white', border: 2, borderColor: '#1976d2', fontWeight: 700 }}>Request Date</TableCell>
                  <TableCell sx={{ bgcolor: '#2196f3', color: 'white', border: 2, borderColor: '#1976d2', fontWeight: 700 }}>Project Name</TableCell>
                  <TableCell sx={{ bgcolor: '#2196f3', color: 'white', border: 2, borderColor: '#1976d2', fontWeight: 700 }}>From Location</TableCell>
                  <TableCell sx={{ bgcolor: '#2196f3', color: 'white', border: 2, borderColor: '#1976d2', fontWeight: 700 }}>To Location</TableCell>
                  <TableCell sx={{ bgcolor: '#2196f3', color: 'white', border: 2, borderColor: '#1976d2', fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ bgcolor: '#2196f3', color: 'white', border: 2, borderColor: '#1976d2', fontWeight: 700 }}>Requester</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dashboardData.map((row, index) => (
                  <TableRow
                    key={index}
                    sx={{ 
                      '&:hover': { 
                        bgcolor: '#f8f9fa'
                      },
                      '&:nth-of-type(even)': {
                        bgcolor: '#fafafa'
                      }
                    }}
                  >
                    <TableCell align="center" sx={{ border: 1, borderColor: '#e0e0e0', py: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => navigate('/detail-list', { 
                          state: { 
                            transferFormId: row.transferFormId,
                            locationFrom: row.locationFrom,
                            locationTo: row.locationTo,
                            projectName: row.projectName,
                            status: row.status,
                            historyLog: row.historyLog || []
                          }
                        })}
                        sx={{ 
                          color: row.status === 'Pending Review' ? '#ff9800' : '#1976d2',
                          '&:hover': {
                            bgcolor: row.status === 'Pending Review' ? 'rgba(255, 152, 0, 0.08)' : 'rgba(25, 118, 210, 0.08)'
                          }
                        }}
                        title={row.status === 'Pending Review' ? "Edit" : "View Details"}
                      >
                        {row.status === 'Pending Review' ? <Edit fontSize="small" /> : <Search fontSize="small" />}
                      </IconButton>
                    </TableCell>
                    <TableCell component="th" scope="row" sx={{ border: 1, borderColor: '#e0e0e0', py: 1, fontWeight: 600 }}>
                      {row.owner}
                    </TableCell>
                    <TableCell sx={{ border: 1, borderColor: '#e0e0e0', py: 1, fontFamily: 'monospace', fontSize: '13px' }}>{row.transferFormId}</TableCell>
                    <TableCell sx={{ border: 1, borderColor: '#e0e0e0', py: 1 }}>{row.requestDate}</TableCell>
                    <TableCell sx={{ border: 1, borderColor: '#e0e0e0', py: 1 }}>{row.projectName}</TableCell>
                    <TableCell sx={{ border: 1, borderColor: '#e0e0e0', py: 1 }}>{row.locationFrom || '-'}</TableCell>
                    <TableCell sx={{ border: 1, borderColor: '#e0e0e0', py: 1 }}>{row.locationTo || '-'}</TableCell>
                    <TableCell sx={{ border: 1, borderColor: '#e0e0e0', py: 1 }}>{getStatusChip(row.status)}</TableCell>
                    <TableCell sx={{ border: 1, borderColor: '#e0e0e0', py: 1 }}>{row.requester}</TableCell>
                    
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>

    </Box>
  );
};

export default DashboardPage;