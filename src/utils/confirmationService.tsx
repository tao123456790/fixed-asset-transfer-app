import { useConfirm } from 'material-ui-confirm';
import { CheckCircle, Cancel, Warning, Info, Help, Upload } from '@mui/icons-material';
import { Typography, TextField, Button, Stack, Chip } from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';

export const createConfirmReject = (confirm: any) => {
  return async (transferFormId?: string): Promise<string> => {
    let commentValue = '';
    let confirmButtonRef: React.MutableRefObject<HTMLButtonElement | null> = { current: null };

    const RejectContent: React.FC = () => {
      const [comment, setComment] = React.useState('');
      const [isButtonDisabled, setIsButtonDisabled] = React.useState(true);

      React.useEffect(() => {
        commentValue = comment;
        const disabled = !comment.trim();
        setIsButtonDisabled(disabled);
        
        // Update the confirm button disabled state
        if (confirmButtonRef.current) {
          confirmButtonRef.current.disabled = disabled;
          confirmButtonRef.current.style.opacity = disabled ? '0.5' : '1';
          confirmButtonRef.current.style.cursor = disabled ? 'not-allowed' : 'pointer';
        }
      }, [comment]);

      React.useEffect(() => {
        // Get the confirm button after component mounts
        const timer = setTimeout(() => {
          const confirmButton = document.querySelector('[data-testid="confirm-button"]') as HTMLButtonElement ||
                               document.querySelector('button.MuiButton-containedError') as HTMLButtonElement;
          if (confirmButton) {
            confirmButtonRef.current = confirmButton;
            confirmButton.disabled = true;
            confirmButton.style.opacity = '0.5';
            confirmButton.style.cursor = 'not-allowed';
          }
        }, 100);
        
        return () => clearTimeout(timer);
      }, []);

      return (
        <TextField
          label="Comment (Required) *"
          placeholder="Enter your rejection reason here..."
          multiline
          rows={4}
          variant="outlined"
          fullWidth
          autoFocus
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            commentValue = e.target.value;
          }}
          error={!comment && comment !== ''}
          helperText={!comment.trim() && comment !== '' ? "Comment is required" : "Please provide a reason for rejection"}
        />
      );
    };

    const { confirmed } = await confirm({
      title: 'Reject Transfer Form',
      description: transferFormId ? (
        <Box sx={{ mb: 1, mt: 1 }}>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {`Transfer Form ID: ${transferFormId}`}
          </Typography>
          <Typography variant="body2" color="error">
            You must provide a comment to reject this transfer form.
          </Typography>
        </Box>
      ) : (
        <Typography variant="body2" color="error">
          You must provide a comment to reject this transfer form.
        </Typography>
      ),
      content: <RejectContent />,
      allowClose: false,
      dialogProps: { maxWidth: 'sm', fullWidth: true },
      confirmationText: 'Confirm Reject',
      cancellationText: 'Cancel',
      confirmationButtonProps: { 
        color: 'error', 
        variant: 'contained', 
        startIcon: <Cancel />,
        'data-testid': 'confirm-button'
      },
      cancellationButtonProps: { color: 'inherit' },
    });

    if (!confirmed) throw new Error('cancelled');

    const value = commentValue.trim();
    if (!value) {
      throw new Error('Comment is required for rejection');
    }

    return value;
  };
};

export const createConfirmReProcess = (confirm: any) => {
  return async (transferFormId?: string): Promise<{ comment: string, files: File[] }> => {
    // Refs สำหรับเก็บค่า
    const commentRef = { current: '' as string };
    const filesRef = { current: [] as File[] };

    const ReProcessContent: React.FC = () => {
      const [comment, setComment] = React.useState('');
      const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
      const fileInputRef = React.useRef<HTMLInputElement>(null);

      // Update refs when values change
      React.useEffect(() => {
        commentRef.current = comment;
      }, [comment]);

      React.useEffect(() => {
        filesRef.current = selectedFiles;
      }, [selectedFiles]);

      const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        setSelectedFiles(prev => [...prev, ...files]);
      };

      const handleRemoveFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
      };

      return (
        <Box sx={{ mt: 2 }}>
          <TextField
            label="Comment"
            placeholder="Enter your re-process comment here... (Optional)"
            multiline
            rows={4}
            variant="outlined"
            fullWidth
            autoFocus
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            helperText="Optional: Provide additional information about the re-process"
            sx={{ mb: 2 }}
          />

          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xlsx,.xls,.png,.jpg,.jpeg"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
            <Button
              variant="outlined"
              startIcon={<Upload />}
              onClick={() => fileInputRef.current?.click()}
            >
              Attach Files (Optional)
            </Button>
            <Typography variant="caption" color="text.secondary">
              PDF, Word, Excel, Images
            </Typography>
          </Stack>

          {selectedFiles.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Selected Files ({selectedFiles.length}):
              </Typography>
              <Stack spacing={1}>
                {selectedFiles.map((file, index) => (
                  <Chip
                    key={index}
                    label={`${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`}
                    onDelete={() => handleRemoveFile(index)}
                    variant="outlined"
                  />
                ))}
              </Stack>
            </Box>
          )}
        </Box>
      );
    };

    const { confirmed } = await confirm({
      title: 'Re-Process Transfer Form',
      description: transferFormId ? (
        <Box sx={{ mb: 1 }}>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {`Transfer Form ID: ${transferFormId}`}
          </Typography>
          <Typography variant="body2">
            You can provide a comment and attach additional files for re-processing.
          </Typography>
        </Box>
      ) : 'You can provide a comment and attach additional files for re-processing.',
      content: <ReProcessContent />,
      allowClose: false,
      dialogProps: { maxWidth: 'md', fullWidth: true },
      confirmationText: 'Re-Process',
      cancellationText: 'Cancel',
      confirmationButtonProps: { color: 'warning', variant: 'contained', startIcon: <Warning /> },
      cancellationButtonProps: { color: 'inherit' },
    });

    if (!confirmed) throw new Error('cancelled');

    return {
      comment: commentRef.current.trim(),
      files: filesRef.current
    };
  };
};

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
    },
    cancellationButtonProps: {
      color: 'inherit'
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
    },
    cancellationButtonProps: {
      color: 'inherit'
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
    },
    cancellationButtonProps: {
      color: 'inherit'
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

  // Use the separated confirmReject function
  const confirmReject = createConfirmReject(confirm);

  // Use the separated confirmReProcess function  
  const confirmReProcess = createConfirmReProcess(confirm);

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
    confirmReProcess,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    askQuestion
  };
};

// Export default confirmation service
export default useConfirmation;