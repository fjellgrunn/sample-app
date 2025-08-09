import { createSequelizeLibrary } from '@fjell/lib-sequelize';
import { Registry } from '@fjell/registry';
import { PriKey } from '@fjell/core';
import { ModelStatic } from 'sequelize';
import { WidgetType, WidgetTypeProperties } from '../model/WidgetType';
import { getLogger } from '@fjell/logging';

const logger = getLogger('WidgetTypeLib');

/**
 * Create and configure the WidgetType library
 */
export const createWidgetTypeLibrary = (
  registry: Registry,
  widgetTypeModel: ModelStatic<any>
) => {
  logger.info('Creating WidgetType library...');

  const library = createSequelizeLibrary<WidgetType, 'widgetType'>(
    registry as any,
    { kta: ['widgetType'], scopes: [] },
    [widgetTypeModel],
    {
      references: [],
      aggregations: [],
      deleteOnRemove: true,  // Enable hard deletes since model doesn't have soft delete fields
      validators: {
        onCreate: async (item: Partial<WidgetType | WidgetTypeProperties>) => {
          const errors: string[] = [];

          // Validate code (format validation happens in preCreate hook)
          if (!item.code || item.code.trim().length === 0) {
            errors.push('Widget type code is required');
          } else {
            const trimmedCode = item.code.trim();
            if (trimmedCode.length > 50) {
              errors.push('Widget type code must be 50 characters or less');
            }
          }

          // Validate name (should already be normalized by preCreate hook)
          if (!item.name || (typeof item.name === 'string' && item.name.trim().length === 0)) {
            errors.push('Widget type name is required');
          } else if (typeof item.name === 'string' && item.name.length > 255) {
            errors.push('Widget type name must be 255 characters or less');
          }

          if (errors.length > 0) {
            throw new Error(errors.join('; '));
          }

          return true;
        },
        onUpdate: async (key: PriKey<'widgetType'>, updates: Partial<WidgetType>) => {
          const errors: string[] = [];

          // Validate code (format validation happens in preUpdate hook)
          if (updates.code !== undefined) {
            if (!updates.code || updates.code.trim().length === 0) {
              errors.push('Widget type code is required');
            } else {
              const trimmedCode = updates.code.trim();
              if (trimmedCode.length > 50) {
                errors.push('Widget type code must be 50 characters or less');
              }
            }
          }

          // Validate name
          if (updates.name !== undefined) {
            if (!updates.name || (typeof updates.name === 'string' && updates.name.trim().length === 0)) {
              errors.push('Widget type name is required');
            } else if (typeof updates.name === 'string' && updates.name.length > 255) {
              errors.push('Widget type name must be 255 characters or less');
            }
          }

          if (errors.length > 0) {
            throw new Error(errors.join('; '));
          }

          // Only normalize AFTER validation passes
          if (updates.code) {
            updates.code = updates.code.toUpperCase().trim();
          }

          if (updates.name && typeof updates.name === 'string') {
            updates.name = updates.name.trim();
          }

          return true;
        }
      },
      hooks: {
        preCreate: async (widgetType: Partial<WidgetType | WidgetTypeProperties>) => {
          logger.info('Creating widget type', { code: widgetType.code, name: widgetType.name });

          // Validate code format BEFORE normalization
          if (widgetType.code) {
            const trimmedCode = widgetType.code.trim();

            // Only allow letters and underscores
            if (!/^[a-zA-Z_]+$/.test(trimmedCode)) {
              throw new Error('Widget type code must contain only uppercase letters and underscores');
            }

            // Reject pure lowercase codes (no underscores) - these indicate format issues
            if (/^[a-z]+$/.test(trimmedCode)) {
              throw new Error('Widget type code must contain only uppercase letters and underscores');
            }

            // Reject mixed case codes (contains both upper and lower case)
            if (/[A-Z]/.test(trimmedCode) && /[a-z]/.test(trimmedCode)) {
              throw new Error('Widget type code must contain only uppercase letters and underscores');
            }
          }

          // Ensure code is uppercase (only if it exists)
          if (widgetType.code) {
            widgetType.code = widgetType.code.toUpperCase().trim();
          }

          // Trim name (only if it exists)
          if (widgetType.name) {
            widgetType.name = widgetType.name.trim();
          }

          // Set default values
          if (typeof widgetType.isActive === 'undefined') {
            widgetType.isActive = true;
          }

          return widgetType;
        },
        preUpdate: async (key: PriKey<'widgetType'>, updates: Partial<WidgetType>) => {
          logger.info('Updating widget type', { id: key.pk, updates });

          // Validate code format BEFORE normalization (if code is being updated)
          if (updates.code) {
            const trimmedCode = updates.code.trim();

            // Only allow letters and underscores
            if (!/^[a-zA-Z_]+$/.test(trimmedCode)) {
              throw new Error('Widget type code must contain only uppercase letters and underscores');
            }

            // Reject pure lowercase codes (no underscores) - these indicate format issues
            if (/^[a-z]+$/.test(trimmedCode)) {
              throw new Error('Widget type code must contain only uppercase letters and underscores');
            }

            // Reject mixed case codes (contains both upper and lower case)
            if (/[A-Z]/.test(trimmedCode) && /[a-z]/.test(trimmedCode)) {
              throw new Error('Widget type code must contain only uppercase letters and underscores');
            }
          }

          // Normalize code if being updated
          if (updates.code) {
            updates.code = updates.code.toUpperCase().trim();
          }

          // Normalize name if being updated
          if (updates.name) {
            updates.name = updates.name.trim();
          }

          return updates;
        },
      },
      finders: {
        // Find only active widget types
        active: async () => {
          logger.info('Finding active widget types');
          const results = await widgetTypeModel.findAll({
            where: { isActive: true },
            order: [['createdAt', 'DESC']]
          });
          return results;
        },

        // Find widget type by code
        byCode: async (params: any) => {
          logger.info('Finding widget type by code', { code: params.code });
          const results = await widgetTypeModel.findAll({
            where: { code: params.code.toUpperCase() },
            order: [['createdAt', 'DESC']]
          });
          return results;
        }
      },
    }
  );

  logger.info('WidgetType library created successfully');
  return library;
};
