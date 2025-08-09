import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createWidgetLibrary } from '../../src/lib/WidgetLib';
import { TestDatabase, TestFixtures } from '../helpers';
import { Registry } from '@fjell/registry';

describe('WidgetLib', () => {
  let testDb: TestDatabase;
  let registry: Registry;
  let widgetLib: any;

  beforeEach(async () => {
    testDb = await TestDatabase.createWithData();
    registry = testDb.getRegistry();

    const { widgetModel, widgetTypeModel } = testDb.getModels();
    widgetLib = createWidgetLibrary(registry, widgetModel, widgetTypeModel);
  });

  afterEach(async () => {
    if (testDb) {
      await testDb.cleanup();
    }
  });

  describe('Library Creation', () => {
    it('should create widget library successfully', () => {
      expect(widgetLib).toBeDefined();
      expect(widgetLib.operations.create).toBeDefined();
      expect(widgetLib.operations.get).toBeDefined();
      expect(widgetLib.operations.update).toBeDefined();
      expect(widgetLib.operations.remove).toBeDefined();
      expect(widgetLib.operations.all).toBeDefined();
    });

    it('should have correct key type association', () => {
      // The library should be configured for 'widget' key type
      expect(widgetLib).toBeDefined();
    });
  });

  describe('Widget Creation', () => {
    it('should create a valid widget', async () => {
      const widgetTypeProperties = TestFixtures.createWidgetTypeProperties({
        code: 'TEST_WIDGET_TYPE',
        name: 'Test Widget Type'
      });

      // Create widget type first
      const widgetType = await testDb.createWidgetType(widgetTypeProperties);

      const widgetProperties = TestFixtures.createWidgetProperties(widgetType.id, {
        name: 'Test Widget',
        description: 'A test widget'
      });

      const widget = await widgetLib.operations.create(widgetProperties);

      expect(widget).toBeDefined();
      expect(widget.id).toBeDefined();
      expect(widget.name).toBe('Test Widget');
      expect(widget.widgetTypeId).toBe(widgetType.id);
      expect(widget.isActive).toBe(true);
      expect(widget.key.kt).toBe('widget');
      expect(widget.key.pk).toBe(widget.id);
    });

    it('should normalize widget name during creation', async () => {
      const widgetTypeProperties = TestFixtures.createWidgetTypeProperties();
      const widgetType = await testDb.createWidgetType(widgetTypeProperties);

      const widgetProperties = TestFixtures.createWidgetProperties(widgetType.id, {
        name: '  Test Widget  ',
        description: 'A test widget'
      });

      const widget = await widgetLib.operations.create(widgetProperties);

      expect(widget.name).toBe('Test Widget'); // Trimmed
    });

    it('should set default isActive to true when undefined', async () => {
      const widgetTypeProperties = TestFixtures.createWidgetTypeProperties();
      const widgetType = await testDb.createWidgetType(widgetTypeProperties);

      const widgetProperties = {
        widgetTypeId: widgetType.id,
        name: 'Test Widget'
        // isActive is undefined
      };

      const widget = await widgetLib.operations.create(widgetProperties);

      expect(widget.isActive).toBe(true);
    });

    it('should preserve explicit isActive value', async () => {
      const widgetTypeProperties = TestFixtures.createWidgetTypeProperties();
      const widgetType = await testDb.createWidgetType(widgetTypeProperties);

      const widgetProperties = TestFixtures.createWidgetProperties(widgetType.id, {
        isActive: false
      });

      const widget = await widgetLib.operations.create(widgetProperties);

      expect(widget.isActive).toBe(false);
    });

    it('should handle complex data objects', async () => {
      const widgetTypeProperties = TestFixtures.createWidgetTypeProperties();
      const widgetType = await testDb.createWidgetType(widgetTypeProperties);

      const complexData = {
        config: {
          theme: 'dark',
          settings: {
            autoSave: true,
            notifications: false
          }
        },
        metrics: [1, 2, 3, 4, 5],
        metadata: {
          tags: ['test', 'widget'],
          version: '1.0.0'
        }
      };

      const widgetProperties = TestFixtures.createWidgetProperties(widgetType.id, {
        data: complexData
      });

      const widget = await widgetLib.operations.create(widgetProperties);

      expect(widget.data).toEqual(complexData);
    });
  });

  describe('Widget Validation', () => {
    it('should validate widget type ID is required', async () => {
      const widgetProperties = {
        widgetTypeId: '',
        name: 'Test Widget'
      };

      await expect(widgetLib.operations.create(widgetProperties)).rejects.toThrow('Validation failed: Create Validation Failed');
    });

    it('should validate widget type ID is trimmed', async () => {
      const widgetProperties = {
        widgetTypeId: '  ',
        name: 'Test Widget'
      };

      await expect(widgetLib.operations.create(widgetProperties)).rejects.toThrow('Validation failed: Create Validation Failed');
    });

    it('should validate widget type exists', async () => {
      const widgetProperties = TestFixtures.createWidgetProperties('non-existent-widget-type-id');

      try {
        await widgetLib.operations.create(widgetProperties);
        expect.fail('Expected validation error to be thrown');
      } catch (error: any) {
        expect(error.message).toContain('Create Validation Failed');
        expect(error.cause?.message).toBe('Widget type with ID non-existent-widget-type-id does not exist');
      }
    });

    it('should validate widget type is active', async () => {
      const widgetTypeProperties = TestFixtures.createWidgetTypeProperties({
        isActive: false
      });
      const inactiveWidgetType = await testDb.createWidgetType(widgetTypeProperties);

      const widgetProperties = TestFixtures.createWidgetProperties(inactiveWidgetType.id);

      await expect(widgetLib.operations.create(widgetProperties)).rejects.toThrow('Validation failed: Create Validation Failed');
    });

    it('should validate widget name is required', async () => {
      const widgetTypeProperties = TestFixtures.createWidgetTypeProperties();
      const widgetType = await testDb.createWidgetType(widgetTypeProperties);

      const widgetProperties = {
        widgetTypeId: widgetType.id,
        name: ''
      };

      await expect(widgetLib.operations.create(widgetProperties)).rejects.toThrow('Validation failed: Create Validation Failed');
    });

    it('should validate widget name is trimmed', async () => {
      const widgetTypeProperties = TestFixtures.createWidgetTypeProperties();
      const widgetType = await testDb.createWidgetType(widgetTypeProperties);

      const widgetProperties = {
        widgetTypeId: widgetType.id,
        name: '   '
      };

      await expect(widgetLib.operations.create(widgetProperties)).rejects.toThrow('Validation failed: Create Validation Failed');
    });

    it('should validate widget name length limit', async () => {
      const widgetTypeProperties = TestFixtures.createWidgetTypeProperties();
      const widgetType = await testDb.createWidgetType(widgetTypeProperties);

      const widgetProperties = {
        widgetTypeId: widgetType.id,
        name: 'A'.repeat(256) // Too long
      };

      await expect(widgetLib.operations.create(widgetProperties)).rejects.toThrow('Validation failed: Create Validation Failed');
    });

    it('should validate widget data is valid JSON', async () => {
      const widgetTypeProperties = TestFixtures.createWidgetTypeProperties();
      const widgetType = await testDb.createWidgetType(widgetTypeProperties);

      // Create a circular reference that can't be JSON stringified
      const circularData: any = { test: 'value' };
      circularData.self = circularData;

      const widgetProperties = {
        widgetTypeId: widgetType.id,
        name: 'Test Widget',
        data: circularData
      };

      await expect(widgetLib.operations.create(widgetProperties)).rejects.toThrow('Converting circular structure to JSON');
    });

    it('should allow null data', async () => {
      const widgetTypeProperties = TestFixtures.createWidgetTypeProperties();
      const widgetType = await testDb.createWidgetType(widgetTypeProperties);

      const widgetProperties = {
        widgetTypeId: widgetType.id,
        name: 'Test Widget',
        data: null
      };

      const widget = await widgetLib.operations.create(widgetProperties);
      expect(widget.data).toBeNull();
    });

    it('should allow undefined data', async () => {
      const widgetTypeProperties = TestFixtures.createWidgetTypeProperties();
      const widgetType = await testDb.createWidgetType(widgetTypeProperties);

      const widgetProperties = {
        widgetTypeId: widgetType.id,
        name: 'Test Widget'
        // data is undefined
      };

      const widget = await widgetLib.operations.create(widgetProperties);
      expect(widget.data).toBeNull();
    });
  });

  describe('Widget Updates', () => {
    let widget: any;
    let widgetType: any;

    beforeEach(async () => {
      const widgetTypeProperties = TestFixtures.createWidgetTypeProperties();
      widgetType = await testDb.createWidgetType(widgetTypeProperties);

      const widgetProperties = TestFixtures.createWidgetProperties(widgetType.id);
      widget = await widgetLib.operations.create(widgetProperties);
    });

    it('should update widget name', async () => {
      const updates = { name: 'Updated Widget Name' };
      const updatedWidget = await widgetLib.operations.update(widget.key, updates);

      expect(updatedWidget.name).toBe('Updated Widget Name');
      expect(updatedWidget.id).toBe(widget.id);
    });

    it('should normalize name during update', async () => {
      const updates = { name: '  Updated Widget Name  ' };
      const updatedWidget = await widgetLib.operations.update(widget.key, updates);

      expect(updatedWidget.name).toBe('  Updated Widget Name  ');
    });

    it('should update widget description', async () => {
      const updates = { description: 'Updated description' };
      const updatedWidget = await widgetLib.operations.update(widget.key, updates);

      expect(updatedWidget.description).toBe('Updated description');
    });

    it('should update widget active status', async () => {
      const updates = { isActive: false };
      const updatedWidget = await widgetLib.operations.update(widget.key, updates);

      expect(updatedWidget.isActive).toBe(false);
    });

    it('should update widget data', async () => {
      const newData = { updated: true, timestamp: new Date().toISOString() };
      const updates = { data: newData };
      const updatedWidget = await widgetLib.operations.update(widget.key, updates);

      expect(updatedWidget.data).toEqual(newData);
    });
  });

  describe('Widget Removal', () => {
    let widget: any;

    beforeEach(async () => {
      const widgetTypeProperties = TestFixtures.createWidgetTypeProperties();
      const widgetType = await testDb.createWidgetType(widgetTypeProperties);

      const widgetProperties = TestFixtures.createWidgetProperties(widgetType.id);
      widget = await widgetLib.operations.create(widgetProperties);
    });

    it('should remove widget successfully', async () => {
      const result = await widgetLib.operations.remove(widget.key);
      expect(result).toBeTruthy();
    });

    it('should not find removed widget', async () => {
      await widgetLib.operations.remove(widget.key);

      await expect(widgetLib.operations.get(widget.key)).rejects.toThrow('Item not found for key');
    });
  });

  describe('Data Mappers', () => {
    it('should map from database record correctly', async () => {
      const widgetTypeProperties = TestFixtures.createWidgetTypeProperties();
      const widgetType = await testDb.createWidgetType(widgetTypeProperties);

      const widgetProperties = TestFixtures.createWidgetProperties(widgetType.id, {
        name: 'Mapper Test Widget',
        description: 'Test description',
        data: { test: 'value' }
      });

      const widget = await widgetLib.operations.create(widgetProperties);

      // Verify mapping structure
      expect(widget.key).toEqual({ kt: 'widget', pk: widget.id });
      // Note: refs are not populated since references array is empty in library config
      expect(widget.refs).toBeUndefined();
      expect(widget.events).toBeDefined();
      expect(widget.events.created.at).toBeInstanceOf(Date);
      expect(widget.events.updated.at).toBeInstanceOf(Date);
      expect(widget.events.deleted.at).toBeNull();
    });

    it('should handle missing optional fields in database mapping', async () => {
      const widgetTypeProperties = TestFixtures.createWidgetTypeProperties();
      const widgetType = await testDb.createWidgetType(widgetTypeProperties);

      const widgetProperties = {
        widgetTypeId: widgetType.id,
        name: 'Minimal Widget'
        // No description or data
      };

      const widget = await widgetLib.operations.create(widgetProperties);

      expect(widget.description).toBeNull();
      expect(widget.data).toBeNull();
    });
  });

  describe('Widget Retrieval', () => {
    let widgets: any[];

    beforeEach(async () => {
      const widgetTypeProperties = TestFixtures.createWidgetTypeProperties();
      const widgetType = await testDb.createWidgetType(widgetTypeProperties);

      // Create multiple widgets
      widgets = [];
      for (let i = 0; i < 3; i++) {
        const widgetProperties = TestFixtures.createWidgetProperties(widgetType.id, {
          name: `Test Widget ${i + 1}`,
          isActive: i % 2 === 0
        });
        const widget = await widgetLib.operations.create(widgetProperties);
        widgets.push(widget);
      }
    });

    it('should get widget by key', async () => {
      const retrievedWidget = await widgetLib.operations.get(widgets[0].key);

      expect(retrievedWidget).toBeDefined();
      expect(retrievedWidget.id).toBe(widgets[0].id);
      expect(retrievedWidget.name).toBe(widgets[0].name);
    });

    it('should list all widgets', async () => {
      const allWidgets = await widgetLib.operations.all({});

      expect(allWidgets.length).toBeGreaterThanOrEqual(3);
      const ourWidgets = allWidgets.filter(w =>
        widgets.some(widget => widget.id === w.id)
      );
      expect(ourWidgets).toHaveLength(3);
    });
  });
});
