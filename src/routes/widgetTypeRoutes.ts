import { PItemRouter } from '@fjell/express-router';
import { Router } from 'express';
import { getLogger } from '@fjell/logging';
import { WidgetType } from '../model/WidgetType';
import type { SequelizeLibrary } from '@fjell/lib-sequelize';

const logger = getLogger('WidgetTypeRoutes');

/**
 * Create Express router for WidgetType endpoints
 *
 * This router provides RESTful endpoints for managing widget types using PItemRouter.
 * Custom functionality is available via finders using query parameters like:
 * - GET /widget-types?finder=active
 * - GET /widget-types?finder=byCode&finderParams={"code":"PREMIUM"}
 */
export const createWidgetTypeRouter = (
  widgetTypeLibrary: SequelizeLibrary<WidgetType, 'widgetType'>
): Router => {
  logger.info('Creating WidgetType router...');

  // Create the PItemRouter for standard CRUD operations
  const pItemRouter = new PItemRouter(widgetTypeLibrary, 'widgetType');

  logger.info('WidgetType router created successfully');
  return pItemRouter.getRouter();
};
