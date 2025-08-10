import { widgetCache, widgetCacheUtils } from './WidgetCache';
import { widgetTypeCache, widgetTypeCacheUtils } from './WidgetTypeCache';

// Export the registry
export { cacheRegistry } from './registry';

// Export cache instances
export { widgetCache } from './WidgetCache';
export { widgetTypeCache } from './WidgetTypeCache';

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

// Combined utility functions for cache management
export const cacheUtils = {
  /**
   * Clear all widget-related caches
   */
  clearAll: async () => {
    await widgetCacheUtils.clear();
    await widgetTypeCacheUtils.clear();
  },

  /**
   * Get cache information for debugging
   */
  getCacheInfo: () => ({
    widget: widgetCacheUtils.getCacheInfo(),
    widgetType: widgetTypeCacheUtils.getCacheInfo()
  }),

  /**
   * Manually invalidate all widget-related caches when external changes occur
   */
  invalidateAll: () => {
    widgetCacheUtils.invalidate();
    widgetTypeCacheUtils.invalidate();
  },

  /**
   * Manually invalidate widget caches when external changes occur
   */
  invalidateWidgets: () => {
    widgetCacheUtils.invalidate();
  },

  /**
   * Manually invalidate widget type caches when external changes occur
   */
  invalidateWidgetTypes: () => {
    widgetTypeCacheUtils.invalidate();
  },

  /**
   * Get cache statistics for monitoring
   */
  getCacheStats: () => ({
    widget: widgetCacheUtils.getCacheStats(),
    widgetType: widgetTypeCacheUtils.getCacheStats()
  }),

  // Individual cache utilities
  widget: widgetCacheUtils,
  widgetType: widgetTypeCacheUtils
};
