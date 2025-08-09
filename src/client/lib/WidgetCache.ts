import { Cache, createCache, createRegistry, IndexDBCacheMap } from '@fjell/cache';
import { createCoordinate } from '@fjell/registry';
import type { Widget } from '../../model/Widget';
import type { WidgetType } from '../../model/WidgetType';
import { widgetApi, widgetTypeApi } from './WidgetAPI';

// Create Cache Registry
export const cacheRegistry = createRegistry();

// Cache configuration optimized for browser environment with IndexedDB
const createCacheOptions = (dbName: string, storeName: string) => ({
  cacheType: 'indexedDB' as const,
  indexedDBConfig: {
    dbName,
    version: 1,
    storeName
  },
  enableDebugLogging: process.env.NODE_ENV === 'development',
  autoSync: true,
  maxRetries: 5,
  retryDelay: 2000,
  ttl: 900000, // 15 minutes
  evictionPolicy: 'lru' as const,
  evictionConfig: {
    type: 'lru'
  }
});

// Widget Cache Instance
export const widgetCache: Cache<Widget, 'widget'> = createCache(
  widgetApi,
  createCoordinate('widget'),
  cacheRegistry,
  createCacheOptions('WidgetAppCache_Widgets', 'widgets')
);

// WidgetType Cache Instance
export const widgetTypeCache: Cache<WidgetType, 'widgetType'> = createCache(
  widgetTypeApi,
  createCoordinate('widgetType'),
  cacheRegistry,
  createCacheOptions('WidgetAppCache_WidgetTypes', 'widgetTypes')
);

// Cache event subscriptions for cross-cache invalidation
widgetCache.subscribe((event) => {
  // When widgets change, we might need to invalidate widget type caches if they track widget counts
  if (event.type === 'item_created' || event.type === 'item_updated' || event.type === 'item_removed') {
    console.log(`Widget ${event.type} detected:`, event.item?.id);
  }
});

widgetTypeCache.subscribe((event) => {
  // When widget types change, we might need to invalidate related widget caches
  if (event.type === 'item_created' || event.type === 'item_updated' || event.type === 'item_removed') {
    console.log(`WidgetType ${event.type} detected:`, event.item?.id);

    // Invalidate widget caches when widget types change
    if (event.type === 'item_removed' && event.item?.id) {
      // Clear any cached widgets of this type
      widgetCache.cacheMap.clearQueryResults();
    }
  }
});

// Utility functions for cache management
export const cacheUtils = {
  /**
   * Clear all widget-related caches
   */
  clearAll: async () => {
    await widgetCache.operations.reset();
    await widgetTypeCache.operations.reset();
  },

  /**
   * Get cache information for debugging
   */
  getCacheInfo: () => ({
    widget: widgetCache.getCacheInfo(),
    widgetType: widgetTypeCache.getCacheInfo()
  }),

  /**
   * Manually invalidate widget caches when external changes occur
   */
  invalidateWidgets: () => {
    widgetCache.cacheMap.clearQueryResults();
  },

  /**
   * Manually invalidate widget type caches when external changes occur
   */
  invalidateWidgetTypes: () => {
    widgetTypeCache.cacheMap.clearQueryResults();
  },

  /**
   * Get cache statistics for monitoring
   */
  getCacheStats: () => {
    const widgetSizeInfo = widgetCache.cacheMap.getCurrentSize();
    const widgetTypeSizeInfo = widgetTypeCache.cacheMap.getCurrentSize();

    return {
      widget: {
        ...widgetSizeInfo
      },
      widgetType: {
        ...widgetTypeSizeInfo
      }
    };
  }
};
