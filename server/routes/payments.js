const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { db } = require('../config/database');
const logger = require('../utils/logger');
const paymentService = require('../services/paymentService');

// Process payment
router.post('/process', [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('payment_method').isIn(['fpx', 'tng', 'grabpay', 'credit_card', 'bank_transfer']).withMessage('Invalid payment method'),
  body('invoice_id').optional().isUUID().withMessage('Invalid invoice ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { amount, payment_method, invoice_id, description } = req.body;

    // Get user's business
    const businessQuery = 'SELECT id FROM businesses WHERE user_id = $1 LIMIT 1';
    const businessResult = await db.query(businessQuery, [userId]);
    
    if (businessResult.rows.length === 0) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const businessId = businessResult.rows[0].id;

    // Process payment using payment service
    const paymentResult = await paymentService.processPayment({
      businessId,
      userId,
      amount,
      paymentMethod: payment_method,
      invoiceId: invoice_id,
      description: description || `Payment of RM${amount}`
    });

    res.json({
      message: 'Payment processed successfully',
      payment: paymentResult
    });
  } catch (error) {
    logger.error('Error processing payment:', error);
    res.status(500).json({ message: 'Payment processing failed', error: error.message });
  }
});

// Get payment history
router.get('/history', async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0, status } = req.query;

    let query = `
      SELECT p.*, b.business_name
      FROM payments p
      JOIN businesses b ON p.business_id = b.id
      WHERE b.user_id = $1
    `;
    const params = [userId];

    if (status) {
      query += ` AND p.status = $2`;
      params.push(status);
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching payment history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payment by ID
router.get('/:paymentId', async (req, res) => {
  try {
    const userId = req.user.id;
    const paymentId = req.params.paymentId;

    const query = `
      SELECT p.*, b.business_name
      FROM payments p
      JOIN businesses b ON p.business_id = b.id
      WHERE p.id = $1 AND b.user_id = $2
    `;
    
    const result = await db.query(query, [paymentId, userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error fetching payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Refund payment
router.post('/:paymentId/refund', [
  body('amount').isFloat({ min: 0.01 }).withMessage('Refund amount must be greater than 0'),
  body('reason').isLength({ min: 5 }).withMessage('Refund reason must be at least 5 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const paymentId = req.params.paymentId;
    const { amount, reason } = req.body;

    // Get payment details and verify ownership
    const paymentQuery = `
      SELECT p.*, b.user_id
      FROM payments p
      JOIN businesses b ON p.business_id = b.id
      WHERE p.id = $1 AND b.user_id = $2
    `;
    
    const paymentResult = await db.query(paymentQuery, [paymentId, userId]);
    
    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const payment = paymentResult.rows[0];

    // Check if payment can be refunded
    if (payment.status !== 'completed') {
      return res.status(400).json({ message: 'Payment cannot be refunded' });
    }

    if (parseFloat(amount) > parseFloat(payment.amount)) {
      return res.status(400).json({ message: 'Refund amount cannot exceed payment amount' });
    }

    // Process refund
    const refundResult = await paymentService.processRefund({
      paymentId,
      amount,
      reason,
      businessId: payment.business_id,
      userId
    });

    res.json({
      message: 'Refund processed successfully',
      refund: refundResult
    });
  } catch (error) {
    logger.error('Error processing refund:', error);
    res.status(500).json({ message: 'Refund processing failed', error: error.message });
  }
});

// Get payment methods
router.get('/methods/available', async (req, res) => {
  try {
    const paymentMethods = [
      {
        id: 'fpx',
        name: 'FPX',
        description: 'Online banking transfer',
        enabled: true,
        icon: 'bank'
      },
      {
        id: 'tng',
        name: 'Touch \'n Go eWallet',
        description: 'Mobile wallet payment',
        enabled: true,
        icon: 'wallet'
      },
      {
        id: 'grabpay',
        name: 'GrabPay',
        description: 'Mobile wallet payment',
        enabled: true,
        icon: 'wallet'
      },
      {
        id: 'credit_card',
        name: 'Credit/Debit Card',
        description: 'Card payment',
        enabled: true,
        icon: 'card'
      },
      {
        id: 'bank_transfer',
        name: 'Bank Transfer',
        description: 'Manual bank transfer',
        enabled: true,
        icon: 'bank'
      }
    ];

    res.json(paymentMethods);
  } catch (error) {
    logger.error('Error fetching payment methods:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payment statistics
router.get('/statistics/summary', async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '30' } = req.query; // days

    const query = `
      SELECT 
        COUNT(*) as total_payments,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending_amount,
        COALESCE(SUM(CASE WHEN status = 'failed' THEN amount ELSE 0 END), 0) as failed_amount,
        payment_method,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_payments
      FROM payments p
      JOIN businesses b ON p.business_id = b.id
      WHERE b.user_id = $1 
        AND p.created_at >= NOW() - INTERVAL '${period} days'
      GROUP BY payment_method
      ORDER BY total_revenue DESC
    `;
    
    const result = await db.query(query, [userId]);
    
    // Calculate totals
    const totals = result.rows.reduce((acc, row) => {
      acc.total_payments += parseInt(row.total_payments);
      acc.total_revenue += parseFloat(row.total_revenue);
      acc.pending_amount += parseFloat(row.pending_amount);
      acc.failed_amount += parseFloat(row.failed_amount);
      acc.successful_payments += parseInt(row.successful_payments);
      return acc;
    }, {
      total_payments: 0,
      total_revenue: 0,
      pending_amount: 0,
      failed_amount: 0,
      successful_payments: 0
    });

    res.json({
      period: `${period} days`,
      totals,
      by_method: result.rows
    });
  } catch (error) {
    logger.error('Error fetching payment statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;