const { pool } = require('../config/database');
const logger = require('../utils/logger');

class ReceiptAnalysisService {
  constructor() {
    // Contribution rules based on business categories and spending patterns
    this.contributionRules = {
      // High-priority expenses - suggest higher contributions
      'Utilities': { minPercentage: 0.05, maxPercentage: 0.10, priority: 'high' },
      'Raw Materials': { minPercentage: 0.03, maxPercentage: 0.07, priority: 'medium' },
      'Office Supplies': { minPercentage: 0.02, maxPercentage: 0.05, priority: 'low' },
      'Food Supplies': { minPercentage: 0.04, maxPercentage: 0.08, priority: 'medium' },
      'Groceries': { minPercentage: 0.02, maxPercentage: 0.04, priority: 'low' },
      'default': { minPercentage: 0.01, maxPercentage: 0.03, priority: 'low' }
    };

    // Risk categories that trigger emergency fund recommendations
    this.riskCategories = [
      'Utilities', 'Raw Materials', 'Inventory', 'Equipment Maintenance'
    ];
  }

  /**
   * Analyze receipt and generate emergency fund contribution suggestion
   */
  async analyzeReceiptForEmergencyFund(receiptId, userId, businessId) {
    try {
      // Get receipt data
      const receiptQuery = `
        SELECT * FROM receipts 
        WHERE id = $1 AND user_id = $2 AND business_id = $3
      `;
      const receiptResult = await pool.query(receiptQuery, [receiptId, userId, businessId]);
      
      if (receiptResult.rows.length === 0) {
        throw new Error('Receipt not found');
      }

      const receipt = receiptResult.rows[0];
      
      // Get business's emergency fund info
      const fundQuery = `
        SELECT * FROM emergency_funds 
        WHERE user_id = $1 AND business_id = $2
      `;
      const fundResult = await pool.query(fundQuery, [userId, businessId]);
      const emergencyFund = fundResult.rows[0];

      if (!emergencyFund) {
        throw new Error('Emergency fund not found for this business');
      }

      // Analyze the receipt
      const analysis = this.performReceiptAnalysis(receipt, emergencyFund);
      
      // Save analysis result
      await this.saveAnalysisResult(receiptId, analysis);

      logger.info(`Receipt analysis completed for receipt ${receiptId}`, analysis);
      
      return {
        success: true,
        receiptId,
        analysis,
        suggestion: this.generateContributionSuggestion(analysis, emergencyFund)
      };

    } catch (error) {
      logger.error('Error analyzing receipt for emergency fund:', error);
      throw error;
    }
  }

  /**
   * Perform detailed analysis of the receipt
   */
  performReceiptAnalysis(receipt, emergencyFund) {
    const category = receipt.category || 'default';
    const totalAmount = parseFloat(receipt.total_amount) || 0;
    const rule = this.contributionRules[category] || this.contributionRules.default;

    // Calculate suggested contribution range
    const minContribution = totalAmount * rule.minPercentage;
    const maxContribution = totalAmount * rule.maxPercentage;
    
    // Risk assessment based on category and amount
    const riskLevel = this.assessRiskLevel(category, totalAmount, emergencyFund);
    
    // Spending pattern analysis
    const spendingPattern = this.analyzeSpendingPattern(receipt, emergencyFund);

    return {
      category,
      totalAmount,
      minContribution,
      maxContribution,
      suggestedPercentage: (rule.minPercentage + rule.maxPercentage) / 2,
      riskLevel,
      priority: rule.priority,
      isRiskCategory: this.riskCategories.includes(category),
      spendingPattern,
      confidenceScore: receipt.confidence_score || 0.85
    };
  }

  /**
   * Assess risk level based on receipt and fund status
   */
  assessRiskLevel(category, amount, emergencyFund) {
    const currentBalance = parseFloat(emergencyFund.current_balance) || 0;
    const targetBalance = parseFloat(emergencyFund.target_balance) || 0;
    const balanceRatio = currentBalance / targetBalance;

    // High risk if fund is low and this is a risk category expense
    if (balanceRatio < 0.3 && this.riskCategories.includes(category)) {
      return 'HIGH';
    }
    
    // Medium risk if fund is below 50% or expense is significant
    if (balanceRatio < 0.5 || amount > 1000) {
      return 'MEDIUM';
    }
    
    return 'LOW';
  }

  /**
   * Analyze spending patterns
   */
  analyzeSpendingPattern(receipt, emergencyFund) {
    // This would typically involve historical data analysis
    // For now, we'll provide basic pattern recognition
    const items = receipt.extracted_items || [];
    const itemCount = items.length;
    const averageItemPrice = itemCount > 0 ? 
      items.reduce((sum, item) => sum + (parseFloat(item.totalPrice) || 0), 0) / itemCount : 0;

    return {
      itemCount,
      averageItemPrice,
      isBulkPurchase: itemCount > 10 || averageItemPrice > 100,
      frequency: 'single' // Would be calculated from historical data
    };
  }

