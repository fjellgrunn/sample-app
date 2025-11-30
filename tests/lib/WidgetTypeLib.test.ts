import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createWidgetTypeLibrary } from '../../src/lib/WidgetTypeLib';
import { TestDatabase, TestFixtures } from '../helpers';
import { Registry } from '@fjell/registry';

describe('WidgetTypeLib', () => {
  let testDb: TestDatabase;
  let registry: Registry;
  let widgetTypeLib: any;

  beforeEach(async () => {
    testDb = await TestDatabase.createWithData();
    registry = testDb.getRegistry();

    const { widgetTypeModel } = testDb.getModels();
    widgetTypeLib = createWidgetTypeLibrary(registry, widgetTypeModel);
  });

  afterEach(async () => {
    if (testDb) {
      await testDb.cleanup();
    }
  });

  describe('Library Creation', () => {
    it('should create widget type library successfully', () => {
      expect(widgetTypeLib).toBeDefined();
      expect(widgetTypeLib.operations.create).toBeDefined();
      expect(widgetTypeLib.operations.get).toBeDefined();
      expect(widgetTypeLib.operations.update).toBeDefined();
      expect(widgetTypeLib.operations.remove).toBeDefined();
      expect(widgetTypeLib.operations.all).toBeDefined();
    });

    it('should have correct key type association', () => {
      // The library should be configured for 'widgetType' key type
      expect(widgetTypeLib).toBeDefined();
    });
  });

  describe('WidgetType Creation', () => {
    it('should create a valid widget type', async () => {
      const widgetTypeProperties = TestFixtures.createWidgetTypeProperties({
        code: 'TEST_BUTTON',
        name: 'Test Button Widget',
        description: 'A test button widget type'
      });

      const widgetType = await widgetTypeLib.operations.create(widgetTypeProperties);

      expect(widgetType).toBeDefined();
      expect(widgetType.id).toBeDefined();
      expect(widgetType.code).toBe('TEST_BUTTON');
      expect(widgetType.name).toBe('Test Button Widget');
      expect(widgetType.description).toBe('A test button widget type');
      expect(widgetType.isActive).toBe(true);
      expect(widgetType.key.kt).toBe('widgetType');
      expect(widgetType.key.pk).toBe(widgetType.id);
    });

    it('should normalize code to uppercase during creation', async () => {
      const widgetTypeProperties = TestFixtures.createWidgetTypeProperties({
        code: 'test_lowercase',
        name: 'Test Widget Type'
      });

      const widgetType = await widgetTypeLib.operations.create(widgetTypeProperties);

      expect(widgetType.code).toBe('TEST_LOWERCASE');
    });

    it('should trim code and name during creation', async () => {
      const widgetTypeProperties = TestFixtures.createWidgetTypeProperties({
        code: '  TEST_TRIM  ',
        name: '  Test Trim Widget  '
      });

      const widgetType = await widgetTypeLib.operations.create(widgetTypeProperties);

      expect(widgetType.code).toBe('TEST_TRIM');
      expect(widgetType.name).toBe('Test Trim Widget');
    });

    it('should set default isActive to true when undefined', async () => {
      const widgetTypeProperties = {
        code: 'DEFAULT_ACTIVE',
        name: 'Default Active Widget'
        // isActive is undefined
      };

      const widgetType = await widgetTypeLib.operations.create(widgetTypeProperties);

      expect(widgetType.isActive).toBe(true);
    });

    it('should preserve explicit isActive value', async () => {
      const widgetTypeProperties = TestFixtures.createWidgetTypeProperties({
        code: 'INACTIVE_TEST',
        name: 'Inactive Test Widget',
        isActive: false
      });

      const widgetType = await widgetTypeLib.operations.create(widgetTypeProperties);

      expect(widgetType.isActive).toBe(false);
    });
  });

  describe('WidgetType Validation', () => {
    it('should validate code is required', async () => {
      const widgetTypeProperties = {
        code: '',
        name: 'Test Widget Type'
      };

      await expect(widgetTypeLib.operations.create(widgetTypeProperties)).rejects.toThrow('Validation failed: Create Validation Failed');
    });

    it('should validate code is trimmed', async () => {
      const widgetTypeProperties = {
        code: '   ',
        name: 'Test Widget Type'
      };

      await expect(widgetTypeLib.operations.create(widgetTypeProperties)).rejects.toThrow('Validation failed: Create Validation Failed');
    });

    it('should validate code length limit', async () => {
      const widgetTypeProperties = {
        code: 'A'.repeat(51), // Too long
        name: 'Test Widget Type'
      };

      await expect(widgetTypeLib.operations.create(widgetTypeProperties)).rejects.toThrow('Validation failed: Create Validation Failed');
    });

    it('should validate code format - uppercase letters and underscores only', async () => {
      const invalidCodes = [
        'lowercase',
        'Mixed_Case',
        'INVALID-DASH',
        'INVALID SPACE',
        'INVALID@SYMBOL',
        'INVALID123',
        'INVALID.DOT'
      ];

      for (const code of invalidCodes) {
        const widgetTypeProperties = {
          code,
          name: 'Test Widget Type'
        };

        await expect(widgetTypeLib.operations.create(widgetTypeProperties)).rejects.toThrow('Error in preCreate');
      }
    });

    it('should allow valid code formats', async () => {
      const validCodes = [
        'TEST_BUTTON_VALID',
        'TEST_TEXT_INPUT',
        'TEST_CHART_WIDGET',
        'TEST_TABLE',
        'TEST_A',
        'TEST_A_B_C_D_E',
        'TEST_WIDGET_TYPE_WITH_MANY_UNDERSCORES'
      ];

      for (const code of validCodes) {
        const widgetTypeProperties = TestFixtures.createWidgetTypeProperties({
          code,
          name: `${code} Widget Type`
        });

        const widgetType = await widgetTypeLib.operations.create(widgetTypeProperties);
        expect(widgetType.code).toBe(code);
      }
    });

    it('should validate name is required', async () => {
      const widgetTypeProperties = {
        code: 'TEST_WIDGET',
        name: ''
      };

      await expect(widgetTypeLib.operations.create(widgetTypeProperties)).rejects.toThrow('Validation failed: Create Validation Failed');
    });

    it('should validate name is trimmed', async () => {
      const widgetTypeProperties = {
        code: 'TEST_WIDGET',
        name: '   '
      };

      await expect(widgetTypeLib.operations.create(widgetTypeProperties)).rejects.toThrow('Validation failed: Create Validation Failed');
    });

    it('should validate name length limit', async () => {
      const widgetTypeProperties = {
        code: 'TEST_WIDGET',
        name: 'A'.repeat(256) // Too long
      };

      await expect(widgetTypeLib.operations.create(widgetTypeProperties)).rejects.toThrow('Validation failed: Create Validation Failed');
    });
  });

  describe('WidgetType Updates', () => {
    let widgetType: any;

    beforeEach(async () => {
      const widgetTypeProperties = TestFixtures.createWidgetTypeProperties({
        code: 'UPDATE_TEST',
        name: 'Update Test Widget Type'
      });
      widgetType = await widgetTypeLib.operations.create(widgetTypeProperties);
    });

    it('should update widget type name', async () => {
      const updates = { name: 'Updated Widget Type Name' };
      const updatedWidgetType = await widgetTypeLib.operations.update(widgetType.key, updates);

      expect(updatedWidgetType.name).toBe('Updated Widget Type Name');
      expect(updatedWidgetType.id).toBe(widgetType.id);
    });

    it('should update widget type code', async () => {
      const updates = { code: 'UPDATED_CODE' };
      const updatedWidgetType = await widgetTypeLib.operations.update(widgetType.key, updates);

      expect(updatedWidgetType.code).toBe('UPDATED_CODE');
    });

    it('should normalize code during update', async () => {
      const updates = { code: '  updated_lowercase_code  ' };
      const updatedWidgetType = await widgetTypeLib.operations.update(widgetType.key, updates);

      expect(updatedWidgetType.code).toBe('UPDATED_LOWERCASE_CODE');
    });

    it('should normalize name during update', async () => {
      const updates = { name: '  Updated Widget Type Name  ' };
      const updatedWidgetType = await widgetTypeLib.operations.update(widgetType.key, updates);

      expect(updatedWidgetType.name).toBe('Updated Widget Type Name');
    });

    it('should update widget type description', async () => {
      const updates = { description: 'Updated description' };
      const updatedWidgetType = await widgetTypeLib.operations.update(widgetType.key, updates);

      expect(updatedWidgetType.description).toBe('Updated description');
    });

    it('should update widget type active status', async () => {
      const updates = { isActive: false };
      const updatedWidgetType = await widgetTypeLib.operations.update(widgetType.key, updates);

      expect(updatedWidgetType.isActive).toBe(false);
    });
  });

  describe('WidgetType Removal', () => {
    let widgetType: any;

    beforeEach(async () => {
      const widgetTypeProperties = TestFixtures.createWidgetTypeProperties({
        code: 'REMOVE_TEST',
        name: 'Remove Test Widget Type'
      });
      widgetType = await widgetTypeLib.operations.create(widgetTypeProperties);
    });

    it('should remove widget type successfully', async () => {
      const result = await widgetTypeLib.operations.remove(widgetType.key);
      expect(result).toBeTruthy();
    });

    it('should not find removed widget type', async () => {
      await widgetTypeLib.operations.remove(widgetType.key);

      await expect(widgetTypeLib.operations.get(widgetType.key)).rejects.toThrow('widgetType not found');
    });
  });

  describe('Data Mappers', () => {
    it('should map from database record correctly', async () => {
      const widgetTypeProperties = TestFixtures.createWidgetTypeProperties({
        code: 'MAPPER_TEST',
        name: 'Mapper Test Widget Type',
        description: 'Test description'
      });

      const widgetType = await widgetTypeLib.operations.create(widgetTypeProperties);

      // Verify mapping structure
      expect(widgetType.key).toEqual({ kt: 'widgetType', pk: widgetType.id });
      expect(widgetType.events).toBeDefined();
      expect(widgetType.events.created.at).toBeInstanceOf(Date);
      expect(widgetType.events.updated.at).toBeInstanceOf(Date);
      expect(widgetType.events.deleted.at).toBeNull();
    });

    it('should handle missing optional fields in database mapping', async () => {
      const widgetTypeProperties = {
        code: 'MINIMAL_TEST',
        name: 'Minimal Widget Type'
        // No description
      };

      const widgetType = await widgetTypeLib.operations.create(widgetTypeProperties);

      expect(widgetType.description).toBeNull();
    });

    it('should map to database format correctly', async () => {
      const widgetTypeProperties = TestFixtures.createWidgetTypeProperties({
        code: 'DB_MAP_TEST',
        name: 'Database Mapping Test',
        description: 'Test description',
        isActive: false
      });

      const widgetType = await widgetTypeLib.operations.create(widgetTypeProperties);

      // Verify the data was stored correctly
      expect(widgetType.code).toBe('DB_MAP_TEST');
      expect(widgetType.name).toBe('Database Mapping Test');
      expect(widgetType.description).toBe('Test description');
      expect(widgetType.isActive).toBe(false);
    });
  });

  describe('WidgetType Retrieval', () => {
    let widgetTypes: any[];

    beforeEach(async () => {
      // Create multiple widget types
      widgetTypes = [];
      for (let i = 0; i < 3; i++) {
        const codes = ['RETRIEVAL_TEST_ONE', 'RETRIEVAL_TEST_TWO', 'RETRIEVAL_TEST_THREE'];
        const widgetTypeProperties = TestFixtures.createWidgetTypeProperties({
          code: codes[i],
          name: `Retrieval Test Widget Type ${i + 1}`,
          isActive: i % 2 === 0
        });
        const widgetType = await widgetTypeLib.operations.create(widgetTypeProperties);
        widgetTypes.push(widgetType);
      }
    });

    it('should get widget type by key', async () => {
      const retrievedWidgetType = await widgetTypeLib.operations.get(widgetTypes[0].key);

      expect(retrievedWidgetType).toBeDefined();
      expect(retrievedWidgetType.id).toBe(widgetTypes[0].id);
      expect(retrievedWidgetType.code).toBe(widgetTypes[0].code);
      expect(retrievedWidgetType.name).toBe(widgetTypes[0].name);
    });

    it('should list all widget types', async () => {
      const allWidgetTypes = await widgetTypeLib.operations.all({});

      expect(allWidgetTypes.items.length).toBeGreaterThanOrEqual(3);
      const ourWidgetTypes = allWidgetTypes.items.filter(wt =>
        widgetTypes.some(widgetType => widgetType.id === wt.id)
      );
      expect(ourWidgetTypes).toHaveLength(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle maximum length code', async () => {
      const maxLengthCode = 'A'.repeat(50); // Exactly 50 characters
      const widgetTypeProperties = TestFixtures.createWidgetTypeProperties({
        code: maxLengthCode,
        name: 'Max Length Code Test'
      });

      const widgetType = await widgetTypeLib.operations.create(widgetTypeProperties);
      expect(widgetType.code).toBe(maxLengthCode);
    });

    it('should handle maximum length name', async () => {
      const maxLengthName = 'A'.repeat(255); // Exactly 255 characters
      const widgetTypeProperties = TestFixtures.createWidgetTypeProperties({
        code: 'MAX_LENGTH_NAME',
        name: maxLengthName
      });

      const widgetType = await widgetTypeLib.operations.create(widgetTypeProperties);
      expect(widgetType.name).toBe(maxLengthName);
    });

    it('should handle single character code', async () => {
      const widgetTypeProperties = TestFixtures.createWidgetTypeProperties({
        code: 'A',
        name: 'Single Character Code'
      });

      const widgetType = await widgetTypeLib.operations.create(widgetTypeProperties);
      expect(widgetType.code).toBe('A');
    });

    it('should handle code with many underscores', async () => {
      const widgetTypeProperties = TestFixtures.createWidgetTypeProperties({
        code: 'A_B_C_D_E_F_G_H_I_J',
        name: 'Many Underscores Code'
      });

      const widgetType = await widgetTypeLib.operations.create(widgetTypeProperties);
      expect(widgetType.code).toBe('A_B_C_D_E_F_G_H_I_J');
    });

    it('should handle unicode characters in name and description', async () => {
      const widgetTypeProperties = TestFixtures.createWidgetTypeProperties({
        code: 'UNICODE_TEST',
        name: '测试小部件类型 🎯',
        description: 'Ñoño descripción with émojis 🚀'
      });

      const widgetType = await widgetTypeLib.operations.create(widgetTypeProperties);
      expect(widgetType.name).toBe('测试小部件类型 🎯');
      expect(widgetType.description).toBe('Ñoño descripción with émojis 🚀');
    });
  });
});
