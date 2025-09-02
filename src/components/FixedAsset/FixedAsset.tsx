import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  IconButton, 
  InputAdornment,
  Alert,
  Container,
  Avatar,
  Divider,
  Chip,
  CircularProgress
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  AssignmentOutlined,
  SearchOutlined,
  TransferWithinAStationOutlined
} from '@mui/icons-material';
import './FixedAsset.css';

export default function FixedAsset() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    assetCode: '', 
    fromLocation: '', 
    toLocation: '', 
    transferReason: '' 
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Add a small delay to show loading effect
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      console.log('Fixed Asset Transfer Data:', formData);
      // Handle fixed asset transfer logic here
      setLoading(false);
    } catch (error: any) {
      console.error('Transfer failed:', error);
      setLoading(false);
    }
  }

  return (
    <Box
      className="fixed-asset-container flex-center p-2"
      style={{
        minHeight: '100vh'
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={20}
          className="p-3"
          style={{
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            maxWidth: 600,
            margin: '0 auto'
          }}
        >
          <Box className="text-center mb-3">
            <Avatar
              className="avatar-60"
              style={{
                margin: '0 auto 12px auto',
                backgroundColor: '#2e7d32',
                fontSize: '1.5rem'
              }}
            >
              <AssignmentOutlined fontSize="medium" />
            </Avatar>
            
            <Typography variant="h4" component="h1" gutterBottom className="font-weight-600">
              <span style={{ color: '#2e7d32' }}>Fixed</span>
              <span style={{ color: '#ff9800' }}>Asset</span>
              <span style={{ color: '#1976d2' }}> Transfer</span>
            </Typography>
            
            <Typography variant="body1" color="textSecondary" gutterBottom>
              Asset Transfer Management System
            </Typography>
            
            <Typography variant="body2" color="textSecondary">
              Manage and track your fixed asset transfers
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} className="mt-2">
            <TextField
              fullWidth
              id="assetCode"
              name="assetCode"
              label="Asset Code"
              type="text"
              value={formData.assetCode}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            <TextField
              fullWidth
              id="fromLocation"
              name="fromLocation"
              label="From Location"
              type="text"
              value={formData.fromLocation || ''}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            <TextField
              fullWidth
              id="toLocation"
              name="toLocation"
              label="To Location"
              type="text"
              value={formData.toLocation || ''}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            <TextField
              fullWidth
              id="transferReason"
              name="transferReason"
              label="Transfer Reason"
              type="text"
              multiline
              rows={3}
              value={formData.transferReason}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AssignmentOutlined color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <TransferWithinAStationOutlined />}
              sx={{
                mt: 2.5,
                mb: 2.5,
                py: 1.2,
                borderRadius: 2,
                fontSize: '1rem',
                fontWeight: 'bold',
                background: loading ? '#ccc' : 'linear-gradient(45deg, #2e7d32 30%, #4caf50 90%)',
                '&:hover': !loading ? {
                  background: 'linear-gradient(45deg, #1b5e20 30%, #388e3c 90%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(46, 125, 50, 0.4)'
                } : {},
                transition: 'all 0.3s ease',
                cursor: loading ? 'wait' : 'pointer'
              }}
            >
              {loading ? 'Processing Transfer...' : 'Process Transfer'}
            </Button>

            <Divider style={{ margin: '12px 0' }}>
              <Typography variant="caption" color="textSecondary">
                Quick Actions
              </Typography>
            </Divider>

            <Box className="flex-center" style={{ flexWrap: 'wrap', gap: '6px' }}>
              <Chip
                label="Search Assets"
                variant="outlined"
                size="small"
                onClick={() => console.log('Search Assets')}
                sx={{ 
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  '&:hover': {
                    backgroundColor: '#2e7d32',
                    color: 'white',
                    borderColor: '#2e7d32',
                    transform: 'scale(1.05)',
                    boxShadow: '0 4px 8px rgba(46, 125, 50, 0.3)'
                  },
                  transition: 'all 0.2s ease'
                }}
              />
              <Chip
                label="View History"
                variant="outlined"
                size="small"
                onClick={() => console.log('View History')}
                sx={{ 
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  '&:hover': {
                    backgroundColor: '#1976d2',
                    color: 'white',
                    borderColor: '#1976d2',
                    transform: 'scale(1.05)',
                    boxShadow: '0 4px 8px rgba(25, 118, 210, 0.3)'
                  },
                  transition: 'all 0.2s ease'
                }}
              />
              <Chip
                label="Generate Report"
                variant="outlined"
                size="small"
                onClick={() => console.log('Generate Report')}
                sx={{ 
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  '&:hover': {
                    backgroundColor: '#ff9800',
                    color: 'white',
                    borderColor: '#ff9800',
                    transform: 'scale(1.05)',
                    boxShadow: '0 4px 8px rgba(255, 152, 0, 0.3)'
                  },
                  transition: 'all 0.2s ease'
                }}
              />
            </Box>

            <Typography variant="caption" color="textSecondary" align="center" className="mt-1" style={{ display: 'block' }}>
              Click on any action to get started
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}