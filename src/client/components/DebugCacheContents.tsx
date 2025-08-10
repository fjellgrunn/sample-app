import React, { useEffect, useState } from 'react';
import { widgetCache } from '../cache';
import { IQFactory } from '@fjell/core';

export const DebugCacheContents: React.FC = () => {
  const [cacheData, setCacheData] = useState<any>({});

  useEffect(() => {
    const checkCache = async () => {
      try {
        console.log('=== Checking cache contents ===');

        // Check cache operations
        const allFromCache = await widgetCache.operations.all();
        console.log('widgetCache.operations.all():', allFromCache);

        // Check cache map directly
        const query = IQFactory.all().toQuery();
        console.log('Query object:', query);

        const fromCacheMap = widgetCache.cacheMap.queryIn(query, []);
        console.log('widgetCache.cacheMap.queryIn(query, []):', fromCacheMap);

        // Check all keys in cache
        const keys = widgetCache.cacheMap.keys();
        console.log('Cache keys:', keys);

        // Check cache size
        const size = widgetCache.cacheMap.getCurrentSize();
        console.log('Cache size:', size);

        setCacheData({
          allFromCache: allFromCache?.length || 0,
          fromCacheMap: fromCacheMap?.length || 0,
          keys: keys?.length || 0,
          size
        });
      } catch (error) {
        console.error('Error checking cache:', error);
        setCacheData({ error: error.message });
      }
    };

    checkCache();
  }, []);

  return (
    <div style={{
      background: '#fff3cd',
      padding: '20px',
      margin: '20px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      border: '1px solid #ffeaa7'
    }}>
      <h3>Cache Contents Debug</h3>
      <pre>{JSON.stringify(cacheData, null, 2)}</pre>
    </div>
  );
};
