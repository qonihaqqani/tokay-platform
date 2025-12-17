import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Container, Typography, Button } from '@mui/material';

// Import components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import RestaurantDashboard from './components/RestaurantDashboard';
import RiskAssessment from './components/RiskAssessment';
import EmergencyFund from './components/EmergencyFund';
import EmergencyFundEnhanced from './components/EmergencyFundEnhanced';
import Alerts from './components/Alerts';
import Reports from './components/Reports';
import Analytics from './components/Analytics';
import WeatherMonitor from './components/WeatherMonitor';
import PaymentIntegration from './components/PaymentIntegration';
import ReceiptUpload from './components/ReceiptUpload';
import EInvoice from './components/EInvoice';

// Import contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';

// Import PWA utilities
import { initializePWA, requestNotificationPermission } from './utils/pwaUtils';

const theme = createTheme({
  palette: {
    primary: { main: '#2E7D32' },
    secondary: { main: '#FF6B35' },
    background: { default: '#f5f7fa' },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Protected Route component
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

// App Layout component
function AppLayout({ children }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1, pt: 3, pb: 3 }}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
}

function App() {
  // Initialize PWA features on app mount
  useEffect(() => {
    // Initialize PWA features
    initializePWA();
    
    // Request notification permission (only for authenticated users)
    const requestNotificationAccess = async () => {
      const permission = await requestNotificationPermission();
      if (permission === 'granted') {
        console.log('✅ Notification permission granted');
      }
    };
    
    // Delay notification request to avoid interrupting user experience
    setTimeout(requestNotificationAccess, 5000);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LanguageProvider>
        <AuthProvider>
          <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/restaurant-dashboard" element={
              <ProtectedRoute>
                <AppLayout>
                  <RestaurantDashboard />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/risk-assessment" element={
              <ProtectedRoute>
                <AppLayout>
                  <RiskAssessment />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/emergency-fund" element={
              <ProtectedRoute>
                <AppLayout>
                  <EmergencyFundEnhanced />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/emergency-fund-basic" element={
              <ProtectedRoute>
                <AppLayout>
                  <EmergencyFund />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/alerts" element={
              <ProtectedRoute>
                <AppLayout>
                  <Alerts />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/reports" element={
              <ProtectedRoute>
                <AppLayout>
                  <Reports />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/analytics" element={
              <ProtectedRoute>
                <AppLayout>
                  <Analytics />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/weather-monitor" element={
              <ProtectedRoute>
                <AppLayout>
                  <WeatherMonitor />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/payments" element={
              <ProtectedRoute>
                <AppLayout>
                  <PaymentIntegration />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/receipt-upload" element={
              <ProtectedRoute>
                <AppLayout>
                  <ReceiptUpload />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/e-invoicing" element={
              <ProtectedRoute>
                <AppLayout>
                  <EInvoice />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
