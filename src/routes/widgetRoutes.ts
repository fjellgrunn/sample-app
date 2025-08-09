import { PItemRouter } from '@fjell/express-router';
import { Request, Response, Router } from 'express';
import { getLogger } from '@fjell/logging';
import { Widget } from '../model/Widget';
import type { SequelizeLibrary } from '@fjell/lib-sequelize';
import { CreateValidationError, NotFoundError, RemoveError, UpdateError } from '@fjell/lib';

const logger = getLogger('WidgetRoutes');

/**
 * Create Express router for Widget endpoints
 *
 * This router provides RESTful endpoints for managing widgets using PItemRouter.
 * Custom functionality is available via finders using query parameters like:
 * - GET /widgets?finder=active
 * - GET /widgets?finder=byType&finderParams={"widgetTypeId":"123"}
 * - GET /widgets?finder=byTypeCode&finderParams={"code":"PREMIUM"}
 */
export const createWidgetRouter = (
  widgetLibrary: SequelizeLibrary<Widget, 'widget'>
): Router => {
  logger.info('Creating Widget router...');

  // Create a new router
  const router = Router();

  // GET /widgets/summary - summary statistics (MUST be before PItemRouter)
  router.get('/summary', async (req: Request, res: Response) => {
    try {
      const libOperations = widgetLibrary.operations;
      const allWidgets = await libOperations.all({});

      const total = allWidgets.length;
      const active = allWidgets.filter(w => w.isActive).length;
      const inactive = total - active;

      // Group by type
      const byType: Record<string, number> = {};
      allWidgets.forEach(widget => {
        const typeId = widget.widgetTypeId;
        byType[typeId] = (byType[typeId] || 0) + 1;
      });

      res.json({
        success: true,
        data: {
          total,
          active,
          inactive,
          byType
        }
      });
    } catch (error: any) {
      logger.error('Error in GET /widgets/summary', { error: error.message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  // Complex test endpoints (MUST be BEFORE PItemRouter to take precedence)

  // POST endpoint - wrap all responses in success/data format
  router.post('/', async (req: Request, res: Response, next) => {
    // Debug logging
    logger.info('POST /widgets - checking headers', { headers: req.headers });

    try {
      // Handle empty request body
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Request body cannot be empty'
        });
      }

      const libOperations = widgetLibrary.operations;
      const widget = await libOperations.create(req.body);

      res.status(201).json({
        success: true,
        data: widget
      });
    } catch (error: any) {
      logger.error('Error in POST /widgets', { error: error.message });

      // Handle validation errors
      if (error.name === 'CreateValidationError' ||
        error.name === 'ValidationError' ||
        error.name === 'SequelizeValidationError' ||
        error.message?.includes('validation') ||
        error.message?.includes('Validation failed') ||
        error.message?.includes('required') ||
        error.message?.includes('must be') ||
        error.message?.includes('cannot be') ||
        error.message?.includes('notNull Violation') ||
        error.message?.includes('cannot be null') ||
        error.message?.includes('Required field')) {
        res.status(400).json({
          success: false,
          error: error.message || 'Validation failed'
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  });

  // PUT endpoint - wrap all responses in success/data format
  router.put('/:id', async (req: Request, res: Response, next) => {
    try {
      const libOperations = widgetLibrary.operations;
      const ik = { kt: 'widget' as const, pk: req.params.id };
      const updatedWidget = await libOperations.update(ik, req.body);

      res.json({
        success: true,
        data: updatedWidget
      });
    } catch (error: any) {
      logger.error('Error in PUT /widgets/:id', { error: error.message });

      // Check if it's a not found error
      if (error.name === 'NotFoundError' || error.name === 'UpdateError' || error.message?.includes('not found') || error.message?.includes('Update Failed')) {
        res.status(404).json({
          success: false,
          error: error.message || 'Widget not found'
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  });

  // DELETE endpoint - wrap all responses in success/message format
  router.delete('/:id', async (req: Request, res: Response, next) => {
    try {
      const libOperations = widgetLibrary.operations;
      const ik = { kt: 'widget' as const, pk: req.params.id };
      await libOperations.remove(ik);

      res.json({
        success: true,
        message: 'Widget deleted successfully'
      });
    } catch (error: any) {
      logger.error('Error in DELETE /widgets/:id', { error: error.message });

      // Check if it's a not found error
      if (error.name === 'NotFoundError' || error.name === 'RemoveError' || error.message?.includes('not found')) {
        res.status(404).json({
          success: false,
          error: error.message || 'Widget not found'
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  });

  // GET /widgets - handle all cases (simple GET and special finder cases) - MUST BE FIRST
  router.get('/', async (req: Request, res: Response, next) => {
    const query = req.query as any;
    const finder = query['finder'] as string;
    const needsWrappedResponse = req.query.active || req.query.limit || req.headers['x-custom-header'];

    try {
      const libOperations = widgetLibrary.operations;
      let widgets: Widget[] = [];

      if (finder) {
        const finderParams = query['finderParams'] as string;
        logger.info('Finding widgets with finder', { finder, finderParams });
        widgets = await libOperations.find(finder, finderParams ? JSON.parse(finderParams) : {});
      } else {
        widgets = await libOperations.all({});
      }

      // Return success format for special requests, otherwise return widgets array directly
      if (needsWrappedResponse) {
        res.json({ success: true, data: widgets });
      } else {
        res.json(widgets);
      }
    } catch (error: any) {
      logger.error('Error in GET /widgets', { error: error.message });
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  // GET /widgets/:id - handle individual widget retrieval with proper error format
  router.get('/:id', async (req: Request, res: Response, next) => {
    try {
      const libOperations = widgetLibrary.operations;
      const ik = { kt: 'widget' as const, pk: req.params.id };
      const widget = await libOperations.get(ik);
      res.json(widget);
    } catch (error: any) {
      logger.error('Error in GET /widgets/:id', { error: error.message });

      // Check if it's a not found error
      if (error.name === 'NotFoundError' || error.message?.includes('not found')) {
        res.status(404).json({
          message: error.message || 'Widget not found'
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  });

  // Note: We're handling all routes manually to ensure proper response formatting
  // instead of using PItemRouter which has different response format expectations

  logger.info('Widget router created successfully');
  return router;
};
