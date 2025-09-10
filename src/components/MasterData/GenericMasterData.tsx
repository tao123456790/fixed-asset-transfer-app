import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    IconButton,
    Button,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Checkbox,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    CircularProgress,
    Alert,
    Tooltip,
    InputAdornment,
    TablePagination,
    Chip,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    Upload as UploadIcon,
    Download as DownloadIcon,
    Search as SearchIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useToast } from '../common/ToastNotification';

export interface GenericMasterItem {
    id?: string | number;
    isActive?: boolean;
    lastUpdate?: string;
    updateBy?: string;
}

export interface FieldConfig {
    key: string;
    label: string;
    type?: 'text' | 'number' | 'date' | 'select' | 'checkbox';
    width?: number;
    required?: boolean;
    editable?: boolean;
    options?: { value: string; label: string }[];
    placeholder?: string;
}

export interface ApiService<T> {
    getAll: () => Promise<T[]>;
    create: (item: Partial<T>) => Promise<T>;
    update: (id: string | number, item: Partial<T>) => Promise<T>;
    delete: (id: string | number) => Promise<void>;
}

export interface MasterDataConfig<T extends GenericMasterItem> {
    title: string;
    fields: FieldConfig[];
    initialData: T[];
    validation?: Record<string, (value: any, item?: T) => string | null>;
    duplicateCheck?: (item: T, rows: T[]) => boolean;
    storageKey: string;
    apiConfig?: {
        service: ApiService<T>;
        transformRequest?: (item: Partial<T>) => any;
        transformResponse?: (data: any) => any;
    };
}

interface GenericMasterDataProps<T extends GenericMasterItem> {
    config: MasterDataConfig<T>;
}