  /**
   * Generate contribution suggestion based on analysis
   */
  generateContributionSuggestion(analysis, emergencyFund) {
    const { minContribution, maxContribution, riskLevel, priority, isRiskCategory } = analysis;
    const currentBalance = parseFloat(emergencyFund.current_balance) || 0;
    const targetBalance = parseFloat(emergencyFund.target_balance) || 0;
    const balanceRatio = currentBalance / targetBalance;

    let suggestedAmount = minContribution;
    let reason = '';
    let urgency = 'low';

    // Adjust suggestion based on risk and fund status
    if (riskLevel === 'HIGH' || balanceRatio < 0.3) {
      suggestedAmount = maxContribution;
      urgency = 'high';
      reason = 'Your emergency fund is critically low. Consider a higher contribution for better protection.';
    } else if (riskLevel === 'MEDIUM' || balanceRatio < 0.6) {
      suggestedAmount = (minContribution + maxContribution) / 2;
      urgency = 'medium';
      reason = 'Your emergency fund needs improvement. Consider increasing your contribution.';
    } else if (isRiskCategory) {
      suggestedAmount = (minContribution + maxContribution) / 2;
      urgency = 'medium';
      reason = 'This expense category is critical for business continuity.';
    } else {
      reason = 'Regular contribution to maintain your emergency fund.';
    }

    // Cap the suggestion at a reasonable amount (e.g., 10% of the receipt)
    const maxReasonableAmount = analysis.totalAmount * 0.10;
    suggestedAmount = Math.min(suggestedAmount, maxReasonableAmount);

    return {
      suggestedAmount: Math.round(suggestedAmount * 100) / 100,
      minAmount: Math.round(minContribution * 100) / 100,
      maxAmount: Math.round(maxContribution * 100) / 100,
      urgency,
      reason,
      autoContributeRecommended: urgency === 'high' && suggestedAmount > 5,
      estimatedTimeToTarget: this.calculateTimeToTarget(currentBalance, targetBalance, suggestedAmount)
    };
  }

  /**
   * Calculate estimated time to reach target with regular contributions
   */
  calculateTimeToTarget(currentBalance, targetBalance, monthlyContribution) {
    if (monthlyContribution <= 0) return null;
    
    const remaining = targetBalance - currentBalance;
    if (remaining <= 0) return 0;
    
    const months = Math.ceil(remaining / monthlyContribution);
    return months;
  }

  /**
   * Save analysis result to database
   */
  async saveAnalysisResult(receiptId, analysis) {
    const query = `
      UPDATE receipts 
      SET 
        analysis_data = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `;
    
    await pool.query(query, [JSON.stringify(analysis), receiptId]);
  }

  /**
   * Create automatic contribution based on receipt analysis
   */
  async createAutoContribution(userId, businessId, receiptId, amount) {
    try {
      const paymentService = require('./paymentService');
      
      // Create a mock transaction for the contribution
      const transactionId = `AUTO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const query = `
        INSERT INTO emergency_fund_transactions 
        (user_id, emergency_fund_id, transaction_type, amount, payment_method, status, transaction_reference, description, receipt_id)
        SELECT $1, id, $2, $3, $4, $5, $6, $7, $8
        FROM emergency_funds 
        WHERE user_id = $1 AND business_id = $9
        RETURNING *
      `;

      const values = [
        userId,
        'auto_contribution',
        amount,
        'receipt_analysis',
        'completed',
        transactionId,
        `Auto-contribution from receipt analysis`,
        receiptId,
        businessId
      ];

      const result = await pool.query(query, values);
      const transaction = result.rows[0];

      // Update emergency fund balance
      await pool.query(
        'UPDATE emergency_funds SET current_balance = current_balance + $1, total_contributed = total_contributed + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [amount, transaction.emergency_fund_id]
      );

      logger.info(`Auto-contribution created: ${transactionId}, amount: RM${amount}`);

      return {
        success: true,
        transaction,
        message: 'Auto-contribution created successfully'
      };

    } catch (error) {
      logger.error('Error creating auto-contribution:', error);
      throw error;
    }
  }

  /**
   * Get receipt analysis history for a business
   */
  async getAnalysisHistory(businessId, userId, limit = 50) {
    try {
      const query = `
        SELECT 
          r.*,
          b.name as business_name,
          ef.current_balance as fund_balance
        FROM receipts r
        LEFT JOIN businesses b ON r.business_id = b.id
        LEFT JOIN emergency_funds ef ON r.business_id = ef.business_id
        WHERE r.user_id = $1 AND r.business_id = $2
        ORDER BY r.created_at DESC
        LIMIT $3
      `;

      const result = await pool.query(query, [userId, businessId, limit]);
      
      return {
        success: true,
        history: result.rows
      };

    } catch (error) {
      logger.error('Error fetching analysis history:', error);
      throw error;
    }
  }
}

module.exports = new ReceiptAnalysisService();