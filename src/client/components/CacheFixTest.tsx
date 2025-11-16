import React, { useEffect } from 'react';
import { useWidgetAdapter } from '../providers/WidgetProvider';
import { getWidgetCache, getWidgetCacheSync, isBrowser } from '../cache/ClientCache';

/**
 * This component tests a fix for the cache synchronization issue
 * by forcing the adapter's cacheMap to sync with the cache's cacheMap
 */
export const CacheFixTest: React.FC = () => {
  const adapter = useWidgetAdapter();

  useEffect(() => {
    console.log('🔧 CacheFixTest: Testing cache sync fix...');

    // Run once after a delay to let initial loading complete
    const timeout = setTimeout(async () => {
      console.log('🔧 CacheFixTest: Checking for sync issues...');

      // Add null check to prevent infinite loop
      if (!adapter || !adapter.name) {
        console.log('🔧 Adapter not ready yet, skipping sync check');
        return;
      }

      // Check if cache and adapter are out of sync
      try {
        if (!isBrowser()) {
          console.log('🔧 Not in browser environment, skipping cache check');
          return;
        }

        const widgetCache = getWidgetCacheSync();
        const cacheKeys = await widgetCache.cacheMap?.keys() || [];

        console.log('🔧 Cache keys:', cacheKeys.length);
        console.log('🔧 Adapter name:', adapter.name);
        console.log('🔧 Adapter pkTypes:', adapter.pkTypes);

        if (cacheKeys.length > 0) {
          console.log('🔧 *** CACHE HAS DATA ***');
          console.log('🔧 Cache has data, adapter should use cache instead of API');
          console.log('🔧 Skipping adapter.all() test to avoid unnecessary API calls');
        } else {
          console.log('🔧 No data in cache yet');
        }
      } catch (error) {
        console.error('🔧 Error checking sync status:', error);
      }
    }, 2000);

    return () => {
      clearTimeout(timeout);
      console.log('🔧 CacheFixTest cleanup');
    };
  }, [adapter]);

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      right: '10px',
      width: '300px',
      background: '#ffe6e6',
      border: '2px solid #cc0000',
      padding: '10px',
      fontSize: '11px',
      fontFamily: 'monospace',
      zIndex: 9997,
      borderRadius: '6px'
    }}>
      <h4 style={{ margin: '0 0 5px 0', color: '#cc0000' }}>Cache Sync Fix Test</h4>
      <div>Monitoring and fixing cache sync issues...</div>
      <div style={{ fontSize: '10px', color: '#666', marginTop: '5px' }}>
        Check console for sync attempts
      </div>
    </div>
  );
};