function GenericMasterData<T extends GenericMasterItem>({ config }: GenericMasterDataProps<T>) {
    const { showToast } = useToast();
    const [rows, setRows] = useState<T[]>([]);
    const [editingId, setEditingId] = useState<string | number | null>(null);
    const [editingData, setEditingData] = useState<Partial<T>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [loading, setLoading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | number | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    const loadData = useCallback(async () => {
        if (!config.apiConfig) {
            const storedData = localStorage.getItem(config.storageKey);
            if (storedData) {
                setRows(JSON.parse(storedData));
            } else {
                setRows(config.initialData);
            }
            return;
        }

        setLoading(true);
        try {
            const data = await config.apiConfig.service.getAll();
            const transformedData = config.apiConfig.transformResponse 
                ? config.apiConfig.transformResponse(data)
                : data;
            setRows(transformedData);
        } catch (error) {
            console.error('Error loading data:', error);
            showToast('Failed to load data', 'error');
        } finally {
            setLoading(false);
        }
    }, [config, showToast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filteredRows = useMemo(() => {
        if (!searchTerm) return rows;
        return rows.filter(row =>
            config.fields.some(field =>
                String(row[field.key as keyof T] || '').toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [rows, searchTerm, config.fields]);

    const paginatedRows = useMemo(() => {
        const startIndex = page * rowsPerPage;
        return filteredRows.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredRows, page, rowsPerPage]);

    const validateField = (key: string, value: any): string | null => {
        if (config.validation && config.validation[key]) {
            return config.validation[key](value, editingData as T);
        }
        const field = config.fields.find(f => f.key === key);
        if (field?.required && !value) {
            return `${field.label} is required`;
        }
        return null;
    };

    const handleEdit = (item: T) => {
        setEditingId(item.id!);
        setEditingData({ ...item });
        setValidationErrors({});
        setEditDialogOpen(true);
    };

    const handleSave = async () => {
        const errors: Record<string, string> = {};
        config.fields.forEach(field => {
            const error = validateField(field.key, editingData[field.key as keyof T]);
            if (error) {
                errors[field.key] = error;
            }
        });

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            showToast('Please fix validation errors', 'error');
            return;
        }

        if (config.duplicateCheck && config.duplicateCheck(editingData as T, rows)) {
            showToast('Duplicate entry detected', 'error');
            return;
        }

        setLoading(true);
        try {
            if (config.apiConfig) {
                const requestData = config.apiConfig.transformRequest 
                    ? config.apiConfig.transformRequest(editingData)
                    : editingData;
                
                if (editingId && editingId !== 'new') {
                    await config.apiConfig.service.update(editingId, requestData);
                } else {
                    await config.apiConfig.service.create(requestData);
                }
                await loadData();
            } else {
                const updatedRows = editingId === 'new'
                    ? [...rows, { ...editingData, id: Date.now() } as T]
                    : rows.map(row => row.id === editingId ? { ...row, ...editingData } : row);
                setRows(updatedRows);
                localStorage.setItem(config.storageKey, JSON.stringify(updatedRows));
            }
            
            showToast('Saved successfully', 'success');
            setEditingId(null);
            setEditingData({});
            setValidationErrors({});
            setAddDialogOpen(false);
            setEditDialogOpen(false);
        } catch (error) {
            console.error('Error saving:', error);
            showToast('Failed to save', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        setLoading(true);
        try {
            // Check if the item has a status field - if so, mark as inactive instead of deleting
            const itemToDelete = rows.find(row => row.id === deleteId);
            const hasStatusField = config.fields.some(field => field.key === 'status');
            
            if (hasStatusField && itemToDelete) {
                // Change status to INACTIVE and set close date instead of deleting
                if (config.apiConfig) {
                    const updatedItem = { ...itemToDelete, status: 'INACTIVE', closeDate: new Date().toISOString().split('T')[0] };
                    await config.apiConfig.service.update(deleteId, updatedItem);
                    await loadData();
                } else {
                    const updatedRows = rows.map(row => 
                        row.id === deleteId 
                            ? { ...row, status: 'INACTIVE', closeDate: new Date().toISOString().split('T')[0] }
                            : row
                    );
                    setRows(updatedRows);
                    localStorage.setItem(config.storageKey, JSON.stringify(updatedRows));
                }
                showToast('Status changed to INACTIVE', 'success');
            } else {
                // Original delete logic for items without status field
                if (config.apiConfig) {
                    await config.apiConfig.service.delete(deleteId);
                    await loadData();
                } else {
                    const updatedRows = rows.filter(row => row.id !== deleteId);
                    setRows(updatedRows);
                    localStorage.setItem(config.storageKey, JSON.stringify(updatedRows));
                }
                showToast('Deleted successfully', 'success');
            }
            
            setDeleteDialogOpen(false);
            setDeleteId(null);
        } catch (error) {
            console.error('Error deleting:', error);
            showToast('Failed to delete', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        const newItem: Partial<T> = { id: 'new' } as Partial<T>;
        config.fields.forEach(field => {
            if (field.type === 'checkbox') {
                (newItem as any)[field.key] = false;
            } else {
                (newItem as any)[field.key] = '';
            }
        });
        setEditingId('new');
        setEditingData(newItem);
        setValidationErrors({});
        setAddDialogOpen(true);
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditingData({});
        setValidationErrors({});
        setAddDialogOpen(false);
        setEditDialogOpen(false);
    };

    const renderCell = (item: T, field: FieldConfig) => {
        const value = item[field.key as keyof T];


        if (field.type === 'checkbox') {
            return <Checkbox checked={!!value} disabled />;
        }

        if (field.type === 'select') {
            const option = field.options?.find(o => o.value === value);
            const label = option?.label || String(value || '-');
            
            // Special styling for Status field - show as colored chip
            if (field.key === 'status') {
                const chipColor = value === 'ACTIVE' ? 'success' : value === 'INACTIVE' ? 'error' : 'default';
                return <Chip label={label} size="small" color={chipColor} />;
            }
            
            // For other select fields like Region - show as plain text
            return <Typography variant="body2">{label}</Typography>;
        }

        return <Typography variant="body2">{value as any || '-'}</Typography>;
    };

    return (
        <Box sx={{ p: 3 }}>
            <Paper elevation={3} sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" component="h2">
                        {config.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            size="small"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        /> 
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleAdd}
                            disabled={editingId !== null}
                        >
                            Add New
                        </Button>
                    </Box>
                </Box>

                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                        <CircularProgress />
                    </Box>
                )}

                <TableContainer component={Paper} elevation={2}>
                    <Table sx={{ 
                        minWidth: 650,
                        borderCollapse: "separate",
                        borderSpacing: 1
                    }}>
                        <TableHead>
                            <TableRow>
                                {config.fields.map(field => (
                                    <TableCell 
                                        key={field.key} 
                                        sx={{
                                            width: field.width,
                                            bgcolor: '#2196f3',
                                            color: 'white',
                                            border: 2,
                                            borderColor: '#1976d2',
                                            fontWeight: 700
                                        }}
                                    >
                                        {field.label}
                                        {field.required && <span style={{ color: 'red' }}> *</span>}
                                    </TableCell>
                                ))}
                                <TableCell 
                                    align="center" 
                                    sx={{
                                        width: 120,
                                        bgcolor: '#2196f3',
                                        color: 'white',
                                        border: 2,
                                        borderColor: '#1976d2',
                                        fontWeight: 700
                                    }}
                                >
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedRows.map((row) => (
                                <TableRow 
                                    key={row.id}
                                    sx={{
                                        '&:hover': {
                                            bgcolor: '#f8f9fa'
                                        },
                                        '&:nth-of-type(even)': {
                                            bgcolor: '#fafafa'
                                        }
                                    }}
                                >
                                    {config.fields.map(field => (
                                        <TableCell 
                                            key={field.key}
                                            sx={{
                                                border: 1,
                                                borderColor: '#e0e0e0',
                                                py: 1
                                            }}
                                        >
                                            {renderCell(row, field)}
                                        </TableCell>
                                    ))}
                                    <TableCell 
                                        align="center"
                                        sx={{
                                            border: 1,
                                            borderColor: '#e0e0e0',
                                            py: 1
                                        }}
                                    >
                                        <IconButton 
                                            onClick={() => handleEdit(row)} 
                                            size="small"
                                            sx={{
                                                color: '#1976d2',
                                                '&:hover': {
                                                    bgcolor: 'rgba(25, 118, 210, 0.08)'
                                                }
                                            }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton 
                                            onClick={() => {
                                                setDeleteId(row.id!);
                                                setDeleteDialogOpen(true);
                                            }} 
                                            size="small"
                                            sx={{
                                                color: '#f44336',
                                                '&:hover': {
                                                    bgcolor: 'rgba(244, 67, 54, 0.08)'
                                                }
                                            }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    component="div"
                    count={filteredRows.length}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                />
            </Paper>

            {/* Add New Dialog */}
            <Dialog
                open={addDialogOpen}
                onClose={() => setAddDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Add New {config.title}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {config.fields
                            .filter(field => field.editable !== false)
                            .map(field => (
                                <Box key={field.key}>
                                    {field.type === 'select' ? (
                                        <FormControl fullWidth error={!!validationErrors[field.key]}>
                                            <Select
                                                value={(editingData as any)[field.key] || ''}
                                                onChange={(e) => setEditingData(prev => ({ ...prev, [field.key]: e.target.value }))}
                                                displayEmpty
                                            >
                                                <MenuItem value="">{field.placeholder || `Select ${field.label}`}</MenuItem>
                                                {field.options?.map(option => (
                                                    <MenuItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {validationErrors[field.key] && (
                                                <Alert severity="error" sx={{ mt: 1 }}>
                                                    {validationErrors[field.key]}
                                                </Alert>
                                            )}
                                        </FormControl>
                                    ) : field.type === 'checkbox' ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Checkbox
                                                checked={!!(editingData as any)[field.key]}
                                                onChange={(e) => setEditingData(prev => ({ ...prev, [field.key]: e.target.checked }))}
                                            />
                                            <Typography>{field.label}</Typography>
                                        </Box>
                                    ) : (
                                        <TextField
                                            fullWidth
                                            label={field.label}
                                            type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                                            value={(editingData as any)[field.key] || ''}
                                            onChange={(e) => setEditingData(prev => ({ ...prev, [field.key]: e.target.value }))}
                                            placeholder={field.placeholder}
                                            required={field.required}
                                            error={!!validationErrors[field.key]}
                                            helperText={validationErrors[field.key]}
                                            InputLabelProps={field.type === 'date' ? { shrink: true } : undefined}
                                        />
                                    )}
                                </Box>
                            ))}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained" color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Edit {config.title}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {config.fields
                            .filter(field => field.editable !== false)
                            .map(field => (
                                <Box key={field.key}>
                                    {field.type === 'select' ? (
                                        <FormControl fullWidth error={!!validationErrors[field.key]}>
                                            <Select
                                                value={(editingData as any)[field.key] || ''}
                                                onChange={(e) => setEditingData(prev => ({ ...prev, [field.key]: e.target.value }))}
                                                displayEmpty
                                            >
                                                <MenuItem value="">{field.placeholder || `Select ${field.label}`}</MenuItem>
                                                {field.options?.map(option => (
                                                    <MenuItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {validationErrors[field.key] && (
                                                <Alert severity="error" sx={{ mt: 1 }}>
                                                    {validationErrors[field.key]}
                                                </Alert>
                                            )}
                                        </FormControl>
                                    ) : field.type === 'checkbox' ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Checkbox
                                                checked={!!(editingData as any)[field.key]}
                                                onChange={(e) => setEditingData(prev => ({ ...prev, [field.key]: e.target.checked }))}
                                            />
                                            <Typography>{field.label}</Typography>
                                        </Box>
                                    ) : (
                                        <TextField
                                            fullWidth
                                            label={field.label}
                                            type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                                            value={(editingData as any)[field.key] || ''}
                                            onChange={(e) => setEditingData(prev => ({ ...prev, [field.key]: e.target.value }))}
                                            placeholder={field.placeholder}
                                            required={field.required}
                                            error={!!validationErrors[field.key]}
                                            helperText={validationErrors[field.key]}
                                            InputLabelProps={field.type === 'date' ? { shrink: true } : undefined}
                                        />
                                    )}
                                </Box>
                            ))}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained" color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Confirm Action</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {config.fields.some(field => field.key === 'status')
                            ? 'Are you sure you want to deactivate this item? The status will be changed to INACTIVE.'
                            : 'Are you sure you want to delete this item? This action cannot be undone.'
                        }
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">
                        {config.fields.some(field => field.key === 'status') ? 'Deactivate' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default GenericMasterData;