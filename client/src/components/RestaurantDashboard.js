import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { Restaurant } from '@mui/icons-material';

const RestaurantDashboard = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        <Restaurant sx={{ mr: 1, verticalAlign: 'middle' }} />
        Restaurant Dashboard
      </Typography>
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1">
          Specialized dashboard for restaurant businesses with food-specific risk assessments, inventory management, and supplier tracking.
        </Typography>
      </Paper>
    </Container>
  );
};

export default RestaurantDashboard;