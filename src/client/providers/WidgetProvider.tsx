import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import type { Widget } from '../../model/Widget';
import type { WidgetType } from '../../model/WidgetType';
import { cacheUtils, widgetCache, widgetTypeCache } from '../lib/WidgetCache';
import { PriKey } from '@fjell/core';

interface WidgetContextType {
  widgets: Widget[];
  widgetTypes: WidgetType[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  deleteWidget: (id: string) => Promise<void>;
  createWidget: (widget: Partial<Widget>) => Promise<Widget>;
  updateWidget: (id: string, updates: Partial<Widget>) => Promise<Widget>;
  getWidgetsByType: (typeId: string) => Widget[];
  getCacheStats: () => any;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

interface WidgetProviderProps {
  children: ReactNode;
}

export const WidgetContextProvider: React.FC<WidgetProviderProps> = ({ children }) => {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [widgetTypes, setWidgetTypes] = useState<WidgetType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load widgets and widget types through cache (which will fetch from API if not cached)
      const [, widgetData] = await widgetCache.operations.all();
      const [, widgetTypeData] = await widgetTypeCache.operations.all();

      setWidgets(widgetData);
      setWidgetTypes(widgetTypeData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error loading widget data:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteWidget = async (id: string) => {
    try {
      const widgetKey: PriKey<'widget'> = { kt: 'widget', pk: id };
      await widgetCache.operations.remove(widgetKey);

      // Update local state
      setWidgets(prev => prev.filter(widget => widget.id !== id));
    } catch (err) {
      console.error('Error deleting widget:', err);
      throw err;
    }
  };

  const createWidget = async (widget: Partial<Widget>): Promise<Widget> => {
    try {
      const [, newWidget] = await widgetCache.operations.create(widget);

      // Update local state
      setWidgets(prev => [...prev, newWidget]);
      return newWidget;
    } catch (err) {
      console.error('Error creating widget:', err);
      throw err;
    }
  };

  const updateWidget = async (id: string, updates: Partial<Widget>): Promise<Widget> => {
    try {
      const widgetKey: PriKey<'widget'> = { kt: 'widget', pk: id };
      const [, updatedWidget] = await widgetCache.operations.update(widgetKey, updates);

      // Update local state
      setWidgets(prev => prev.map(w => w.id === id ? updatedWidget : w));
      return updatedWidget;
    } catch (err) {
      console.error('Error updating widget:', err);
      throw err;
    }
  };

  const getWidgetsByType = (typeId: string): Widget[] => {
    return widgets.filter(widget => widget.widgetTypeId === typeId);
  };

  useEffect(() => {
    loadData();
  }, []);

  const value: WidgetContextType = {
    widgets,
    widgetTypes,
    loading,
    error,
    refresh: loadData,
    deleteWidget,
    createWidget,
    updateWidget,
    getWidgetsByType,
    getCacheStats: cacheUtils.getCacheStats
  };

  return (
    <WidgetContext.Provider value={value}>
      {children}
    </WidgetContext.Provider>
  );
};

// Hook to use the widget context
export const useWidgets = () => {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error('useWidgets must be used within a WidgetContextProvider');
  }
  return context;
};

// Hook for individual widget operations
export const useWidget = (id: string) => {
  const { widgets, updateWidget, deleteWidget } = useWidgets();
  const widget = widgets.find(w => w.id === id);

  return {
    widget,
    update: (updates: Partial<Widget>) => updateWidget(id, updates),
    delete: () => deleteWidget(id)
  };
};

// Hook for widget type operations
export const useWidgetTypes = () => {
  const { widgetTypes, getWidgetsByType } = useWidgets();

  return {
    widgetTypes,
    getWidgetsByType,
    getWidgetType: (id: string) => widgetTypes.find(wt => wt.id === id)
  };
};

// Hook for widget management actions
export const useWidgetActions = () => {
  const { createWidget, updateWidget, deleteWidget, refresh, getCacheStats } = useWidgets();

  return {
    createWidget,
    updateWidget,
    deleteWidget,
    refresh,
    getCacheStats,
    clearCache: cacheUtils.clearAll,
    invalidateWidgets: cacheUtils.invalidateWidgets,
    invalidateWidgetTypes: cacheUtils.invalidateWidgetTypes
  };
};
