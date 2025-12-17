const express = require('express');
const router = express.Router();
const reportsService = require('../services/reportsService');
const { pool } = require('../config/database');
const logger = require('../utils/logger');

// Generate comprehensive resilience report
router.post('/resilience/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { period = 12 } = req.body; // months
    const userId = req.user.id;

    // Verify business belongs to user
    const businessCheck = await pool.query(
      'SELECT id FROM businesses WHERE id = $1 AND user_id = $2',
      [businessId, userId]
    );

    if (businessCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    const result = await reportsService.generateResilienceReport(businessId, parseInt(period));
    res.json(result);

  } catch (error) {
    logger.error('Error generating resilience report:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating resilience report',
      error: error.message
    });
  }
});

// Get resilience score summary
router.get('/score/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { period = 12 } = req.query;
    const userId = req.user.id;

    // Verify business belongs to user
    const businessCheck = await pool.query(
      'SELECT id FROM businesses WHERE id = $1 AND user_id = $2',
      [businessId, userId]
    );

    if (businessCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    const reportResult = await reportsService.generateResilienceReport(businessId, parseInt(period));
    
    if (reportResult.success) {
      const { resilienceScore, summary, benchmarking } = reportResult.report;
      res.json({
        success: true,
        resilienceScore,
        summary,
        benchmarking
      });
    } else {
      res.status(500).json(reportResult);
    }

  } catch (error) {
    logger.error('Error getting resilience score:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting resilience score',
      error: error.message
    });
  }
});

// Get emergency fund analytics
router.get('/emergency-fund/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { period = 12 } = req.query;
    const userId = req.user.id;

    // Verify business belongs to user
    const businessCheck = await pool.query(
      'SELECT id FROM businesses WHERE id = $1 AND user_id = $2',
      [businessId, userId]
    );

    if (businessCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    const analytics = await reportsService.getEmergencyFundAnalytics(businessId, parseInt(period));
    res.json({
      success: true,
      analytics
    });

  } catch (error) {
    logger.error('Error getting emergency fund analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting emergency fund analytics',
      error: error.message
    });
  }
});

// Get risk analytics
router.get('/risk/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { period = 12 } = req.query;
    const userId = req.user.id;

    // Verify business belongs to user
    const businessCheck = await pool.query(
      'SELECT id FROM businesses WHERE id = $1 AND user_id = $2',
      [businessId, userId]
    );

    if (businessCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    const analytics = await reportsService.getRiskAnalytics(businessId, parseInt(period));
    res.json({
      success: true,
      analytics
    });

  } catch (error) {
    logger.error('Error getting risk analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting risk analytics',
      error: error.message
    });
  }
});

// Get alert analytics
router.get('/alerts/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { period = 12 } = req.query;
    const userId = req.user.id;

    // Verify business belongs to user
    const businessCheck = await pool.query(
      'SELECT id FROM businesses WHERE id = $1 AND user_id = $2',
      [businessId, userId]
    );

    if (businessCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    const analytics = await reportsService.getAlertAnalytics(businessId, parseInt(period));
    res.json({
      success: true,
      analytics
    });

  } catch (error) {
    logger.error('Error getting alert analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting alert analytics',
      error: error.message
    });
  }
});

// Get receipt analytics
router.get('/receipts/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { period = 12 } = req.query;
    const userId = req.user.id;

    // Verify business belongs to user
    const businessCheck = await pool.query(
      'SELECT id FROM businesses WHERE id = $1 AND user_id = $2',
      [businessId, userId]
    );

    if (businessCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    const analytics = await reportsService.getReceiptAnalytics(businessId, parseInt(period));
    res.json({
      success: true,
      analytics
    });

  } catch (error) {
    logger.error('Error getting receipt analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting receipt analytics',
      error: error.message
    });
  }
});

// Get transaction analytics
router.get('/transactions/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { period = 12 } = req.query;
    const userId = req.user.id;

    // Verify business belongs to user
    const businessCheck = await pool.query(
      'SELECT id FROM businesses WHERE id = $1 AND user_id = $2',
      [businessId, userId]
    );

    if (businessCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    const analytics = await reportsService.getTransactionAnalytics(businessId, parseInt(period));
    res.json({
      success: true,
      analytics
    });

  } catch (error) {
    logger.error('Error getting transaction analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting transaction analytics',
      error: error.message
    });
  }
});

