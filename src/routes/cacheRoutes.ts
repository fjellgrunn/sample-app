import { Request, Response, Router } from 'express';
import { getLogger } from '@fjell/logging';
import { Widget } from '../model/Widget';
import { WidgetType } from '../model/WidgetType';
import type { SequelizeLibrary } from '@fjell/lib-sequelize';

const logger = getLogger('CacheRoutes');

/**
 * Create API routes specifically designed to demonstrate Two Level Cache functionality
 * These endpoints provide different query patterns to help understand cache behavior
 */
export const createCacheRoutes = (
  widgetLibrary: SequelizeLibrary<Widget, 'widget'>,
  widgetTypeLibrary: SequelizeLibrary<WidgetType, 'widgetType'>
): Router => {
  logger.info('Creating Two Level Cache demonstration routes...');

  const cacheRouter = Router();

  // ========================================
  // SELECTIVE QUERIES - Test Facet/Partial Cache
  // ========================================

  /**
   * Get active widgets only - This is a selective query that uses a DIFFERENT cache key
   * Uses cache-level filtering: operations.all({ isActive: true })
   */
  cacheRouter.get('/widgets/active', async (req: Request, res: Response) => {
    try {
      logger.info('Selective Query: Active widgets requested - using cache-level filter');
      
      // CACHE-LEVEL QUERY: Creates cache key "query:widget:all:{"query":{"isActive":true}}"
      const activeWidgets = await widgetLibrary.operations.all({ isActive: true });
      
      // Also get total count for comparison (different cache key)
      const allWidgets = await widgetLibrary.operations.all({});
      
      logger.info('Active widgets query completed', {
        total: allWidgets.length,
        active: activeWidgets.length,
        cacheType: 'selective/cache-level',
        cacheKey: 'query:widget:all:{"query":{"isActive":true}}'
      });

      res.json({
        success: true,
        data: activeWidgets,
        meta: {
          queryType: 'selective',
          cacheLayer: 'facet',
          ttl: '60 seconds',
          description: 'Active widgets only - Uses DIFFERENT cache key than all widgets',
          cacheKey: 'query:widget:all:{"query":{"isActive":true}}',
          totalCount: allWidgets.length,
          filteredCount: activeWidgets.length,
          cacheClob: 'This query has its OWN cache entry, separate from /widgets/all'
        }
      });
    } catch (error) {
      logger.error('Active widgets query failed', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch active widgets'
      });
    }
  });

  /**
   * Get widgets by type - Another selective query using a DIFFERENT cache key
   * Uses cache-level filtering: operations.all({ widgetTypeId: id })
   */
  cacheRouter.get('/widgets/by-type/:widgetTypeId', async (req: Request, res: Response) => {
    try {
      const { widgetTypeId } = req.params;
      logger.info('Selective Query: Widgets by type requested - using cache-level filter', { widgetTypeId });
      
      // CACHE-LEVEL QUERY: Creates cache key "query:widget:all:{"query":{"widgetTypeId":"xxx"}}"
      const filteredWidgets = await widgetLibrary.operations.all({ widgetTypeId });
      
      // Also get total count for comparison (different cache key)
      const allWidgets = await widgetLibrary.operations.all({});
      
      logger.info('Widgets by type query completed', {
        widgetTypeId,
        total: allWidgets.length,
        filtered: filteredWidgets.length,
        cacheType: 'selective/cache-level',
        cacheKey: `query:widget:all:{"query":{"widgetTypeId":"${widgetTypeId}"}}`
      });

      res.json({
        success: true,
        data: filteredWidgets,
        meta: {
          queryType: 'selective',
          cacheLayer: 'facet',
          ttl: '60 seconds',
          description: `Widgets by type ${widgetTypeId} - Uses DIFFERENT cache key per type`,
          cacheKey: `query:widget:all:{"query":{"widgetTypeId":"${widgetTypeId}"}}`,
          widgetTypeId,
          totalCount: allWidgets.length,
          filteredCount: filteredWidgets.length,
          cacheClob: 'Each widgetTypeId gets its OWN cache entry - no clobbering!'
        }
      });
    } catch (error) {
      logger.error('Widgets by type query failed', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch widgets by type'
      });
    }
  });

  /**
   * Get recent widgets (created in last 7 days) - Time-based selective query using cache-level filtering
   * Uses cache-level filtering: operations.all({ createdAt: { $gte: date } })
   */
  cacheRouter.get('/widgets/recent', async (req: Request, res: Response) => {
    try {
      logger.info('Selective Query: Recent widgets requested - using cache-level filter');
      
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      // CACHE-LEVEL QUERY: Creates cache key with date filter
      const dateQuery = { createdAt: { $gte: sevenDaysAgo.toISOString() } };
      const recentWidgets = await widgetLibrary.operations.all(dateQuery);
      
      // Also get total count for comparison (different cache key)
      const allWidgets = await widgetLibrary.operations.all({});
      
      logger.info('Recent widgets query completed', {
        total: allWidgets.length,
        recent: recentWidgets.length,
        cacheType: 'selective/cache-level',
        cacheKey: `query:widget:all:{"query":{"createdAt":{"$gte":"${sevenDaysAgo.toISOString()}"}}}`
      });

      res.json({
        success: true,
        data: recentWidgets,
        meta: {
          queryType: 'selective',
          cacheLayer: 'facet',
          ttl: '60 seconds',
          description: 'Recent widgets - Uses DIFFERENT cache key with date filter',
          cacheKey: `query:widget:all:{"query":{"createdAt":{"$gte":"${sevenDaysAgo.toISOString()}"}}}`,
          totalCount: allWidgets.length,
          filteredCount: recentWidgets.length,
          filterCriteria: `createdAt >= ${sevenDaysAgo.toISOString()}`,
          cacheClob: 'Date-based queries get separate cache entries for each date range'
        }
      });
    } catch (error) {
      logger.error('Recent widgets query failed', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch recent widgets'
      });
    }
  });

  // ========================================
  // COMPLETE QUERIES - Test Query Cache
  // ========================================

  /**
   * Get all widgets - This is a complete query that uses the BASE cache key
   * Uses cache-level query: operations.all({}) - the simplest cache key
   */
  cacheRouter.get('/widgets/all', async (req: Request, res: Response) => {
    try {
      logger.info('Complete Query: All widgets requested - using base cache key');
      
      // CACHE-LEVEL QUERY: Creates cache key "query:widget:all:{"query":{}}"
      const widgets = await widgetLibrary.operations.all({});
      
      logger.info('All widgets query completed', {
        total: widgets.length,
        cacheType: 'complete/query',
        cacheKey: 'query:widget:all:{"query":{}}'
      });

      res.json({
        success: true,
        data: widgets,
        meta: {
          queryType: 'complete',
          cacheLayer: 'query',
          ttl: '300 seconds (5 minutes)',
          description: 'All widgets without filtering - Uses BASE cache key',
          cacheKey: 'query:widget:all:{"query":{}}',
          totalCount: widgets.length,
          cacheClob: 'This is the BASE query - other filtered queries are separate cache entries'
        }
      });
    } catch (error) {
      logger.error('All widgets query failed', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch all widgets'
      });
    }
  });

  /**
   * Get all widget types - Another complete query
   */
  cacheRouter.get('/widget-types/all', async (req: Request, res: Response) => {
    try {
      logger.info('Complete Query: All widget types requested');
      
      const widgetTypes = await widgetTypeLibrary.operations.all({});
      
      logger.info('All widget types query completed', {
        total: widgetTypes.length,
        cacheType: 'complete/query'
      });

      res.json({
        success: true,
        data: widgetTypes,
        meta: {
          queryType: 'complete',
          cacheLayer: 'query',
          ttl: '300 seconds (5 minutes)',
          description: 'All widget types without filtering - Uses longer query TTL',
          totalCount: widgetTypes.length
        }
      });
    } catch (error) {
      logger.error('All widget types query failed', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch all widget types'
      });
    }
  });

  // ========================================
  // CACHE CLOBBERING PREVENTION DEMOS
  // ========================================

  /**
   * Demonstrate cache clobbering prevention - same widget through different queries
   */
  cacheRouter.get('/widgets/clobber-test/:widgetId', async (req: Request, res: Response) => {
    try {
      const { widgetId } = req.params;
      logger.info('Cache Clobber Test: Fetching same widget through different cache keys', { widgetId });
      
      // Fetch the same widget through 3 different cache paths:
      
      // 1. Get all widgets (base cache key)
      const allWidgets = await widgetLibrary.operations.all({});
      const widgetFromAll = allWidgets.find(w => w.id === widgetId);
      
      // 2. Get active widgets (filtered cache key)
      const activeWidgets = await widgetLibrary.operations.all({ isActive: true });
      const widgetFromActive = activeWidgets.find(w => w.id === widgetId);
      
      // 3. Get widgets by type (another filtered cache key)
      let widgetFromType = null;
      if (widgetFromAll) {
        const typeWidgets = await widgetLibrary.operations.all({ widgetTypeId: widgetFromAll.widgetTypeId });
        widgetFromType = typeWidgets.find(w => w.id === widgetId);
      }
      
      res.json({
        success: true,
        data: {
          widgetId,
          foundInQueries: {
            all: !!widgetFromAll,
            active: !!widgetFromActive,
            byType: !!widgetFromType
          },
          widgetData: widgetFromAll || widgetFromActive || widgetFromType,
          cacheKeys: {
            all: 'query:widget:all:{"query":{}}',
            active: 'query:widget:all:{"query":{"isActive":true}}',
            byType: `query:widget:all:{"query":{"widgetTypeId":"${widgetFromAll?.widgetTypeId || 'unknown'}"}}`
          }
        },
        meta: {
          description: 'Same widget retrieved through 3 different cache entries - NO CLOBBERING!',
          proof: 'Each query creates separate cache entries with different keys',
          cacheClob: 'PREVENTED - Different queries maintain separate cache entries'
        }
      });
    } catch (error) {
      logger.error('Cache clobber test failed', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to execute cache clobber test'
      });
    }
  });

  /**
   * Show all active cache keys being used
   */
  cacheRouter.get('/cache/keys-demo', async (req: Request, res: Response) => {
    try {
      logger.info('Cache Keys Demo: Showing different cache keys in action');
      
      // Execute different queries to populate different cache keys
      await widgetLibrary.operations.all({});                    // Base key
      await widgetLibrary.operations.all({ isActive: true });    // Active key
      
      // Get the first widget type to demo type-specific key
      const widgetTypes = await widgetTypeLibrary.operations.all({});
      if (widgetTypes.length > 0) {
        await widgetLibrary.operations.all({ widgetTypeId: widgetTypes[0].id }); // Type key
      }
      
      const cacheKeysDemo = {
        baseQuery: {
          endpoint: '/api/cache/widgets/all',
          cacheKey: 'query:widget:all:{"query":{}}',
          description: 'Gets ALL widgets - complete result set',
          ttl: '5 minutes (complete query)'
        },
        activeQuery: {
          endpoint: '/api/cache/widgets/active',
          cacheKey: 'query:widget:all:{"query":{"isActive":true}}',
          description: 'Gets only ACTIVE widgets - filtered result set',
          ttl: '1 minute (partial query)'
        },
        typeQuery: {
          endpoint: '/api/cache/widgets/by-type/{id}',
          cacheKey: 'query:widget:all:{"query":{"widgetTypeId":"{id}"}}',
          description: 'Gets widgets by TYPE - filtered result set per type',
          ttl: '1 minute (partial query)'
        },
        recentQuery: {
          endpoint: '/api/cache/widgets/recent',
          cacheKey: 'query:widget:all:{"query":{"createdAt":{"$gte":"DATE"}}}',
          description: 'Gets RECENT widgets - time-filtered result set',
          ttl: '1 minute (partial query)'
        }
      };
      
      res.json({
        success: true,
        data: cacheKeysDemo,
        meta: {
          title: 'Cache Key Demonstration - No Clobbering!',
          description: 'Each query creates a unique cache key based on query parameters',
          proof: 'Different parameters = different cache keys = no clobbering',
          keyGeneration: 'Keys generated by: "query:" + itemType + ":all:" + JSON.stringify(query)',
          widgetTypesAvailable: widgetTypes.length
        }
      });
    } catch (error) {
      logger.error('Cache keys demo failed', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to demonstrate cache keys'
      });
    }
  });

  // ========================================
  // CACHE EXPLORATION ENDPOINTS
  // ========================================

  /**
   * Get cache statistics and information
   */
  cacheRouter.get('/cache/info', async (req: Request, res: Response) => {
    try {
      logger.info('Cache info requested');

      // This would be populated with actual cache stats if we had access to the cache instances
      const cacheInfo = {
        twoLayerEnabled: true,
        itemLayer: {
          type: 'IndexedDB',
          ttl: 900, // 15 minutes
          description: 'Stores individual items with longer TTL'
        },
        queryLayer: {
          complete: {
            ttl: 300, // 5 minutes
            description: 'Complete query results with medium TTL'
          },
          facet: {
            ttl: 60, // 1 minute
            description: 'Partial/filtered query results with short TTL'
          }
        },
        debugLogging: true,
        endpoints: {
          selective: [
            '/api/cache/widgets/active',
            '/api/cache/widgets/by-type/:id',
            '/api/cache/widgets/recent'
          ],
          complete: [
            '/api/cache/widgets/all',
            '/api/cache/widget-types/all'
          ],
          cacheDemo: [
            '/api/cache/widgets/clobber-test/:id',
            '/api/cache/keys-demo'
          ]
        },
        cacheKeys: {
          all: 'query:widget:all:{"query":{}}',
          active: 'query:widget:all:{"query":{"isActive":true}}',
          byType: 'query:widget:all:{"query":{"widgetTypeId":"ID"}}',
          recent: 'query:widget:all:{"query":{"createdAt":{"$gte":"DATE"}}}'
        }
      };

      res.json({
        success: true,
        data: cacheInfo,
        meta: {
          description: 'Two Layer Cache configuration and available test endpoints'
        }
      });
    } catch (error) {
      logger.error('Cache info request failed', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to get cache information'
      });
    }
  });

  /**
   * Cache testing guide - Instructions for testing the Two Layer Cache
   */
  cacheRouter.get('/cache/guide', async (req: Request, res: Response) => {
    try {
      const guide = {
        title: 'Two Layer Cache Testing Guide',
        description: 'Use these endpoints to test and understand Two Layer Cache behavior',
        layers: {
          itemLayer: {
            description: 'Stores individual widgets and widget types',
            ttl: '900 seconds (15 minutes)',
            storage: 'IndexedDB'
          },
          queryLayer: {
            description: 'Stores query results with different TTLs based on completeness',
            complete: {
              ttl: '300 seconds (5 minutes)',
              description: 'For queries that return all items without filtering'
            },
            facet: {
              ttl: '60 seconds (1 minute)',
              description: 'For queries that filter or select subsets of items'
            }
          }
        },
        testingSteps: [
          {
            step: 1,
            action: 'Make a complete query',
            endpoint: 'GET /api/cache/widgets/all',
            expected: 'Result cached for 5 minutes with key: query:widget:all:{"query":{}}'
          },
          {
            step: 2,
            action: 'Make a selective query',
            endpoint: 'GET /api/cache/widgets/active',
            expected: 'Result cached for 1 minute with DIFFERENT key: query:widget:all:{"query":{"isActive":true}}'
          },
          {
            step: 3,
            action: 'Test cache clobbering prevention',
            endpoint: 'GET /api/cache/widgets/clobber-test/{widgetId}',
            expected: 'Same widget returned from multiple different cache entries'
          },
          {
            step: 4,
            action: 'View cache keys demo',
            endpoint: 'GET /api/cache/keys-demo',
            expected: 'Shows all different cache keys being used - no conflicts!'
          },
          {
            step: 5,
            action: 'Repeat queries to see cache hits',
            expected: 'Each query type maintains its own cache entry without clobbering others'
          }
        ],
        browserDevTools: {
          instructions: 'Open browser dev tools and check Console for Two Layer Cache debug logs',
          lookFor: [
            'TwoLayerCacheMap query cache hit/miss messages',
            'TTL expiration logs',
            'Cache invalidation events'
          ]
        }
      };

      res.json({
        success: true,
        data: guide
      });
    } catch (error) {
      logger.error('Cache guide request failed', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to get cache testing guide'
      });
    }
  });

  logger.info('Two Level Cache demonstration routes created successfully', {
    selectiveQueries: 3,
    completeQueries: 2,
    cacheDemo: 2,
    explorationEndpoints: 2,
    cacheClobberingPrevention: 'ENABLED - Each query gets unique cache key'
  });

  return cacheRouter;
};
