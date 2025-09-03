import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, IconButton, Typography, Box, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { FaBars, FaAngleRight, FaSignOutAlt } from 'react-icons/fa';
import { RxAvatar } from 'react-icons/rx';
import './Header.css';

type HeaderProps = {
  onToggleSidebar?: () => void;
  collapsed?: boolean;
  isMobile?: boolean;
};

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, collapsed = false, isMobile = false }) => {
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
  const userName = userEmail.split('@')[0] || 'User';
  const role = 'Asset Manager';

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutDialog(false);
    // Clear login state
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    // Redirect to login page
    navigate('/');
  };

  const handleLogoutCancel = () => {
    setShowLogoutDialog(false);
  };

  const headerClass = `card-basic ${collapsed ? 'collapsed' : ''}${isMobile ? ' full-width' : ''}`;

  return (
    <>
      <AppBar position="static" className={headerClass}>
        <Toolbar style={{ minHeight: '56px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px' }}>
          {/* ฝั่งซ้าย */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {onToggleSidebar && (
              <IconButton onClick={onToggleSidebar} className="icon-button">
                {isMobile ? <FaBars size={20} /> : (collapsed ? <FaAngleRight size={20} /> : <FaBars size={20} />)}
              </IconButton>
            )}
            
            <Typography variant="h6" component="div" sx={{ color: 'white' }}>
              Fixed Asset Transfer System
            </Typography>
          </Box>

          {/* ฝั่งขวา */}
          <Box className="set-layout-logout" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}> 
            <div className="header-avatar">
              <RxAvatar size={isMobile ? 22 : 24} color="white" />
            </div>
            <Box className="header-text">
              <Typography variant={isMobile ? "body2" : "body1"} sx={{ fontSize: '14px' }}>{userName}</Typography>
              <Typography variant="caption" className="header-role">
                {role}
              </Typography>
            </Box>
            <Tooltip title="Logout">
              <button className="btn-logout" onClick={handleLogoutClick}>
                <FaSignOutAlt size={isMobile ? 12 : 14} />
              </button>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={showLogoutDialog}
        onClose={handleLogoutCancel}
        maxWidth="xs"
        PaperProps={{
          style: {
            minWidth: '320px',
            maxWidth: '400px'
          }
        }}
      >
        <DialogTitle 
          style={{ fontSize: '1.5rem', textAlign: 'center', fontWeight: 600, padding: 16 }}
        >
          ออกจากระบบ
        </DialogTitle>
        <DialogContent style={{ padding: '16px', paddingTop: 0 }}>
          <Typography variant="body2" style={{ fontSize: '16px', textAlign: 'center' }}>
            คุณต้องการออกจากระบบใช่หรือไม่?
          </Typography>
        </DialogContent>
        <DialogActions style={{ justifyContent: 'center', gap: 8, padding: 16 }}>
          <Button
            onClick={handleLogoutCancel}
            variant="outlined"
            size="small"
            style={{ minWidth: '80px' }}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleLogoutConfirm}
            variant="contained"
            size="small"
            style={{ 
              backgroundColor: '#d32f2f',
              minWidth: '80px'
            }}
          >
            ออกจากระบบ
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Header;