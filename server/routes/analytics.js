const express = require('express');
const router = express.Router();
const salesAnalyticsService = require('../services/salesAnalyticsService');
const { authMiddleware } = require('../middleware/auth');
const logger = require('../utils/logger');

// Get sales patterns for a business
router.get('/sales-patterns', authMiddleware, async (req, res) => {
  try {
    const { businessId } = req.user; // Assuming businessId is in user object
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const patterns = await salesAnalyticsService.analyzeSalesPatterns(
      businessId, 
      startDate, 
      endDate
    );

    res.json({
      success: true,
      data: patterns
    });
  } catch (error) {
    logger.error('Error fetching sales patterns:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sales patterns',
      error: error.message
    });
  }
});

// Get customer segmentation
router.get('/customer-segments', authMiddleware, async (req, res) => {
  try {
    const { businessId } = req.user;
    const { days = 30 } = req.query;

    const segments = await salesAnalyticsService.segmentCustomers(businessId, parseInt(days));

    res.json({
      success: true,
      data: segments
    });
  } catch (error) {
    logger.error('Error fetching customer segments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer segments',
      error: error.message
    });
  }
});

// Get combo deal recommendations
router.get('/combo-recommendations', authMiddleware, async (req, res) => {
  try {
    const { businessId } = req.user;
    const { days = 30 } = req.query;

    const recommendations = await salesAnalyticsService.generateComboRecommendations(
      businessId, 
      parseInt(days)
    );

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    logger.error('Error generating combo recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating combo recommendations',
      error: error.message
    });
  }
});

// Get profit margins
router.get('/profit-margins', authMiddleware, async (req, res) => {
  try {
    const { businessId } = req.user;
    const { days = 30 } = req.query;

    const margins = await salesAnalyticsService.calculateProfitMargins(businessId, parseInt(days));

    res.json({
      success: true,
      data: margins
    });
  } catch (error) {
    logger.error('Error calculating profit margins:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating profit margins',
      error: error.message
    });
  }
});

// Get peak hours analysis
router.get('/peak-hours', authMiddleware, async (req, res) => {
  try {
    const { businessId } = req.user;
    const { days = 30 } = req.query;

    const peakHours = await salesAnalyticsService.identifyPeakHours(businessId, parseInt(days));

    res.json({
      success: true,
      data: peakHours
    });
  } catch (error) {
    logger.error('Error identifying peak hours:', error);
    res.status(500).json({
      success: false,
      message: 'Error identifying peak hours',
      error: error.message
    });
  }
});

// Get daily analytics summary
router.get('/daily-summary', authMiddleware, async (req, res) => {
  try {
    const { businessId } = req.user;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const query = `
      SELECT 
        sales_date,
        total_transactions,
        total_revenue,
        average_transaction_value,
        high_value_transactions,
        low_value_high_volume_transactions,
        category_breakdown,
        top_products,
        peak_hours
      FROM sales_analytics_daily
      WHERE business_id = $1 
        AND sales_date BETWEEN $2 AND $3
      ORDER BY sales_date DESC
    `;

    const result = await req.app.get('db').query(query, [businessId, startDate, endDate]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Error fetching daily summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching daily summary',
      error: error.message
    });
  }
});

// Get comprehensive dashboard data
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const { businessId } = req.user;
    const { days = 30 } = req.query;

    // Get all analytics data in parallel
    const [
      salesPatterns,
      customerSegments,
      comboRecommendations,
      profitMargins,
      peakHours
    ] = await Promise.all([
      salesAnalyticsService.analyzeSalesPatterns(
        businessId,
        new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        new Date().toISOString().split('T')[0]
      ),
      salesAnalyticsService.segmentCustomers(businessId, parseInt(days)),
      salesAnalyticsService.generateComboRecommendations(businessId, parseInt(days)),
      salesAnalyticsService.calculateProfitMargins(businessId, parseInt(days)),
      salesAnalyticsService.identifyPeakHours(businessId, parseInt(days))
    ]);

    res.json({
      success: true,
      data: {
        salesPatterns,
        customerSegments,
        comboRecommendations,
        profitMargins,
        peakHours,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
});

// Update daily analytics (manual trigger or scheduled job)
router.post('/update-daily', authMiddleware, async (req, res) => {
  try {
    const { businessId } = req.user;
    const { saleDate } = req.body;

    if (!saleDate) {
      return res.status(400).json({
        success: false,
        message: 'Sale date is required'
      });
    }

    const analytics = await salesAnalyticsService.updateDailySalesAnalytics(
      businessId, 
      saleDate
    );

    res.json({
      success: true,
      data: analytics,
      message: 'Daily analytics updated successfully'
    });
  } catch (error) {
    logger.error('Error updating daily analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating daily analytics',
      error: error.message
    });
  }
});

