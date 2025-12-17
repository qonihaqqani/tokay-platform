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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  ShoppingCart,
  AttachMoney,
  Lightbulb,
  Assessment,
  Timeline,
  PieChart,
  BarChart,
  Group,
  Star,
  Warning,
  CheckCircle
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';

const AdvancedAnalytics = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('30d');
  
  // Analytics data states
  const [salesPatterns, setSalesPatterns] = useState(null);
  const [customerSegments, setCustomerSegments] = useState([]);
  const [comboRecommendations, setComboRecommendations] = useState([]);
  const [profitMargins, setProfitMargins] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [dailyAnalytics, setDailyAnalytics] = useState([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const [
        patternsRes,
        segmentsRes,
        combosRes,
        marginsRes,
        hoursRes,
        dailyRes
      ] = await Promise.all([
        api.get(`/api/analytics/sales-patterns?days=${timeRange}`),
        api.get(`/api/analytics/customer-segments?days=${timeRange}`),
        api.get(`/api/analytics/combo-recommendations?days=${timeRange}`),
        api.get(`/api/analytics/profit-margins?days=${timeRange}`),
        api.get(`/api/analytics/peak-hours?days=${timeRange}`),
        api.get(`/api/analytics/daily?days=${timeRange}`)
      ]);

      setSalesPatterns(patternsRes.data.data);
      setCustomerSegments(segmentsRes.data.data);
      setComboRecommendations(combosRes.data.data);
      setProfitMargins(marginsRes.data.data);
      setPeakHours(hoursRes.data.data);
      setDailyAnalytics(dailyRes.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data. Using demo data.');
      
      // Use demo data for demonstration
      setDemoData();
    } finally {
      setLoading(false);
    }
  };

  const setDemoData = () => {
    // Demo sales patterns
    setSalesPatterns({
      highValueLowVolume: {
        days: ['2025-12-01', '2025-12-08', '2025-12-15'],
        avgTransactionValue: 45.80,
        totalTransactions: 12,
        insight: 'Customers buying premium items on weekends'
      },
      lowValueHighVolume: {
        days: ['2025-12-03', '2025-12-10', '2025-12-17'],
        avgTransactionValue: 12.50,
        totalTransactions: 89,
        insight: 'High foot traffic with budget-conscious customers'
      },
      volatile: {
        days: ['2025-12-05', '2025-12-12'],
        variance: 0.68,
        insight: 'Unpredictable sales patterns - consider promotions'
      }
    });

    // Demo customer segments
    setCustomerSegments([
      { segment: 'high_value', count: 23, percentage: 15.3, avgValue: 67.50, color: '#4CAF50' },
      { segment: 'frequent', count: 67, percentage: 44.7, avgValue: 28.30, color: '#2196F3' },
      { segment: 'bargain_hunter', count: 45, percentage: 30.0, avgValue: 15.20, color: '#FF9800' },
      { segment: 'vip', count: 15, percentage: 10.0, avgValue: 125.80, color: '#9C27B0' }
    ]);

    // Demo combo recommendations
    setComboRecommendations([
      {
        main_item: 'Teh Tarik',
        suggested_combo: 'Roti Canai',
        confidence: 0.85,
        current_price: 5.50,
        combo_price: 4.68,
        potential_increase: 0.32,
        reasoning: '85% of customers who buy Teh Tarik also order Roti Canai within 10 minutes'
      },
      {
        main_item: 'Nasi Lemak',
        suggested_combo: 'Kopi O',
        confidence: 0.72,
        current_price: 10.50,
        combo_price: 8.93,
        potential_increase: 0.47,
        reasoning: 'Classic breakfast combination, popular during morning hours'
      }
    ]);

    // Demo profit margins
    setProfitMargins([
      { product_name: 'Teh Tarik', profit_margin: 78.5, avg_price: 3.50, cost: 0.75 },
      { product_name: 'Nasi Lemak', profit_margin: 65.2, avg_price: 8.00, cost: 2.78 },
      { product_name: 'Roti Canai', profit_margin: 82.1, avg_price: 2.00, cost: 0.36 },
      { product_name: 'Mee Goreng', profit_margin: 71.3, avg_price: 6.00, cost: 1.72 }
    ]);

    // Demo peak hours
    setPeakHours([
      { hour: '07:00', sales: 145.50, transactions: 23, avg_transaction: 6.33 },
      { hour: '08:00', sales: 267.80, transactions: 41, avg_transaction: 6.53 },
      { hour: '12:00', sales: 389.20, transactions: 58, avg_transaction: 6.71 },
      { hour: '13:00', sales: 412.30, transactions: 62, avg_transaction: 6.65 },
      { hour: '19:00', sales: 298.40, transactions: 45, avg_transaction: 6.63 },
      { hour: '20:00', sales: 187.60, transactions: 31, avg_transaction: 6.05 }
    ]);

    // Demo daily analytics
    setDailyAnalytics([
      { date: '2025-12-01', total_sales: 1247.50, total_transactions: 47, avg_transaction: 26.54, unique_customers: 38 },
      { date: '2025-12-02', total_sales: 987.30, total_transactions: 52, avg_transaction: 18.99, unique_customers: 42 },
      { date: '2025-12-03', total_sales: 1456.80, total_transactions: 89, avg_transaction: 16.37, unique_customers: 67 },
      { date: '2025-12-04', total_sales: 1123.40, total_transactions: 58, avg_transaction: 19.37, unique_customers: 45 },
      { date: '2025-12-05', total_sales: 876.20, total_transactions: 34, avg_transaction: 25.77, unique_customers: 28 }
    ]);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const formatCurrency = (value) => `RM${value.toFixed(2)}`;
  const formatPercentage = (value) => `${(value * 100).toFixed(1)}%`;

  const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336'];

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 3, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading advanced analytics...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">
          <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
          Advanced Sales Analytics
        </Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="7d">Last 7 Days</MenuItem>
            <MenuItem value="30d">Last 30 Days</MenuItem>
            <MenuItem value="90d">Last 90 Days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="📊 Sales Patterns" />
          <Tab label="👥 Customer Segments" />
          <Tab label="🎯 Combo Deals" />
          <Tab label="💰 Profit Analysis" />
          <Tab label="⏰ Peak Hours" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          {/* Sales Pattern Insights */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <TrendingUp color="success" /> High Value, Low Volume Days
                </Typography>
                {salesPatterns?.highValueLowVolume && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {salesPatterns.highValueLowVolume.insight}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body1">
                        <strong>Avg Transaction:</strong> {formatCurrency(salesPatterns.highValueLowVolume.avgTransactionValue)}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Transactions:</strong> {salesPatterns.highValueLowVolume.totalTransactions}
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 1 }}>
                      {salesPatterns.highValueLowVolume.days.map(day => (
                        <Chip key={day} label={day} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      ))}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <TrendingDown color="warning" /> Low Value, High Volume Days
                </Typography>
                {salesPatterns?.lowValueHighVolume && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {salesPatterns.lowValueHighVolume.insight}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body1">
                        <strong>Avg Transaction:</strong> {formatCurrency(salesPatterns.lowValueHighVolume.avgTransactionValue)}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Transactions:</strong> {salesPatterns.lowValueHighVolume.totalTransactions}
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 1 }}>
                      {salesPatterns.lowValueHighVolume.days.map(day => (
                        <Chip key={day} label={day} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      ))}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Daily Sales Trend */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Timeline /> Daily Sales Trend
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dailyAnalytics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Area type="monotone" dataKey="total_sales" stroke="#4CAF50" fill="#4CAF50" fillOpacity={0.3} name="Total Sales" />
                    <Area type="monotone" dataKey="avg_transaction" stroke="#2196F3" fill="#2196F3" fillOpacity={0.3} name="Avg Transaction" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tabValue === 1 && (
        <Grid container spacing={3}>
          {/* Customer Segments Pie Chart */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <People /> Customer Segments
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={customerSegments}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ segment, percentage }) => `${segment}: ${formatPercentage(percentage)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {customerSegments.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Customer Segments Table */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Group /> Segment Details
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Segment</TableCell>
                        <TableCell>Customers</TableCell>
                        <TableCell>Avg Value</TableCell>
                        <TableCell>Percentage</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {customerSegments.map((segment) => (
                        <TableRow key={segment.segment}>
                          <TableCell>
                            <Chip
                              label={segment.segment.replace('_', ' ').toUpperCase()}
                              size="small"
                              style={{ backgroundColor: segment.color, color: 'white' }}
                            />
                          </TableCell>
                          <TableCell>{segment.count}</TableCell>
                          <TableCell>{formatCurrency(segment.avgValue)}</TableCell>
                          <TableCell>{formatPercentage(segment.percentage)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tabValue === 2 && (
        <Grid container spacing={3}>
          {/* Combo Recommendations */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              <Lightbulb color="warning" /> AI-Powered Combo Recommendations
            </Typography>
            {comboRecommendations.map((combo, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" color="primary">
                        {combo.main_item} + {combo.suggested_combo}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {combo.reasoning}
                      </Typography>
                      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                        <Chip
                          icon={<Star />}
                          label={`Confidence: ${formatPercentage(combo.confidence)}`}
                          color={combo.confidence > 0.8 ? 'success' : combo.confidence > 0.6 ? 'warning' : 'default'}
                          size="small"
                        />
                        <Chip
                          label={`Current: ${formatCurrency(combo.current_price)}`}
                          variant="outlined"
                          size="small"
                        />
                        <Chip
                          label={`Combo: ${formatCurrency(combo.combo_price)}`}
                          color="primary"
                          size="small"
                        />
                        <Chip
                          label={`Save: ${formatPercentage((combo.current_price - combo.combo_price) / combo.current_price)}`}
                          color="success"
                          size="small"
                        />
                      </Box>
                    </Box>
                    <Button variant="contained" color="primary">
                      Apply Combo
                    </Button>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={combo.confidence * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Grid>
        </Grid>
      )}

      {tabValue === 3 && (
        <Grid container spacing={3}>
          {/* Profit Margins Bar Chart */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <AttachMoney /> Product Profit Margins
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={profitMargins}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="product_name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                    <Legend />
                    <Bar dataKey="profit_margin" fill="#4CAF50" name="Profit Margin %" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Profit Details Table */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Profit Analysis
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Cost</TableCell>
                        <TableCell>Margin</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {profitMargins.map((product) => (
                        <TableRow key={product.product_name}>
                          <TableCell sx={{ fontSize: '0.8rem' }}>{product.product_name}</TableCell>
                          <TableCell>{formatCurrency(product.avg_price)}</TableCell>
                          <TableCell>{formatCurrency(product.cost)}</TableCell>
                          <TableCell>
                            <Chip
                              label={`${product.profit_margin.toFixed(1)}%`}
                              color={product.profit_margin > 70 ? 'success' : product.profit_margin > 50 ? 'warning' : 'error'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tabValue === 4 && (
        <Grid container spacing={3}>
          {/* Peak Hours Chart */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Timeline /> Peak Hours Analysis
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <RechartsBarChart data={peakHours}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="sales" fill="#4CAF50" name="Total Sales (RM)" />
                    <Bar yAxisId="right" dataKey="transactions" fill="#2196F3" name="Transactions" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Peak Hours Insights */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <CheckCircle color="success" /> Busiest Hours
                </Typography>
                {peakHours.length > 0 && (
                  <Box>
                    {peakHours
                      .sort((a, b) => b.sales - a.sales)
                      .slice(0, 3)
                      .map((hour, index) => (
                        <Box key={hour.hour} sx={{ mb: 2 }}>
                          <Typography variant="h6" color="primary">
                            {index + 1}. {hour.hour}
                          </Typography>
                          <Typography variant="body2">
                            Sales: {formatCurrency(hour.sales)} | {hour.transactions} transactions | Avg: {formatCurrency(hour.avg_transaction)}
                          </Typography>
                        </Box>
                      ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Warning color="warning" /> Slow Hours
                </Typography>
                {peakHours.length > 0 && (
                  <Box>
                    {peakHours
                      .sort((a, b) => a.sales - b.sales)
                      .slice(0, 3)
                      .map((hour, index) => (
                        <Box key={hour.hour} sx={{ mb: 2 }}>
                          <Typography variant="h6" color="warning">
                            {index + 1}. {hour.hour}
                          </Typography>
                          <Typography variant="body2">
                            Sales: {formatCurrency(hour.sales)} | {hour.transactions} transactions | Avg: {formatCurrency(hour.avg_transaction)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Consider happy hour promotions
                          </Typography>
                        </Box>
                      ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default AdvancedAnalytics;