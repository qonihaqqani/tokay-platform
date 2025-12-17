const { pool } = require('../config/database');
const logger = require('../utils/logger');

class AlertService {
  constructor() {
    // Malaysian disaster types and their typical warning times
    this.disasterTypes = {
      'flood': {
        name: 'Banjir',
        warningTime: 24, // hours
        severityLevels: ['low', 'medium', 'high', 'critical'],
        colorCodes: {
          low: '#2196F3',
          medium: '#FF9800',
          high: '#F44336',
          critical: '#9C27B0'
        }
      },
      'landslide': {
        name: 'Tanah Runtuh',
        warningTime: 6,
        severityLevels: ['medium', 'high', 'critical'],
        colorCodes: {
          medium: '#FF9800',
          high: '#F44336',
          critical: '#9C27B0'
        }
      },
      'haze': {
        name: 'Jerebu',
        warningTime: 48,
        severityLevels: ['low', 'medium', 'high'],
        colorCodes: {
          low: '#2196F3',
          medium: '#FF9800',
          high: '#F44336'
        }
      },
      'earthquake': {
        name: 'Gempa Bumi',
        warningTime: 0, // No warning
        severityLevels: ['high', 'critical'],
        colorCodes: {
          high: '#F44336',
          critical: '#9C27B0'
        }
      },
      'supply_chain': {
        name: 'Gangguan Rantaian Bekalan',
        warningTime: 72,
        severityLevels: ['low', 'medium', 'high'],
        colorCodes: {
          low: '#2196F3',
          medium: '#FF9800',
          high: '#F44336'
        }
      },
      'health_emergency': {
        name: 'Kecemasan Kesihatan',
        warningTime: 48,
        severityLevels: ['medium', 'high', 'critical'],
        colorCodes: {
          medium: '#FF9800',
          high: '#F44336',
          critical: '#9C27B0'
        }
      }
    };

    // Malaysian states and their typical risk factors
    this.stateRisks = {
      'Kelantan': ['flood', 'landslide'],
      'Terengganu': ['flood'],
      'Pahang': ['flood', 'landslide'],
      'Johor': ['flood', 'haze'],
      'Perak': ['flood', 'landslide'],
      'Selangor': ['flood', 'haze', 'landslide'],
      'Negeri Sembilan': ['flood'],
      'Melaka': ['flood'],
      'Kedah': ['flood'],
      'Perlis': ['flood'],
      'Pulau Pinang': ['flood', 'landslide'],
      'Sabah': ['flood', 'landslide', 'earthquake'],
      'Sarawak': ['flood', 'landslide']
    };
  }

  /**
   * Create a new alert
   */
  async createAlert(businessId, alertData) {
    try {
      const {
        alertType,
        severity,
        title,
        description,
        affectedAreas,
        recommendedActions,
        estimatedDuration,
        source
      } = alertData;

      const query = `
        INSERT INTO alerts 
        (business_id, alert_type, severity, title, description, affected_areas, 
         recommended_actions, estimated_duration, source, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
        RETURNING *
      `;

      const values = [
        businessId,
        alertType,
        severity,
        title,
        description,
        JSON.stringify(affectedAreas || []),
        JSON.stringify(recommendedActions || []),
        estimatedDuration,
        source || 'tokay_system',
        'active'
      ];

      const result = await pool.query(query, values);
      const alert = result.rows[0];

      // Send real-time notification via Socket.IO
      this.sendRealtimeAlert(businessId, alert);

      logger.info(`Alert created for business ${businessId}: ${title}`);
      
      return {
        success: true,
        alert
      };

    } catch (error) {
      logger.error('Error creating alert:', error);
      throw error;
    }
  }

  /**
   * Get active alerts for a business
   */
  async getActiveAlerts(businessId) {
    try {
      const query = `
        SELECT * FROM alerts 
        WHERE business_id = $1 AND status = 'active'
        ORDER BY severity DESC, created_at DESC
      `;
      
      const result = await pool.query(query, [businessId]);
      
      return {
        success: true,
        alerts: result.rows
      };

    } catch (error) {
      logger.error('Error fetching active alerts:', error);
      throw error;
    }
  }

