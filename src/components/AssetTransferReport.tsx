import * as React from "react";
import { useNavigate } from 'react-router-dom';
import useConfirmation from '../utils/confirmationService';
import { sxAssetTransferReport } from '../styles/sx';
import { isFiniteNum, formatMoney, moneySx, parseDate, formatDateEng, formatDateThaiLong, formatLifeYear } from '../utils/formHelper'
import { HistoryLog, type HistoryLogEntry } from './HistoryLog';
import { exportAssetTransferReportToExcel } from '../utils/exportToExcel';
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { ExpandMore, History, Download } from '@mui/icons-material';

// ===================== Types =====================
export type AssetRow = {
  fromCostCenter: string;
  fromLocation: string;
  toCostCenter: string;
  toLocation: string;
  oracleAssetNo: string;
  assetBarcode?: string;
  assetNoWithChild?: 'Y' | 'N';
  transferType?: 'Fully' | 'Partial';
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
  owner?: string;
  requestDate?: string;
  requester?: string;
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
    owner?: string;
    requestDate?: string;
    requester?: string;
    historyLog?: HistoryLogEntry[];
  };
};



// Grouping key
const groupKey = (r: AssetRow) => [r.fromCostCenter, r.fromLocation, r.toCostCenter, r.toLocation].join("|:");

