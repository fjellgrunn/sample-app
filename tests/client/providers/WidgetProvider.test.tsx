// @vitest-environment jsdom

import React, { ReactElement, useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRoot, Root } from 'react-dom/client';
import { act } from 'react';

// Mock the client cache layer to avoid IndexedDB/network
vi.mock('../../../src/client/cache/WidgetCache', () => {
  const state = {
    widgets: [] as any[],
    widgetTypes: [] as any[],
    idCounter: 1
  };

  const widgetCache = {
    operations: {
      all: vi.fn(async () => [null, [...state.widgets]]),
      create: vi.fn(async (partial: any) => {
        const newWidget = {
          id: String(state.idCounter++),
          isActive: true,
          ...partial
        };
        state.widgets.push(newWidget);
        return [null, newWidget];
      }),
      update: vi.fn(async (key: any, updates: any) => {
        const idx = state.widgets.findIndex((w) => w.id === key.pk);
        if (idx === -1) throw new Error('not found');
        state.widgets[idx] = { ...state.widgets[idx], ...updates };
        return [null, state.widgets[idx]];
      }),
      remove: vi.fn(async (key: any) => {
        state.widgets = state.widgets.filter((w) => w.id !== key.pk);
      }),
      reset: vi.fn(async () => {
        state.widgets = [];
      })
    },
    cacheMap: {
      clearQueryResults: vi.fn(),
      getCurrentSize: vi.fn(() => ({ numKeys: state.widgets.length, approxBytes: state.widgets.length * 100 }))
    },
    subscribe: vi.fn()
  };

  const widgetTypeCache = {
    operations: {
      all: vi.fn(async () => [null, [...state.widgetTypes]]),
      reset: vi.fn(async () => {
        state.widgetTypes = [];
      })
    },
    cacheMap: {
      clearQueryResults: vi.fn(),
      getCurrentSize: vi.fn(() => ({ numKeys: state.widgetTypes.length, approxBytes: state.widgetTypes.length * 100 }))
    },
    subscribe: vi.fn()
  };

  const cacheUtils = {
    clearAll: vi.fn(async () => {
      await widgetCache.operations.reset();
      await widgetTypeCache.operations.reset();
    }),
    invalidateWidgets: vi.fn(() => {
      widgetCache.cacheMap.clearQueryResults();
    }),
    invalidateWidgetTypes: vi.fn(() => {
      widgetTypeCache.cacheMap.clearQueryResults();
    }),
    getCacheStats: vi.fn(() => ({
      widget: widgetCache.cacheMap.getCurrentSize(),
      widgetType: widgetTypeCache.cacheMap.getCurrentSize()
    }))
  };

  return {
    widgetCache,
    widgetTypeCache,
    cacheUtils,
    // Expose internal state control for tests
    __mockState: state
  };
});

import { useWidget, useWidgetActions, useWidgets, useWidgetTypes, WidgetContextProvider } from '../../../src/client/providers/WidgetProvider';
import * as WidgetCacheModule from '../../../src/client/cache/WidgetCache';
const { __mockState, widgetCache, widgetTypeCache, cacheUtils } = WidgetCacheModule as any;

// Minimal helpers
const tick = () => new Promise((r) => setTimeout(r, 0));
const waitForCondition = async (predicate: () => boolean, timeoutMs = 1000, intervalMs = 5) => {
  const start = Date.now();

  while (true) {
    if (predicate()) return;
    if (Date.now() - start > timeoutMs) throw new Error('Timeout waiting for condition');
    // Give React time to flush microtasks and effects

    await tick();

    await new Promise((r) => setTimeout(r, intervalMs));
  }
};

let container: HTMLElement;
let root: Root;

beforeEach(() => {
  // Reset DOM
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);

  // Reset mock state before each test
  __mockState.widgets = [];
  __mockState.widgetTypes = [];
  __mockState.idCounter = 1;

  // Clear mock call histories
  vi.clearAllMocks();
});

afterEach(async () => {
  await act(async () => {
    root.unmount();
  });
  container.remove();
});

function render(element: ReactElement) {
  act(() => {
    root.render(element);
  });
}

describe('WidgetContextProvider basic load', () => {
  it('loads widgets and widget types on mount and exposes state', async () => {
    __mockState.widgetTypes = [
      { id: 't1', code: 'TYPE_ONE', name: 'Type One', isActive: true },
      { id: 't2', code: 'TYPE_TWO', name: 'Type Two', isActive: true }
    ];
    __mockState.widgets = [
      { id: 'w1', name: 'W1', widgetTypeId: 't1', isActive: true },
      { id: 'w2', name: 'W2', widgetTypeId: 't2', isActive: true }
    ];

    const snapshot: any = {};
    function Probe() {
      const ctx = useWidgets();
      useEffect(() => {
        snapshot.ctx = ctx;
      }, [ctx.widgets, ctx.widgetTypes, ctx.loading, ctx.error]);
      return null as any;
    }

    render(React.createElement(WidgetContextProvider, null, React.createElement(Probe)));

    await waitForCondition(() => snapshot.ctx && snapshot.ctx.loading === false);

    expect(snapshot.ctx).toBeDefined();
    expect(snapshot.ctx.loading).toBe(false);
    expect(snapshot.ctx.error).toBeNull();
    expect(snapshot.ctx.widgets.map((w: any) => w.id)).toEqual(['w1', 'w2']);
    expect(snapshot.ctx.widgetTypes.map((t: any) => t.id)).toEqual(['t1', 't2']);
    expect(typeof snapshot.ctx.getCacheStats).toBe('function');
  });
});

