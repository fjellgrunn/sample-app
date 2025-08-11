import { Cache } from '@fjell/cache';
import { Widget } from '../../model/Widget';

// Type-only imports to avoid triggering cache creation during SSR
type WidgetCache = Cache<Widget, 'widget'>;

/**
 * Client-side cache instances that are only initialized when accessed in the browser.
 * This prevents SSR issues with IndexedDB.
 */
let _widgetCache: WidgetCache | null = null;
let _widgetTypeCache: any | null = null;

/**
 * Get widget cache instance, initializing it only on first access in the browser
 */
export const getWidgetCache = async (): Promise<WidgetCache> => {
  if (!_widgetCache) {
    if (typeof window === 'undefined') {
      throw new Error('Widget cache can only be accessed in browser environment');
    }

    // Import and initialize cache only in browser
    const { widgetCache } = await import('./WidgetCache');
    _widgetCache = widgetCache;
  }

  return _widgetCache!; // We know it's not null after the check above
};

/**
 * Get widget cache instance synchronously (must be called after async initialization)
 */
export const getWidgetCacheSync = (): WidgetCache => {
  if (!_widgetCache) {
    throw new Error('Widget cache not yet initialized. Call getWidgetCache() first.');
  }
  return _widgetCache;
};

/**
 * Get widget type cache instance, initializing it only on first access in the browser
 */
export const getWidgetTypeCache = async () => {
  if (!_widgetTypeCache) {
    if (typeof window === 'undefined') {
      throw new Error('Widget type cache can only be accessed in browser environment');
    }

    // Import and initialize cache only in browser
    const { widgetTypeCache } = await import('./WidgetTypeCache');
    _widgetTypeCache = widgetTypeCache;
  }

  return _widgetTypeCache;
};

/**
 * Get widget type cache instance synchronously (must be called after async initialization)
 */
export const getWidgetTypeCacheSync = () => {
  if (!_widgetTypeCache) {
    throw new Error('Widget type cache not yet initialized. Call getWidgetTypeCache() first.');
  }
  return _widgetTypeCache;
};

/**
 * Get all cache utilities, initializing them only on first access in the browser
 */
export const getCacheUtils = async () => {
  if (typeof window === 'undefined') {
    throw new Error('Cache utils can only be accessed in browser environment');
  }

  // Import utilities only in browser
  const { cacheUtils } = await import('./index');
  return cacheUtils;
};

/**
 * Check if we're in a browser environment
 */
export const isBrowser = () => typeof window !== 'undefined';
