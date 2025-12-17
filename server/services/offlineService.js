class OfflineService {
  constructor() {
    // Cache configuration for offline functionality
    this.cacheConfig = {
      // Critical data that should be cached for offline use
      criticalData: {
        'user_profile': { ttl: 24 * 60 * 60 * 1000 }, // 24 hours
        'business_info': { ttl: 24 * 60 * 60 * 1000 }, // 24 hours
        'emergency_fund': { ttl: 60 * 60 * 1000 }, // 1 hour
        'recent_transactions': { ttl: 30 * 60 * 1000 }, // 30 minutes
        'risk_assessments': { ttl: 6 * 60 * 60 * 1000 }, // 6 hours
        'active_alerts': { ttl: 15 * 60 * 1000 }, // 15 minutes
        'translations': { ttl: 7 * 24 * 60 * 60 * 1000 } // 7 days
      },
      // Static assets for PWA
      staticAssets: {
        'app-shell': { ttl: 7 * 24 * 60 * 60 * 1000 }, // 7 days
        'critical-css': { ttl: 7 * 24 * 60 * 60 * 1000 }, // 7 days
        'critical-js': { ttl: 7 * 24 * 60 * 60 * 1000 }, // 7 days
        'icons': { ttl: 30 * 24 * 60 * 60 * 1000 } // 30 days
      }
    };

    // Mobile optimization settings
    this.mobileOptimization = {
      // Image compression settings
      imageCompression: {
        quality: 0.7,
        maxWidth: 800,
        maxHeight: 600,
        format: 'webp'
      },
      // Data compression for API responses
      dataCompression: {
        enabled: true,
        algorithm: 'gzip',
        minSize: 1024 // Only compress responses larger than 1KB
      },
      // Lazy loading settings
      lazyLoading: {
        enabled: true,
        threshold: 100, // Load when 100px from viewport
        placeholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+'
      }
    };

    // Low connectivity optimization
    this.lowConnectivityOptimization = {
      // Request queuing for when offline
      requestQueue: {
        enabled: true,
        maxQueueSize: 50,
        retryAttempts: 3,
        retryDelay: 5000 // 5 seconds
      },
      // Data synchronization
      syncStrategy: {
        priority: ['critical', 'high', 'medium', 'low'],
        batch_size: 10,
        sync_interval: 30 * 1000 // 30 seconds
      },
      // Reduced data mode
      reducedDataMode: {
        enabled: true,
        imageQuality: 0.5,
        disableAnimations: true,
        simplifyUI: true,
        limitDataPoints: 50 // Limit charts and graphs to 50 data points
      }
    };
  }

  /**
   * Generate service worker for PWA functionality
   */
  generateServiceWorker() {
    return `
// Tokay Resilience Platform Service Worker
const CACHE_NAME = 'tokay-resilience-v1';
const CRITICAL_CACHE_NAME = 'tokay-critical-v1';

// Critical assets that should be cached immediately
const CRITICAL_ASSETS = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/static/icons/icon-192x192.png',
  '/static/icons/icon-512x512.png',
  '/manifest.json'
];

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CRITICAL_CACHE_NAME)
      .then((cache) => cache.addAll(CRITICAL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CRITICAL_CACHE_NAME && cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - implement offline-first strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // API requests - network first, then cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached response if network fails
          return caches.match(request);
        })
    );
    return;
  }

  // Static assets - cache first, then network
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(request).then((response) => {
          // Cache new static assets
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle queued requests when back online
  const queuedRequests = await getQueuedRequests();
  
  for (const request of queuedRequests) {
    try {
      await fetch(request.url, request.options);
      await removeQueuedRequest(request.id);
    } catch (error) {
      console.error('Failed to sync request:', error);
    }
  }
}

// Helper functions for request queue management
async function getQueuedRequests() {
  // Implementation would use IndexedDB
  return [];
}

async function removeQueuedRequest(requestId) {
  // Implementation would remove from IndexedDB
}
    `;
  }

  /**
   * Generate PWA manifest
   */
  generatePWAManifest() {
    return {
      name: 'Tokay Resilience Platform',
      short_name: 'Tokay',
      description: 'AI-powered business resilience platform for Malaysian SMEs',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#1976d2',
      orientation: 'portrait',
      scope: '/',
      icons: [
        {
          src: '/static/icons/icon-72x72.png',
          sizes: '72x72',
          type: 'image/png'
        },
        {
          src: '/static/icons/icon-96x96.png',
          sizes: '96x96',
          type: 'image/png'
        },
        {
          src: '/static/icons/icon-128x128.png',
          sizes: '128x128',
          type: 'image/png'
        },
        {
          src: '/static/icons/icon-144x144.png',
          sizes: '144x144',
          type: 'image/png'
        },
        {
          src: '/static/icons/icon-152x152.png',
          sizes: '152x152',
          type: 'image/png'
        },
        {
          src: '/static/icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: '/static/icons/icon-384x384.png',
          sizes: '384x384',
          type: 'image/png'
        },
        {
          src: '/static/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ],
      categories: ['business', 'finance', 'productivity'],
      lang: 'en-ms',
      dir: 'ltr',
      prefer_related_applications: false,
      screenshots: [
        {
          src: '/static/screenshots/dashboard-mobile.png',
          sizes: '360x640',
          type: 'image/png',
          form_factor: 'narrow'
        },
        {
          src: '/static/screenshots/dashboard-desktop.png',
          sizes: '1280x720',
          type: 'image/png',
          form_factor: 'wide'
        }
      ]
    };
  }

  /**
   * Generate mobile-optimized CSS
   */
  generateMobileOptimizedCSS() {
    return `
/* Mobile-first responsive design */
@media (max-width: 768px) {
  .container {
    padding: 1rem;
    max-width: 100%;
  }
  
  .card {
    margin: 0.5rem 0;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .button {
    min-height: 44px; /* Minimum touch target size */
    padding: 12px 16px;
    font-size: 16px;
  }
  
  .input {
    min-height: 44px;
    font-size: 16px; /* Prevent zoom on iOS */
  }
  
  .navigation {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    border-top: 1px solid #e0e0e0;
    padding: 8px 0;
    z-index: 1000;
  }
  
  .navigation-item {
    flex: 1;
    text-align: center;
    padding: 8px;
  }
  
  .chart-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .table {
    font-size: 14px;
  }
  
  .table th,
  .table td {
    padding: 8px 4px;
    white-space: nowrap;
  }
}

/* Touch-friendly interactions */
@media (hover: none) and (pointer: coarse) {
  .button:hover {
    background-color: inherit; /* Remove hover effects on touch devices */
  }
  
  .card:hover {
    transform: none; /* Remove hover effects on touch devices */
  }
}

/* Reduced motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  body {
    background-color: #121212;
    color: #ffffff;
  }
  
  .card {
    background-color: #1e1e1e;
    border-color: #333333;
  }
  
  .input {
    background-color: #2d2d2d;
    border-color: #444444;
    color: #ffffff;
  }
}

/* Low connectivity mode */
.low-connectivity-mode {
  .animations {
    animation: none !important;
    transition: none !important;
  }
  
  .images {
    filter: grayscale(100%);
    opacity: 0.8;
  }
  
  .charts {
    simplified-chart: true;
  }
}
    `;
  }

  /**
   * Generate offline data structure
   */
  generateOfflineDataStructure() {
    return {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: {
        user: {
          id: null,
          name: null,
          email: null,
          preferences: {
            language: 'en',
            theme: 'light',
            notifications: true
          }
        },
        businesses: [],
        emergencyFunds: [],
        recentTransactions: [],
        riskAssessments: [],
        alerts: [],
        translations: {}
      },
      metadata: {
        lastSync: null,
        syncStatus: 'pending',
        pendingActions: []
      }
    };
  }

  /**
   * Optimize image for mobile/low connectivity
   */
  optimizeImage(imageBuffer, options = {}) {
    const config = { ...this.mobileOptimization.imageCompression, ...options };
    
    // In a real implementation, this would use an image processing library
    // For now, return the original buffer with optimization metadata
    return {
      buffer: imageBuffer,
      metadata: {
        originalSize: imageBuffer.length,
        optimizedSize: Math.round(imageBuffer.length * config.quality),
        format: config.format,
        quality: config.quality
      }
    };
  }

  /**
   * Compress API response for low connectivity
   */
  compressResponse(data) {
    if (!this.mobileOptimization.dataCompression.enabled) {
      return data;
    }
    
    const jsonString = JSON.stringify(data);
    
    if (jsonString.length < this.mobileOptimization.dataCompression.minSize) {
      return data;
    }
    
    // In a real implementation, this would use compression libraries
    // For now, return the original data with compression metadata
    return {
      data: data,
      compressed: false,
      originalSize: jsonString.length,
      metadata: {
        compressionEnabled: true,
        algorithm: this.mobileOptimization.dataCompression.algorithm
      }
    };
  }

  /**
   * Generate mobile-optimized API response structure
   */
  generateMobileOptimizedResponse(data, requestType, connectivityLevel = 'high') {
    const baseResponse = {
      success: true,
      data: data,
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId()
    };

    if (connectivityLevel === 'low') {
      // Reduce data payload for low connectivity
      return {
        ...baseResponse,
        optimized: true,
        connectivityLevel: 'low',
        data: this.reduceDataPayload(data, requestType)
      };
    }

    return baseResponse;
  }

  /**
   * Reduce data payload for low connectivity
   */
  reduceDataPayload(data, requestType) {
    switch (requestType) {
      case 'transactions':
        // Return only recent transactions with essential fields
        if (Array.isArray(data)) {
          return data.slice(0, 20).map(transaction => ({
            id: transaction.id,
            amount: transaction.amount,
            type: transaction.transaction_type,
            date: transaction.created_at,
            description: transaction.description
          }));
        }
        break;
        
      case 'reports':
        // Simplify report data
        if (data.analytics) {
          return {
            summary: data.summary,
            resilienceScore: data.resilienceScore,
            keyMetrics: this.extractKeyMetrics(data.analytics)
          };
        }
        break;
        
      case 'alerts':
        // Return only active alerts
        if (Array.isArray(data)) {
          return data
            .filter(alert => alert.status === 'active')
            .slice(0, 10)
            .map(alert => ({
              id: alert.id,
              type: alert.alert_type,
              severity: alert.severity,
              message: alert.message,
              createdAt: alert.created_at
            }));
        }
        break;
        
      default:
        return data;
    }
    
    return data;
  }

  /**
   * Extract key metrics from analytics data
   */
  extractKeyMetrics(analytics) {
    return {
      totalBalance: analytics.emergencyFundData?.currentBalance || 0,
      completionRate: analytics.emergencyFundData?.completionPercentage || 0,
      riskScore: analytics.riskAssessments?.averageRiskScore || 0,
      activeAlerts: analytics.alerts?.totalAlerts || 0,
      lastUpdated: analytics.lastUpdated
    };
  }

  /**
   * Generate unique request ID
   */
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get connectivity optimization recommendations
   */
  getConnectivityRecommendations(userLocation, deviceType) {
    const recommendations = [];
    
    // Location-based recommendations
    if (userLocation) {
      const ruralStates = ['kelantan', 'terengganu', 'pahang', 'perlis', 'kedah'];
      const isRural = ruralStates.some(state => 
        userLocation.toLowerCase().includes(state)
      );
      
      if (isRural) {
        recommendations.push({
          type: 'connectivity',
          priority: 'high',
          message: 'Enable offline mode for areas with limited internet connectivity',
          action: 'activate_offline_mode'
        });
        recommendations.push({
          type: 'data',
          priority: 'medium',
          message: 'Use reduced data mode to save bandwidth',
          action: 'enable_reduced_data_mode'
        });
      }
    }
    
    // Device-based recommendations
    if (deviceType === 'mobile') {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        message: 'Enable lazy loading for better performance',
        action: 'enable_lazy_loading'
      });
      recommendations.push({
        type: 'storage',
        priority: 'low',
        message: 'Clear cache regularly to free up storage',
        action: 'clear_cache'
      });
    }
    
    return recommendations;
  }
}

module.exports = new OfflineService();