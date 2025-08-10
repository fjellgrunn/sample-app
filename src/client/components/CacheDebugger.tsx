import React, { useEffect, useState } from 'react';
import { widgetCache, widgetTypeCache } from '../cache';
import { IQFactory } from '@fjell/core';
import { useWidgetAdapter } from '../providers/WidgetProvider';

export const CacheDebugger: React.FC = () => {
  const widgetAdapter = useWidgetAdapter();
  const [cacheData, setCacheData] = useState<{
    widgets: any[];
    widgetTypes: any[];
    directWidgets: any[];
    directWidgetTypes: any[];
    adapterCacheMapKeys: any[];
    directCacheMapKeys: any[];
    cacheMapSame: boolean;
    timestamp: string;
  }>({
    widgets: [],
    widgetTypes: [],
    directWidgets: [],
    directWidgetTypes: [],
    adapterCacheMapKeys: [],
    directCacheMapKeys: [],
    cacheMapSame: false,
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    const checkCache = async () => {
      console.log('🔍 CacheDebugger: Checking cache contents...');

      try {
        // Check cache.operations.all()
        console.log('🔍 Testing cache.operations.all()...');
        const widgetResult = await widgetCache.operations.all();
        const widgetTypeResult = await widgetTypeCache.operations.all();

        console.log('Widget operations result:', widgetResult);
        console.log('Widget type operations result:', widgetTypeResult);

        const widgets = widgetResult?.[1] || [];
        const widgetTypes = widgetTypeResult?.[1] || [];

        // Test cache event subscription
        console.log('🔍 Testing cache event subscription...');
        try {
          const testSubscription = widgetCache.subscribe((event) => {
            console.log('🔔 Cache event received:', event.type, event);
          }, {
            eventTypes: ['items_queried', 'item_retrieved', 'item_set'],
            debounceMs: 0
          });

          console.log('🔍 Cache subscription created:', !!testSubscription);

          // Clean up test subscription after a bit
          setTimeout(() => {
            if (testSubscription && typeof testSubscription.unsubscribe === 'function') {
              testSubscription.unsubscribe();
              console.log('🔍 Test subscription cleaned up');
            }
          }, 5000);
        } catch (error) {
          console.error('🔍 Cache subscription failed:', error);
        }

        // Check direct cache map access
        console.log('🔍 Testing direct cacheMap.queryIn()...');
        const directWidgets = widgetCache.cacheMap.queryIn({}, []);
        const directWidgetTypes = widgetTypeCache.cacheMap.queryIn({}, []);

        console.log('Direct widgets:', directWidgets);
        console.log('Direct widget types:', directWidgetTypes);

        // Check adapter cache map
        const adapterCacheMapKeys = widgetAdapter.cacheMap.keys();
        const directCacheMapKeys = widgetCache.cacheMap.keys();
        const cacheMapSame = widgetAdapter.cacheMap === widgetCache.cacheMap;

        console.log('🔍 Adapter cacheMap keys:', adapterCacheMapKeys);
        console.log('🔍 Direct cache cacheMap keys:', directCacheMapKeys);
        console.log('🔍 CacheMap same reference?', cacheMapSame);
        console.log('🔍 Adapter cacheMap:', widgetAdapter.cacheMap);
        console.log('🔍 Direct cacheMap:', widgetCache.cacheMap);

        // POTENTIAL FIX: Force adapter to sync with cache's cacheMap
        if (widgetAdapter.cacheMap !== widgetCache.cacheMap && directCacheMapKeys.length > 0) {
          console.log('🔧 FIXING: Adapter cacheMap out of sync! Attempting to sync...');

          // Force the adapter to update its cacheMap reference
          // This is a temporary fix to test our hypothesis
          try {
            // Access the adapter's internal state setter (this is a hack for debugging)
            const adapterInternal = (widgetAdapter as any);
            if (adapterInternal.setCacheMap && typeof adapterInternal.setCacheMap === 'function') {
              console.log('🔧 Found setCacheMap function, calling it...');
              adapterInternal.setCacheMap(widgetCache.cacheMap);
            } else {
              console.log('🔧 No setCacheMap function found');
            }
          } catch (error) {
            console.error('🔧 Failed to sync cacheMap:', error);
          }
        }

        setCacheData({
          widgets,
          widgetTypes,
          directWidgets,
          directWidgetTypes,
          adapterCacheMapKeys,
          directCacheMapKeys,
          cacheMapSame,
          timestamp: new Date().toISOString()
        });

        console.log('🔍 CacheDebugger state updated');
      } catch (error) {
        console.error('🔍 CacheDebugger error:', error);
      }
    };

    // Check immediately
    checkCache();

    // Check periodically
    const interval = setInterval(checkCache, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      width: '400px',
      background: 'white',
      border: '2px solid #007acc',
      padding: '15px',
      fontSize: '11px',
      fontFamily: 'monospace',
      maxHeight: '500px',
      overflow: 'auto',
      zIndex: 9999,
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#007acc' }}>Cache Debugger</h3>
      <div style={{ marginBottom: '10px', fontSize: '10px', color: '#666' }}>
        Last check: {cacheData.timestamp}
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>cache.operations.all() results:</strong>
        <div>Widgets: {cacheData.widgets.length} items</div>
        <div>Widget Types: {cacheData.widgetTypes.length} items</div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>Direct cacheMap.queryIn() results:</strong>
        <div>Widgets: {cacheData.directWidgets.length} items</div>
        <div>Widget Types: {cacheData.directWidgetTypes.length} items</div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>CacheMap Analysis:</strong>
        <div>Adapter cacheMap keys: {cacheData.adapterCacheMapKeys.length}</div>
        <div>Direct cacheMap keys: {cacheData.directCacheMapKeys.length}</div>
        <div>Same cacheMap reference: {String(cacheData.cacheMapSame)}</div>
      </div>

      {cacheData.widgets.length > 0 && (
        <div style={{ marginBottom: '10px' }}>
          <strong>Sample widget:</strong>
          <div style={{ background: '#f5f5f5', padding: '5px', fontSize: '10px' }}>
            {JSON.stringify(cacheData.widgets[0], null, 2).substring(0, 200)}...
          </div>
        </div>
      )}

      {cacheData.directWidgets.length > 0 && (
        <div style={{ marginBottom: '10px' }}>
          <strong>Sample direct widget:</strong>
          <div style={{ background: '#f0f8ff', padding: '5px', fontSize: '10px' }}>
            {JSON.stringify(cacheData.directWidgets[0], null, 2).substring(0, 200)}...
          </div>
        </div>
      )}
    </div>
  );
};
