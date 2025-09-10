import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { getStatusChipProps } from '../styles/sx';
import {
  Timeline,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import {
  CheckCircle,
  PendingActions,
  Warning,
  Cancel,
  Error as ErrorIcon,
  AttachFile,
  Download,
  Visibility,
  PictureAsPdf,
  Description,
  TableChart,
  Image as ImageIcon,
  InsertDriveFile,
} from '@mui/icons-material';

export interface HistoryLogEntry {
  id: string;
  status: string;
  timestamp: string;
  user: string;
  comment?: string;
  attachments?: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    category: string;
  }>;
}

interface HistoryLogProps {
  entries: HistoryLogEntry[];
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Pending Review':
    case 'Pending Review(Approval)':
      return <PendingActions />;
    case 'Transfer Report Mismatch':
    case 'Pending Review(Transfer Report Mismatch)':
      return <Warning />;
    case 'Transfer Report Mismatch(Re-Process)':
    case 'Pending Re-Processing(Transfer Report Mismatch)':
      return <ErrorIcon />;
    case 'Reject':
      return <Cancel />;
    case 'Completed':
      return <CheckCircle />;
    default:
      return <PendingActions />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending Review':
    case 'Pending Review(Approval)':
      return 'warning';
    case 'Transfer Report Mismatch':
    case 'Pending Review(Transfer Report Mismatch)':
      return 'error';
    case 'Transfer Report Mismatch(Re-Process)':
    case 'Pending Re-Processing(Transfer Report Mismatch)':
      return 'error';
    case 'Reject':
      return 'error';
    case 'Completed':
      return 'success';
    default:
      return 'default';
  }
};

const getStatusChip = (status: string) => {
  const chipProps = getStatusChipProps(status);
  return <Chip size="small" {...chipProps} />;
};

