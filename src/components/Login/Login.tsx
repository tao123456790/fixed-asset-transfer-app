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
  Container,
  Avatar,
  Divider,
  Chip,
  CircularProgress
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  LockOutlined,
  EmailOutlined,
  LoginOutlined
} from '@mui/icons-material';
import { useFormValidation, PATTERNS } from '../../utils/validation';
import './Login.css';

interface LoginProps {
  onLogin?: (email: string, password: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Demo accounts
  const DEMO_ACCOUNTS = [
    { email: 'admin@company.com', password: 'admin123', role: 'Admin' },
    { email: 'user@company.com', password: 'user123', role: 'User' },
    { email: 'manager@company.com', password: 'manager123', role: 'Manager' }
  ];

  // Define validation rules
  const validationRules = {
    email: { 
      required: true, 
      pattern: PATTERNS.EMAIL,
      message: 'กรุณากรอกอีเมลให้ถูกต้อง'
    },
    password: { 
      required: true, 
      minLength: 1,
      message: 'กรุณากรอกรหัสผ่าน'
    }
  };

  const { 
    errors, 
    validateForm, 
    validateSingleField, 
    clearFieldError, 
    hasFieldError,
    setFieldError 
  } = useFormValidation(validationRules);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (hasFieldError(name)) {
      clearFieldError(name);
    }
  };

  const validate = () => {
    return validateForm(formData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    
    // Add a small delay to show loading effect
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      // Simple validation - accept any email/password
      if (formData.email && formData.password) {
        // Save login state
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', formData.email);
        
        // Call onLogin callback if provided
        if (onLogin) {
          onLogin(formData.email, formData.password);
        }
        
        // Navigate to dashboard
        navigate('/dashboard');
      }
    } catch (error: any) {
      setFieldError('password', error.message || 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองอีกครั้ง');
      setLoading(false);
    }
  };

  return (
    <Box
      className="login-container flex-center p-2"
      style={{
        minHeight: '100vh'
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={20}
          className="p-3"
          style={{
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            maxWidth: 400,
            margin: '0 auto'
          }}
        >
          <Box className="text-center mb-3">
            <Avatar
              className="avatar-60"
              style={{
                margin: '0 auto 12px auto',
                backgroundColor: '#1976d2',
                fontSize: '1.5rem'
              }}
            >
              <LockOutlined fontSize="medium" />
            </Avatar>
            
            <Typography variant="h4" component="h1" gutterBottom className="font-weight-600">
              <span style={{ color: '#1976d2' }}>Fixed Asset</span>
              <span style={{ color: '#ff9800' }}>Transfer</span>
            </Typography>
            
            <Typography variant="body1" color="textSecondary" gutterBottom>
              ยินดีต้อนรับ!
            </Typography>
            
            <Typography variant="body2" color="textSecondary">
              กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} className="mt-2">
            <TextField
              fullWidth
              id="email"
              name="email"
              label="อีเมล"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={() => validateSingleField('email', formData.email)}
              error={hasFieldError('email')}
              helperText={errors.email}
              margin="normal"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlined color="action" />
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
              id="password"
              name="password"
              label="รหัสผ่าน"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              onBlur={() => validateSingleField('password', formData.password)}
              error={hasFieldError('password')}
              helperText={errors.password}
              margin="normal"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
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
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginOutlined />}
              sx={{
                mt: 2.5,
                mb: 2.5,
                py: 1.2,
                borderRadius: 2,
                fontSize: '1rem',
                fontWeight: 'bold',
                background: loading ? '#ccc' : 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                '&:hover': !loading ? {
                  background: 'linear-gradient(45deg, #1565c0 30%, #1e88e5 90%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)'
                } : {},
                transition: 'all 0.3s ease',
                cursor: loading ? 'wait' : 'pointer'
              }}
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </Button>

            <Divider style={{ margin: '12px 0' }}>
              <Typography variant="caption" color="textSecondary">
                บัญชีทดสอบ
              </Typography>
            </Divider>

            <Box className="flex-center" style={{ flexWrap: 'wrap', gap: '6px' }}>
              {DEMO_ACCOUNTS.map((acc, index) => (
                <Chip
                  key={index}
                  label={acc.role}
                  variant="outlined"
                  size="small"
                  onClick={() => setFormData({ email: acc.email, password: acc.password })}
                  sx={{ 
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    '&:hover': {
                      backgroundColor: '#e3f2fd',
                      color: '#1976d2',
                      borderColor: '#1976d2',
                      transform: 'scale(1.05)',
                      boxShadow: '0 4px 8px rgba(25, 118, 210, 0.3)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                />
              ))}
            </Box>

            <Typography variant="caption" color="textSecondary" align="center" className="mt-1" style={{ display: 'block' }}>
              คลิกเลือกบทบาทเพื่อกรอกข้อมูลอัตโนมัติ
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;