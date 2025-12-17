import React, { useState, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Button, TextField,
  LinearProgress, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, IconButton, Tooltip, Grid,
  List, ListItem, ListItemText, ListItemSecondaryAction,
  Divider, Paper
} from '@mui/material';
import {
  CloudUpload, Receipt, Analyze, Add, CheckCircle, Warning,
  Info, Delete, Edit, Visibility, AccountBalanceWallet
} from '@mui/icons-material';

const ReceiptUpload = ({ businessId, onContributionSuggestion, onReceiptProcessed }) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [processedReceipt, setProcessedReceipt] = useState(null);
  const [analysisDialog, setAnalysisDialog] = useState(false);
  const [autoContributeDialog, setAutoContributeDialog] = useState(false);

  const handleFileSelect = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setMessage({
          type: 'error',
          text: 'Only JPEG, JPG, PNG, and PDF files are allowed'
        });
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setMessage({
          type: 'error',
          text: 'File size must be less than 10MB'
        });
        return;
      }

      setSelectedFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreviewUrl(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
      
      setMessage({ type: '', text: '' });
    }
  }, []);

  const handleUpload = async () => {
    if (!selectedFile || !businessId) {
      setMessage({
        type: 'error',
        text: 'Please select a file and ensure business is selected'
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('receipt', selectedFile);
    formData.append('businessId', businessId);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/receipts/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (data.success) {
        setProcessedReceipt(data);
        setMessage({
          type: 'success',
          text: 'Receipt uploaded and processed successfully!'
        });
        
        // Show analysis if available
        if (data.analysis) {
          setAnalysisDialog(true);
        }

        // Notify parent component
        if (onReceiptProcessed) {
          onReceiptProcessed(data);
        }

        // Reset form
        setSelectedFile(null);
        setPreviewUrl(null);
        setUploadProgress(0);
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Failed to process receipt'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Error uploading receipt: ' + error.message
      });
    } finally {
      setUploading(false);
    }
  };

  const handleAutoContribute = async () => {
    if (!processedReceipt?.analysis?.suggestion) return;

    try {
      const response = await fetch(`/api/receipts/${processedReceipt.receipt.id}/auto-contribute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: processedReceipt.analysis.suggestion.suggestedAmount,
          confirm: true
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: 'Auto-contribution created successfully!'
        });
        
        if (onContributionSuggestion) {
          onContributionSuggestion(data.contribution);
        }

        setAutoContributeDialog(false);
        setAnalysisDialog(false);
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Failed to create auto-contribution'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Error creating auto-contribution: ' + error.message
      });
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'high': return <Warning color="error" />;
      case 'medium': return <Info color="warning" />;
      case 'low': return <CheckCircle color="success" />;
      default: return <Info />;
    }
  };

  return (
    <Box>
      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
            <Receipt sx={{ mr: 1, verticalAlign: 'middle' }} />
            Smart Receipt Analysis
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Upload your business receipts to get AI-powered spending analysis and emergency fund contribution suggestions.
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { borderColor: '#2E7D32', bgcolor: '#f8fff8' },
                  transition: 'all 0.3s ease'
                }}
                onClick={() => document.getElementById('receipt-file-input').click()}
              >
                <input
                  id="receipt-file-input"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                
                {previewUrl ? (
                  <Box>
                    <img
                      src={previewUrl}
                      alt="Receipt preview"
                      style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }}
                    />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {selectedFile.name}
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <CloudUpload sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                    <Typography variant="body1">
                      Click to upload receipt
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      JPEG, JPG, PNG, or PDF (max 10MB)
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              {selectedFile && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    File Details
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="File Name" secondary={selectedFile.name} />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="File Size" 
                        secondary={`${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="File Type" 
                        secondary={selectedFile.type} 
                      />
                    </ListItem>
                  </List>
                  
                  <Button
                    variant="contained"
                    startIcon={<CloudUpload />}
                    onClick={handleUpload}
                    disabled={uploading}
                    fullWidth
                    sx={{ backgroundColor: '#2E7D32', '&:hover': { backgroundColor: '#1B5E20' } }}
                  >
                    {uploading ? 'Processing...' : 'Upload & Analyze'}
                  </Button>
                </Box>
              )}
            </Grid>
          </Grid>

          {uploading && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Processing receipt... {uploadProgress}%
              </Typography>
              <LinearProgress variant="determinate" value={uploadProgress} />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Analysis Dialog */}
      <Dialog 
        open={analysisDialog} 
        onClose={() => setAnalysisDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Analyze color="primary" />
            Receipt Analysis & Contribution Suggestion
          </Box>
        </DialogTitle>
        <DialogContent>
          {processedReceipt?.analysis && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Alert 
                  severity={getUrgencyColor(processedReceipt.analysis.suggestion.urgency)}
                  sx={{ mb: 2 }}
                  icon={getUrgencyIcon(processedReceipt.analysis.suggestion.urgency)}
                >
                  <Typography variant="h6">
                    {processedReceipt.analysis.suggestion.urgency.toUpperCase()} PRIORITY
                  </Typography>
                  <Typography variant="body2">
                    {processedReceipt.analysis.suggestion.reason}
                  </Typography>
                </Alert>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Receipt Details
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Merchant" 
                        secondary={processedReceipt.ocrData.merchantName} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Total Amount" 
                        secondary={`RM${processedReceipt.ocrData.totalAmount}`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Category" 
                        secondary={processedReceipt.ocrData.category} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Confidence" 
                        secondary={`${(processedReceipt.ocrData.confidenceScore * 100).toFixed(1)}%`} 
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    <AccountBalanceWallet sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Contribution Suggestion
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2E7D32', textAlign: 'center', my: 2 }}>
                    RM{processedReceipt.analysis.suggestion.suggestedAmount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                    Range: RM{processedReceipt.analysis.suggestion.minAmount} - RM{processedReceipt.analysis.suggestion.maxAmount}
                  </Typography>
                  {processedReceipt.analysis.suggestion.estimatedTimeToTarget && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
                      Est. time to target: {processedReceipt.analysis.suggestion.estimatedTimeToTarget} months
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnalysisDialog(false)}>
            Close
          </Button>
          {processedReceipt?.analysis?.suggestion?.autoContributeRecommended && (
            <Button
              variant="contained"
              onClick={() => setAutoContributeDialog(true)}
              sx={{ backgroundColor: '#2E7D32', '&:hover': { backgroundColor: '#1B5E20' } }}
            >
              Auto-Contribute
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Auto-Contribute Confirmation Dialog */}
      <Dialog open={autoContributeDialog} onClose={() => setAutoContributeDialog(false)}>
        <DialogTitle>Confirm Auto-Contribution</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to automatically contribute 
            <strong> RM{processedReceipt?.analysis?.suggestion?.suggestedAmount} </strong>
            to your emergency fund based on this receipt analysis?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAutoContributeDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAutoContribute}
            sx={{ backgroundColor: '#2E7D32', '&:hover': { backgroundColor: '#1B5E20' } }}
          >
            Confirm Contribution
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReceiptUpload;