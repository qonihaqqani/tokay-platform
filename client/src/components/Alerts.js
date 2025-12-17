import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  Grid,
  Alert,
  Paper
} from '@mui/material';
import {
  Warning,
  Error,
  Info,
  CheckCircle,
  NotificationsActive,
  Refresh
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const Alerts = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'warning',
      title: 'Flood Warning in Your Area',
      message: 'MET Malaysia has issued a flood warning for Kelantan. Expected rainfall: 150mm in 24 hours.',
      severity: 'high',
      timestamp: new Date().toISOString(),
      isRead: false
    },
    {
      id: 2,
      type: 'info',
      title: 'Monthly Contribution Reminder',
      message: 'Your monthly emergency fund contribution of RM500 is due. Click to contribute now.',
      severity: 'low',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      isRead: false
    },
    {
      id: 3,
      type: 'success',
      title: 'Risk Assessment Completed',
      message: 'Your latest risk assessment shows MEDIUM risk level. View recommendations.',
      severity: 'medium',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      isRead: true
    },
    {
      id: 4,
      type: 'error',
      title: 'Invoice Payment Overdue',
      message: 'Invoice INV-2024-002 from Ahmad Enterprise is 3 days overdue. Amount: RM1,500.',
      severity: 'high',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      isRead: true
    }
  ]);

  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning': return <Warning color="warning" />;
      case 'error': return <Error color="error" />;
      case 'success': return <CheckCircle color="success" />;
      default: return <Info color="info" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const markAsRead = (alertId) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
  };

  const markAllAsRead = () => {
    setAlerts(alerts.map(alert => ({ ...alert, isRead: true })));
  };

  const unreadCount = alerts.filter(alert => !alert.isRead).length;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          {t('alerts')}
          {unreadCount > 0 && (
            <Chip 
              label={unreadCount} 
              color="primary" 
              size="small" 
              sx={{ ml: 2 }} 
            />
          )}
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            onClick={markAllAsRead}
            sx={{ mr: 2 }}
          >
            Mark All as Read
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Refresh />}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Active Alerts */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <NotificationsActive sx={{ mr: 1, verticalAlign: 'middle' }} />
              Recent Alerts
            </Typography>
            <List>
              {alerts.map((alert) => (
                <ListItem 
                  key={alert.id}
                  divider
                  sx={{ 
                    bgcolor: alert.isRead ? 'transparent' : 'grey.50',
                    borderRadius: 1,
                    mb: 1
                  }}
                >
                  <ListItemIcon>
                    {getAlertIcon(alert.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" fontWeight={alert.isRead ? 'normal' : 'bold'}>
                          {alert.title}
                        </Typography>
                        <Chip 
                          label={alert.severity.toUpperCase()} 
                          color={getSeverityColor(alert.severity)}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {alert.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(alert.timestamp).toLocaleString()}
                        </Typography>
                      </Box>
                    }
                  />
                  {!alert.isRead && (
                    <Button 
                      size="small" 
                      onClick={() => markAsRead(alert.id)}
                    >
                      Mark as Read
                    </Button>
                  )}
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Alert Summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Alert Summary
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Total Alerts: {alerts.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Unread: {unreadCount}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                By Severity:
              </Typography>
              {['high', 'medium', 'low'].map((severity) => {
                const count = alerts.filter(a => a.severity === severity).length;
                return (
                  <Box key={severity} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      {severity.charAt(0).toUpperCase() + severity.slice(1)}:
                    </Typography>
                    <Chip 
                      label={count} 
                      color={getSeverityColor(severity)}
                      size="small"
                    />
                  </Box>
                );
              })}
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button variant="outlined" size="small">
                View Risk Assessment
              </Button>
              <Button variant="outlined" size="small">
                Check Emergency Fund
              </Button>
              <Button variant="outlined" size="small">
                Contact Support
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Alerts;