const redis = require('redis');
const logger = require('../utils/logger');

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: 0, // Disable retries
  lazyConnect: true,
  connectTimeout: 1000, // Short timeout
  commandTimeout: 1000,  // Short timeout
  retryDelayOnClusterDown: 300, // Short retry delay
  retryDelayOnFailover: 100,
  enableOfflineQueue: false // Disable offline queue
};

// Create Redis client (but don't connect yet)
let client = null;

function createRedisClient() {
  if (!client) {
    client = redis.createClient(redisConfig);
    
    // Event handlers
    client.on('connect', () => {
      logger.info('Redis client connected');
    });

    client.on('ready', () => {
      logger.info('Redis client ready');
    });

    client.on('error', (err) => {
      // Only log errors if not in demo mode
      if (process.env.NODE_ENV !== 'demo' && process.env.DEMO_MODE !== 'true') {
        logger.error('Redis client error:', err);
      }
    });

    client.on('end', () => {
      logger.info('Redis client disconnected');
    });
  }
  return client;
}

// Connect to Redis
async function connectRedis() {
  try {
    // Check if we're in demo mode (no Redis required)
    if (process.env.NODE_ENV === 'demo' || process.env.DEMO_MODE === 'true') {
      logger.info('Running in DEMO MODE - No Redis connection required');
      return createMockRedis();
    }
    
    // Only create and connect client if not in demo mode
    const redisClient = createRedisClient();
    await redisClient.connect();
    logger.info('Redis connection established successfully');
    return redisClient;
  } catch (error) {
    logger.error('Redis connection failed:', error);
    
    // Fallback to demo mode if Redis is not available
    logger.info('Falling back to DEMO MODE for Redis');
    return createMockRedis();
  }
}

function createMockRedis() {
  const mockCache = new Map();
  
  return {
    // Mock Redis client methods
    connect: async () => true,
    quit: async () => true,
    get: async (key) => mockCache.get(key) || null,
    setEx: async (key, ttl, value) => {
      mockCache.set(key, value);
      setTimeout(() => mockCache.delete(key), ttl * 1000);
      return true;
    },
    del: async (key) => {
      mockCache.delete(key);
      return true;
    },
    exists: async (key) => mockCache.has(key) ? 1 : 0,
    
    // Mock cache utilities
    cache: {
      set: async (key, value, expirationInSeconds = 3600) => {
        mockCache.set(key, JSON.stringify(value));
        setTimeout(() => mockCache.delete(key), expirationInSeconds * 1000);
        return true;
      },
      get: async (key) => {
        const value = mockCache.get(key);
        return value ? JSON.parse(value) : null;
      },
      del: async (key) => {
        mockCache.delete(key);
        return true;
      },
      exists: async (key) => mockCache.has(key),
      setWithPattern: async (pattern, key, value, expirationInSeconds = 3600) => {
        mockCache.set(key, JSON.stringify(value));
        setTimeout(() => mockCache.delete(key), expirationInSeconds * 1000);
        return true;
      },
      delByPattern: async (pattern) => {
        for (const [key] of mockCache) {
          if (key.includes(pattern)) {
            mockCache.delete(key);
          }
        }
        return true;
      }
    },
    
    // Mock session management
    session: {
      setUserSession: async (userId, sessionData, expirationInSeconds = 86400) => {
        const key = `session:user:${userId}`;
        mockCache.set(key, JSON.stringify(sessionData));
        setTimeout(() => mockCache.delete(key), expirationInSeconds * 1000);
        return true;
      },
      getUserSession: async (userId) => {
        const key = `session:user:${userId}`;
        const value = mockCache.get(key);
        return value ? JSON.parse(value) : null;
      },
      deleteUserSession: async (userId) => {
        const key = `session:user:${userId}`;
        mockCache.delete(key);
        return true;
      },
      setBusinessSession: async (businessId, socketId, expirationInSeconds = 86400) => {
        const key = `session:business:${businessId}`;
        mockCache.set(key, JSON.stringify({ socketId, connectedAt: new Date() }));
        setTimeout(() => mockCache.delete(key), expirationInSeconds * 1000);
        return true;
      },
      getBusinessSession: async (businessId) => {
        const key = `session:business:${businessId}`;
        const value = mockCache.get(key);
        return value ? JSON.parse(value) : null;
      }
    },
    
    // Mock rate limiting
    rateLimit: {
      checkLimit: async (identifier, maxRequests = 100, windowInSeconds = 3600) => {
        const key = `ratelimit:${identifier}`;
        const current = JSON.parse(mockCache.get(key) || '{"count": 0, "resetTime": 0}');
        
        // Reset if window has expired
        if (Date.now() > current.resetTime) {
          current.count = 0;
          current.resetTime = Date.now() + (windowInSeconds * 1000);
        }
        
        current.count++;
        
        mockCache.set(key, JSON.stringify(current));
        setTimeout(() => mockCache.delete(key), windowInSeconds * 1000);
        
        return {
          allowed: current.count <= maxRequests,
          count: current.count,
          remaining: Math.max(0, maxRequests - current.count),
          resetTime: current.resetTime
        };
      },
      resetLimit: async (identifier) => {
        const key = `ratelimit:${identifier}`;
        mockCache.delete(key);
        return true;
      }
    }
  };
}

