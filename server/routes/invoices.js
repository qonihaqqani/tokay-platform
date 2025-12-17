const express = require('express');
const router = express.Router();
const eInvoiceService = require('../services/eInvoiceService');
const salesAnalyticsService = require('../services/salesAnalyticsService');
const { body, validationResult } = require('express-validator');
const logger = require('../utils/logger');

// Create new invoice
router.post('/', [
  body('customer_name').notEmpty().withMessage('Customer name is required'),
  body('invoice_date').isISO8601().withMessage('Valid invoice date is required'),
  body('due_date').isISO8601().withMessage('Valid due date is required'),
  body('line_items').isArray({ min: 1 }).withMessage('At least one line item is required'),
  body('line_items.*.description').notEmpty().withMessage('Item description is required'),
  body('line_items.*.quantity').isFloat({ min: 0.01 }).withMessage('Quantity must be greater than 0'),
  body('line_items.*.unit_price').isFloat({ min: 0 }).withMessage('Unit price must be non-negative')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const businessId = req.body.business_id || req.user.business_id;

    if (!businessId) {
      return res.status(400).json({
        success: false,
        message: 'Business ID is required'
      });
    }

    const invoice = await eInvoiceService.createInvoice(userId, businessId, req.body);

    // Trigger analytics update for the sale date
    try {
      await salesAnalyticsService.updateDailySalesAnalytics(
        businessId,
        new Date().toISOString().split('T')[0]
      );
    } catch (analyticsError) {
      logger.warn('Failed to update analytics:', analyticsError);
      // Don't fail the invoice creation if analytics update fails
    }

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice
    });

  } catch (error) {
    logger.error('Error creating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create invoice',
      error: error.message
    });
  }
});

// Get invoices for a business
router.get('/', async (req, res) => {
  try {
    const businessId = req.query.business_id || req.user.business_id;
    
    if (!businessId) {
      return res.status(400).json({
        success: false,
        message: 'Business ID is required'
      });
    }

    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      status: req.query.status,
      customerEmail: req.query.customer_email,
      dateFrom: req.query.date_from,
      dateTo: req.query.date_to,
      isEmergencyRelated: req.query.is_emergency_related
    };

    const result = await eInvoiceService.getInvoices(businessId, options);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoices',
      error: error.message
    });
  }
});

// Get single invoice
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get invoice with business verification
    const query = `
      SELECT i.*, b.user_id as business_owner_id
      FROM invoices i
      LEFT JOIN businesses b ON i.business_id = b.id
      WHERE i.id = $1
    `;
    
    const result = await require('../config/database').pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    const invoice = result.rows[0];

    // Verify ownership
    if (invoice.business_owner_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: invoice
    });

  } catch (error) {
    logger.error('Error fetching invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoice',
      error: error.message
    });
  }
});

// Update invoice
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify ownership first
    const ownershipQuery = `
      SELECT i.*, b.user_id as business_owner_id
      FROM invoices i
      LEFT JOIN businesses b ON i.business_id = b.id
      WHERE i.id = $1 AND b.user_id = $2
    `;
    
    const ownershipResult = await require('../config/database').pool.query(ownershipQuery, [id, userId]);
    
    if (ownershipResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found or access denied'
      });
    }

    const invoice = ownershipResult.rows[0];

    // Only allow updates if invoice is in draft status
    if (invoice.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft invoices can be updated'
      });
    }

    // Update invoice (simplified - in production, this would be more comprehensive)
    const updateQuery = `
      UPDATE invoices 
      SET customer_name = COALESCE($1, customer_name),
          customer_email = COALESCE($2, customer_email),
          customer_phone = COALESCE($3, customer_phone),
          customer_address = COALESCE($4, customer_address),
          due_date = COALESCE($5, due_date),
          notes = COALESCE($6, notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `;

    const updateValues = [
      req.body.customer_name,
      req.body.customer_email,
      req.body.customer_phone,
      req.body.customer_address,
      req.body.due_date,
      req.body.notes ? JSON.stringify(req.body.notes) : null,
      id
    ];

    const updateResult = await require('../config/database').pool.query(updateQuery, updateValues);

    res.json({
      success: true,
      message: 'Invoice updated successfully',
      data: updateResult.rows[0]
    });

  } catch (error) {
    logger.error('Error updating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update invoice',
      error: error.message
    });
  }
});

