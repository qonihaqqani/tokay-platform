import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Tooltip, Chip, Alert, FormControl, InputLabel,
  Select, MenuItem, Switch, FormControlLabel, Divider, Tabs, Tab
} from '@mui/material';
import {
  Add, Edit, Delete, Send, PictureAsPdf, CloudUpload,
  CheckCircle, Warning, Error, Info, Receipt, AttachMoney,
  Emergency, History, Visibility
} from '@mui/icons-material';
import { api } from '../services/api';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`einvoice-tabpanel-${index}`}
      aria-labelledby={`einvoice-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const EInvoice = () => {
  const [tabValue, setTabValue] = useState(0);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    customer_email: '',
    date_from: '',
    date_to: '',
    is_emergency_related: ''
  });

  // Form state for new invoice
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    customer_state: '',
    customer_postal_code: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    invoice_type: 'standard',
    notes: '',
    is_emergency_related: false,
    emergency_notes: '',
    line_items: [
      { description: '', quantity: 1, unit_price: 0, category: 'general' }
    ],
    payment_terms: {
      method: 'bank_transfer',
      due_days: 30
    }
  });

  useEffect(() => {
    fetchInvoices();
  }, [filters]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });

      const response = await api.get(`/invoices?${params}`);
      
      if (response.data.success) {
        setInvoices(response.data.data.invoices);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch invoices' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async () => {
    try {
      setLoading(true);
      
      // Validate form
      if (!formData.customer_name || !formData.line_items[0].description) {
        setMessage({ type: 'error', text: 'Please fill in all required fields' });
        return;
      }

      const response = await api.post('/invoices', formData);
      
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Invoice created successfully!' });
        setCreateDialogOpen(false);
        resetForm();
        fetchInvoices();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to create invoice' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitToLHDN = async (invoiceId) => {
    try {
      setLoading(true);
      const response = await api.post(`/invoices/${invoiceId}/submit-lhdn`);
      
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Invoice submitted to LHDN successfully!' });
        fetchInvoices();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to submit to LHDN' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvoice = async (invoiceId) => {
    try {
      setLoading(true);
      const response = await api.post(`/invoices/${invoiceId}/send`, {
        send_email: true,
        send_whatsapp: false
      });
      
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Invoice sent to customer!' });
        fetchInvoices();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send invoice' });
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async (invoiceId) => {
    try {
      setLoading(true);
      const response = await api.post(`/invoices/${invoiceId}/generate-pdf`);
      
      if (response.data.success) {
        setMessage({ type: 'success', text: 'PDF generated successfully!' });
        // In a real app, you would download the PDF here
        window.open(response.data.data.pdfPath, '_blank');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to generate PDF' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      customer_address: '',
      customer_state: '',
      customer_postal_code: '',
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      invoice_type: 'standard',
      notes: '',
      is_emergency_related: false,
      emergency_notes: '',
      line_items: [
        { description: '', quantity: 1, unit_price: 0, category: 'general' }
      ],
      payment_terms: {
        method: 'bank_transfer',
        due_days: 30
      }
    });
  };

  const addLineItem = () => {
    setFormData({
      ...formData,
      line_items: [
        ...formData.line_items,
        { description: '', quantity: 1, unit_price: 0, category: 'general' }
      ]
    });
  };

  const updateLineItem = (index, field, value) => {
    const updatedItems = [...formData.line_items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFormData({ ...formData, line_items: updatedItems });
  };

  const removeLineItem = (index) => {
    if (formData.line_items.length > 1) {
      setFormData({
        ...formData,
        line_items: formData.line_items.filter((_, i) => i !== index)
      });
    }
  };

  const calculateSubtotal = () => {
    return formData.line_items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const calculateSST = () => {
    const subtotal = calculateSubtotal();
    // Simplified SST calculation (6% for non-exempt items)
    return subtotal * 0.06;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateSST();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'sent': return 'info';
      case 'overdue': return 'error';
      case 'draft': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <CheckCircle color="success" />;
      case 'sent': return <Send color="info" />;
      case 'overdue': return <Warning color="error" />;
      case 'draft': return <Edit color="warning" />;
      default: return <Info />;
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const viewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setViewDialogOpen(true);
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#2E7D32', mb: 4 }}>
        🧾 Tokay E-Invoicing - LHDN Compliant Digital Invoices
      </Typography>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Invoices" icon={<Receipt />} />
          <Tab label="Create New" icon={<Add />} />
          <Tab label="Analytics" icon={<AttachMoney />} />
        </Tabs>
      </Box>

      {/* Invoices List Tab */}
      <TabPanel value={tabValue} index={0}>
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Invoice Management
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setCreateDialogOpen(true)}
                sx={{ backgroundColor: '#2E7D32', '&:hover': { backgroundColor: '#1B5E20' } }}
              >
                Create Invoice
              </Button>
            </Box>

            {/* Filters */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    label="Status"
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="sent">Sent</MenuItem>
                    <MenuItem value="paid">Paid</MenuItem>
                    <MenuItem value="overdue">Overdue</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Customer Email"
                  value={filters.customer_email}
                  onChange={(e) => handleFilterChange('customer_email', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="From Date"
                  value={filters.date_from}
                  onChange={(e) => handleFilterChange('date_from', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="To Date"
                  value={filters.date_to}
                  onChange={(e) => handleFilterChange('date_to', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Emergency</InputLabel>
                  <Select
                    value={filters.is_emergency_related}
                    label="Emergency"
                    onChange={(e) => handleFilterChange('is_emergency_related', e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="true">Yes</MenuItem>
                    <MenuItem value="false">No</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Invoices Table */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice #</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>LHDN Status</TableCell>
                    <TableCell>Emergency</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {invoice.invoice_number}
                        </Typography>
                      </TableCell>
                      <TableCell>{invoice.customer_name}</TableCell>
                      <TableCell>{new Date(invoice.invoice_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          RM{parseFloat(invoice.total_amount).toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={invoice.status.toUpperCase()}
                          size="small"
                          color={getStatusColor(invoice.status)}
                          icon={getStatusIcon(invoice.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={invoice.lhdn_status?.toUpperCase() || 'PENDING'}
                          size="small"
                          color={invoice.lhdn_status === 'accepted' ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        {invoice.is_emergency_related && (
                          <Emergency color="error" sx={{ fontSize: 20 }} />
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View">
                            <IconButton
                              size="small"
                              onClick={() => viewInvoice(invoice)}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          {invoice.status === 'draft' && (
                            <Tooltip title="Submit to LHDN">
                              <IconButton
                                size="small"
                                onClick={() => handleSubmitToLHDN(invoice.id)}
                                disabled={loading}
                              >
                                <CloudUpload />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Generate PDF">
                            <IconButton
                              size="small"
                              onClick={() => handleGeneratePDF(invoice.id)}
                              disabled={loading}
                            >
                              <PictureAsPdf />
                            </IconButton>
                          </Tooltip>
                          {invoice.status === 'sent' && (
                            <Tooltip title="Send to Customer">
                              <IconButton
                                size="small"
                                onClick={() => handleSendInvoice(invoice.id)}
                                disabled={loading}
                              >
                                <Send />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Create Invoice Tab */}
      <TabPanel value={tabValue} index={1}>
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Create New Invoice
            </Typography>

            <Grid container spacing={3}>
              {/* Customer Information */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Customer Information
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Customer Name *"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>State</InputLabel>
                  <Select
                    value={formData.customer_state}
                    label="State"
                    onChange={(e) => setFormData({ ...formData, customer_state: e.target.value })}
                  >
                    <MenuItem value="Johor">Johor</MenuItem>
                    <MenuItem value="Kedah">Kedah</MenuItem>
                    <MenuItem value="Kelantan">Kelantan</MenuItem>
                    <MenuItem value="Melaka">Melaka</MenuItem>
                    <MenuItem value="Negeri Sembilan">Negeri Sembilan</MenuItem>
                    <MenuItem value="Pahang">Pahang</MenuItem>
                    <MenuItem value="Perak">Perak</MenuItem>
                    <MenuItem value="Perlis">Perlis</MenuItem>
                    <MenuItem value="Pulau Pinang">Pulau Pinang</MenuItem>
                    <MenuItem value="Sabah">Sabah</MenuItem>
                    <MenuItem value="Sarawak">Sarawak</MenuItem>
                    <MenuItem value="Selangor">Selangor</MenuItem>
                    <MenuItem value="Terengganu">Terengganu</MenuItem>
                    <MenuItem value="Kuala Lumpur">Kuala Lumpur</MenuItem>
                    <MenuItem value="Labuan">Labuan</MenuItem>
                    <MenuItem value="Putrajaya">Putrajaya</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  multiline
                  rows={2}
                  value={formData.customer_address}
                  onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
                />
              </Grid>

              {/* Invoice Details */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Invoice Details
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Invoice Date"
                  type="date"
                  value={formData.invoice_date}
                  onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Due Date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Invoice Type</InputLabel>
                  <Select
                    value={formData.invoice_type}
                    label="Invoice Type"
                    onChange={(e) => setFormData({ ...formData, invoice_type: e.target.value })}
                  >
                    <MenuItem value="standard">Standard Invoice</MenuItem>
                    <MenuItem value="proforma">Proforma Invoice</MenuItem>
                    <MenuItem value="credit_note">Credit Note</MenuItem>
                    <MenuItem value="debit_note">Debit Note</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Emergency Related */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_emergency_related}
                      onChange={(e) => setFormData({ ...formData, is_emergency_related: e.target.checked })}
                    />
                  }
                  label="Emergency Related Invoice"
                />
              </Grid>
              {formData.is_emergency_related && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Emergency Notes"
                    multiline
                    rows={3}
                    value={formData.emergency_notes}
                    onChange={(e) => setFormData({ ...formData, emergency_notes: e.target.value })}
                    helperText="Describe the emergency situation related to this invoice"
                  />
                </Grid>
              )}

              {/* Line Items */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1">
                    Line Items
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={addLineItem}
                  >
                    Add Item
                  </Button>
                </Box>
              </Grid>
              {formData.line_items.map((item, index) => (
                <Grid item xs={12} key={index}>
                  <Card sx={{ p: 2, mb: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Description *"
                          value={item.description}
                          onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField
                          fullWidth
                          label="Quantity"
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField
                          fullWidth
                          label="Unit Price (RM)"
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <FormControl fullWidth>
                          <InputLabel>Category</InputLabel>
                          <Select
                            value={item.category}
                            label="Category"
                            onChange={(e) => updateLineItem(index, 'category', e.target.value)}
                          >
                            <MenuItem value="general">General</MenuItem>
                            <MenuItem value="basic_food_items">Basic Food Items (SST Exempt)</MenuItem>
                            <MenuItem value="educational_services">Educational Services (SST Exempt)</MenuItem>
                            <MenuItem value="healthcare_services">Healthcare Services (SST Exempt)</MenuItem>
                            <MenuItem value="services">Services</MenuItem>
                            <MenuItem value="goods">Goods</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Typography variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
                          Total: RM{(item.quantity * item.unit_price).toFixed(2)}
                        </Typography>
                        {formData.line_items.length > 1 && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removeLineItem(index)}
                            sx={{ ml: 1 }}
                          >
                            <Delete />
                          </IconButton>
                        )}
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
              ))}

              {/* Summary */}
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Invoice Summary
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Subtotal:</Typography>
                    <Typography>RM{calculateSubtotal().toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>SST (6%):</Typography>
                    <Typography>RM{calculateSST().toFixed(2)}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6">Total:</Typography>
                    <Typography variant="h6" color="primary">
                      RM{calculateTotal().toFixed(2)}
                    </Typography>
                  </Box>
                </Card>
              </Grid>

              {/* Notes */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </Grid>

              {/* Actions */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={resetForm}
                  >
                    Reset
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleCreateInvoice}
                    disabled={loading}
                    sx={{ backgroundColor: '#2E7D32', '&:hover': { backgroundColor: '#1B5E20' } }}
                  >
                    {loading ? 'Creating...' : 'Create Invoice'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Analytics Tab */}
      <TabPanel value={tabValue} index={2}>
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Invoice Analytics
            </Typography>
            <Alert severity="info">
              Invoice analytics and reporting features will be displayed here. This will include revenue trends, customer analysis, SST reporting, and emergency-related invoice tracking.
            </Alert>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Invoice View Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Invoice Details - {selectedInvoice?.invoice_number}
        </DialogTitle>
        <DialogContent>
          {selectedInvoice && (
            <Box>
              {/* Invoice details would be displayed here */}
              <Typography variant="body1">
                Customer: {selectedInvoice.customer_name}
              </Typography>
              <Typography variant="body1">
                Total: RM{parseFloat(selectedInvoice.total_amount).toFixed(2)}
              </Typography>
              <Typography variant="body1">
                Status: {selectedInvoice.status}
              </Typography>
              {selectedInvoice.is_emergency_related && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  This is an emergency-related invoice.
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EInvoice;