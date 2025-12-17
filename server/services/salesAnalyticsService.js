const { db } = require('../config/database');
const logger = require('../utils/logger');

class SalesAnalyticsService {
  /**
   * Analyze sales patterns for a business within a date range
   */
  async analyzeSalesPatterns(businessId, startDate, endDate) {
    try {
      const query = `
        SELECT 
          DATE(i.created_at) as sale_date,
          COUNT(i.id) as total_transactions,
          SUM(i.total_amount) as total_revenue,
          AVG(i.total_amount) as average_transaction_value,
          COUNT(ili.id) as total_items_sold,
          AVG(ili.unit_price) as average_item_price,
          COUNT(CASE WHEN i.total_amount > AVG(i.total_amount) OVER () THEN 1 END) as high_value_transactions
        FROM invoices i
        LEFT JOIN invoice_line_items ili ON i.id = ili.invoice_id
        WHERE i.business_id = $1 
          AND DATE(i.created_at) BETWEEN $2 AND $3
          AND i.status = 'paid'
        GROUP BY DATE(i.created_at)
        ORDER BY sale_date DESC
      `;
      
      const results = await db.query(query, [businessId, startDate, endDate]);
      
      // Calculate patterns and insights
      const patterns = this.identifyPatterns(results.rows);
      
      return {
        dailyData: results.rows,
        patterns,
        insights: this.generateInsights(patterns)
      };
    } catch (error) {
      logger.error('Error analyzing sales patterns:', error);
      throw error;
    }
  }

  /**
   * Segment customers based on their purchasing behavior
   */
  async segmentCustomers(businessId, days = 30) {
    try {
      const query = `
        SELECT 
          COALESCE(i.customer_phone, 'GUEST_' || i.id) as customer_identifier,
          COUNT(i.id) as total_visits,
          SUM(i.total_amount) as total_spent,
          AVG(i.total_amount) as average_transaction_value,
          STRING_AGG(DISTINCT ili.category, ',') as preferred_categories,
          ARRAY_AGG(EXTRACT(HOUR FROM i.created_at)) as purchase_hours
        FROM invoices i
        LEFT JOIN invoice_line_items ili ON i.id = ili.invoice_id
        WHERE i.business_id = $1 
          AND i.created_at >= NOW() - INTERVAL '${days} days'
          AND i.status = 'paid'
        GROUP BY COALESCE(i.customer_phone, 'GUEST_' || i.id)
        HAVING COUNT(i.id) > 0
      `;
      
      const customers = await db.query(query, [businessId]);
      
      // Classify customers
      const segmentedCustomers = customers.rows.map(customer => ({
        ...customer,
        customer_type: this.classifyCustomer(customer),
        is_combo_candidate: this.isComboCandidate(customer)
      }));
      
      return segmentedCustomers;
    } catch (error) {
      logger.error('Error segmenting customers:', error);
      throw error;
    }
  }

  /**
   * Generate combo deal recommendations based on sales data
   */
  async generateComboRecommendations(businessId, days = 30) {
    try {
      // Find frequently bought together items
      const query = `
        WITH item_pairs AS (
          SELECT 
            ili1.product_name as item1,
            ili2.product_name as item2,
            COUNT(*) as frequency,
            AVG(ili1.unit_price + ili2.unit_price) as avg_combined_price
          FROM invoice_line_items ili1
          JOIN invoice_line_items ili2 ON ili1.invoice_id = ili2.invoice_id
          JOIN invoices i ON ili1.invoice_id = i.id
          WHERE ili1.product_name < ili2.product_name
            AND i.business_id = $1
            AND i.created_at >= NOW() - INTERVAL '${days} days'
            AND i.status = 'paid'
          GROUP BY ili1.product_name, ili2.product_name
          HAVING COUNT(*) >= 2
        )
        SELECT * FROM item_pairs
        ORDER BY frequency DESC, avg_combined_price DESC
        LIMIT 10
      `;
      
      const frequentPairs = await db.query(query, [businessId]);
      
      // Generate combo recommendations
      const recommendations = frequentPairs.rows.map(pair => ({
        items: [pair.item1, pair.item2],
        frequency: pair.frequency,
        suggested_price: Math.round(pair.avg_combined_price * 0.85 * 100) / 100, // 15% discount
        savings: Math.round(pair.avg_combined_price * 0.15 * 100) / 100,
        confidence: this.calculateConfidence(pair.frequency, days),
        reason: this.generateComboReason(pair)
      }));
      
      return recommendations;
    } catch (error) {
      logger.error('Error generating combo recommendations:', error);
      throw error;
    }
  }

