// PWA Utility Functions for Tokay Resilience Platform

// Service Worker Registration
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('SW registered successfully:', registration);
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('New service worker found:', newWorker);
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content is available
            showUpdateAvailable();
          }
        });
      });
      
      // Handle controller change (new SW takes control)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Controller changed, reloading page');
        window.location.reload();
      });
      
      return registration;
    } catch (error) {
      console.error('SW registration failed:', error);
      return null;
    }
  } else {
    console.warn('Service Worker not supported');
    return null;
  }
};

// Show update available notification
export const showUpdateAvailable = () => {
  const updateBanner = document.createElement('div');
  updateBanner.id = 'update-banner';
  updateBanner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 12px 20px;
    text-align: center;
    z-index: 9999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    animation: slideDown 0.3s ease-out;
  `;
  
  updateBanner.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; gap: 15px;">
      <span>🔄 Versi baru Tokay Platform tersedia!</span>
      <button id="update-btn" style="
        background: white;
        color: #667eea;
        border: none;
        padding: 6px 12px;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        font-size: 12px;
      ">Kemas Kini</button>
      <button id="dismiss-btn" style="
        background: transparent;
        color: white;
        border: 1px solid white;
        padding: 6px 12px;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        font-size: 12px;
      ">Nanti</button>
    </div>
    <style>
      @keyframes slideDown {
        from { transform: translateY(-100%); }
        to { transform: translateY(0); }
      }
      #update-btn:hover { background: #f0f0f0; }
      #dismiss-btn:hover { background: rgba(255,255,255,0.1); }
    </style>
  `;
  
  document.body.appendChild(updateBanner);
  
  // Handle update button click
  document.getElementById('update-btn').addEventListener('click', () => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
    updateBanner.remove();
  });
  
  // Handle dismiss button click
  document.getElementById('dismiss-btn').addEventListener('click', () => {
    updateBanner.remove();
  });
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (document.getElementById('update-banner')) {
      updateBanner.remove();
    }
  }, 10000);
};

// Check if app is installed (PWA)
export const isAppInstalled = () => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone === true;
};

// Show install prompt for PWA
export const showInstallPrompt = () => {
  let deferredPrompt = null;
  
  // Listen for beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallBanner();
  });
  
  const showInstallBanner = () => {
    const installBanner = document.createElement('div');
    installBanner.id = 'install-banner';
    installBanner.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      right: 20px;
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      animation: slideUp 0.3s ease-out;
      max-width: 400px;
      margin: 0 auto;
    `;
    
    installBanner.innerHTML = `
      <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
        <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 24px;">
          🛡️
        </div>
        <div>
          <div style="font-weight: 600; font-size: 16px; color: #333; margin-bottom: 4px;">Pasang Tokay Platform</div>
          <div style="font-size: 12px; color: #666;">Akses pantas, fungsi luar talian, & notifikasi</div>
        </div>
      </div>
      <div style="display: flex; gap: 10px;">
        <button id="install-btn" style="
          flex: 1;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 10px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-size: 14px;
        ">Pasang</button>
        <button id="dismiss-install-btn" style="
          flex: 1;
          background: #f0f0f0;
          color: #666;
          border: none;
          padding: 10px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-size: 14px;
        ">Tidak sekarang</button>
      </div>
      <style>
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        #install-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); }
        #dismiss-install-btn:hover { background: #e0e0e0; }
      </style>
    `;
    
    document.body.appendChild(installBanner);
    
    // Handle install button click
    document.getElementById('install-btn').addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        deferredPrompt = null;
      }
      installBanner.remove();
    });
    
    // Handle dismiss button click
    document.getElementById('dismiss-install-btn').addEventListener('click', () => {
      installBanner.remove();
    });
    
    // Auto-remove after 15 seconds
    setTimeout(() => {
      if (document.getElementById('install-banner')) {
        installBanner.remove();
      }
    }, 15000);
  };
};

// Network status monitoring
export const monitorNetworkStatus = () => {
  const updateNetworkStatus = () => {
    const isOnline = navigator.onLine;
    const statusIndicator = document.getElementById('network-status');
    
    if (isOnline) {
      console.log('🟢 Network is online');
      if (statusIndicator) {
        statusIndicator.style.background = '#48bb78';
        statusIndicator.title = 'Dalam talian';
      }
      // Hide offline banner if exists
      const offlineBanner = document.getElementById('offline-banner');
      if (offlineBanner) {
        offlineBanner.remove();
      }
    } else {
      console.log('🔴 Network is offline');
      if (statusIndicator) {
        statusIndicator.style.background = '#f56565';
        statusIndicator.title = 'Luar talian';
      }
      showOfflineBanner();
    }
  };
  
  window.addEventListener('online', updateNetworkStatus);
  window.addEventListener('offline', updateNetworkStatus);
  
  // Initial status check
  updateNetworkStatus();
};

// Show offline banner
export const showOfflineBanner = () => {
  // Remove existing offline banner if any
  const existingBanner = document.getElementById('offline-banner');
  if (existingBanner) {
    existingBanner.remove();
  }
  
  const offlineBanner = document.createElement('div');
  offlineBanner.id = 'offline-banner';
  offlineBanner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #f56565;
    color: white;
    padding: 10px 20px;
    text-align: center;
    z-index: 9998;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 13px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    animation: slideDown 0.3s ease-out;
  `;
  
  offlineBanner.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
      <span>📱</span>
      <span>Anda sedang luar talian. Sesetengah fungsi mungkin terhad.</span>
    </div>
  `;
  
  document.body.appendChild(offlineBanner);
};

// Create network status indicator
export const createNetworkStatusIndicator = () => {
  const indicator = document.createElement('div');
  indicator.id = 'network-status';
  indicator.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #48bb78;
    z-index: 9997;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    transition: all 0.3s ease;
    cursor: pointer;
  `;
  indicator.title = 'Dalam talian';
  
  document.body.appendChild(indicator);
  
  // Add click to refresh functionality
  indicator.addEventListener('click', () => {
    if (!navigator.onLine) {
      showOfflineBanner();
    } else {
      window.location.reload();
    }
  });
  
  return indicator;
};

// Initialize PWA features
export const initializePWA = async () => {
  console.log('🚀 Initializing PWA features...');
  
  // Register service worker
  await registerServiceWorker();
  
  // Monitor network status
  monitorNetworkStatus();
  
  // Create network status indicator
  createNetworkStatusIndicator();
  
  // Show install prompt
  showInstallPrompt();
  
  // Check if app is installed
  if (isAppInstalled()) {
    console.log('📱 App is running in installed mode');
  }
  
  console.log('✅ PWA features initialized');
};

// Export connection quality detection
export const getConnectionQuality = () => {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  if (!connection) {
    return { quality: 'unknown', effectiveType: 'unknown' };
  }
  
  return {
    quality: connection.effectiveType || 'unknown',
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData
  };
};

// Request notification permission
export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    console.log('Notification permission:', permission);
    return permission;
  }
  return 'denied';
};

// Subscribe to push notifications
export const subscribeToPushNotifications = async () => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array('YOUR_VAPID_PUBLIC_KEY')
      });
      
      console.log('Push subscription:', subscription);
      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }
  return null;
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}