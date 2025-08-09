import { describe, expect, it } from 'vitest';
import { WidgetProperties } from '../../src/model/Widget';
import { TestFixtures } from '../helpers';

describe('Widget Model', () => {
  describe('Type Definitions', () => {
    it('should define Widget interface correctly', () => {
      const widget = TestFixtures.createCompleteWidget('test-widget-type-id');

      // Check required properties
      expect(widget).toHaveProperty('key');
      expect(widget).toHaveProperty('id');
      expect(widget).toHaveProperty('widgetTypeId');
      expect(widget).toHaveProperty('name');
      expect(widget).toHaveProperty('events');

      // Check key structure
      expect(widget.key.kt).toBe('widget');
      expect(widget.key.pk).toBe(widget.id);

      // Check events structure
      expect(widget.events).toHaveProperty('created');
      expect(widget.events).toHaveProperty('updated');
      expect(widget.events).toHaveProperty('deleted');
      expect(widget.events.created.at).toBeInstanceOf(Date);
      expect(widget.events.updated.at).toBeInstanceOf(Date);
      expect(widget.events.deleted.at).toBeNull();
    });

    it('should allow optional properties', () => {
      const widget = TestFixtures.createCompleteWidget('test-widget-type-id', {
        description: null as any,
        data: null as any,
        refs: null as any
      });

      expect(widget.description).toBeNull();
      expect(widget.data).toBeNull();
      expect(widget.refs).toBeNull();
    });

    it('should have correct reference structure when present', () => {
      const widgetTypeId = 'test-widget-type-id';
      const widget = TestFixtures.createCompleteWidget(widgetTypeId);

      expect(widget.refs).toBeDefined();
      expect(widget.refs?.widgetType).toBeDefined();
      expect(widget.refs?.widgetType.kt).toBe('widgetType');
      expect(widget.refs?.widgetType.pk).toBe(widgetTypeId);
    });
  });

  describe('WidgetProperties', () => {
    it('should create valid widget properties', () => {
      const properties = TestFixtures.createWidgetProperties('test-type-id');

      expect(properties.widgetTypeId).toBe('test-type-id');
      expect(properties.name).toBe('Test Widget');
      expect(properties.isActive).toBe(true);
      expect(properties.data).toBeDefined();
      expect(typeof properties.data).toBe('object');
    });

    it('should allow data to be any JSON object', () => {
      const complexData = {
        string: 'value',
        number: 42,
        boolean: true,
        array: [1, 2, 3],
        nested: {
          deep: {
            value: 'test'
          }
        },
        nullValue: null
      };

      const properties = TestFixtures.createWidgetProperties('test-type-id', {
        data: complexData
      });

      expect(properties.data).toEqual(complexData);
    });

    it('should handle minimal properties', () => {
      const minimalProperties: WidgetProperties = {
        widgetTypeId: 'test-type-id',
        name: 'Minimal Widget'
      };

      expect(minimalProperties.widgetTypeId).toBe('test-type-id');
      expect(minimalProperties.name).toBe('Minimal Widget');
      expect(minimalProperties.description).not.toBeDefined();
      expect(minimalProperties.isActive).not.toBeDefined();
      expect(minimalProperties.data).not.toBeDefined();
    });
  });

  describe('Data Validation Scenarios', () => {
    it('should handle various data types correctly', () => {
      const testCases = [
        { name: 'null data', data: null },
        { name: 'empty object', data: {} },
        { name: 'string data', data: { message: 'hello' } },
        { name: 'numeric data', data: { count: 100, price: 29.99 } },
        { name: 'boolean data', data: { enabled: true, visible: false } },
        { name: 'array data', data: { tags: ['test', 'widget'], ids: [1, 2, 3] } },
        {
          name: 'mixed data', data: {
            text: 'value',
            count: 42,
            active: true,
            items: ['a', 'b'],
            config: { nested: true }
          }
        }
      ];

      testCases.forEach(({ name, data }) => {
        const properties = TestFixtures.createWidgetProperties('test-type-id', { data });
        expect(properties.data, `Failed for ${name}`).toEqual(data);
      });
    });

    it('should maintain data immutability in tests', () => {
      const originalData = { value: 'original' };
      const properties = TestFixtures.createWidgetProperties('test-type-id', {
        data: originalData
      });

      // Modify the properties data
      if (properties.data) {
        (properties.data as any).value = 'modified';
      }

      // Original should not be affected
      expect(originalData.value).toBe('original');
    });
  });

  describe('Widget Creation Patterns', () => {
    it('should create multiple widgets with different properties', () => {
      const widgets = TestFixtures.createMultipleWidgets('test-type-id', 5);

      expect(widgets).toHaveLength(5);

      widgets.forEach((widget, index) => {
        expect(widget.widgetTypeId).toBe('test-type-id');
        expect(widget.name).toBe(`Test Widget ${index + 1}`);
        expect(widget.data).toHaveProperty('index', index + 1);
        expect(widget.data).toHaveProperty('isEven', index % 2 === 0);
      });
    });

    it('should create widgets with alternating active status', () => {
      const widgets = TestFixtures.createMultipleWidgets('test-type-id', 6);

      // Check active status pattern (active when index % 3 !== 0)
      expect(widgets[0].isActive).toBe(false); // index 0 % 3 === 0
      expect(widgets[1].isActive).toBe(true);  // index 1 % 3 !== 0
      expect(widgets[2].isActive).toBe(true);  // index 2 % 3 !== 0
      expect(widgets[3].isActive).toBe(false); // index 3 % 3 === 0
      expect(widgets[4].isActive).toBe(true);  // index 4 % 3 !== 0
      expect(widgets[5].isActive).toBe(true);  // index 5 % 3 !== 0
    });
  });

  describe('Edge Cases', () => {
    it('should handle edge case names and descriptions', () => {
      const edgeCases = [
        { name: 'Single Character', value: 'A' },
        { name: 'Unicode Characters', value: '测试Widget 🎯' },
        { name: 'Special Characters', value: 'Widget@#$%^&*()' },
        { name: 'Numbers Only', value: '12345' },
        { name: 'Spaces and Tabs', value: '  Widget  \t  Name  ' }
      ];

      edgeCases.forEach(({ name, value }) => {
        const properties = TestFixtures.createWidgetProperties('test-type-id', {
          name: value,
          description: `Description for ${value}`
        });

        expect(properties.name, `Failed for ${name}`).toBe(value);
        expect(properties.description, `Failed for ${name}`).toBe(`Description for ${value}`);
      });
    });

    it('should handle very long widget type IDs', () => {
      const longId = 'widget-type-' + 'a'.repeat(100);
      const properties = TestFixtures.createWidgetProperties(longId);

      expect(properties.widgetTypeId).toBe(longId);
    });
  });
});