describe('WidgetContextProvider CRUD operations', () => {
  it('createWidget adds a widget', async () => {
    __mockState.widgetTypes = [{ id: 't1', code: 'TYPE_ONE', name: 'Type One', isActive: true }];

    const snapshot: any = {};
    function Probe() {
      const ctx = useWidgets();
      useEffect(() => {
        snapshot.ctx = ctx;
      }, [ctx.widgets]);
      return null as any;
    }

    render(React.createElement(WidgetContextProvider, null, React.createElement(Probe)));
    await waitForCondition(() => snapshot.ctx && snapshot.ctx.loading === false);

    await act(async () => {
      await snapshot.ctx.createWidget({ name: 'New', widgetTypeId: 't1', isActive: true });
    });
    await tick();

    expect(snapshot.ctx.widgets).toHaveLength(1);
    expect(snapshot.ctx.widgets[0]).toMatchObject({ name: 'New', widgetTypeId: 't1' });
  });

  it('updateWidget updates existing widget', async () => {
    __mockState.widgetTypes = [{ id: 't1', code: 'TYPE_ONE', name: 'Type One', isActive: true }];
    __mockState.widgets = [{ id: 'w1', name: 'Old', widgetTypeId: 't1', isActive: true }];

    const snapshot: any = {};
    function Probe() {
      const ctx = useWidgets();
      useEffect(() => {
        snapshot.ctx = ctx;
      }, [ctx.widgets]);
      return null as any;
    }

    render(React.createElement(WidgetContextProvider, null, React.createElement(Probe)));
    await waitForCondition(() => snapshot.ctx && snapshot.ctx.loading === false);

    await act(async () => {
      await snapshot.ctx.updateWidget('w1', { name: 'Updated' });
    });
    await tick();

    expect(snapshot.ctx.widgets.find((w: any) => w.id === 'w1')?.name).toBe('Updated');
  });

  it('deleteWidget removes widget from state', async () => {
    __mockState.widgetTypes = [{ id: 't1', code: 'TYPE_ONE', name: 'Type One', isActive: true }];
    __mockState.widgets = [
      { id: 'w1', name: 'A', widgetTypeId: 't1', isActive: true },
      { id: 'w2', name: 'B', widgetTypeId: 't1', isActive: true }
    ];

    const snapshot: any = {};
    function Probe() {
      const ctx = useWidgets();
      useEffect(() => {
        snapshot.ctx = ctx;
      }, [ctx.widgets]);
      return null as any;
    }

    render(React.createElement(WidgetContextProvider, null, React.createElement(Probe)));
    await waitForCondition(() => snapshot.ctx && snapshot.ctx.loading === false);

    await act(async () => {
      await snapshot.ctx.deleteWidget('w1');
    });
    await tick();

    expect(snapshot.ctx.widgets.map((w: any) => w.id)).toEqual(['w2']);
  });
});

