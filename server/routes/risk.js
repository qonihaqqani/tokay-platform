const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const logger = require('../utils/logger');
const riskService = require('../services/riskService');

// Get current risk level for a business
router.get('/current/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
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

    // Get latest risk assessment
    const query = `
      SELECT * FROM risk_assessments 
      WHERE business_id = $1 
      ORDER BY assessment_date DESC, created_at DESC 
      LIMIT 1
    `;
    
    const result = await pool.query(query, [businessId]);
    
    if (result.rows.length === 0) {
      return res.json({
        success: true,
        riskLevel: 'LOW',
        riskScore: 0,
        message: 'No risk assessments available'
      });
    }

    const latestAssessment = result.rows[0];

    res.json({
      success: true,
      riskLevel: latestAssessment.severity_level,
      riskScore: latestAssessment.risk_score,
      assessment: latestAssessment,
      lastUpdated: latestAssessment.assessment_date
    });

  } catch (error) {
    logger.error('Error fetching current risk level:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching risk level',
      error: error.message
    });
  }
});

// Get all risk assessments for a business
router.get('/', async (req, res) => {
  try {
    const { businessId, riskType, severity, limit = 50, offset = 0 } = req.query;
    const userId = req.user.id;

    if (!businessId) {
      return res.status(400).json({
        success: false,
        message: 'Business ID is required'
      });
    }

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

    let query = `
      SELECT ra.*, b.name as business_name 
      FROM risk_assessments ra
      LEFT JOIN businesses b ON ra.business_id = b.id
      WHERE ra.business_id = $1
    `;
    const params = [businessId];

    if (riskType) {
      query += ` AND ra.risk_type = $${params.length + 1}`;
      params.push(riskType);
    }

    if (severity) {
      query += ` AND ra.severity_level = $${params.length + 1}`;
      params.push(severity);
    }

    query += ` ORDER BY ra.assessment_date DESC, ra.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM risk_assessments WHERE business_id = $1';
    const countParams = [businessId];

    if (riskType) {
      countQuery += ` AND risk_type = $${countParams.length + 1}`;
      countParams.push(riskType);
    }

    if (severity) {
      countQuery += ` AND severity_level = $${countParams.length + 1}`;
      countParams.push(severity);
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      assessments: result.rows,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: totalCount
      }
    });

  } catch (error) {
    logger.error('Error fetching risk assessments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching risk assessments',
      error: error.message
    });
  }
});

// Run AI risk analysis for a business
router.post('/analyze/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const userId = req.user.id;

    // Verify business belongs to user
    const businessCheck = await pool.query(
      'SELECT id, location, business_type FROM businesses WHERE id = $1 AND user_id = $2',
      [businessId, userId]
    );

    if (businessCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    const business = businessCheck.rows[0];

    // Get business data for analysis
    const emergencyFundQuery = `
      SELECT * FROM emergency_funds WHERE business_id = $1
    `;
    const fundResult = await pool.query(emergencyFundQuery, [businessId]);
    const emergencyFund = fundResult.rows[0];

    // Get recent transactions for spending pattern analysis
    const transactionsQuery = `
      SELECT * FROM emergency_fund_transactions 
      WHERE business_id = $1 
      ORDER BY created_at DESC 
      LIMIT 30
    `;
    const transactionsResult = await pool.query(transactionsQuery, [businessId]);

    // Perform comprehensive AI risk analysis with location-based factors
    const riskAnalysis = await riskService.performComprehensiveRiskAnalysis(
      business,
      emergencyFund,
      transactionsResult.rows
    );

    // Save risk assessment
    const insertQuery = `
      INSERT INTO risk_assessments 
      (business_id, risk_type, severity_level, risk_score, probability, impact, 
       risk_description, risk_factors, mitigation_recommendations, assessment_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_DATE)
      RETURNING *
    `;

    const values = [
      businessId,
      riskAnalysis.riskType,
      riskAnalysis.severityLevel,
      riskAnalysis.riskScore,
      riskAnalysis.probability,
      riskAnalysis.impact,
      riskAnalysis.description,
      JSON.stringify(riskAnalysis.riskFactors),
      JSON.stringify(riskAnalysis.mitigationRecommendations)
    ];

    const result = await pool.query(insertQuery, values);
    const assessment = result.rows[0];

    logger.info(`Risk analysis completed for business ${businessId}: ${riskAnalysis.severityLevel}`);

    res.json({
      success: true,
      assessment,
      analysis: riskAnalysis,
      message: 'Risk analysis completed successfully'
    });

  } catch (error) {
    logger.error('Error running risk analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Error running risk analysis',
      error: error.message
    });
  }
});

// Get risk history for a business
router.get('/history/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { period = '30' } = req.query; // days
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

    const query = `
      SELECT 
        DATE(assessment_date) as date,
        AVG(risk_score) as avg_risk_score,
        severity_level,
        COUNT(*) as assessment_count
      FROM risk_assessments 
      WHERE business_id = $1 
        AND assessment_date >= CURRENT_DATE - INTERVAL '${period} days'
      GROUP BY DATE(assessment_date), severity_level
      ORDER BY date DESC
    `;
    
    const result = await pool.query(query, [businessId]);

    res.json({
      success: true,
      history: result.rows,
      period: parseInt(period)
    });

  } catch (error) {
    logger.error('Error fetching risk history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching risk history',
      error: error.message
    });
  }
});

// Get mitigation recommendations
router.get('/recommendations/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
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

    // Get latest high-risk assessments
    const query = `
      SELECT * FROM risk_assessments 
      WHERE business_id = $1 
        AND severity_level IN ('HIGH', 'CRITICAL')
      ORDER BY assessment_date DESC, created_at DESC 
      LIMIT 5
    `;
    
    const result = await pool.query(query, [businessId]);

    // Aggregate recommendations
    const recommendations = [];
    const riskFactors = new Set();

    result.rows.forEach(assessment => {
      if (assessment.mitigation_recommendations) {
        recommendations.push(...JSON.parse(assessment.mitigation_recommendations));
      }
      if (assessment.risk_factors) {
        JSON.parse(assessment.risk_factors).forEach(factor => riskFactors.add(factor));
      }
    });

    // Remove duplicates and prioritize
    const uniqueRecommendations = [...new Set(recommendations)];
    const uniqueRiskFactors = [...new Set(riskFactors)];

    res.json({
      success: true,
      recommendations: uniqueRecommendations.slice(0, 10), // Top 10
      riskFactors: uniqueRiskFactors,
      highRiskCount: result.rows.length,
      lastAssessed: result.rows[0]?.assessment_date || null
    });

  } catch (error) {
    logger.error('Error fetching recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recommendations',
      error: error.message
    });
  }
});

// Legacy function kept for backward compatibility
// Note: This function is deprecated. Use riskService.performComprehensiveRiskAnalysis instead.
async function performRiskAnalysis(business, emergencyFund, transactions) {
  logger.warn('Using deprecated performRiskAnalysis function. Consider upgrading to riskService.performComprehensiveRiskAnalysis');
  
  const location = business.location || '';
  const businessType = business.business_type || '';
  
  // Location-based risk factors
  const floodProneAreas = ['kelantan', 'terengganu', 'pahang', 'johor', 'perak', 'selangor'];
  const isFloodProne = floodProneAreas.some(area => location.toLowerCase().includes(area));
  
  // Emergency fund analysis
  const currentBalance = parseFloat(emergencyFund?.current_balance) || 0;
  const targetBalance = parseFloat(emergencyFund?.target_balance) || 0;
  const fundRatio = targetBalance > 0 ? currentBalance / targetBalance : 0;
  
  // Transaction pattern analysis
  const recentWithdrawals = transactions.filter(t => t.transaction_type === 'withdrawal').length;
  const contributionFrequency = transactions.filter(t => t.transaction_type === 'contribution').length;
  
  // Calculate risk factors
  const riskFactors = [];
  let riskScore = 0;
  
  // Location risk
  if (isFloodProne) {
    riskFactors.push('Located in flood-prone area');
    riskScore += 25;
  }
  
  // Financial risk
  if (fundRatio < 0.3) {
    riskFactors.push('Emergency fund critically low');
    riskScore += 30;
  } else if (fundRatio < 0.6) {
    riskFactors.push('Emergency fund below recommended level');
    riskScore += 15;
  }
  
  // Transaction pattern risk
  if (recentWithdrawals > 3) {
    riskFactors.push('High frequency of emergency withdrawals');
    riskScore += 20;
  }
  
  if (contributionFrequency < 2) {
    riskFactors.push('Low contribution frequency');
    riskScore += 10;
  }
  
  // Business type risk
  const highRiskTypes = ['restaurant', 'retail', 'construction', 'agriculture'];
  if (highRiskTypes.includes(businessType.toLowerCase())) {
    riskFactors.push('High-risk business category');
    riskScore += 15;
  }
  
  // Determine severity level
  let severityLevel;
  if (riskScore >= 70) {
    severityLevel = 'CRITICAL';
  } else if (riskScore >= 50) {
    severityLevel = 'HIGH';
  } else if (riskScore >= 30) {
    severityLevel = 'MEDIUM';
  } else {
    severityLevel = 'LOW';
  }
  
  // Generate mitigation recommendations
  const mitigationRecommendations = [];
  
  if (fundRatio < 0.6) {
    mitigationRecommendations.push('Increase emergency fund contributions immediately');
    mitigationRecommendations.push('Review and reduce non-essential expenses');
  }
  
  if (isFloodProne) {
    mitigationRecommendations.push('Prepare flood protection measures');
    mitigationRecommendations.push('Secure important documents and equipment');
    mitigationRecommendations.push('Establish alternative business location');
  }
  
  if (recentWithdrawals > 3) {
    mitigationRecommendations.push('Review emergency fund usage policy');
    mitigationRecommendations.push('Identify and address root cause of frequent withdrawals');
  }
  
  mitigationRecommendations.push('Regular risk monitoring and assessment');
  mitigationRecommendations.push('Develop business continuity plan');
  
  // Determine primary risk type
  let riskType = 'financial';
  if (isFloodProne) riskType = 'flood';
  if (recentWithdrawals > 3) riskType = 'operational';
  if (businessType.toLowerCase().includes('restaurant') || businessType.toLowerCase().includes('food')) {
    riskType = 'supply_chain';
  }
  
  return {
    riskType,
    severityLevel,
    riskScore: Math.min(riskScore, 100),
    probability: Math.min(riskScore + 10, 100), // Slightly higher probability
    impact: Math.min(riskScore + 5, 100), // Slightly higher impact
    description: generateRiskDescription(severityLevel, riskFactors),
    riskFactors,
    mitigationRecommendations
  };
}

function generateRiskDescription(severityLevel, riskFactors) {
  const descriptions = {
    'CRITICAL': 'Business faces immediate and severe risks that require urgent attention. Multiple risk factors identified.',
    'HIGH': 'Business faces significant risks that could impact operations. Immediate action recommended.',
    'MEDIUM': 'Business faces moderate risks that should be monitored and addressed.',
    'LOW': 'Business risks are minimal but regular monitoring is recommended.'
  };
  
  return descriptions[severityLevel] + ' Key factors: ' + riskFactors.slice(0, 3).join(', ');
}

// Get location-based risk analysis
router.get('/location/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const userId = req.user.id;

    // Verify business belongs to user
    const businessCheck = await pool.query(
      'SELECT id, location, business_type FROM businesses WHERE id = $1 AND user_id = $2',
      [businessId, userId]
    );

    if (businessCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    const business = businessCheck.rows[0];

    // Get location-based risks
    const locationRisks = riskService.getLocationBasedRisks(business.location);
    
    // Get seasonal adjustments
    const seasonalAdjustments = riskService.getSeasonalRiskAdjustments(business.location, business.business_type);

    res.json({
      success: true,
      business: {
        id: business.id,
        location: business.location,
        businessType: business.business_type
      },
      locationRisks,
      seasonalAdjustments,
      analysis: {
        state: locationRisks.state_info,
        primaryRisks: locationRisks.location_risks,
        seasonalImpact: seasonalAdjustments.current_season,
        riskMultiplier: seasonalAdjustments.risk_multiplier
      }
    });

  } catch (error) {
    logger.error('Error fetching location-based risks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching location-based risks',
      error: error.message
    });
  }
});

module.exports = router;