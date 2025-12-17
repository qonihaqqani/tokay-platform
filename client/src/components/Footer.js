import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  Grid,
  Divider
} from '@mui/material';
import { Facebook, Twitter, LinkedIn, Instagram } from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'primary.main',
        color: 'white',
        py: 6,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              🦎 Tokay Resilience Platform
            </Typography>
            <Typography variant="body2">
              Empowering Malaysian MSMEs with AI-powered business resilience tools. 
              Built for Malaysia, by Malaysians.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Link href="#" color="inherit" sx={{ mr: 2 }}>
                <Facebook />
              </Link>
              <Link href="#" color="inherit" sx={{ mr: 2 }}>
                <Twitter />
              </Link>
              <Link href="#" color="inherit" sx={{ mr: 2 }}>
                <LinkedIn />
              </Link>
              <Link href="#" color="inherit">
                <Instagram />
              </Link>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Box component="nav" aria-label="footer navigation">
              <Link href="/about" color="inherit" display="block" sx={{ mb: 1 }}>
                About Us
              </Link>
              <Link href="/features" color="inherit" display="block" sx={{ mb: 1 }}>
                Features
              </Link>
              <Link href="/pricing" color="inherit" display="block" sx={{ mb: 1 }}>
                Pricing
              </Link>
              <Link href="/contact" color="inherit" display="block" sx={{ mb: 1 }}>
                Contact
              </Link>
              <Link href="/blog" color="inherit" display="block">
                Blog
              </Link>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Support
            </Typography>
            <Box component="nav" aria-label="support navigation">
              <Link href="/help" color="inherit" display="block" sx={{ mb: 1 }}>
                Help Center
              </Link>
              <Link href="/privacy" color="inherit" display="block" sx={{ mb: 1 }}>
                Privacy Policy
              </Link>
              <Link href="/terms" color="inherit" display="block" sx={{ mb: 1 }}>
                Terms of Service
              </Link>
              <Link href="/security" color="inherit" display="block" sx={{ mb: 1 }}>
                Security
              </Link>
              <Link href="/api" color="inherit" display="block">
                API Documentation
              </Link>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.3)', my: 3 }} />
        
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Typography variant="body2">
            © {new Date().getFullYear()} Tokay Resilience Platform. All rights reserved.
          </Typography>
          <Typography variant="body2">
            Made with ❤️ in Malaysia
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;