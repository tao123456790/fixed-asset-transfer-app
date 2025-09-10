import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { exportToExcel } from '../utils/exportToExcel';
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
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  TableSortLabel,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Collapse,
  Menu,
  Divider,
  InputAdornment
} from '@mui/material';
import { ViewList, Search, Edit, FilterList, Clear, ExpandMore, ExpandLess, MoreVert as MoreVertIcon } from '@mui/icons-material';
import Header from './Layout/Header/Header';
import AppSidebar from './Layout/Sidebar/Sidebar';
import { getStatusChipProps, sxDashboardPage } from '../styles/sx';

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

  // Filtering and Sorting state
  const [filters, setFilters] = useState({
    owner: '',
    transferFormId: '',
    requestDate: '',
    projectName: '',
    locationFrom: '',
    locationTo: '',
    status: ['Pending Review(Approval)','Pending Review(Transfer Report Mismatch)','Pending Re-Processing(Transfer Report Mismatch)'], // Default filter to show Pending Review as array
    requester: ''
  });
  
  const [filterExpanded, setFilterExpanded] = useState(true);
  
  const [sortConfig, setSortConfig] = useState<{
    key: keyof DashboardData;
    direction: 'asc' | 'desc';
  }>({
    key: 'requestDate',
    direction: 'desc' // Default sort: newest first
  });

  // Column visibility management
  const initialColumns = [
    { field: 'actions', headerName: 'Action', visible: true },
    { field: 'owner', headerName: 'Owner', visible: true },
    { field: 'transferFormId', headerName: 'Transfer Form ID', visible: true },
    { field: 'requestDate', headerName: 'Request Date', visible: true },
    { field: 'projectName', headerName: 'Project Name', visible: true },
    { field: 'locationFrom', headerName: 'From Location', visible: true },
    { field: 'locationTo', headerName: 'To Location', visible: true },
    { field: 'status', headerName: 'Status', visible: true },
    { field: 'requester', headerName: 'Requester', visible: true }
  ];

  const [columns, setColumns] = useState(initialColumns);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [columnSearchText, setColumnSearchText] = useState('');
  const [searchText, setSearchText] = useState('');
  
  const open = Boolean(anchorEl);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleMobileClose = () => {
    setMobileOpen(false);
  };

  // Column visibility functions
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleToggleColumn = (field: string) => {
    setColumns(prev => prev.map(col => 
      col.field === field ? { ...col, visible: !col.visible } : col
    ));
  };

  const handleSelectAll = () => {
    setColumns(prev => prev.map(col => ({ ...col, visible: true })));
  };

  const handleDeselectAll = () => {
    setColumns(prev => prev.map(col => 
      col.field === 'actions' ? col : { ...col, visible: false }
    ));
  };

  const filteredColumns = columns.filter(col => 
    col.headerName.toLowerCase().includes(columnSearchText.toLowerCase())
  );

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/');
      return;
    }

    // Load dashboard data - this will run every time component mounts
    console.log('DashboardPage mounted - loading data');
    loadDashboardData();
  }, [navigate]);


  const loadDashboardData = async (forceRefresh = false) => {
    // Always load from JSON file first, then check localStorage for any updates
    try {
      // Load data from local JSON file using axios
      const response = await axios.get('/data/dashboard.json');
      let data = response.data.dashboardData;
      
      // If not forcing refresh, check if localStorage has updates for specific items
      if (!forceRefresh) {
        const storedData = localStorage.getItem('dashboardData');
        if (storedData) {
          try {
            const parsedStoredData = JSON.parse(storedData);
            // Merge stored data with fresh JSON data (localStorage takes precedence for status updates)
            data = data.map((jsonItem: any) => {
              const storedItem = parsedStoredData.find((stored: any) => stored.transferFormId === jsonItem.transferFormId);
              if (storedItem && (storedItem.status !== jsonItem.status || storedItem.rejectReason || storedItem.historyLog)) {
                // Keep localStorage updates (status, rejectReason, historyLog) but use JSON file for other fields
                console.log(`Merging localStorage data for ${jsonItem.transferFormId}:`, {
                  status: storedItem.status,
                  rejectReason: storedItem.rejectReason,
                  historyLog: storedItem.historyLog
                });
                return { 
                  ...jsonItem, 
                  status: storedItem.status, 
                  rejectReason: storedItem.rejectReason,
                  historyLog: storedItem.historyLog || jsonItem.historyLog 
                };
              }
              return jsonItem;
            });
          } catch (error) {
            console.error('Error parsing stored data:', error);
            localStorage.removeItem('dashboardData');
          }
        }
      }
      
      setDashboardData(data);
      // Update localStorage with the merged data
      localStorage.setItem('dashboardData', JSON.stringify(data));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      
      // If JSON file fails to load, try to use localStorage as fallback
      const storedData = localStorage.getItem('dashboardData');
      if (storedData) {
        try {
          const parsedStoredData = JSON.parse(storedData);
          setDashboardData(parsedStoredData);
          console.log('Using localStorage data as fallback');
        } catch (parseError) {
          console.error('Error parsing localStorage data:', parseError);
          localStorage.removeItem('dashboardData');
          setDashboardData([]);
        }
      } else {
        console.error('No dashboard data available. Please ensure dashboard.json is accessible.');
        setDashboardData([]);
      }
    }
  };

  const getStatusChip = (status: string) => {
    const chipProps = getStatusChipProps(status);
    return <Chip size="small" {...chipProps} />;
  };

  // Filtering and Sorting Functions
  const handleSort = (key: keyof DashboardData) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (filterKey: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      owner: '',
      transferFormId: '',
      requestDate: '',
      projectName: '',
      locationFrom: '',
      locationTo: '',
      status: [],
      requester: ''
    });
  };

  // Apply filters and sorting
  const filteredAndSortedData = React.useMemo(() => {
    let filtered = dashboardData.filter(item => {
      // Apply specific filters
      const matchesFilters = (
        (filters.owner === '' || item.owner.toLowerCase().includes(filters.owner.toLowerCase())) &&
        (filters.transferFormId === '' || item.transferFormId.toLowerCase().includes(filters.transferFormId.toLowerCase())) &&
        (filters.requestDate === '' || item.requestDate.includes(filters.requestDate)) &&
        (filters.projectName === '' || item.projectName.toLowerCase().includes(filters.projectName.toLowerCase())) &&
        (filters.locationFrom === '' || item.locationFrom.toLowerCase().includes(filters.locationFrom.toLowerCase())) &&
        (filters.locationTo === '' || item.locationTo.toLowerCase().includes(filters.locationTo.toLowerCase())) &&
        (filters.status.length === 0 || filters.status.includes(item.status)) &&
        (filters.requester === '' || item.requester.toLowerCase().includes(filters.requester.toLowerCase()))
      );

      // Apply global search
      const matchesGlobalSearch = searchText === '' || 
        Object.values(item).some(value => 
          value && value.toString().toLowerCase().includes(searchText.toLowerCase())
        );

      return matchesFilters && matchesGlobalSearch;
    });

    // Sort the filtered data
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue: any = a[sortConfig.key];
        let bValue: any = b[sortConfig.key];

        // Handle undefined/null values
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortConfig.direction === 'asc' ? -1 : 1;
        if (bValue == null) return sortConfig.direction === 'asc' ? 1 : -1;

        // Handle date sorting
        if (sortConfig.key === 'requestDate') {
          const aDate = new Date(aValue as string);
          const bDate = new Date(bValue as string);
          aValue = isNaN(aDate.getTime()) ? 0 : aDate.getTime();
          bValue = isNaN(bDate.getTime()) ? 0 : bDate.getTime();
        }

        // Handle string sorting (case insensitive)
        if (typeof aValue === 'string' && typeof bValue === 'string' && sortConfig.key !== 'requestDate') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [dashboardData, filters, sortConfig, searchText]);

  // Get unique values for filter dropdowns
  const uniqueStatuses = React.useMemo(() => {
    return [...new Set(dashboardData.map(item => item.status))].sort();
  }, [dashboardData]);


  return (
    <Box sx={sxDashboardPage.mainContainer}>
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
        <Box sx={sxDashboardPage.contentArea}>
          <Box sx={sxDashboardPage.headerSection}>
            <Typography variant="h4" sx={sxDashboardPage.headerTitle}>
              Dashboard
            </Typography>
            <Button
              variant="outlined"
              onClick={() => loadDashboardData(true)}
              sx={sxDashboardPage.refreshButton}
            >
              Refresh Data
            </Button>
          </Box>


          {/* Summary Cards */}
          <Grid container spacing={3} sx={sxDashboardPage.summaryCards}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Requests
                  </Typography>
                  <Typography variant="h5" component="h2">
                    {filteredAndSortedData.length}
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
                  <Typography variant="h5" component="h2" sx={sxDashboardPage.completedText}>
                    {filteredAndSortedData.filter(item => item.status === 'Completed').length}
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
                  <Typography variant="h5" component="h2" sx={sxDashboardPage.pendingText}>
                    {filteredAndSortedData.filter(item => item.status === 'Pending Review').length}
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
                  <Typography variant="h5" component="h2" sx={sxDashboardPage.issuesText}>
                    {filteredAndSortedData.filter(item => 
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


          {/* Filter Controls */}
          <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <FilterList color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Filters & Search
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Clear />}
                onClick={clearFilters}
                sx={{ ml: 'auto' }}
              >
                Clear All
              </Button>
            </Stack>
            
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label="Owner"
                  size="small"
                  value={filters.owner}
                  onChange={(e) => handleFilterChange('owner', e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label="Transfer Form ID"
                  size="small"
                  value={filters.transferFormId}
                  onChange={(e) => handleFilterChange('transferFormId', e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label="Request Date"
                  size="small"
                  type="date"
                  value={filters.requestDate}
                  onChange={(e) => handleFilterChange('requestDate', e.target.value)}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label="Project Name"
                  size="small"
                  value={filters.projectName}
                  onChange={(e) => handleFilterChange('projectName', e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label="From Location"
                  size="small"
                  value={filters.locationFrom}
                  onChange={(e) => handleFilterChange('locationFrom', e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label="To Location"
                  size="small"
                  value={filters.locationTo}
                  onChange={(e) => handleFilterChange('locationTo', e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    multiple
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value }))}
                    label="Status"
                    input={<OutlinedInput label="Status" />}
                    renderValue={(selected) => selected.join(', ')}
                  >
                    <MenuItem
                      onClick={() => {
                        const allSelected = filters.status.length === uniqueStatuses.length;
                        setFilters(prev => ({ 
                          ...prev, 
                          status: allSelected ? [] : [...uniqueStatuses] 
                        }));
                      }}
                    >
                      <Checkbox
                        checked={filters.status.length === uniqueStatuses.length}
                        indeterminate={filters.status.length > 0 && filters.status.length < uniqueStatuses.length}
                      />
                      <ListItemText 
                        primary={
                          <Typography sx={{ fontWeight: 'bold' }}>
                            {filters.status.length === uniqueStatuses.length ? 'Unselect All' : 'Select All'}
                          </Typography>
                        } 
                      />
                    </MenuItem>
                    <Divider />
                    {uniqueStatuses.map(status => (
                      <MenuItem key={status} value={status}>
                        <Checkbox checked={filters.status.indexOf(status) > -1} />
                        <ListItemText primary={status} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label="Requester"
                  size="small"
                  value={filters.requester}
                  onChange={(e) => handleFilterChange('requester', e.target.value)}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Column Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
            <Typography variant="subtitle1">Show/Hide column:</Typography>
            <IconButton onClick={handleMenuClick}>
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={() => {
                setAnchorEl(null);
                setColumnSearchText('');
              }}
              PaperProps={{
                sx: {
                  width: 350,
                  maxHeight: 400,
                },
              }}
            >
              <Box sx={{ p: 2, pb: 1 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Search columns..."
                  value={columnSearchText}
                  onChange={(e) => setColumnSearchText(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  onKeyDown={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                />
              </Box>
              
              <MenuItem onClick={() => {
                const visibleCount = columns.filter(col => col.visible).length;
                if (visibleCount === columns.length) {
                  handleDeselectAll();
                } else {
                  handleSelectAll();
                }
              }}>
                <Checkbox
                  checked={columns.filter(col => col.visible).length === columns.length}
                  indeterminate={
                    columns.filter(col => col.visible).length > 0 && 
                    columns.filter(col => col.visible).length < columns.length
                  }
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Select All
                </Typography>
              </MenuItem>
              <Divider />
              {filteredColumns.length === 0 ? (
                <MenuItem disabled>
                  <Typography variant="body2" color="text.secondary">
                    No columns found
                  </Typography>
                </MenuItem>
              ) : (
                filteredColumns.map((col) => {
                  const isVisible = col.visible;
                  const isActionsColumn = col.field === 'actions';
                  return (
                    <MenuItem 
                      key={col.field} 
                      onClick={() => !isActionsColumn && handleToggleColumn(col.field)}
                      disabled={isActionsColumn}
                      sx={{
                        opacity: isActionsColumn ? 0.6 : 1,
                      }}
                    >
                      <Checkbox
                        checked={isVisible}
                        disabled={isActionsColumn}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2">
                        {col.headerName}
                        {isActionsColumn && (
                          <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            (Always visible)
                          </Typography>
                        )}
                      </Typography>
                    </MenuItem>
                  );
                })
              )}
            </Menu>

            <Box sx={{ flexGrow: 1 }} />

            <TextField
              size="small"
              placeholder="Search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              variant="contained"
              onClick={() => {
                // เตรียม visible columns และ column mapping
                const visibleColumns = columns.filter(col => col.visible && col.field !== 'actions');
                const columnMapping: Record<string, string> = {};
                visibleColumns.forEach(col => {
                  columnMapping[col.field] = col.headerName || col.field;
                });
                
                // ใช้ฟังก์ชันกลาง exportToExcel
                const success = exportToExcel(filteredAndSortedData, 'Dashboard_Data', {
                  sheetName: 'Dashboard Data',
                  columnMapping,
                  visibleColumns,
                  columnWidth: 25
                });
                
                if (!success) {
                  console.error('Failed to export data to Excel');
                }
              }}
            >
              Export to Excel ({columns.filter(col => col.visible && col.field !== 'actions').length} columns)
            </Button>
          </Box>
          
          {/* Data Table */}
          <Typography variant="h6" sx={sxDashboardPage.tableTitle}>
            Recent Transfer Requests
          </Typography>
          <TableContainer component={Paper} elevation={2}>
            <Table sx={sxDashboardPage.table} aria-label="dashboard table">
              <TableHead>
                <TableRow>
                  {columns.filter(col => col.visible).map((col) => (
                    <TableCell 
                      key={col.field}
                      align={col.field === 'actions' ? 'center' : 'left'}
                      sx={col.field === 'actions' ? sxDashboardPage.tableHeaderCenterCell : sxDashboardPage.tableHeaderCell}
                    >
                      {col.field === 'actions' ? (
                        col.headerName
                      ) : (
                        <TableSortLabel
                          active={sortConfig.key === col.field}
                          direction={sortConfig.key === col.field ? sortConfig.direction : 'asc'}
                          onClick={() => handleSort(col.field as keyof DashboardData)}
                        >
                          {col.headerName}
                        </TableSortLabel>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSortedData.map((row, index) => (
                  <TableRow
                    key={index}
                    sx={sxDashboardPage.tableRow}
                  >
                    {columns.filter(col => col.visible).map((col) => {
                      const cellValue = col.field === 'actions' ? null : row[col.field as keyof DashboardData];
                      
                      return (
                        <TableCell
                          key={col.field}
                          align={col.field === 'actions' ? 'center' : 'left'}
                          sx={
                            col.field === 'actions' ? sxDashboardPage.tableCellAction :
                            col.field === 'owner' ? sxDashboardPage.tableCellOwner :
                            col.field === 'transferFormId' ? sxDashboardPage.tableCellTransferFormId :
                            sxDashboardPage.tableCellBase
                          }
                          component={col.field === 'owner' ? "th" : undefined}
                          scope={col.field === 'owner' ? "row" : undefined}
                        >
                          {col.field === 'actions' ? (
                            <IconButton
                              size="small"
                              onClick={() => navigate('/detail-list', { 
                                state: { 
                                  transferFormId: row.transferFormId,
                                  locationFrom: row.locationFrom,
                                  locationTo: row.locationTo,
                                  projectName: row.projectName,
                                  status: row.status,
                                  owner: row.owner,
                                  requestDate: row.requestDate,
                                  requester: row.requester,
                                  historyLog: row.historyLog || []
                                }
                              })}
                              sx={sxDashboardPage.iconButtonEditable(row.status)}
                              title={(row.status === 'Pending Review' || row.status === 'Pending Review(Approval)' || row.status === 'Transfer Report Mismatch' || row.status === 'Pending Review(Transfer Report Mismatch)') ? "Edit" : "View Details"}
                            >
                              {(row.status === 'Pending Review' || row.status === 'Pending Review(Approval)' || row.status === 'Transfer Report Mismatch' || row.status === 'Pending Review(Transfer Report Mismatch)') ? <Edit fontSize="small" /> : <Search fontSize="small" />}
                            </IconButton>
                          ) : col.field === 'status' ? (
                            getStatusChip(row.status)
                          ) : col.field === 'historyLog' ? (
                            Array.isArray(cellValue) ? `${cellValue.length} entries` : '-'
                          ) : (
                            String(cellValue || '-')
                          )}
                        </TableCell>
                      );
                    })}
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