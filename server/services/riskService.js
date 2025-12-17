const { pool } = require('../config/database');
const logger = require('../utils/logger');

class RiskService {
  constructor() {
    // Enhanced Malaysian risk factors by state/region with more detailed data
    this.malaysiaRiskFactors = {
      'kelantan': { 
        flood_risk: 0.9, 
        monsoon_risk: 0.8, 
        economic_risk: 0.6,
        agricultural_risk: 0.7,
        infrastructure_risk: 0.5,
        description: 'East coast state with high monsoon and flood risk'
      },
      'terengganu': { 
        flood_risk: 0.8, 
        monsoon_risk: 0.9, 
        economic_risk: 0.5,
        oil_gas_risk: 0.6,
        tourism_risk: 0.7,
        description: 'East coast state with severe monsoon impact'
      },
      'pahang': { 
        flood_risk: 0.7, 
        monsoon_risk: 0.6, 
        economic_risk: 0.5,
        mining_risk: 0.4,
        tourism_risk: 0.6,
        agricultural_risk: 0.5,
        description: 'Largest state with diverse economic activities'
      },
      'johor': { 
        flood_risk: 0.6, 
        economic_risk: 0.7, 
        supply_chain_risk: 0.6,
        manufacturing_risk: 0.5,
        cross_border_risk: 0.7,
        description: 'Southern state with strong manufacturing and Singapore proximity'
      },
      'selangor': { 
        economic_risk: 0.8, 
        competition_risk: 0.7, 
        supply_chain_risk: 0.5,
        infrastructure_risk: 0.4,
        regulatory_risk: 0.6,
        description: 'Most developed state with high economic activity'
      },
      'kuala lumpur': { 
        economic_risk: 0.9, 
        competition_risk: 0.8, 
        regulatory_risk: 0.6,
        property_risk: 0.7,
        infrastructure_risk: 0.3,
        description: 'Capital city with high competition and regulatory complexity'
      },
      'penang': { 
        economic_risk: 0.7, 
        competition_risk: 0.6, 
        supply_chain_risk: 0.5,
        technology_risk: 0.6,
        tourism_risk: 0.5,
        description: 'Northern tech hub with manufacturing base'
      },
      'perak': { 
        flood_risk: 0.5, 
        economic_risk: 0.5, 
        supply_chain_risk: 0.4,
        mining_risk: 0.6,
        agricultural_risk: 0.5,
        description: 'Central state with historical mining activities'
      },
      'kedah': { 
        flood_risk: 0.6, 
        agricultural_risk: 0.8, 
        economic_risk: 0.5,
        rice_bowl_risk: 0.9,
        description: 'Rice bowl state with high agricultural dependency'
      },
      'perlis': { 
        agricultural_risk: 0.9, 
        economic_risk: 0.4,
        rice_bowl_risk: 0.8,
        description: 'Smallest state, primarily agricultural'
      },
      'negeri sembilan': { 
        economic_risk: 0.5, 
        supply_chain_risk: 0.4,
        manufacturing_risk: 0.5,
        description: 'Central state with balanced economy'
      },
      'melaka': { 
        economic_risk: 0.6, 
        tourism_risk: 0.7,
        historical_risk: 0.5,
        description: 'Historical state with strong tourism sector'
      },
      'sabah': { 
        flood_risk: 0.7, 
        earthquake_risk: 0.3, 
        tourism_risk: 0.6,
        agricultural_risk: 0.5,
        logging_risk: 0.4,
        description: 'East Malaysian state with diverse natural resources'
      },
      'sarawak': { 
        flood_risk: 0.6, 
        supply_chain_risk: 0.7, 
        economic_risk: 0.5,
        oil_gas_risk: 0.8,
        logging_risk: 0.6,
        description: 'Largest state with rich natural resources'
      }
    };

    // Business type specific risk factors
    this.businessTypeRisks = {
      'restaurant': {
        supply_chain_risk: 0.7,
        health_safety_risk: 0.8,
        economic_risk: 0.6,
        competition_risk: 0.7,
        regulatory_risk: 0.5
      },
      'retail': {
        supply_chain_risk: 0.6,
        economic_risk: 0.8,
        competition_risk: 0.8,
        technology_risk: 0.5,
        property_risk: 0.4
      },
      'services': {
        economic_risk: 0.7,
        competition_risk: 0.6,
        technology_risk: 0.6,
        regulatory_risk: 0.4,
        human_resource_risk: 0.5
      },
      'manufacturing': {
        supply_chain_risk: 0.8,
        regulatory_risk: 0.7,
        environmental_risk: 0.6,
        technology_risk: 0.5,
        infrastructure_risk: 0.6
      },
      'agriculture': {
        weather_risk: 0.9,
        environmental_risk: 0.7,
        economic_risk: 0.6,
        supply_chain_risk: 0.5,
        regulatory_risk: 0.6
      },
      'construction': {
        weather_risk: 0.7,
        regulatory_risk: 0.8,
        economic_risk: 0.7,
        safety_risk: 0.8,
        supply_chain_risk: 0.6
      }
    };

    // Seasonal risk factors for Malaysia
    this.seasonalRisks = {
      'monsoon_season': { // November to March
        months: [11, 12, 1, 2, 3],
        affected_states: ['kelantan', 'terengganu', 'pahang', 'johor', 'sabah', 'sarawak'],
        risk_multiplier: 1.5
      },
      'haze_season': { // June to October
        months: [6, 7, 8, 9, 10],
        affected_states: ['kuala lumpur', 'selangor', 'perak', 'penang', 'negeri sembilan'],
        risk_multiplier: 1.3
      },
      'festival_season': { // Major shopping periods
        months: [1, 2, 7, 8, 11, 12],
        affected_business_types: ['retail', 'restaurant', 'services'],
        risk_multiplier: 0.8 // Lower risk due to higher activity
      }
    };
  }