// Submit invoice to LHDN
router.post('/:id/submit-lhdn', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const ownershipQuery = `
      SELECT i.*, b.user_id as business_owner_id
      FROM invoices i
      LEFT JOIN businesses b ON i.business_id = b.id
      WHERE i.id = $1 AND b.user_id = $2
    `;
    
    const ownershipResult = await require('../config/database').pool.query(ownershipQuery, [id, userId]);
    
    if (ownershipResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found or access denied'
      });
    }

    const result = await eInvoiceService.submitToLHDN(id);

    res.json({
      success: true,
      message: 'Invoice submitted to LHDN successfully',
      data: result
    });

  } catch (error) {
    logger.error('Error submitting invoice to LHDN:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit invoice to LHDN',
      error: error.message
    });
  }
});

// Generate invoice PDF
router.post('/:id/generate-pdf', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const ownershipQuery = `
      SELECT i.*, b.user_id as business_owner_id
      FROM invoices i
      LEFT JOIN businesses b ON i.business_id = b.id
      WHERE i.id = $1 AND b.user_id = $2
    `;
    
    const ownershipResult = await require('../config/database').pool.query(ownershipQuery, [id, userId]);
    
    if (ownershipResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found or access denied'
      });
    }

    const result = await eInvoiceService.generateInvoicePDF(id);

    res.json({
      success: true,
      message: 'PDF generated successfully',
      data: result
    });

  } catch (error) {
    logger.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF',
      error: error.message
    });
  }
});

// Send invoice to customer
router.post('/:id/send', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const ownershipQuery = `
      SELECT i.*, b.user_id as business_owner_id
      FROM invoices i
      LEFT JOIN businesses b ON i.business_id = b.id
      WHERE i.id = $1 AND b.user_id = $2
    `;
    
    const ownershipResult = await require('../config/database').pool.query(ownershipQuery, [id, userId]);
    
    if (ownershipResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found or access denied'
      });
    }

    const options = {
      sendEmail: req.body.send_email !== false,
      sendWhatsApp: req.body.send_whatsapp === true,
      customMessage: req.body.custom_message
    };

    const result = await eInvoiceService.sendInvoice(id, options);

    res.json({
      success: true,
      message: 'Invoice sent successfully',
      data: result
    });

  } catch (error) {
    logger.error('Error sending invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send invoice',
      error: error.message
    });
  }
});

// Delete invoice (only draft invoices)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify ownership and status
    const ownershipQuery = `
      SELECT i.*, b.user_id as business_owner_id
      FROM invoices i
      LEFT JOIN businesses b ON i.business_id = b.id
      WHERE i.id = $1 AND b.user_id = $2 AND i.status = 'draft'
    `;
    
    const ownershipResult = await require('../config/database').pool.query(ownershipQuery, [id, userId]);
    
    if (ownershipResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Draft invoice not found or access denied'
      });
    }

    // Delete invoice
    await require('../config/database').pool.query('DELETE FROM invoices WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Invoice deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete invoice',
      error: error.message
    });
  }
});

// Get invoice with line items
router.get('/:id/line-items', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify invoice belongs to user's business
    const invoiceCheck = await require('../config/database').pool.query(
      `SELECT i.id FROM invoices i
       JOIN businesses b ON i.business_id = b.id
       WHERE i.id = $1 AND b.user_id = $2`,
      [id, userId]
    );

    if (invoiceCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    const lineItemsQuery = `
      SELECT
        id,
        product_code,
        product_name,
        product_description,
        quantity,
        unit_price,
        discount_amount,
        tax_amount,
        line_total,
        category,
        supplier,
        cost_price,
        metadata,
        created_at
      FROM invoice_line_items
      WHERE invoice_id = $1
      ORDER BY created_at ASC
    `;

    const result = await require('../config/database').pool.query(lineItemsQuery, [id]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Error fetching invoice line items:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching invoice line items',
      error: error.message
    });
  }
});

