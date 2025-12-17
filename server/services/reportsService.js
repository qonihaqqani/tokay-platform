const { pool } = require('../config/database');
const logger = require('../utils/logger');

class ReportsService {
  constructor() {
    // Malaysian business categories for benchmarking
    this.businessCategories = {
      'restaurant': { avgResilienceScore: 65, typicalRisks: ['supply_chain', 'health_emergency'] },
      'retail': { avgResilienceScore: 70, typicalRisks: ['economic_downturn', 'supply_chain'] },
      'services': { avgResilienceScore: 75, typicalRisks: ['economic_downturn'] },
      'manufacturing': { avgResilienceScore: 60, typicalRisks: ['supply_chain', 'operational'] },
      'agriculture': { avgResilienceScore: 55, typicalRisks: ['flood', 'drought', 'supply_chain'] },
      'construction': { avgResilienceScore: 58, typicalRisks: ['flood', 'landslide', 'economic_downturn'] }
    };
  }

  /**
   * Generate comprehensive resilience report for a business
   */
  async generateResilienceReport(businessId, period = 12) {
    try {
      // Get business information
      const businessQuery = 'SELECT * FROM businesses WHERE id = $1';
      const businessResult = await pool.query(businessQuery, [businessId]);
      const business = businessResult.rows[0];

      if (!business) {
        throw new Error('Business not found');
      }

      // Gather data from all modules
      const [emergencyFundData, riskAssessments, alerts, receipts, transactions] = await Promise.all([
        this.getEmergencyFundAnalytics(businessId, period),
        this.getRiskAnalytics(businessId, period),
        this.getAlertAnalytics(businessId, period),
        this.getReceiptAnalytics(businessId, period),
        this.getTransactionAnalytics(businessId, period)
      ]);

      // Calculate resilience score
      const resilienceScore = this.calculateResilienceScore({
        emergencyFundData,
        riskAssessments,
        alerts,
        receipts,
        transactions,
        business
      });

      // Generate recommendations
      const recommendations = this.generateRecommendations({
        resilienceScore,
        emergencyFundData,
        riskAssessments,
        alerts,
        business
      });

      // Benchmark against similar businesses
      const benchmarking = await this.getBenchmarkingData(business, resilienceScore);

      const report = {
        businessId,
        businessName: business.name,
        businessType: business.business_type,
        location: business.location,
        reportPeriod: period,
        generatedAt: new Date().toISOString(),
        resilienceScore,
        emergencyFundData,
        riskAssessments,
        alerts,
        receipts,
        transactions,
        recommendations,
        benchmarking,
        summary: this.generateReportSummary(resilienceScore, recommendations)
      };

      logger.info(`Resilience report generated for business ${businessId}`);
      
      return {
        success: true,
        report
      };

    } catch (error) {
      logger.error('Error generating resilience report:', error);
      throw error;
    }
  }

  /**
   * Get emergency fund analytics
   */
  async getEmergencyFundAnalytics(businessId, period) {
    try {
      const fundQuery = 'SELECT * FROM emergency_funds WHERE business_id = $1';
      const fundResult = await pool.query(fundQuery, [businessId]);
      const fund = fundResult.rows[0];

      if (!fund) {
        return { status: 'not_setup' };
      }

      // Get transaction history
      const transactionsQuery = `
        SELECT * FROM emergency_fund_transactions 
        WHERE business_id = $1 
          AND created_at >= CURRENT_DATE - INTERVAL '${period} months'
        ORDER BY created_at DESC
      `;
      const transactionsResult = await pool.query(transactionsQuery, [businessId]);

      // Calculate analytics
      const contributions = transactionsResult.rows.filter(t => t.transaction_type === 'contribution');
      const withdrawals = transactionsResult.rows.filter(t => t.transaction_type === 'withdrawal');

      const totalContributed = contributions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const totalWithdrawn = withdrawals.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const netGrowth = totalContributed - totalWithdrawn;

      const currentBalance = parseFloat(fund.current_balance) || 0;
      const targetBalance = parseFloat(fund.target_balance) || 0;
      const completionRate = targetBalance > 0 ? (currentBalance / targetBalance) * 100 : 0;

      // Monthly average
      const monthlyContributions = this.calculateMonthlyAverages(contributions);
      const monthlyWithdrawals = this.calculateMonthlyAverages(withdrawals);

      return {
        status: 'active',
        currentBalance,
        targetBalance,
        completionRate,
        totalContributed,
        totalWithdrawn,
        netGrowth,
        monthlyContributions,
        monthlyWithdrawals,
        transactionCount: transactionsResult.rows.length,
        lastContribution: contributions[0]?.created_at || null,
        lastWithdrawal: withdrawals[0]?.created_at || null
      };

    } catch (error) {
      logger.error('Error getting emergency fund analytics:', error);
      throw error;
    }
  }