  /**
   * Calculate profit margins for products
   */
  async calculateProfitMargins(businessId, days = 30) {
    try {
      const query = `
        SELECT 
          ili.product_name,
          ili.product_code,
          SUM(ili.quantity) as total_quantity_sold,
          SUM(ili.line_total) as total_revenue,
          SUM(ili.cost_price * ili.quantity) as total_cost,
          SUM(ili.line_total - (ili.cost_price * ili.quantity)) as total_profit,
          CASE 
            WHEN SUM(ili.cost_price * ili.quantity) > 0 
            THEN (SUM(ili.line_total - (ili.cost_price * ili.quantity)) / SUM(ili.cost_price * ili.quantity)) * 100
            ELSE 0 
          END as profit_margin_percentage
        FROM invoice_line_items ili
        JOIN invoices i ON ili.invoice_id = i.id
        WHERE i.business_id = $1 
          AND i.created_at >= NOW() - INTERVAL '${days} days'
          AND i.status = 'paid'
          AND ili.cost_price IS NOT NULL
        GROUP BY ili.product_name, ili.product_code
        HAVING SUM(ili.quantity) > 0
        ORDER BY total_profit DESC
      `;
      
      const profitData = await db.query(query, [businessId]);
      
      return profitData.rows;
    } catch (error) {
      logger.error('Error calculating profit margins:', error);
      throw error;
    }
  }

  /**
   * Identify peak sales hours
   */
  async identifyPeakHours(businessId, days = 30) {
    try {
      const query = `
        SELECT 
          EXTRACT(HOUR FROM i.created_at) as hour,
          COUNT(i.id) as transaction_count,
          SUM(i.total_amount) as total_revenue,
          AVG(i.total_amount) as average_transaction_value
        FROM invoices i
        WHERE i.business_id = $1 
          AND i.created_at >= NOW() - INTERVAL '${days} days'
          AND i.status = 'paid'
        GROUP BY EXTRACT(HOUR FROM i.created_at)
        ORDER BY hour
      `;
      
      const hourlyData = await db.query(query, [businessId]);
      
      // Identify peak hours
      const peakHours = this.findPeakHours(hourlyData.rows);
      
      return {
        hourlyData: hourlyData.rows,
        peakHours,
        insights: this.generatePeakHourInsights(hourlyData.rows, peakHours)
      };
    } catch (error) {
      logger.error('Error identifying peak hours:', error);
      throw error;
    }
  }

