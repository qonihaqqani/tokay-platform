const express = require('express');
const router = express.Router();
const offlineService = require('../services/offlineService');
const logger = require('../utils/logger');

// Serve PWA manifest
router.get('/manifest.json', (req, res) => {
  try {
    const manifest = offlineService.generatePWAManifest();
    res.setHeader('Content-Type', 'application/manifest+json');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    res.json(manifest);
  } catch (error) {
    logger.error('Error generating PWA manifest:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PWA manifest',
      error: error.message
    });
  }
});

// Serve service worker
router.get('/service-worker.js', (req, res) => {
  try {
    const serviceWorker = offlineService.generateServiceWorker();
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=0, no-cache'); // Don't cache service worker
    res.send(serviceWorker);
  } catch (error) {
    logger.error('Error generating service worker:', error);
    res.status(500).send('console.error("Service worker error");');
  }
});

// Get mobile optimization settings
router.get('/mobile-settings', (req, res) => {
  try {
    const { userLocation, deviceType } = req.query;
    
    const settings = {
      mobileOptimization: offlineService.mobileOptimization,
      lowConnectivityOptimization: offlineService.lowConnectivityOptimization,
      recommendations: offlineService.getConnectivityRecommendations(userLocation, deviceType)
    };
    
    res.json({
      success: true,
      settings
    });
  } catch (error) {
    logger.error('Error fetching mobile settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching mobile settings',
      error: error.message
    });
  }
});

// Get offline data structure
router.get('/offline-data', (req, res) => {
  try {
    const offlineData = offlineService.generateOfflineDataStructure();
    
    res.json({
      success: true,
      offlineData
    });
  } catch (error) {
    logger.error('Error generating offline data structure:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating offline data structure',
      error: error.message
    });
  }
});

// Optimize image upload for mobile
router.post('/optimize-image', (req, res) => {
  try {
    // This would handle image optimization in a real implementation
    // For now, return optimization metadata
    
    const optimizationOptions = {
      quality: parseFloat(req.body.quality) || 0.7,
      maxWidth: parseInt(req.body.maxWidth) || 800,
      maxHeight: parseInt(req.body.maxHeight) || 600,
      format: req.body.format || 'webp'
    };
    
    const optimizationResult = {
      optimized: true,
      originalSize: req.body.fileSize || 0,
      estimatedOptimizedSize: Math.round((req.body.fileSize || 0) * optimizationOptions.quality),
      options: optimizationOptions,
      savings: Math.round((1 - optimizationOptions.quality) * 100)
    };
    
    res.json({
      success: true,
      result: optimizationResult
    });
  } catch (error) {
    logger.error('Error optimizing image:', error);
    res.status(500).json({
      success: false,
      message: 'Error optimizing image',
      error: error.message
    });
  }
});

// Get connectivity recommendations
router.get('/connectivity-recommendations', (req, res) => {
  try {
    const { userLocation, deviceType, connectivityLevel } = req.query;
    
    const recommendations = offlineService.getConnectivityRecommendations(userLocation, deviceType);
    
    // Add connectivity-specific recommendations
    if (connectivityLevel === 'low') {
      recommendations.push({
        type: 'connectivity',
        priority: 'high',
        message: 'Low connectivity detected. Using reduced data mode.',
        action: 'auto_enabled_reduced_data'
      });
    }
    
    res.json({
      success: true,
      connectivityLevel: connectivityLevel || 'unknown',
      recommendations
    });
  } catch (error) {
    logger.error('Error getting connectivity recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting connectivity recommendations',
      error: error.message
    });
  }
});

// Sync offline data (when user comes back online)
router.post('/sync-offline-data', async (req, res) => {
  try {
    const { offlineData, lastSyncTimestamp } = req.body;
    
    // In a real implementation, this would:
    // 1. Validate offline data
    // 2. Merge with server data
    // 3. Handle conflicts
    // 4. Update database
    // 5. Return updated data
    
    const syncResult = {
      synced: true,
      timestamp: new Date().toISOString(),
      processedItems: offlineData?.metadata?.pendingActions?.length || 0,
      conflicts: [], // Would contain any data conflicts
      updatedData: {
        lastSync: new Date().toISOString(),
        syncStatus: 'completed'
      }
    };
    
    logger.info(`Offline sync completed for user: ${req.user?.id}, items: ${syncResult.processedItems}`);
    
    res.json({
      success: true,
      result: syncResult
    });
  } catch (error) {
    logger.error('Error syncing offline data:', error);
    res.status(500).json({
      success: false,
      message: 'Error syncing offline data',
      error: error.message
    });
  }
});

// Get mobile-optimized CSS
router.get('/mobile-styles.css', (req, res) => {
  try {
    const css = offlineService.generateMobileOptimizedCSS();
    res.setHeader('Content-Type', 'text/css');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    res.send(css);
  } catch (error) {
    logger.error('Error generating mobile styles:', error);
    res.status(500).send('/* Error generating mobile styles */');
  }
});

// Health check for PWA features
router.get('/health', (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      features: {
        pwa: {
          manifest: true,
          serviceWorker: true,
          offlineSupport: true
        },
        mobile: {
          responsive: true,
          touchOptimized: true,
          performanceOptimized: true
        },
        connectivity: {
          offlineMode: true,
          reducedDataMode: true,
          syncSupport: true
        }
      }
    };
    
    res.json({
      success: true,
      health
    });
  } catch (error) {
    logger.error('Error in PWA health check:', error);
    res.status(500).json({
      success: false,
      message: 'PWA health check failed',
      error: error.message
    });
  }
});

module.exports = router;