  /**
   * Get risk assessment analytics
   */
  async getRiskAnalytics(businessId, period) {
    try {
      const riskQuery = `
        SELECT * FROM risk_assessments 
        WHERE business_id = $1 
          AND assessment_date >= CURRENT_DATE - INTERVAL '${period} months'
        ORDER BY assessment_date DESC
      `;
      const riskResult = await pool.query(riskQuery, [businessId]);

      if (riskResult.rows.length === 0) {
        return { status: 'no_data' };
      }

      // Calculate risk trends
      const riskScores = riskResult.rows.map(r => parseFloat(r.risk_score));
      const avgRiskScore = riskScores.reduce((sum, score) => sum + score, 0) / riskScores.length;
      const highestRisk = Math.max(...riskScores);
      const lowestRisk = Math.min(...riskScores);

      // Risk type distribution
      const riskTypeDistribution = {};
      riskResult.rows.forEach(risk => {
        if (!riskTypeDistribution[risk.risk_type]) {
          riskTypeDistribution[risk.risk_type] = 0;
        }
        riskTypeDistribution[risk.risk_type]++;
      });

      // Severity distribution
      const severityDistribution = { low: 0, medium: 0, high: 0, critical: 0 };
      riskResult.rows.forEach(risk => {
        severityDistribution[risk.severity_level]++;
      });

      return {
        status: 'active',
        totalAssessments: riskResult.rows.length,
        avgRiskScore,
        highestRisk,
        lowestRisk,
        currentRiskScore: riskScores[0], // Latest assessment
        riskTrend: this.calculateTrend(riskScores),
        riskTypeDistribution,
        severityDistribution,
        lastAssessment: riskResult.rows[0].assessment_date
      };

    } catch (error) {
      logger.error('Error getting risk analytics:', error);
      throw error;
    }
  }

  /**
   * Get alert analytics
   */
  async getAlertAnalytics(businessId, period) {
    try {
      const alertQuery = `
        SELECT * FROM alerts 
        WHERE business_id = $1 
          AND created_at >= CURRENT_DATE - INTERVAL '${period} months'
        ORDER BY created_at DESC
      `;
      const alertResult = await pool.query(alertQuery, [businessId]);

      if (alertResult.rows.length === 0) {
        return { status: 'no_alerts' };
      }

      // Alert type distribution
      const alertTypeDistribution = {};
      alertResult.rows.forEach(alert => {
        if (!alertTypeDistribution[alert.alert_type]) {
          alertTypeDistribution[alert.alert_type] = 0;
        }
        alertTypeDistribution[alert.alert_type]++;
      });

      // Severity distribution
      const severityDistribution = { low: 0, medium: 0, high: 0, critical: 0 };
      alertResult.rows.forEach(alert => {
        if (severityDistribution[alert.severity] !== undefined) {
          severityDistribution[alert.severity]++;
        }
      });

      // Active vs resolved
      const activeAlerts = alertResult.rows.filter(a => a.status === 'active').length;
      const resolvedAlerts = alertResult.rows.filter(a => a.status === 'resolved').length;

      return {
        status: 'active',
        totalAlerts: alertResult.rows.length,
        activeAlerts,
        resolvedAlerts,
        alertTypeDistribution,
        severityDistribution,
        resolutionRate: alertResult.rows.length > 0 ? (resolvedAlerts / alertResult.rows.length) * 100 : 0
      };

    } catch (error) {
      logger.error('Error getting alert analytics:', error);
      throw error;
    }
  }