  /**
   * Get location-based risk factors for a Malaysian business
   */
  getLocationBasedRisks(location) {
    const locationLower = (location || '').toLowerCase();
    const risks = {
      location_risks: [],
      risk_scores: {},
      state_info: null
    };

    // Identify the state
    let identifiedState = null;
    for (const [state, data] of Object.entries(this.malaysiaRiskFactors)) {
      if (locationLower.includes(state)) {
        identifiedState = state;
        risks.state_info = {
          name: state,
          description: data.description
        };
        break;
      }
    }

    if (identifiedState) {
      const stateRisks = this.malaysiaRiskFactors[identifiedState];
      
      // Add specific location-based risk factors
      for (const [riskType, score] of Object.entries(stateRisks)) {
        if (riskType !== 'description') {
          risks.risk_scores[riskType] = score;
          
          if (score >= 0.7) {
            risks.location_risks.push({
              type: riskType,
              severity: 'HIGH',
              score: score,
              description: this.getRiskDescription(riskType, identifiedState)
            });
          } else if (score >= 0.5) {
            risks.location_risks.push({
              type: riskType,
              severity: 'MEDIUM',
              score: score,
              description: this.getRiskDescription(riskType, identifiedState)
            });
          }
        }
      }
    }

    // Add general location risks if no specific state identified
    if (!identifiedState) {
      risks.location_risks.push({
        type: 'location_unknown',
        severity: 'LOW',
        score: 0.3,
        description: 'Location not specifically identified for risk assessment'
      });
    }

    return risks;
  }

