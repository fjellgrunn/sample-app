import React, { useEffect, useState } from 'react';
import { useWidgetAdapter } from '../providers/WidgetProvider';

export const AdapterEventDebugger: React.FC = () => {
  const widgetAdapter = useWidgetAdapter();
  const [eventLog, setEventLog] = useState<string[]>([]);
  const [cacheVersion, setCacheVersion] = useState(0);

  useEffect(() => {
    console.log('🔍 AdapterEventDebugger: Setting up monitoring...');
    console.log('🔍 Adapter:', widgetAdapter);
    console.log('🔍 Adapter cache:', widgetAdapter.cache);

    // Monitor cache version changes by polling
    const versionInterval = setInterval(() => {
      // We can't directly access the adapter's internal cacheVersion state,
      // but we can monitor when the cacheMap keys change
      const currentKeys = widgetAdapter.cacheMap.keys();
      const currentKeyCount = currentKeys.length;

      if (currentKeyCount !== cacheVersion) {
        setCacheVersion(currentKeyCount);
        const logEntry = `Cache keys changed: ${currentKeyCount} items at ${new Date().toISOString()}`;
        setEventLog(prev => [...prev.slice(-9), logEntry]);
        console.log('🔔 Cache version change detected:', logEntry);
      }
    }, 500);

    // Try to set up event subscription directly on the cache
    let subscription: any = null;
    try {
      if (widgetAdapter.cache && typeof widgetAdapter.cache.subscribe === 'function') {
        console.log('🔍 Setting up direct cache event subscription...');
        subscription = widgetAdapter.cache.subscribe((event: any) => {
          const logEntry = `Event: ${event.type} at ${new Date().toISOString()}`;
          setEventLog(prev => [...prev.slice(-9), logEntry]);
          console.log('🔔 Direct cache event:', event);
        }, {
          eventTypes: [
            'item_created', 'item_updated', 'item_removed', 'item_retrieved',
            'item_set', 'items_queried', 'cache_cleared', 'location_invalidated', 'query_invalidated'
          ],
          debounceMs: 0
        });
        console.log('🔍 Direct cache subscription created:', !!subscription);
      } else {
        console.log('🔍 Cache does not support direct subscription');
      }
    } catch (error) {
      console.error('🔍 Failed to set up direct cache subscription:', error);
    }

    return () => {
      clearInterval(versionInterval);
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
        console.log('🔍 Direct cache subscription cleaned up');
      }
    };
  }, [widgetAdapter]);

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      width: '400px',
      background: '#fff3cd',
      border: '2px solid #856404',
      padding: '10px',
      fontSize: '10px',
      fontFamily: 'monospace',
      maxHeight: '300px',
      overflow: 'auto',
      zIndex: 9998,
      borderRadius: '6px'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>Adapter Event Monitor</h4>
      <div>Cache Key Count: {cacheVersion}</div>
      <div>Adapter Name: {widgetAdapter.name}</div>
      <div style={{ marginTop: '10px', fontWeight: 'bold' }}>Event Log:</div>
      {eventLog.length === 0 ? (
        <div style={{ color: '#666' }}>No events detected</div>
      ) : (
        eventLog.map((entry, index) => (
          <div key={index} style={{ fontSize: '9px', color: '#654321' }}>
            {entry}
          </div>
        ))
      )}
    </div>
  );
};