  /**
   * Get receipt analytics
   */
  async getReceiptAnalytics(businessId, period) {
    try {
      const receiptQuery = `
        SELECT * FROM receipts 
        WHERE business_id = $1 
          AND created_at >= CURRENT_DATE - INTERVAL '${period} months'
          AND processing_status = 'completed'
        ORDER BY created_at DESC
      `;
      const receiptResult = await pool.query(receiptQuery, [businessId]);

      if (receiptResult.rows.length === 0) {
        return { status: 'no_data' };
      }

      // Spending analytics
      const totalSpending = receiptResult.rows.reduce((sum, r) => sum + parseFloat(r.total_amount || 0), 0);
      const avgTransactionValue = totalSpending / receiptResult.rows.length;

      // Category distribution
      const categoryDistribution = {};
      receiptResult.rows.forEach(receipt => {
        const category = receipt.category || 'other';
        if (!categoryDistribution[category]) {
          categoryDistribution[category] = { count: 0, total: 0 };
        }
        categoryDistribution[category].count++;
        categoryDistribution[category].total += parseFloat(receipt.total_amount || 0);
      });

      // Monthly spending
      const monthlySpending = this.calculateMonthlySpending(receiptResult.rows);

      return {
        status: 'active',
        totalReceipts: receiptResult.rows.length,
        totalSpending,
        avgTransactionValue,
        categoryDistribution,
        monthlySpending,
        lastReceipt: receiptResult.rows[0].created_at
      };

    } catch (error) {
      logger.error('Error getting receipt analytics:', error);
      throw error;
    }
  }

  /**
   * Get transaction analytics
   */
  async getTransactionAnalytics(businessId, period) {
    try {
      const transactionQuery = `
        SELECT * FROM emergency_fund_transactions 
        WHERE business_id = $1 
          AND created_at >= CURRENT_DATE - INTERVAL '${period} months'
        ORDER BY created_at DESC
      `;
      const transactionResult = await pool.query(transactionQuery, [businessId]);

      if (transactionResult.rows.length === 0) {
        return { status: 'no_data' };
      }

      // Transaction type distribution
      const typeDistribution = { contribution: 0, withdrawal: 0, auto_contribution: 0 };
      transactionResult.rows.forEach(t => {
        if (typeDistribution[t.transaction_type] !== undefined) {
          typeDistribution[t.transaction_type]++;
        }
      });

      // Payment method distribution
      const paymentMethodDistribution = {};
      transactionResult.rows.forEach(t => {
        const method = t.payment_method || 'other';
        if (!paymentMethodDistribution[method]) {
          paymentMethodDistribution[method] = 0;
        }
        paymentMethodDistribution[method]++;
      });

      return {
        status: 'active',
        totalTransactions: transactionResult.rows.length,
        typeDistribution,
        paymentMethodDistribution,
        lastTransaction: transactionResult.rows[0].created_at
      };

    } catch (error) {
      logger.error('Error getting transaction analytics:', error);
      throw error;
    }
  }

