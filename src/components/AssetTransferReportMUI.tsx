import * as React from "react";
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
} from "@mui/material";

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

const moneySx = (n?: number | null) => ({
  color: n != null && n < 0 ? "error.main" : "text.primary",
  fontWeight: 500,
  textAlign: "right" as const,
  whiteSpace: "nowrap" as const,
});

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
export default function AssetTransferReportMUI({ title = "Asset Transfer Report", rows, transferFormData }: AssetTransferReportProps) {
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
      <Stack direction="row" alignItems="center" justifyContent="space-between" className="no-print" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>{title}</Typography>
      </Stack>
      
      {/* Transfer Form Information */}
      {transferFormData && (
        <Box sx={{ mb: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 1, border: '1px solid #dee2e6' }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: '#495057' }}>
            Transfer Form Information
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#6c757d' }}>Transfer Form ID:</Typography>
              <Typography variant="body2" sx={{ color: '#212529' }}>{transferFormData.transferFormId || 'N/A'}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#6c757d' }}>Location From:</Typography>
              <Typography variant="body2" sx={{ color: '#212529' }}>{transferFormData.locationFrom || 'N/A'}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#6c757d' }}>Location To:</Typography>
              <Typography variant="body2" sx={{ color: '#212529' }}>{transferFormData.locationTo || 'N/A'}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#6c757d' }}>Project Name:</Typography>
              <Typography variant="body2" sx={{ color: '#212529' }}>{transferFormData.projectName || 'N/A'}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#6c757d' }}>Status:</Typography>
              <Typography variant="body2" sx={{ color: '#212529' }}>{transferFormData.status || 'N/A'}</Typography>
            </Box>
          </Box>
        </Box>
      )}
      <TableContainer component={Paper} elevation={2} sx={{ maxHeight: '80vh', overflowX: 'auto', overflowY: 'auto', borderRadius: 2 }}>
        <Table size="medium" aria-label="asset-transfer-table" sx={{ minWidth: 1800, borderCollapse: "separate", borderSpacing: 1 }}>
          <TableHead>
            {/* Top header row (group titles) */}
            <TableRow>
              <TableCell align="center" sx={{ bgcolor: '#2196f3', color: 'white', border: 2, borderColor: '#1976d2', py: 1.5 }} colSpan={4}>
                <Typography fontSize="14px" fontWeight={700}>Transfer Locations</Typography>
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: '#2196f3', color: 'white', border: 2, borderColor: '#1976d2', py: 1.5 }} colSpan={2}>
                <Typography fontSize="14px" fontWeight={700}>Asset Identification</Typography>
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: '#4caf50', color: 'white', border: 2, borderColor: '#388e3c', py: 1.5 }} rowSpan={2}>
                <Typography fontSize="13px" fontWeight={700}>Asset Description</Typography>
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: '#4caf50', color: 'white', border: 2, borderColor: '#388e3c', py: 1.5 }} rowSpan={2}>
                <Typography fontSize="13px" fontWeight={700}>Life Year</Typography>
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: '#4caf50', color: 'white', border: 2, borderColor: '#388e3c', py: 1.5 }} rowSpan={2}>
                <Typography fontSize="13px" fontWeight={700}>Start Date</Typography>
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: '#4caf50', color: 'white', border: 2, borderColor: '#388e3c', py: 1.5 }} rowSpan={2}>
                <Typography fontSize="13px" fontWeight={700}>Transfer Date</Typography>
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: '#4caf50', color: 'white', border: 2, borderColor: '#388e3c', py: 1.5 }} rowSpan={2}>
                <Typography fontSize="13px" fontWeight={700}>Units</Typography>
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: '#ff9800', color: 'white', border: 2, borderColor: '#f57c00', py: 1.5 }} rowSpan={2}>
                <Typography fontSize="13px" fontWeight={700}>Asset Cost มูลค่าทรัพย์สิน CP Book</Typography>
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: '#ff9800', color: 'white', border: 2, borderColor: '#f57c00', py: 1.5 }} rowSpan={2}>
                <Typography fontSize="13px" fontWeight={700}>Net Book Value มูลค่าปัจจุบันที่เหลือ (NBV) CP Book</Typography>
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: '#4caf50', color: 'white', border: 2, borderColor: '#388e3c', py: 1.5 }} rowSpan={2}>
                <Typography fontSize="13px" fontWeight={700}>Oracle Category</Typography>
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: '#4caf50', color: 'white', border: 2, borderColor: '#388e3c', py: 1.5 }} rowSpan={2}>
                <Typography fontSize="13px" fontWeight={700}>Remark/Transfer reason</Typography>
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: '#9c27b0', color: 'white', border: 2, borderColor: '#7b1fa2', py: 1.5 }} colSpan={4}>
                <Typography fontSize="14px" fontWeight={700}>Reconciliation Status</Typography>
              </TableCell>
            </TableRow>

            {/* Second header row (sub columns) */}
            <TableRow>
              <TableCell align="center" sx={{ bgcolor: '#bbdefb', border: 2, borderColor: '#1976d2', py: 1 }}>
                <Typography fontSize="12px" fontWeight={600} color="#1565c0">From Cost Center</Typography>
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: '#bbdefb', border: 2, borderColor: '#1976d2', py: 1 }}>
                <Typography fontSize="12px" fontWeight={600} color="#1565c0">From Location</Typography>
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: '#bbdefb', border: 2, borderColor: '#1976d2', py: 1 }}>
                <Typography fontSize="12px" fontWeight={600} color="#1565c0">To Cost Center</Typography>
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: '#bbdefb', border: 2, borderColor: '#1976d2', py: 1 }}>
                <Typography fontSize="12px" fontWeight={600} color="#1565c0">To Location</Typography>
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: '#bbdefb', border: 2, borderColor: '#1976d2', py: 1 }}>
                <Typography fontSize="12px" fontWeight={600} color="#1565c0">Oracle Asset No.</Typography>
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: '#bbdefb', border: 2, borderColor: '#1976d2', py: 1 }}>
                <Typography fontSize="12px" fontWeight={600} color="#1565c0">Asset Barcode</Typography>
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: '#e1bee7', border: 2, borderColor: '#7b1fa2', py: 1 }}>
                <Typography fontSize="12px" fontWeight={600} color="#7b1fa2">NBV</Typography>
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: '#e1bee7', border: 2, borderColor: '#7b1fa2', py: 1 }}>
                <Typography fontSize="12px" fontWeight={600} color="#7b1fa2">Form vs NBV</Typography>
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: '#e1bee7', border: 2, borderColor: '#7b1fa2', py: 1 }}>
                <Typography fontSize="12px" fontWeight={600} color="#7b1fa2">Report Amount</Typography>
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: '#e1bee7', border: 2, borderColor: '#7b1fa2', py: 1 }}>
                <Typography fontSize="12px" fontWeight={600} color="#7b1fa2">Report vs FBDI</Typography>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {groups.map((g) => {
              const { startIndex, size } = g;
              return (
                <React.Fragment key={g.key}>
                  {sorted.slice(startIndex, startIndex + size).map((r, idx) => (
                    <TableRow 
                      key={`${g.key}-${r.oracleAssetNo}-${idx}`}
                      sx={{ 
                        '&:hover': { 
                          bgcolor: '#f8f9fa'
                        },
                        '&:nth-of-type(even)': {
                          bgcolor: '#fafafa'
                        }
                      }}
                    > 
                      {/* Grouped 4-left cells with rowSpan on first row */}
                      {idx === 0 && (
                        <>
                          <TableCell sx={{ 
                            border: 1, 
                            borderColor: '#e0e0e0',
                            fontWeight: 600, 
                            py: 1
                          }} rowSpan={size}>
                            {r.fromCostCenter}
                          </TableCell>
                          <TableCell sx={{ 
                            border: 1, 
                            borderColor: '#e0e0e0',
                            py: 1,
                            maxWidth: 150,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }} rowSpan={size}>
                            {r.fromLocation}
                          </TableCell>
                          <TableCell sx={{ 
                            border: 1, 
                            borderColor: '#e0e0e0',
                            fontWeight: 600, 
                            py: 1
                          }} rowSpan={size}>
                            {r.toCostCenter}
                          </TableCell>
                          <TableCell sx={{ 
                            border: 1, 
                            borderColor: '#e0e0e0',
                            py: 1,
                            maxWidth: 150,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }} rowSpan={size}>
                            {r.toLocation}
                          </TableCell>
                        </>
                      )}

                      {/* Ungrouped cells per-row */}
                      <TableCell sx={{ 
                        border: 1, 
                        borderColor: '#e0e0e0',
                        fontWeight: 500,
                        py: 1
                      }}>
                        {r.oracleAssetNo}
                      </TableCell>
                      <TableCell sx={{ 
                        border: 1, 
                        borderColor: '#e0e0e0',
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        py: 1
                      }}>
                        {r.assetBarcode || "-"}
                      </TableCell>
                      <TableCell sx={{ 
                        border: 1, 
                        borderColor: '#e0e0e0',
                        maxWidth: 200,
                        py: 1
                      }}>
                        {r.description}
                      </TableCell>
                      <TableCell sx={{ 
                        border: 1, 
                        borderColor: '#e0e0e0',
                        textAlign: "right",
                        py: 1
                      }}>
                        {formatLifeYear(r.lifeYear)}
                      </TableCell>
                      <TableCell sx={{ 
                        border: 1, 
                        borderColor: '#e0e0e0',
                        whiteSpace: "nowrap",
                        py: 1
                      }}>
                        {formatDateEng(r.assetStartDate)}
                      </TableCell>
                      <TableCell sx={{ 
                        border: 1, 
                        borderColor: '#e0e0e0',
                        whiteSpace: "nowrap",
                        py: 1
                      }}>
                        {formatDateThaiLong(r.transferDate)}
                      </TableCell>
                      <TableCell sx={{ 
                        border: 1, 
                        borderColor: '#e0e0e0',
                        textAlign: "right",
                        py: 1
                      }}>
                        {isFiniteNum(r.unit) ? r.unit : "-"}
                      </TableCell>
                      <TableCell sx={{ 
                        border: 1, 
                        borderColor: '#e0e0e0',
                        py: 1
                      }} align="right">
                        <Typography sx={{...moneySx(r.assetCost)}}>
                          {formatMoney(r.assetCost)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ 
                        border: 1, 
                        borderColor: '#e0e0e0',
                        py: 1
                      }} align="right">
                        <Typography sx={{...moneySx(r.nbv)}}>
                          {formatMoney(r.nbv)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ 
                        border: 1, 
                        borderColor: '#e0e0e0',
                        fontSize: '12px',
                        maxWidth: 120,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        py: 1
                      }}>
                        {r.oracleCategory || "-"}
                      </TableCell>
                      <TableCell sx={{ 
                        border: 1, 
                        borderColor: '#e0e0e0',
                        fontSize: '12px',
                        maxWidth: 150,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        py: 1
                      }}>
                        {r.remark || "-"}
                      </TableCell>
                      
                      {/* Reconciliation columns */}
                      <TableCell sx={{ 
                        border: 1, 
                        borderColor: '#e0e0e0',
                        py: 1
                      }} align="right">
                        <Typography sx={{...moneySx(r.nbv)}}>
                          {formatMoney(r.nbv)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ 
                        border: 1, 
                        borderColor: '#e0e0e0',
                        py: 1
                      }} align="center">
                        {r.transferVsNBV && (
                          <Chip 
                            label={r.transferVsNBV} 
                            color={r.transferVsNBV === "Matched" ? "success" : "error"} 
                            size="small"
                            sx={{ 
                              fontWeight: 600,
                              fontSize: '11px'
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell sx={{ 
                        border: 1, 
                        borderColor: '#e0e0e0',
                        py: 1
                      }} align="right">
                        <Typography sx={{...moneySx(r.transferReport)}}>
                          {formatMoney(r.transferReport)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ 
                        border: 1, 
                        borderColor: '#e0e0e0',
                        py: 1
                      }} align="center">
                        {r.transferVsFBDI && (
                          <Chip 
                            label={r.transferVsFBDI} 
                            color={r.transferVsFBDI === "Matched" ? "success" : "error"} 
                            size="small"
                            sx={{ 
                              fontWeight: 600,
                              fontSize: '11px'
                            }}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              );
            })}

            {/* Grand Total row */}
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell sx={{ 
                border: 1, 
                borderColor: '#ccc',
                fontWeight: 700, 
                py: 1.5,
                bgcolor: '#e0e0e0'
              }} colSpan={11}>
                <Typography variant="h6" fontWeight={700}>
                  Grand Total
                </Typography>
              </TableCell>
              <TableCell sx={{ 
                border: 1, 
                borderColor: '#ccc',
                bgcolor: '#fff3e0',
                py: 1.5
              }} align="right">
                <Typography sx={{...moneySx(totalCost), fontWeight: 700}}>
                  {formatMoney(totalCost)}
                </Typography>
              </TableCell>
              <TableCell sx={{ 
                border: 1, 
                borderColor: '#ccc',
                bgcolor: '#fff3e0',
                py: 1.5
              }} align="right">
                <Typography sx={{...moneySx(totalNBV), fontWeight: 700}}>
                  {formatMoney(totalNBV)}
                </Typography>
              </TableCell>
              <TableCell sx={{ border: 1, borderColor: '#ccc', bgcolor: '#e0e0e0' }} colSpan={2}></TableCell>
              <TableCell sx={{ 
                border: 1, 
                borderColor: '#ccc',
                bgcolor: '#e1bee7',
                py: 1.5
              }} align="right">
                <Typography sx={{...moneySx(totalNBV), fontWeight: 700}}>
                  {formatMoney(totalNBV)}
                </Typography>
              </TableCell>
              <TableCell sx={{ border: 1, borderColor: '#ccc', bgcolor: '#e0e0e0' }}></TableCell>
              <TableCell sx={{ 
                border: 1, 
                borderColor: '#ccc',
                bgcolor: '#c8e6c9',
                py: 1.5
              }} align="right">
                <Typography sx={{...moneySx(totalTransferReport), fontWeight: 700}}>
                  {formatMoney(totalTransferReport)}
                </Typography>
              </TableCell>
              <TableCell sx={{ border: 1, borderColor: '#ccc', bgcolor: '#e0e0e0' }}></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ my: 2 }} className="no-print" />
      <Box className="no-print" sx={{ color: "text.secondary" }}>
        <Typography variant="caption">
          * Negative values are shown in parentheses and red. Print in A4 landscape for best fidelity. Reconciliation status shows Matched/Mismatch.
        </Typography>
      </Box>
    </Box>
  );
}