import { Cache, createCache } from '@fjell/cache';
import { createCoordinate } from '@fjell/registry';
import type { Widget } from '../../model/Widget';
import { widgetApi } from '../api/WidgetAPI';
import { cacheRegistry } from './registry';
// Removed circular dependency import

// Cache configuration optimized for browser environment with IndexedDB
const createCacheOptions = (dbName: string, storeName: string) => ({
  cacheType: 'indexedDB' as const,
  indexedDBConfig: {
    dbName,
    version: 1,
    storeName
  },
  enableDebugLogging: true, // Enable debug logging
  autoSync: true,
  maxRetries: 5,
  retryDelay: 2000,
  ttl: 900000, // 15 minutes
  evictionPolicy: 'lru' as const,
  evictionConfig: {
    type: 'lru' as const
  }
});

// Widget Cache Instance
export const widgetCache: Cache<Widget, 'widget'> = createCache(
  widgetApi,
  createCoordinate('widget'),
  cacheRegistry,
  createCacheOptions('WidgetAppCache_Widgets', 'widgets')
);

// Utility functions for widget cache management
export const widgetCacheUtils = {
  /**
   * Clear widget cache
   */
  clear: async () => {
    await widgetCache.operations.reset();
  },

  /**
   * Get widget cache information for debugging
   */
  getCacheInfo: () => widgetCache.getCacheInfo(),

  /**
   * Manually invalidate widget caches when external changes occur
   */
  invalidate: () => {
    widgetCache.cacheMap.clearQueryResults();
  },

  /**
   * Get widget cache statistics for monitoring
   */
  getCacheStats: () => {
    const sizeInfo = widgetCache.cacheMap.getCurrentSize();
    return {
      ...sizeInfo
    };
  }
};

// Export the cache registry for test access
export { cacheRegistry };

// Cross-cache utilities moved to index.ts to avoid circular dependencies
