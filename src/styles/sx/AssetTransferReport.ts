import { Sx } from './_types';

// Print CSS as separate export since it's not an Sx style
export const printCss = `
  @page { size: A4 landscape; margin: 12mm; }
  @media print {
    .no-print { display: none; }
    table { page-break-inside: auto; }
    tr { page-break-inside: avoid; page-break-after: auto; }
    thead { display: table-header-group; }
    tfoot { display: table-footer-group; }
  }
`;

export const sxAssetTransferReport = {

  // Header section
  headerSection: { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    mb: 2 
  } as Sx,
  
  title: { fontWeight: 700 } as Sx,

  toggleControls: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: 2 
  } as Sx,

  // Transfer form information section
  transferFormSection: {
    mb: 3, 
    p: 2, 
    bgcolor: '#f8f9fa', 
    borderRadius: 1, 
    border: '1px solid #dee2e6'
  } as Sx,

  transferFormTitle: { 
    mb: 2, 
    fontWeight: 600, 
    color: '#495057' 
  } as Sx,

  transferFormGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
    gap: 2 
  } as Sx,

  transferFormLabel: { 
    fontWeight: 600, 
    color: '#6c757d' 
  } as Sx,

  transferFormValue: { 
    color: '#212529' 
  } as Sx,

  // Table container
  tableContainer: {
    maxHeight: '80vh', 
    overflowX: 'auto', 
    overflowY: 'auto', 
    borderRadius: 2,
    position: 'relative'
  } as Sx,

  // Table
  table: { 
    minWidth: 1800, 
    borderCollapse: "separate", 
    borderSpacing: 1 
  } as Sx,

  // Table head sticky
  tableHead: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    '& .MuiTableRow-root': {
      position: 'sticky',
      top: 0,
      zIndex: 100
    }
  } as Sx,

  // Header rows
  topHeaderRow: {
    position: 'sticky',
    top: 0,
    zIndex: 102,
    '& .MuiTableCell-root': {
      position: 'sticky',
      top: 0,
      zIndex: 102
    }
  } as Sx,

  subHeaderRow: {
    position: 'sticky',
    top: '56px', // Height of first header row
    zIndex: 101,
    '& .MuiTableCell-root': {
      position: 'sticky',
      top: '56px',
      zIndex: 101
    }
  } as Sx,

  // Header cells
  blueHeader: { 
    bgcolor: '#2196f3', 
    color: 'white', 
    border: 2, 
    borderColor: '#1976d2', 
    py: 1.5 
  } as Sx,

  greenHeader: { 
    bgcolor: '#4caf50', 
    color: 'white', 
    border: 2, 
    borderColor: '#388e3c', 
    py: 1.5, 
    position: 'relative' 
  } as Sx,

  orangeHeader: { 
    bgcolor: '#ff9800', 
    color: 'white', 
    border: 2, 
    borderColor: '#f57c00', 
    py: 1.5, 
    position: 'relative' 
  } as Sx,

  purpleHeader: { 
    bgcolor: '#9c27b0', 
    color: 'white', 
    border: 2, 
    borderColor: '#7b1fa2', 
    py: 1.5 
  } as Sx,

  lightBlueSubHeader: { 
    bgcolor: '#bbdefb', 
    border: 2, 
    borderColor: '#1976d2', 
    py: 1, 
    position: 'relative' 
  } as Sx,

  lightPurpleSubHeader: { 
    bgcolor: '#e1bee7', 
    border: 2, 
    borderColor: '#7b1fa2', 
    py: 1, 
    position: 'relative' 
  } as Sx,

  // Header typography
  headerText: { 
    fontSize: '16px', 
    fontWeight: 700 
  } as Sx,

  subHeaderText: { 
    fontSize: '16px', 
    fontWeight: 600, 
    color: '#1565c0' 
  } as Sx,

  purpleSubHeaderText: { 
    fontSize: '16px', 
    fontWeight: 600, 
    color: '#7b1fa2' 
  } as Sx,

  // Resize handle
  resizeHandle: {
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
  } as Sx,

  // Table body rows
  tableRow: {
    '&:hover': { 
      bgcolor: '#f8f9fa'
    },
    '&:nth-of-type(even)': {
      bgcolor: '#fafafa'
    }
  } as Sx,

  // Table cells
  costCenterCell: { 
    border: 1, 
    borderColor: '#e0e0e0',
    fontWeight: 600, 
    py: 1,
    fontSize: '12px'
  } as Sx,

  standardCell: { 
    border: 1, 
    borderColor: '#e0e0e0',
    py: 1,
    fontSize: '12px'
  } as Sx,

  rightAlignCell: { 
    border: 1, 
    borderColor: '#e0e0e0',
    textAlign: "right",
    py: 1,
    fontSize: '12px'
  } as Sx,

  monospaceCell: { 
    border: 1, 
    borderColor: '#e0e0e0',
    fontFamily: 'monospace',
    fontSize: '12px',
    py: 1,
  } as Sx,

  noWrapCell: { 
    border: 1, 
    borderColor: '#e0e0e0',
    whiteSpace: "nowrap",
    py: 1,
    fontSize: '12px'
  } as Sx,

  // Money styling
  moneyText: (isNegative: boolean): Sx => ({
    color: isNegative ? "error.main" : "text.primary",
    fontWeight: 500,
    textAlign: "right",
    whiteSpace: "nowrap",
    fontSize: '12px'
  }),

  // Dynamic cell styling for word wrap
  getCellStyle: (enableWordWrap: boolean, text: string = '') => {
    const shouldWrap = enableWordWrap || text.length > 60;
    return {
      border: 1, 
      borderColor: '#e0e0e0',
      py: 1,
      fontSize: '12px',
      whiteSpace: shouldWrap ? 'normal' : 'nowrap',
      overflow: shouldWrap ? 'visible' : 'hidden',
      textOverflow: shouldWrap ? 'unset' : 'ellipsis',
      verticalAlign: 'top',
      wordWrap: shouldWrap ? 'break-word' : 'normal',
      wordBreak: shouldWrap ? 'break-word' : 'normal',
    };
  },

  // Grand total row
  totalRow: { 
    bgcolor: '#f5f5f5' 
  } as Sx,

  totalCell: { 
    border: 1, 
    borderColor: '#ccc',
    fontWeight: 700, 
    py: 1.5,
    bgcolor: '#e0e0e0',
    fontSize: '16px'
  } as Sx,

  totalValueCell: { 
    border: 1, 
    borderColor: '#ccc',
    bgcolor: '#fff3e0',
    py: 1.5,
    fontSize: '16px'
  } as Sx,

  totalPurpleCell: { 
    border: 1, 
    borderColor: '#ccc',
    bgcolor: '#e1bee7',
    py: 1.5,
    fontSize: '16px'
  } as Sx,

  totalGreenCell: { 
    border: 1, 
    borderColor: '#ccc',
    bgcolor: '#c8e6c9',
    py: 1.5,
    fontSize: '16px'
  } as Sx,

  totalEmptyCell: { 
    border: 1, 
    borderColor: '#ccc', 
    bgcolor: '#e0e0e0', 
    fontSize: '14px' 
  } as Sx,

  totalText: { 
    fontWeight: 700, 
    fontSize: '16px' 
  } as Sx,

  // Export button section
  exportButtonSection: { 
    mt: 3, 
    mb: 2 
  } as Sx,

  exportButton: {
    fontSize: '16px',
    fontWeight: 600,
    px: 4,
    py: 1.5,
    borderRadius: 2,
    borderWidth: 2,
    '&:hover': {
      borderWidth: 2,
      backgroundColor: 'primary.light',
      color: 'white'
    }
  } as Sx,

  // Action buttons section
  actionButtonsSection: { 
    mt: 1, 
    mb: 2 
  } as Sx,

  actionButton: { 
    fontSize: '16px',
    fontWeight: 600,
    px: 4,
    py: 1.5,
    borderRadius: 2
  } as Sx,

  // Footer
  footerDivider: { 
    my: 2 
  } as Sx,

  footerBox: { 
    color: "text.secondary" 
  } as Sx,

  // Status chips
  matchedChip: { 
    fontWeight: 600,
    fontSize: '12px'
  } as Sx,

  // Accordion styles
  historyAccordion: {
    mb: 3
  } as Sx,

  accordionSummary: {
    bgcolor: '#f8f9fa',
    border: '1px solid #dee2e6',
    '&:hover': {
      bgcolor: '#e9ecef'
    }
  } as Sx,

  accordionIcon: {
    display: 'flex',
    alignItems: 'center',
    gap: 1
  } as Sx,

  historyIcon: {
    color: '#6c757d'
  } as Sx,

  historyTitle: {
    fontWeight: 600,
    color: '#495057'
  } as Sx,

  historyChip: {
    ml: 1
  } as Sx,

  accordionDetails: {
    p: 0
  } as Sx,

  // Table header cells with dynamic width
  greenHeaderCell: (width: number) => ({
    bgcolor: '#4caf50',
    color: 'white',
    border: 2,
    borderColor: '#388e3c',
    py: 1.5,
    width: width,
    position: 'relative'
  } as Sx),

  orangeHeaderCell: (width: number) => ({
    bgcolor: '#ff9800',
    color: 'white',
    border: 2,
    borderColor: '#f57c00',
    py: 1.5,
    width: width,
    position: 'relative'
  } as Sx),

  // Sub header cells
  blueSubHeaderCell: (width: number) => ({
    bgcolor: '#bbdefb',
    border: 2,
    borderColor: '#1976d2',
    py: 1,
    width: width,
    position: 'relative'
  } as Sx),

  purpleSubHeaderCell: (width: number) => ({
    bgcolor: '#e1bee7',
    border: 2,
    borderColor: '#7b1fa2',
    py: 1,
    width: width,
    position: 'relative'
  } as Sx),

  // Table body row
  bodyRow: {
    '&:hover': {
      bgcolor: '#f8f9fa'
    },
    '&:nth-of-type(even)': {
      bgcolor: '#fafafa'
    }
  } as Sx,

  // Dynamic table cells
  dynamicCell: (width: number) => ({
    border: 1,
    borderColor: '#e0e0e0',
    fontWeight: 600,
    py: 1,
    width: width,
    fontSize: '12px'
  } as Sx),

  dynamicStandardCell: (width: number) => ({
    border: 1,
    borderColor: '#e0e0e0',
    py: 1,
    width: width,
    fontSize: '12px'
  } as Sx),

  dynamicRightAlignCell: (width: number) => ({
    border: 1,
    borderColor: '#e0e0e0',
    textAlign: "right",
    py: 1,
    width: width,
    fontSize: '12px'
  } as Sx),

  dynamicMonospaceCell: (width: number) => ({
    border: 1,
    borderColor: '#e0e0e0',
    fontFamily: 'monospace',
    fontSize: '12px',
    py: 1,
    width: width
  } as Sx),

  dynamicNoWrapCell: (width: number) => ({
    border: 1,
    borderColor: '#e0e0e0',
    whiteSpace: "nowrap",
    py: 1,
    width: width,
    fontSize: '12px'
  } as Sx),

  // Money text
  moneyTypography: {
    fontSize: '12px'
  } as Sx,

  // Chip styles
  statusChip: {
    fontWeight: 600,
    fontSize: '12px'
  } as Sx,

  // Row sticky styles
  stickySubHeaderRow: {
    position: 'sticky',
    top: '56px',
    zIndex: 101,
    '& .MuiTableCell-root': {
      position: 'sticky',
      top: '56px',
      zIndex: 101
    }
  } as Sx,

  // Total row styles
  grandTotalRow: {
    bgcolor: '#f5f5f5'
  } as Sx,

  grandTotalLabelCell: {
    border: 1,
    borderColor: '#ccc',
    fontWeight: 700,
    py: 1.5,
    bgcolor: '#e0e0e0',
    fontSize: '16px'
  } as Sx,

  grandTotalValueCell: {
    border: 1,
    borderColor: '#ccc',
    bgcolor: '#fff3e0',
    py: 1.5,
    fontSize: '16px'
  } as Sx,

  grandTotalPurpleValueCell: {
    border: 1,
    borderColor: '#ccc',
    bgcolor: '#e1bee7',
    py: 1.5,
    fontSize: '16px'
  } as Sx,

  grandTotalGreenValueCell: {
    border: 1,
    borderColor: '#ccc',
    bgcolor: '#c8e6c9',
    py: 1.5,
    fontSize: '16px'
  } as Sx,

  grandTotalEmptyCell: {
    border: 1,
    borderColor: '#ccc',
    bgcolor: '#e0e0e0',
    fontSize: '14px'
  } as Sx,

  grandTotalTypography: {
    fontWeight: 700,
    fontSize: '16px'
  } as Sx,

  grandTotalMoneyTypography: {
    fontWeight: 700,
    fontSize: '16px'
  } as Sx,

};