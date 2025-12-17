const knex = require('knex');
const logger = require('../utils/logger');

const dbConfig = {
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'tokay_user',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'tokay_platform',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  },
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 100
  },
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations'
  },
  seeds: {
    directory: './seeds'
  }
};

const db = knex(dbConfig);

async function connectDB() {
  try {
    // Check if we're in demo mode (no database required)
    if (process.env.NODE_ENV === 'demo' || process.env.DEMO_MODE === 'true') {
      logger.info('Running in DEMO MODE - No database connection required');
      return createMockDB();
    }
    
    await db.raw('SELECT 1');
    logger.info('Database connection established successfully');
    return db;
  } catch (error) {
    logger.error('Database connection failed:', error);
    
    // Fallback to demo mode if database is not available
    logger.info('Falling back to DEMO MODE');
    return createMockDB();
  }
}

function createMockDB() {
  return {
    query: async (sql, params = []) => {
      // Mock query responses for demo purposes
      logger.info(`[DEMO] Executing query: ${sql.substring(0, 50)}...`);
      
      // Return mock data based on query patterns
      if (sql.includes('businesses') && sql.includes('user_id')) {
        return { rows: [{ id: 1, business_name: 'Demo Restaurant', business_type: 'restaurant', monthly_revenue: 15000 }] };
      }
      
      if (sql.includes('sales_analytics_daily') || sql.includes('invoices')) {
        return { rows: [] };
      }
      
      // Default empty response
      return { rows: [] };
    },
    raw: async () => true,
    destroy: async () => true
  };
}

async function disconnectDB() {
  try {
    await db.destroy();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection:', error);
    throw error;
  }
}

module.exports = {
  db,
  connectDB,
  disconnectDB
};