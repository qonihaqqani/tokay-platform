import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Button, TextField,
  LinearProgress, Chip, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, Tabs, Tab, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Tooltip, Badge,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {
  AccountBalanceWallet, Add, Remove, History, TrendingUp,
  Security, Speed, Info, Warning, CheckCircle, Pending,
  AttachMoney, Schedule, Assessment, Payment, Receipt
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import ReceiptUpload from './ReceiptUpload';

const EmergencyFundEnhanced = () => {
  const [tabValue, setTabValue] = useState(0);
  const [fundData, setFundData] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [contributeDialog, setContributeDialog] = useState(false);
  const [withdrawDialog, setWithdrawDialog] = useState(false);
  const [contributionAmount, setContributionAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawReason, setWithdrawReason] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('fpx');
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchFundData();
    fetchRecommendations();
    fetchTransactions();
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('/api/payments/mock/methods', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAvailablePaymentMethods(data.methods);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const fetchFundData = async () => {
    try {
      // Mock API call - replace with actual API
      setFundData({
        id: '1',
        current_balance: 2500,
        target_balance: 5000,
        monthly_contribution: 500,
        contribution_frequency: 'monthly',
        last_contribution: '2024-12-15',
        created_at: '2024-10-01',
        business_name: 'Warung Nasi Lemak Mak Cik',
        business_type: 'restaurant',
        monthly_revenue: 15000,
        monthly_expenses: 10000
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch fund data' });
    }
  };

  const fetchRecommendations = async () => {
    try {
      // Mock API call
      setRecommendations({
        target_balance: 30000, // 3 months expenses
        monthly_contribution: 1000, // 10% of revenue
        current_percentage: 8.33,
        time_to_target: 28,
        risk_level: 'HIGH',
        suggestions: [
          'Your emergency fund is critically low. Consider increasing contributions immediately.',
          'Consider increasing your monthly contribution to RM1,000 for better protection.',
          'Your target should be at least RM30,000 (3 months of expenses).'
        ]
      });
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      // Mock API call
      setTransactions([
        {
          id: '1',
          amount: 500,
          transaction_type: 'contribution',
          payment_method: 'fpx',
          status: 'completed',
          created_at: '2024-12-15',
          transaction_reference: 'TXN001'
        },
        {
          id: '2',
          amount: 300,
          transaction_type: 'contribution',
          payment_method: 'tng',
          status: 'completed',
          created_at: '2024-12-01',
          transaction_reference: 'TXN002'
        },
        {
          id: '3',
          amount: 200,
          transaction_type: 'withdrawal',
          payment_method: 'emergency_release',
          status: 'approved',
          created_at: '2024-11-20',
          transaction_reference: 'TXN003'
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const handleContribute = async () => {
    if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }

    setLoading(true);
    try {
      // First, initiate mock payment
      const paymentResponse = await fetch('/api/payments/mock/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: parseFloat(contributionAmount),
          paymentMethod: selectedPaymentMethod,
          description: 'Emergency fund contribution'
        })
      });

      const paymentData = await paymentResponse.json();
      
      if (paymentData.success) {
        // Open mock payment checkout in new window
        const checkoutWindow = window.open(
          paymentData.redirectUrl,
          'tokay-payment-checkout',
          'width=500,height=600,scrollbars=yes,resizable=yes'
        );

        // Poll for payment completion
        const checkPaymentStatus = setInterval(async () => {
          try {
            const statusResponse = await fetch(`/api/payments/mock/status/${paymentData.transactionId}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
            
            const statusData = await statusResponse.json();
            
            if (statusData.success && statusData.status === 'completed') {
              clearInterval(checkPaymentStatus);
              checkoutWindow?.close();
              setContributeDialog(false);
              setContributionAmount('');
              fetchFundData();
              fetchTransactions();
              setMessage({ type: 'success', text: 'Payment completed successfully!' });
            }
          } catch (error) {
            console.error('Error checking payment status:', error);
          }
        }, 2000);

        // Stop polling after 5 minutes
        setTimeout(() => {
          clearInterval(checkPaymentStatus);
        }, 300000);
      } else {
        setMessage({ type: 'error', text: paymentData.message || 'Failed to initiate payment' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error processing payment' });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }

    if (!withdrawReason || withdrawReason.length < 10) {
      setMessage({ type: 'error', text: 'Please provide a detailed reason (at least 10 characters)' });
      return;
    }

    if (parseFloat(withdrawAmount) > fundData.current_balance) {
      setMessage({ type: 'error', text: 'Insufficient balance' });
      return;
    }

    setLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ type: 'success', text: 'Withdrawal request submitted for review!' });
      setWithdrawDialog(false);
      setWithdrawAmount('');
      setWithdrawReason('');
      fetchTransactions();
    } catch (error) {
      setMessage({ type: 'error', text: 'Withdrawal request failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'approved': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle color="success" />;
      case 'pending': return <Pending color="warning" />;
      case 'failed': return <Warning color="error" />;
      case 'approved': return <CheckCircle color="info" />;
      default: return <Info />;
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'LOW': return '#4CAF50';
      case 'MEDIUM': return '#FF9800';
      case 'HIGH': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  if (!fundData || !recommendations) {
    return <div>Loading emergency fund data...</div>;
  }

  const progressPercentage = (fundData.current_balance / fundData.target_balance) * 100;
  const recommendedProgressPercentage = recommendations.current_percentage;

  // Chart data
  const balanceHistory = [
    { month: 'Oct', balance: 500 },
    { month: 'Nov', balance: 2000 },
    { month: 'Dec', balance: 2500 },
  ];

  const fundAllocation = [
    { name: 'Current Fund', value: fundData.current_balance, color: '#4CAF50' },
    { name: 'Remaining Target', value: fundData.target_balance - fundData.current_balance, color: '#E0E0E0' },
  ];

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#2E7D32', mb: 4 }}>
        🛡️ Tokay Shield - Emergency Financial Buffer
      </Typography>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      {/* Main Fund Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', p: 3 }}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <AccountBalanceWallet sx={{ fontSize: 48, color: '#FF6B35', mb: 1 }} />
              <Typography variant="h6" color="text.secondary">
                Current Balance
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
                RM{fundData.current_balance.toLocaleString()}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Target: RM{fundData.target_balance.toLocaleString()}</Typography>
                <Typography variant="body2">{progressPercentage.toFixed(1)}%</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={progressPercentage} 
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                startIcon={<Add />}
                onClick={() => setContributeDialog(true)}
                sx={{ backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#45a049' } }}
              >
                Contribute
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<Remove />}
                onClick={() => setWithdrawDialog(true)}
                sx={{ borderColor: '#F44336', color: '#F44336' }}
              >
                Withdraw
              </Button>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#FF6B35' }}>
              Risk Assessment
            </Typography>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Chip 
                label={recommendations.risk_level} 
                size="large" 
                sx={{ 
                  fontSize: '1.2rem', 
                  fontWeight: 'bold', 
                  py: 2, 
                  px: 4, 
                  backgroundColor: getRiskColor(recommendations.risk_level), 
                  color: 'white' 
                }} 
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              {recommendations.risk_level === 'HIGH' && 'Your emergency fund is critically low. Immediate action required.'}
              {recommendations.risk_level === 'MEDIUM' && 'Your emergency fund needs improvement. Consider increasing contributions.'}
              {recommendations.risk_level === 'LOW' && 'Your emergency fund is in good shape. Keep it up!'}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
              AI Recommendations
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Recommended Target:</strong> RM{recommendations.target_balance.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Monthly Contribution:</strong> RM{recommendations.monthly_contribution.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Time to Target:</strong> {recommendations.time_to_target} months
              </Typography>
            </Box>
            <Button 
              variant="text" 
              size="small" 
              startIcon={<Assessment />}
              fullWidth
            >
              View Detailed Analysis
            </Button>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Overview" icon={<TrendingUp />} />
            <Tab label="Transactions" icon={<History />} />
            <Tab label="Receipts" icon={<Receipt />} />
            <Tab label="Analytics" icon={<Assessment />} />
            <Tab label="Settings" icon={<Security />} />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Balance Growth
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={balanceHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `RM${value.toLocaleString()}`} />
                    <Line type="monotone" dataKey="balance" stroke="#4CAF50" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Fund Allocation
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={fundAllocation}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {fundAllocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `RM${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  AI Suggestions
                </Typography>
                {recommendations.suggestions.map((suggestion, index) => (
                  <Alert key={index} severity="warning" sx={{ mb: 1 }}>
                    {suggestion}
                  </Alert>
                ))}
              </Grid>
            </Grid>
          )}

          {tabValue === 1 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Reference</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{new Date(transaction.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip 
                          label={transaction.transaction_type} 
                          size="small" 
                          color={transaction.transaction_type === 'contribution' ? 'success' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {transaction.transaction_type === 'contribution' ? '+' : '-'}RM{transaction.amount.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>{transaction.payment_method.toUpperCase()}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getStatusIcon(transaction.status)}
                          <Typography variant="body2">
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{transaction.transaction_reference}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {tabValue === 2 && (
            <ReceiptUpload
              businessId={fundData.business_id}
              onContributionSuggestion={(contribution) => {
                setMessage({ type: 'success', text: 'Auto-contribution created successfully!' });
                fetchFundData();
                fetchTransactions();
              }}
              onReceiptProcessed={(receiptData) => {
                // Refresh data when receipt is processed
                fetchFundData();
                fetchTransactions();
              }}
            />
          )}

          {tabValue === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 2, textAlign: 'center' }}>
                  <Schedule sx={{ fontSize: 40, color: '#2196F3', mb: 1 }} />
                  <Typography variant="h6">Monthly Contribution</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
                    RM{fundData.monthly_contribution.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Frequency: {fundData.contribution_frequency}
                  </Typography>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ p: 2, textAlign: 'center' }}>
                  <Speed sx={{ fontSize: 40, color: '#FF6B35', mb: 1 }} />
                  <Typography variant="h6">Growth Rate</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#FF6B35' }}>
                    +15%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Last 30 days
                  </Typography>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ p: 2, textAlign: 'center' }}>
                  <Security sx={{ fontSize: 40, color: '#4CAF50', mb: 1 }} />
                  <Typography variant="h6">Protection Level</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                    {recommendedProgressPercentage.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                        Of recommended target
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          )}

          {tabValue === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Monthly Contribution Amount"
                  type="number"
                  defaultValue={fundData.monthly_contribution}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Target Balance"
                  type="number"
                  defaultValue={fundData.target_balance}
                  sx={{ mb: 2 }}
                />
                <Button variant="contained" sx={{ backgroundColor: '#2E7D32' }}>
                  Update Settings
                </Button>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Auto-Contribution Settings
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Enable automatic monthly contributions to ensure your emergency fund grows consistently.
                  </Typography>
                </Box>
                <Button variant="outlined" sx={{ mr: 1 }}>
                  Enable Auto-Contribution
                </Button>
                <Button variant="text">
                  Configure Schedule
                </Button>
              </Grid>
            </Grid>
          )}
        </Box>
      </Card>

      {/* Contribute Dialog */}
      <Dialog open={contributeDialog} onClose={() => setContributeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Contribute to Emergency Fund</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Contribution Amount (RM)"
            type="number"
            value={contributionAmount}
            onChange={(e) => setContributionAmount(e.target.value)}
            sx={{ mt: 2 }}
          />
          
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={selectedPaymentMethod}
              label="Payment Method"
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            >
              {availablePaymentMethods.map((method) => (
                <MenuItem key={method.id} value={method.id}>
                  {method.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Recommended monthly contribution: RM{recommendations.monthly_contribution.toLocaleString()}
          </Typography>

          <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="body2" color="info.dark">
              <strong>🧪 Test Mode:</strong> This is a mock payment system for demonstration.
              No actual money will be charged during the pilot phase.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContributeDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleContribute} 
            variant="contained" 
            disabled={loading}
            sx={{ backgroundColor: '#4CAF50' }}
          >
            {loading ? 'Processing...' : 'Contribute'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={withdrawDialog} onClose={() => setWithdrawDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request Emergency Fund Withdrawal</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Withdrawal Amount (RM)"
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Reason for Withdrawal"
            multiline
            rows={4}
            value={withdrawReason}
            onChange={(e) => setWithdrawReason(e.target.value)}
            sx={{ mt: 2 }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Available balance: RM{fundData.current_balance.toLocaleString()}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWithdrawDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleWithdraw} 
            variant="contained" 
            disabled={loading}
            sx={{ backgroundColor: '#F44336' }}
          >
            {loading ? 'Processing...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmergencyFundEnhanced;