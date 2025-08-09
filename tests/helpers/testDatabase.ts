import { Sequelize } from 'sequelize';
import { Database } from '../../src/database';
import { createRegistry, Registry } from '@fjell/registry';
import { createWidgetLibrary } from '../../src/lib/WidgetLib';
import { createWidgetTypeLibrary } from '../../src/lib/WidgetTypeLib';
import type { ModelStatic } from 'sequelize';

/**
 * Test database utilities for creating isolated test databases
 */
export class TestDatabase {
  private database: Database;
  private isSetup = false;
  private registry?: Registry;
  private libraries?: {
    widgetType: any;
    widget: any;
  };

  constructor(databaseName = ':memory:') {
    // Use Database class for consistent behavior
    this.database = new Database(databaseName);
  }

  /**
   * Setup the test database with tables but no data
   */
  async setup(): Promise<void> {
    if (this.isSetup) return;

    // Initialize without force to avoid seeding, then sync manually
    await this.database.getSequelize().authenticate();
    await this.database.getSequelize().sync({ force: true }); // Force recreation of tables

    this.isSetup = true;
  }

  /**
   * Setup database with test data
   */
  async setupWithData(): Promise<void> {
    if (this.isSetup) return;

    await this.database.initialize(true); // Force initialization with seed data
    this.isSetup = true;
  }

  /**
   * Clean up the database
   */
  async cleanup(): Promise<void> {
    if (!this.isSetup) return;

    await this.database.close();
    this.isSetup = false;
  }

  /**
   * Get the Sequelize instance
   */
  getSequelize(): Sequelize {
    return this.database.getSequelize();
  }

  /**
   * Get the Database instance
   */
  getDatabase(): Database {
    return this.database;
  }

  /**
   * Get the initialized models
   */
  getModels() {
    const models = this.database.getModels();
    // Provide both naming conventions expected by tests
    return {
      WidgetTypeModel: models.WidgetTypeModel,
      WidgetModel: models.WidgetModel,
      widgetTypeModel: models.WidgetTypeModel,
      widgetModel: models.WidgetModel
    } as {
      WidgetTypeModel: ModelStatic<any>;
      WidgetModel: ModelStatic<any>;
      widgetTypeModel: ModelStatic<any>;
      widgetModel: ModelStatic<any>;
    };
  }

  /**
   * Clear all data from tables without dropping them
   */
  async clearData(): Promise<void> {
    try {
      const models = this.getModels();
      // Clear in correct order due to foreign key constraints
      await models.WidgetModel.destroy({ where: {}, truncate: true });
      await models.WidgetTypeModel.destroy({ where: {}, truncate: true });
    } catch (error) {
      // Ignore errors if tables don't exist yet
      console.warn('Could not clear data, tables may not exist yet:', error);
    }
  }

  /**
   * Create a fresh test database for each test
   */
  static async createFresh(): Promise<TestDatabase> {
    const testDb = new TestDatabase();
    await testDb.setup();
    return testDb;
  }

  /**
   * Create a test database with seed data
   */
  static async createWithData(): Promise<TestDatabase> {
    const testDb = new TestDatabase();
    await testDb.setupWithData();
    return testDb;
  }

  /**
   * Get or create a Registry instance for libraries
   */
  getRegistry(): Registry {
    if (!this.registry) {
      this.registry = createRegistry('sample-app');
    }
    return this.registry;
  }

  /**
   * Get or create Widget/WidgetType libraries backed by current models
   */
  getLibraries() {
    if (!this.libraries) {
      const registry = this.getRegistry();
      const { WidgetModel, WidgetTypeModel } = this.database.getModels();
      const widgetType = createWidgetTypeLibrary(registry, WidgetTypeModel);
      const widget = createWidgetLibrary(registry, WidgetModel, WidgetTypeModel);
      this.libraries = { widgetType, widget };
    }
    return this.libraries;
  }

  /**
   * Convenience to create a WidgetType row for tests
   */
  async createWidgetType(props: any) {
    const { WidgetTypeModel } = this.database.getModels();
    const created = await WidgetTypeModel.create(props);
    return created.toJSON ? created.toJSON() : created;
  }

  /**
   * Convenience to create a Widget row for tests
   */
  async createWidget(props: any) {
    const { WidgetModel } = this.database.getModels();
    const created = await WidgetModel.create(props);
    return created.toJSON ? created.toJSON() : created;
  }
}
