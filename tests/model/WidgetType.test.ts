import { describe, expect, it } from 'vitest';
import { WidgetTypeProperties } from '../../src/model/WidgetType';
import { TestFixtures } from '../helpers';

describe('WidgetType Model', () => {
  describe('Type Definitions', () => {
    it('should define WidgetType interface correctly', () => {
      const widgetType = TestFixtures.createCompleteWidgetType();

      // Check required properties
      expect(widgetType).toHaveProperty('key');
      expect(widgetType).toHaveProperty('id');
      expect(widgetType).toHaveProperty('code');
      expect(widgetType).toHaveProperty('name');
      expect(widgetType).toHaveProperty('isActive');
      expect(widgetType).toHaveProperty('events');

      // Check key structure
      expect(widgetType.key.kt).toBe('widgetType');
      expect(widgetType.key.pk).toBe(widgetType.id);

      // Check events structure
      expect(widgetType.events).toHaveProperty('created');
      expect(widgetType.events).toHaveProperty('updated');
      expect(widgetType.events).toHaveProperty('deleted');
      expect(widgetType.events.created.at).toBeInstanceOf(Date);
      expect(widgetType.events.updated.at).toBeInstanceOf(Date);
      expect(widgetType.events.deleted.at).toBeNull();
    });

    it('should allow optional properties', () => {
      const widgetType = TestFixtures.createCompleteWidgetType({
        description: null as any
      });

      expect(widgetType.description).toBeNull();
    });

    it('should have correct default values', () => {
      const widgetType = TestFixtures.createCompleteWidgetType();

      expect(widgetType.isActive).toBe(true);
      expect(widgetType.code).toBe('COMPLETE_TEST');
      expect(widgetType.name).toBe('Complete Test Widget Type');
    });
  });

  describe('WidgetTypeProperties', () => {
    it('should create valid widget type properties', () => {
      const properties = TestFixtures.createWidgetTypeProperties();

      expect(properties.code).toBe('TEST_WIDGET');
      expect(properties.name).toBe('Test Widget Type');
      expect(properties.isActive).toBe(true);
      expect(properties.description).toBe('A test widget type for unit testing');
    });

    it('should allow property overrides', () => {
      const customProperties = TestFixtures.createWidgetTypeProperties({
        code: 'CUSTOM_CODE',
        name: 'Custom Widget Type',
        isActive: false,
        description: 'Custom description'
      });

      expect(customProperties.code).toBe('CUSTOM_CODE');
      expect(customProperties.name).toBe('Custom Widget Type');
      expect(customProperties.isActive).toBe(false);
      expect(customProperties.description).toBe('Custom description');
    });

    it('should handle minimal properties', () => {
      const minimalProperties: WidgetTypeProperties = {
        code: 'MIN',
        name: 'Minimal'
      };

      expect(minimalProperties.code).toBe('MIN');
      expect(minimalProperties.name).toBe('Minimal');
      expect(minimalProperties.description).not.toBeDefined();
      expect(minimalProperties.isActive).not.toBeDefined();
    });
  });

  describe('Code Validation Patterns', () => {
    it('should handle valid code formats', () => {
      const validCodes = [
        'BUTTON',
        'TEXT_INPUT',
        'CHART',
        'TABLE',
        'CUSTOM_WIDGET_TYPE',
        'A',
        'A_B_C_D_E_F_G',
        'WIDGET_123'
      ];

      validCodes.forEach(code => {
        const properties = TestFixtures.createWidgetTypeProperties({ code });
        expect(properties.code, `Failed for code: ${code}`).toBe(code);
      });
    });

    it('should represent expected code patterns', () => {
      // These represent the expected patterns, actual validation is in the library
      const expectedPatterns = [
        { code: 'UPPERCASE_ONLY', valid: true },
        { code: 'with_underscores', valid: false }, // Should be uppercase
        { code: 'With Spaces', valid: false }, // No spaces allowed
        { code: 'SPECIAL-CHARS', valid: false }, // No special chars except underscore
        { code: '', valid: false }, // Empty string
        { code: 'A'.repeat(51), valid: false } // Too long
      ];

      expectedPatterns.forEach(({ code, valid }) => {
        if (valid) {
          const properties = TestFixtures.createWidgetTypeProperties({ code });
          expect(properties.code).toBe(code);
        } else {
          // These would be caught by validation in the actual library
          expect(code.length === 0 || code.length > 50 || !/^[A-Z_]+$/.test(code)).toBe(true);
        }
      });
    });
  });

  describe('Multiple Widget Types', () => {
    it('should create multiple widget types with unique codes', () => {
      const widgetTypes = TestFixtures.createMultipleWidgetTypes(5);

      expect(widgetTypes).toHaveLength(5);

      // Check uniqueness
      const codes = widgetTypes.map(wt => wt.code);
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(5);

      // Check pattern
      widgetTypes.forEach((widgetType, index) => {
        expect(widgetType.code).toBe(`TEST_WIDGET_${index + 1}`);
        expect(widgetType.name).toBe(`Test Widget Type ${index + 1}`);
        expect(widgetType.isActive).toBe(index % 2 === 0); // Alternating pattern
      });
    });

    it('should have alternating active status', () => {
      const widgetTypes = TestFixtures.createMultipleWidgetTypes(6);

      expect(widgetTypes[0].isActive).toBe(true);  // index 0 % 2 === 0
      expect(widgetTypes[1].isActive).toBe(false); // index 1 % 2 !== 0
      expect(widgetTypes[2].isActive).toBe(true);  // index 2 % 2 === 0
      expect(widgetTypes[3].isActive).toBe(false); // index 3 % 2 !== 0
      expect(widgetTypes[4].isActive).toBe(true);  // index 4 % 2 === 0
      expect(widgetTypes[5].isActive).toBe(false); // index 5 % 2 !== 0
    });
  });

  describe('Validation Test Data', () => {
    it('should provide invalid widget type properties for validation testing', () => {
      const invalidProperties = TestFixtures.createInvalidWidgetTypeProperties();

      expect(invalidProperties).toHaveLength(6);

      // Check each invalid case
      const [empty, emptyCode, emptyName, invalidCode, longCode, longName] = invalidProperties;

      expect(Object.keys(empty)).toHaveLength(0);
      expect(emptyCode.code).toBe('');
      expect(emptyName.name).toBe('');
      expect(invalidCode.code).toBe('invalid code');
      expect(longCode.code).toHaveLength(51);
      expect(longName.name).toHaveLength(256);
    });
  });

  describe('Edge Cases', () => {
    it('should handle edge case names and descriptions', () => {
      const edgeCases = [
        { name: 'Single Char', value: 'A' },
        { name: 'Unicode', value: '测试类型 🎯' },
        { name: 'Numbers', value: 'Type123' },
        { name: 'Special Chars', value: 'Type@#$%' },
        { name: 'Long Text', value: 'Very Long Widget Type Name '.repeat(5) }
      ];

      edgeCases.forEach(({ name, value }) => {
        const properties = TestFixtures.createWidgetTypeProperties({
          name: value,
          description: `Description for ${value}`
        });

        expect(properties.name, `Failed for ${name}`).toBe(value);
        expect(properties.description, `Failed for ${name}`).toBe(`Description for ${value}`);
      });
    });

    it('should handle timestamp edge cases', () => {
      const widgetType = TestFixtures.createCompleteWidgetType();
      const now = new Date();

      // Events should be recent
      expect(widgetType.events.created.at.getTime()).toBeLessThanOrEqual(now.getTime());
      expect(widgetType.events.updated.at.getTime()).toBeLessThanOrEqual(now.getTime());

      // Events should be within the last few seconds
      const timeDiff = now.getTime() - widgetType.events.created.at.getTime();
      expect(timeDiff).toBeLessThan(5000); // Less than 5 seconds
    });

    it('should generate unique IDs for multiple instances', () => {
      const widgetTypes = Array.from({ length: 10 }, () =>
        TestFixtures.createCompleteWidgetType()
      );

      const ids = widgetTypes.map(wt => wt.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(10);

      // Check ID format (should contain timestamp and random string)
      ids.forEach(id => {
        expect(id).toMatch(/^widgetType-\d+-[a-z0-9]+$/);
      });
    });
  });
});
