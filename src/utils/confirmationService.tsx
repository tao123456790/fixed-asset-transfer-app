import { useConfirm } from 'material-ui-confirm';
import { CheckCircle, Cancel, Warning, Info, Help } from '@mui/icons-material';

// Types for confirmation options
export interface ConfirmOptions {
  title?: string;
  description?: string;
  confirmationText?: string;
  cancellationText?: string;
  dialogProps?: any;
  confirmationButtonProps?: any;
  cancellationButtonProps?: any;
  allowClose?: boolean;
  confirmationKeyword?: string;
  confirmationKeywordTextFieldProps?: any;
  content?: React.ReactNode;
  hideCancelButton?: boolean;
  buttonOrder?: string[];
}

// Preset configurations for common scenarios
export const CONFIRM_PRESETS = {
  // Success confirmation
  success: {
    title: 'Success',
    confirmationText: 'OK',
    cancellationText: 'Close',
    dialogProps: {
      maxWidth: 'xs'
    },
    confirmationButtonProps: {
      color: 'success',
      variant: 'contained',
      startIcon: <CheckCircle />
    }
  },

  // Error confirmation
  error: {
    title: 'Error',
    confirmationText: 'OK',
    cancellationText: 'Close',
    dialogProps: {
      maxWidth: 'xs'
    },
    confirmationButtonProps: {
      color: 'error',
      variant: 'contained',
      startIcon: <Cancel />
    }
  },

  // Warning confirmation
  warning: {
    title: 'Warning',
    confirmationText: 'Proceed',
    cancellationText: 'Cancel',
    dialogProps: {
      maxWidth: 'sm'
    },
    confirmationButtonProps: {
      color: 'warning',
      variant: 'contained',
      startIcon: <Warning />
    },
    cancellationButtonProps: {
      color: 'inherit'
    }
  },

  // Delete confirmation
  delete: {
    title: 'Confirm Delete',
    description: 'Are you sure you want to delete this item? This action cannot be undone.',
    confirmationText: 'Delete',
    cancellationText: 'Cancel',
    dialogProps: {
      maxWidth: 'xs'
    },
    confirmationButtonProps: {
      color: 'error',
      variant: 'contained',
      startIcon: <Cancel />
    },
    cancellationButtonProps: {
      color: 'inherit'
    }
  },

  // Process confirmation
  process: {
    title: 'Confirm Process',
    description: 'Are you sure you want to process this item?',
    confirmationText: 'Process',
    cancellationText: 'Cancel',
    dialogProps: {
      maxWidth: 'sm'
    },
    confirmationButtonProps: {
      color: 'success',
      variant: 'contained',
      startIcon: <CheckCircle />
    },
    cancellationButtonProps: {
      color: 'inherit'
    }
  },

  // Reject confirmation (with required input)
  reject: {
    title: 'Reject Transfer Form',
    description: 'Please provide a reason for rejection:',
    confirmationText: 'Confirm Reject',
    cancellationText: 'Cancel',
    confirmationKeyword: '',
    confirmationKeywordTextFieldProps: {
      label: 'Reason for Rejection *',
      placeholder: 'Enter rejection reason...',
      multiline: true,
      rows: 4,
      required: true,
      variant: 'outlined',
      fullWidth: true,
      autoFocus: true,
      helperText: 'This field is required'
    },
    dialogProps: {
      maxWidth: 'sm'
    },
    confirmationButtonProps: {
      color: 'error',
      variant: 'contained',
      startIcon: <Cancel />
    },
    cancellationButtonProps: {
      color: 'inherit'
    }
  },

  // Info confirmation
  info: {
    title: 'Information',
    confirmationText: 'OK',
    hideCancelButton: true,
    dialogProps: {
      maxWidth: 'sm'
    },
    confirmationButtonProps: {
      color: 'info',
      variant: 'contained',
      startIcon: <Info />
    }
  },

  // Question confirmation
  question: {
    title: 'Confirm Action',
    confirmationText: 'Yes',
    cancellationText: 'No',
    dialogProps: {
      maxWidth: 'xs'
    },
    confirmationButtonProps: {
      color: 'primary',
      variant: 'contained',
      startIcon: <Help />
    },
    cancellationButtonProps: {
      color: 'inherit'
    }
  }
};

// Custom hook for using confirmation with presets
export const useConfirmation = () => {
  const confirm = useConfirm();

  // Confirm with preset
  const confirmWithPreset = (preset: keyof typeof CONFIRM_PRESETS, customOptions?: ConfirmOptions) => {
    const presetConfig = CONFIRM_PRESETS[preset];
    const mergedOptions = {
      ...presetConfig,
      ...customOptions,
      confirmationButtonProps: {
        ...presetConfig.confirmationButtonProps,
        ...customOptions?.confirmationButtonProps
      },
      cancellationButtonProps: {
        ...presetConfig.cancellationButtonProps,
        ...customOptions?.cancellationButtonProps
      },
      dialogProps: {
        ...presetConfig.dialogProps,
        ...customOptions?.dialogProps
      }
    };
    
    return confirm(mergedOptions);
  };

  // Custom confirm
  const customConfirm = (options: ConfirmOptions) => {
    return confirm(options);
  };

  // Quick confirm methods
  const confirmDelete = (customDescription?: string) => {
    return confirmWithPreset('delete', {
      description: customDescription || CONFIRM_PRESETS.delete.description
    });
  };

  const confirmProcess = (customDescription?: string) => {
    return confirmWithPreset('process', {
      description: customDescription || CONFIRM_PRESETS.process.description
    });
  };

  const confirmReject = (transferFormId?: string) => {
    return confirmWithPreset('reject', {
      description: transferFormId 
        ? `Transfer Form ID: ${transferFormId}\n\nPlease provide a reason for rejection:`
        : 'Please provide a reason for rejection:'
    });
  };

  const showSuccess = (message: string) => {
    return confirmWithPreset('success', {
      description: message
    });
  };

  const showError = (message: string) => {
    return confirmWithPreset('error', {
      description: message
    });
  };

  const showWarning = (message: string) => {
    return confirmWithPreset('warning', {
      description: message
    });
  };

  const showInfo = (message: string) => {
    return confirmWithPreset('info', {
      description: message
    });
  };

  const askQuestion = (question: string) => {
    return confirmWithPreset('question', {
      description: question
    });
  };

  return {
    confirm: customConfirm,
    confirmWithPreset,
    confirmDelete,
    confirmProcess,
    confirmReject,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    askQuestion
  };
};

// Export default confirmation service
export default useConfirmation;