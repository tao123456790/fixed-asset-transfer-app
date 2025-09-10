import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  Badge,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Snackbar,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Visibility,
  Download,
  InsertDriveFile,
  Image as ImageIcon,
  PictureAsPdf,
  Description,
  TableChart,
  Folder,
  FolderOpen,
  AttachFile,
  Close,
  ZoomIn,
  ZoomOut,
  Fullscreen,
} from '@mui/icons-material';

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  uploadedBy: string;
  description?: string;
  category: 'transfer_form' | 'nbv' | 'approve' | 'fbdi' | 're-process';
}

interface AttachmentsPageProps {
  transferFormData?: any;
}

const AttachmentsPage: React.FC<AttachmentsPageProps> = ({ transferFormData }) => {
  const [attachments, setAttachments] = useState<Attachment[]>([
    {
      id: '1',
      name: 'asset_transfer_form.xlsx',
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 245780,
      uploadDate: '2025-01-15',
      uploadedBy: 'John Doe',
      description: 'Asset transfer form with details',
      category: 'transfer_form',
    },
    {
      id: '2',
      name: 'nbv_calculation.xlsx',
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 156789,
      uploadDate: '2025-01-14',
      uploadedBy: 'Jane Smith',
      description: 'Net book value calculations',
      category: 'nbv',
    },
    {
      id: '3',
      name: 'approval_document.pdf',
      type: 'application/pdf',
      size: 89456,
      uploadDate: '2025-01-13',
      uploadedBy: 'Mike Johnson',
      description: 'Management approval',
      category: 'approve',
    },
    {
      id: '4',
      name: 'approval_signature.jpg',
      type: 'image/jpeg',
      size: 34567,
      uploadDate: '2025-01-12',
      uploadedBy: 'Sarah Lee',
      description: 'Signature page',
      category: 'approve',
    },
    {
      id: '5',
      name: 'fbdi_template.xlsx',
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 567890,
      uploadDate: '2025-01-11',
      uploadedBy: 'Tom Wilson',
      description: 'FBDI import template',
      category: 'fbdi',
    },
    {
      id: '6',
      name: 'reprocess_correction.xlsx',
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 234567,
      uploadDate: '2025-01-16',
      uploadedBy: 'System Admin',
      description: 'Re-process correction document',
      category: 're-process',
    },
  ]);

  const [selectedCategory, setSelectedCategory] = useState<'transfer_form' | 'nbv' | 'approve' | 'fbdi' | 're-process'>('transfer_form');
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDescription, setFileDescription] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [viewingAttachment, setViewingAttachment] = useState<Attachment | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [imageZoom, setImageZoom] = useState(1);

  const categoryConfig = {
    transfer_form: {
      label: 'Asset Transfer Form',
      shortLabel: 'Transfer Form',
      color: '#2196F3',
      acceptedTypes: '.xlsx,.xls',
      acceptedMimes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
      description: 'Excel files only',
    },
    nbv: {
      label: 'NBV',
      shortLabel: 'NBV',
      color: '#9C27B0',
      acceptedTypes: '.xlsx,.xls',
      acceptedMimes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
      description: 'Excel files only',
    },
    approve: {
      label: 'Approve',
      shortLabel: 'Approve',
      color: '#4CAF50',
      acceptedTypes: '.xlsx,.xls,.doc,.docx,.jpg,.jpeg,.pdf,.png',
      acceptedMimes: [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'image/jpeg',
        'image/jpg',
        'application/pdf',
        'image/png'
      ],
      description: 'Excel, Word, JPG, PDF, PNG',
    },
    fbdi: {
      label: 'FBDI',
      shortLabel: 'FBDI',
      color: '#FF9800',
      acceptedTypes: '.xlsx,.xls',
      acceptedMimes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
      description: 'Excel files only',
    },
    're-process': {
      label: 'Re-Process',
      shortLabel: 'Re-Process',
      color: '#FF5722',
      acceptedTypes: '.xlsx,.xls,.doc,.docx,.jpg,.jpeg,.pdf,.png',
      acceptedMimes: [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'image/jpeg',
        'application/pdf',
        'image/png'
      ],
      description: 'Excel, Word, JPG, PDF, PNG',
    },
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon />;
    if (type === 'application/pdf') return <PictureAsPdf />;
    if (type.includes('spreadsheet') || type.includes('excel')) return <TableChart />;
    if (type.includes('word') || type.includes('document')) return <Description />;
    return <InsertDriveFile />;
  };

  const getFileTypeChip = (type: string) => {
    let label = 'Document';
    let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
    
    if (type.startsWith('image/')) {
      label = 'Image';
      color = 'success';
    } else if (type === 'application/pdf') {
      label = 'PDF';
      color = 'error';
    } else if (type.includes('spreadsheet') || type.includes('excel')) {
      label = 'Excel';
      color = 'primary';
    } else if (type.includes('word') || type.includes('document')) {
      label = 'Word';
      color = 'info';
    }
    
    return <Chip label={label} size="small" color={color} />;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size must be less than 10MB');
        return;
      }

      const config = categoryConfig[selectedCategory];
      if (!config.acceptedMimes.includes(file.type)) {
        setUploadError(`Invalid file type. ${config.description}`);
        return;
      }

      setSelectedFile(file);
      setUploadError('');
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      const newAttachment: Attachment = {
        id: Date.now().toString(),
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
        uploadDate: new Date().toISOString().split('T')[0],
        uploadedBy: 'Current User',
        description: fileDescription,
        category: selectedCategory,
      };
      
      setAttachments([...attachments, newAttachment]);
      setOpenUploadDialog(false);
      setSelectedFile(null);
      setFileDescription('');
    }
  };

  const handleDelete = (id: string) => {
    setAttachments(attachments.filter(att => att.id !== id));
  };

  const handleView = (attachment: Attachment) => {
    setViewingAttachment(attachment);
    setOpenViewDialog(true);
    setImageZoom(1);
  };

  const handleDownload = (attachment: Attachment) => {
    // Create a mock download URL (in real app, this would be from server)
    const downloadUrl = `data:${attachment.type};base64,${btoa('mock file content for ' + attachment.name)}`;
    
    // Create temporary link element to trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success message
    setSnackbarMessage(`Downloaded ${attachment.name}`);
    setSnackbarOpen(true);
  };

  const handleCloseView = () => {
    setOpenViewDialog(false);
    setViewingAttachment(null);
    setImageZoom(1);
  };

  const handleZoomIn = () => {
    setImageZoom(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setImageZoom(prev => Math.max(prev - 0.5, 0.5));
  };

  const renderFilePreview = (attachment: Attachment) => {
    const isImage = attachment.type.startsWith('image/');
    const isPdf = attachment.type === 'application/pdf';
    const isExcel = attachment.type.includes('spreadsheet') || attachment.type.includes('excel');
    const isWord = attachment.type.includes('word') || attachment.type.includes('document');

    if (isImage) {
      // Mock image preview with actual image-like content
      return (
        <Box sx={{ position: 'relative' }}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
            <IconButton onClick={handleZoomOut} disabled={imageZoom <= 0.5}>
              <ZoomOut />
            </IconButton>
            <Typography variant="body2" sx={{ alignSelf: 'center', px: 2 }}>
              {Math.round(imageZoom * 100)}%
            </Typography>
            <IconButton onClick={handleZoomIn} disabled={imageZoom >= 3}>
              <ZoomIn />
            </IconButton>
          </Box>
          <Box 
            sx={{ 
              overflow: 'auto', 
              maxHeight: '60vh',
              border: '1px solid #ddd',
              borderRadius: 1,
              p: 1,
              backgroundColor: '#f5f5f5',
              textAlign: 'center'
            }}
          >
            {/* Mock image content based on filename */}
            <Box
              sx={{
                width: 500 * imageZoom,
                height: 350 * imageZoom,
                backgroundColor: attachment.name.includes('signature') ? '#fff' : '#e3f2fd',
                border: '2px solid #ddd',
                borderRadius: 1,
                margin: '0 auto',
                position: 'relative',
                backgroundImage: attachment.name.includes('signature') 
                  ? 'linear-gradient(45deg, #f5f5f5 25%, transparent 25%), linear-gradient(-45deg, #f5f5f5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f5f5f5 75%), linear-gradient(-45deg, transparent 75%, #f5f5f5 75%)'
                  : 'none',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
              }}
            >
              {attachment.name.includes('signature') ? (
                <Box sx={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center'
                }}>
                  <Box sx={{
                    fontSize: 36 * imageZoom,
                    fontFamily: 'cursive',
                    color: '#1976d2',
                    transform: 'rotate(-5deg)',
                    border: '2px dashed #1976d2',
                    padding: '10px 20px',
                    backgroundColor: 'rgba(25, 118, 210, 0.1)'
                  }}>
                    John Signature
                  </Box>
                  <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#666' }}>
                    Digital Signature Sample
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center'
                }}>
                  <ImageIcon sx={{ fontSize: 80 * imageZoom, color: '#1976d2', mb: 1 }} />
                  <Typography variant="h6" sx={{ color: '#1976d2' }}>
                    Asset Photo Preview
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {attachment.name}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      );
    }

    if (isPdf) {
      // Mock PDF content preview
      return (
        <Box sx={{ height: '60vh', overflow: 'auto' }}>
          <Box sx={{ p: 3, backgroundColor: '#fff', minHeight: '100%' }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <PictureAsPdf sx={{ fontSize: 40, color: '#f44336', mb: 1 }} />
              <Typography variant="h6">PDF Document Preview</Typography>
              <Typography variant="body2" color="text.secondary">
                {attachment.name}
              </Typography>
            </Box>
            
            {/* Mock PDF content based on filename */}
            <Paper sx={{ p: 3, mb: 2, border: '1px solid #ddd' }}>
              <Typography variant="h5" sx={{ mb: 2, textAlign: 'center', color: '#1976d2' }}>
                {attachment.name.includes('approval') ? 'APPROVAL DOCUMENT' : 'DOCUMENT PREVIEW'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Document Type:</strong> Asset Transfer Approval
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Reference No:</strong> ATF-2025-001
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Date:</strong> {attachment.uploadDate}
              </Typography>
              <Box sx={{ my: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="body2">
                  This document contains the approval details for the asset transfer request. 
                  The transfer has been reviewed and approved by the management team.
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ textAlign: 'center', mt: 3, fontStyle: 'italic' }}>
                --- End of Preview ---
              </Typography>
            </Paper>
            <Alert severity="info">
              This is a preview of the PDF content. Download the file to view the complete document.
            </Alert>
          </Box>
        </Box>
      );
    }

    if (isExcel) {
      // Mock Excel spreadsheet preview
      return (
        <Box sx={{ height: '60vh', overflow: 'auto' }}>
          <Box sx={{ p: 2 }}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <TableChart sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
              <Typography variant="h6">Excel Spreadsheet Preview</Typography>
              <Typography variant="body2" color="text.secondary">
                {attachment.name}
              </Typography>
            </Box>
            
            {/* Mock Excel table content */}
            <TableContainer component={Paper} sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#4caf50' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Asset No</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Description</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>From Location</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>To Location</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>TH2101760</TableCell>
                    <TableCell>Bracket, Bracket D350</TableCell>
                    <TableCell>POOL MINI SUPERMARKET</TableCell>
                    <TableCell>MINI SUPERMARKET - CPFM</TableCell>
                    <TableCell>7,522.48</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>TH2101761</TableCell>
                    <TableCell>Display Shelf Unit, 5-Tier</TableCell>
                    <TableCell>POOL MINI SUPERMARKET</TableCell>
                    <TableCell>MINI SUPERMARKET - CPFM</TableCell>
                    <TableCell>45,000.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>TH2101800</TableCell>
                    <TableCell>Refrigerator, Commercial 2-Door</TableCell>
                    <TableCell>WAREHOUSE A</TableCell>
                    <TableCell>MINI SUPERMARKET - SIAM</TableCell>
                    <TableCell>85,000.00</TableCell>
                  </TableRow>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell colSpan={4} sx={{ fontWeight: 'bold' }}>Total Value:</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>137,522.48</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            
            <Alert severity="info">
              Showing first 3 rows. Download the complete Excel file to view all data.
            </Alert>
          </Box>
        </Box>
      );
    }

    if (isWord) {
      // Mock Word document preview
      return (
        <Box sx={{ height: '60vh', overflow: 'auto' }}>
          <Box sx={{ p: 3, backgroundColor: '#fff' }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Description sx={{ fontSize: 40, color: '#2196f3', mb: 1 }} />
              <Typography variant="h6">Word Document Preview</Typography>
              <Typography variant="body2" color="text.secondary">
                {attachment.name}
              </Typography>
            </Box>
            
            {/* Mock Word document content */}
            <Paper sx={{ p: 3, border: '1px solid #ddd', backgroundColor: '#fdfdfd' }}>
              <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', color: '#1976d2' }}>
                ASSET TRANSFER NOTES
              </Typography>
              
              <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                1. Transfer Overview
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                This document outlines the additional notes and instructions for the asset transfer 
                process. All stakeholders must review these guidelines before proceeding with the transfer.
              </Typography>
              
              <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                2. Prerequisites
              </Typography>
              <Typography variant="body1" sx={{ mb: 1, lineHeight: 1.6 }}>
                • Ensure all assets are properly tagged and documented
              </Typography>
              <Typography variant="body1" sx={{ mb: 1, lineHeight: 1.6 }}>
                • Verify the condition of assets before transfer
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                • Obtain necessary approvals from department heads
              </Typography>
              
              <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                3. Transfer Process
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                The transfer process should be completed within 5 business days from approval date.
                All documentation must be submitted to the asset management team.
              </Typography>
              
              <Typography variant="body2" sx={{ textAlign: 'center', mt: 4, fontStyle: 'italic' }}>
                --- Document Preview End ---
              </Typography>
            </Paper>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              This is a preview of the Word document. Download to view the complete content and formatting.
            </Alert>
          </Box>
        </Box>
      );
    }

    // Default view for other file types
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <InsertDriveFile sx={{ fontSize: 80, color: '#757575', mb: 2 }} />
        <Typography variant="h6" gutterBottom>File Preview</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {attachment.name}
        </Typography>
        <Alert severity="warning" sx={{ textAlign: 'left', mb: 2 }}>
          Preview not available for this file type. Please download to view the content.
        </Alert>
        <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            File Size: {formatFileSize(attachment.size)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload Date: {attachment.uploadDate}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Uploaded By: {attachment.uploadedBy}
          </Typography>
        </Box>
      </Box>
    );
  };

  const getAttachmentsByCategory = (category: 'transfer_form' | 'nbv' | 'approve' | 'fbdi' | 're-process') => {
    return attachments.filter(att => att.category === category);
  };

  const handleCategoryChange = (event: React.MouseEvent<HTMLElement>, newCategory: 'transfer_form' | 'nbv' | 'approve' | 'fbdi' | 're-process' | null) => {
    if (newCategory !== null) {
      setSelectedCategory(newCategory);
    }
  };

  const categoryAttachments = getAttachmentsByCategory(selectedCategory);
  const config = categoryConfig[selectedCategory];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 500 }}>
            Document Attachments
          </Typography> 
        </Box>

        <ToggleButtonGroup
          value={selectedCategory}
          exclusive
          onChange={handleCategoryChange}
          aria-label="document category"
          sx={{ mb: 3, display: 'flex', gap: 2 }}
        >
          {Object.entries(categoryConfig).map(([key, conf]) => {
            const categoryKey = key as 'transfer_form' | 'nbv' | 'approve' | 'fbdi' | 're-process';
            const fileCount = getAttachmentsByCategory(categoryKey).length;
            const isSelected = selectedCategory === categoryKey;
            
            return (
              <ToggleButton 
                key={key} 
                value={key}
                sx={{
                  border: 'none',
                  borderRadius: 2,
                  p: 2,
                  backgroundColor: isSelected ? `${conf.color}15` : 'transparent',
                  borderBottom: isSelected ? `3px solid ${conf.color}` : '3px solid transparent',
                  '&:hover': {
                    backgroundColor: `${conf.color}10`,
                  },
                  '&.Mui-selected': {
                    backgroundColor: `${conf.color}15`,
                    '&:hover': {
                      backgroundColor: `${conf.color}20`,
                    }
                  }
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <Badge 
                    badgeContent={fileCount} 
                    color="error"
                    sx={{ 
                      '& .MuiBadge-badge': {
                        backgroundColor: isSelected ? conf.color : '#757575'
                      }
                    }}
                  >
                    {isSelected ? (
                      <FolderOpen sx={{ fontSize: 40, color: conf.color }} />
                    ) : (
                      <Folder sx={{ fontSize: 40, color: conf.color }} />
                    )}
                  </Badge>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: isSelected ? 600 : 400,
                      color: isSelected ? conf.color : 'text.primary'
                    }}
                  >
                    {conf.shortLabel}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ fontSize: '0.7rem' }}
                  >
                    {conf.description}
                  </Typography>
                </Box>
              </ToggleButton>
            );
          })}
        </ToggleButtonGroup>
      </Box>

      {categoryAttachments.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
          <Folder sx={{ fontSize: 100, color: '#e0e0e0', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No {config.label} files uploaded yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Upload {config.description} to get started
          </Typography>
          <Button
            variant="outlined"
            startIcon={<CloudUpload />}
            onClick={() => setOpenUploadDialog(true)}
            sx={{ borderColor: config.color, color: config.color }}
          >
            Upload First File
          </Button>
        </Paper>
      ) : (
        <Paper>
          <Box sx={{ p: 2, backgroundColor: `${config.color}10`, borderBottom: `2px solid ${config.color}` }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500, color: config.color }}>
              {config.label} Files ({categoryAttachments.length})
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>File Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Upload Date</TableCell>
                  <TableCell>Uploaded By</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categoryAttachments.map((attachment) => (
                  <TableRow key={attachment.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getFileIcon(attachment.type)}
                        <Typography variant="body2">{attachment.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{getFileTypeChip(attachment.type)}</TableCell>
                    <TableCell>{formatFileSize(attachment.size)}</TableCell>
                    <TableCell>{attachment.uploadDate}</TableCell>
                    <TableCell>{attachment.uploadedBy}</TableCell>
                    <TableCell>
                      <Tooltip title={attachment.description || ''}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            maxWidth: 200, 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            whiteSpace: 'nowrap' 
                          }}
                        >
                          {attachment.description || '-'}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleView(attachment)}
                        title="View"
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDownload(attachment)}
                        title="Download"
                      >
                        <Download />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(attachment.id)}
                        title="Delete"
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Dialog open={openUploadDialog} onClose={() => setOpenUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <Folder sx={{ mr: 2, color: config.color }} />
          Upload to {config.label}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {uploadError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {uploadError}
              </Alert>
            )}
            
            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={<AttachFile />}
              sx={{ 
                mb: 2, 
                py: 3,
                border: '2px dashed',
                borderColor: config.color,
                '&:hover': {
                  border: '2px dashed',
                  borderColor: config.color,
                  backgroundColor: `${config.color}10`,
                }
              }}
            >
              {selectedFile ? selectedFile.name : 'Click to choose file or drag and drop'}
              <input
                type="file"
                hidden
                onChange={handleFileSelect}
                accept={config.acceptedTypes}
              />
            </Button>
            
            {selectedFile && (
              <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getFileIcon(selectedFile.type)}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" fontWeight={500}>
                      {selectedFile.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(selectedFile.size)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            )}
            
            <TextField
              label="Description (Optional)"
              fullWidth
              multiline
              rows={3}
              value={fileDescription}
              onChange={(e) => setFileDescription(e.target.value)}
              placeholder="Enter a brief description of this file..."
              sx={{ mb: 2 }}
            />
            
            <Alert severity="info" icon={<InsertDriveFile />}>
              <Typography variant="caption">
                <strong>Accepted formats:</strong> {config.description}
                <br />
                <strong>Maximum size:</strong> 10MB
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => {
            setOpenUploadDialog(false);
            setSelectedFile(null);
            setFileDescription('');
            setUploadError('');
          }}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!selectedFile}
            startIcon={<CloudUpload />}
            sx={{ backgroundColor: config.color }}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* File View Dialog */}
      <Dialog 
        open={openViewDialog} 
        onClose={handleCloseView} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { minHeight: '70vh' }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {viewingAttachment && getFileIcon(viewingAttachment.type)}
            <Typography variant="h6" sx={{ ml: 1 }}>
              {viewingAttachment?.name}
            </Typography>
          </Box>
          <Box>
            <IconButton
              onClick={() => viewingAttachment && handleDownload(viewingAttachment)}
              title="Download"
              sx={{ mr: 1 }}
            >
              <Download />
            </IconButton>
            <IconButton onClick={handleCloseView} title="Close">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {viewingAttachment && renderFilePreview(viewingAttachment)}
        </DialogContent>
        {viewingAttachment?.description && (
          <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderTop: '1px solid #ddd' }}>
            <Typography variant="subtitle2" gutterBottom>
              Description:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {viewingAttachment.description}
            </Typography>
          </Box>
        )}
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default AttachmentsPage;