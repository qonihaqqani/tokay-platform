// Configuration for free service tiers
// Optimizes the Tokay platform for free deployment options

const isProduction = process.env.NODE_ENV === 'production';
const useFreeServices = process.env.USE_FREE_SERVICES === 'true';

// Free service configurations
const freeConfig = {
  // Database configuration for free tiers
  database: {
    // Lower connection limits for free tiers
    connectionLimit: useFreeServices ? 3 : 10,
    acquireTimeout: 60000,
    timeout: 60000,
    // Enable SSL for most free services
    ssl: isProduction ? { rejectUnauthorized: false } : false,
    // Connection retry settings
    reconnect: true,
    reconnectDelay: 2000
  },

  // Redis configuration (fallback to memory if not available)
  redis: {
    // Use in-memory cache if Redis URL not provided
    useMemoryCache: !process.env.REDIS_URL,
    // Fallback memory cache settings
    memoryCache: {
      maxSize: 100, // Max number of items
      ttl: 300000 // 5 minutes
    }
  },

  // Email service (Gmail for free)
  email: {
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    // Rate limiting for Gmail
    rateLimit: {
      max: 10, // 10 emails per minute
      windowMs: 60000
    }
  },

  // SMS service (email fallback for free tier)
  sms: {
    useEmailFallback: true,
    // Email-to-SMS gateways for Malaysian carriers
    emailGateways: {
      'maxis': '@maxis.net.my',
      'celcom': '@celcom.com.my',
      'digi': '@digi.com.my',
      'umobile': '@umobile.com.my',
      'hotlink': '@hotlink.com.my'
    }
  },

  // File upload (free image hosting)
  fileUpload: {
    // Use local storage for free tier
    useLocalStorage: true,
    // Fallback to free image hosting services
    freeImageHosts: [
      'https://i.imgur.com/',
      'https://postimages.org/'
    ],
    maxFileSize: useFreeServices ? 2 * 1024 * 1024 : 10 * 1024 * 1024, // 2MB for free
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif']
  },

  // Rate limiting (more restrictive for free tiers)
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: useFreeServices ? 50 : 100, // 50 requests for free tier
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.'
    }
  },

  // Logging (simplified for free tiers)
  logging: {
    level: useFreeServices ? 'warn' : 'info',
    // Use console for free tier, file system for paid
    useConsole: useFreeServices,
    // Log rotation settings
    maxFiles: useFreeServices ? 2 : 10,
    maxSize: useFreeServices ? '5m' : '50m'
  },

  // Session management (simplified for free tiers)
  session: {
    // Use JWT instead of session store for free tier
    useJWT: true,
    // Shorter session time for free tier
    expiresIn: useFreeServices ? '1h' : '7d',
    // Memory store fallback
    useMemoryStore: useFreeServices
  },

  // API caching (aggressive for free tiers)
  cache: {
    // Longer cache times for free tiers to reduce API calls
    weatherData: useFreeServices ? 10 * 60 * 1000 : 5 * 60 * 1000, // 10 minutes vs 5 minutes
    riskAssessment: useFreeServices ? 30 * 60 * 1000 : 15 * 60 * 1000, // 30 minutes vs 15 minutes
    businessData: useFreeServices ? 60 * 60 * 1000 : 30 * 60 * 1000, // 1 hour vs 30 minutes
  },

  // Background jobs (simplified for free tiers)
  backgroundJobs: {
    // Disable some background jobs for free tier
    enableScheduledTasks: !useFreeServices,
    // Longer intervals for free tier
    riskAssessmentInterval: useFreeServices ? 24 * 60 * 60 * 1000 : 6 * 60 * 60 * 1000, // 24 hours vs 6 hours
    alertCheckInterval: useFreeServices ? 30 * 60 * 1000 : 5 * 60 * 1000, // 30 minutes vs 5 minutes
  },

  // Analytics (simplified for free tiers)
  analytics: {
    // Use local storage instead of external services
    useLocalAnalytics: useFreeServices,
    // Sample rate for analytics
    sampleRate: useFreeServices ? 0.1 : 1.0, // 10% vs 100%
    // Retention period
    retentionDays: useFreeServices ? 7 : 90
  }
};

// Memory cache implementation for free tier
class MemoryCache {
  constructor(options = {}) {
    this.cache = new Map();
    this.maxSize = options.maxSize || 100;
    this.defaultTTL = options.ttl || 300000; // 5 minutes
  }

  set(key, value, ttl = this.defaultTTL) {
    // Remove oldest item if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  del(key) {
    return this.cache.delete(key);
  }

  flush() {
    this.cache.clear();
  }
}

// Email-to-SMS fallback for Malaysian carriers
const sendEmailToSMS = (phoneNumber, message, carrier) => {
  const gateway = freeConfig.sms.emailGateways[carrier?.toLowerCase()];
  if (!gateway) {
    throw new Error('Carrier not supported for email-to-SMS');
  }

  const smsEmail = phoneNumber.replace(/[^0-9]/g, '') + gateway;
  return {
    to: smsEmail,
    subject: 'Tokay Alert',
    text: message,
    // Limit message length for SMS
    text: message.substring(0, 160)
  };
};

// Free service health check
const checkFreeServicesHealth = async () => {
  const health = {
    database: 'unknown',
    redis: 'unknown',
    email: 'unknown',
    overall: 'unknown'
  };

  try {
    // Check database
    const { db } = require('./database');
    await db.raw('SELECT 1');
    health.database = 'healthy';
  } catch (error) {
    health.database = 'unhealthy';
  }

  try {
    // Check Redis
    if (process.env.REDIS_URL) {
      const { client } = require('./redis');
      await client.ping();
      health.redis = 'healthy';
    } else {
      health.redis = 'disabled (using memory cache)';
    }
  } catch (error) {
    health.redis = 'unhealthy';
  }

  // Check email configuration
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    health.email = 'configured';
  } else {
    health.email = 'not configured';
  }

  health.overall = (health.database === 'healthy' && health.email === 'configured') ? 'healthy' : 'degraded';

  return health;
};

module.exports = {
  freeConfig,
  MemoryCache,
  sendEmailToSMS,
  checkFreeServicesHealth,
  isUsingFreeServices: useFreeServices
};