  /**
   * Calculate overall resilience score (0-100)
   */
  calculateResilienceScore(data) {
    let overallScore = 0;
    let factors = 0;
    
    const scores = {
      emergencyFund: 0,
      riskManagement: 0,
      alertResponse: 0,
      receiptTracking: 0,
      transactionConsistency: 0
    };

    // Emergency fund factor (30% weight)
    if (data.emergencyFundData && data.emergencyFundData.status === 'active') {
      const fundScore = Math.min(data.emergencyFundData.completionRate || 0, 100);
      scores.emergencyFund = fundScore;
      overallScore += fundScore * 0.3;
      factors += 0.3;
    } else if (data.emergencyFundData && data.emergencyFundData.currentBalance !== undefined) {
      // For mock data, use completionPercentage
      const fundScore = Math.min(data.emergencyFundData.completionPercentage || 0, 100);
      scores.emergencyFund = fundScore;
      overallScore += fundScore * 0.3;
      factors += 0.3;
    }

    // Risk assessment factor (25% weight)
    if (data.riskAssessments && data.riskAssessments.status === 'active') {
      // Lower risk score = higher resilience
      const riskScore = Math.max(0, 100 - (data.riskAssessments.currentRiskScore || data.riskAssessments.averageRiskScore || 0));
      scores.riskManagement = riskScore;
      overallScore += riskScore * 0.25;
      factors += 0.25;
    } else if (data.riskAssessments && data.riskAssessments.averageRiskScore !== undefined) {
      // For mock data
      const riskScore = Math.max(0, 100 - data.riskAssessments.averageRiskScore);
      scores.riskManagement = riskScore;
      overallScore += riskScore * 0.25;
      factors += 0.25;
    }

    // Alert management factor (20% weight)
    if (data.alerts && data.alerts.status === 'active') {
      const alertScore = data.alerts.resolutionRate || 50; // Default to 50 if no alerts
      scores.alertResponse = alertScore;
      overallScore += alertScore * 0.2;
      factors += 0.2;
    } else if (data.alerts && data.alerts.responseRate !== undefined) {
      // For mock data
      const alertScore = data.alerts.responseRate;
      scores.alertResponse = alertScore;
      overallScore += alertScore * 0.2;
      factors += 0.2;
    }

    // Receipt tracking factor (15% weight)
    if (data.receipts && data.receipts.status === 'active') {
      // More receipts = better tracking = higher resilience
      const receiptScore = Math.min((data.receipts.totalReceipts / 50) * 100, 100); // 50 receipts = 100%
      scores.receiptTracking = receiptScore;
      overallScore += receiptScore * 0.15;
      factors += 0.15;
    } else if (data.receipts && data.receipts.totalReceipts !== undefined) {
      // For mock data
      const receiptScore = Math.min((data.receipts.totalReceipts / 50) * 100, 100);
      scores.receiptTracking = receiptScore;
      overallScore += receiptScore * 0.15;
      factors += 0.15;
    }

    // Transaction consistency factor (10% weight)
    if (data.transactions && data.transactions.status === 'active') {
      const transactionScore = Math.min((data.transactions.totalTransactions / 20) * 100, 100); // 20 transactions = 100%
      scores.transactionConsistency = transactionScore;
      overallScore += transactionScore * 0.1;
      factors += 0.1;
    } else if (data.transactions && data.transactions.totalDeposits !== undefined) {
      // For mock data
      const transactionScore = Math.min(((data.transactions.totalDeposits + data.transactions.totalWithdrawals) / 20) * 100, 100);
      scores.transactionConsistency = transactionScore;
      overallScore += transactionScore * 0.1;
      factors += 0.1;
    }

    // Normalize score
    const finalScore = factors > 0 ? overallScore / factors : 0;
    
    return {
      overall: Math.round(finalScore),
      ...scores
    };
  }

