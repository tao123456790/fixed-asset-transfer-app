import * as React from "react";
import { useNavigate } from 'react-router-dom';
import useConfirmation from '../utils/confirmationService';
import { sxCommon, sxAssetTransferReport, printCss } from '../styles/sx';
import { HistoryLog, type HistoryLogEntry } from './HistoryLog';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Divider,
  Stack,
  Chip,
  Tooltip,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { ExpandMore, History } from '@mui/icons-material';

// ===================== Types =====================
export type AssetRow = {
  fromCostCenter: string;
  fromLocation: string;
  toCostCenter: string;
  toLocation: string;
  oracleAssetNo: string;
  assetBarcode?: string;
  description: string;
  lifeYear?: number | null;
  assetStartDate?: string | null; // ISO or dd-MMM-yy
  transferDate?: string | null;   // ISO
  unit?: number | null;
  assetCost?: number | null;      // CP Book
  nbv?: number | null;            // NBV CP Book
  oracleCategory?: string;
  remark?: string;
  transferVsNBV?: 'Matched' | 'Mismatch';
  transferReport?: number | null;
  transferVsFBDI?: 'Matched' | 'Mismatch';
};

export type AssetTransferReportProps = {
  title?: string;
  rows: AssetRow[];
  transferFormData?: {
    transferFormId?: string;
    locationFrom?: string;
    locationTo?: string;
    projectName?: string;
    status?: string;
    historyLog?: HistoryLogEntry[];
  };
};

// ===================== Helpers =====================
const isFiniteNum = (n: any) => typeof n === "number" && Number.isFinite(n);

const formatMoney = (n?: number | null) => {
  if (n == null || !isFiniteNum(n)) return "-";
  const abs = Math.abs(n);
  const base = abs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (n < 0) return `(${base})`;
  if (n === 0) return "-";
  return base;
};

const moneySx = (n?: number | null) => sxAssetTransferReport.moneyText(n != null && n < 0);

const formatLifeYear = (n?: number | null) => {
  if (n == null || !isFiniteNum(n)) return "-";
  const s = n.toFixed(2);
  return s.replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
};

const parseDate = (d?: string | null) => {
  if (!d) return null;
  const dt = new Date(d);
  return isNaN(+dt) ? null : dt;
};

const formatDateEng = (d?: string | null) => {
  const dt = parseDate(d);
  if (!dt) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  }).format(dt);
};

const formatDateThaiLong = (d?: string | null) => {
  const dt = parseDate(d);
  if (!dt) return "-";
  // Thai Buddhist year
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(dt);
};

// Grouping key
const groupKey = (r: AssetRow) => [r.fromCostCenter, r.fromLocation, r.toCostCenter, r.toLocation].join("|:");