// Add line items to existing invoice
router.post('/:id/line-items', [
  body('line_items').isArray({ min: 1 }).withMessage('Line items array is required'),
  body('line_items.*.product_name').notEmpty().withMessage('Product name is required'),
  body('line_items.*.quantity').isFloat({ min: 0.01 }).withMessage('Quantity must be greater than 0'),
  body('line_items.*.unit_price').isFloat({ min: 0 }).withMessage('Unit price must be non-negative')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { lineItems } = req.body;
    const userId = req.user.id;

    // Verify invoice belongs to user's business and is not finalized
    const invoiceCheck = await require('../config/database').pool.query(
      `SELECT i.id, i.business_id, i.status FROM invoices i
       JOIN businesses b ON i.business_id = b.id
       WHERE i.id = $1 AND b.user_id = $2`,
      [id, userId]
    );

    if (invoiceCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    const invoice = invoiceCheck.rows[0];
    if (invoice.status === 'paid' || invoice.status === 'sent') {
      return res.status(400).json({
        success: false,
        message: 'Cannot add line items to finalized invoice'
      });
    }

    // Insert line items
    const insertedItems = [];
    let newTotal = 0;

    for (const item of lineItems) {
      const lineTotal = (item.quantity || 1) * (item.unit_price || 0) - (item.discount_amount || 0);
      newTotal += lineTotal;

      const insertQuery = `
        INSERT INTO invoice_line_items (
          invoice_id, product_code, product_name, product_description,
          quantity, unit_price, discount_amount, tax_amount,
          line_total, category, supplier, cost_price, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `;

      const values = [
        id,
        item.product_code || null,
        item.product_name,
        item.product_description || null,
        item.quantity || 1,
        item.unit_price,
        item.discount_amount || 0,
        item.tax_amount || 0,
        lineTotal,
        item.category || null,
        item.supplier || null,
        item.cost_price || null,
        JSON.stringify(item.metadata || {})
      ];

      const result = await require('../config/database').pool.query(insertQuery, values);
      insertedItems.push(result.rows[0]);
    }

    // Update invoice total
    await require('../config/database').pool.query(
      'UPDATE invoices SET total_amount = total_amount + $1, updated_at = NOW() WHERE id = $2',
      [newTotal, id]
    );

    res.json({
      success: true,
      data: insertedItems,
      message: 'Line items added successfully'
    });
  } catch (error) {
    logger.error('Error adding line items:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding line items',
      error: error.message
    });
  }
});

// Get frequently sold products for quick sale
router.get('/quick-sale/frequent-items', async (req, res) => {
  try {
    const businessId = req.query.business_id || req.user.business_id;
    const { days = 30, limit = 10 } = req.query;

    if (!businessId) {
      return res.status(400).json({
        success: false,
        message: 'Business ID is required'
      });
    }

    const query = `
      SELECT
        ili.product_code,
        ili.product_name,
        ili.category,
        ili.unit_price,
        COUNT(*) as frequency,
        SUM(ili.quantity) as total_quantity,
        SUM(ili.line_total) as total_revenue,
        AVG(ili.unit_price) as avg_price
      FROM invoice_line_items ili
      JOIN invoices i ON ili.invoice_id = i.id
      WHERE i.business_id = $1
        AND i.created_at >= NOW() - INTERVAL '${days} days'
        AND i.status = 'paid'
      GROUP BY ili.product_code, ili.product_name, ili.category, ili.unit_price
      ORDER BY frequency DESC, total_revenue DESC
      LIMIT $2
    `;

    const result = await require('../config/database').pool.query(query, [businessId, parseInt(limit)]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Error fetching frequent items:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching frequent items',
      error: error.message
    });
  }
});

// Create quick sale (simplified invoice creation)
router.post('/quick-sale', [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.product_name').notEmpty().withMessage('Product name is required'),
  body('items.*.unit_price').isFloat({ min: 0 }).withMessage('Unit price is required'),
  body('items.*.quantity').isFloat({ min: 0.01 }).withMessage('Quantity is required'),
  body('payment_method').isIn(['cash', 'fpx', 'tng', 'grabpay', 'credit_card']).withMessage('Valid payment method is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const businessId = req.body.business_id || req.user.business_id;
    const { items, payment_method, customer_name = 'Walk-in Customer' } = req.body;

    if (!businessId) {
      return res.status(400).json({
        success: false,
        message: 'Business ID is required'
      });
    }

    // Calculate total
    const totalAmount = items.reduce((sum, item) => {
      return sum + (item.unit_price * item.quantity);
    }, 0);

    // Create quick sale invoice
    const invoiceData = {
      business_id: businessId,
      customer_name,
      invoice_date: new Date().toISOString(),
      due_date: new Date().toISOString(),
      total_amount: totalAmount,
      status: 'paid',
      payment_method,
      notes: JSON.stringify({ quick_sale: true, payment_method })
    };

    // Convert items to line items format
    const lineItems = items.map(item => ({
      product_code: item.product_code || null,
      product_name: item.product_name,
      product_description: item.product_description || null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_amount: item.discount_amount || 0,
      tax_amount: item.tax_amount || 0,
      category: item.category || null,
      cost_price: item.cost_price || null,
      metadata: item.metadata || {}
    }));

    const invoice = await eInvoiceService.createInvoice(userId, businessId, {
      ...invoiceData,
      line_items: lineItems
    });

    // Trigger analytics update
    try {
      await salesAnalyticsService.updateDailySalesAnalytics(
        businessId,
        new Date().toISOString().split('T')[0]
      );
    } catch (analyticsError) {
      logger.warn('Failed to update analytics:', analyticsError);
    }

    res.status(201).json({
      success: true,
      message: 'Quick sale created successfully',
      data: invoice
    });

  } catch (error) {
    logger.error('Error creating quick sale:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create quick sale',
      error: error.message
    });
  }
});

module.exports = router;