const express = require('express');
const router = express.Router();
const eInvoiceService = require('../services/eInvoiceService');
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

module.exports = router;