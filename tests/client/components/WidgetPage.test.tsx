import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WidgetPage } from '../../../src/client/components/WidgetPage';
import { useWidgets } from '../../../src/client/providers/WidgetProvider';
import { widgetApi } from '../../../src/client/api/WidgetAPI';
import { TestFixtures } from '../../helpers/testFixtures';
import type { Widget } from '../../../src/model/Widget';

// Mock the provider hook [[memory:3807192]]
vi.mock('../../../src/client/providers/WidgetProvider', () => ({
  useWidgets: vi.fn()
}));

// Mock the API [[memory:3807192]]
vi.mock('../../../src/client/api/WidgetAPI', () => ({
  widgetApi: {
    get: vi.fn()
  }
}));

// Mock react-router-dom hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom') as any;
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: vi.fn()
  };
});

// Import useParams mock separately for better control
import { useParams } from 'react-router-dom';

describe('WidgetPage', () => {
  const mockUseWidgets = useWidgets as ReturnType<typeof vi.fn>;
  const mockUseParams = useParams as ReturnType<typeof vi.fn>;
  const mockWidgetApiGet = widgetApi.get as ReturnType<typeof vi.fn>;

  const mockWidget: Widget = TestFixtures.createCompleteWidget('widget-type-1', {
    id: 'widget-1',
    name: 'Test Widget',
    description: 'Test Description',
    isActive: true,
    data: { test: 'data' },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02')
  });

  const defaultWidgetContext = {
    name: 'WidgetsContext',
    items: [mockWidget],
    isLoading: false,
    isCreating: false,
    isUpdating: false,
    isRemoving: false,
    pkTypes: ['widget'],
    create: vi.fn(),
    all: vi.fn(),
    one: vi.fn(),
    allAction: vi.fn(),
    allFacet: vi.fn(),
    facet: vi.fn(),
    set: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    action: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseWidgets.mockReturnValue(defaultWidgetContext);
    mockNavigate.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderWidgetPage = (routePath = '/widget/widget-1') => {
    return render(
      <MemoryRouter initialEntries={[routePath]}>
        <WidgetPage />
      </MemoryRouter>
    );
  };

  describe('Loading State', () => {
    it('should show loading state when widget is being fetched', () => {
      mockUseParams.mockReturnValue({ id: 'widget-1' });
      mockUseWidgets.mockReturnValue({
        ...defaultWidgetContext,
        items: [] // No cached widgets
      });
      mockWidgetApiGet.mockResolvedValue(mockWidget);

      renderWidgetPage();

      expect(screen.getByText('Loading widget...')).toBeInTheDocument();
      expect(screen.getByText('← Back to Widgets')).toBeInTheDocument();
    });
  });

  describe('Error States', () => {
    it('should show error when no widget ID is provided', async () => {
      mockUseParams.mockReturnValue({});

      renderWidgetPage();

      await waitFor(() => {
        expect(screen.getByText('Error: No widget ID provided')).toBeInTheDocument();
      });
    });

    it('should show error when widget is not found in API', async () => {
      mockUseParams.mockReturnValue({ id: 'non-existent' });
      mockUseWidgets.mockReturnValue({
        ...defaultWidgetContext,
        items: []
      });
      mockWidgetApiGet.mockResolvedValue(null);

      renderWidgetPage();

      await waitFor(() => {
        expect(screen.getByText('Error: Widget not found')).toBeInTheDocument();
      });
    });

    it('should show error when API call throws an exception', async () => {
      mockUseParams.mockReturnValue({ id: 'error-widget' });
      mockUseWidgets.mockReturnValue({
        ...defaultWidgetContext,
        items: []
      });
      mockWidgetApiGet.mockRejectedValue(new Error('Network error'));

      renderWidgetPage();

      await waitFor(() => {
        expect(screen.getByText('Error: Network error')).toBeInTheDocument();
      });
    });

    it('should handle non-Error exceptions gracefully', async () => {
      mockUseParams.mockReturnValue({ id: 'error-widget' });
      mockUseWidgets.mockReturnValue({
        ...defaultWidgetContext,
        items: []
      });
      mockWidgetApiGet.mockRejectedValue('String error');

      renderWidgetPage();

      await waitFor(() => {
        expect(screen.getByText('Error: Failed to load widget')).toBeInTheDocument();
      });
    });
  });

  describe('Successful Widget Display', () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ id: 'widget-1' });
    });

    it('should display widget from cache when available', async () => {
      renderWidgetPage();

      await waitFor(() => {
        expect(screen.getByText('Widget Details')).toBeInTheDocument();
        expect(screen.getByText('Test Widget')).toBeInTheDocument();
        expect(screen.getByText('Test Description')).toBeInTheDocument();
        expect(screen.getByText('Active', { selector: '.status-badge' })).toBeInTheDocument();
      });

      // Should not call API when widget is cached
      expect(mockWidgetApiGet).not.toHaveBeenCalled();
    });

    it('should fetch widget from API when not in cache', async () => {
      mockUseWidgets.mockReturnValue({
        ...defaultWidgetContext,
        items: [] // Empty cache
      });
      mockWidgetApiGet.mockResolvedValue(mockWidget);

      renderWidgetPage();

      await waitFor(() => {
        expect(screen.getByText('Test Widget')).toBeInTheDocument();
      });

      expect(mockWidgetApiGet).toHaveBeenCalledWith({ kt: 'widget', pk: 'widget-1' });
    });

    it('should display all widget properties correctly', async () => {
      renderWidgetPage();

      await waitFor(() => {
        // Header section
        expect(screen.getByText('Widget Details')).toBeInTheDocument();
        expect(screen.getByText('Test Widget')).toBeInTheDocument();

        // Status badge
        const statusBadge = screen.getByText('Active', { selector: '.status-badge' });
        expect(statusBadge).toBeInTheDocument();
        expect(statusBadge).toHaveClass('status-badge', 'active');

        // Description
        expect(screen.getByText('Test Description')).toBeInTheDocument();

        // Details section
        expect(screen.getByText('ID:')).toBeInTheDocument();
        expect(screen.getByText('widget-1')).toBeInTheDocument();
        expect(screen.getByText('Widget Type ID:')).toBeInTheDocument();
        expect(screen.getByText('widget-type-1')).toBeInTheDocument();

        // Dates
        expect(screen.getByText('Created:')).toBeInTheDocument();
        expect(screen.getByText('Updated:')).toBeInTheDocument();

        // Data section
        expect(screen.getByText('Data')).toBeInTheDocument();
        expect(screen.getByText(/"test": "data"/)).toBeInTheDocument();
      });
    });

    it('should display inactive widget with proper styling', async () => {
      const inactiveWidget = { ...mockWidget, isActive: false };
      mockUseWidgets.mockReturnValue({
        ...defaultWidgetContext,
        items: [inactiveWidget]
      });

      renderWidgetPage();

      await waitFor(() => {
        const statusBadge = screen.getByText('Inactive', { selector: '.status-badge' });
        expect(statusBadge).toBeInTheDocument();
        expect(statusBadge).toHaveClass('status-badge', 'inactive');
        expect(statusBadge.closest('.widget-detail-card')).toHaveClass('widget-detail-card', 'inactive');
      });
    });

    it('should handle widget without optional fields', async () => {
      const minimalWidget: Widget = TestFixtures.createCompleteWidget('widget-type-1', {
        id: 'minimal-widget',
        name: 'Minimal Widget',
        description: undefined,
        data: undefined,
        createdAt: undefined,
        updatedAt: undefined
      });

      mockUseWidgets.mockReturnValue({
        ...defaultWidgetContext,
        items: [minimalWidget]
      });
      mockUseParams.mockReturnValue({ id: 'minimal-widget' });

      renderWidgetPage();

      await waitFor(() => {
        expect(screen.getByText('Minimal Widget')).toBeInTheDocument();
        expect(screen.queryByText('Description')).not.toBeInTheDocument();
        expect(screen.queryByText('Created:')).not.toBeInTheDocument();
        expect(screen.queryByText('Updated:')).not.toBeInTheDocument();
        expect(screen.queryByText('Data')).not.toBeInTheDocument();
      });
    });

    it('should handle widget with null data', async () => {
      const widgetWithNullData = { ...mockWidget, data: null };
      mockUseWidgets.mockReturnValue({
        ...defaultWidgetContext,
        items: [widgetWithNullData]
      });

      renderWidgetPage();

      await waitFor(() => {
        expect(screen.queryByText('Data')).not.toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ id: 'widget-1' });
    });

    it('should navigate back to widgets list when back button is clicked', async () => {
      renderWidgetPage();

      const backButton = screen.getByText('← Back to Widgets');
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should show back button in all states', async () => {
      // Test loading state
      mockUseWidgets.mockReturnValue({
        ...defaultWidgetContext,
        items: []
      });
      mockWidgetApiGet.mockImplementation(() => new Promise(() => { })); // Never resolves

      renderWidgetPage();
      expect(screen.getByText('← Back to Widgets')).toBeInTheDocument();

      // Test error state
      mockUseParams.mockReturnValue({});
      renderWidgetPage();

      await waitFor(() => {
        expect(screen.getAllByText('← Back to Widgets')).toHaveLength(2); // One from each render
      });
    });
  });

  describe('User Interactions', () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ id: 'widget-1' });
    });

    it('should show edit button and display alert when clicked', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });

      renderWidgetPage();

      await waitFor(() => {
        const editButton = screen.getByText('Edit Widget');
        fireEvent.click(editButton);
      });

      expect(alertSpy).toHaveBeenCalledWith('Edit functionality not implemented yet');
      alertSpy.mockRestore();
    });

    it('should show delete button for active widgets', async () => {
      renderWidgetPage();

      await waitFor(() => {
        expect(screen.getByText('Delete Widget')).toBeInTheDocument();
      });
    });

    it('should not show delete button for inactive widgets', async () => {
      const inactiveWidget = { ...mockWidget, isActive: false };
      mockUseWidgets.mockReturnValue({
        ...defaultWidgetContext,
        items: [inactiveWidget]
      });

      renderWidgetPage();

      await waitFor(() => {
        expect(screen.queryByText('Delete Widget')).not.toBeInTheDocument();
      });
    });

    it('should handle delete button with confirmation', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });

      renderWidgetPage();

      await waitFor(() => {
        const deleteButton = screen.getByText('Delete Widget');
        fireEvent.click(deleteButton);
      });

      expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete "Test Widget"?');
      expect(alertSpy).toHaveBeenCalledWith('Delete functionality not implemented yet');

      confirmSpy.mockRestore();
      alertSpy.mockRestore();
    });

    it('should cancel delete when user cancels confirmation', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });

      renderWidgetPage();

      await waitFor(() => {
        const deleteButton = screen.getByText('Delete Widget');
        fireEvent.click(deleteButton);
      });

      expect(confirmSpy).toHaveBeenCalled();
      expect(alertSpy).not.toHaveBeenCalled();

      confirmSpy.mockRestore();
      alertSpy.mockRestore();
    });
  });

  describe('Data Formatting', () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ id: 'widget-1' });
    });

    it('should format dates correctly', async () => {
      renderWidgetPage();

      await waitFor(() => {
        // Check if dates are formatted as locale date strings
        const createdDate = new Date('2024-01-01').toLocaleDateString();
        const updatedDate = new Date('2024-01-02').toLocaleDateString();

        expect(screen.getByText(createdDate)).toBeInTheDocument();
        expect(screen.getByText(updatedDate)).toBeInTheDocument();
      });
    });

    it('should format complex data as JSON', async () => {
      const complexWidget = {
        ...mockWidget,
        data: {
          config: { enabled: true, count: 42 },
          metadata: { version: '1.0' },
          array: [1, 2, 3]
        }
      };

      mockUseWidgets.mockReturnValue({
        ...defaultWidgetContext,
        items: [complexWidget]
      });

      renderWidgetPage();

      await waitFor(() => {
        expect(screen.getByText(/"enabled": true/)).toBeInTheDocument();
        expect(screen.getByText(/"count": 42/)).toBeInTheDocument();
        expect(screen.getByText(/"version": "1.0"/)).toBeInTheDocument();
      });
    });

    it('should handle null/undefined data gracefully', async () => {
      const widgetWithNoData = { ...mockWidget, data: undefined };
      mockUseWidgets.mockReturnValue({
        ...defaultWidgetContext,
        items: [widgetWithNoData]
      });

      renderWidgetPage();

      await waitFor(() => {
        expect(screen.queryByText('Data')).not.toBeInTheDocument();
      });
    });
  });

  describe('Component Integration', () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ id: 'widget-1' });
    });

    it('should re-fetch widget when ID changes', async () => {
      const { rerender } = renderWidgetPage();

      // Change the widget ID
      mockUseParams.mockReturnValue({ id: 'widget-2' });
      mockUseWidgets.mockReturnValue({
        ...defaultWidgetContext,
        items: [] // Empty cache for new widget
      });

      const newWidget = TestFixtures.createCompleteWidget('widget-type-2', {
        id: 'widget-2',
        name: 'Another Widget'
      });

      mockWidgetApiGet.mockResolvedValue(newWidget);

      rerender(
        <MemoryRouter initialEntries={['/widget/widget-2']}>
          <WidgetPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockWidgetApiGet).toHaveBeenCalledWith({ kt: 'widget', pk: 'widget-2' });
      });
    });

    it('should update when widgets context changes', async () => {
      const { rerender } = renderWidgetPage();

      // Update the context with new widget data
      const updatedWidget = { ...mockWidget, name: 'Updated Widget Name' };
      mockUseWidgets.mockReturnValue({
        ...defaultWidgetContext,
        items: [updatedWidget]
      });

      rerender(
        <MemoryRouter initialEntries={['/widget/widget-1']}>
          <WidgetPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Updated Widget Name')).toBeInTheDocument();
      });
    });
  });
});
