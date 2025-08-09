import { getLogger } from '@fjell/logging';
import { initializeModels } from './models';

const logger = getLogger('DataSeed');

/**
 * Seed the database with test data
 */
export const seedTestData = async (models: ReturnType<typeof initializeModels>) => {
  logger.info('Starting test data seeding...');

  try {
    // Create WidgetTypes
    const widgetTypes = [
      {
        code: 'BUTTON',
        name: 'Button Widget',
        description: 'Interactive button component for user interfaces',
        isActive: true
      },
      {
        code: 'TEXT_INPUT',
        name: 'Text Input Widget',
        description: 'Text input field for forms and data entry',
        isActive: true
      },
      {
        code: 'CHART',
        name: 'Chart Widget',
        description: 'Data visualization chart component',
        isActive: true
      },
      {
        code: 'TABLE',
        name: 'Table Widget',
        description: 'Tabular data display component',
        isActive: true
      },
      {
        code: 'LEGACY_WIDGET',
        name: 'Legacy Widget',
        description: 'Deprecated widget type maintained for compatibility',
        isActive: false
      }
    ];

    logger.info('Creating widget types...', { count: widgetTypes.length });
    const createdWidgetTypes = await models.WidgetTypeModel.bulkCreate(widgetTypes, {
      returning: true
    });

    // Get the created widget type IDs
    const buttonType = createdWidgetTypes.find(wt => wt.code === 'BUTTON');
    const textInputType = createdWidgetTypes.find(wt => wt.code === 'TEXT_INPUT');
    const chartType = createdWidgetTypes.find(wt => wt.code === 'CHART');
    const tableType = createdWidgetTypes.find(wt => wt.code === 'TABLE');

    // Create Widgets
    const widgets = [
      {
        widgetTypeId: buttonType.id,
        name: 'Primary Action Button',
        description: 'Main call-to-action button for the homepage',
        isActive: true,
        data: {
          text: 'Get Started',
          color: 'primary',
          size: 'large',
          icon: 'arrow-right'
        }
      },
      {
        widgetTypeId: buttonType.id,
        name: 'Secondary Button',
        description: 'Secondary action button for forms',
        isActive: true,
        data: {
          text: 'Cancel',
          color: 'secondary',
          size: 'medium',
          icon: null
        }
      },
      {
        widgetTypeId: textInputType.id,
        name: 'Email Input Field',
        description: 'Email address input for registration form',
        isActive: true,
        data: {
          placeholder: 'Enter your email address',
          validation: 'email',
          required: true,
          maxLength: 255
        }
      },
      {
        widgetTypeId: textInputType.id,
        name: 'Search Box',
        description: 'Global search input field',
        isActive: true,
        data: {
          placeholder: 'Search...',
          validation: null,
          required: false,
          debounceMs: 300
        }
      },
      {
        widgetTypeId: chartType.id,
        name: 'Sales Dashboard Chart',
        description: 'Monthly sales performance chart',
        isActive: true,
        data: {
          chartType: 'line',
          dataSource: 'sales_api',
          refreshInterval: 300000,
          colors: ['#3b82f6', '#10b981', '#f59e0b']
        }
      },
      {
        widgetTypeId: chartType.id,
        name: 'User Analytics Pie Chart',
        description: 'User demographics breakdown',
        isActive: true,
        data: {
          chartType: 'pie',
          dataSource: 'analytics_api',
          refreshInterval: 600000,
          showLegend: true
        }
      },
      {
        widgetTypeId: tableType.id,
        name: 'User Management Table',
        description: 'Admin table for managing system users',
        isActive: true,
        data: {
          columns: ['name', 'email', 'role', 'lastLogin', 'actions'],
          sortable: true,
          filterable: true,
          pagination: {
            pageSize: 20,
            showSizeSelector: true
          }
        }
      },
      {
        widgetTypeId: tableType.id,
        name: 'Orders List',
        description: 'Table displaying recent orders',
        isActive: true,
        data: {
          columns: ['orderId', 'customer', 'amount', 'status', 'date'],
          sortable: true,
          filterable: false,
          pagination: {
            pageSize: 50,
            showSizeSelector: false
          }
        }
      },
      {
        widgetTypeId: buttonType.id,
        name: 'Disabled Test Button',
        description: 'Button used for testing disabled states',
        isActive: false,
        data: {
          text: 'Disabled',
          color: 'gray',
          size: 'small',
          disabled: true
        }
      },
      {
        widgetTypeId: buttonType.id,
        name: 'Simple Button',
        description: null,
        isActive: true,
        data: {
          text: 'Click Me',
          color: 'default',
          size: 'medium'
        }
      },
      {
        widgetTypeId: textInputType.id,
        name: 'Basic Input',
        description: null,
        isActive: true,
        data: null
      }
    ];

    logger.info('Creating widgets...', { count: widgets.length });
    await models.WidgetModel.bulkCreate(widgets);

    // Log summary
    const finalWidgetTypeCount = await models.WidgetTypeModel.count();
    const finalWidgetCount = await models.WidgetModel.count();
    const activeWidgetTypeCount = await models.WidgetTypeModel.count({ where: { isActive: true } });
    const activeWidgetCount = await models.WidgetModel.count({ where: { isActive: true } });

    logger.info('Test data seeding completed successfully', {
      widgetTypes: {
        total: finalWidgetTypeCount,
        active: activeWidgetTypeCount
      },
      widgets: {
        total: finalWidgetCount,
        active: activeWidgetCount
      }
    });

  } catch (error) {
    logger.error('Failed to seed test data', { error });
    throw error;
  }
};
