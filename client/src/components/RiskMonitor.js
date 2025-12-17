import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Button, Alert,
  LinearProgress, Chip, List, ListItem, ListItemText, ListItemIcon,
  Paper, Tabs, Tab, CircularProgress, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
  Warning, CheckCircle, Error, Info, Assessment, TrendingUp,
  TrendingDown, Security, LocationOn, AccountBalanceWallet,
  Refresh, Lightbulb, Timeline, Shield
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const RiskMonitor = ({ businessId }) => {
  const [tabValue, setTabValue] = useState(0);
  const [currentRisk, setCurrentRisk] = useState(null);
  const [riskHistory, setRiskHistory] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [analysisDialog, setAnalysisDialog] = useState(false);

  useEffect(() => {
    if (businessId) {
      fetchCurrentRisk();
      fetchRecommendations();
      fetchAssessments();
    }
  }, [businessId]);

  const fetchCurrentRisk = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/risk/current/${businessId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setCurrentRisk(data);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error fetching risk data' });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await fetch(`/api/risk/recommendations/${businessId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const fetchAssessments = async () => {
    try {
      const response = await fetch(`/api/risk?businessId=${businessId}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setAssessments(data.assessments || []);
      }
    } catch (error) {
      console.error('Error fetching assessments:', error);
    }
  };

  const runRiskAnalysis = async () => {
    try {
      setAnalyzing(true);
      const response = await fetch(`/api/risk/analyze/${businessId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Risk analysis completed successfully!' });
        setAnalysisDialog(true);
        fetchCurrentRisk();
        fetchRecommendations();
        fetchAssessments();
      } else {
        setMessage({ type: 'error', text: data.message || 'Analysis failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error running analysis' });
    } finally {
      setAnalyzing(false);
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'CRITICAL': return '#d32f2f';
      case 'HIGH': return '#f57c00';
      case 'MEDIUM': return '#fbc02d';
      case 'LOW': return '#388e3c';
      default: return '#757575';
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'CRITICAL': return <Error color="error" />;
      case 'HIGH': return <Warning color="warning" />;
      case 'MEDIUM': return <Info color="info" />;
      case 'LOW': return <CheckCircle color="success" />;
      default: return <Info />;
    }
  };

  const getRiskProgress = (score) => {
    if (score >= 70) return { value: score, color: '#d32f2f' };
    if (score >= 50) return { value: score, color: '#f57c00' };
    if (score >= 30) return { value: score, color: '#fbc02d' };
    return { value: score, color: '#388e3c' };
  };

  // Mock data for charts
  const riskTrendData = [
    { date: 'Jan', riskScore: 25 },
    { date: 'Feb', riskScore: 30 },
    { date: 'Mar', riskScore: 35 },
    { date: 'Apr', riskScore: 28 },
    { date: 'May', riskScore: 40 },
    { date: 'Jun', riskScore: currentRisk?.riskScore || 35 }
  ];

  const riskDistribution = [
    { name: 'Low', value: 30, color: '#388e3c' },
    { name: 'Medium', value: 45, color: '#fbc02d' },
    { name: 'High', value: 20, color: '#f57c00' },
    { name: 'Critical', value: 5, color: '#d32f2f' }
  ];

  if (loading && !currentRisk) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#2E7D32', mb: 3 }}>
        🦎 Tokay Pulse - AI Risk Monitor
      </Typography>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      {/* Current Risk Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', p: 3 }}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              {currentRisk ? getRiskIcon(currentRisk.riskLevel) : <Assessment sx={{ fontSize: 48, color: '#757575' }} />}
              <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
                Current Risk Level
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: getRiskColor(currentRisk?.riskLevel) }}>
                {currentRisk?.riskLevel || 'LOW'}
              </Typography>
            </Box>
            
            {currentRisk && (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Risk Score</Typography>
                  <Typography variant="body2">{currentRisk.riskScore}/100</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={currentRisk.riskScore} 
                  sx={{ 
                    height: 10, 
                    borderRadius: 5,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getRiskProgress(currentRisk.riskScore).color
                    }
                  }}
                />
              </Box>
            )}

            <Button 
              variant="contained" 
              startIcon={analyzing ? <CircularProgress size={20} /> : <Refresh />}
              onClick={runRiskAnalysis}
              disabled={analyzing}
              fullWidth
              sx={{ backgroundColor: '#2E7D32', '&:hover': { backgroundColor: '#1B5E20' } }}
            >
              {analyzing ? 'Analyzing...' : 'Run AI Analysis'}
            </Button>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#FF6B35' }}>
              <LocationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
              Location-Based Risks
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><Warning color="warning" /></ListItemIcon>
                <ListItemText primary="Flood Risk" secondary="Medium - Seasonal monitoring required" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                <ListItemText primary="Supply Chain" secondary="Low - No major disruptions" />
              </ListItem>
              <ListItem>
                <ListItemIcon><Info color="info" /></ListItemIcon>
                <ListItemText primary="Economic Factors" secondary="Stable - Local market conditions good" />
              </ListItem>
            </List>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
              <Lightbulb sx={{ mr: 1, verticalAlign: 'middle' }} />
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button variant="outlined" startIcon={<Shield />} fullWidth>
                Update Protection Measures
              </Button>
              <Button variant="outlined" startIcon={<AccountBalanceWallet />} fullWidth>
                Review Emergency Fund
              </Button>
              <Button variant="outlined" startIcon={<Timeline />} fullWidth>
                View Full Report
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Analysis Tabs */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Risk Trend" icon={<TrendingUp />} />
            <Tab label="Recommendations" icon={<Lightbulb />} />
            <Tab label="Assessment History" icon={<Assessment />} />
            <Tab label="Risk Distribution" icon={<PieChart />} />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Risk Score Trend (Last 6 Months)
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={riskTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <RechartsTooltip />
                    <Line 
                      type="monotone" 
                      dataKey="riskScore" 
                      stroke="#2E7D32" 
                      strokeWidth={2}
                      dot={{ fill: '#2E7D32' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Grid>
            </Grid>
          )}

          {tabValue === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  AI-Generated Recommendations
                </Typography>
                {recommendations.length > 0 ? (
                  <List>
                    {recommendations.map((recommendation, index) => (
                      <ListItem key={index} sx={{ bgcolor: '#f8f9fa', mb: 1, borderRadius: 2 }}>
                        <ListItemIcon><Lightbulb color="primary" /></ListItemIcon>
                        <ListItemText primary={recommendation} />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Alert severity="info">
                    No specific recommendations at this time. Your business risk level is manageable.
                  </Alert>
                )}
              </Grid>
            </Grid>
          )}

          {tabValue === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Recent Risk Assessments
                </Typography>
                {assessments.length > 0 ? (
                  <List>
                    {assessments.map((assessment, index) => (
                      <ListItem key={index} sx={{ bgcolor: '#f8f9fa', mb: 1, borderRadius: 2 }}>
                        <ListItemIcon>
                          <Chip 
                            label={assessment.severity_level} 
                            size="small"
                            sx={{ 
                              backgroundColor: getRiskColor(assessment.severity_level),
                              color: 'white'
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText 
                          primary={assessment.risk_description}
                          secondary={`Score: ${assessment.risk_score}/100 | ${new Date(assessment.assessment_date).toLocaleDateString()}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Alert severity="info">
                    No risk assessments available yet. Run your first AI analysis to get started.
                  </Alert>
                )}
              </Grid>
            </Grid>
          )}

          {tabValue === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Risk Category Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Risk Factors Breakdown
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { factor: 'Financial', value: 35 },
                    { factor: 'Location', value: 25 },
                    { factor: 'Operational', value: 20 },
                    { factor: 'Market', value: 15 },
                    { factor: 'Regulatory', value: 5 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="factor" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="value" fill="#2E7D32" />
                  </BarChart>
                </ResponsiveContainer>
              </Grid>
            </Grid>
          )}
        </Box>
      </Card>

      {/* Analysis Results Dialog */}
      <Dialog open={analysisDialog} onClose={() => setAnalysisDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Assessment color="primary" />
            AI Risk Analysis Results
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 2 }}>
            Risk analysis completed successfully! Your business has been evaluated using advanced AI algorithms.
          </Alert>
          <Typography variant="body1">
            Based on the analysis of your business location, financial health, and operational patterns,
            we've identified key risk factors and generated personalized recommendations to improve your business resilience.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnalysisDialog(false)}>Close</Button>
          <Button variant="contained" sx={{ backgroundColor: '#2E7D32' }}>
            View Full Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RiskMonitor;