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
   * Get active widgets only - This is a selective query that should use facetTTL (1 minute)
   */
  cacheRouter.get('/widgets/active', async (req: Request, res: Response) => {
    try {
      logger.info('Selective Query: Active widgets requested');
      
      const widgets = await widgetLibrary.operations.all({});
      const activeWidgets = widgets.filter(w => w.isActive);
      
      logger.info('Active widgets query completed', {
        total: widgets.length,
        active: activeWidgets.length,
        cacheType: 'selective/facet'
      });

      res.json({
        success: true,
        data: activeWidgets,
        meta: {
          queryType: 'selective',
          cacheLayer: 'facet',
          ttl: '60 seconds',
          description: 'Active widgets only - Uses shorter facet TTL',
          totalCount: widgets.length,
          filteredCount: activeWidgets.length
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
   * Get widgets by type - Another selective query demonstrating filtering
   */
  cacheRouter.get('/widgets/by-type/:widgetTypeId', async (req: Request, res: Response) => {
    try {
      const { widgetTypeId } = req.params;
      logger.info('Selective Query: Widgets by type requested', { widgetTypeId });
      
      const widgets = await widgetLibrary.operations.all({});
      const filteredWidgets = widgets.filter(w => w.widgetTypeId === widgetTypeId);
      
      logger.info('Widgets by type query completed', {
        widgetTypeId,
        total: widgets.length,
        filtered: filteredWidgets.length,
        cacheType: 'selective/facet'
      });

      res.json({
        success: true,
        data: filteredWidgets,
        meta: {
          queryType: 'selective',
          cacheLayer: 'facet',
          ttl: '60 seconds',
          description: `Widgets filtered by type ${widgetTypeId} - Uses shorter facet TTL`,
          widgetTypeId,
          totalCount: widgets.length,
          filteredCount: filteredWidgets.length
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
   * Get recent widgets (created in last 7 days) - Time-based selective query
   */
  cacheRouter.get('/widgets/recent', async (req: Request, res: Response) => {
    try {
      logger.info('Selective Query: Recent widgets requested');
      
      const widgets = await widgetLibrary.operations.all({});
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentWidgets = widgets.filter(w =>
        w.createdAt && new Date(w.createdAt) > sevenDaysAgo
      );
      
      logger.info('Recent widgets query completed', {
        total: widgets.length,
        recent: recentWidgets.length,
        cacheType: 'selective/facet'
      });

      res.json({
        success: true,
        data: recentWidgets,
        meta: {
          queryType: 'selective',
          cacheLayer: 'facet',
          ttl: '60 seconds',
          description: 'Widgets created in last 7 days - Uses shorter facet TTL',
          totalCount: widgets.length,
          filteredCount: recentWidgets.length,
          filterCriteria: 'createdAt > 7 days ago'
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
   * Get all widgets - This is a complete query that should use queryTTL (5 minutes)
   */
  cacheRouter.get('/widgets/all', async (req: Request, res: Response) => {
    try {
      logger.info('Complete Query: All widgets requested');
      
      const widgets = await widgetLibrary.operations.all({});
      
      logger.info('All widgets query completed', {
        total: widgets.length,
        cacheType: 'complete/query'
      });

      res.json({
        success: true,
        data: widgets,
        meta: {
          queryType: 'complete',
          cacheLayer: 'query',
          ttl: '300 seconds (5 minutes)',
          description: 'All widgets without filtering - Uses longer query TTL',
          totalCount: widgets.length
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
          ]
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
            expected: 'Result cached for 5 minutes in query layer'
          },
          {
            step: 2,
            action: 'Make a selective query',
            endpoint: 'GET /api/cache/widgets/active',
            expected: 'Result cached for 1 minute in facet layer'
          },
          {
            step: 3,
            action: 'Repeat the same queries within TTL',
            expected: 'Should return from cache without server round-trip'
          },
          {
            step: 4,
            action: 'Wait for facet TTL to expire (1 minute)',
            expected: 'Selective queries will refresh, complete queries still cached'
          },
          {
            step: 5,
            action: 'Create/update a widget',
            endpoint: 'POST/PUT /api/widgets',
            expected: 'Query cache should invalidate, forcing fresh queries'
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
    explorationEndpoints: 2
  });

  return cacheRouter;
};
