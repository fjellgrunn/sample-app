import React, { useEffect, useState } from 'react';
import { widgetCache } from '../cache';
import { IQFactory } from '@fjell/core';

export const DetailedCacheDebug: React.FC = () => {
  const [debugData, setDebugData] = useState<any>({});

  useEffect(() => {
    const detailedDebug = async () => {
      try {
        console.log('=== DETAILED CACHE DEBUG ===');

        // 1. Check what's in the cache map directly
        const allKeys = widgetCache.cacheMap.keys();
        console.log('All cache keys:', allKeys);

        // 2. Get each item individually
        const individualItems = [];
        for (const key of allKeys) {
          const item = widgetCache.cacheMap.get(key);
          individualItems.push(item);
          console.log(`Item for key ${key.pk}:`, item);
        }

        // 3. Check the operations.all() method step by step
        console.log('Calling widgetCache.operations.all()...');
        const allFromOpsResult = await widgetCache.operations.all();
        console.log('Raw result from operations.all():', allFromOpsResult);

        // Extract the actual items from the [CacheMap, Items[]] tuple
        const allFromOps = allFromOpsResult[1];
        console.log('Extracted items from operations.all():', allFromOps);

        // 4. Check if there's a query issue
        const emptyQuery = {};
        const allQuery = IQFactory.all().toQuery();

        console.log('Empty query {}:', emptyQuery);
        console.log('IQFactory.all().toQuery():', allQuery);

        const directQuery = widgetCache.cacheMap.queryIn(emptyQuery, []);
        const factoryQuery = widgetCache.cacheMap.queryIn(allQuery, []);

        console.log('Direct query with {}:', directQuery);
        console.log('Factory query:', factoryQuery);

        // 5. Check cache coordinate and API
        console.log('Cache coordinate:', widgetCache.coordinate);
        console.log('Cache API:', widgetCache.api);

        setDebugData({
          totalKeys: allKeys.length,
          individualCount: individualItems.length,
          operationsAllCount: allFromOps?.length || 0,
          directQueryCount: directQuery?.length || 0,
          factoryQueryCount: factoryQuery?.length || 0,
          sampleKey: allKeys[0],
          sampleItem: individualItems[0],
          allFromOps: allFromOps?.slice(0, 3), // First 3 items
          queries: { emptyQuery, allQuery }
        });

      } catch (error) {
        console.error('Detailed debug error:', error);
        setDebugData({ error: error.message });
      }
    };

    detailedDebug();
  }, []);

  return (
    <div style={{
      background: '#e3f2fd',
      padding: '20px',
      margin: '20px',
      borderRadius: '8px',
      fontSize: '11px',
      fontFamily: 'monospace',
      border: '1px solid #2196f3',
      maxHeight: '400px',
      overflow: 'auto'
    }}>
      <h3>Detailed Cache Debug</h3>
      <pre>{JSON.stringify(debugData, null, 2)}</pre>
    </div>
  );
};