// ===================== Component =====================
export default function AssetTransferReport({ rows, transferFormData: initialTransferFormData }: AssetTransferReportProps) {
  const navigate = useNavigate();
  const { confirmProcess, confirmReject, confirmReProcess, showSuccess } = useConfirmation();

  // State to track the current transfer form data
  const [transferFormData, setTransferFormData] = React.useState(initialTransferFormData);

  // Load latest data from localStorage on mount and when needed
  React.useEffect(() => {
    const loadLatestData = () => {
      const storedData = localStorage.getItem('dashboardData');

      if (storedData && initialTransferFormData?.transferFormId) {
        try {
          const dashboardData = JSON.parse(storedData);
          const latestData = dashboardData.find((item: any) =>
            item.transferFormId === initialTransferFormData.transferFormId
          );

          if (latestData) {
            // Use the latest data from localStorage, especially for historyLog
            const updatedFormData = {
              ...initialTransferFormData,
              historyLog: latestData.historyLog || [],
              status: latestData.status,
              rejectReason: latestData.rejectReason
            };
            setTransferFormData(updatedFormData);
          } else {
            // If not found in localStorage, use initial data
            setTransferFormData(initialTransferFormData);
          }
        } catch (error) {
          console.error('Error parsing localStorage data:', error);
          setTransferFormData(initialTransferFormData);
        }
      } else {
        setTransferFormData(initialTransferFormData);
      }
    };

    loadLatestData();
  }, [initialTransferFormData]);

  // Column widths state for resizable functionality
  const [columnWidths, setColumnWidths] = React.useState({
    fromCostCenter: 120,
    fromLocation: 150,
    toCostCenter: 120,
    toLocation: 150,
    oracleAssetNo: 130,
    assetBarcode: 120,
    assetNoWithChild: 100,
    parentChildVerification: 150,
    transferType: 120,
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
  const [enableWordWrap] = React.useState(false);

  // Mouse position tracking for resize
  const [isResizing, setIsResizing] = React.useState<string | null>(null);
  const [startX, setStartX] = React.useState(0);
  const [startWidth, setStartWidth] = React.useState(0);
  const [dashboardDataState, setDashboardDataState] = React.useState<any[]>([]);


  // Handlers for Process and Reject using centralized confirmation
  const handleProceed = async () => {
    try {
      const isReprocess = transferFormData?.status === 'Transfer Report Mismatch' ||
        transferFormData?.status === 'Transfer Report Mismatch(Re-Process)' ||
        transferFormData?.status === 'Pending Review(Transfer Report Mismatch)' ||
        transferFormData?.status === 'Pending Re-Processing(Transfer Report Mismatch)';

      let reProcessData: { comment: string, files: File[] } | null = null;

      if (isReprocess) {
        // Use confirmReProcess for re-process cases (with comment and file upload)
        reProcessData = await confirmReProcess(transferFormData?.transferFormId);
      } else {
        // Use regular confirmProcess for initial process
        const confirmMessage = `Are you sure you want to process transfer form: ${transferFormData?.transferFormId}?`;
        await confirmProcess(confirmMessage);
      }

      // Update status in localStorage (or API call in real implementation)
      const storedData = localStorage.getItem('dashboardData');
      if (storedData) {
        const dashboardData = JSON.parse(storedData);
        // Find and update the item
        const updatedData = dashboardData.map((item: any) => {
          if (item.transferFormId === transferFormData?.transferFormId) {
            const newStatus = 'Completed';

            // Create new history log entry
            const historyComment = isReprocess
              ? (reProcessData?.comment
                ? `Re-processed: ${reProcessData.comment}`
                : "Re-processed successfully")
              : "Processed and approved successfully";

            const newHistoryEntry = {
              id: Date.now().toString(),
              status: newStatus,
              timestamp: new Date().toISOString(),
              user: "System Admin", // or get current user from context
              comment: historyComment,
              attachments: reProcessData?.files.length
                ? reProcessData.files.map(file => ({
                  id: Date.now().toString() + Math.random(),
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  category: 'Re-Process'
                }))
                : undefined
            };

            // Add to existing history log
            const updatedHistoryLog = [...(item.historyLog || []), newHistoryEntry];

            return {
              ...item,
              status: newStatus,
              historyLog: updatedHistoryLog
            };
          }
          return item;
        });

        localStorage.setItem('dashboardData', JSON.stringify(updatedData));
        setDashboardDataState(updatedData);
        // Update local state to show the new history log immediately
        const verifyData = JSON.parse(localStorage.getItem('dashboardData') || '[]');
        const verifyItem = verifyData.find((item: any) => item.transferFormId === transferFormData?.transferFormId);

        if (verifyItem) {
          const updatedFormData = {
            ...transferFormData,
            historyLog: [...(verifyItem.historyLog || [])], // Force new array reference
            status: verifyItem.status
          };
          setTransferFormData(updatedFormData);
        }
      }

      // Show success message and navigate to dashboard
      const successAction = isReprocess ? 're-processed' : 'approved';
      await showSuccess(`Transfer form ${transferFormData?.transferFormId} has been ${successAction} successfully!`);
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

        // Create new history log entry
        const newHistoryEntry = {
          id: Date.now().toString(),
          status: 'Reject',
          timestamp: new Date().toISOString(),
          user: "System Admin", // or get current user from context
          comment: rejectReason
        };

        // Find and update the item
        const updatedData = dashboardData.map((item: any) => {
          if (item.transferFormId === transferFormData?.transferFormId) {
            // Get existing history log or create new array
            const currentHistoryLog = item.historyLog || [];
            console.log("currentHistoryLog: ", currentHistoryLog)

            // Add new entry to history log
            const updatedHistoryLog = [...currentHistoryLog, newHistoryEntry];
            console.log("updatedHistoryLog: ", updatedHistoryLog)


            return {
              ...item,
              status: 'Reject',
              rejectReason: rejectReason,
              historyLog: updatedHistoryLog
            };
          }
          return item;
        });

        // Validate data before saving
        if (!Array.isArray(updatedData)) {
          console.error('Error: updatedData is not an array!');
          return;
        }

        console.log("updatedData before save: ", updatedData)
        // Save updated data
        localStorage.setItem('dashboardData', JSON.stringify(updatedData));
        setDashboardDataState(updatedData);
        // Verify the update and update local state
        const verifyData = JSON.parse(localStorage.getItem('dashboardData') || '[]');
        console.log("verifyData from localStorage: ", verifyData)
        const verifyItem = verifyData.find((item: any) => item.transferFormId === transferFormData?.transferFormId);
        console.log("verifyItem found: ", verifyItem)
        console.log("verifyItem historyLog: ", verifyItem?.historyLog)

        // Update local state to show the new history log immediately
        if (verifyItem) {
          const updatedFormData = {
            ...transferFormData,
            historyLog: [...(verifyItem.historyLog || [])], // Force new array reference
            status: verifyItem.status,
            rejectReason: verifyItem.rejectReason
          };
          setTransferFormData(updatedFormData);
        }
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
      sx={sxAssetTransferReport.resizeHandle}
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

  // type Group = { key: string; startIndex: number; size: number }; // Commented out as currently unused
  // Groups calculation (currently unused but kept for future use)
  // const groups: Group[] = React.useMemo(() => {
  //   const arr: Group[] = [];
  //   let i = 0;
  //   while (i < sorted.length) {
  //     const k = groupKey(sorted[i]);
  //     let j = i + 1;
  //     while (j < sorted.length && groupKey(sorted[j]) === k) j++;
  //     arr.push({ key: k, startIndex: i, size: j - i });
  //     i = j;
  //   }
  //   return arr;
  // }, [sorted]);

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

  // Export to Excel function using centralized utility
  const handleExportToExcel = () => {
    try {
      // Prepare asset data for export
      const assetData = sorted.map(row => [
        row.fromCostCenter,
        row.fromLocation,
        row.toCostCenter,
        row.toLocation,
        row.oracleAssetNo,
        row.assetBarcode || '-',
        row.assetNoWithChild || '-',
        row.assetNoWithChild === "Y" ? 'Pass' : row.assetNoWithChild === "N" ? 'Not Pass' : '-',
        row.transferType || '-',
        row.description,
        formatLifeYear(row.lifeYear),
        formatDateEng(row.assetStartDate),
        formatDateThaiLong(row.transferDate),
        isFiniteNum(row.unit) ? row.unit : '-',
        formatMoney(row.assetCost),
        formatMoney(row.nbv),
        row.oracleCategory || '-',
        row.remark || '-',
        row.transferVsNBV || '-',
        formatMoney(row.transferReport),
        row.transferVsFBDI || '-'
      ]);

      // Prepare totals row
      const totalsRow = [
        '', '', '', '', '', '', '', '', '', '', '', '', '', '',
        formatMoney(totalCost),
        formatMoney(totalNBV),
        '', '',
        formatMoney(totalNBV),
        '',
        formatMoney(totalTransferReport),
        ''
      ];

      // Use centralized export utility
      const success = exportAssetTransferReportToExcel(
        transferFormData,
        assetData,
        totalsRow
      );

      if (!success) {
        console.error('Export to Excel failed');
      }
    } catch (error) {
      console.error('Export to Excel failed:', error);
    }
  };

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

            <Box>
              <Typography variant="body2" sx={sxAssetTransferReport.transferFormLabel}>Owner:</Typography>
              <Typography variant="body2" sx={sxAssetTransferReport.transferFormValue}>{transferFormData.owner || 'N/A'}</Typography>
            </Box>

            <Box>
              <Typography variant="body2" sx={sxAssetTransferReport.transferFormLabel}>Request Date:</Typography>
              <Typography variant="body2" sx={sxAssetTransferReport.transferFormValue}>{transferFormData.requestDate || 'N/A'}</Typography>
            </Box>

            <Box>
              <Typography variant="body2" sx={sxAssetTransferReport.transferFormLabel}>Requester:</Typography>
              <Typography variant="body2" sx={sxAssetTransferReport.transferFormValue}>{transferFormData.requester || 'N/A'}</Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* History Log Accordion */}
      {transferFormData?.historyLog && transferFormData.historyLog.length > 0 && (
        <Accordion sx={sxAssetTransferReport.historyAccordion}>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="history-log-content"
            id="history-log-header"
            sx={sxAssetTransferReport.accordionSummary}
          >
            <Box sx={sxAssetTransferReport.accordionIcon}>
              <History sx={sxAssetTransferReport.historyIcon} />
              <Typography variant="h6" sx={sxAssetTransferReport.historyTitle}>
                History Log
              </Typography>
              <Chip
                label={`${transferFormData.historyLog.length} entries`}
                size="small"
                sx={sxAssetTransferReport.historyChip}
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={sxAssetTransferReport.accordionDetails}>
            <HistoryLog entries={transferFormData.historyLog} />
          </AccordionDetails>
        </Accordion>
      )}

      {/* Export Button */}
      <Stack direction="row" spacing={2} justifyContent="flex-end" className="no-print" sx={sxAssetTransferReport.exportButtonSection}>
        <Button
          variant="outlined"
          color="primary"
          size="large"
          startIcon={<Download />}
          sx={sxAssetTransferReport.exportButton}
          onClick={handleExportToExcel}
        >
          Export to Excel
        </Button>
      </Stack>

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
              <TableCell align="center" sx={sxAssetTransferReport.blueHeader} colSpan={5}>
                <Typography sx={sxAssetTransferReport.headerText}>Asset Identification</Typography>
              </TableCell>
              <TableCell align="center" sx={sxAssetTransferReport.greenHeaderCell(columnWidths.description)} rowSpan={2}>
                <Typography fontSize="16px" fontWeight={700}>Asset Description</Typography>
                <ResizeHandle columnKey="description" />
              </TableCell>
              <TableCell align="center" sx={sxAssetTransferReport.greenHeaderCell(columnWidths.lifeYear)} rowSpan={2}>
                <Typography fontSize="16px" fontWeight={700}>Life Year</Typography>
                <ResizeHandle columnKey="lifeYear" />
              </TableCell>
              <TableCell align="center" sx={sxAssetTransferReport.greenHeaderCell(columnWidths.startDate)} rowSpan={2}>
                <Typography fontSize="16px" fontWeight={700}>Start Date</Typography>
                <ResizeHandle columnKey="startDate" />
              </TableCell>
              <TableCell align="center" sx={sxAssetTransferReport.greenHeaderCell(columnWidths.transferDate)} rowSpan={2}>
                <Typography fontSize="16px" fontWeight={700}>Transfer Date</Typography>
                <ResizeHandle columnKey="transferDate" />
              </TableCell>
              <TableCell align="center" sx={sxAssetTransferReport.greenHeaderCell(columnWidths.units)} rowSpan={2}>
                <Typography fontSize="16px" fontWeight={700}>Units</Typography>
                <ResizeHandle columnKey="units" />
              </TableCell>
              <TableCell align="center" sx={sxAssetTransferReport.orangeHeaderCell(columnWidths.assetCost)} rowSpan={2}>
                <Typography fontSize="16px" fontWeight={700}>Asset Cost มูลค่าทรัพย์สิน CP Book</Typography>
                <ResizeHandle columnKey="assetCost" />
              </TableCell>
              <TableCell align="center" sx={sxAssetTransferReport.orangeHeaderCell(columnWidths.nbv)} rowSpan={2}>
                <Typography fontSize="16px" fontWeight={700}>Net Book Value มูลค่าปัจจุบันที่เหลือ (NBV) CP Book</Typography>
                <ResizeHandle columnKey="nbv" />
              </TableCell>
              <TableCell align="center" sx={sxAssetTransferReport.greenHeaderCell(columnWidths.oracleCategory)} rowSpan={2}>
                <Typography fontSize="16px" fontWeight={700}>Oracle Category</Typography>
                <ResizeHandle columnKey="oracleCategory" />
              </TableCell>
              <TableCell align="center" sx={sxAssetTransferReport.greenHeaderCell(columnWidths.remark)} rowSpan={2}>
                <Typography fontSize="16px" fontWeight={700}>Remark/Transfer reason</Typography>
                <ResizeHandle columnKey="remark" />
              </TableCell>
              <TableCell align="center" sx={sxAssetTransferReport.purpleHeader} colSpan={4}>
                <Typography fontSize="16px" fontWeight={700}>Reconciliation Status</Typography>
              </TableCell>
            </TableRow>

            {/* Second header row (sub columns) */}
            <TableRow sx={sxAssetTransferReport.stickySubHeaderRow}>
              <TableCell align="center" sx={sxAssetTransferReport.blueSubHeaderCell(columnWidths.fromCostCenter)}>
                <Typography fontSize="16px" fontWeight={600} color="#1565c0">From Cost Center</Typography>
                <ResizeHandle columnKey="fromCostCenter" />
              </TableCell>
              <TableCell align="center" sx={sxAssetTransferReport.blueSubHeaderCell(columnWidths.fromLocation)}>
                <Typography fontSize="16px" fontWeight={600} color="#1565c0">From Location</Typography>
                <ResizeHandle columnKey="fromLocation" />
              </TableCell>
              <TableCell align="center" sx={sxAssetTransferReport.blueSubHeaderCell(columnWidths.toCostCenter)}>
                <Typography fontSize="16px" fontWeight={600} color="#1565c0">To Cost Center</Typography>
                <ResizeHandle columnKey="toCostCenter" />
              </TableCell>
              <TableCell align="center" sx={sxAssetTransferReport.blueSubHeaderCell(columnWidths.toLocation)}>
                <Typography fontSize="16px" fontWeight={600} color="#1565c0">To Location</Typography>
                <ResizeHandle columnKey="toLocation" />
              </TableCell>
              <TableCell align="center" sx={sxAssetTransferReport.blueSubHeaderCell(columnWidths.oracleAssetNo)}>
                <Typography fontSize="16px" fontWeight={600} color="#1565c0">Oracle Asset No.</Typography>
                <ResizeHandle columnKey="oracleAssetNo" />
              </TableCell>
              <TableCell align="center" sx={sxAssetTransferReport.blueSubHeaderCell(columnWidths.assetBarcode)}>
                <Typography fontSize="16px" fontWeight={600} color="#1565c0">Asset Barcode</Typography>
                <ResizeHandle columnKey="assetBarcode" />
              </TableCell>
              <TableCell align="center" sx={sxAssetTransferReport.blueSubHeaderCell(columnWidths.assetNoWithChild)}>
                <Typography fontSize="16px" fontWeight={600} color="#1565c0">Asset No. With Child</Typography>
                <ResizeHandle columnKey="assetNoWithChild" />
              </TableCell>
              <TableCell align="center" sx={sxAssetTransferReport.blueSubHeaderCell(columnWidths.parentChildVerification)}>
                <Typography fontSize="16px" fontWeight={600} color="#1565c0">Parent-Child Verification</Typography>
                <ResizeHandle columnKey="parentChildVerification" />
              </TableCell>
              <TableCell align="center" sx={sxAssetTransferReport.blueSubHeaderCell(columnWidths.transferType)}>
                <Typography fontSize="16px" fontWeight={600} color="#1565c0">Transfer Type</Typography>
                <ResizeHandle columnKey="transferType" />
              </TableCell>
              <TableCell align="center" sx={sxAssetTransferReport.purpleSubHeaderCell(columnWidths.reconNBV)}>
                <Typography fontSize="16px" fontWeight={600} color="#7b1fa2">NBV</Typography>
                <ResizeHandle columnKey="reconNBV" />
              </TableCell>
              <TableCell align="center" sx={sxAssetTransferReport.purpleSubHeaderCell(columnWidths.formVsNBV)}>
                <Typography fontSize="16px" fontWeight={600} color="#7b1fa2">Form vs NBV</Typography>
                <ResizeHandle columnKey="formVsNBV" />
              </TableCell>
              <TableCell align="center" sx={sxAssetTransferReport.purpleSubHeaderCell(columnWidths.reportAmount)}>
                <Typography fontSize="16px" fontWeight={600} color="#7b1fa2">Report Amount</Typography>
                <ResizeHandle columnKey="reportAmount" />
              </TableCell>
              <TableCell align="center" sx={sxAssetTransferReport.purpleSubHeaderCell(columnWidths.reportVsFBDI)}>
                <Typography fontSize="16px" fontWeight={600} color="#7b1fa2">Report vs FBDI</Typography>
                <ResizeHandle columnKey="reportVsFBDI" />
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {sorted.map((r, idx) => (
              <TableRow
                key={`${r.oracleAssetNo}-${idx}`}
                sx={sxAssetTransferReport.bodyRow}
              >
                {/* All cells shown individually for each row */}
                <TableCell sx={sxAssetTransferReport.dynamicCell(columnWidths.fromCostCenter)}>
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
                <TableCell sx={sxAssetTransferReport.dynamicCell(columnWidths.toCostCenter)}>
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
                <TableCell sx={sxAssetTransferReport.dynamicStandardCell(columnWidths.oracleAssetNo)}>
                  {r.oracleAssetNo}
                </TableCell>
                <TableCell sx={sxAssetTransferReport.dynamicMonospaceCell(columnWidths.assetBarcode)}>
                  {r.assetBarcode || "-"}
                </TableCell>
                <TableCell sx={sxAssetTransferReport.dynamicStandardCell(columnWidths.assetNoWithChild)} align="center">
                  {r.assetNoWithChild ? (
                    <Chip
                      label={r.assetNoWithChild}
                      color={r.assetNoWithChild === "Y" ? "success" : "default"}
                      size="small"
                      sx={{ minWidth: 30, fontSize: '12px' }}
                    />
                  ) : "-"}
                </TableCell>
                <TableCell sx={sxAssetTransferReport.dynamicStandardCell(columnWidths.parentChildVerification)} align="center">
                  {r.assetNoWithChild === "Y" ? (
                    <Chip
                      label="Pass"
                      color="success"
                      size="small"
                      sx={{ minWidth: 60, fontSize: '12px' }}
                    />
                  ) : ""}
                </TableCell>
                <TableCell sx={sxAssetTransferReport.dynamicStandardCell(columnWidths.transferType)} align="center">
                  {r.transferType ? (
                    <Chip
                      label={r.transferType}
                      color={r.transferType === "Fully" ? "primary" : "warning"}
                      size="small"
                      sx={{ minWidth: 60, fontSize: '12px' }}
                    />
                  ) : "-"}
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
                <TableCell sx={sxAssetTransferReport.dynamicRightAlignCell(columnWidths.lifeYear)}>
                  {formatLifeYear(r.lifeYear)}
                </TableCell>
                <TableCell sx={sxAssetTransferReport.dynamicNoWrapCell(columnWidths.startDate)}>
                  {formatDateEng(r.assetStartDate)}
                </TableCell>
                <TableCell sx={sxAssetTransferReport.dynamicNoWrapCell(columnWidths.transferDate)}>
                  {formatDateThaiLong(r.transferDate)}
                </TableCell>
                <TableCell sx={sxAssetTransferReport.dynamicRightAlignCell(columnWidths.units)}>
                  {isFiniteNum(r.unit) ? r.unit : "-"}
                </TableCell>
                <TableCell sx={sxAssetTransferReport.dynamicStandardCell(columnWidths.assetCost)} align="right">
                  <Typography sx={{ ...moneySx(r.assetCost), fontSize: '12px' }}>
                    {formatMoney(r.assetCost)}
                  </Typography>
                </TableCell>
                <TableCell sx={sxAssetTransferReport.dynamicStandardCell(columnWidths.nbv)} align="right">
                  <Typography sx={{ ...moneySx(r.nbv), fontSize: '12px' }}>
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
                <TableCell sx={sxAssetTransferReport.dynamicStandardCell(columnWidths.reconNBV)} align="right">
                  <Typography sx={{ ...moneySx(r.nbv), fontSize: '12px' }}>
                    {formatMoney(r.nbv)}
                  </Typography>
                </TableCell>
                <TableCell sx={sxAssetTransferReport.dynamicStandardCell(columnWidths.formVsNBV)} align="center">
                  {r.transferVsNBV && (
                    <Chip
                      label={r.transferVsNBV}
                      color={r.transferVsNBV === "Matched" ? "success" : "error"}
                      size="small"
                      sx={sxAssetTransferReport.statusChip}
                    />
                  )}
                </TableCell>
                <TableCell sx={sxAssetTransferReport.dynamicStandardCell(columnWidths.reportAmount)} align="right">
                  <Typography sx={{ ...moneySx(r.transferReport), fontSize: '12px' }}>
                    {formatMoney(r.transferReport)}
                  </Typography>
                </TableCell>
                <TableCell sx={sxAssetTransferReport.dynamicStandardCell(columnWidths.reportVsFBDI)} align="center">
                  {r.transferVsFBDI && (
                    <Chip
                      label={r.transferVsFBDI}
                      color={r.transferVsFBDI === "Matched" ? "success" : "error"}
                      size="small"
                      sx={sxAssetTransferReport.statusChip}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}

            {/* Grand Total row */}
            <TableRow sx={sxAssetTransferReport.grandTotalRow}>
              <TableCell sx={sxAssetTransferReport.grandTotalLabelCell} colSpan={14}>
                <Typography variant="h6" sx={sxAssetTransferReport.grandTotalTypography}>
                  Grand Total
                </Typography>
              </TableCell>
              <TableCell sx={sxAssetTransferReport.grandTotalValueCell} align="right">
                <Typography sx={{ ...moneySx(totalCost), fontWeight: 700, fontSize: '16px' }}>
                  {formatMoney(totalCost)}
                </Typography>
              </TableCell>
              <TableCell sx={sxAssetTransferReport.grandTotalValueCell} align="right">
                <Typography sx={{ ...moneySx(totalNBV), fontWeight: 700, fontSize: '16px' }}>
                  {formatMoney(totalNBV)}
                </Typography>
              </TableCell>
              <TableCell sx={sxAssetTransferReport.grandTotalEmptyCell} colSpan={2}></TableCell>
              <TableCell sx={sxAssetTransferReport.grandTotalPurpleValueCell} align="right">
                <Typography sx={{ ...moneySx(totalNBV), fontWeight: 700, fontSize: '16px' }}>
                  {formatMoney(totalNBV)}
                </Typography>
              </TableCell>
              <TableCell sx={sxAssetTransferReport.grandTotalEmptyCell}></TableCell>
              <TableCell sx={sxAssetTransferReport.grandTotalGreenValueCell} align="right">
                <Typography sx={{ ...moneySx(totalTransferReport), fontWeight: 700, fontSize: '16px' }}>
                  {formatMoney(totalTransferReport)}
                </Typography>
              </TableCell>
              <TableCell sx={sxAssetTransferReport.grandTotalEmptyCell}></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>



      {/* Action Buttons - Show for Pending Review and Transfer Report Mismatch status */}
      {(transferFormData?.status === 'Pending Review' ||
        transferFormData?.status === 'Pending Review(Approval)' ||
        transferFormData?.status === 'Pending Review(Transfer Report Mismatch)' ||
        transferFormData?.status === 'Transfer Report Mismatch' ||
        transferFormData?.status === 'Transfer Report Mismatch(Re-Process)' ||
        transferFormData?.status === 'Pending Re-Processing(Transfer Report Mismatch)') && (
          <Stack direction="row" spacing={2} justifyContent="center" className="no-print" sx={sxAssetTransferReport.actionButtonsSection}>
            <Button
              variant="contained"
              color="success"
              size="large"
              sx={sxAssetTransferReport.actionButton}
              onClick={handleProceed}
            >
              {(transferFormData?.status === 'Transfer Report Mismatch' ||
                transferFormData?.status === 'Transfer Report Mismatch(Re-Process)' ||
                transferFormData?.status === 'Pending Review(Transfer Report Mismatch)' ||
                transferFormData?.status === 'Pending Re-Processing(Transfer Report Mismatch)') ? 'Re-process' : 'Proceed'}
            </Button>
            <Button
              variant="contained"
              color="error"
              size="large"
              sx={sxAssetTransferReport.actionButton}
              onClick={handleRejectClick}
            >
              Reject
            </Button>
          </Stack>
        )}

      <Divider sx={sxAssetTransferReport.footerDivider} className="no-print" />
      <Box className="no-print" sx={sxAssetTransferReport.footerBox}>
        <Typography variant="caption">
          * Negative values are shown in parentheses and red. Print in A4 landscape for best fidelity. Reconciliation status shows Matched/Mismatch.
        </Typography>
      </Box>

    </Box>
  );
}