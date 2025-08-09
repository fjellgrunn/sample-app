import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Sequelize } from 'sequelize';
import { initializeModels } from '../../src/database/models';
import { TestDatabase, TestFixtures } from '../helpers';

describe('Database Models', () => {
  let testDb: TestDatabase;
  let sequelize: Sequelize;
  let models: ReturnType<typeof initializeModels>;

  beforeEach(async () => {
    testDb = await TestDatabase.createFresh();
    sequelize = testDb.getSequelize();
    models = testDb.getModels();
  });

  afterEach(async () => {
    await testDb.cleanup();
  });

  describe('Model Initialization', () => {
    it('should initialize WidgetType and Widget models', () => {
      expect(models.WidgetTypeModel).toBeDefined();
      expect(models.WidgetModel).toBeDefined();
      expect(models.WidgetTypeModel.name).toBe('WidgetType');
      expect(models.WidgetModel.name).toBe('Widget');
    });

    it('should have correct table names', async () => {
      expect(models.WidgetTypeModel.tableName).toBe('widget_types');
      expect(models.WidgetModel.tableName).toBe('widgets');
    });

    it('should create tables in database', async () => {
      const tableInfo = await sequelize.getQueryInterface().showAllTables();
      expect(tableInfo).toContain('widget_types');
      expect(tableInfo).toContain('widgets');
    });
  });

  describe('WidgetType Model', () => {
    it('should create a widget type record', async () => {
      const widgetTypeData = TestFixtures.createWidgetTypeProperties({
        code: 'TEST_CREATE',
        name: 'Test Create Widget Type'
      });

      const widgetType = await models.WidgetTypeModel.create(widgetTypeData);

      expect(widgetType.id).toBeDefined();
      expect(widgetType.code).toBe('TEST_CREATE');
      expect(widgetType.name).toBe('Test Create Widget Type');
      expect(widgetType.isActive).toBe(true);
      expect(widgetType.createdAt).toBeInstanceOf(Date);
      expect(widgetType.updatedAt).toBeInstanceOf(Date);
    });

    it('should enforce unique code constraint', async () => {
      const widgetTypeData = TestFixtures.createWidgetTypeProperties({
        code: 'UNIQUE_CODE'
      });

      // Create first widget type
      await models.WidgetTypeModel.create(widgetTypeData);

      // Try to create duplicate - should fail
      await expect(models.WidgetTypeModel.create(widgetTypeData))
        .rejects.toThrow();
    });

    it('should validate required fields', async () => {
      // Test missing code
      await expect(models.WidgetTypeModel.create({
        name: 'Test Widget Type',
        isActive: true
      })).rejects.toThrow();

      // Test missing name
      await expect(models.WidgetTypeModel.create({
        code: 'TEST_CODE',
        isActive: true
      })).rejects.toThrow();
    });

    it('should validate field lengths', async () => {
      // Test code too long (> 50 characters)
      await expect(models.WidgetTypeModel.create({
        code: 'A'.repeat(51),
        name: 'Test Name',
        isActive: true
      })).rejects.toThrow();

      // Test name too long (> 255 characters)
      await expect(models.WidgetTypeModel.create({
        code: 'TEST_CODE',
        name: 'A'.repeat(256),
        isActive: true
      })).rejects.toThrow();
    });

    it('should handle optional description field', async () => {
      // Without description
      const widgetType1 = await models.WidgetTypeModel.create({
        code: 'NO_DESC',
        name: 'No Description',
        isActive: true
      });
      expect(widgetType1.description).toBeNull();

      // With description
      const widgetType2 = await models.WidgetTypeModel.create({
        code: 'WITH_DESC',
        name: 'With Description',
        description: 'This has a description',
        isActive: true
      });
      expect(widgetType2.description).toBe('This has a description');
    });

    it('should have default isActive value', async () => {
      const widgetType = await models.WidgetTypeModel.create({
        code: 'DEFAULT_ACTIVE',
        name: 'Default Active'
      });
      expect(widgetType.isActive).toBe(true);
    });
  });

  describe('Widget Model', () => {
    let widgetType: any;

    beforeEach(async () => {
      // Create a widget type for widgets to reference
      widgetType = await models.WidgetTypeModel.create({
        code: 'PARENT_TYPE',
        name: 'Parent Widget Type',
        isActive: true
      });
    });

    it('should create a widget record', async () => {
      const widgetData = TestFixtures.createWidgetProperties(widgetType.id, {
        name: 'Test Create Widget'
      });

      const widget = await models.WidgetModel.create(widgetData);

      expect(widget.id).toBeDefined();
      expect(widget.widgetTypeId).toBe(widgetType.id);
      expect(widget.name).toBe('Test Create Widget');
      expect(widget.isActive).toBe(true);
      expect(widget.createdAt).toBeInstanceOf(Date);
      expect(widget.updatedAt).toBeInstanceOf(Date);
    });

    it('should validate foreign key constraint', async () => {
      const widgetData = TestFixtures.createWidgetProperties('invalid-widget-type-id');

      await expect(models.WidgetModel.create(widgetData))
        .rejects.toThrow();
    });

    it('should handle JSON data field', async () => {
      const complexData = {
        configuration: {
          theme: 'dark',
          size: 'large',
          features: ['search', 'sort', 'filter']
        },
        metrics: {
          views: 1000,
          clicks: 250
        },
        metadata: {
          created_by: 'test_user',
          tags: ['important', 'ui', 'component']
        }
      };

      const widget = await models.WidgetModel.create({
        widgetTypeId: widgetType.id,
        name: 'JSON Test Widget',
        data: complexData,
        isActive: true
      });

      expect(widget.data).toEqual(complexData);
    });

    it('should handle null data field', async () => {
      const widget = await models.WidgetModel.create({
        widgetTypeId: widgetType.id,
        name: 'Null Data Widget',
        data: null,
        isActive: true
      });

      expect(widget.data).toBeNull();
    });

    it('should validate required fields', async () => {
      // Test missing widgetTypeId
      await expect(models.WidgetModel.create({
        name: 'Test Widget',
        isActive: true
      })).rejects.toThrow();

      // Test missing name
      await expect(models.WidgetModel.create({
        widgetTypeId: widgetType.id,
        isActive: true
      })).rejects.toThrow();
    });

    it('should validate field lengths', async () => {
      // Test name too long (> 255 characters)
      await expect(models.WidgetModel.create({
        widgetTypeId: widgetType.id,
        name: 'A'.repeat(256),
        isActive: true
      })).rejects.toThrow();
    });

    it('should have default isActive value', async () => {
      const widget = await models.WidgetModel.create({
        widgetTypeId: widgetType.id,
        name: 'Default Active Widget'
      });
      expect(widget.isActive).toBe(true);
    });
  });

  describe('Model Associations', () => {
    let widgetType: any;
    let widgets: any[];

    beforeEach(async () => {
      widgetType = await models.WidgetTypeModel.create({
        code: 'ASSOC_TYPE',
        name: 'Association Test Type',
        isActive: true
      });

      widgets = await Promise.all([
        models.WidgetModel.create({
          widgetTypeId: widgetType.id,
          name: 'Widget 1',
          isActive: true
        }),
        models.WidgetModel.create({
          widgetTypeId: widgetType.id,
          name: 'Widget 2',
          isActive: true
        })
      ]);
    });

    it('should load widgets for a widget type', async () => {
      const widgetTypeWithWidgets = await models.WidgetTypeModel.findByPk(
        widgetType.id,
        { include: [{ association: 'widgets' }] }
      );

      expect(widgetTypeWithWidgets.widgets).toHaveLength(2);
      expect(widgetTypeWithWidgets.widgets[0].name).toBe('Widget 1');
      expect(widgetTypeWithWidgets.widgets[1].name).toBe('Widget 2');
    });

    it('should load widget type for a widget', async () => {
      const widgetWithType = await models.WidgetModel.findByPk(
        widgets[0].id,
        { include: [{ association: 'widgetType' }] }
      );

      expect(widgetWithType.widgetType).toBeDefined();
      expect(widgetWithType.widgetType.code).toBe('ASSOC_TYPE');
      expect(widgetWithType.widgetType.name).toBe('Association Test Type');
    });

    it('should cascade properly on widget type changes', async () => {
      // Update widget type
      await widgetType.update({ name: 'Updated Association Type' });

      const widgetWithType = await models.WidgetModel.findByPk(
        widgets[0].id,
        { include: [{ association: 'widgetType' }] }
      );

      expect(widgetWithType.widgetType.name).toBe('Updated Association Type');
    });
  });

  describe('Database Indexes', () => {
    it('should have indexes for performance', async () => {
      const indexes = await sequelize.getQueryInterface().showIndex('widget_types');

      // Check for unique index on code
      const uniqueCodeIndex = indexes.find((index: any) =>
        index.fields.some((field: any) => field.attribute === 'code') && index.unique
      );
      expect(uniqueCodeIndex).toBeDefined();

      // Check for index on isActive
      const activeIndex = indexes.find((index: any) =>
        index.fields.some((field: any) => field.attribute === 'isActive')
      );
      expect(activeIndex).toBeDefined();
    });

    it('should have widget indexes for performance', async () => {
      const indexes = await sequelize.getQueryInterface().showIndex('widgets');

      // Check for index on widgetTypeId
      const typeIdIndex = indexes.find((index: any) =>
        index.fields.some((field: any) => field.attribute === 'widgetTypeId')
      );
      expect(typeIdIndex).toBeDefined();

      // Check for index on isActive
      const activeIndex = indexes.find((index: any) =>
        index.fields.some((field: any) => field.attribute === 'isActive')
      );
      expect(activeIndex).toBeDefined();

      // Check for index on name
      const nameIndex = indexes.find((index: any) =>
        index.fields.some((field: any) => field.attribute === 'name')
      );
      expect(nameIndex).toBeDefined();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle unicode characters correctly', async () => {
      const widgetType = await models.WidgetTypeModel.create({
        code: 'UNICODE_TEST',
        name: '测试Widget类型 🎯',
        description: 'Тест описание with émojis 🚀',
        isActive: true
      });

      expect(widgetType.name).toBe('测试Widget类型 🎯');
      expect(widgetType.description).toBe('Тест описание with émojis 🚀');
    });

    it('should handle concurrent creations properly', async () => {
      const promises = Array.from({ length: 5 }, (_, index) =>
        models.WidgetTypeModel.create({
          code: `CONCURRENT_${index}`,
          name: `Concurrent Widget Type ${index}`,
          isActive: true
        })
      );

      const results = await Promise.all(promises);
      expect(results).toHaveLength(5);

      // All should have unique IDs
      const ids = results.map(r => r.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(5);
    });
  });
});