// Get business health score
router.get('/business-health', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's business
    const businessQuery = 'SELECT * FROM businesses WHERE user_id = $1 LIMIT 1';
    const { db } = require('../config/database');
    const businessResult = await db.query(businessQuery, [userId]);
    
    if (businessResult.rows.length === 0) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const business = businessResult.rows[0];
    const businessId = business.id;

    // Calculate health score based on various factors
    const healthScore = await salesAnalyticsService.calculateBusinessHealth(businessId);

    res.json({
      success: true,
      data: healthScore
    });
  } catch (error) {
    logger.error('Error calculating business health:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating business health',
      error: error.message
    });
  }
});

// Public demo endpoint (no auth required)
router.get('/demo/business-health', async (req, res) => {
  try {
    // Return demo business health data
    const demoHealthData = {
      success: true,
      data: {
        overall_score: 78,
        health_level: 'good',
        metrics: {
          revenue: { score: 82, weight: 25 },
          transactions: { score: 75, weight: 20 },
          profit: { score: 80, weight: 25 },
          growth: { score: 85, weight: 15 },
          consistency: { score: 70, weight: 15 }
        },
        insights: [
          {
            type: 'positive',
            title: 'Stable Revenue Performance',
            description: 'Your business shows consistent revenue patterns over the past month with strong daily averages.'
          },
          {
            type: 'opportunity',
            title: 'Growth Potential Identified',
            description: 'Analysis shows potential for 15% revenue growth through optimized pricing and combo deals.'
          }
        ],
        recommendations: [
          'Implement combo deals for Teh Tarik + Kuih to increase average transaction value by 12%',
          'Consider lunch hour promotions to boost midday sales',
          'Review inventory for Roti Canai - shows high demand during peak hours'
        ],
        last_updated: new Date().toISOString(),
        demo: true
      }
    };

    res.json(demoHealthData);
  } catch (error) {
    logger.error('Error generating demo business health:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating demo data',
      error: error.message
    });
  }
});

// Public demo endpoint for combo recommendations
router.get('/demo/combo-recommendations', async (req, res) => {
  try {
    const demoComboData = {
      success: true,
      data: [
        {
          items: ['Teh Tarik', 'Roti Canai'],
          frequency: 45,
          suggested_price: 7.50,
          original_price: 8.50,
          savings: 1.00,
          confidence: 92,
          reason: 'These items are frequently bought together (45 times). A combo deal could increase customer satisfaction and average order value.',
          malaysian_context: 'Classic Malaysian breakfast combination'
        },
        {
          items: ['Nasi Lemak', 'Teh Tarik'],
          frequency: 38,
          suggested_price: 12.00,
          original_price: 14.00,
          savings: 2.00,
          confidence: 88,
          reason: 'Popular breakfast combo. Customers who order Nasi Lemak almost always order Teh Tarik.',
          malaysian_context: 'National favorite breakfast combination'
        },
        {
          items: ['Mee Goreng', 'Milo Ais'],
          frequency: 32,
          suggested_price: 10.50,
          original_price: 12.00,
          savings: 1.50,
          confidence: 85,
          reason: 'Hearty meal combination preferred by lunch customers.',
          malaysian_context: 'Fulfilling lunch combo for office workers'
        }
      ],
      demo: true
    };

    res.json(demoComboData);
  } catch (error) {
    logger.error('Error generating demo combo recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating demo data',
      error: error.message
    });
  }
});

// Public demo endpoint for frequent items
router.get('/demo/frequent-items', async (req, res) => {
  try {
    const demoFrequentItems = {
      success: true,
      data: [
        {
          product_name: 'Teh Tarik',
          category: 'Beverages',
          frequency: 156,
          total_revenue: 468.00,
          average_price: 3.00,
          peak_hours: ['07:00', '08:00', '15:00', '16:00'],
          malaysian_favorite: true
        },
        {
          product_name: 'Nasi Lemak',
          category: 'Main Course',
          frequency: 98,
          total_revenue: 980.00,
          average_price: 10.00,
          peak_hours: ['07:00', '08:00', '12:00', '13:00'],
          malaysian_favorite: true
        },
        {
          product_name: 'Roti Canai',
          category: 'Main Course',
          frequency: 87,
          total_revenue: 435.00,
          average_price: 5.00,
          peak_hours: ['07:00', '08:00', '19:00', '20:00'],
          malaysian_favorite: true
        },
        {
          product_name: 'Milo Ais',
          category: 'Beverages',
          frequency: 76,
          total_revenue: 228.00,
          average_price: 3.00,
          peak_hours: ['12:00', '13:00', '15:00', '16:00'],
          malaysian_favorite: true
        },
        {
          product_name: 'Mee Goreng',
          category: 'Main Course',
          frequency: 65,
          total_revenue: 650.00,
          average_price: 10.00,
          peak_hours: ['12:00', '13:00', '19:00', '20:00'],
          malaysian_favorite: true
        }
      ],
      demo: true
    };

    res.json(demoFrequentItems);
  } catch (error) {
    logger.error('Error generating demo frequent items:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating demo data',
      error: error.message
    });
  }
});

module.exports = router;