  /**
   * Get seasonal risk adjustments
   */
  getSeasonalRiskAdjustments(location, businessType) {
    const currentMonth = new Date().getMonth() + 1; // 1-12
    const adjustments = {
      current_season: null,
      risk_multiplier: 1.0,
      seasonal_factors: []
    };

    const locationLower = (location || '').toLowerCase();
    const businessTypeLower = (businessType || '').toLowerCase();

    for (const [season, data] of Object.entries(this.seasonalRisks)) {
      const isSeasonMonth = data.months.includes(currentMonth);
      const isAffectedState = data.affected_states && data.affected_states.some(state =>
        locationLower.includes(state)
      );
      const isAffectedBusiness = data.affected_business_types && data.affected_business_types.some(type =>
        businessTypeLower.includes(type)
      );

      if (isSeasonMonth && (isAffectedState || isAffectedBusiness)) {
        adjustments.current_season = season;
        adjustments.risk_multiplier = data.risk_multiplier;
        adjustments.seasonal_factors = this.getSeasonalRiskFactors(season);
        break;
      }
    }

    return adjustments;
  }

  /**
   * Perform comprehensive risk analysis with location-based factors
   */
  async performComprehensiveRiskAnalysis(business, emergencyFund, transactions) {
    const location = business.location || '';
    const businessType = business.business_type || '';
    
    // Get location-based risks
    const locationRisks = this.getLocationBasedRisks(location);
    
    // Get seasonal adjustments
    const seasonalAdjustments = this.getSeasonalRiskAdjustments(location, businessType);
    
    // Get business type risks
    const businessTypeRisks = this.businessTypeRisks[businessType.toLowerCase()] || {};
    
    // Emergency fund analysis
    const currentBalance = parseFloat(emergencyFund?.current_balance) || 0;
    const targetBalance = parseFloat(emergencyFund?.target_balance) || 0;
    const fundRatio = targetBalance > 0 ? currentBalance / targetBalance : 0;
    
    // Transaction pattern analysis
    const recentWithdrawals = transactions.filter(t => t.transaction_type === 'withdrawal').length;
    const contributionFrequency = transactions.filter(t => t.transaction_type === 'contribution').length;
    
    // Calculate comprehensive risk score
    let riskScore = 0;
    const riskFactors = [];
    
    // Location-based risks (40% weight)
    let locationScore = 0;
    let locationFactors = 0;
    for (const [riskType, score] of Object.entries(locationRisks.risk_scores)) {
      locationScore += score * 100;
      locationFactors++;
      riskFactors.push(`${riskType.replace('_', ' ')} risk (${Math.round(score * 100)}%)`);
    }
    const avgLocationScore = locationFactors > 0 ? locationScore / locationFactors : 0;
    riskScore += avgLocationScore * 0.4;
    
    // Business type risks (25% weight)
    let businessScore = 0;
    let businessFactors = 0;
    for (const [riskType, score] of Object.entries(businessTypeRisks)) {
      businessScore += score * 100;
      businessFactors++;
      riskFactors.push(`${riskType.replace('_', ' ')} risk (${Math.round(score * 100)}%)`);
    }
    const avgBusinessScore = businessFactors > 0 ? businessScore / businessFactors : 0;
    riskScore += avgBusinessScore * 0.25;
    
    // Financial risks (25% weight)
    let financialScore = 0;
    if (fundRatio < 0.3) {
      financialScore += 50;
      riskFactors.push('Emergency fund critically low');
    } else if (fundRatio < 0.6) {
      financialScore += 25;
      riskFactors.push('Emergency fund below recommended level');
    }
    
    if (recentWithdrawals > 3) {
      financialScore += 30;
      riskFactors.push('High frequency of emergency withdrawals');
    }
    
    if (contributionFrequency < 2) {
      financialScore += 15;
      riskFactors.push('Low contribution frequency');
    }
    riskScore += financialScore * 0.25;
    
    // Operational risks (10% weight)
    let operationalScore = 0;
    if (transactions.length === 0) {
      operationalScore += 40;
      riskFactors.push('No transaction history available');
    }
    riskScore += operationalScore * 0.10;
    
    // Apply seasonal multiplier
    riskScore *= seasonalAdjustments.risk_multiplier;
    
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
    const mitigationRecommendations = this.generateMitigationRecommendations({
      locationRisks,
      businessTypeRisks,
      fundRatio,
      seasonalAdjustments,
      severityLevel,
      location,
      businessType
    });
    
    // Determine primary risk type
    const primaryRiskType = this.determinePrimaryRiskType(locationRisks, businessTypeRisks, fundRatio);
    
    return {
      riskType: primaryRiskType,
      severityLevel,
      riskScore: Math.min(riskScore, 100),
      probability: Math.min(riskScore + 10, 100),
      impact: Math.min(riskScore + 5, 100),
      description: this.generateComprehensiveRiskDescription(severityLevel, riskFactors, locationRisks, seasonalAdjustments),
      riskFactors,
      mitigationRecommendations,
      locationAnalysis: locationRisks,
      seasonalAnalysis: seasonalAdjustments,
      businessTypeAnalysis: businessTypeRisks
    };
  }

