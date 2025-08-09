// @vitest-environment jsdom

import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';

import { WidgetList } from '../../../src/client/components/WidgetList';
import { useWidgetActions, useWidgets } from '../../../src/client/providers/WidgetProvider';
import { TestFixtures } from '../../helpers/testFixtures';

// Mock provider hooks
vi.mock('../../../src/client/providers/WidgetProvider', () => ({
  useWidgets: vi.fn(),
  useWidgetActions: vi.fn()
}));

describe('WidgetList', () => {
  const mockUseWidgets = useWidgets as unknown as ReturnType<typeof vi.fn>;
  const mockUseWidgetActions = useWidgetActions as unknown as ReturnType<typeof vi.fn>;

  const activeWidget = TestFixtures.createCompleteWidget('wt-1', {
    id: 'w-1',
    name: 'Active Widget',
    isActive: true
  });

  const inactiveWidget = TestFixtures.createCompleteWidget('wt-1', {
    id: 'w-2',
    name: 'Inactive Widget',
    isActive: false
  });

  const defaultContext = {
    widgets: [activeWidget, inactiveWidget],
    widgetTypes: [],
    loading: false,
    error: null as string | null,
    refresh: vi.fn(),
    deleteWidget: vi.fn(),
    createWidget: vi.fn(),
    updateWidget: vi.fn(),
    getWidgetsByType: vi.fn(),
    getCacheStats: vi.fn()
  };

  const defaultActions = {
    createWidget: vi.fn(),
    updateWidget: vi.fn(),
    deleteWidget: vi.fn(),
    refresh: vi.fn(),
    getCacheStats: vi.fn(),
    clearCache: vi.fn(),
    invalidateWidgets: vi.fn(),
    invalidateWidgetTypes: vi.fn()
  };

  const renderList = () =>
    render(
      <MemoryRouter>
        <WidgetList />
      </MemoryRouter>
    );

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseWidgets.mockReturnValue(defaultContext);
    mockUseWidgetActions.mockReturnValue(defaultActions);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading and Error States', () => {
    it('shows loading state', () => {
      mockUseWidgets.mockReturnValue({ ...defaultContext, loading: true });
      renderList();
      expect(screen.getByText('Loading widgets...')).toBeInTheDocument();
    });

    it('shows error with retry button', () => {
      const refresh = vi.fn();
      mockUseWidgets.mockReturnValue({ ...defaultContext, error: 'Boom', refresh });
      renderList();
      expect(screen.getByText('Error loading widgets: Boom')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Retry'));
      expect(refresh).toHaveBeenCalled();
    });
  });

  describe('Summary', () => {
    it('shows calculated summary stats', async () => {
      renderList();
      await waitFor(() => {
        expect(screen.getByText('Summary')).toBeInTheDocument();

        const summary = screen.getByText('Summary').closest('.summary-card') as HTMLElement;

        const totalStat = within(summary).getByText('Total').closest('.stat') as HTMLElement;
        expect(within(totalStat).getByText('2')).toBeInTheDocument();

        const activeStat = within(summary)
          .getByText('Active', { selector: '.stat-label' })
          .closest('.stat') as HTMLElement;
        expect(within(activeStat).getByText('1')).toBeInTheDocument();

        const inactiveStat = within(summary).getByText('Inactive').closest('.stat') as HTMLElement;
        expect(within(inactiveStat).getByText('1')).toBeInTheDocument();

        const rateStat = within(summary).getByText('Active Rate').closest('.stat') as HTMLElement;
        expect(within(rateStat).getByText(/50\s*%/)).toBeInTheDocument();
      });
    });
  });

  describe('Filtering and Empty States', () => {
    it('shows only active widgets by default', async () => {
      renderList();
      // Only the active widget card should be present
      await waitFor(() => {
        expect(screen.getByText('Active Widget')).toBeInTheDocument();
        expect(screen.queryByText('Inactive Widget')).not.toBeInTheDocument();
      });
    });

    it('shows inactive when toggled', async () => {
      renderList();
      const checkbox = screen.getByLabelText('Show inactive widgets') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(screen.getByText('Inactive Widget')).toBeInTheDocument();
      });
    });

    it('shows empty active message when no active widgets', () => {
      const allInactive = [
        { ...inactiveWidget, id: 'w-3', name: 'Inactive A' },
        { ...inactiveWidget, id: 'w-4', name: 'Inactive B' }
      ];
      mockUseWidgets.mockReturnValue({ ...defaultContext, widgets: allInactive });

      renderList();
      expect(
        screen.getByText('No active widgets found. Try showing inactive widgets.')
      ).toBeInTheDocument();
    });

    it('shows generic empty message when showing inactive and list is empty', () => {
      mockUseWidgets.mockReturnValue({ ...defaultContext, widgets: [] });
      renderList();

      const checkbox = screen.getByLabelText('Show inactive widgets');
      fireEvent.click(checkbox);

      expect(screen.getByText('No widgets found.')).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('invokes refresh when Refresh button clicked', () => {
      const refresh = vi.fn();
      mockUseWidgets.mockReturnValue({ ...defaultContext, refresh });
      renderList();
      fireEvent.click(screen.getByText('Refresh'));
      expect(refresh).toHaveBeenCalled();
    });

    it('confirms and deletes widget on Delete', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const deleteWidget = vi.fn().mockResolvedValue(undefined);
      mockUseWidgetActions.mockReturnValue({ ...defaultActions, deleteWidget });

      renderList();

      // Only the active widget renders a Delete button
      const card = screen.getByText('Active Widget').closest('.widget-card') as HTMLElement;
      const deleteButton = within(card as HTMLElement).getByText('Delete');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete "Active Widget"?');
        expect(deleteWidget).toHaveBeenCalledWith('w-1');
      });

      confirmSpy.mockRestore();
    });

    it('does not delete when user cancels', () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
      const deleteWidget = vi.fn();
      mockUseWidgetActions.mockReturnValue({ ...defaultActions, deleteWidget });

      renderList();
      const card = screen.getByText('Active Widget').closest('.widget-card') as HTMLElement;
      fireEvent.click(within(card as HTMLElement).getByText('Delete'));

      expect(confirmSpy).toHaveBeenCalled();
      expect(deleteWidget).not.toHaveBeenCalled();
      confirmSpy.mockRestore();
    });

    it('alerts on delete failure', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });
      const deleteWidget = vi.fn().mockRejectedValue(new Error('fail'));
      mockUseWidgetActions.mockReturnValue({ ...defaultActions, deleteWidget });

      renderList();
      const card = screen.getByText('Active Widget').closest('.widget-card') as HTMLElement;
      fireEvent.click(within(card as HTMLElement).getByText('Delete'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Failed to delete widget. Please try again.');
      });

      confirmSpy.mockRestore();
      alertSpy.mockRestore();
    });
  });
});
