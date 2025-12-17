import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

const Analytics = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Business Analytics
      </Typography>
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1">
          Advanced analytics dashboard coming soon. Track your business performance, risk trends, and resilience metrics.
        </Typography>
      </Paper>
    </Container>
  );
};

export default Analytics;