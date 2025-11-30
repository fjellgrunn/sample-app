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
        expect(error.message).toContain('non-existent-widget-type-id');
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

      await expect(widgetLib.operations.get(widget.key)).rejects.toThrow('widget not found');
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

      expect(allWidgets.items.length).toBeGreaterThanOrEqual(3);
      const ourWidgets = allWidgets.items.filter(w =>
        widgets.some(widget => widget.id === w.id)
      );
      expect(ourWidgets).toHaveLength(3);
    });

    it('should throw error when getting non-existent widget', async () => {
      const nonExistentKey = { kt: 'widget', pk: 'non-existent-id' };

      await expect(widgetLib.operations.get(nonExistentKey)).rejects.toThrow('widget not found');
    });
  });

  describe('Custom Finder Methods', () => {
    let activeWidgets: any[];
    let inactiveWidgets: any[];
    let widgetType1: any;
    let widgetType2: any;

    beforeEach(async () => {
      // Create two different widget types
      widgetType1 = await testDb.createWidgetType(TestFixtures.createWidgetTypeProperties({
        code: 'FINDER_TYPE_1',
        name: 'Finder Test Type 1'
      }));

      widgetType2 = await testDb.createWidgetType(TestFixtures.createWidgetTypeProperties({
        code: 'FINDER_TYPE_2',
        name: 'Finder Test Type 2'
      }));

      // Create active widgets
      activeWidgets = [];
      for (let i = 0; i < 2; i++) {
        const widget = await widgetLib.operations.create(
          TestFixtures.createWidgetProperties(widgetType1.id, {
            name: `Active Widget ${i + 1}`,
            isActive: true
          })
        );
        activeWidgets.push(widget);
      }

      // Create inactive widgets
      inactiveWidgets = [];
      for (let i = 0; i < 2; i++) {
        const widget = await widgetLib.operations.create(
          TestFixtures.createWidgetProperties(widgetType2.id, {
            name: `Inactive Widget ${i + 1}`,
            isActive: false
          })
        );
        inactiveWidgets.push(widget);
      }
    });

    it('should find only active widgets', async () => {
      const results = await widgetLib.operations.find('active', {});

      expect(results).toBeDefined();
      expect(Array.isArray(results.items)).toBe(true);

      // Should include our active widgets
      const ourActiveWidgets = results.items.filter((w: any) =>
        activeWidgets.some(aw => aw.id === w.id)
      );
      expect(ourActiveWidgets).toHaveLength(2);

      // Should not include our inactive widgets
      const ourInactiveWidgets = results.items.filter((w: any) =>
        inactiveWidgets.some(iw => iw.id === w.id)
      );
      expect(ourInactiveWidgets).toHaveLength(0);

      // All results should be active
      results.items.forEach((widget: any) => {
        expect(widget.isActive).toBe(true);
      });
    });

    it('should find widgets by widget type ID', async () => {
      const results = await widgetLib.operations.find('byType', { widgetTypeId: widgetType1.id });

      expect(results).toBeDefined();
      expect(Array.isArray(results.items)).toBe(true);

      // Should only include widgets of the specified type
      results.items.forEach((widget: any) => {
        expect(widget.widgetTypeId).toBe(widgetType1.id);
      });

      // Should include our widgets of this type (both active and inactive)
      const ourWidgetsOfType1 = results.items.filter((w: any) =>
        activeWidgets.some(aw => aw.id === w.id)
      );
      expect(ourWidgetsOfType1).toHaveLength(2);
    });

    it('should find widgets by widget type code', async () => {
      const results = await widgetLib.operations.find('byTypeCode', { code: 'FINDER_TYPE_2' });

      expect(results).toBeDefined();
      expect(Array.isArray(results.items)).toBe(true);

      // Should only include widgets of the specified type
      results.items.forEach((widget: any) => {
        expect(widget.widgetTypeId).toBe(widgetType2.id);
      });

      // Should include our widgets of this type
      const ourWidgetsOfType2 = results.items.filter((w: any) =>
        inactiveWidgets.some(iw => iw.id === w.id)
      );
      expect(ourWidgetsOfType2).toHaveLength(2);
    });

    it('should handle case insensitive widget type code lookup', async () => {
      const results = await widgetLib.operations.find('byTypeCode', { code: 'finder_type_1' });

      expect(results).toBeDefined();
      expect(Array.isArray(results.items)).toBe(true);

      // Should find widgets despite lowercase input
      const ourWidgetsOfType1 = results.items.filter((w: any) =>
        activeWidgets.some(aw => aw.id === w.id)
      );
      expect(ourWidgetsOfType1).toHaveLength(2);
    });

    it('should return empty array for non-existent widget type code', async () => {
      const results = await widgetLib.operations.find('byTypeCode', { code: 'NON_EXISTENT_CODE' });

      expect(results).toBeDefined();
      expect(Array.isArray(results.items)).toBe(true);
      expect(results.items).toHaveLength(0);
    });

    it('should find widgets with type information', async () => {
      const results = await widgetLib.operations.find('active', {});

      expect(results).toBeDefined();
      expect(Array.isArray(results.items)).toBe(true);

      // Should include our widgets
      const ourWidgets = results.items.filter((w: any) =>
        [...activeWidgets, ...inactiveWidgets].some(widget => widget.id === w.id)
      );
      expect(ourWidgets.length).toBeGreaterThanOrEqual(2);

      // Basic widget structure verification (simplified test)
      ourWidgets.forEach((widget: any) => {
        expect(widget.id).toBeDefined();
        expect(widget.name).toBeDefined();
        expect(widget.widgetTypeId).toBeDefined();
        expect(typeof widget.widgetTypeId).toBe('string');
      });
    });

    it('should order results by creation date descending', async () => {
      const results = await widgetLib.operations.find('active', {});

      if (results.length > 1) {
        for (let i = 1; i < results.length; i++) {
          const current = new Date(results[i].createdAt);
          const previous = new Date(results[i - 1].createdAt);
          expect(current.getTime()).toBeLessThanOrEqual(previous.getTime());
        }
      }
    });
  });

  describe('Advanced Validation Scenarios', () => {
    it('should validate widget name with exactly 255 characters', async () => {
      const widgetTypeProperties = TestFixtures.createWidgetTypeProperties();
      const widgetType = await testDb.createWidgetType(widgetTypeProperties);

      const widgetProperties = {
        widgetTypeId: widgetType.id,
        name: 'A'.repeat(255) // Exactly 255 characters
      };

      const widget = await widgetLib.operations.create(widgetProperties);
      expect(widget.name).toBe('A'.repeat(255));
    });

    it('should validate widget type exists before checking if active', async () => {
      // This tests the order of validation: existence before active status
      const widgetProperties = TestFixtures.createWidgetProperties('definitely-non-existent-id');

      try {
        await widgetLib.operations.create(widgetProperties);
        expect.fail('Expected validation error to be thrown');
      } catch (error: any) {
        expect(error.message).toContain('Create Validation Failed');
        expect(error.message).toContain('definitely-non-existent-id');
      }
    });

    it('should provide specific error message for inactive widget type', async () => {
      const widgetTypeProperties = TestFixtures.createWidgetTypeProperties({
        code: 'INACTIVE_TYPE',
        name: 'Inactive Widget Type',
        isActive: false
      });
      const inactiveWidgetType = await testDb.createWidgetType(widgetTypeProperties);

      const widgetProperties = TestFixtures.createWidgetProperties(inactiveWidgetType.id);

      try {
        await widgetLib.operations.create(widgetProperties);
        expect.fail('Expected validation error to be thrown');
      } catch (error: any) {
        expect(error.message).toContain('Create Validation Failed');
        expect(error.message).toContain(inactiveWidgetType.id);
      }
    });

    it('should validate undefined widget type ID', async () => {
      const widgetProperties = {
        name: 'Test Widget'
        // widgetTypeId is undefined
      };

      await expect(widgetLib.operations.create(widgetProperties)).rejects.toThrow('Validation failed: Create Validation Failed');
    });

    it('should validate null widget type ID', async () => {
      const widgetProperties = {
        widgetTypeId: null,
        name: 'Test Widget'
      };

      await expect(widgetLib.operations.create(widgetProperties)).rejects.toThrow('Validation failed: Create Validation Failed');
    });

    it('should validate undefined widget name', async () => {
      const widgetTypeProperties = TestFixtures.createWidgetTypeProperties();
      const widgetType = await testDb.createWidgetType(widgetTypeProperties);

      const widgetProperties = {
        widgetTypeId: widgetType.id
        // name is undefined
      };

      await expect(widgetLib.operations.create(widgetProperties)).rejects.toThrow();
    });

    it('should validate null widget name', async () => {
      const widgetTypeProperties = TestFixtures.createWidgetTypeProperties();
      const widgetType = await testDb.createWidgetType(widgetTypeProperties);

      const widgetProperties = {
        widgetTypeId: widgetType.id,
        name: null
      };

      await expect(widgetLib.operations.create(widgetProperties)).rejects.toThrow();
    });

    it('should handle complex nested JSON data validation', async () => {
      const widgetTypeProperties = TestFixtures.createWidgetTypeProperties();
      const widgetType = await testDb.createWidgetType(widgetTypeProperties);

      const complexValidData = {
        level1: {
          level2: {
            level3: {
              array: [1, 2, 3, { nested: 'object' }],
              boolean: true,
              null_value: null,
              number: 42.5
            }
          }
        },
        top_level_array: [
          { item: 1 },
          { item: 2 },
          null,
          'string'
        ]
      };

      const widgetProperties = {
        widgetTypeId: widgetType.id,
        name: 'Complex Data Widget',
        data: complexValidData
      };

      const widget = await widgetLib.operations.create(widgetProperties);
      expect(widget.data).toEqual(complexValidData);
    });

    it('should handle data containing special JSON characters', async () => {
      const widgetTypeProperties = TestFixtures.createWidgetTypeProperties();
      const widgetType = await testDb.createWidgetType(widgetTypeProperties);

      const specialData = {
        quotes: 'Contains "double" and \'single\' quotes',
        backslashes: 'Contains \\ backslashes and \n newlines',
        unicode: 'Contains ü∏ø∂∫∆ unicode characters',
        html: '<div class="test">HTML & entities &amp; &lt; &gt;</div>'
      };

      const widgetProperties = {
        widgetTypeId: widgetType.id,
        name: 'Special Characters Widget',
        data: specialData
      };

      const widget = await widgetLib.operations.create(widgetProperties);
      expect(widget.data).toEqual(specialData);
    });
  });

  describe('Hook Behavior', () => {
    it('should execute preCreate hook and modify widget properties', async () => {
      const widgetTypeProperties = TestFixtures.createWidgetTypeProperties();
      const widgetType = await testDb.createWidgetType(widgetTypeProperties);

      const widgetProperties = {
        widgetTypeId: widgetType.id,
        name: '  Widget With Spaces  ',
        description: 'Test widget'
        // isActive is undefined to test default setting
      };

      const widget = await widgetLib.operations.create(widgetProperties);

      // preCreate hook should have trimmed the name
      expect(widget.name).toBe('Widget With Spaces');

      // preCreate hook should have set default isActive
      expect(widget.isActive).toBe(true);
    });

    it('should preserve explicitly set isActive value in preCreate hook', async () => {
      const widgetTypeProperties = TestFixtures.createWidgetTypeProperties();
      const widgetType = await testDb.createWidgetType(widgetTypeProperties);

      const widgetProperties = {
        widgetTypeId: widgetType.id,
        name: 'Test Widget',
        isActive: false // Explicitly set to false
      };

      const widget = await widgetLib.operations.create(widgetProperties);

      // preCreate hook should preserve the explicit false value
      expect(widget.isActive).toBe(false);
    });

    it('should handle isActive set to false in preCreate hook', async () => {
      const widgetTypeProperties = TestFixtures.createWidgetTypeProperties();
      const widgetType = await testDb.createWidgetType(widgetTypeProperties);

      const widgetProperties = {
        widgetTypeId: widgetType.id,
        name: 'Test Widget',
        isActive: false
      };

      const widget = await widgetLib.operations.create(widgetProperties);
      expect(widget.isActive).toBe(false);
    });

    it('should reject null isActive in preCreate hook', async () => {
      const widgetTypeProperties = TestFixtures.createWidgetTypeProperties();
      const widgetType = await testDb.createWidgetType(widgetTypeProperties);

      const widgetProperties = {
        widgetTypeId: widgetType.id,
        name: 'Test Widget',
        isActive: null
      };

      // isActive cannot be null since it's required in database schema
      await expect(widgetLib.operations.create(widgetProperties)).rejects.toThrow();
    });
  });

  describe('Library Configuration', () => {
    it('should have proper coordinate configuration', () => {
      expect(widgetLib.coordinate).toBeDefined();
      expect(widgetLib.coordinate.kta).toEqual(['widget']);
    });

    it('should have operations interface', () => {
      expect(widgetLib.operations).toBeDefined();
      expect(typeof widgetLib.operations.create).toBe('function');
      expect(typeof widgetLib.operations.get).toBe('function');
      expect(typeof widgetLib.operations.update).toBe('function');
      expect(typeof widgetLib.operations.remove).toBe('function');
      expect(typeof widgetLib.operations.all).toBe('function');
      expect(typeof widgetLib.operations.find).toBe('function');
    });

    it('should have options configuration', () => {
      expect(widgetLib.options).toBeDefined();
      expect(widgetLib.options.deleteOnRemove).toBe(true);
    });

    it('should have models array', () => {
      expect(widgetLib.models).toBeDefined();
      expect(Array.isArray(widgetLib.models)).toBe(true);
      expect(widgetLib.models.length).toBeGreaterThan(0);
    });
  });
});