describe('WidgetContextProvider helpers', () => {
  it('getWidgetsByType filters widgets', async () => {
    __mockState.widgetTypes = [
      { id: 't1', code: 'TYPE_ONE', name: 'Type One', isActive: true },
      { id: 't2', code: 'TYPE_TWO', name: 'Type Two', isActive: true }
    ];
    __mockState.widgets = [
      { id: 'w1', name: 'A', widgetTypeId: 't1', isActive: true },
      { id: 'w2', name: 'B', widgetTypeId: 't2', isActive: true },
      { id: 'w3', name: 'C', widgetTypeId: 't1', isActive: true }
    ];

    const snapshot: any = {};
    function Probe() {
      const ctx = useWidgets();
      useEffect(() => {
        snapshot.ctx = ctx;
      }, [ctx.widgets]);
      return null as any;
    }

    render(React.createElement(WidgetContextProvider, null, React.createElement(Probe)));
    await waitForCondition(() => snapshot.ctx && snapshot.ctx.loading === false);

    const filtered = snapshot.ctx.getWidgetsByType('t1');
    expect(filtered.map((w: any) => w.id)).toEqual(['w1', 'w3']);
  });

  it('useWidget exposes single item view and bound operations', async () => {
    __mockState.widgetTypes = [{ id: 't1', code: 'TYPE_ONE', name: 'Type One', isActive: true }];
    __mockState.widgets = [
      { id: 'w1', name: 'A', widgetTypeId: 't1', isActive: true },
      { id: 'w2', name: 'B', widgetTypeId: 't1', isActive: true }
    ];

    const snapshot: any = {};
    function Probe() {
      const w1 = useWidget('w1');
      useEffect(() => {
        snapshot.w1 = w1;
      }, [w1.widget]);
      return null as any;
    }

    render(React.createElement(WidgetContextProvider, null, React.createElement(Probe)));
    await waitForCondition(() => snapshot.w1 && snapshot.w1.widget !== undefined);
    expect(snapshot.w1.widget.name).toBe('A');

    await act(async () => {
      await snapshot.w1.update({ name: 'AA' });
    });
    await tick();
    expect(snapshot.w1.widget.name).toBe('AA');

    await act(async () => {
      await snapshot.w1.delete();
    });
    await tick();
    expect(snapshot.w1.widget).toBeUndefined();
  });

  it('useWidgetTypes exposes list and lookup', async () => {
    __mockState.widgetTypes = [
      { id: 't1', code: 'TYPE_ONE', name: 'Type One', isActive: true },
      { id: 't2', code: 'TYPE_TWO', name: 'Type Two', isActive: true }
    ];

    const snapshot: any = {};
    function Probe() {
      const wt = useWidgetTypes();
      useEffect(() => {
        snapshot.wt = wt;
      }, [wt.widgetTypes]);
      return null as any;
    }

    render(React.createElement(WidgetContextProvider, null, React.createElement(Probe)));
    await waitForCondition(() => snapshot.wt && snapshot.wt.widgetTypes.length === 2);

    expect(snapshot.wt.widgetTypes).toHaveLength(2);
    expect(snapshot.wt.getWidgetType('t2').name).toBe('Type Two');
  });

  it('useWidgetActions exposes actions and getCacheStats', async () => {
    __mockState.widgetTypes = [{ id: 't1', code: 'TYPE_ONE', name: 'Type One', isActive: true }];
    __mockState.widgets = [{ id: 'w1', name: 'A', widgetTypeId: 't1', isActive: true }];

    const snapshot: any = {};
    function Probe() {
      const actions = useWidgetActions();
      useEffect(() => {
        snapshot.actions = actions;
      }, [actions]);
      return null as any;
    }

    render(React.createElement(WidgetContextProvider, null, React.createElement(Probe)));
    await waitForCondition(() => snapshot.actions !== undefined);

    const stats = snapshot.actions.getCacheStats();
    expect(stats.widget.numKeys).toBe(1);
    expect(stats.widgetType.numKeys).toBe(1);

    await act(async () => {
      await snapshot.actions.clearCache();
    });

    expect(cacheUtils.clearAll).toHaveBeenCalledTimes(1);
    snapshot.actions.invalidateWidgets();
    snapshot.actions.invalidateWidgetTypes();
    expect(widgetCache.cacheMap.clearQueryResults).toHaveBeenCalledTimes(1);
    expect(widgetTypeCache.cacheMap.clearQueryResults).toHaveBeenCalledTimes(1);
  });
});

describe('WidgetContextProvider refresh and error handling', () => {
  it('refresh reloads from cache', async () => {
    __mockState.widgetTypes = [{ id: 't1', code: 'TYPE_ONE', name: 'Type One', isActive: true }];
    __mockState.widgets = [{ id: 'w1', name: 'A', widgetTypeId: 't1', isActive: true }];

    const snapshot: any = {};
    function Probe() {
      const ctx = useWidgets();
      useEffect(() => {
        snapshot.ctx = ctx;
      }, [ctx.widgets]);
      return null as any;
    }

    render(React.createElement(WidgetContextProvider, null, React.createElement(Probe)));
    await waitForCondition(() => snapshot.ctx && snapshot.ctx.loading === false);
    expect(snapshot.ctx.widgets.map((w: any) => w.id)).toEqual(['w1']);

    // Change underlying data and refresh
    __mockState.widgets = [{ id: 'w2', name: 'B', widgetTypeId: 't1', isActive: true }];

    await act(async () => {
      await snapshot.ctx.refresh();
    });
    await waitForCondition(() => snapshot.ctx.widgets.length === 1 && snapshot.ctx.widgets[0].id === 'w2');

    expect(snapshot.ctx.widgets.map((w: any) => w.id)).toEqual(['w2']);
  });

  it('sets error when cache throws and stops loading', async () => {
    // Make the next call to all() throw
    (widgetCache.operations.all as any).mockImplementationOnce(async () => {
      throw new Error('Boom');
    });

    const snapshot: any = {};
    function Probe() {
      const ctx = useWidgets();
      useEffect(() => {
        snapshot.ctx = ctx;
      }, [ctx.loading, ctx.error]);
      return null as any;
    }

    render(React.createElement(WidgetContextProvider, null, React.createElement(Probe)));
    await waitForCondition(() => snapshot.ctx && snapshot.ctx.loading === false);

    expect(snapshot.ctx.loading).toBe(false);
    expect(snapshot.ctx.error).toBe('Boom');
  });
});
