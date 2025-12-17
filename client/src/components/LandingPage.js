import React from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar
} from '@mui/material';
import {
  Security,
  Assessment,
  AccountBalance,
  CloudUpload,
  Receipt,
  Warning,
  CheckCircle,
  TrendingUp,
  Shield,
  Speed,
  Support
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Security color="primary" />,
      title: 'AI Risk Assessment',
      description: 'Advanced AI algorithms analyze your business risks based on location, industry, and market conditions.'
    },
    {
      icon: <AccountBalance color="primary" />,
      title: 'Emergency Fund Management',
      description: 'Smart savings system to build and manage your business emergency fund with automated contributions.'
    },
    {
      icon: <Warning color="primary" />,
      title: 'Real-time Alerts',
      description: 'Instant notifications about weather warnings, supply chain disruptions, and market changes.'
    },
    {
      icon: <Receipt color="primary" />,
      title: 'LHDN E-Invoicing',
      description: 'Fully compliant e-invoicing system with Malaysian tax regulations and emergency fund integration.'
    },
    {
      icon: <CloudUpload color="primary" />,
      title: 'Smart Receipt Analysis',
      description: 'OCR-powered receipt processing with AI-powered spending insights and contribution suggestions.'
    },
    {
      icon: <Assessment color="primary" />,
      title: 'Resilience Analytics',
      description: 'Comprehensive reports and insights to improve your business resilience over time.'
    }
  ];

  const benefits = [
    'Protect your business from unexpected disruptions',
    'Comply with Malaysian e-invoicing regulations',
    'Build financial resilience with smart savings',
    'Get AI-powered risk insights and recommendations',
    'Access real-time alerts and emergency support',
    'Multi-language support (BM, English, Mandarin, Tamil)'
  ];

  const testimonials = [
    {
      name: 'Ahmad Hassan',
      business: 'Nasi Lemak Restaurant',
      location: 'Kelantan',
      content: 'Tokay helped us prepare for the monsoon season. Our emergency fund saved us when the floods hit.',
      avatar: 'AH'
    },
    {
      name: 'Siti Nur',
      business: 'Retail Shop',
      location: 'Kuala Lumpur',
      content: 'The e-invoicing feature is amazing! It\'s so easy to use and fully LHDN compliant.',
      avatar: 'SN'
    },
    {
      name: 'Raj Kumar',
      business: 'Construction Company',
      location: 'Selangor',
      content: 'The risk assessment alerts helped us avoid major supply chain disruptions during MCO.',
      avatar: 'RK'
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Paper
        sx={{
          background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
          color: 'white',
          py: 10,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom>
            🦎 Tokay Resilience Platform
          </Typography>
          <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
            Empowering Malaysian MSMEs with AI-Powered Business Resilience
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem' }}>
            Protect your business from floods, economic shocks, and unexpected disruptions. 
            Built for Malaysia, by Malaysians.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
            >
              Get Started Free
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/login')}
              sx={{ borderColor: 'white', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              Sign In
            </Button>
          </Box>
        </Container>
      </Paper>

      {/* Features Section */}
      <Container sx={{ py: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Why Choose Tokay?
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 6 }}>
          Comprehensive tools to build business resilience and ensure compliance
        </Typography>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                    <Avatar sx={{ bgcolor: 'primary.light', width: 56, height: 56 }}>
                      {feature.icon}
                    </Avatar>
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Benefits Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" gutterBottom>
                Built for Malaysian Businesses
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Tokay understands the unique challenges faced by Malaysian MSMEs, from seasonal floods to regulatory compliance.
              </Typography>
              <List>
                {benefits.map((benefit, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText primary={benefit} />
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, bgcolor: 'primary.main', color: 'white' }}>
                <Typography variant="h6" gutterBottom>
                  🇲🇾 Malaysian Compliance
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Fully compliant with:
                </Typography>
                <List dense>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemText primary="• LHDN E-Invoicing Requirements" />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemText primary="• Personal Data Protection Act (PDPA)" />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemText primary="• Bank Negara Malaysia Guidelines" />
                  </ListItem>
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemText primary="• SME Corp Malaysia Standards" />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Container sx={{ py: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Trusted by Malaysian Business Owners
        </Typography>
        
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
                      {testimonial.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.business} • {testimonial.location}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" italic>
                    "{testimonial.content}"
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Paper
        sx={{
          background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" gutterBottom>
            Ready to Build Business Resilience?
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem' }}>
            Join thousands of Malaysian businesses protecting their future with Tokay.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/register')}
            sx={{ bgcolor: 'white', color: 'secondary.main', '&:hover': { bgcolor: 'grey.100' } }}
          >
            Start Your Free Trial
          </Button>
          <Typography variant="body2" sx={{ mt: 2 }}>
            No credit card required • Free plan available • Cancel anytime
          </Typography>
        </Container>
      </Paper>
    </Box>
  );
};

export default LandingPage;