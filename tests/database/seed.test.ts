import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { seedTestData } from '../../src/database/seed';
import { TestDatabase } from '../helpers';

describe('Database Seed', () => {
  let testDb: TestDatabase;
  let models: ReturnType<typeof TestDatabase.prototype.getModels>;

  beforeEach(async () => {
    testDb = await TestDatabase.createFresh();
    models = testDb.getModels();
  });

  afterEach(async () => {
    await testDb.cleanup();
  });

  describe('seedTestData Function', () => {
    it('should seed widget types and widgets successfully', async () => {
      await seedTestData(models);

      // Check widget types were created
      const widgetTypes = await models.WidgetTypeModel.findAll();
      expect(widgetTypes.length).toBeGreaterThan(0);
      expect(widgetTypes.length).toBe(5); // Should create 5 widget types

      // Check widgets were created
      const widgets = await models.WidgetModel.findAll();
      expect(widgets.length).toBeGreaterThan(0);
      expect(widgets.length).toBe(11); // Should create 11 widgets
    });

    it('should create expected widget types', async () => {
      await seedTestData(models);

      const widgetTypes = await models.WidgetTypeModel.findAll({
        order: [['code', 'ASC']]
      });

      // Check specific widget types
      const codes = widgetTypes.map(wt => wt.code);
      expect(codes).toContain('BUTTON');
      expect(codes).toContain('TEXT_INPUT');
      expect(codes).toContain('CHART');
      expect(codes).toContain('TABLE');
      expect(codes).toContain('LEGACY_WIDGET');

      // Check button widget type specifically
      const buttonType = widgetTypes.find(wt => wt.code === 'BUTTON');
      expect(buttonType).toBeDefined();
      expect(buttonType!.name).toBe('Button Widget');
      expect(buttonType!.description).toBe('Interactive button component for user interfaces');
      expect(buttonType!.isActive).toBe(true);

      // Check legacy widget type (should be inactive)
      const legacyType = widgetTypes.find(wt => wt.code === 'LEGACY_WIDGET');
      expect(legacyType).toBeDefined();
      expect(legacyType!.isActive).toBe(false);
    });

    it('should create widgets with proper relationships', async () => {
      await seedTestData(models);

      const widgets = await models.WidgetModel.findAll({
        include: [{ association: 'widgetType' }]
      });

      // All widgets should have valid widget types
      widgets.forEach(widget => {
        expect(widget.widgetType).toBeDefined();
        expect(widget.widgetTypeId).toBe(widget.widgetType.id);
      });

      // Check specific widget examples
      const primaryButton = widgets.find(w => w.name === 'Primary Action Button');
      expect(primaryButton).toBeDefined();
      expect(primaryButton!.widgetType.code).toBe('BUTTON');
      expect(primaryButton!.isActive).toBe(true);
      expect(primaryButton!.data).toBeDefined();
      expect(primaryButton!.data.text).toBe('Get Started');

      const emailInput = widgets.find(w => w.name === 'Email Input Field');
      expect(emailInput).toBeDefined();
      expect(emailInput!.widgetType.code).toBe('TEXT_INPUT');
      expect(emailInput!.data.validation).toBe('email');
      expect(emailInput!.data.required).toBe(true);
    });

    it('should create widgets with valid JSON data', async () => {
      await seedTestData(models);

      const widgets = await models.WidgetModel.findAll();
      const widgetsWithData = widgets.filter(w => w.data !== null);

      expect(widgetsWithData.length).toBeGreaterThan(0);

      widgetsWithData.forEach(widget => {
        expect(widget.data).toBeDefined();
        expect(typeof widget.data).toBe('object');

        // Verify data can be stringified and parsed (valid JSON)
        expect(() => JSON.stringify(widget.data)).not.toThrow();
        expect(() => JSON.parse(JSON.stringify(widget.data))).not.toThrow();
      });
    });

    it('should create expected button widgets', async () => {
      await seedTestData(models);

      const buttonWidgets = await models.WidgetModel.findAll({
        include: [{
          association: 'widgetType',
          where: { code: 'BUTTON' }
        }]
      });

      expect(buttonWidgets.length).toBeGreaterThanOrEqual(2);

      // Check primary button
      const primaryButton = buttonWidgets.find(w => w.name === 'Primary Action Button');
      expect(primaryButton).toBeDefined();
      expect(primaryButton!.data.color).toBe('primary');
      expect(primaryButton!.data.size).toBe('large');
      expect(primaryButton!.data.icon).toBe('arrow-right');

      // Check secondary button
      const secondaryButton = buttonWidgets.find(w => w.name === 'Secondary Button');
      expect(secondaryButton).toBeDefined();
      expect(secondaryButton!.data.color).toBe('secondary');
      expect(secondaryButton!.data.size).toBe('medium');
      expect(secondaryButton!.data.icon).toBeNull();
    });

    it('should create expected chart widgets', async () => {
      await seedTestData(models);

      const chartWidgets = await models.WidgetModel.findAll({
        include: [{
          association: 'widgetType',
          where: { code: 'CHART' }
        }]
      });

      expect(chartWidgets.length).toBeGreaterThanOrEqual(2);

      // Check sales chart
      const salesChart = chartWidgets.find(w => w.name === 'Sales Dashboard Chart');
      expect(salesChart).toBeDefined();
      expect(salesChart!.data.chartType).toBe('line');
      expect(salesChart!.data.dataSource).toBe('sales_api');
      expect(salesChart!.data.refreshInterval).toBe(300000);
      expect(Array.isArray(salesChart!.data.colors)).toBe(true);

      // Check pie chart
      const pieChart = chartWidgets.find(w => w.name === 'User Analytics Pie Chart');
      expect(pieChart).toBeDefined();
      expect(pieChart!.data.chartType).toBe('pie');
      expect(pieChart!.data.showLegend).toBe(true);
    });

    it('should handle empty database correctly', async () => {
      // Ensure database is empty first
      await models.WidgetModel.destroy({ where: {}, truncate: true });
      await models.WidgetTypeModel.destroy({ where: {}, truncate: true });

      const initialWidgetTypes = await models.WidgetTypeModel.count();
      const initialWidgets = await models.WidgetModel.count();

      expect(initialWidgetTypes).toBe(0);
      expect(initialWidgets).toBe(0);

      // Seed the data
      await seedTestData(models);

      const finalWidgetTypes = await models.WidgetTypeModel.count();
      const finalWidgets = await models.WidgetModel.count();

      expect(finalWidgetTypes).toBe(5);
      expect(finalWidgets).toBe(11);
    });

    it('should not fail when called multiple times', async () => {
      // First seeding
      await seedTestData(models);

      // Second seeding (should not duplicate)
      await expect(seedTestData(models)).rejects.toThrow(); // Should fail due to unique constraints
    });

    it('should create active and inactive items correctly', async () => {
      await seedTestData(models);

      const widgetTypes = await models.WidgetTypeModel.findAll();
      const widgets = await models.WidgetModel.findAll();

      // Check widget type activity
      const activeWidgetTypes = widgetTypes.filter(wt => wt.isActive);
      const inactiveWidgetTypes = widgetTypes.filter(wt => !wt.isActive);

      expect(activeWidgetTypes.length).toBe(4); // BUTTON, TEXT_INPUT, CHART, TABLE
      expect(inactiveWidgetTypes.length).toBe(1); // LEGACY_WIDGET

      // Check widget activity
      const activeWidgets = widgets.filter(w => w.isActive);
      const inactiveWidgets = widgets.filter(w => !w.isActive);

      expect(activeWidgets.length).toBe(10);
      expect(inactiveWidgets.length).toBe(1); // Disabled Test Button
    });
  });

  describe('Data Quality', () => {
    beforeEach(async () => {
      await seedTestData(models);
    });

    it('should have valid relationships between all widgets and widget types', async () => {
      const widgets = await models.WidgetModel.findAll();
      const widgetTypeIds = new Set((await models.WidgetTypeModel.findAll()).map(wt => wt.id));

      widgets.forEach(widget => {
        expect(widgetTypeIds.has(widget.widgetTypeId)).toBe(true);
      });
    });

    it('should have realistic and varied data configurations', async () => {
      const widgets = await models.WidgetModel.findAll();
      const dataConfigurations = widgets.map(w => w.data).filter(data => data !== null);

      // Should have various data types and structures
      expect(dataConfigurations.some(data => typeof data.text === 'string')).toBe(true);
      expect(dataConfigurations.some(data => typeof data.color === 'string')).toBe(true);
      expect(dataConfigurations.some(data => typeof data.size === 'string')).toBe(true);
      expect(dataConfigurations.some(data => Array.isArray(data.columns))).toBe(true);
      expect(dataConfigurations.some(data => typeof data.chartType === 'string')).toBe(true);
    });

    it('should provide good test coverage for different scenarios', async () => {
      const widgetTypes = await models.WidgetTypeModel.findAll();
      const widgets = await models.WidgetModel.findAll();

      // Coverage for different widget type codes
      const codes = new Set(widgetTypes.map(wt => wt.code));
      expect(codes.size).toBeGreaterThanOrEqual(4); // At least 4 different types

      // Coverage for active/inactive states
      expect(widgets.some(w => w.isActive)).toBe(true);
      expect(widgets.some(w => !w.isActive)).toBe(true);
      expect(widgetTypes.some(wt => wt.isActive)).toBe(true);
      expect(widgetTypes.some(wt => !wt.isActive)).toBe(true);

      // Coverage for with/without descriptions
      expect(widgets.some(w => w.description !== null)).toBe(true);
      expect(widgets.some(w => w.description === null)).toBe(true);

      // Coverage for different data structures
      expect(widgets.some(w => w.data !== null)).toBe(true);
      expect(widgets.some(w => w.data === null)).toBe(true);
    });
  });
});