  /**
   * Get all alerts for a business with pagination
   */
  async getAlerts(businessId, options = {}) {
    try {
      const { page = 1, limit = 20, severity, alertType, status } = options;
      const offset = (page - 1) * limit;

      let query = `
        SELECT * FROM alerts 
        WHERE business_id = $1
      `;
      const params = [businessId];

      if (severity) {
        query += ` AND severity = $${params.length + 1}`;
        params.push(severity);
      }

      if (alertType) {
        query += ` AND alert_type = $${params.length + 1}`;
        params.push(alertType);
      }

      if (status) {
        query += ` AND status = $${params.length + 1}`;
        params.push(status);
      }

      query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);

      // Get total count
      let countQuery = 'SELECT COUNT(*) FROM alerts WHERE business_id = $1';
      const countParams = [businessId];

      if (severity) {
        countQuery += ` AND severity = $${countParams.length + 1}`;
        countParams.push(severity);
      }

      if (alertType) {
        countQuery += ` AND alert_type = $${countParams.length + 1}`;
        countParams.push(alertType);
      }

      if (status) {
        countQuery += ` AND status = $${countParams.length + 1}`;
        countParams.push(status);
      }

      const countResult = await pool.query(countQuery, countParams);
      const totalCount = parseInt(countResult.rows[0].count);

      return {
        success: true,
        alerts: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      };

    } catch (error) {
      logger.error('Error fetching alerts:', error);
      throw error;
    }
  }

  /**
   * Update alert status
   */
  async updateAlertStatus(alertId, businessId, status) {
    try {
      const query = `
        UPDATE alerts 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 AND business_id = $3
        RETURNING *
      `;

      const result = await pool.query(query, [status, alertId, businessId]);
      
      if (result.rows.length === 0) {
        throw new Error('Alert not found');
      }

      logger.info(`Alert ${alertId} status updated to ${status}`);
      
      return {
        success: true,
        alert: result.rows[0]
      };

    } catch (error) {
      logger.error('Error updating alert status:', error);
      throw error;
    }
  }

  /**
   * Generate automatic alerts based on risk assessments
   */
  async generateRiskBasedAlerts(businessId, riskAssessment) {
    try {
      const { severity_level, risk_type, risk_factors, mitigation_recommendations } = riskAssessment;

      if (severity_level === 'CRITICAL' || severity_level === 'HIGH') {
        const alertData = {
          alertType: risk_type,
          severity: severity_level.toLowerCase(),
          title: `High Risk Alert: ${this.disasterTypes[risk_type]?.name || risk_type}`,
          description: `AI risk assessment has detected ${severity_level.toLowerCase()} risk level for ${risk_type}. Immediate attention required.`,
          affectedAreas: ['Business Location'],
          recommendedActions: mitigation_recommendations || [],
          estimatedDuration: 'Until risk factors are addressed',
          source: 'ai_risk_assessment'
        };

        return await this.createAlert(businessId, alertData);
      }

      return { success: true, message: 'No alert generated - risk level is manageable' };

    } catch (error) {
      logger.error('Error generating risk-based alert:', error);
      throw error;
    }
  }

  /**
   * Check for external disaster alerts (weather, government, etc.)
   */
  async checkExternalAlerts(businessLocation) {
    try {
      // This would integrate with external APIs
      // For now, we'll simulate based on location
      const mockWeatherData = await this.getMockWeatherData(businessLocation);
      const alerts = [];

      if (mockWeatherData.floodRisk === 'high') {
        alerts.push({
          alertType: 'flood',
          severity: 'high',
          title: 'Flood Warning',
          description: 'Heavy rainfall expected in your area. Flood risk is high.',
          affectedAreas: [businessLocation],
          recommendedActions: [
            'Move valuable items to higher ground',
            'Prepare emergency kit',
            'Monitor local news updates',
            'Consider temporary business closure'
          ],
          estimatedDuration: '24-48 hours',
          source: 'meteorological_department'
        });
      }

      if (mockWeatherData.hazeLevel > 150) {
        alerts.push({
          alertType: 'haze',
          severity: 'medium',
          title: 'Haze Alert',
          description: 'Air quality has reached unhealthy levels.',
          affectedAreas: [businessLocation],
          recommendedActions: [
            'Limit outdoor activities',
            'Use air purifiers indoors',
            'Provide masks for employees',
            'Monitor air quality index'
          ],
          estimatedDuration: '2-3 days',
          source: 'department_of_environment'
        });
      }

      return alerts;

    } catch (error) {
      logger.error('Error checking external alerts:', error);
      throw error;
    }
  }

  /**
   * Send real-time alert via Socket.IO
   */
  sendRealtimeAlert(businessId, alert) {
    // This would use the Socket.IO instance from the main server
    // For now, we'll just log it
    logger.info(`Real-time alert sent to business ${businessId}:`, alert.title);
  }

  /**
   * Mock weather data for demonstration
   */
  async getMockWeatherData(location) {
    // Simulate different weather conditions based on location
    const locationLower = location.toLowerCase();
    
    if (locationLower.includes('kelantan') || locationLower.includes('terengganu')) {
      return {
        floodRisk: 'high',
        hazeLevel: 50,
        temperature: 28,
        humidity: 85
      };
    } else if (locationLower.includes('kuala lumpur') || locationLower.includes('selangor')) {
      return {
        floodRisk: 'medium',
        hazeLevel: 120,
        temperature: 32,
        humidity: 75
      };
    } else {
      return {
        floodRisk: 'low',
        hazeLevel: 30,
        temperature: 30,
        humidity: 70
      };
    }
  }

  /**
   * Get alert statistics for a business
   */
  async getAlertStatistics(businessId, period = 30) {
    try {
      const query = `
        SELECT 
          alert_type,
          severity,
          COUNT(*) as count,
          DATE(created_at) as date
        FROM alerts 
        WHERE business_id = $1 
          AND created_at >= CURRENT_DATE - INTERVAL '${period} days'
        GROUP BY alert_type, severity, DATE(created_at)
        ORDER BY date DESC
      `;
      
      const result = await pool.query(query, [businessId]);
      
      // Process statistics
      const stats = {
        totalAlerts: result.rows.reduce((sum, row) => sum + parseInt(row.count), 0),
        byType: {},
        bySeverity: {},
        dailyTrend: {}
      };

      result.rows.forEach(row => {
        // By type
        if (!stats.byType[row.alert_type]) {
          stats.byType[row.alert_type] = 0;
        }
        stats.byType[row.alert_type] += parseInt(row.count);

        // By severity
        if (!stats.bySeverity[row.severity]) {
          stats.bySeverity[row.severity] = 0;
        }
        stats.bySeverity[row.severity] += parseInt(row.count);

        // Daily trend
        if (!stats.dailyTrend[row.date]) {
          stats.dailyTrend[row.date] = 0;
        }
        stats.dailyTrend[row.date] += parseInt(row.count);
      });

      return {
        success: true,
        statistics: stats
      };

    } catch (error) {
      logger.error('Error fetching alert statistics:', error);
      throw error;
    }
  }
}

module.exports = new AlertService();