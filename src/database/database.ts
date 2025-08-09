import { Sequelize } from 'sequelize';
import { getLogger } from '@fjell/logging';
import { initializeModels } from './models';
import { seedTestData } from './seed';

const logger = getLogger('Database');

/**
 * Database configuration and initialization
 */
export class Database {
  private sequelize: Sequelize;
  private models: ReturnType<typeof initializeModels>;
  private isInitialized = false;
  private isClosed = false;

  constructor(databasePath: string = 'sample-app.db') {
    // Initialize SQLite database
    this.sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: databasePath,
      logging: (sql: string) => {
        logger.debug('SQL Query', { sql });
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });

    // Initialize models
    this.models = initializeModels(this.sequelize);

    logger.info('Database initialized', {
      dialect: 'sqlite',
      storage: databasePath
    });
  }

  /**
   * Initialize the database by syncing models and seeding test data
   */
  async initialize(force: boolean = false): Promise<void> {
    if (this.isInitialized && !force) {
      logger.info('Database already initialized');
      return;
    }

    if (this.isClosed) {
      logger.error('Cannot initialize closed database');
      throw new Error('Database is closed and cannot be initialized');
    }

    try {
      logger.info('Starting database initialization...');

      // Test connection
      await this.sequelize.authenticate();
      logger.info('Database connection established successfully');

      // Sync models (create tables)
      await this.sequelize.sync({ force });
      logger.info('Database models synchronized');

      // Seed test data if tables are empty
      const shouldSeed = force || await this.shouldSeedData();
      if (shouldSeed) {
        await seedTestData(this.models);
        logger.info('Test data seeded successfully');
      } else {
        logger.info('Skipping data seeding - tables already contain data');
      }

      this.isInitialized = true;
      logger.info('Database initialization completed successfully');
    } catch (error) {
      logger.error('Database initialization failed', { error });
      throw error;
    }
  }

  /**
   * Check if we should seed data (tables are empty)
   */
  private async shouldSeedData(): Promise<boolean> {
    try {
      const widgetTypeCount = await this.models.WidgetTypeModel.count();
      const widgetCount = await this.models.WidgetModel.count();
      return widgetTypeCount === 0 && widgetCount === 0;
    } catch (error) {
      logger.error('Error checking if should seed data', { error });
      return true; // Assume we should seed if there's an error
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.isClosed) {
      logger.debug('Database already closed, skipping close operation');
      return;
    }

    try {
      await this.sequelize.close();
      this.isClosed = true;
      this.isInitialized = false;
      logger.info('Database connection closed');
    } catch (error) {
      logger.error('Error closing database connection', { error });
      // Don't throw on close errors, just log them
    }
  }

  /**
   * Get the Sequelize instance
   */
  getSequelize(): Sequelize {
    return this.sequelize;
  }

  /**
   * Get the initialized models
   */
  getModels() {
    return this.models;
  }

  /**
   * Health check - test database connection
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details?: any }> {
    if (this.isClosed) {
      return {
        status: 'unhealthy',
        details: 'Database connection is closed'
      };
    }

    try {
      await this.sequelize.authenticate();
      return { status: 'healthy' };
    } catch (error) {
      logger.error('Database health check failed', { error });
      return {
        status: 'unhealthy',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
