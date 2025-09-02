import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert
} from '@mui/material';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!email || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }
    
    // Mock login - accept any email/password
    if (email && password) {
      // Save login state
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', email);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } else {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" sx={{ mb: 3, color: '#1976d2' }}>
            เข้าสู่ระบบ
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="อีเมล"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="รหัสผ่าน"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              เข้าสู่ระบบ
            </Button>
          </Box>
          
          <Typography variant="caption" color="textSecondary" align="center" sx={{ display: 'block', mt: 2 }}>
            ใส่อีเมลและรหัสผ่านอะไรก็ได้เพื่อทดสอบ
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;