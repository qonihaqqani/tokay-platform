import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  Description,
  Download,
  Assessment,
  TrendingUp
} from '@mui/icons-material';

const Reports = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Resilience Reports
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Assessment color="primary" sx={{ fontSize: 40, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Risk Assessment Report
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Comprehensive analysis of your business risks and mitigation strategies.
              </Typography>
              <Button variant="contained" startIcon={<Download />}>
                Download PDF
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <TrendingUp color="primary" sx={{ fontSize: 40, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Financial Resilience Report
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Analysis of your emergency fund and financial preparedness.
              </Typography>
              <Button variant="contained" startIcon={<Download />}>
                Download PDF
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Description color="primary" sx={{ fontSize: 40, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Business Impact Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Historical analysis of disruptions and their impact on your business.
              </Typography>
              <Button variant="contained" startIcon={<Download />}>
                Download PDF
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Reports;