export const HistoryLog: React.FC<HistoryLogProps> = ({ entries }) => {
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<any>(null);

  const sortedEntries = [...entries].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Get file icon based on file type
  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <PictureAsPdf sx={{ fontSize: 16, color: '#d32f2f' }} />;
    if (type.includes('sheet') || type.includes('excel')) return <TableChart sx={{ fontSize: 16, color: '#2e7d32' }} />;
    if (type.includes('word') || type.includes('document')) return <Description sx={{ fontSize: 16, color: '#1976d2' }} />;
    if (type.includes('image')) return <ImageIcon sx={{ fontSize: 16, color: '#f57c00' }} />;
    return <InsertDriveFile sx={{ fontSize: 16, color: '#666' }} />;
  };

  // Handle file view
  const handleViewFile = (attachment: any) => {
    setSelectedFile(attachment);
    setViewDialogOpen(true);
  };

  // Handle file download
  const handleDownloadFile = (attachment: any) => {
    // TODO: Implement actual download functionality
    console.log('Download:', attachment.name);
    // For demo purposes, show alert
    alert(`การดาวน์โหลดไฟล์: ${attachment.name}`);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedFile(null);
  };

  return (
    <Paper sx={{ p: 3, mb: 3, bgcolor: '#f8f9fa', border: '1px solid #dee2e6' }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#495057' }}>
        History Log
      </Typography>
      
      <Timeline sx={{ py: 0 }}>
        {sortedEntries.map((entry, index) => (
          <TimelineItem key={entry.id}>
            <TimelineOppositeContent
              sx={{ m: 'auto 0', minWidth: 120, flex: 0.3 }}
              align="right"
              variant="body2"
              color="text.secondary"
            >
              {new Date(entry.timestamp).toLocaleDateString('th-TH', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
              <br />
              {new Date(entry.timestamp).toLocaleTimeString('th-TH', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </TimelineOppositeContent>
            
            <TimelineSeparator>
              <TimelineDot 
                color={getStatusColor(entry.status) as any}
                sx={{ p: 1 }}
              >
                {getStatusIcon(entry.status)}
              </TimelineDot>
              {index < sortedEntries.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            
            <TimelineContent sx={{ py: '12px', px: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                {getStatusChip(entry.status)}
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                โดย: {entry.user}
              </Typography>
              
              {entry.comment && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    bgcolor: '#fff', 
                    p: 1.5, 
                    borderRadius: 1, 
                    border: '1px solid #e0e0e0',
                    fontStyle: 'italic',
                    color: '#666',
                    mb: entry.attachments && entry.attachments.length > 0 ? 1 : 0
                  }}
                >
                  "{entry.comment}"
                </Typography>
              )}
              
              {entry.attachments && entry.attachments.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    <AttachFile sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                    ไฟล์แนบ ({entry.attachments.length} ไฟล์):
                  </Typography>
                  <Stack spacing={0.5}>
                    {entry.attachments.map((attachment) => (
                      <Box 
                        key={attachment.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          bgcolor: '#f5f5f5',
                          p: 1,
                          borderRadius: 1,
                          border: '1px solid #e0e0e0'
                        }}
                      >
                        {getFileIcon(attachment.type)}
                        <Typography variant="body2" sx={{ flex: 1, fontSize: '0.8rem' }}>
                          {attachment.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({(attachment.size / 1024 / 1024).toFixed(2)} MB)
                        </Typography>
                        <Tooltip title="ดูไฟล์">
                          <IconButton 
                            size="small" 
                            sx={{ p: 0.5 }}
                            onClick={() => handleViewFile(attachment)}
                          >
                            <Visibility sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="ดาวน์โหลด">
                          <IconButton 
                            size="small" 
                            sx={{ p: 0.5 }}
                            onClick={() => handleDownloadFile(attachment)}
                          >
                            <Download sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>

      {/* File View Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {selectedFile && getFileIcon(selectedFile.type)}
          <Typography variant="h6" component="span">
            {selectedFile?.name}
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          {selectedFile && (
            <Box>
              {/* File Info */}
              <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>ขนาดไฟล์:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>ประเภท:</strong> {selectedFile.type}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>หมวดหมู่:</strong> {selectedFile.category}
                </Typography>
              </Box>

              {/* File Preview */}
              <Box sx={{ textAlign: 'center', p: 3, border: '2px dashed #ddd', borderRadius: 1 }}>
                {selectedFile.type.includes('image') ? (
                  <Box>
                    <ImageIcon sx={{ fontSize: 48, color: '#f57c00', mb: 2 }} />
                    <Typography variant="body1">
                      ตัวอย่างรูปภาพ (ในการใช้งานจริงจะแสดงรูปภาพที่นี่)
                    </Typography>
                  </Box>
                ) : selectedFile.type.includes('pdf') ? (
                  <Box>
                    <PictureAsPdf sx={{ fontSize: 48, color: '#d32f2f', mb: 2 }} />
                    <Typography variant="body1">
                      ตัวอย่าง PDF (ในการใช้งานจริงจะแสดง PDF viewer ที่นี่)
                    </Typography>
                  </Box>
                ) : selectedFile.type.includes('sheet') || selectedFile.type.includes('excel') ? (
                  <Box>
                    <TableChart sx={{ fontSize: 48, color: '#2e7d32', mb: 2 }} />
                    <Typography variant="body1">
                      ตัวอย่าง Excel (ในการใช้งานจริงจะแสดงตารางข้อมูลที่นี่)
                    </Typography>
                  </Box>
                ) : selectedFile.type.includes('word') || selectedFile.type.includes('document') ? (
                  <Box>
                    <Description sx={{ fontSize: 48, color: '#1976d2', mb: 2 }} />
                    <Typography variant="body1">
                      ตัวอย่าง Word (ในการใช้งานจริงจะแสดงเนื้อหาเอกสารที่นี่)
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <InsertDriveFile sx={{ fontSize: 48, color: '#666', mb: 2 }} />
                    <Typography variant="body1">
                      ไม่สามารถแสดงตัวอย่างไฟล์ประเภทนี้ได้
                    </Typography>
                  </Box>
                )}
                
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                  * ในการใช้งานจริง จะมีการแสดงเนื้อหาไฟล์จริงที่นี่
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => selectedFile && handleDownloadFile(selectedFile)} startIcon={<Download />}>
            ดาวน์โหลด
          </Button>
          <Button onClick={handleCloseViewDialog} color="inherit">
            ปิด
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};