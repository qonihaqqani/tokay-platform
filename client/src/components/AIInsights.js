import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Info,
  Star,
  ShoppingCart,
  People,
  AttachMoney,
  Schedule,
  LocalOffer,
  ThumbUp,
  ThumbDown,
  Refresh,
  AutoFixHigh
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';

const AIInsights = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [businessHealth, setBusinessHealth] = useState(null);
  const [feedback, setFeedback] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchAIInsights();
  }, []);

  const fetchAIInsights = async () => {
    setLoading(true);
    
    try {
      const [insightsRes, recommendationsRes, healthRes] = await Promise.all([
        api.get('/api/analytics/ai-insights'),
        api.get('/api/analytics/ai-recommendations'),
        api.get('/api/analytics/business-health')
      ]);

      setInsights(insightsRes.data.data || []);
      setRecommendations(recommendationsRes.data.data || []);
      setBusinessHealth(healthRes.data.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      // Use demo data for demonstration
      setDemoData();
    } finally {
      setLoading(false);
    }
  };

  const setDemoData = () => {
    // Demo AI Insights
    setInsights([
      {
        id: 1,
        type: 'opportunity',
        title: 'Weekend Premium Sales Spike',
        description: 'Your sales increase by 45% on weekends with customers spending 3.2x more on premium items.',
        impact: 'high',
        confidence: 0.92,
        data_point: 'Weekend avg transaction: RM45.80 vs Weekday: RM14.30',
        actionable: true
      },
      {
        id: 2,
        type: 'warning',
        title: 'Morning Rush Understaffed',
        description: '8-10 AM peak hours have 30% longer wait times, potentially losing customers.',
        impact: 'medium',
        confidence: 0.78,
        data_point: 'Avg wait time: 12 minutes (target: <8 minutes)',
        actionable: true
      },
      {
        id: 3,
        type: 'pattern',
        title: 'Teh Tarik & Roti Canai Power Combo',
        description: '85% of customers who order Teh Tarik also add Roti Canai within 5 minutes.',
        impact: 'high',
        confidence: 0.85,
        data_point: 'Combo frequency: 47 times per week',
        actionable: true
      },
      {
        id: 4,
        type: 'success',
        title: 'Customer Retention Improving',
        description: 'Repeat customer rate increased by 23% this month compared to last month.',
        impact: 'medium',
        confidence: 0.95,
        data_point: 'Repeat rate: 34% (was 28%)',
        actionable: false
      }
    ]);

    // Demo AI Recommendations
    setRecommendations([
      {
        id: 1,
        category: 'pricing',
        title: 'Introduce Weekend Premium Combo',
        description: 'Create a "Weekend Special" combo with Teh Tarik + Roti Canai + Egg at RM6.50 (15% discount)',
        expected_impact: 'Increase weekend revenue by 18%',
        effort: 'low',
        priority: 'high',
        reasoning: 'High weekend traffic + strong combo pattern = high conversion potential'
      },
      {
        id: 2,
        category: 'operations',
        title: 'Optimize Morning Staff Schedule',
        description: 'Add 1 additional staff member during 8-10 AM peak hours',
        expected_impact: 'Reduce wait time by 40%, increase customer satisfaction',
        effort: 'medium',
        priority: 'high',
        reasoning: 'Current wait times exceed industry standards during peak hours'
      },
      {
        id: 3,
        category: 'marketing',
        title: 'Launch Happy Hour Promotion',
        description: 'Offer 20% discount on all beverages from 2-4 PM on weekdays',
        expected_impact: 'Increase afternoon traffic by 30%',
        effort: 'low',
        priority: 'medium',
        reasoning: 'Afternoon sales are 60% lower than peak hours'
      },
      {
        id: 4,
        category: 'menu',
        title: 'Introduce Budget-Friendly Lunch Set',
        description: 'Create RM12 lunch set targeting office workers with quick service',
        expected_impact: 'Capture lunch crowd, increase weekday sales',
        effort: 'medium',
        priority: 'medium',
        reasoning: 'Nearby offices have limited affordable lunch options'
      }
    ]);

    // Demo Business Health
    setBusinessHealth({
      overall_score: 78,
      revenue_trend: 'increasing',
      customer_satisfaction: 82,
      operational_efficiency: 71,
      growth_potential: 85,
      strengths: ['High customer retention', 'Strong weekend performance', 'Popular combo items'],
      concerns: ['Morning rush bottlenecks', 'Low afternoon traffic', 'Limited payment options'],
      opportunities: ['Office lunch market', 'Delivery expansion', 'Catering services']
    });
  };

  const handleFeedback = (insightId, isHelpful) => {
    setFeedback(prev => ({
      ...prev,
      [insightId]: isHelpful
    }));
    
    // In a real app, this would send feedback to the API
    console.log(`Feedback for insight ${insightId}: ${isHelpful ? 'helpful' : 'not helpful'}`);
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'opportunity': return <TrendingUp color="success" />;
      case 'warning': return <Warning color="warning" />;
      case 'pattern': return <Lightbulb color="info" />;
      case 'success': return <CheckCircle color="success" />;
      default: return <Info color="default" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getEffortColor = (effort) => {
    switch (effort) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 3, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          <AutoFixHigh sx={{ mr: 1, verticalAlign: 'middle' }} />
          AI is analyzing your business data...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">
          <AutoFixHigh sx={{ mr: 1, verticalAlign: 'middle' }} />
          AI-Powered Business Insights
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {lastUpdated && (
            <Typography variant="caption" color="text.secondary">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Typography>
          )}
          <IconButton onClick={fetchAIInsights} color="primary">
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {/* Business Health Overview */}
      {businessHealth && (
        <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Business Health Score
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h2">
                {businessHealth.overall_score}/100
              </Typography>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body1" gutterBottom>
                  Overall Performance: {businessHealth.overall_score >= 80 ? 'Excellent' : businessHealth.overall_score >= 60 ? 'Good' : 'Needs Improvement'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label={`Revenue: ${businessHealth.revenue_trend}`} size="small" />
                  <Chip label={`Satisfaction: ${businessHealth.customer_satisfaction}%`} size="small" />
                  <Chip label={`Efficiency: ${businessHealth.operational_efficiency}%`} size="small" />
                  <Chip label={`Growth Potential: ${businessHealth.growth_potential}%`} size="small" />
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3}>
        {/* AI Insights */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            <Lightbulb sx={{ mr: 1, verticalAlign: 'middle' }} />
            Key Insights
          </Typography>
          {insights.map((insight) => (
            <Card key={insight.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box sx={{ mt: 1 }}>
                    {getInsightIcon(insight.type)}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {insight.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {insight.description}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="primary">
                        💡 {insight.data_point}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip
                          label={`${(insight.confidence * 100).toFixed(0)}% confidence`}
                          size="small"
                          color={insight.confidence > 0.8 ? 'success' : insight.confidence > 0.6 ? 'warning' : 'default'}
                        />
                        <Chip
                          label={insight.impact}
                          size="small"
                          color={insight.impact === 'high' ? 'error' : insight.impact === 'medium' ? 'warning' : 'default'}
                        />
                      </Box>
                      {insight.actionable && (
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Helpful">
                            <IconButton
                              size="small"
                              onClick={() => handleFeedback(insight.id, true)}
                              color={feedback[insight.id] === true ? 'success' : 'default'}
                            >
                              <ThumbUp fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Not helpful">
                            <IconButton
                              size="small"
                              onClick={() => handleFeedback(insight.id, false)}
                              color={feedback[insight.id] === false ? 'error' : 'default'}
                            >
                              <ThumbDown fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Grid>

        {/* AI Recommendations */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            <Star sx={{ mr: 1, verticalAlign: 'middle' }} />
            Actionable Recommendations
          </Typography>
          {recommendations.map((rec) => (
            <Card key={rec.id} sx={{ mb: 2, border: rec.priority === 'high' ? '2px solid #f44336' : '1px solid #e0e0e0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box sx={{ mt: 1 }}>
                    <LocalOffer color={getPriorityColor(rec.priority)} />
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {rec.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {rec.description}
                    </Typography>
                    <Typography variant="caption" color="success" sx={{ display: 'block', mb: 1 }}>
                      📈 Expected Impact: {rec.expected_impact}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2, fontStyle: 'italic' }}>
                      {rec.reasoning}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip
                          label={`Priority: ${rec.priority}`}
                          size="small"
                          color={getPriorityColor(rec.priority)}
                        />
                        <Chip
                          label={`Effort: ${rec.effort}`}
                          size="small"
                          color={getEffortColor(rec.effort)}
                        />
                        <Chip
                          label={rec.category}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        color="primary"
                      >
                        Implement
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Grid>

      {/* Business Strengths & Concerns */}
      {businessHealth && (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <CheckCircle color="success" /> Strengths
                </Typography>
                <List dense>
                  {businessHealth.strengths.map((strength, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Star color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={strength} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Warning color="warning" /> Areas for Improvement
                </Typography>
                <List dense>
                  {businessHealth.concerns.map((concern, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Warning color="warning" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={concern} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <TrendingUp color="info" /> Growth Opportunities
                </Typography>
                <List dense>
                  {businessHealth.opportunities.map((opportunity, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <TrendingUp color="info" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={opportunity} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default AIInsights;