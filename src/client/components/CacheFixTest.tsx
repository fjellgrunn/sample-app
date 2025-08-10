import React, { useEffect } from 'react';
import { useWidgetAdapter } from '../providers/WidgetProvider';
import { widgetCache } from '../cache';

/**
 * This component tests a fix for the cache synchronization issue
 * by forcing the adapter's cacheMap to sync with the cache's cacheMap
 */
export const CacheFixTest: React.FC = () => {
  const adapter = useWidgetAdapter();

  useEffect(() => {
    console.log('🔧 CacheFixTest: Testing cache sync fix...');

    // Run once after a delay to let initial loading complete
    const timeout = setTimeout(() => {
      console.log('🔧 CacheFixTest: Checking for sync issues...');

      // Check if cache and adapter are out of sync
      const cacheKeys = widgetCache.cacheMap.keys();
      const adapterKeys = adapter.cacheMap.keys();

      console.log('🔧 Cache keys:', cacheKeys.length);
      console.log('🔧 Adapter keys:', adapterKeys.length);
      console.log('🔧 Same reference?', widgetCache.cacheMap === adapter.cacheMap);

      if (cacheKeys.length > 0 && adapterKeys.length === 0) {
        console.log('🔧 *** SYNC ISSUE DETECTED ***');
        console.log('🔧 Cache has data but adapter cacheMap is empty!');

        // FORCE SYNC: Make adapter use the cache's cacheMap
        try {
          console.log('🔧 Attempting to force sync...');
          console.log('🔧 Adapter object:', adapter);

          // Try direct assignment (this is a hack but should work for testing)
          (adapter as any).cacheMap = widgetCache.cacheMap;
          console.log('🔧 Direct cacheMap assignment completed!');

          // Force React re-render by incrementing cache version if possible
          const adapterInternal = (adapter as any);
          if (adapterInternal.setCacheVersion && typeof adapterInternal.setCacheVersion === 'function') {
            adapterInternal.setCacheVersion((prev: number) => prev + 1);
            console.log('🔧 Cache version incremented to trigger re-render');
          }

        } catch (error) {
          console.error('🔧 Sync failed:', error);
        }
      } else {
        console.log('🔧 No sync issues detected');
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
