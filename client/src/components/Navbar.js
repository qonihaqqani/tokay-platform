import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Dashboard,
  Assessment,
  AccountBalance,
  Notifications,
  Description,
  Receipt,
  CloudUpload,
  Payment,
  Analytics,
  Cloud,
  Language,
  Speed,
  TrendingUp,
  Lightbulb,
  Restaurant
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t, changeLanguage, currentLanguage } = useLanguage();

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const menuItems = [
    { text: t('dashboard'), icon: <Dashboard />, path: '/dashboard' },
    { text: '🏪 Quick Sale', icon: <Speed />, path: '/quick-sale', badge: 'NEW' },
    { text: '📊 Advanced Analytics', icon: <TrendingUp />, path: '/advanced-analytics', badge: 'AI' },
    { text: '🤖 AI Insights', icon: <Lightbulb />, path: '/ai-insights', badge: 'SMART' },
    { text: t('e_invoicing'), icon: <Receipt />, path: '/e-invoicing' },
    { text: t('risk_assessment'), icon: <Assessment />, path: '/risk-assessment' },
    { text: t('emergency_fund'), icon: <AccountBalance />, path: '/emergency-fund' },
    { text: t('alerts'), icon: <Notifications />, path: '/alerts' },
    { text: t('reports'), icon: <Description />, path: '/reports' },
    { text: t('analytics'), icon: <Analytics />, path: '/analytics' },
    { text: t('weather_monitor'), icon: <Cloud />, path: '/weather-monitor' },
    { text: t('receipt_upload'), icon: <CloudUpload />, path: '/receipt-upload' },
    { text: t('payments'), icon: <Payment />, path: '/payments' }
  ];

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleProfileMenuClose();
  };

  const handleLanguageChange = (lang) => {
    changeLanguage(lang);
    handleProfileMenuClose();
  };

  const drawer = (
    <Box onClick={() => setMobileDrawerOpen(false)} sx={{ textAlign: 'center', width: 250 }}>
      <Typography variant="h6" sx={{ my: 2, color: 'primary.main' }}>
        Tokay
      </Typography>
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => navigate(item.path)}
            selected={location.pathname === item.path}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {item.text}
                  {item.badge && (
                    <Chip
                      label={item.badge}
                      size="small"
                      color="secondary"
                      sx={{
                        height: 20,
                        fontSize: '0.6rem',
                        fontWeight: 'bold',
                        '& .MuiChip-label': { px: 0.5 }
                      }}
                    />
                  )}
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  if (!user) {
    return null;
  }

  return (
    <>
      <AppBar position="static" elevation={2}>
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={() => setMobileDrawerOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, cursor: 'pointer' }}
            onClick={() => navigate('/dashboard')}
          >
            🦎 Tokay Resilience Platform
          </Typography>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {menuItems.slice(0, 4).map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  startIcon={item.icon}
                  onClick={() => navigate(item.path)}
                  sx={{
                    backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.1)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                    },
                    position: 'relative',
                  }}
                >
                  {item.text}
                  {item.badge && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -5,
                        right: -5,
                        bgcolor: 'secondary.main',
                        color: 'white',
                        fontSize: '0.6rem',
                        fontWeight: 'bold',
                        px: 0.5,
                        borderRadius: 1,
                        lineHeight: 1,
                      }}
                    >
                      {item.badge}
                    </Box>
                  )}
                </Button>
              ))}
              <Button
                color="inherit"
                onClick={() => setMobileDrawerOpen(true)}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.2)',
                  },
                }}
              >
                More ▼
              </Button>
            </Box>
          )}

          <Box sx={{ ml: 2 }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {user.fullName?.charAt(0) || user.phoneNumber?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
            >
              <MenuItem onClick={handleProfileMenuClose}>
                <AccountCircle sx={{ mr: 1 }} />
                {user.fullName || user.phoneNumber}
              </MenuItem>
              <MenuItem onClick={() => handleLanguageChange('ms')}>
                🇲🇾 Bahasa Melayu
              </MenuItem>
              <MenuItem onClick={() => handleLanguageChange('en')}>
                🇬🇧 English
              </MenuItem>
              <MenuItem onClick={() => handleLanguageChange('zh')}>
                🇨🇳 中文
              </MenuItem>
              <MenuItem onClick={() => handleLanguageChange('ta')}>
                🇮🇳 தமிழ்
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                {t('logout')}
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;