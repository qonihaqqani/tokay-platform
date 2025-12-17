import React from 'react';
import { Container, Typography, Box, Paper, Button, Grid } from '@mui/material';
import { Payment, AccountBalance } from '@mui/icons-material';

const PaymentIntegration = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Payment Integration
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <Payment sx={{ mr: 1, verticalAlign: 'middle' }} />
              Payment Methods
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button variant="outlined">FPX</Button>
              <Button variant="outlined">Touch 'n Go</Button>
              <Button variant="outlined">GrabPay</Button>
              <Button variant="outlined">Credit Card</Button>
              <Button variant="outlined">Bank Transfer</Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <AccountBalance sx={{ mr: 1, verticalAlign: 'middle' }} />
              Emergency Fund Contributions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Set up automated contributions to your emergency fund using your preferred payment method.
            </Typography>
            <Button variant="contained" sx={{ mt: 2 }}>
              Set Up Auto-Contribution
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PaymentIntegration;