const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get user's emergency fund details
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const query = `
      SELECT 
        ef.*,
        b.business_name,
        b.business_type,
        b.monthly_revenue
      FROM emergency_funds ef
      JOIN businesses b ON ef.business_id = b.id
      WHERE b.user_id = $1
    `;
    
    const result = await db.query(query, [userId]);
    
    if (result.rows.length === 0) {
      // Create default emergency fund if doesn't exist
      const businessQuery = 'SELECT id FROM businesses WHERE user_id = $1 LIMIT 1';
      const businessResult = await db.query(businessQuery, [userId]);
      
      if (businessResult.rows.length > 0) {
        const createFundQuery = `
          INSERT INTO emergency_funds (business_id, current_balance, target_balance, monthly_contribution)
          VALUES ($1, 0, 5000, 500)
          RETURNING *
        `;
        const newFund = await db.query(createFundQuery, [businessResult.rows[0].id]);
        return res.json(newFund.rows[0]);
      }
      
      return res.status(404).json({ message: 'Business not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching emergency fund:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update emergency fund contribution
router.put('/contribution', [
  auth,
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be greater than 0'),
  body('frequency').isIn(['daily', 'weekly', 'monthly']).withMessage('Invalid frequency')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, frequency } = req.body;
    const userId = req.user.id;

    // Get business ID
    const businessQuery = 'SELECT id FROM businesses WHERE user_id = $1 LIMIT 1';
    const businessResult = await db.query(businessQuery, [userId]);
    
    if (businessResult.rows.length === 0) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const businessId = businessResult.rows[0].id;

    // Update emergency fund
    const updateQuery = `
      UPDATE emergency_funds 
      SET monthly_contribution = $1, contribution_frequency = $2, updated_at = CURRENT_TIMESTAMP
      WHERE business_id = $3
      RETURNING *
    `;
    
    const result = await db.query(updateQuery, [amount, frequency, businessId]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating contribution:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add manual contribution to emergency fund
router.post('/contribute', [
  auth,
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be greater than 0'),
  body('payment_method').isIn(['fpx', 'tng', 'grabpay', 'credit_card', 'bank_transfer']).withMessage('Invalid payment method')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, payment_method } = req.body;
    const userId = req.user.id;

    // Get business and emergency fund
    const query = `
      SELECT ef.id, ef.current_balance, b.id as business_id
      FROM emergency_funds ef
      JOIN businesses b ON ef.business_id = b.id
      WHERE b.user_id = $1
    `;
    
    const result = await db.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Emergency fund not found' });
    }

    const fund = result.rows[0];
    const newBalance = parseFloat(fund.current_balance) + parseFloat(amount);

    // Update balance
    const updateQuery = `
      UPDATE emergency_funds 
      SET current_balance = $1, last_contribution = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `;
    
    await db.query(updateQuery, [newBalance, fund.id]);

    // Record transaction
    const transactionQuery = `
      INSERT INTO emergency_fund_transactions (fund_id, amount, transaction_type, payment_method, status)
      VALUES ($1, $2, 'contribution', $3, 'completed')
      RETURNING *
    `;
    
    const transaction = await db.query(transactionQuery, [fund.id, amount, payment_method]);

    res.json({
      message: 'Contribution successful',
      new_balance: newBalance,
      transaction: transaction.rows[0]
    });
  } catch (error) {
    console.error('Error processing contribution:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Request emergency fund withdrawal
router.post('/withdraw', [
  auth,
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be greater than 0'),
  body('reason').isLength({ min: 10 }).withMessage('Reason must be at least 10 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, reason } = req.body;
    const userId = req.user.id;

    // Get emergency fund
    const query = `
      SELECT ef.id, ef.current_balance, b.id as business_id
      FROM emergency_funds ef
      JOIN businesses b ON ef.business_id = b.id
      WHERE b.user_id = $1
    `;
    
    const result = await db.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Emergency fund not found' });
    }

    const fund = result.rows[0];

    // Check if sufficient balance
    if (parseFloat(fund.current_balance) < parseFloat(amount)) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Create withdrawal request (pending approval)
    const withdrawalQuery = `
      INSERT INTO emergency_fund_withdrawals (fund_id, amount, reason, status, requested_at)
      VALUES ($1, $2, $3, 'pending', CURRENT_TIMESTAMP)
      RETURNING *
    `;
    
    const withdrawal = await db.query(withdrawalQuery, [fund.id, amount, reason]);

    res.json({
      message: 'Withdrawal request submitted for review',
      withdrawal: withdrawal.rows[0]
    });
  } catch (error) {
    console.error('Error processing withdrawal request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get transaction history
router.get('/transactions', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;

    const query = `
      SELECT eft.*, ef.business_id
      FROM emergency_fund_transactions eft
      JOIN emergency_funds ef ON eft.fund_id = ef.id
      JOIN businesses b ON ef.business_id = b.id
      WHERE b.user_id = $1
      ORDER BY eft.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await db.query(query, [userId, limit, offset]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get emergency fund recommendations
router.get('/recommendations', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get business data
    const businessQuery = `
      SELECT b.monthly_revenue, b.monthly_expenses, b.business_type, b.employee_count,
             ef.current_balance, ef.target_balance, ef.monthly_contribution
      FROM businesses b
      LEFT JOIN emergency_funds ef ON b.id = ef.business_id
      WHERE b.user_id = $1
    `;
    
    const businessResult = await db.query(businessQuery, [userId]);
    
    if (businessResult.rows.length === 0) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const business = businessResult.rows[0];
    
    // Calculate recommendations
    const monthlyExpenses = parseFloat(business.monthly_expenses) || 0;
    const recommendedTarget = monthlyExpenses * 3; // 3 months of expenses
    const recommendedMonthly = monthlyExpenses * 0.1; // 10% of monthly expenses
    const currentBalance = parseFloat(business.current_balance) || 0;
    const targetBalance = parseFloat(business.target_balance) || 0;
    
    const recommendations = {
      target_balance: recommendedTarget,
      monthly_contribution: recommendedMonthly,
      current_percentage: (currentBalance / recommendedTarget) * 100,
      time_to_target: recommendedTarget > currentBalance ? 
        Math.ceil((recommendedTarget - currentBalance) / recommendedMonthly) : 0,
      risk_level: currentBalance < monthlyExpenses ? 'HIGH' : 
                  currentBalance < monthlyExpenses * 2 ? 'MEDIUM' : 'LOW',
      suggestions: []
    };

    // Generate suggestions
    if (currentBalance < monthlyExpenses) {
      recommendations.suggestions.push('Your emergency fund is critically low. Consider increasing contributions immediately.');
    }
    
    if (recommendedMonthly > parseFloat(business.monthly_contribution || 0)) {
      recommendations.suggestions.push(`Consider increasing your monthly contribution to RM${recommendedMonthly.toFixed(2)} for better protection.`);
    }
    
    if (targetBalance < recommendedTarget) {
      recommendations.suggestions.push(`Your target should be at least RM${recommendedTarget.toFixed(2)} (3 months of expenses).`);
    }

    res.json(recommendations);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;