import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  LinearProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Avatar
} from '@mui/material';
import {
  AccountBalance,
  Assessment,
  Warning,
  TrendingUp,
  Receipt,
  CloudUpload,
  NotificationsActive,
  CheckCircle,
  Error,
  Info
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    emergencyFund: null,
    riskAssessment: null,
    recentInvoices: [],
    recentReceipts: [],
    alerts: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch emergency fund data
      const fundResponse = await api.get('/api/emergency-fund');
      
      // Fetch latest risk assessment
      const riskResponse = await api.get('/api/risk/current');
      
      // Fetch recent invoices
      const invoicesResponse = await api.get('/api/invoices?limit=5');
      
      // Fetch recent receipts
      const receiptsResponse = await api.get('/api/receipts?limit=5');
      
      // Fetch recent alerts
      const alertsResponse = await api.get('/api/alerts?limit=5');

      setDashboardData({
        emergencyFund: fundResponse.data,
        riskAssessment: riskResponse.data,
        recentInvoices: invoicesResponse.data.invoices || [],
        recentReceipts: receiptsResponse.data.receipts || [],
        alerts: alertsResponse.data.alerts || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set demo data for demo purposes
      setDashboardData({
        emergencyFund: {
          current_balance: 3500,
          target_balance: 5000,
          monthly_contribution: 500,
          last_contribution: '2024-12-15'
        },
        riskAssessment: {
          riskLevel: 'MEDIUM',
          riskScore: 45,
          message: 'Business faces moderate risks that should be monitored'
        },
        recentInvoices: [
          { id: 1, invoice_number: 'INV-2024-001', customer_name: 'Ahmad Enterprise', total_amount: 1500, status: 'paid' },
          { id: 2, invoice_number: 'INV-2024-002', customer_name: 'Siti Trading', total_amount: 2300, status: 'pending' }
        ],
        recentReceipts: [
          { id: 1, merchant_name: 'Office Supplies', amount: 250, category: 'stationery' },
          { id: 2, merchant_name: 'Petronas', amount: 180, category: 'fuel' }
        ],
        alerts: [
          { id: 1, type: 'warning', message: 'Flood warning in your area', severity: 'medium' },
          { id: 2, type: 'info', message: 'Monthly contribution reminder', severity: 'low' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'LOW': return 'success';
      case 'MEDIUM': return 'warning';
      case 'HIGH': return 'error';
      case 'CRITICAL': return 'error';
      default: return 'info';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning': return <Warning color="warning" />;
      case 'error': return <Error color="error" />;
      case 'success': return <CheckCircle color="success" />;
      default: return <Info color="info" />;
    }
  };

  const fundPercentage = dashboardData.emergencyFund 
    ? (dashboardData.emergencyFund.current_balance / dashboardData.emergencyFund.target_balance) * 100
    : 0;

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ textAlign: 'center', mt: 2 }}>
          Loading dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('welcome_back')}, {user?.fullName || user?.phoneNumber}! 👋
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Here's your business resilience overview for today
      </Typography>

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Emergency Fund Card */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', borderLeft: '4px solid #4CAF50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalance sx={{ mr: 1, color: '#4CAF50' }} />
                <Typography variant="h6">{t('emergency_fund')}</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                RM{dashboardData.emergencyFund?.current_balance?.toFixed(2) || '0.00'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                of RM{dashboardData.emergencyFund?.target_balance?.toFixed(2) || '0.00'}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(fundPercentage, 100)} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                  {fundPercentage.toFixed(1)}% funded
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Risk Assessment Card */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', borderLeft: '4px solid #FF9800' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Assessment sx={{ mr: 1, color: '#FF9800' }} />
                <Typography variant="h6">{t('risk_level')}</Typography>
              </Box>
              <Chip 
                label={dashboardData.riskAssessment?.riskLevel || 'LOW'}
                color={getRiskColor(dashboardData.riskAssessment?.riskLevel)}
                sx={{ mb: 2, fontSize: '1rem', fontWeight: 'bold' }}
              />
              <Typography variant="body2" color="text.secondary">
                Risk Score: {dashboardData.riskAssessment?.riskScore || 0}/100
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Invoices Card */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', borderLeft: '4px solid #2196F3' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Receipt sx={{ mr: 1, color: '#2196F3' }} />
                <Typography variant="h6">{t('recent_invoices')}</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {dashboardData.recentInvoices.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last 30 days
              </Typography>
              <Button 
                size="small" 
                sx={{ mt: 2 }}
                onClick={() => navigate('/e-invoicing')}
              >
                {t('create_invoice')}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Alerts Card */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', borderLeft: '4px solid #F44336' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <NotificationsActive sx={{ mr: 1, color: '#F44336' }} />
                <Typography variant="h6">{t('active_alerts')}</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {dashboardData.alerts.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Require attention
              </Typography>
              <Button 
                size="small" 
                sx={{ mt: 2 }}
                onClick={() => navigate('/alerts')}
              >
                {t('view_all')}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity and Alerts */}
      <Grid container spacing={3}>
        {/* Recent Invoices */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              {t('recent_invoices')}
            </Typography>
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
              {dashboardData.recentInvoices.map((invoice) => (
                <ListItem key={invoice.id} divider>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <Receipt />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={invoice.customer_name}
                    secondary={`${invoice.invoice_number} - RM${invoice.total_amount}`}
                  />
                  <Chip 
                    label={invoice.status}
                    color={invoice.status === 'paid' ? 'success' : 'warning'}
                    size="small"
                  />
                </ListItem>
              ))}
              {dashboardData.recentInvoices.length === 0 && (
                <ListItem>
                  <ListItemText primary="No recent invoices" secondary="Create your first invoice to get started" />
                </ListItem>
              )}
            </List>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button variant="outlined" onClick={() => navigate('/e-invoicing')}>
                {t('manage_invoices')}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Alerts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              {t('recent_alerts')}
            </Typography>
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
              {dashboardData.alerts.map((alert) => (
                <ListItem key={alert.id} divider>
                  <ListItemIcon>
                    {getAlertIcon(alert.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={alert.message}
                    secondary={`Severity: ${alert.severity}`}
                  />
                </ListItem>
              ))}
              {dashboardData.alerts.length === 0 && (
                <ListItem>
                  <ListItemText primary="No active alerts" secondary="Your business is running smoothly" />
                </ListItem>
              )}
            </List>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button variant="outlined" onClick={() => navigate('/alerts')}>
                {t('view_all_alerts')}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          {t('quick_actions')}
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button 
              variant="contained" 
              startIcon={<Receipt />}
              onClick={() => navigate('/e-invoicing')}
            >
              {t('create_invoice')}
            </Button>
          </Grid>
          <Grid item>
            <Button 
              variant="outlined" 
              startIcon={<CloudUpload />}
              onClick={() => navigate('/receipt-upload')}
            >
              {t('upload_receipt')}
            </Button>
          </Grid>
          <Grid item>
            <Button 
              variant="outlined" 
              startIcon={<AccountBalance />}
              onClick={() => navigate('/emergency-fund')}
            >
              {t('add_to_fund')}
            </Button>
          </Grid>
          <Grid item>
            <Button 
              variant="outlined" 
              startIcon={<Assessment />}
              onClick={() => navigate('/risk-assessment')}
            >
              {t('run_risk_assessment')}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;