// @vitest-environment jsdom

import React from 'react';
import { describe, expect, it, vi } from 'vitest';

// Mock the API layer following the pattern from WidgetCache.test.tsx
vi.mock('../../../src/client/api/WidgetAPI', () => ({
  widgetApi: {
    all: vi.fn().mockResolvedValue([]),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn()
  },
  widgetTypeApi: {
    all: vi.fn().mockResolvedValue([]),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn()
  }
}));

// Mock the entire @fjell/providers module to avoid React version conflicts
vi.mock('@fjell/providers', () => ({
  PItemAdapter: {
    Adapter: vi.fn(({ children }) => children),
    usePItemAdapter: vi.fn(() => ({
      name: 'test',
      cacheMap: {},
      pkTypes: ['test'],
      all: vi.fn(),
      one: vi.fn(),
      create: vi.fn(),
      get: vi.fn(),
      remove: vi.fn(),
      retrieve: vi.fn(),
      update: vi.fn(),
      action: vi.fn(),
      allAction: vi.fn(),
      facet: vi.fn(),
      allFacet: vi.fn(),
      find: vi.fn(),
      findOne: vi.fn(),
      set: vi.fn()
    }))
  },
  PItem: {
    usePItem: vi.fn(() => ({ id: 'test' }))
  },
  PItems: {
    usePItems: vi.fn(() => ({ items: [], loading: false, error: null }))
  },
  PItemLoad: vi.fn(({ children }) => children),
  PItemQuery: vi.fn(({ children }) => children),
  PItemsQuery: vi.fn(({ children }) => children)
}));

// Mock the cache modules to return simple mock implementations
vi.mock('../../../src/client/cache', () => ({
  widgetCache: {
    coordinate: { kta: ['widget'] },
    subscribe: vi.fn(),
    operations: {
      all: vi.fn().mockResolvedValue([null, []]),
      reset: vi.fn().mockResolvedValue(null)
    },
    getCacheInfo: vi.fn().mockReturnValue({}),
    cacheMap: {
      clearQueryResults: vi.fn()
    }
  },
  widgetTypeCache: {
    coordinate: { kta: ['widgetType'] },
    subscribe: vi.fn(),
    operations: {
      all: vi.fn().mockResolvedValue([null, []]),
      reset: vi.fn().mockResolvedValue(null)
    },
    getCacheInfo: vi.fn().mockReturnValue({}),
    cacheMap: {
      clearQueryResults: vi.fn()
    }
  }
}));

import { useWidget, useWidgets } from '../../../src/client/providers/WidgetProvider';
import { useWidgetTypes } from '../../../src/client/providers/WidgetTypeProvider';
import { RootAdapters } from '../../../src/client/providers/RootAdapters';

describe('Widget Providers Integration', () => {
  it('provider modules can be imported without errors', () => {
    // Simple test that modules import correctly
    expect(useWidget).toBeDefined();
    expect(useWidgets).toBeDefined();
    expect(useWidgetTypes).toBeDefined();
    expect(RootAdapters).toBeDefined();
  });

  it('hooks are properly exported as functions', () => {
    // Verify the hooks are functions
    expect(typeof useWidget).toBe('function');
    expect(typeof useWidgets).toBe('function');
    expect(typeof useWidgetTypes).toBe('function');
  });

  it('RootAdapters component is properly exported', () => {
    // Verify RootAdapters is a React component
    expect(typeof RootAdapters).toBe('function');
    expect(RootAdapters.name).toBe('RootAdapters');
  });
});