// Get dashboard data (combined analytics)
router.get('/dashboard/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { period = 12 } = req.query;
    const userId = req.user.id;

    // Verify business belongs to user
    const businessCheck = await pool.query(
      'SELECT id, name, business_type, location FROM businesses WHERE id = $1 AND user_id = $2',
      [businessId, userId]
    );

    if (businessCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    const business = businessCheck.rows[0];
    const periodInt = parseInt(period);

    // Get all analytics in parallel
    const [
      emergencyFundData,
      riskAssessments,
      alerts,
      receipts,
      transactions
    ] = await Promise.all([
      reportsService.getEmergencyFundAnalytics(businessId, periodInt),
      reportsService.getRiskAnalytics(businessId, periodInt),
      reportsService.getAlertAnalytics(businessId, periodInt),
      reportsService.getReceiptAnalytics(businessId, periodInt),
      reportsService.getTransactionAnalytics(businessId, periodInt)
    ]);

    // Calculate resilience score
    const resilienceScore = reportsService.calculateResilienceScore({
      emergencyFundData,
      riskAssessments,
      alerts,
      receipts,
      transactions,
      business
    });

    // Generate recommendations
    const recommendations = reportsService.generateRecommendations({
      resilienceScore,
      emergencyFundData,
      riskAssessments,
      alerts,
      business
    });

    // Get benchmarking data
    const benchmarking = await reportsService.getBenchmarkingData(business, resilienceScore);

    res.json({
      success: true,
      business: {
        id: business.id,
        name: business.name,
        businessType: business.business_type,
        location: business.location
      },
      period: periodInt,
      resilienceScore,
      emergencyFundData,
      riskAssessments,
      alerts,
      receipts,
      transactions,
      recommendations,
      benchmarking,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error getting dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting dashboard data',
      error: error.message
    });
  }
});

// Export report (PDF/Excel)
router.post('/export/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { period = 12, format = 'pdf' } = req.body;
    const userId = req.user.id;

    // Verify business belongs to user
    const businessCheck = await pool.query(
      'SELECT id FROM businesses WHERE id = $1 AND user_id = $2',
      [businessId, userId]
    );

    if (businessCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Generate the report
    const reportResult = await reportsService.generateResilienceReport(businessId, parseInt(period));
    
    if (!reportResult.success) {
      return res.status(500).json(reportResult);
    }

    // In a real implementation, this would generate actual PDF/Excel files
    // For now, we'll return the data that would be used for export
    const exportData = {
      businessName: reportResult.report.businessName,
      generatedAt: reportResult.report.generatedAt,
      period: reportResult.report.reportPeriod,
      resilienceScore: reportResult.report.resilienceScore,
      summary: reportResult.report.summary,
      recommendations: reportResult.report.recommendations,
      benchmarking: reportResult.report.benchmarking,
      format
    };

    res.json({
      success: true,
      exportData,
      message: `Report data prepared for ${format.toUpperCase()} export`
    });

  } catch (error) {
    logger.error('Error exporting report:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting report',
      error: error.message
    });
  }
});

// Get industry benchmarks
router.get('/benchmarks/:businessType', async (req, res) => {
  try {
    const { businessType } = req.params;
    
    // Get benchmark data for the business type
    const benchmarkData = reportsService.businessCategories[businessType] || 
      reportsService.businessCategories['other'];

    res.json({
      success: true,
      businessType,
      benchmarks: {
        avgResilienceScore: benchmarkData.avgResilienceScore,
        typicalRisks: benchmarkData.typicalRisks,
        industryInsights: reportsService.getIndustryInsights(businessType)
      }
    });

  } catch (error) {
    logger.error('Error getting benchmarks:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting benchmarks',
      error: error.message
    });
  }
});

// Get historical trends
router.get('/trends/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { period = 24, metric = 'resilience_score' } = req.query; // months
    const userId = req.user.id;

    // Verify business belongs to user
    const businessCheck = await pool.query(
      'SELECT id FROM businesses WHERE id = $1 AND user_id = $2',
      [businessId, userId]
    );

    if (businessCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // In a real implementation, this would query historical data
    // For now, we'll generate mock trend data
    const months = parseInt(period);
    const trendData = [];
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      let value = 50 + Math.random() * 30; // Base value 50-80
      
      if (metric === 'resilience_score') {
        value = Math.min(100, Math.max(0, value));
      } else if (metric === 'emergency_fund_balance') {
        value = value * 100; // Convert to RM
      } else if (metric === 'risk_score') {
        value = 100 - value; // Inverse relationship
      }
      
      trendData.push({
        date: date.toISOString().slice(0, 7), // YYYY-MM
        value: Math.round(value * 100) / 100
      });
    }

    res.json({
      success: true,
      metric,
      period: months,
      trends: trendData
    });

  } catch (error) {
    logger.error('Error getting trends:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting trends',
      error: error.message
    });
  }
});

module.exports = router;