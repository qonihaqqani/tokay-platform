const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { db } = require('../config/database');
const logger = require('../utils/logger');

// Get user's business
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const query = `
      SELECT * FROM businesses 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `;
    
    const result = await db.query(query, [userId]);
    
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching businesses:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new business
router.post('/', [
  body('business_name').isLength({ min: 2 }).withMessage('Business name is required'),
  body('business_type').isIn(['restaurant', 'retail', 'service', 'manufacturing', 'other']).withMessage('Invalid business type'),
  body('monthly_revenue').optional().isFloat({ min: 0 }).withMessage('Revenue must be positive'),
  body('monthly_expenses').optional().isFloat({ min: 0 }).withMessage('Expenses must be positive')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const {
      business_name,
      business_type,
      description,
      address,
      phone_number,
      email,
      monthly_revenue,
      monthly_expenses,
      employee_count
    } = req.body;

    const query = `
      INSERT INTO businesses (
        user_id, business_name, business_type, description, address,
        phone_number, email, monthly_revenue, monthly_expenses, employee_count
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const values = [
      userId, business_name, business_type, description, address,
      phone_number, email, monthly_revenue, monthly_expenses, employee_count
    ];
    
    const result = await db.query(query, values);
    
    res.status(201).json({
      message: 'Business created successfully',
      business: result.rows[0]
    });
  } catch (error) {
    logger.error('Error creating business:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update business
router.put('/:businessId', [
  body('business_name').optional().isLength({ min: 2 }).withMessage('Business name must be at least 2 characters'),
  body('business_type').optional().isIn(['restaurant', 'retail', 'service', 'manufacturing', 'other']).withMessage('Invalid business type'),
  body('monthly_revenue').optional().isFloat({ min: 0 }).withMessage('Revenue must be positive'),
  body('monthly_expenses').optional().isFloat({ min: 0 }).withMessage('Expenses must be positive')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const businessId = req.params.businessId;
    const {
      business_name,
      business_type,
      description,
      address,
      phone_number,
      email,
      monthly_revenue,
      monthly_expenses,
      employee_count
    } = req.body;

    // First check if user owns this business
    const ownershipQuery = 'SELECT id FROM businesses WHERE id = $1 AND user_id = $2';
    const ownershipResult = await db.query(ownershipQuery, [businessId, userId]);
    
    if (ownershipResult.rows.length === 0) {
      return res.status(404).json({ message: 'Business not found or access denied' });
    }

    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (business_name !== undefined) {
      updateFields.push(`business_name = $${paramIndex++}`);
      updateValues.push(business_name);
    }
    if (business_type !== undefined) {
      updateFields.push(`business_type = $${paramIndex++}`);
      updateValues.push(business_type);
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      updateValues.push(description);
    }
    if (address !== undefined) {
      updateFields.push(`address = $${paramIndex++}`);
      updateValues.push(address);
    }
    if (phone_number !== undefined) {
      updateFields.push(`phone_number = $${paramIndex++}`);
      updateValues.push(phone_number);
    }
    if (email !== undefined) {
      updateFields.push(`email = $${paramIndex++}`);
      updateValues.push(email);
    }
    if (monthly_revenue !== undefined) {
      updateFields.push(`monthly_revenue = $${paramIndex++}`);
      updateValues.push(monthly_revenue);
    }
    if (monthly_expenses !== undefined) {
      updateFields.push(`monthly_expenses = $${paramIndex++}`);
      updateValues.push(monthly_expenses);
    }
    if (employee_count !== undefined) {
      updateFields.push(`employee_count = $${paramIndex++}`);
      updateValues.push(employee_count);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(businessId);

    const query = `
      UPDATE businesses 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    const result = await db.query(query, updateValues);
    
    res.json({
      message: 'Business updated successfully',
      business: result.rows[0]
    });
  } catch (error) {
    logger.error('Error updating business:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete business
router.delete('/:businessId', async (req, res) => {
  try {
    const userId = req.user.id;
    const businessId = req.params.businessId;

    // First check if user owns this business
    const ownershipQuery = 'SELECT id FROM businesses WHERE id = $1 AND user_id = $2';
    const ownershipResult = await db.query(ownershipQuery, [businessId, userId]);
    
    if (ownershipResult.rows.length === 0) {
      return res.status(404).json({ message: 'Business not found or access denied' });
    }

    await db.query('DELETE FROM businesses WHERE id = $1', [businessId]);
    
    res.json({ message: 'Business deleted successfully' });
  } catch (error) {
    logger.error('Error deleting business:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get business dashboard summary
router.get('/:businessId/dashboard', async (req, res) => {
  try {
    const userId = req.user.id;
    const businessId = req.params.businessId;

    // Check ownership
    const ownershipQuery = 'SELECT id FROM businesses WHERE id = $1 AND user_id = $2';
    const ownershipResult = await db.query(ownershipQuery, [businessId, userId]);
    
    if (ownershipResult.rows.length === 0) {
      return res.status(404).json({ message: 'Business not found or access denied' });
    }

    // Get business info
    const businessQuery = 'SELECT * FROM businesses WHERE id = $1';
    const businessResult = await db.query(businessQuery, [businessId]);
    
    // Get recent invoices count
    const invoicesQuery = `
      SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total
      FROM invoices 
      WHERE business_id = $1 AND created_at >= NOW() - INTERVAL '30 days'
    `;
    const invoicesResult = await db.query(invoicesQuery, [businessId]);
    
    // Get emergency fund info
    const fundQuery = `
      SELECT current_balance, target_balance, monthly_contribution
      FROM emergency_funds 
      WHERE business_id = $1
    `;
    const fundResult = await db.query(fundQuery, [businessId]);

    const dashboard = {
      business: businessResult.rows[0],
      recent_invoices: {
        count: parseInt(invoicesResult.rows[0].count),
        total: parseFloat(invoicesResult.rows[0].total)
      },
      emergency_fund: fundResult.rows[0] || null
    };
    
    res.json(dashboard);
  } catch (error) {
    logger.error('Error fetching business dashboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;