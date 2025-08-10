import { Cache, createCache } from '@fjell/cache';
import { createCoordinate } from '@fjell/registry';
import type { WidgetType } from '../../model/WidgetType';
import { widgetTypeApi } from '../api/WidgetAPI';
import { cacheRegistry } from './registry';

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

// WidgetType Cache Instance
export const widgetTypeCache: Cache<WidgetType, 'widgetType'> = createCache(
  widgetTypeApi,
  createCoordinate('widgetType'),
  cacheRegistry,
  createCacheOptions('WidgetAppCache_WidgetTypes', 'widgetTypes')
);

// Utility functions for widget type cache management
export const widgetTypeCacheUtils = {
  /**
   * Clear widget type cache
   */
  clear: async () => {
    await widgetTypeCache.operations.reset();
  },

  /**
   * Get widget type cache information for debugging
   */
  getCacheInfo: () => widgetTypeCache.getCacheInfo(),

  /**
   * Manually invalidate widget type caches when external changes occur
   */
  invalidate: () => {
    widgetTypeCache.cacheMap.clearQueryResults();
  },

  /**
   * Get widget type cache statistics for monitoring
   */
  getCacheStats: () => {
    const sizeInfo = widgetTypeCache.cacheMap.getCurrentSize();
    return {
      ...sizeInfo
    };
  }
};