  /**
   * Generate detailed risk description
   */
  generateComprehensiveRiskDescription(severityLevel, riskFactors, locationRisks, seasonalAdjustments) {
    const baseDescriptions = {
      'CRITICAL': 'Business faces immediate and severe risks that require urgent attention.',
      'HIGH': 'Business faces significant risks that could impact operations. Immediate action recommended.',
      'MEDIUM': 'Business faces moderate risks that should be monitored and addressed.',
      'LOW': 'Business risks are minimal but regular monitoring is recommended.'
    };
    
    let description = baseDescriptions[severityLevel];
    
    // Add location context
    if (locationRisks.state_info) {
      description += ` Located in ${locationRisks.state_info.name}: ${locationRisks.state_info.description}.`;
    }
    
    // Add seasonal context
    if (seasonalAdjustments.current_season) {
      description += ` Currently in ${seasonalAdjustments.current_season.replace('_', ' ')} which affects risk levels.`;
    }
    
    // Add key factors
    description += ' Key factors: ' + riskFactors.slice(0, 3).join(', ');
    
    return description;
  }

  /**
   * Generate targeted mitigation recommendations
   */
  generateMitigationRecommendations(data) {
    const recommendations = [];
    const { locationRisks, businessTypeRisks, fundRatio, seasonalAdjustments, severityLevel, location, businessType } = data;
    
    // Financial recommendations
    if (fundRatio < 0.6) {
      recommendations.push('Increase emergency fund contributions immediately');
      recommendations.push('Review and reduce non-essential expenses');
      if (fundRatio < 0.3) {
        recommendations.push('Consider emergency financing options');
      }
    }
    
    // Location-specific recommendations
    if (locationRisks.risk_scores.flood_risk >= 0.7) {
      recommendations.push('Prepare comprehensive flood protection measures');
      recommendations.push('Secure important documents and equipment in waterproof containers');
      recommendations.push('Establish alternative business location or work-from-home plan');
    }
    
    if (locationRisks.risk_scores.monsoon_risk >= 0.7) {
      recommendations.push('Prepare for monsoon season with emergency supplies');
      recommendations.push('Monitor weather forecasts regularly');
      recommendations.push('Develop business continuity plan for severe weather');
    }
    
    if (locationRisks.risk_scores.economic_risk >= 0.7) {
      recommendations.push('Diversify revenue streams');
      recommendations.push('Focus on customer retention');
      recommendations.push('Monitor economic indicators and adjust business strategy');
    }
    
    // Business type recommendations
    if (businessType.toLowerCase().includes('restaurant')) {
      recommendations.push('Maintain multiple suppliers for key ingredients');
      recommendations.push('Implement strict food safety protocols');
      recommendations.push('Consider delivery and takeaway options');
    }
    
    if (businessType.toLowerCase().includes('retail')) {
      recommendations.push('Develop e-commerce capabilities');
      recommendations.push('Optimize inventory management');
      recommendations.push('Focus on customer experience and loyalty');
    }
    
    // Seasonal recommendations
    if (seasonalAdjustments.current_season === 'monsoon_season') {
      recommendations.push('Ensure adequate insurance coverage for weather-related damage');
      recommendations.push('Prepare for potential supply chain disruptions');
    }
    
    if (seasonalAdjustments.current_season === 'haze_season') {
      recommendations.push('Prepare air purification systems for indoor businesses');
      recommendations.push('Consider remote work options for staff');
    }
    
    // Severity-based recommendations
    if (severityLevel === 'CRITICAL') {
      recommendations.push('IMMEDIATE: Conduct comprehensive business review');
      recommendations.push('IMMEDIATE: Seek professional business consulting');
      recommendations.push('IMMEDIATE: Implement crisis management plan');
    }
    
    // General recommendations
    recommendations.push('Regular risk monitoring and assessment');
    recommendations.push('Develop and update business continuity plan');
    recommendations.push('Maintain emergency contact lists');
    recommendations.push('Regular staff training on emergency procedures');
    
    // Remove duplicates and limit to 10 most important
    return [...new Set(recommendations)].slice(0, 10);
  }

