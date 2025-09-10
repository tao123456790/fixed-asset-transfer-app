import { Sx } from './_types';

export const sxDashboardPage = {
  // Main layout
  mainContainer: {
    display: 'flex',
    minHeight: '100vh'
  } as Sx,

  contentArea: {
    p: 3,
    paddingTop: '80px'
  } as Sx,

  // Header section
  headerSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mb: 3
  } as Sx,

  headerTitle: {
    color: '#1976d2'
  } as Sx,

  refreshButton: {
    minWidth: 120,
    '&:hover': {
      bgcolor: 'primary.main',
      color: 'white'
    }
  } as Sx,

  // Summary cards section
  summaryCards: {
    mb: 4
  } as Sx,

  // Card content styling for numbers
  completedText: {
    color: '#2e7d32'
  } as Sx,

  pendingText: {
    color: '#ff9800'
  } as Sx,

  issuesText: {
    color: '#f44336'
  } as Sx,

  // Table section
  tableTitle: {
    mb: 2
  } as Sx,

  // Table styling
  table: {
    minWidth: 650,
    borderCollapse: "separate",
    borderSpacing: 1
  } as Sx,

  // Table headers
  tableHeaderCell: {
    bgcolor: '#2196f3',
    color: 'white',
    border: 2,
    borderColor: '#1976d2',
    fontWeight: 700
  } as Sx,

  tableHeaderCenterCell: {
    bgcolor: '#2196f3',
    color: 'white',
    border: 2,
    borderColor: '#1976d2',
    fontWeight: 700
  } as Sx,

  // Table rows
  tableRow: {
    '&:hover': {
      bgcolor: '#f8f9fa'
    },
    '&:nth-of-type(even)': {
      bgcolor: '#fafafa'
    }
  } as Sx,

  // Table cells
  tableCellBase: {
    border: 1,
    borderColor: '#e0e0e0',
    py: 1
  } as Sx,

  tableCellAction: {
    border: 1,
    borderColor: '#e0e0e0',
    py: 1
  } as Sx,

  tableCellOwner: {
    border: 1,
    borderColor: '#e0e0e0',
    py: 1,
    fontWeight: 600
  } as Sx,

  tableCellTransferFormId: {
    border: 1,
    borderColor: '#e0e0e0',
    py: 1,
    fontFamily: 'monospace',
    fontSize: '13px'
  } as Sx,

  // Icon button styling
  iconButtonEditable: (status: string): Sx => ({
    color: (status === 'Pending Review' || status === 'Pending Review(Approval)' || status === 'Transfer Report Mismatch' || status === 'Pending Review(Transfer Report Mismatch)') ? '#ff9800' : '#1976d2',
    '&:hover': {
      bgcolor: (status === 'Pending Review' || status === 'Pending Review(Approval)' || status === 'Transfer Report Mismatch' || status === 'Pending Review(Transfer Report Mismatch)') ? 'rgba(255, 152, 0, 0.08)' : 'rgba(25, 118, 210, 0.08)'
    }
  }),
};