// ===================== Component =====================
export default function AssetTransferReport({ title = "Asset Transfer Report", rows, transferFormData }: AssetTransferReportProps) {
  const navigate = useNavigate();
  const { confirmProcess, confirmReject, showSuccess, showError } = useConfirmation();
  
  // Column widths state for resizable functionality
  const [columnWidths, setColumnWidths] = React.useState({
    fromCostCenter: 120,
    fromLocation: 150,
    toCostCenter: 120,
    toLocation: 150,
    oracleAssetNo: 130,
    assetBarcode: 120,
    description: 200,
    lifeYear: 80,
    startDate: 100,
    transferDate: 120,
    units: 70,
    assetCost: 140,
    nbv: 140,
    oracleCategory: 120,
    remark: 150,
    reconNBV: 120,
    formVsNBV: 110,
    reportAmount: 130,
    reportVsFBDI: 110,
  });

  // Word wrap toggle state
  const [enableWordWrap, setEnableWordWrap] = React.useState(false);

  // Mouse position tracking for resize
  const [isResizing, setIsResizing] = React.useState<string | null>(null);
  const [startX, setStartX] = React.useState(0);
  const [startWidth, setStartWidth] = React.useState(0);

  // Handlers for Process and Reject using centralized confirmation
  const handleProceed = async () => {
    try {
      await confirmProcess(`Are you sure you want to process transfer form: ${transferFormData?.transferFormId}?`);
      
      // Update status in localStorage (or API call in real implementation)
      const storedData = localStorage.getItem('dashboardData');
      if (storedData) {
        const dashboardData = JSON.parse(storedData);
        // Find and update the item
        const updatedData = dashboardData.map((item: any) => {
          if (item.transferFormId === transferFormData?.transferFormId) {
            return { ...item, status: 'Approved' };
          }
          return item;
        });
        localStorage.setItem('dashboardData', JSON.stringify(updatedData));
      }
      
      // Show success message and navigate to dashboard
      await showSuccess(`Transfer form ${transferFormData?.transferFormId} has been approved successfully!`);
      navigate('/dashboard');
      
    } catch (error) {
      // User cancelled or error occurred
      console.log('Process cancelled or failed:', error);
    }
  };

  const handleRejectClick = async () => {
    try {
      const rejectReason = await confirmReject(transferFormData?.transferFormId);
      
      // Update status in localStorage (or API call in real implementation)
      const storedData = localStorage.getItem('dashboardData');
      if (storedData) {
        const dashboardData = JSON.parse(storedData);
        // Find and update the item
        const updatedData = dashboardData.map((item: any) => {
          if (item.transferFormId === transferFormData?.transferFormId) {
            return { 
              ...item, 
              status: 'Reject',
              rejectReason: rejectReason 
            };
          }
          return item;
        });
        localStorage.setItem('dashboardData', JSON.stringify(updatedData));
      }
      
      // Show success message and navigate to dashboard
      await showSuccess(`Transfer form ${transferFormData?.transferFormId} has been rejected successfully!`);
      navigate('/dashboard');
      
    } catch (error) {
      // User cancelled or error occurred
      console.log('Reject cancelled or failed:', error);
    }
  };

  // Handle mouse down on resize handle
  const handleMouseDown = (e: React.MouseEvent, columnKey: string) => {
    setIsResizing(columnKey);
    setStartX(e.pageX);
    setStartWidth(columnWidths[columnKey as keyof typeof columnWidths]);
    e.preventDefault();
  };

  // Handle mouse move during resize
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const diff = e.pageX - startX;
      const newWidth = Math.max(50, startWidth + diff); // Min width 50px
      
      setColumnWidths(prev => ({
        ...prev,
        [isResizing]: newWidth
      }));
    };

    const handleMouseUp = () => {
      setIsResizing(null);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, startX, startWidth]);

  // Resize handle component
  const ResizeHandle: React.FC<{ columnKey: string }> = ({ columnKey }) => (
    <Box
      sx={{
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 4,
        cursor: 'col-resize',
        backgroundColor: 'transparent',
        '&:hover': {
          backgroundColor: '#2196f3',
          opacity: 0.7,
        },
        zIndex: 10,
      }}
      onMouseDown={(e) => handleMouseDown(e, columnKey)}
    />
  );

  // Get cell styling based on text length (auto wrap for 40+ chars)
  const getCellStyle = (baseStyle: any, text: string = '') => {
    const dynamicStyle = sxAssetTransferReport.getCellStyle(enableWordWrap, text);
    return {
      ...baseStyle,
      ...dynamicStyle,
    };
  };
  // sort + group
  const sorted = React.useMemo(() => {
    return [...rows].sort((a, b) => {
      const ka = groupKey(a);
      const kb = groupKey(b);
      if (ka < kb) return -1; if (ka > kb) return 1;
      // then by oracle asset, barcode
      if (a.oracleAssetNo < b.oracleAssetNo) return -1; if (a.oracleAssetNo > b.oracleAssetNo) return 1;
      const ab = a.assetBarcode ?? "";
      const bb = b.assetBarcode ?? "";
      if (ab < bb) return -1; if (ab > bb) return 1;
      return 0;
    });
  }, [rows]);

  type Group = { key: string; startIndex: number; size: number };
  const groups: Group[] = React.useMemo(() => {
    const arr: Group[] = [];
    let i = 0;
    while (i < sorted.length) {
      const k = groupKey(sorted[i]);
      let j = i + 1;
      while (j < sorted.length && groupKey(sorted[j]) === k) j++;
      arr.push({ key: k, startIndex: i, size: j - i });
      i = j;
    }
    return arr;
  }, [sorted]);

  const totalCost = React.useMemo(() => sorted.reduce((s, r) => s + (isFiniteNum(r.assetCost) ? (r.assetCost as number) : 0), 0), [sorted]);
  const totalNBV = React.useMemo(() => sorted.reduce((s, r) => s + (isFiniteNum(r.nbv) ? (r.nbv as number) : 0), 0), [sorted]);
  const totalTransferReport = React.useMemo(() => sorted.reduce((s, r) => s + (isFiniteNum(r.transferReport) ? (r.transferReport as number) : 0), 0), [sorted]);

  // Print styles
  const printCss = `
    @page { size: A4 landscape; margin: 12mm; }
    @media print {
      .no-print { display: none; }
      table { page-break-inside: auto; }
      tr { page-break-inside: avoid; page-break-after: auto; }
      thead { display: table-header-group; }
      tfoot { display: table-footer-group; }
    }
  `;

  return (
    <Box>
      <style>{printCss}</style>  
      {/* Transfer Form Information */}
      {transferFormData && (
        <Box sx={sxAssetTransferReport.transferFormSection}>
          <Typography variant="subtitle2" sx={sxAssetTransferReport.transferFormTitle}>
            Transfer Form Information
          </Typography>
          <Box sx={sxAssetTransferReport.transferFormGrid}>
            <Box>
              <Typography variant="body2" sx={sxAssetTransferReport.transferFormLabel}>Transfer Form ID:</Typography>
              <Typography variant="body2" sx={sxAssetTransferReport.transferFormValue}>{transferFormData.transferFormId || 'N/A'}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={sxAssetTransferReport.transferFormLabel}>Location From:</Typography>
              <Typography variant="body2" sx={sxAssetTransferReport.transferFormValue}>{transferFormData.locationFrom || 'N/A'}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={sxAssetTransferReport.transferFormLabel}>Location To:</Typography>
              <Typography variant="body2" sx={sxAssetTransferReport.transferFormValue}>{transferFormData.locationTo || 'N/A'}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={sxAssetTransferReport.transferFormLabel}>Project Name:</Typography>
              <Typography variant="body2" sx={sxAssetTransferReport.transferFormValue}>{transferFormData.projectName || 'N/A'}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={sxAssetTransferReport.transferFormLabel}>Status:</Typography>
              <Typography variant="body2" sx={sxAssetTransferReport.transferFormValue}>{transferFormData.status || 'N/A'}</Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* History Log Accordion */}
      {transferFormData?.historyLog && transferFormData.historyLog.length > 0 && (
        <Accordion sx={{ mb: 3 }}>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="history-log-content"
            id="history-log-header"
            sx={{
              bgcolor: '#f8f9fa',
              border: '1px solid #dee2e6',
              '&:hover': {
                bgcolor: '#e9ecef'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <History sx={{ color: '#6c757d' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#495057' }}>
                History Log
              </Typography>
              <Chip 
                label={`${transferFormData.historyLog.length} entries`}
                size="small"
                sx={{ ml: 1 }}
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <HistoryLog entries={transferFormData.historyLog} />
          </AccordionDetails>
        </Accordion>
      )}

      <TableContainer 
        component={Paper} 
        elevation={2} 
        sx={sxAssetTransferReport.tableContainer}
      >
        <Table size="medium" aria-label="asset-transfer-table" sx={sxAssetTransferReport.table}>
          <TableHead sx={sxAssetTransferReport.tableHead}>
            {/* Top header row (group titles) */}
            <TableRow sx={sxAssetTransferReport.topHeaderRow}>
              <TableCell align="center" sx={sxAssetTransferReport.blueHeader} colSpan={4}>
                <Typography sx={sxAssetTransferReport.headerText}>Transfer Locations</Typography>
              </TableCell>
              <TableCell align="center" sx={sxAssetTransferReport.blueHeader} colSpan={2}>
                <Typography sx={sxAssetTransferReport.headerText}>Asset Identification</Typography>
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: '#4caf50', color: 'white', border: 2, borderColor: '#388e3c', py: 1.5, width: columnWidths.description, position: 'relative' }} rowSpan={2}>
                <Typography fontSize="16px" fontWeight={700}>Asset Description</Typography>
                <ResizeHandle columnKey="description" />
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: '#4caf50', color: 'white', border: 2, borderColor: '#388e3c', py: 1.5, width: columnWidths.lifeYear, position: 'relative' }} rowSpan={2}>
                <Typography fontSize="16px" fontWeight={700}>Life Year</Typography>
                <ResizeHandle columnKey="lifeYear" />
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: '#4caf50', color: 'white', border: 2, borderColor: '#388e3c', py: 1.5, width: columnWidths.startDate, position: 'relative' }} rowSpan={2}>
                <Typography fontSize="16px" fontWeight={700}>Start Date</Typography>
                <ResizeHandle columnKey="startDate" />
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: '#4caf50', color: 'white', border: 2, borderColor: '#388e3c', py: 1.5, width: columnWidths.transferDate, position: 'relative' }} rowSpan={2}>
                <Typography fontSize="16px" fontWeight={700}>Transfer Date</Typography>
                <ResizeHandle columnKey="transferDate" />
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: '#4caf50', color: 'white', border: 2, borderColor: '#388e3c', py: 1.5, width: columnWidths.units, position: 'relative' }} rowSpan={2}>
                <Typography fontSize="16px" fontWeight={700}>Units</Typography>
                <ResizeHandle columnKey="units" />
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: '#ff9800', color: 'white', border: 2, borderColor: '#f57c00', py: 1.5, width: columnWidths.assetCost, position: 'relative' }} rowSpan={2}>
                <Typography fontSize="16px" fontWeight={700}>Asset Cost มูลค่าทรัพย์สิน CP Book</Typography>
                <ResizeHandle columnKey="assetCost" />
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: '#ff9800', color: 'white', border: 2, borderColor: '#f57c00', py: 1.5, width: columnWidths.nbv, position: 'relative' }} rowSpan={2}>
                <Typography fontSize="16px" fontWeight={700}>Net Book Value มูลค่าปัจจุบันที่เหลือ (NBV) CP Book</Typography>
                <ResizeHandle columnKey="nbv" />
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: '#4caf50', color: 'white', border: 2, borderColor: '#388e3c', py: 1.5, width: columnWidths.oracleCategory, position: 'relative' }} rowSpan={2}>
                <Typography fontSize="16px" fontWeight={700}>Oracle Category</Typography>
                <ResizeHandle columnKey="oracleCategory" />
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: '#4caf50', color: 'white', border: 2, borderColor: '#388e3c', py: 1.5, width: columnWidths.remark, position: 'relative' }} rowSpan={2}>
                <Typography fontSize="16px" fontWeight={700}>Remark/Transfer reason</Typography>
                <ResizeHandle columnKey="remark" />
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: '#9c27b0', color: 'white', border: 2, borderColor: '#7b1fa2', py: 1.5 }} colSpan={4}>
                <Typography fontSize="16px" fontWeight={700}>Reconciliation Status</Typography>
              </TableCell>
            </TableRow>

            {/* Second header row (sub columns) */}
            <TableRow sx={{ 
              position: 'sticky',
              top: '56px', // Height of first header row
              zIndex: 101,
              '& .MuiTableCell-root': {
                position: 'sticky',
                top: '56px',
                zIndex: 101
              }
            }}>
              <TableCell align="center" sx={{ bgcolor: '#bbdefb', border: 2, borderColor: '#1976d2', py: 1, width: columnWidths.fromCostCenter, position: 'relative' }}>
                <Typography fontSize="16px" fontWeight={600} color="#1565c0">From Cost Center</Typography>
                <ResizeHandle columnKey="fromCostCenter" />
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: '#bbdefb', border: 2, borderColor: '#1976d2', py: 1, width: columnWidths.fromLocation, position: 'relative' }}>
                <Typography fontSize="16px" fontWeight={600} color="#1565c0">From Location</Typography>
                <ResizeHandle columnKey="fromLocation" />
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: '#bbdefb', border: 2, borderColor: '#1976d2', py: 1, width: columnWidths.toCostCenter, position: 'relative' }}>
                <Typography fontSize="16px" fontWeight={600} color="#1565c0">To Cost Center</Typography>
                <ResizeHandle columnKey="toCostCenter" />
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: '#bbdefb', border: 2, borderColor: '#1976d2', py: 1, width: columnWidths.toLocation, position: 'relative' }}>
                <Typography fontSize="16px" fontWeight={600} color="#1565c0">To Location</Typography>
                <ResizeHandle columnKey="toLocation" />
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: '#bbdefb', border: 2, borderColor: '#1976d2', py: 1, width: columnWidths.oracleAssetNo, position: 'relative' }}>
                <Typography fontSize="16px" fontWeight={600} color="#1565c0">Oracle Asset No.</Typography>
                <ResizeHandle columnKey="oracleAssetNo" />
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: '#bbdefb', border: 2, borderColor: '#1976d2', py: 1, width: columnWidths.assetBarcode, position: 'relative' }}>
                <Typography fontSize="16px" fontWeight={600} color="#1565c0">Asset Barcode</Typography>
                <ResizeHandle columnKey="assetBarcode" />
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: '#e1bee7', border: 2, borderColor: '#7b1fa2', py: 1, width: columnWidths.reconNBV, position: 'relative' }}>
                <Typography fontSize="16px" fontWeight={600} color="#7b1fa2">NBV</Typography>
                <ResizeHandle columnKey="reconNBV" />
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: '#e1bee7', border: 2, borderColor: '#7b1fa2', py: 1, width: columnWidths.formVsNBV, position: 'relative' }}>
                <Typography fontSize="16px" fontWeight={600} color="#7b1fa2">Form vs NBV</Typography>
                <ResizeHandle columnKey="formVsNBV" />
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: '#e1bee7', border: 2, borderColor: '#7b1fa2', py: 1, width: columnWidths.reportAmount, position: 'relative' }}>
                <Typography fontSize="16px" fontWeight={600} color="#7b1fa2">Report Amount</Typography>
                <ResizeHandle columnKey="reportAmount" />
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: '#e1bee7', border: 2, borderColor: '#7b1fa2', py: 1, width: columnWidths.reportVsFBDI, position: 'relative' }}>
                <Typography fontSize="16px" fontWeight={600} color="#7b1fa2">Report vs FBDI</Typography>
                <ResizeHandle columnKey="reportVsFBDI" />
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {sorted.map((r, idx) => (
              <TableRow 
                key={`${r.oracleAssetNo}-${idx}`}
                sx={{ 
                  '&:hover': { 
                    bgcolor: '#f8f9fa'
                  },
                  '&:nth-of-type(even)': {
                    bgcolor: '#fafafa'
                  }
                }}
              > 
                {/* All cells shown individually for each row */}
                <TableCell sx={{ 
                  border: 1, 
                  borderColor: '#e0e0e0',
                  fontWeight: 600, 
                  py: 1,
                  width: columnWidths.fromCostCenter,
                  fontSize: '12px'
                }}>
                  {r.fromCostCenter}
                </TableCell>
                <TableCell sx={getCellStyle({ 
                  border: 1, 
                  borderColor: '#e0e0e0',
                  py: 1,
                  width: columnWidths.fromLocation,
                  fontSize: '12px'
                }, r.fromLocation)}>
                  {(enableWordWrap || r.fromLocation.length > 60) ? (
                    <span>{r.fromLocation}</span>
                  ) : (
                    <Tooltip title={r.fromLocation} arrow>
                      <span>{r.fromLocation}</span>
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell sx={{ 
                  border: 1, 
                  borderColor: '#e0e0e0',
                  fontWeight: 600, 
                  py: 1,
                  width: columnWidths.toCostCenter,
                  fontSize: '12px'
                }}>
                  {r.toCostCenter}
                </TableCell>
                <TableCell sx={getCellStyle({ 
                  border: 1, 
                  borderColor: '#e0e0e0',
                  py: 1,
                  width: columnWidths.toLocation,
                  fontSize: '12px'
                }, r.toLocation)}>
                  {(enableWordWrap || r.toLocation.length > 60) ? (
                    <span>{r.toLocation}</span>
                  ) : (
                    <Tooltip title={r.toLocation} arrow>
                      <span>{r.toLocation}</span>
                    </Tooltip>
                  )}
                </TableCell>

                {/* Asset identification cells */}
                <TableCell sx={{ 
                  border: 1, 
                  borderColor: '#e0e0e0',
                  fontWeight: 500,
                  py: 1,
                  width: columnWidths.oracleAssetNo,
                  fontSize: '12px'
                }}>
                  {r.oracleAssetNo}
                </TableCell>
                <TableCell sx={{ 
                  border: 1, 
                  borderColor: '#e0e0e0',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  py: 1,
                  width: columnWidths.assetBarcode
                }}>
                  {r.assetBarcode || "-"}
                </TableCell>
                <TableCell sx={getCellStyle({ 
                  border: 1, 
                  borderColor: '#e0e0e0',
                  py: 1,
                  width: columnWidths.description,
                  fontSize: '12px'
                }, r.description)}>
                  {(enableWordWrap || r.description.length > 60) ? (
                    <span>{r.description}</span>
                  ) : (
                    <Tooltip title={r.description} arrow>
                      <span>{r.description}</span>
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell sx={{ 
                  border: 1, 
                  borderColor: '#e0e0e0',
                  textAlign: "right",
                  py: 1,
                  width: columnWidths.lifeYear,
                  fontSize: '12px'
                }}>
                  {formatLifeYear(r.lifeYear)}
                </TableCell>
                <TableCell sx={{ 
                  border: 1, 
                  borderColor: '#e0e0e0',
                  whiteSpace: "nowrap",
                  py: 1,
                  width: columnWidths.startDate,
                  fontSize: '12px'
                }}>
                  {formatDateEng(r.assetStartDate)}
                </TableCell>
                <TableCell sx={{ 
                  border: 1, 
                  borderColor: '#e0e0e0',
                  whiteSpace: "nowrap",
                  py: 1,
                  width: columnWidths.transferDate,
                  fontSize: '12px'
                }}>
                  {formatDateThaiLong(r.transferDate)}
                </TableCell>
                <TableCell sx={{ 
                  border: 1, 
                  borderColor: '#e0e0e0',
                  textAlign: "right",
                  py: 1,
                  width: columnWidths.units,
                  fontSize: '12px'
                }}>
                  {isFiniteNum(r.unit) ? r.unit : "-"}
                </TableCell>
                <TableCell sx={{ 
                  border: 1, 
                  borderColor: '#e0e0e0',
                  py: 1,
                  width: columnWidths.assetCost,
                  fontSize: '12px'
                }} align="right">
                  <Typography sx={{...moneySx(r.assetCost), fontSize: '12px'}}>
                    {formatMoney(r.assetCost)}
                  </Typography>
                </TableCell>
                <TableCell sx={{ 
                  border: 1, 
                  borderColor: '#e0e0e0',
                  py: 1,
                  width: columnWidths.nbv,
                  fontSize: '12px'
                }} align="right">
                  <Typography sx={{...moneySx(r.nbv), fontSize: '12px'}}>
                    {formatMoney(r.nbv)}
                  </Typography>
                </TableCell>
                <TableCell sx={getCellStyle({ 
                  border: 1, 
                  borderColor: '#e0e0e0',
                  fontSize: '12px',
                  py: 1,
                  width: columnWidths.oracleCategory
                }, r.oracleCategory || "")}>
                  {(enableWordWrap || (r.oracleCategory || "").length > 60) ? (
                    <span>{r.oracleCategory || "-"}</span>
                  ) : (
                    <Tooltip title={r.oracleCategory || "-"} arrow>
                      <span>{r.oracleCategory || "-"}</span>
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell sx={getCellStyle({ 
                  border: 1, 
                  borderColor: '#e0e0e0',
                  fontSize: '12px',
                  py: 1,
                  width: columnWidths.remark
                }, r.remark || "")}>
                  {(enableWordWrap || (r.remark || "").length > 60) ? (
                    <span>{r.remark || "-"}</span>
                  ) : (
                    <Tooltip title={r.remark || "-"} arrow>
                      <span>{r.remark || "-"}</span>
                    </Tooltip>
                  )}
                </TableCell>
                
                {/* Reconciliation columns */}
                <TableCell sx={{ 
                  border: 1, 
                  borderColor: '#e0e0e0',
                  py: 1,
                  width: columnWidths.reconNBV,
                  fontSize: '12px'
                }} align="right">
                  <Typography sx={{...moneySx(r.nbv), fontSize: '12px'}}>
                    {formatMoney(r.nbv)}
                  </Typography>
                </TableCell>
                <TableCell sx={{ 
                  border: 1, 
                  borderColor: '#e0e0e0',
                  py: 1,
                  width: columnWidths.formVsNBV,
                  fontSize: '12px'
                }} align="center">
                  {r.transferVsNBV && (
                    <Chip 
                      label={r.transferVsNBV} 
                      color={r.transferVsNBV === "Matched" ? "success" : "error"} 
                      size="small"
                      sx={{ 
                        fontWeight: 600,
                        fontSize: '12px'
                      }}
                    />
                  )}
                </TableCell>
                <TableCell sx={{ 
                  border: 1, 
                  borderColor: '#e0e0e0',
                  py: 1,
                  width: columnWidths.reportAmount,
                  fontSize: '12px'
                }} align="right">
                  <Typography sx={{...moneySx(r.transferReport), fontSize: '12px'}}>
                    {formatMoney(r.transferReport)}
                  </Typography>
                </TableCell>
                <TableCell sx={{ 
                  border: 1, 
                  borderColor: '#e0e0e0',
                  py: 1,
                  width: columnWidths.reportVsFBDI,
                  fontSize: '12px'
                }} align="center">
                  {r.transferVsFBDI && (
                    <Chip 
                      label={r.transferVsFBDI} 
                      color={r.transferVsFBDI === "Matched" ? "success" : "error"} 
                      size="small"
                      sx={{ 
                        fontWeight: 600,
                        fontSize: '12px'
                      }}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}

            {/* Grand Total row */}
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell sx={{ 
                border: 1, 
                borderColor: '#ccc',
                fontWeight: 700, 
                py: 1.5,
                bgcolor: '#e0e0e0',
                fontSize: '16px'
              }} colSpan={11}>
                <Typography variant="h6" fontWeight={700} sx={{ fontSize: '16px' }}>
                  Grand Total
                </Typography>
              </TableCell>
              <TableCell sx={{ 
                border: 1, 
                borderColor: '#ccc',
                bgcolor: '#fff3e0',
                py: 1.5,
                fontSize: '16px'
              }} align="right">
                <Typography sx={{...moneySx(totalCost), fontWeight: 700, fontSize: '16px'}}>
                  {formatMoney(totalCost)}
                </Typography>
              </TableCell>
              <TableCell sx={{ 
                border: 1, 
                borderColor: '#ccc',
                bgcolor: '#fff3e0',
                py: 1.5,
                fontSize: '16px'
              }} align="right">
                <Typography sx={{...moneySx(totalNBV), fontWeight: 700, fontSize: '16px'}}>
                  {formatMoney(totalNBV)}
                </Typography>
              </TableCell>
              <TableCell sx={{ border: 1, borderColor: '#ccc', bgcolor: '#e0e0e0', fontSize: '14px' }} colSpan={2}></TableCell>
              <TableCell sx={{ 
                border: 1, 
                borderColor: '#ccc',
                bgcolor: '#e1bee7',
                py: 1.5,
                fontSize: '16px'
              }} align="right">
                <Typography sx={{...moneySx(totalNBV), fontWeight: 700, fontSize: '16px'}}>
                  {formatMoney(totalNBV)}
                </Typography>
              </TableCell>
              <TableCell sx={{ border: 1, borderColor: '#ccc', bgcolor: '#e0e0e0', fontSize: '14px' }}></TableCell>
              <TableCell sx={{ 
                border: 1, 
                borderColor: '#ccc',
                bgcolor: '#c8e6c9',
                py: 1.5,
                fontSize: '16px'
              }} align="right">
                <Typography sx={{...moneySx(totalTransferReport), fontWeight: 700, fontSize: '16px'}}>
                  {formatMoney(totalTransferReport)}
                </Typography>
              </TableCell>
              <TableCell sx={{ border: 1, borderColor: '#ccc', bgcolor: '#e0e0e0', fontSize: '14px' }}></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Buttons - Only show for Pending Review status */}
      {transferFormData?.status === 'Pending Review' && (
        <Stack direction="row" spacing={2} justifyContent="center" className="no-print" sx={{ mt: 3, mb: 2 }}>
          <Button
            variant="contained"
            color="success"
            size="large"
            sx={{ 
              fontSize: '16px',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              borderRadius: 2
            }}
            onClick={handleProceed}
          >
              Proceed
          </Button>
          <Button
            variant="contained"
            color="error"
            size="large"
            sx={{ 
              fontSize: '16px',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              borderRadius: 2
            }}
            onClick={handleRejectClick}
          >
              Reject
          </Button>
        </Stack>
      )}

      <Divider sx={{ my: 2 }} className="no-print" />
      <Box className="no-print" sx={{ color: "text.secondary" }}>
        <Typography variant="caption">
          * Negative values are shown in parentheses and red. Print in A4 landscape for best fidelity. Reconciliation status shows Matched/Mismatch.
        </Typography>
      </Box>

    </Box>
  );
}