  /**
   * Determine primary risk type based on analysis
   */
  determinePrimaryRiskType(locationRisks, businessTypeRisks, fundRatio) {
    const scores = {};
    
    // Aggregate location risks
    for (const [riskType, score] of Object.entries(locationRisks.risk_scores)) {
      if (!scores[riskType]) scores[riskType] = 0;
      scores[riskType] += score * 0.4; // 40% weight
    }
    
    // Aggregate business type risks
    for (const [riskType, score] of Object.entries(businessTypeRisks)) {
      if (!scores[riskType]) scores[riskType] = 0;
      scores[riskType] += score * 0.25; // 25% weight
    }
    
    // Add financial risk
    const financialRisk = fundRatio < 0.3 ? 0.9 : fundRatio < 0.6 ? 0.6 : 0.3;
    scores.financial = (scores.financial || 0) + financialRisk * 0.25; // 25% weight
    
    // Find highest scoring risk type
    let maxScore = 0;
    let primaryRiskType = 'general';
    
    for (const [riskType, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        primaryRiskType = riskType;
      }
    }
    
    return primaryRiskType;
  }

  /**
   * Get description for specific risk type
   */
  getRiskDescription(riskType, state) {
    const descriptions = {
      flood_risk: `${state} is prone to seasonal flooding, especially during monsoon season`,
      monsoon_risk: `${state} experiences severe monsoon conditions affecting business operations`,
      economic_risk: `${state} faces economic challenges that may affect business profitability`,
      competition_risk: `High market competition in ${state} requires strong differentiation`,
      supply_chain_risk: `Supply chain disruptions are more likely in ${state}`,
      agricultural_risk: `Agricultural dependency in ${state} creates weather-related vulnerabilities`,
      tourism_risk: `Tourism-dependent economy in ${state} is sensitive to external factors`
    };
    
    return descriptions[riskType] || `Risk factor identified in ${state}`;
  }

  /**
   * Get seasonal risk factors
   */
  getSeasonalRiskFactors(season) {
    const factors = {
      monsoon_season: [
        'Heavy rainfall and flooding',
        'Supply chain disruptions',
        'Power outages',
        'Transportation difficulties',
        'Reduced customer traffic'
      ],
      haze_season: [
        'Poor air quality affecting health',
        'Reduced outdoor activities',
        'Supply chain disruptions from Indonesia',
        'Tourism impact',
        'Health concerns for staff and customers'
      ],
      festival_season: [
        'Increased competition',
        'Supply chain pressure',
        'Staffing challenges',
        'Higher operational costs',
        'Opportunity for increased revenue'
      ]
    };
    
    return factors[season] || [];
  }
}

module.exports = new RiskService();