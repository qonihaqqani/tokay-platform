import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Box,
  Chip,
  IconButton,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add,
  Remove,
  Delete,
  Payment,
  Fastfood,
  LocalCafe,
  LunchDining,
  DinnerDining,
  ShoppingCart,
  CheckCircle
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';

const QuickSale = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const [cart, setCart] = useState([]);
  const [frequentItems, setFrequentItems] = useState([]);
  const [customItem, setCustomItem] = useState({ name: '', price: '', quantity: 1 });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [todayStats, setTodayStats] = useState({ sales: 0, transactions: 0 });

  // Predefined quick items (can be customized per business)
  const quickItems = [
    { name: 'Teh Tarik', price: 3.50, category: 'beverage', icon: <LocalCafe /> },
    { name: 'Kopi O', price: 2.50, category: 'beverage', icon: <LocalCafe /> },
    { name: 'Nasi Lemak', price: 8.00, category: 'meal', icon: <LunchDining /> },
    { name: 'Roti Canai', price: 2.00, category: 'meal', icon: <DinnerDining /> },
    { name: 'Mee Goreng', price: 6.00, category: 'meal', icon: <Fastfood /> },
    { name: 'Cendol', price: 4.50, category: 'dessert', icon: <Fastfood /> }
  ];

  useEffect(() => {
    fetchFrequentItems();
    fetchTodayStats();
  }, []);

  const fetchFrequentItems = async () => {
    try {
      const response = await api.get('/api/invoices/quick-sale/frequent-items?days=7&limit=10');
      setFrequentItems(response.data.data);
    } catch (error) {
      console.error('Error fetching frequent items:', error);
      // Use demo data if API fails
      setFrequentItems(quickItems);
    }
  };

  const fetchTodayStats = async () => {
    try {
      // Mock today's stats for demo
      setTodayStats({
        sales: 1247.50,
        transactions: 47
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.name === item.name);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.name === item.name
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (itemName, change) => {
    setCart(cart.map(item => {
      if (item.name === itemName) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (itemName) => {
    setCart(cart.filter(item => item.name !== itemName));
  };

  const addCustomItem = () => {
    if (customItem.name && customItem.price) {
      addToCart({
        name: customItem.name,
        price: parseFloat(customItem.price),
        category: 'custom',
        quantity: parseInt(customItem.quantity)
      });
      setCustomItem({ name: '', price: '', quantity: 1 });
    }
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleQuickSale = async () => {
    if (cart.length === 0) {
      setError('Please add items to cart');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const saleData = {
        items: cart.map(item => ({
          product_name: item.name,
          unit_price: item.price,
          quantity: item.quantity,
          category: item.category
        })),
        payment_method: paymentMethod,
        customer_name: 'Walk-in Customer'
      };

      await api.post('/api/invoices/quick-sale', saleData);
      
      setSuccess(true);
      setCart([]);
      
      // Refresh stats
      fetchTodayStats();
      fetchFrequentItems();
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError('Failed to complete sale. Please try again.');
      console.error('Quick sale error:', error);
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { value: 'cash', label: 'Cash', color: 'success' },
    { value: 'fpx', label: 'FPX', color: 'primary' },
    { value: 'tng', label: 'Touch \'n Go', color: 'warning' },
    { value: 'grabpay', label: 'GrabPay', color: 'secondary' }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" gutterBottom>
          ⚡ Quick Sale Mode
        </Typography>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="h6" color="primary">
            Today: RM{todayStats.sales.toFixed(2)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {todayStats.transactions} transactions
          </Typography>
        </Box>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <CheckCircle sx={{ mr: 1 }} />
          Sale completed successfully!
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Side - Quick Items */}
        <Grid item xs={12} md={8}>
          {/* Frequent Items */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🔥 Quick Items (Frequently Sold)
              </Typography>
              <Grid container spacing={2}>
                {frequentItems.map((item, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ 
                        height: 80, 
                        flexDirection: 'column',
                        borderColor: 'primary.main',
                        '&:hover': { borderColor: 'primary.dark', bgcolor: 'primary.light' }
                      }}
                      onClick={() => addToCart(item)}
                    >
                      <Box sx={{ fontSize: 24, mb: 0.5 }}>
                        {item.icon || <Fastfood />}
                      </Box>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem', lineHeight: 1.2 }}>
                        {item.name}
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        RM{item.price.toFixed(2)}
                      </Typography>
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Custom Item Entry */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📝 Custom Item
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                <TextField
                  label="Item Name"
                  value={customItem.name}
                  onChange={(e) => setCustomItem({ ...customItem, name: e.target.value })}
                  sx={{ flexGrow: 1 }}
                />
                <TextField
                  label="Price (RM)"
                  type="number"
                  value={customItem.price}
                  onChange={(e) => setCustomItem({ ...customItem, price: e.target.value })}
                  sx={{ width: 120 }}
                />
                <TextField
                  label="Qty"
                  type="number"
                  value={customItem.quantity}
                  onChange={(e) => setCustomItem({ ...customItem, quantity: e.target.value })}
                  sx={{ width: 80 }}
                />
                <Button
                  variant="contained"
                  onClick={addCustomItem}
                  disabled={!customItem.name || !customItem.price}
                >
                  Add
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Side - Cart */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <ShoppingCart sx={{ mr: 1, verticalAlign: 'middle' }} />
                Current Sale
              </Typography>

              {cart.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                  <ShoppingCart sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                  <Typography variant="body2">
                    No items in cart
                  </Typography>
                </Box>
              ) : (
                <List dense>
                  {cart.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={item.name}
                        secondary={`RM${item.price.toFixed(2)} x ${item.quantity}`}
                      />
                      <ListItemSecondaryAction>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(item.name, -1)}
                          >
                            <Remove fontSize="small" />
                          </IconButton>
                          <Typography variant="body2" sx={{ minWidth: 20, textAlign: 'center' }}>
                            {item.quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(item.name, 1)}
                          >
                            <Add fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => removeFromCart(item.name)}
                            color="error"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}

              {/* Total */}
              <Box sx={{ mt: 2, pt: 2, borderTop: 1, 'borderColor': 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Items:</Typography>
                  <Typography variant="body2">{getTotalItems()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6" color="primary">
                    RM{getTotal().toFixed(2)}
                  </Typography>
                </Box>

                {/* Payment Methods */}
                <Typography variant="body2" gutterBottom>
                  Payment Method:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {paymentMethods.map((method) => (
                    <Chip
                      key={method.value}
                      label={method.label}
                      color={paymentMethod === method.value ? method.color : 'default'}
                      variant={paymentMethod === method.value ? 'filled' : 'outlined'}
                      size="small"
                      onClick={() => setPaymentMethod(method.value)}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<Payment />}
                  onClick={handleQuickSale}
                  disabled={cart.length === 0 || loading}
                  sx={{ py: 1.5 }}
                >
                  {loading ? <CircularProgress size={20} color="inherit" /> : 'Complete Sale'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default QuickSale;