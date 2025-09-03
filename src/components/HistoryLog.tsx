import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
} from '@mui/material';
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
} from '@mui/icons-material';

export interface HistoryLogEntry {
  id: string;
  status: string;
  timestamp: string;
  user: string;
  comment?: string;
}

interface HistoryLogProps {
  entries: HistoryLogEntry[];
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Pending Review':
      return <PendingActions />;
    case 'Transfer Report Mismatch':
      return <Warning />;
    case 'Transfer Report Mismatch(Re-Process)':
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
      return 'warning';
    case 'Transfer Report Mismatch':
      return 'error';
    case 'Transfer Report Mismatch(Re-Process)':
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
  const color = getStatusColor(status) as any;
  
  switch (status) {
    case 'Pending Review':
      return <Chip label={status} color={color} size="small" />;
    case 'Transfer Report Mismatch':
      return <Chip label={status} color={color} size="small" />;
    case 'Transfer Report Mismatch(Re-Process)':
      return <Chip label={status} color={color} size="small" />;
    case 'Reject':
      return <Chip label={status} color={color} size="small" />;
    case 'Completed':
      return <Chip label={status} color={color} size="small" />;
    default:
      return <Chip label={status} size="small" />;
  }
};

export const HistoryLog: React.FC<HistoryLogProps> = ({ entries }) => {
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

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
                    color: '#666'
                  }}
                >
                  "{entry.comment}"
                </Typography>
              )}
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Paper>
  );
};