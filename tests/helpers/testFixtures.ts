import { Widget, WidgetProperties } from '../../src/model/Widget';
import { WidgetType, WidgetTypeProperties } from '../../src/model/WidgetType';

/**
 * Test fixtures for creating consistent test data
 */
export class TestFixtures {
  /**
   * Create a test WidgetType
   */
  static createWidgetTypeProperties(overrides: Partial<WidgetTypeProperties> = {}): WidgetTypeProperties {
    return {
      code: 'TEST_WIDGET',
      name: 'Test Widget Type',
      description: 'A test widget type for unit testing',
      isActive: true,
      ...overrides
    };
  }

  /**
   * Create a test Widget
   */
  static createWidgetProperties(widgetTypeId: string, overrides: Partial<WidgetProperties> = {}): WidgetProperties {
    const defaultData = {
      testProperty: 'testValue',
      config: {
        enabled: true,
        count: 42
      }
    };

    // Handle data properly - check if data is explicitly provided (including null)
    const finalData = overrides.hasOwnProperty('data') ?
        (overrides.data === null ? null : JSON.parse(JSON.stringify(overrides.data))) :
      defaultData;

    const result = {
      widgetTypeId,
      name: 'Test Widget',
      description: 'A test widget for unit testing',
      isActive: true,
      ...overrides
    };

    // Set data after spread to ensure it's not overwritten
    result.data = finalData;

    return result;
  }

  /**
   * Create multiple test WidgetType properties
   */
  static createMultipleWidgetTypes(count: number): WidgetTypeProperties[] {
    return Array.from({ length: count }, (_, index) => ({
      code: `TEST_WIDGET_${index + 1}`,
      name: `Test Widget Type ${index + 1}`,
      description: `Test widget type number ${index + 1}`,
      isActive: index % 2 === 0 // Alternate active/inactive
    }));
  }

  /**
   * Create multiple test Widget properties
   */
  static createMultipleWidgets(widgetTypeId: string, count: number): WidgetProperties[] {
    return Array.from({ length: count }, (_, index) => ({
      widgetTypeId,
      name: `Test Widget ${index + 1}`,
      description: `Test widget number ${index + 1}`,
      isActive: index % 3 !== 0, // Most active, some inactive
      data: {
        index: index + 1,
        isEven: index % 2 === 0,
        config: {
          priority: index + 1,
          category: index % 2 === 0 ? 'A' : 'B'
        }
      }
    }));
  }

  /**
   * Create test data for validation scenarios
   */
  static createInvalidWidgetTypeProperties(): Partial<WidgetTypeProperties>[] {
    return [
      {}, // Missing required fields
      { code: '' }, // Empty code
      { code: 'test', name: '' }, // Empty name
      { code: 'invalid code', name: 'Test' }, // Invalid code format
      { code: 'A'.repeat(51), name: 'Test' }, // Code too long
      { code: 'TEST', name: 'A'.repeat(256) } // Name too long
    ];
  }

  /**
   * Create test data for validation scenarios
   */
  static createInvalidWidgetProperties(): Partial<WidgetProperties>[] {
    return [
      {}, // Missing required fields
      { widgetTypeId: '' }, // Empty widgetTypeId
      { widgetTypeId: 'invalid-id', name: '' }, // Empty name
      { widgetTypeId: 'invalid-id', name: 'A'.repeat(256) }, // Name too long
      { widgetTypeId: 'invalid-id', name: 'Test', data: 'invalid' as any } // Invalid data type
    ];
  }

  /**
   * Create a complete Widget object with key and events
   */
  static createCompleteWidget(widgetTypeId: string, overrides: Partial<Widget> = {}): Widget {
    const id = `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return {
      key: { kt: 'widget', pk: id },
      id,
      widgetTypeId,
      name: 'Complete Test Widget',
      description: 'A complete widget with all properties',
      isActive: true,
      data: { test: true },
      events: {
        created: { at: new Date() },
        updated: { at: new Date() },
        deleted: { at: null }
      },
      refs: {
        widgetType: { kt: 'widgetType', pk: widgetTypeId }
      },
      ...overrides
    };
  }

  /**
   * Create a complete WidgetType object with key and events
   */
  static createCompleteWidgetType(overrides: Partial<WidgetType> = {}): WidgetType {
    const id = `widgetType-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return {
      key: { kt: 'widgetType', pk: id },
      id,
      code: 'COMPLETE_TEST',
      name: 'Complete Test Widget Type',
      description: 'A complete widget type with all properties',
      isActive: true,
      events: {
        created: { at: new Date() },
        updated: { at: new Date() },
        deleted: { at: null }
      },
      ...overrides
    };
  }
}
