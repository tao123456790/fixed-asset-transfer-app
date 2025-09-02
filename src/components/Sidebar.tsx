import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
  Tooltip
} from '@mui/material';
import { FaHome, FaList, FaBuilding } from 'react-icons/fa';
import './Sidebar/Sidebar.css';

const drawerWidth = 240;

interface NavItem {
  text: string;
  icon: React.ReactNode;
  path: string;
}

const navItems: NavItem[] = [
  {
    text: 'Dashboard',
    icon: <FaHome />,
    path: '/dashboard'
  },
  {
    text: 'รายละเอียดทั้งหมด',
    icon: <FaList />,
    path: '/detail-list'
  }
];

type AppSidebarProps = {
  collapsed: boolean;
  isMobile?: boolean;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

const AppSidebar: React.FC<AppSidebarProps> = ({
  collapsed,
  isMobile = false,
  mobileOpen = false,
  onMobileClose
}) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleMenuClick = (path: string) => {
    navigate(path);
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  const sidebarContent = (
    <Box sx={{ 
      width: collapsed && !isMobile ? 60 : drawerWidth,
      height: '100vh',
      backgroundColor: '#333',
      color: 'white',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Logo Section */}
      <Box sx={{ 
        p: collapsed && !isMobile ? 1 : 2, 
        textAlign: 'center', 
        backgroundColor: '#333',
        borderBottom: '1px solid #444'
      }}>
        <img 
          src="/CP_Axtra_Logo.svg.png" 
          alt="CP Axtra Logo" 
          style={{
            width: collapsed && !isMobile ? '30px' : '150px',
            height: 'auto',
            maxHeight: collapsed && !isMobile ? '30px' : '60px',
            objectFit: 'contain'
          }}
        />
        {(!collapsed || isMobile) && (
          <Typography variant="h6" sx={{ 
            color: '#1976d2', 
            fontWeight: 'bold', 
            fontSize: '1.1rem',
            mt: 1
          }}>
            Asset Manager
          </Typography>
        )}
      </Box>
      
      <Divider sx={{ borderColor: '#444' }} />
      
      {/* Menu Items */}
      <List sx={{ pt: 2, flex: 1 }}>
        {navItems.map((item) => (
          <Tooltip
            key={item.path}
            title={collapsed && !isMobile ? item.text : ''}
            placement="right"
            arrow
          >
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleMenuClick(item.path)}
                selected={pathname === item.path}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  minHeight: 44,
                  justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                  px: collapsed && !isMobile ? 0 : 2,
                  '&.Mui-selected': {
                    backgroundColor: '#1976d2',
                    color: 'white',
                    '& .MuiListItemIcon-root': {
                      color: 'white'
                    },
                    '&:hover': {
                      backgroundColor: '#1565c0'
                    }
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.1)'
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: collapsed && !isMobile ? 0 : 40,
                  justifyContent: 'center',
                  color: pathname === item.path ? 'white' : '#ccc'
                }}>
                  {item.icon}
                </ListItemIcon>
                {(!collapsed || isMobile) && (
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: 14,
                      fontWeight: pathname === item.path ? 'bold' : 'normal'
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          </Tooltip>
        ))}
      </List>
      
      {/* Footer */}
      {(!collapsed || isMobile) && (
        <Box sx={{ p: 2, textAlign: 'center', borderTop: '1px solid #444' }}>
          <Typography variant="caption" sx={{ color: '#999', display: 'block' }}>
            Version 1.0.0
          </Typography>
          <Typography variant="caption" sx={{ color: '#999', display: 'block' }}>
            © 2024 Asset Transfer
          </Typography>
        </Box>
      )}
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: collapsed ? 60 : drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: collapsed ? 60 : drawerWidth,
          boxSizing: 'border-box',
          border: 'none',
          position: 'fixed',
          left: 0,
          top: 0,
          height: '100vh',
          zIndex: 1100
        },
      }}
    >
      {sidebarContent}
    </Drawer>
  );
};

export default AppSidebar;