  /**
   * Generate AI-powered recommendations
   */
  generateRecommendations(data) {
    const recommendations = [];
    const { resilienceScore, emergencyFundData, riskAssessments, alerts, business } = data;

    // Emergency fund recommendations
    if (emergencyFundData.status === 'not_setup') {
      recommendations.push({
        priority: 'high',
        category: 'emergency_fund',
        title: 'Setup Emergency Fund',
        description: 'Establish an emergency fund to protect your business against unexpected shocks.',
        action: 'Create an emergency fund with a target of 3-6 months of expenses.'
      });
    } else if (emergencyFundData.completionRate < 50) {
      recommendations.push({
        priority: 'high',
        category: 'emergency_fund',
        title: 'Increase Emergency Fund Contributions',
        description: `Your emergency fund is only ${emergencyFundData.completionRate.toFixed(1)}% complete.`,
        action: 'Increase monthly contributions to reach your target faster.'
      });
    }

    // Risk management recommendations
    if (riskAssessments.status === 'no_data') {
      recommendations.push({
        priority: 'medium',
        category: 'risk_assessment',
        title: 'Conduct Risk Assessment',
        description: 'Regular risk assessments help identify potential threats to your business.',
        action: 'Run a comprehensive risk assessment to identify vulnerabilities.'
      });
    } else if (riskAssessments.currentRiskScore > 70) {
      recommendations.push({
        priority: 'high',
        category: 'risk_management',
        title: 'Address High-Risk Factors',
        description: `Your current risk score is ${riskAssessments.currentRiskScore.toFixed(1)}/100.`,
        action: 'Review and implement the mitigation recommendations from your latest risk assessment.'
      });
    }

    // Alert management recommendations
    if (alerts.status === 'active' && alerts.resolutionRate < 80) {
      recommendations.push({
        priority: 'medium',
        category: 'alert_management',
        title: 'Improve Alert Response',
        description: `Only ${alerts.resolutionRate.toFixed(1)}% of alerts have been resolved.`,
        action: 'Establish a protocol for addressing alerts promptly.'
      });
    }

    // Business-specific recommendations based on location
    if (business.location) {
      const locationLower = business.location.toLowerCase();
      if (locationLower.includes('kelantan') || locationLower.includes('terengganu')) {
        recommendations.push({
          priority: 'medium',
          category: 'location_risk',
          title: 'Flood Preparedness',
          description: 'Your business is located in a flood-prone area.',
          action: 'Prepare flood protection measures and establish an emergency response plan.'
        });
      }
    }

    return recommendations;
  }

  /**
   * Get benchmarking data against similar businesses
   */
  async getBenchmarkingData(business, resilienceScore) {
    try {
      const businessType = business.business_type || 'other';
      const categoryData = this.businessCategories[businessType] || { avgResilienceScore: 65, typicalRisks: [] };

      // In a real implementation, this would query actual data from similar businesses
      // For now, we'll use mock data
      const percentile = this.calculatePercentile(resilienceScore, categoryData.avgResilienceScore);

      return {
        businessType,
        categoryAverage: categoryData.avgResilienceScore,
        yourScore: resilienceScore,
        percentile,
        ranking: this.getRankingLabel(percentile),
        typicalRisks: categoryData.typicalRisks,
        industryInsights: this.getIndustryInsights(businessType)
      };

    } catch (error) {
      logger.error('Error getting benchmarking data:', error);
      return null;
    }
  }

  /**
   * Generate report summary
   */
  generateReportSummary(resilienceScore, recommendations) {
    const highPriorityCount = recommendations.filter(r => r.priority === 'high').length;
    const mediumPriorityCount = recommendations.filter(r => r.priority === 'medium').length;

    let overallStatus = 'good';
    if (resilienceScore < 40) overallStatus = 'critical';
    else if (resilienceScore < 60) overallStatus = 'needs_improvement';
    else if (resilienceScore < 80) overallStatus = 'good';

    return {
      overallStatus,
      resilienceScore,
      totalRecommendations: recommendations.length,
      highPriorityActions: highPriorityCount,
      mediumPriorityActions: mediumPriorityCount,
      keyInsight: this.getKeyInsight(resilienceScore, recommendations)
    };
  }

  // Helper methods
  calculateMonthlyAverages(transactions) {
    const monthlyData = {};
    transactions.forEach(t => {
      const month = new Date(t.created_at).toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { count: 0, total: 0 };
      }
      monthlyData[month].count++;
      monthlyData[month].total += parseFloat(t.amount);
    });

