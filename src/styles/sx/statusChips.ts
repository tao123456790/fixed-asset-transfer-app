import { Sx } from './_types';

// Base chip styles
const baseChipStyles = {
  fontWeight: 600,
  fontSize: '0.75rem',
  height: '24px',
  '& .MuiChip-label': {
    px: 1.5
  }
} as Sx;

// Status-specific chip styles
export const sxStatusChips = {
  // Base chip with common properties
  base: baseChipStyles,

  // Pending Review(Approval) - Orange/Warning
  pendingReview: {
    ...baseChipStyles,
    backgroundColor: '#fff3e0',
    color: '#f57c00',
    borderColor: '#ffb74d',
  } as Sx,

  // Pending Review(Transfer Report Mismatch) - Red/Error  
  transferReportMismatch: {
    ...baseChipStyles,
    backgroundColor: '#ffebee',
    color: '#d32f2f',
    borderColor: '#f44336',
  } as Sx,

  // Pending Re-Processing(Transfer Report Mismatch) - Orange with border
  transferReportMismatchReProcess: {
    ...baseChipStyles,
    borderColor: '#ff6f00',
    color: '#ff6f00',
    backgroundColor: 'transparent',
  } as Sx,

  // Completed - Green/Success
  completed: {
    ...baseChipStyles,
    backgroundColor: '#e8f5e8',
    color: '#2e7d32',
  } as Sx,

  // Reject - Red/Error filled
  reject: {
    ...baseChipStyles,
    backgroundColor: '#f44336',
    color: 'white',
  } as Sx,

  // Default - Gray
  default: {
    ...baseChipStyles,
    backgroundColor: '#f5f5f5',
    color: '#616161',
  } as Sx,
};

// Helper function to get chip props based on status
export const getStatusChipProps = (status: string) => {
  switch (status) {
    case 'Pending Review':
    case 'Pending Review(Approval)':
      return {
        sx: sxStatusChips.pendingReview,
        variant: 'filled' as const,
        label: status
      };
    
    case 'Transfer Report Mismatch':
    case 'Pending Review(Transfer Report Mismatch)':
      return {
        sx: sxStatusChips.transferReportMismatch,
        variant: 'outlined' as const,
        label: status
      };
    
    case 'Transfer Report Mismatch(Re-Process)':
    case 'Pending Re-Processing(Transfer Report Mismatch)':
      return {
        sx: sxStatusChips.transferReportMismatchReProcess,
        variant: 'outlined' as const,
        label: status
      };
    
    case 'Completed':
      return {
        sx: sxStatusChips.completed,
        variant: 'filled' as const,
        label: status
      };
    
    case 'Reject':
      return {
        sx: sxStatusChips.reject,
        variant: 'filled' as const,
        label: status
      };
    
    default:
      return {
        sx: sxStatusChips.default,
        variant: 'filled' as const,
        label: status
      };
  }
};