import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  LinearProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper
} from '@mui/material';
import {
  Assessment,
  Warning,
  CheckCircle,
  TrendingUp,
  LocationOn,
  Business,
  AccountBalance,
  Refresh
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';

const RiskAssessment = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const [loading, setLoading] = useState(false);
  const [riskData, setRiskData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLatestAssessment();
  }, []);

  const fetchLatestAssessment = async () => {
    try {
      // Mock data for demo
      setRiskData({
        riskLevel: 'MEDIUM',
        riskScore: 45,
        assessment: {
          risk_type: 'financial',
          severity_level: 'MEDIUM',
          risk_score: 45,
          probability: 55,
          impact: 40,
          risk_description: 'Business faces moderate financial risks due to seasonal variations and insufficient emergency fund coverage.',
          risk_factors: ['Seasonal business fluctuations', 'Emergency fund below 60% target', 'High dependency on single supplier'],
          mitigation_recommendations: [
            'Increase emergency fund contributions to RM750/month',
            'Diversify supplier base to reduce dependency',
            'Create seasonal cash flow projections',
            'Establish line of credit for emergencies'
          ],
          assessment_date: new Date().toISOString()
        }
      });
    } catch (err) {
      setError('Failed to load risk assessment data');
    }
  };

  const runNewAssessment = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setRiskData({
        riskLevel: 'MEDIUM',
        riskScore: 42,
        assessment: {
          risk_type: 'financial',
          severity_level: 'MEDIUM',
          risk_score: 42,
          probability: 50,
          impact: 38,
          risk_description: 'Business faces moderate financial risks with improving emergency fund coverage.',
          risk_factors: ['Seasonal business fluctuations', 'Emergency fund at 70% target'],
          mitigation_recommendations: [
            'Maintain current emergency fund contributions',
            'Monitor seasonal cash flow patterns',
            'Explore additional revenue streams'
          ],
          assessment_date: new Date().toISOString()
        }
      });
    } catch (err) {
      setError('Failed to run risk assessment');
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

  const getRiskIcon = (level) => {
    switch (level) {
      case 'LOW': return <CheckCircle color="success" />;
      case 'MEDIUM': return <Warning color="warning" />;
      case 'HIGH': return <Warning color="error" />;
      case 'CRITICAL': return <Warning color="error" />;
      default: return <Assessment />;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t('risk_assessment')}
      </Typography>
      
      <Typography variant="body1" color="text.secondary" gutterBottom>
        AI-powered risk analysis for your business resilience
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Risk Overview Card */}
      {riskData && (
        <Card sx={{ mb: 4, borderLeft: '4px solid', borderLeftColor: getRiskColor(riskData.riskLevel) + '.main' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              {getRiskIcon(riskData.riskLevel)}
              <Typography variant="h5" sx={{ ml: 2 }}>
                Overall Risk Level: {riskData.riskLevel}
              </Typography>
              <Chip 
                label={`Score: ${riskData.riskScore}/100`}
                color={getRiskColor(riskData.riskLevel)}
                sx={{ ml: 2 }}
              />
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color={getRiskColor(riskData.riskLevel) + '.main'}>
                    {riskData.assessment.probability}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Probability
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color={getRiskColor(riskData.riskLevel) + '.main'}>
                    {riskData.assessment.impact}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Impact
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color={getRiskColor(riskData.riskLevel) + '.main'}>
                    {riskData.riskScore}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Risk Score
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="body1" gutterBottom>
                {riskData.assessment.risk_description}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Last assessed: {new Date(riskData.assessment.assessment_date).toLocaleDateString()}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={4}>
        {/* Risk Factors */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              <LocationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
              Identified Risk Factors
            </Typography>
            <List>
              {riskData?.assessment.risk_factors.map((factor, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <Warning color="warning" />
                  </ListItemIcon>
                  <ListItemText primary={factor} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Mitigation Recommendations */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
              Mitigation Recommendations
            </Typography>
            <List>
              {riskData?.assessment.mitigation_recommendations.map((recommendation, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText primary={recommendation} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          variant="contained"
          size="large"
          onClick={runNewAssessment}
          disabled={loading}
          startIcon={loading ? <Refresh sx={{ animation: 'spin 1s linear infinite' }} /> : <Assessment />}
          sx={{ mr: 2 }}
        >
          {loading ? 'Running Assessment...' : 'Run New Assessment'}
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={() => window.print()}
        >
          Download Report
        </Button>
      </Box>

      {/* Business Risk Categories */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Business Risk Categories
        </Typography>
        <Grid container spacing={2}>
          {[
            { name: 'Financial Risk', value: 65, color: 'warning' },
            { name: 'Operational Risk', value: 30, color: 'success' },
            { name: 'Market Risk', value: 45, color: 'info' },
            { name: 'Compliance Risk', value: 20, color: 'success' }
          ].map((category, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">{category.name}</Typography>
                  <Typography variant="body2">{category.value}%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={category.value}
                  color={category.color}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default RiskAssessment;