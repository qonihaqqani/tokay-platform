const { pool } = require('../config/database');
const logger = require('../utils/logger');

class PaymentService {
  constructor() {
    this.mockPaymentMethods = {
      fpx: {
        name: 'FPX',
        banks: [
          'Maybank2u', 'CIMB Clicks', 'Public Bank', 'RHB Bank', 
          'Hong Leong Bank', 'AmBank', 'HSBC Bank', 'Standard Chartered',
          'UOB Bank', 'OCBC Bank', 'Bank Islam', 'Bank Muamalat'
        ]
      },
      tng: {
        name: 'Touch \'n Go eWallet',
        type: 'ewallet'
      },
      grabpay: {
        name: 'GrabPay',
        type: 'ewallet'
      },
      credit_card: {
        name: 'Credit/Debit Card',
        type: 'card'
      }
    };
  }

  async initiatePayment(userId, amount, paymentMethod, description) {
    try {
      const transactionId = `MOCK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create mock transaction record
      const query = `
        INSERT INTO emergency_fund_transactions 
        (user_id, emergency_fund_id, transaction_type, amount, payment_method, status, transaction_reference, description)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      
      // Get user's emergency fund
      const fundQuery = 'SELECT id FROM emergency_funds WHERE user_id = $1';
      const fundResult = await pool.query(fundQuery, [userId]);
      const emergencyFundId = fundResult.rows[0]?.id;

      const values = [
        userId,
        emergencyFundId,
        'contribution',
        amount,
        paymentMethod,
        'pending',
        transactionId,
        description || 'Mock payment contribution'
      ];

      const result = await pool.query(query, values);
      
      logger.info(`Mock payment initiated: ${transactionId} for user ${userId}, amount: RM${amount}`);
      
      return {
        success: true,
        transactionId,
        amount,
        paymentMethod,
        status: 'pending',
        redirectUrl: `/api/payments/mock/checkout/${transactionId}`
      };
    } catch (error) {
      logger.error('Error initiating mock payment:', error);
      throw error;
    }
  }

  async processMockPayment(transactionId, paymentDetails) {
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update transaction status
      const updateQuery = `
        UPDATE emergency_fund_transactions 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE transaction_reference = $2
        RETURNING *
      `;

      const result = await pool.query(updateQuery, ['completed', transactionId]);
      const transaction = result.rows[0];

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Update emergency fund balance
      const updateFundQuery = `
        UPDATE emergency_funds 
        SET current_balance = current_balance + $1, total_contributed = total_contributed + $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `;

      await pool.query(updateFundQuery, [transaction.amount, transaction.emergency_fund_id]);

      logger.info(`Mock payment completed: ${transactionId}`);
      
      return {
        success: true,
        transactionId,
        status: 'completed',
        amount: transaction.amount,
        message: 'Payment processed successfully'
      };
    } catch (error) {
      logger.error('Error processing mock payment:', error);
      throw error;
    }
  }

  async getPaymentMethods() {
    return Object.keys(this.mockPaymentMethods).map(key => ({
      id: key,
      ...this.mockPaymentMethods[key]
    }));
  }

  async getTransactionStatus(transactionId) {
    try {
      const query = 'SELECT * FROM emergency_fund_transactions WHERE transaction_reference = $1';
      const result = await pool.query(query, [transactionId]);
      
      if (result.rows.length === 0) {
        return { success: false, message: 'Transaction not found' };
      }

      const transaction = result.rows[0];
      
      return {
        success: true,
        transactionId,
        status: transaction.status,
        amount: transaction.amount,
        paymentMethod: transaction.payment_method,
        createdAt: transaction.created_at
      };
    } catch (error) {
      logger.error('Error getting transaction status:', error);
      throw error;
    }
  }

  generateMockCheckoutUrl(transactionId) {
    return `/api/payments/mock/checkout/${transactionId}`;
  }

  validatePaymentMethod(methodId) {
    return this.mockPaymentMethods.hasOwnProperty(methodId);
  }
}

module.exports = new PaymentService();