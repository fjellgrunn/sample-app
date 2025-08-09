import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Database } from '../../src/database/database';

describe('Database Edge Cases and Error Scenarios', () => {
  let database: Database;

  beforeEach(() => {
    database = new Database(':memory:');
  });

  afterEach(async () => {
    await database.close();
  });

  describe('Initialization Error Scenarios', () => {
    it('should handle error when trying to initialize closed database', async () => {
      // First initialize successfully
      await database.initialize();

      // Close the database
      await database.close();

      // Try to initialize again - should throw error
      await expect(database.initialize()).rejects.toThrow('Database is closed and cannot be initialized');
    });

    it('should handle error when trying to force initialize closed database', async () => {
      // First initialize successfully
      await database.initialize();

      // Close the database
      await database.close();

      // Try to force initialize - should throw error
      await expect(database.initialize(true)).rejects.toThrow('Database is closed and cannot be initialized');
    });
  });

  describe('Data Seeding Error Scenarios', () => {
    it('should handle error when checking shouldSeedData and default to seeding', async () => {
      // Create a new database instance to test the shouldSeedData error path
      const newDatabase = new Database(':memory:');

      // Get models to mock
      const newModels = newDatabase.getModels();

      // Store original count methods
      const originalWidgetTypeCount = newModels.WidgetTypeModel.count;
      const originalWidgetCount = newModels.WidgetModel.count;

      // Track if shouldSeedData was called with errors
      let shouldSeedDataErrorsHandled = false;

      // Mock count methods to fail during shouldSeedData but succeed during seeding summary
      const mockWidgetTypeCount = vi.fn().mockImplementation((...args) => {
        // Check the call stack to see if we're in shouldSeedData
        const stack = new Error().stack;
        if (stack && stack.includes('shouldSeedData')) {
          shouldSeedDataErrorsHandled = true;
          return Promise.reject(new Error('Count operation failed'));
        }
        // For all other calls (like in seed summary), succeed
        return Promise.resolve(5);
      });

      const mockWidgetCount = vi.fn().mockImplementation((...args) => {
        // Check the call stack to see if we're in shouldSeedData
        const stack = new Error().stack;
        if (stack && stack.includes('shouldSeedData')) {
          shouldSeedDataErrorsHandled = true;
          return Promise.reject(new Error('Count operation failed'));
        }
        // For all other calls (like in seed summary), succeed
        return Promise.resolve(10);
      });

      newModels.WidgetTypeModel.count = mockWidgetTypeCount;
      newModels.WidgetModel.count = mockWidgetCount;

      // Initialize should still work and should seed data due to error
      await expect(newDatabase.initialize()).resolves.not.toThrow();

      // Verify that shouldSeedData errors were handled
      expect(shouldSeedDataErrorsHandled).toBe(true);
      expect(mockWidgetTypeCount).toHaveBeenCalled();
      expect(mockWidgetCount).toHaveBeenCalled();

      // Clean up
      await newDatabase.close();

      // Restore original count functions
      newModels.WidgetTypeModel.count = originalWidgetTypeCount;
      newModels.WidgetModel.count = originalWidgetCount;
    });

    it('should skip seeding when tables already have data', async () => {
      // Initialize and add some data
      await database.initialize();

      const models = database.getModels();

      // Add additional data to ensure tables are not empty
      await models.WidgetTypeModel.create({
        code: 'EXTRA_TYPE',
        name: 'Extra Type',
        isActive: true
      });

      const initialCount = await models.WidgetTypeModel.count();

      // Create a new database instance
      const newDatabase = new Database(':memory:');

      // Mock the count operations to return non-zero values (simulating existing data)
      const newModels = newDatabase.getModels();
      newModels.WidgetTypeModel.count = vi.fn().mockResolvedValue(5);
      newModels.WidgetModel.count = vi.fn().mockResolvedValue(10);

      // Initialize should skip seeding
      await newDatabase.initialize();

      // Verify count methods were called
      expect(newModels.WidgetTypeModel.count).toHaveBeenCalled();
      expect(newModels.WidgetModel.count).toHaveBeenCalled();

      await newDatabase.close();
    });
  });

  describe('Close Error Scenarios', () => {
    it('should handle sequelize close errors gracefully', async () => {
      await database.initialize();

      const sequelize = database.getSequelize();

      // Mock sequelize close to throw an error
      const originalClose = sequelize.close;
      sequelize.close = vi.fn().mockRejectedValue(new Error('Close operation failed'));

      // Close should not throw error even if sequelize.close fails
      await expect(database.close()).resolves.not.toThrow();

      // Restore original close function
      sequelize.close = originalClose;
    });

    it('should log error when sequelize close fails', async () => {
      await database.initialize();

      const sequelize = database.getSequelize();

      // Mock sequelize close to throw an error
      const originalClose = sequelize.close;
      sequelize.close = vi.fn().mockRejectedValue(new Error('Close operation failed'));

      // Close should complete without throwing
      await database.close();

      // Verify the error was handled (error should be logged but not thrown)
      expect(sequelize.close).toHaveBeenCalled();

      // Restore original close function
      sequelize.close = originalClose;
    });
  });

  describe('Health Check Error Scenarios', () => {
    it('should handle sequelize authentication errors in health check', async () => {
      await database.initialize();

      const sequelize = database.getSequelize();

      // Mock authenticate to throw an error
      const originalAuthenticate = sequelize.authenticate;
      sequelize.authenticate = vi.fn().mockRejectedValue(new Error('Authentication failed'));

      const health = await database.healthCheck();

      expect(health.status).toBe('unhealthy');
      expect(health.details).toBe('Authentication failed');

      // Restore original authenticate function
      sequelize.authenticate = originalAuthenticate;
    });

    it('should handle non-Error objects in health check', async () => {
      await database.initialize();

      const sequelize = database.getSequelize();

      // Mock authenticate to throw a non-Error object
      const originalAuthenticate = sequelize.authenticate;
      sequelize.authenticate = vi.fn().mockRejectedValue('String error');

      const health = await database.healthCheck();

      expect(health.status).toBe('unhealthy');
      expect(health.details).toBe('Unknown error');

      // Restore original authenticate function
      sequelize.authenticate = originalAuthenticate;
    });
  });

  describe('Database State Management', () => {
    it('should track initialization state correctly', async () => {
      // Before initialization
      expect(database['isInitialized']).toBe(false);
      expect(database['isClosed']).toBe(false);

      // After initialization
      await database.initialize();
      expect(database['isInitialized']).toBe(true);
      expect(database['isClosed']).toBe(false);

      // After closing
      await database.close();
      expect(database['isInitialized']).toBe(false);
      expect(database['isClosed']).toBe(true);
    });

    it('should handle multiple initialization calls correctly', async () => {
      // First initialization
      await database.initialize();
      expect(database['isInitialized']).toBe(true);

      // Second initialization should not reinitialize
      await database.initialize();
      expect(database['isInitialized']).toBe(true);

      // Force initialization should reinitialize
      await database.initialize(true);
      expect(database['isInitialized']).toBe(true);
    });
  });

  describe('Constructor Edge Cases', () => {
    it('should handle custom database path', () => {
      const customPath = 'custom-test.db';
      const customDb = new Database(customPath);

      expect(customDb).toBeInstanceOf(Database);
      expect(customDb.getSequelize()).toBeDefined();

      // Clean up
      customDb.close();
    });

    it('should handle default database path', () => {
      const defaultDb = new Database();

      expect(defaultDb).toBeInstanceOf(Database);
      expect(defaultDb.getSequelize()).toBeDefined();

      // Clean up
      defaultDb.close();
    });
  });

  describe('Model and Sequelize Access', () => {
    it('should provide models before initialization', () => {
      const models = database.getModels();

      expect(models).toBeDefined();
      expect(models.WidgetTypeModel).toBeDefined();
      expect(models.WidgetModel).toBeDefined();
    });

    it('should provide sequelize instance before initialization', () => {
      const sequelize = database.getSequelize();

      expect(sequelize).toBeDefined();
      expect(sequelize.getDialect()).toBe('sqlite');
    });
  });

  describe('SQL Logging', () => {
    it('should configure SQL logging function', async () => {
      await database.initialize();

      const sequelize = database.getSequelize();
      const loggingFunction = sequelize.options.logging;

      expect(typeof loggingFunction).toBe('function');

      // Test that the logging function can be called without error
      if (typeof loggingFunction === 'function') {
        expect(() => loggingFunction('SELECT 1')).not.toThrow();
      }
    });
  });

  describe('Connection Pool Configuration', () => {
    it('should have correct pool configuration', () => {
      const sequelize = database.getSequelize();
      const config = sequelize.config as any;

      expect(config.pool).toBeDefined();
      expect(config.pool.max).toBe(5);
      expect(config.pool.min).toBe(0);
      expect(config.pool.acquire).toBe(30000);
      expect(config.pool.idle).toBe(10000);
    });
  });

  describe('Error Propagation', () => {
    it('should propagate initialization errors', async () => {
      // Create database with invalid path to trigger error
      const invalidDb = new Database('/invalid/path/cannot/exist/test.db');

      // Should throw the underlying error
      await expect(invalidDb.initialize()).rejects.toThrow();

      // Clean up
      await invalidDb.close();
    });

    it('should not throw during constructor even with invalid path', () => {
      // Constructor should not throw, only initialize should
      expect(() => new Database('/invalid/path/test.db')).not.toThrow();
    });
  });
});