  /**
   * Update daily sales analytics (should be run as a scheduled job)
   */
  async updateDailySalesAnalytics(businessId, saleDate) {
    try {
      // Check if analytics already exist for this date
      const existing = await db.query(
        'SELECT id FROM sales_analytics_daily WHERE business_id = $1 AND sales_date = $2',
        [businessId, saleDate]
      );

      const analyticsData = await this.calculateDailyAnalytics(businessId, saleDate);

      if (existing.rows.length > 0) {
        // Update existing record
        await db.query(
          `UPDATE sales_analytics_daily SET 
            total_transactions = $1,
            total_items_sold = $2,
            total_revenue = $3,
            total_profit = $4,
            average_transaction_value = $5,
            average_item_price = $6,
            high_value_transactions = $7,
            low_value_high_volume_transactions = $8,
            category_breakdown = $9,
            top_products = $10,
            peak_hours = $11,
            updated_at = NOW()
          WHERE business_id = $12 AND sales_date = $13`,
          [
            analyticsData.total_transactions,
            analyticsData.total_items_sold,
            analyticsData.total_revenue,
            analyticsData.total_profit,
            analyticsData.average_transaction_value,
            analyticsData.average_item_price,
            analyticsData.high_value_transactions,
            analyticsData.low_value_high_volume_transactions,
            JSON.stringify(analyticsData.category_breakdown),
            JSON.stringify(analyticsData.top_products),
            JSON.stringify(analyticsData.peak_hours),
            businessId,
            saleDate
          ]
        );
      } else {
        // Insert new record
        await db.query(
          `INSERT INTO sales_analytics_daily (
            business_id, sales_date, total_transactions, total_items_sold, 
            total_revenue, total_profit, average_transaction_value, 
            average_item_price, high_value_transactions, 
            low_value_high_volume_transactions, category_breakdown, 
            top_products, peak_hours
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            businessId,
            saleDate,
            analyticsData.total_transactions,
            analyticsData.total_items_sold,
            analyticsData.total_revenue,
            analyticsData.total_profit,
            analyticsData.average_transaction_value,
            analyticsData.average_item_price,
            analyticsData.high_value_transactions,
            analyticsData.low_value_high_volume_transactions,
            JSON.stringify(analyticsData.category_breakdown),
            JSON.stringify(analyticsData.top_products),
            JSON.stringify(analyticsData.peak_hours)
          ]
        );
      }

      return analyticsData;
    } catch (error) {
      logger.error('Error updating daily sales analytics:', error);
      throw error;
    }
  }

  // Helper methods
  identifyPatterns(dailyData) {
    const patterns = {
      highVolumeLowValue: [],
      lowVolumeHighValue: [],
      consistentPerformers: [],
      volatileDays: []
    };

    const avgTransactionValue = dailyData.reduce((sum, day) => sum + parseFloat(day.average_transaction_value), 0) / dailyData.length;
    const avgTransactionCount = dailyData.reduce((sum, day) => sum + parseInt(day.total_transactions), 0) / dailyData.length;

    dailyData.forEach(day => {
      const avgValue = parseFloat(day.average_transaction_value);
      const transactionCount = parseInt(day.total_transactions);

      if (transactionCount > avgTransactionCount * 1.5 && avgValue < avgTransactionValue * 0.8) {
        patterns.highVolumeLowValue.push(day);
      } else if (transactionCount < avgTransactionCount * 0.8 && avgValue > avgTransactionValue * 1.5) {
        patterns.lowVolumeHighValue.push(day);
      } else if (Math.abs(transactionCount - avgTransactionCount) < avgTransactionCount * 0.2) {
        patterns.consistentPerformers.push(day);
      }

      // Check for volatility (significant deviation from average)
      const revenueDeviation = Math.abs(parseFloat(day.total_revenue) - (dailyData.reduce((sum, d) => sum + parseFloat(d.total_revenue), 0) / dailyData.length));
      const avgRevenue = dailyData.reduce((sum, d) => sum + parseFloat(d.total_revenue), 0) / dailyData.length;
      if (revenueDeviation > avgRevenue * 0.3) {
        patterns.volatileDays.push(day);
      }
    });

    return patterns;
  }

  generateInsights(patterns) {
    const insights = [];

    if (patterns.highVolumeLowValue.length > 0) {
      insights.push({
        type: 'opportunity',
        title: 'High Volume, Low Value Days Detected',
        description: `On ${patterns.highVolumeLowValue.length} day(s), you had high transaction volume but lower average values. Consider creating combo deals to increase average transaction value.`,
        priority: 'high'
      });
    }

    if (patterns.lowVolumeHighValue.length > 0) {
      insights.push({
        type: 'insight',
        title: 'Premium Shopping Days',
        description: `On ${patterns.lowVolumeHighValue.length} day(s), customers made fewer but higher-value purchases. These might be your best customers for premium offerings.`,
        priority: 'medium'
      });
    }

    if (patterns.volatileDays.length > 2) {
      insights.push({
        type: 'warning',
        title: 'Volatile Sales Pattern',
        description: `Your sales show high volatility on ${patterns.volatileDays.length} day(s). Consider investigating external factors or running promotions to stabilize revenue.`,
        priority: 'medium'
      });
    }

    return insights;
  }

  classifyCustomer(customer) {
    const avgTransaction = parseFloat(customer.average_transaction_value);
    const visitCount = parseInt(customer.total_visits);
    const totalSpent = parseFloat(customer.total_spent);

    if (avgTransaction > 100 && visitCount < 5) return 'high_value';
    if (visitCount > 10 && avgTransaction < 50) return 'bargain_hunter';
    if (visitCount > 8) return 'frequent';
    if (totalSpent > 500) return 'vip';
    return 'regular';
  }

  isComboCandidate(customer) {
    const categories = customer.preferred_categories?.split(',') || [];
    return categories.length >= 2 && customer.total_visits >= 3;
  }

  calculateConfidence(frequency, days) {
    const maxPossibleFrequency = days / 2; // Assuming at most one combo per 2 days
    return Math.min((frequency / maxPossibleFrequency) * 100, 95);
  }

  generateComboReason(pair) {
    return `These items are frequently bought together (${pair.frequency} times). A combo deal could increase customer satisfaction and average order value.`;
  }

  findPeakHours(hourlyData) {
    const sortedByRevenue = hourlyData.sort((a, b) => parseFloat(b.total_revenue) - parseFloat(a.total_revenue));
    const sortedByTransactions = hourlyData.sort((a, b) => parseInt(b.transaction_count) - parseInt(a.transaction_count));

    return {
      byRevenue: sortedByRevenue.slice(0, 3).map(h => parseInt(h.hour)),
      byTransactions: sortedByTransactions.slice(0, 3).map(h => parseInt(h.hour))
    };
  }

  generatePeakHourInsights(hourlyData, peakHours) {
    const insights = [];
    
    const peakRevenueHours = peakHours.byRevenue;
    const peakTransactionHours = peakHours.byTransactions;

    if (peakRevenueHours.length > 0) {
      insights.push({
        type: 'peak_revenue',
        title: 'Peak Revenue Hours',
        description: `Your highest revenue hours are ${peakRevenueHours.map(h => `${h}:00`).join(', ')}. Consider premium promotions during these times.`,
        hours: peakRevenueHours
      });
    }

    if (peakTransactionHours.length > 0) {
      insights.push({
        type: 'peak_traffic',
        title: 'Peak Traffic Hours',
        description: `Your busiest hours are ${peakTransactionHours.map(h => `${h}:00`).join(', ')}. Ensure adequate staffing during these times.`,
        hours: peakTransactionHours
      });
    }

    return insights;
  }

  async calculateDailyAnalytics(businessId, saleDate) {
    const query = `
      SELECT 
        COUNT(i.id) as total_transactions,
        COALESCE(SUM(ili.quantity), 0) as total_items_sold,
        COALESCE(SUM(i.total_amount), 0) as total_revenue,
        COALESCE(SUM(i.total_amount - (ili.cost_price * ili.quantity)), 0) as total_profit,
        COALESCE(AVG(i.total_amount), 0) as average_transaction_value,
        COALESCE(AVG(ili.unit_price), 0) as average_item_price,
        COUNT(CASE WHEN i.total_amount > AVG(i.total_amount) OVER () THEN 1 END) as high_value_transactions,
        COUNT(CASE WHEN ili.unit_price < AVG(ili.unit_price) OVER () AND ili.quantity > 3 THEN 1 END) as low_value_high_volume_transactions
      FROM invoices i
      LEFT JOIN invoice_line_items ili ON i.id = ili.invoice_id
      WHERE i.business_id = $1 
        AND DATE(i.created_at) = $2
        AND i.status = 'paid'
    `;

    const result = await db.query(query, [businessId, saleDate]);
    const data = result.rows[0] || {};

    // Get category breakdown
    const categoryQuery = `
      SELECT 
        ili.category,
        SUM(ili.line_total) as revenue,
        SUM(ili.quantity) as quantity
      FROM invoice_line_items ili
      JOIN invoices i ON ili.invoice_id = i.id
      WHERE i.business_id = $1 
        AND DATE(i.created_at) = $2
        AND i.status = 'paid'
        AND ili.category IS NOT NULL
      GROUP BY ili.category
      ORDER BY revenue DESC
    `;

    const categoryResult = await db.query(categoryQuery, [businessId, saleDate]);
    
    // Get top products
    const productQuery = `
      SELECT 
        ili.product_name,
        SUM(ili.line_total) as revenue,
        SUM(ili.quantity) as quantity
      FROM invoice_line_items ili
      JOIN invoices i ON ili.invoice_id = i.id
      WHERE i.business_id = $1 
        AND DATE(i.created_at) = $2
        AND i.status = 'paid'
      GROUP BY ili.product_name
      ORDER BY revenue DESC
      LIMIT 5
    `;

    const productResult = await db.query(productQuery, [businessId, saleDate]);

    // Get peak hours for the day
    const hourQuery = `
      SELECT 
        EXTRACT(HOUR FROM i.created_at) as hour,
        COUNT(i.id) as transactions,
        SUM(i.total_amount) as revenue
      FROM invoices i
      WHERE i.business_id = $1 
        AND DATE(i.created_at) = $2
        AND i.status = 'paid'
      GROUP BY EXTRACT(HOUR FROM i.created_at)
      ORDER BY transactions DESC
    `;

    const hourResult = await db.query(hourQuery, [businessId, saleDate]);

    return {
      total_transactions: parseInt(data.total_transactions) || 0,
      total_items_sold: parseInt(data.total_items_sold) || 0,
      total_revenue: parseFloat(data.total_revenue) || 0,
      total_profit: parseFloat(data.total_profit) || 0,
      average_transaction_value: parseFloat(data.average_transaction_value) || 0,
      average_item_price: parseFloat(data.average_item_price) || 0,
      high_value_transactions: parseInt(data.high_value_transactions) || 0,
      low_value_high_volume_transactions: parseInt(data.low_value_high_volume_transactions) || 0,
      category_breakdown: categoryResult.rows,
      top_products: productResult.rows,
      peak_hours: hourResult.rows
    };
  }

  /**
   * Calculate overall business health score
   */
  async calculateBusinessHealth(businessId) {
    try {
      // Get recent business data
      const recentData = await this.getRecentBusinessData(businessId, 30);
      
      // Calculate health metrics
      const revenueScore = this.calculateRevenueScore(recentData);
      const transactionScore = this.calculateTransactionScore(recentData);
      const profitScore = this.calculateProfitScore(recentData);
      const growthScore = this.calculateGrowthScore(recentData);
      const consistencyScore = this.calculateConsistencyScore(recentData);
      
      // Calculate overall score
      const overallScore = Math.round(
        (revenueScore * 0.25 +
         transactionScore * 0.20 +
         profitScore * 0.25 +
         growthScore * 0.15 +
         consistencyScore * 0.15)
      );
      
      // Determine health level
      let healthLevel = 'critical';
      if (overallScore >= 80) healthLevel = 'excellent';
      else if (overallScore >= 60) healthLevel = 'good';
      else if (overallScore >= 40) healthLevel = 'fair';
      else if (overallScore >= 20) healthLevel = 'poor';
      
      return {
        overall_score: overallScore,
        health_level: healthLevel,
        metrics: {
          revenue: { score: revenueScore, weight: 25 },
          transactions: { score: transactionScore, weight: 20 },
          profit: { score: profitScore, weight: 25 },
          growth: { score: growthScore, weight: 15 },
          consistency: { score: consistencyScore, weight: 15 }
        },
        insights: this.generateHealthInsights(overallScore, recentData),
        recommendations: this.generateHealthRecommendations(overallScore, recentData),
        last_updated: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error calculating business health:', error);
      
      // Return demo data if there's an error
      return {
        overall_score: 75,
        health_level: 'good',
        metrics: {
          revenue: { score: 80, weight: 25 },
          transactions: { score: 70, weight: 20 },
          profit: { score: 75, weight: 25 },
          growth: { score: 85, weight: 15 },
          consistency: { score: 65, weight: 15 }
        },
        insights: [
          {
            type: 'positive',
            title: 'Stable Revenue',
            description: 'Your business shows consistent revenue patterns over the past month.'
          },
          {
            type: 'opportunity',
            title: 'Growth Potential',
            description: 'There\'s room for improvement in transaction frequency.'
          }
        ],
        recommendations: [
          'Consider implementing loyalty programs to increase customer retention.',
          'Analyze peak hours to optimize staffing and inventory.',
          'Review pricing strategy to improve profit margins.'
        ],
        last_updated: new Date().toISOString(),
        demo: true
      };
    }
  }

  async getRecentBusinessData(businessId, days) {
    try {
      const query = `
        SELECT
          DATE(i.created_at) as date,
          COUNT(i.id) as transactions,
          SUM(i.total_amount) as revenue,
          AVG(i.total_amount) as avg_transaction,
          SUM(ili.line_total - (ili.cost_price * ili.quantity)) as profit
        FROM invoices i
        LEFT JOIN invoice_line_items ili ON i.id = ili.invoice_id
        WHERE i.business_id = $1
          AND i.created_at >= NOW() - INTERVAL '${days} days'
          AND i.status = 'paid'
        GROUP BY DATE(i.created_at)
        ORDER BY date DESC
      `;
      
      const result = await db.query(query, [businessId]);
      return result.rows;
    } catch (error) {
      logger.error('Error getting recent business data:', error);
      return [];
    }
  }

  calculateRevenueScore(data) {
    if (data.length === 0) return 50;
    
    const totalRevenue = data.reduce((sum, day) => sum + parseFloat(day.revenue || 0), 0);
    const avgDailyRevenue = totalRevenue / data.length;
    
    // Score based on daily revenue thresholds (adjust based on business type)
    if (avgDailyRevenue >= 1000) return 100;
    if (avgDailyRevenue >= 500) return 80;
    if (avgDailyRevenue >= 250) return 60;
    if (avgDailyRevenue >= 100) return 40;
    return 20;
  }

  calculateTransactionScore(data) {
    if (data.length === 0) return 50;
    
    const totalTransactions = data.reduce((sum, day) => sum + parseInt(day.transactions || 0), 0);
    const avgDailyTransactions = totalTransactions / data.length;
    
    // Score based on daily transaction count
    if (avgDailyTransactions >= 50) return 100;
    if (avgDailyTransactions >= 25) return 80;
    if (avgDailyTransactions >= 15) return 60;
    if (avgDailyTransactions >= 5) return 40;
    return 20;
  }

  calculateProfitScore(data) {
    if (data.length === 0) return 50;
    
    const totalProfit = data.reduce((sum, day) => sum + parseFloat(day.profit || 0), 0);
    const totalRevenue = data.reduce((sum, day) => sum + parseFloat(day.revenue || 0), 0);
    
    if (totalRevenue === 0) return 50;
    
    const profitMargin = (totalProfit / totalRevenue) * 100;
    
    // Score based on profit margin
    if (profitMargin >= 30) return 100;
    if (profitMargin >= 20) return 80;
    if (profitMargin >= 15) return 60;
    if (profitMargin >= 10) return 40;
    return 20;
  }

  calculateGrowthScore(data) {
    if (data.length < 7) return 50; // Need at least a week of data
    
    // Compare recent week to previous week
    const recentWeek = data.slice(0, 7);
    const previousWeek = data.slice(7, 14);
    
    if (previousWeek.length === 0) return 50;
    
    const recentRevenue = recentWeek.reduce((sum, day) => sum + parseFloat(day.revenue || 0), 0);
    const previousRevenue = previousWeek.reduce((sum, day) => sum + parseFloat(day.revenue || 0), 0);
    
    if (previousRevenue === 0) return 50;
    
    const growthRate = ((recentRevenue - previousRevenue) / previousRevenue) * 100;
    
    // Score based on growth rate
    if (growthRate >= 10) return 100;
    if (growthRate >= 5) return 80;
    if (growthRate >= 0) return 60;
    if (growthRate >= -5) return 40;
    return 20;
  }

  calculateConsistencyScore(data) {
    if (data.length < 7) return 50;
    
    const revenues = data.map(day => parseFloat(day.revenue || 0));
    const avgRevenue = revenues.reduce((sum, rev) => sum + rev, 0) / revenues.length;
    
    if (avgRevenue === 0) return 50;
    
    // Calculate coefficient of variation (lower is more consistent)
    const variance = revenues.reduce((sum, rev) => sum + Math.pow(rev - avgRevenue, 2), 0) / revenues.length;
    const standardDeviation = Math.sqrt(variance);
    const coefficientOfVariation = (standardDeviation / avgRevenue) * 100;
    
    // Score based on consistency (lower CV = higher score)
    if (coefficientOfVariation <= 20) return 100;
    if (coefficientOfVariation <= 30) return 80;
    if (coefficientOfVariation <= 40) return 60;
    if (coefficientOfVariation <= 50) return 40;
    return 20;
  }

  generateHealthInsights(overallScore, data) {
    const insights = [];
    
    if (overallScore >= 80) {
      insights.push({
        type: 'excellent',
        title: 'Excellent Business Health',
        description: 'Your business is performing exceptionally well across all key metrics.'
      });
    } else if (overallScore >= 60) {
      insights.push({
        type: 'good',
        title: 'Good Business Health',
        description: 'Your business shows solid performance with room for improvement.'
      });
    } else {
      insights.push({
        type: 'concern',
        title: 'Business Health Needs Attention',
        description: 'Some key metrics require immediate attention to improve business health.'
      });
    }
    
    return insights;
  }

  generateHealthRecommendations(overallScore, data) {
    const recommendations = [];
    
    if (overallScore < 60) {
      recommendations.push('Focus on increasing daily transaction count through marketing promotions.');
      recommendations.push('Review pricing strategy to improve profit margins.');
      recommendations.push('Implement customer retention programs to ensure consistent revenue.');
    } else if (overallScore < 80) {
      recommendations.push('Optimize peak hours to maximize revenue potential.');
      recommendations.push('Consider upselling strategies to increase average transaction value.');
      recommendations.push('Analyze customer preferences to tailor offerings.');
    } else {
      recommendations.push('Maintain current performance levels.');
      recommendations.push('Explore expansion opportunities.');
      recommendations.push('Consider premium offerings to further increase profitability.');
    }
    
    return recommendations;
  }
}

module.exports = new SalesAnalyticsService();