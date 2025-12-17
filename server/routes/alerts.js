const express = require('express');
const router = express.Router();
const alertService = require('../services/alertService');
const { pool } = require('../config/database');
const logger = require('../utils/logger');

// Get active alerts for a business
router.get('/active/:businessId', async (req, res) => {
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

    const result = await alertService.getActiveAlerts(businessId);
    res.json(result);

  } catch (error) {
    logger.error('Error fetching active alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active alerts',
      error: error.message
    });
  }
});

// Get all alerts for a business
router.get('/', async (req, res) => {
  try {
    const { businessId, page, limit, severity, alertType, status } = req.query;
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

    const options = { page, limit, severity, alertType, status };
    const result = await alertService.getAlerts(businessId, options);
    res.json(result);

  } catch (error) {
    logger.error('Error fetching alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching alerts',
      error: error.message
    });
  }
});

// Create a new alert
router.post('/', async (req, res) => {
  try {
    const { businessId, alertType, severity, title, description, affectedAreas, recommendedActions, estimatedDuration, source } = req.body;
    const userId = req.user.id;

    if (!businessId || !alertType || !severity || !title) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: businessId, alertType, severity, title'
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

    const alertData = {
      alertType,
      severity,
      title,
      description,
      affectedAreas,
      recommendedActions,
      estimatedDuration,
      source
    };

    const result = await alertService.createAlert(businessId, alertData);
    res.json(result);

  } catch (error) {
    logger.error('Error creating alert:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating alert',
      error: error.message
    });
  }
});

// Update alert status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    // Get alert to verify business ownership
    const alertQuery = `
      SELECT a.* FROM alerts a
      JOIN businesses b ON a.business_id = b.id
      WHERE a.id = $1 AND b.user_id = $2
    `;
    const alertResult = await pool.query(alertQuery, [id, userId]);

    if (alertResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    const businessId = alertResult.rows[0].business_id;
    const result = await alertService.updateAlertStatus(id, businessId, status);
    res.json(result);

  } catch (error) {
    logger.error('Error updating alert status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating alert status',
      error: error.message
    });
  }
});

// Get alert statistics
router.get('/statistics/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { period = 30 } = req.query;
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

    const result = await alertService.getAlertStatistics(businessId, parseInt(period));
    res.json(result);

  } catch (error) {
    logger.error('Error fetching alert statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching alert statistics',
      error: error.message
    });
  }
});

// Check external alerts (weather, government, etc.)
router.post('/check-external/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const userId = req.user.id;

    // Verify business belongs to user and get location
    const businessQuery = 'SELECT id, location FROM businesses WHERE id = $1 AND user_id = $2';
    const businessResult = await pool.query(businessQuery, [businessId, userId]);

    if (businessResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    const business = businessResult.rows[0];
    const externalAlerts = await alertService.checkExternalAlerts(business.location);

    // Create alerts for any external warnings
    const createdAlerts = [];
    for (const alertData of externalAlerts) {
      try {
        const result = await alertService.createAlert(businessId, alertData);
        if (result.success) {
          createdAlerts.push(result.alert);
        }
      } catch (error) {
        logger.error('Error creating external alert:', error);
      }
    }

    res.json({
      success: true,
      externalAlerts,
      createdAlerts,
      message: `Checked external alerts and created ${createdAlerts.length} new alerts`
    });

  } catch (error) {
    logger.error('Error checking external alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking external alerts',
      error: error.message
    });
  }
});

// Generate alert based on risk assessment
router.post('/from-risk/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { riskAssessmentId } = req.body;
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

    // Get the risk assessment
    const riskQuery = 'SELECT * FROM risk_assessments WHERE id = $1 AND business_id = $2';
    const riskResult = await pool.query(riskQuery, [riskAssessmentId, businessId]);

    if (riskResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Risk assessment not found'
      });
    }

    const riskAssessment = riskResult.rows[0];
    const result = await alertService.generateRiskBasedAlerts(businessId, riskAssessment);
    res.json(result);

  } catch (error) {
    logger.error('Error generating risk-based alert:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating risk-based alert',
      error: error.message
    });
  }
});

// Get single alert
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const query = `
      SELECT a.*, b.name as business_name 
      FROM alerts a
      JOIN businesses b ON a.business_id = b.id
      WHERE a.id = $1 AND b.user_id = $2
    `;

    const result = await pool.query(query, [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.json({
      success: true,
      alert: result.rows[0]
    });

  } catch (error) {
    logger.error('Error fetching alert:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching alert',
      error: error.message
    });
  }
});

// Delete alert
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify alert belongs to user's business
    const alertQuery = `
      SELECT a.* FROM alerts a
      JOIN businesses b ON a.business_id = b.id
      WHERE a.id = $1 AND b.user_id = $2
    `;
    const alertResult = await pool.query(alertQuery, [id, userId]);

    if (alertResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    // Soft delete by updating status
    const result = await alertService.updateAlertStatus(id, alertResult.rows[0].business_id, 'deleted');
    
    res.json({
      success: true,
      message: 'Alert deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting alert:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting alert',
      error: error.message
    });
  }
});

module.exports = router;