// Disconnect from Redis
async function disconnectRedis() {
  try {
    await client.quit();
    logger.info('Redis connection closed');
  } catch (error) {
    logger.error('Error closing Redis connection:', error);
    throw error;
  }
}

// Cache utility functions
const cache = {
  // Set cache with expiration
  set: async (key, value, expirationInSeconds = 3600) => {
    try {
      const serializedValue = JSON.stringify(value);
      await client.setEx(key, expirationInSeconds, serializedValue);
      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  },

  // Get cache value
  get: async (key) => {
    try {
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  },

  // Delete cache key
  del: async (key) => {
    try {
      await client.del(key);
      return true;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  },

  // Check if key exists
  exists: async (key) => {
    try {
      const result = await client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error:', error);
      return false;
    }
  },

  // Set cache with pattern matching for bulk deletion
  setWithPattern: async (pattern, key, value, expirationInSeconds = 3600) => {
    try {
      const serializedValue = JSON.stringify(value);
      await client.setEx(key, expirationInSeconds, serializedValue);
      
      // Store pattern reference for bulk deletion
      const patternKey = `pattern:${pattern}`;
      const existingKeys = await cache.get(patternKey) || [];
      if (!existingKeys.includes(key)) {
        existingKeys.push(key);
        await cache.set(patternKey, existingKeys, expirationInSeconds * 2);
      }
      
      return true;
    } catch (error) {
      logger.error('Cache set with pattern error:', error);
      return false;
    }
  },

  // Delete cache by pattern
  delByPattern: async (pattern) => {
    try {
      const patternKey = `pattern:${pattern}`;
      const keysToDelete = await cache.get(patternKey) || [];
      
      if (keysToDelete.length > 0) {
        await client.del(keysToDelete);
        await client.del(patternKey);
      }
      
      return true;
    } catch (error) {
      logger.error('Cache delete by pattern error:', error);
      return false;
    }
  }
};

// Session management for real-time features
const session = {
  // Store user session
  setUserSession: async (userId, sessionData, expirationInSeconds = 86400) => {
    const key = `session:user:${userId}`;
    return await cache.set(key, sessionData, expirationInSeconds);
  },

  // Get user session
  getUserSession: async (userId) => {
    const key = `session:user:${userId}`;
    return await cache.get(key);
  },

  // Delete user session
  deleteUserSession: async (userId) => {
    const key = `session:user:${userId}`;
    return await cache.del(key);
  },

  // Store business session for real-time alerts
  setBusinessSession: async (businessId, socketId, expirationInSeconds = 86400) => {
    const key = `session:business:${businessId}`;
    return await cache.set(key, { socketId, connectedAt: new Date() }, expirationInSeconds);
  },

  // Get business session
  getBusinessSession: async (businessId) => {
    const key = `session:business:${businessId}`;
    return await cache.get(key);
  }
};

// Rate limiting
const rateLimit = {
  // Check if user has exceeded rate limit
  checkLimit: async (identifier, maxRequests = 100, windowInSeconds = 3600) => {
    const key = `ratelimit:${identifier}`;
    const current = await cache.get(key) || { count: 0, resetTime: Date.now() + (windowInSeconds * 1000) };
    
    // Reset if window has expired
    if (Date.now() > current.resetTime) {
      current.count = 0;
      current.resetTime = Date.now() + (windowInSeconds * 1000);
    }
    
    current.count++;
    
    await cache.set(key, current, windowInSeconds);
    
    return {
      allowed: current.count <= maxRequests,
      count: current.count,
      remaining: Math.max(0, maxRequests - current.count),
      resetTime: current.resetTime
    };
  },

  // Reset rate limit for identifier
  resetLimit: async (identifier) => {
    const key = `ratelimit:${identifier}`;
    return await cache.del(key);
  }
};

module.exports = {
  client,
  connectRedis,
  disconnectRedis,
  cache,
  session,
  rateLimit
};