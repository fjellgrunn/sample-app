import React, { useEffect } from 'react';
import { PItemAdapter } from '@fjell/providers';
import { WidgetAdapterContext } from '../providers/WidgetProvider';
import { IQFactory } from '@fjell/core';

export const DebugPItemsQuery: React.FC = () => {
  const adapterContext = PItemAdapter.usePItemAdapter(WidgetAdapterContext, 'WidgetAdapterContext');

  useEffect(() => {
    // TEMPORARY: Disable this to stop the infinite loop
    return;

    const debugQuery = async () => {
      console.log('=== DEBUG PITEMSQUERY ===');

      const query = IQFactory.all().toQuery();
      console.log('Query:', query);
      console.log('Adapter Context:', adapterContext);
      console.log('Cache Map:', adapterContext.cacheMap);

      // Check what's in the cache map
      const cacheKeys = adapterContext.cacheMap.keys();
      console.log('Cache keys:', cacheKeys);

      // Try direct query on cache map
      const directResult = adapterContext.cacheMap.queryIn(query, []);
      console.log('Direct cache query result:', directResult);

      // Try the adapter's all function
      try {
        console.log('Calling adapterContext.all()...');
        const adapterResult = await adapterContext.all(query);
        console.log('Adapter all() result:', adapterResult);
        console.log('Adapter all() result type:', typeof adapterResult);
        console.log('Adapter all() result isArray:', Array.isArray(adapterResult));

        // Check cache map after adapter call
        console.log('CacheMap after adapter.all():', adapterContext.cacheMap);
        console.log('CacheMap keys after adapter.all():', adapterContext.cacheMap.keys());

        // Try calling the cache operations directly to see what it returns
        console.log('Calling cache.operations.all() directly...');
        const directCacheResult = await adapterContext.cache.operations.all(query);
        console.log('Direct cache result:', directCacheResult);
        console.log('Direct cache result type:', typeof directCacheResult);
        console.log('Direct cache result isArray:', Array.isArray(directCacheResult));
        if (Array.isArray(directCacheResult)) {
          console.log('Direct cache result[0] (cacheMap):', directCacheResult[0]);
          console.log('Direct cache result[1] (items):', directCacheResult[1]);
        }
      } catch (error) {
        console.error('Adapter all() error:', error);
      }
    };

    debugQuery();
  }, [adapterContext]);

  return (
    <div style={{
      background: '#e8f5e8',
      padding: '15px',
      margin: '15px',
      borderRadius: '6px',
      fontSize: '11px',
      fontFamily: 'monospace',
      border: '1px solid #4caf50'
    }}>
      <h4>PItemsQuery Debug</h4>
      <p>Check console for detailed debug info</p>
    </div>
  );
};
