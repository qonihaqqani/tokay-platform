import React from 'react';
import { Container, Typography, Box, Paper, Alert } from '@mui/material';
import { Cloud, Warning } from '@mui/icons-material';

const WeatherMonitor = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Weather Monitor
      </Typography>
      
      <Alert severity="warning" sx={{ mb: 3 }}>
        <Warning sx={{ mr: 1 }} />
        Heavy rainfall expected in your area in the next 24 hours
      </Alert>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          <Cloud sx={{ mr: 1, verticalAlign: 'middle' }} />
          Current Weather Conditions
        </Typography>
        <Typography variant="body1">
          Real-time weather monitoring and alerts for your business location.
          Integration with MET Malaysia for accurate weather data.
        </Typography>
      </Paper>
    </Container>
  );
};

export default WeatherMonitor;