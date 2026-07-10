import { widgetCache, widgetCacheUtils } from './WidgetCache';
import { widgetTypeCache, widgetTypeCacheUtils } from './WidgetTypeCache';
import { widgetComponentCache, widgetComponentCacheUtils } from './WidgetComponentCache';
import { invalidateCacheQueries } from './invalidateCacheQueries';

// Export the registry
export { cacheRegistry } from './registry';

// Export cache instances
export { widgetCache } from './WidgetCache';
export { widgetTypeCache } from './WidgetTypeCache';
export { widgetComponentCache } from './WidgetComponentCache';

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
      void invalidateCacheQueries(widgetCache, 'cross_cache_widgetType_removed');
    }
  }
});

// Widget cache events - invalidate components when widgets change
widgetCache.subscribe((event) => {
  if (event.type === 'item_removed' && event.item?.id) {
    console.log(`Widget removed, invalidating related components:`, event.item.id);
    void invalidateCacheQueries(widgetComponentCache, 'cross_cache_widget_removed');
  }
});

// WidgetComponent cache events for certification testing
widgetComponentCache.subscribe((event) => {
  if (event.type === 'item_created' || event.type === 'item_updated' || event.type === 'item_removed') {
    console.log(`WidgetComponent ${event.type} detected:`, event.item?.id);
  }
});

// Combined utility functions for cache management
export const cacheUtils = {
  /**
   * Clear all widget-related caches
   */
  clearAll: async () => {
    await widgetCacheUtils.clear();
    await widgetTypeCacheUtils.clear();
    await widgetComponentCacheUtils.clear();
  },

  /**
   * Get cache information for debugging
   */
  getCacheInfo: () => ({
    widget: widgetCacheUtils.getCacheInfo(),
    widgetType: widgetTypeCacheUtils.getCacheInfo(),
    widgetComponent: widgetComponentCacheUtils.getCacheInfo()
  }),

  /**
   * Manually invalidate all widget-related caches when external changes occur
   */
  invalidateAll: async () => {
    await Promise.all([
      widgetCacheUtils.invalidate(),
      widgetTypeCacheUtils.invalidate(),
      widgetComponentCacheUtils.invalidate()
    ]);
  },

  /**
   * Manually invalidate widget caches when external changes occur
   */
  invalidateWidgets: async () => {
    await widgetCacheUtils.invalidate();
  },

  /**
   * Manually invalidate widget type caches when external changes occur
   */
  invalidateWidgetTypes: async () => {
    await widgetTypeCacheUtils.invalidate();
  },

  /**
   * Manually invalidate widget component caches when external changes occur
   */
  invalidateWidgetComponents: async () => {
    await widgetComponentCacheUtils.invalidate();
  },

  /**
   * Get cache statistics for monitoring
   */
  getCacheStats: async () => ({
    widget: await widgetCacheUtils.getCacheStats(),
    widgetType: await widgetTypeCacheUtils.getCacheStats(),
    widgetComponent: await widgetComponentCacheUtils.getCacheStats()
  }),

  // Individual cache utilities
  widget: widgetCacheUtils,
  widgetType: widgetTypeCacheUtils,
  widgetComponent: widgetComponentCacheUtils
};