    return Object.keys(monthlyData).map(month => ({
      month,
      average: monthlyData[month].total / monthlyData[month].count,
      total: monthlyData[month].total,
      count: monthlyData[month].count
    }));
  }

  calculateTrend(scores) {
    if (scores.length < 2) return 'stable';
    
    const recent = scores.slice(0, Math.min(3, scores.length));
    const older = scores.slice(Math.min(3, scores.length), 6);
    
    const recentAvg = recent.reduce((sum, s) => sum + s, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((sum, s) => sum + s, 0) / older.length : recentAvg;
    
    if (recentAvg < olderAvg - 10) return 'improving';
    if (recentAvg > olderAvg + 10) return 'deteriorating';
    return 'stable';
  }

  calculateMonthlySpending(receipts) {
    const monthlyData = {};
    receipts.forEach(r => {
      const month = new Date(r.created_at).toISOString().slice(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = 0;
      }
      monthlyData[month] += parseFloat(r.total_amount || 0);
    });

    return Object.keys(monthlyData).map(month => ({
      month,
      total: monthlyData[month]
    }));
  }

  calculatePercentile(score, average) {
    // Simple percentile calculation based on normal distribution
    const stdDev = 15; // Assumed standard deviation
    const zScore = (score - average) / stdDev;
    const percentile = (this.normalCDF(zScore) * 100);
    return Math.max(0, Math.min(100, percentile));
  }

  normalCDF(x) {
    // Approximation of normal CDF
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp(-x * x / 2);
    const prob = d * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
    return x > 0 ? 1 - prob : prob;
  }

  getRankingLabel(percentile) {
    if (percentile >= 90) return 'Top 10%';
    if (percentile >= 75) return 'Top 25%';
    if (percentile >= 50) return 'Above Average';
    if (percentile >= 25) return 'Below Average';
    return 'Bottom 25%';
  }

  getIndustryInsights(businessType) {
    const insights = {
      'restaurant': [
        'Restaurant businesses typically face supply chain and health emergency risks.',
        'Focus on inventory management and health protocols.',
        'Consider multiple suppliers for key ingredients.',
        'Implement digital ordering systems for resilience.'
      ],
      'retail': [
        'Retail businesses should monitor economic trends and maintain diverse supplier relationships.',
        'Focus on e-commerce capabilities as a backup channel.',
        'Maintain optimal inventory levels to avoid overstocking.',
        'Consider local sourcing to reduce supply chain risks.'
      ],
      'services': [
        'Service-based businesses should focus on digital transformation and client retention strategies.',
        'Implement remote work capabilities for business continuity.',
        'Diversify service offerings to reduce dependency on single revenue streams.',
        'Focus on building strong client relationships.'
      ],
      'manufacturing': [
        'Manufacturing requires robust supply chain management and operational continuity planning.',
        'Implement predictive maintenance for critical equipment.',
        'Maintain safety stock for critical components.',
        'Consider near-shoring or local sourcing strategies.'
      ],
      'agriculture': [
        'Agricultural businesses are highly exposed to weather risks.',
        'Consider crop insurance and diversification.',
        'Implement water conservation and irrigation systems.',
        'Focus on value-added processing to increase margins.'
      ],
      'construction': [
        'Construction businesses face weather and regulatory risks.',
        'Maintain proper insurance and compliance.',
        'Focus on worker safety and training programs.',
        'Implement project management software for better coordination.'
      ]
    };

    return insights[businessType] || [
      'Focus on building operational resilience and financial buffers.',
      'Implement regular risk assessments and business continuity planning.',
      'Maintain strong relationships with suppliers and customers.',
      'Consider digital transformation to improve efficiency.'
    ];
  }

  getKeyInsight(resilienceScore, recommendations) {
    if (resilienceScore < 40) {
      return 'Your business requires immediate attention to build resilience. Focus on emergency fund setup and risk assessment.';
    } else if (resilienceScore < 60) {
      return 'Your business has basic resilience measures but needs improvement in key areas.';
    } else if (resilienceScore < 80) {
      return 'Your business demonstrates good resilience practices. Continue monitoring and optimization.';
    } else {
      return 'Your business shows excellent resilience. You are well-prepared for potential disruptions.';
    }
  }
}

module.exports = new ReportsService();