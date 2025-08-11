// @vitest-environment jsdom

import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn()
  })
}));

// Mock WidgetTypeProvider
const mockWidgetTypes = [
  { id: 'type1', name: 'Basic Widget', code: 'BASIC' },
  { id: 'type2', name: 'Advanced Widget', code: 'ADV' }
];

vi.mock('../../../src/client/providers/WidgetTypeProvider', () => ({
  useWidgetTypes: () => ({
    items: mockWidgetTypes,
    loading: false,
    error: null
  })
}));

import { WidgetCard } from '../../../src/client/components/WidgetCard';

let container: HTMLElement;
let root: Root;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  vi.clearAllMocks();
});

afterEach(async () => {
  await act(async () => {
    root.unmount();
  });
  container.remove();
});

function render(element: React.ReactElement) {
  act(() => {
    root.render(element);
  });
}

describe('WidgetCard', () => {
  it('renders basic widget info and status', () => {
    const widget = {
      id: 'w1',
      widgetTypeId: 't1',
      name: 'Test Widget',
      description: 'A sample widget',
      isActive: true,
      data: { foo: 'bar' },
      createdAt: new Date('2024-01-02T00:00:00Z'),
      updatedAt: new Date('2024-01-03T00:00:00Z')
    } as any;

    render(React.createElement(WidgetCard, { widget }));

    // Name
    expect(container.querySelector('.widget-name')?.textContent).toBe('Test Widget');
    // Status badge
    const status = container.querySelector('.status-badge');
    expect(status?.textContent).toBe('Active');
    expect(status?.className).toContain('active');
    // ID and type ID
    expect(container.textContent).toContain('w1');
    expect(container.textContent).toContain('t1');
    // Description
    expect(container.textContent).toContain('A sample widget');
    // Data section and content
    expect(container.textContent).toContain('Data:');
    expect(container.textContent).toContain('foo');

    // Dates (compare using same locale formatting the component uses)
    const createdStr = new Date(widget.createdAt).toLocaleDateString();
    const updatedStr = new Date(widget.updatedAt).toLocaleDateString();
    expect(container.textContent).toContain(createdStr);
    expect(container.textContent).toContain(updatedStr);
  });

  it('navigates to detail view on card click', () => {
    const widget = {
      id: 'w2',
      widgetTypeId: 't1',
      name: 'Clickable',
      isActive: true
    } as any;

    render(React.createElement(WidgetCard, { widget }));

    const card = container.querySelector('.widget-card') as HTMLElement;
    act(() => {
      card.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(mockPush).toHaveBeenCalledWith('/widget/w2');
  });

  it('Edit button calls onEdit and does not navigate', () => {
    const widget = {
      id: 'w3',
      widgetTypeId: 't1',
      name: 'Editable',
      isActive: true
    } as any;
    const onEdit = vi.fn();

    render(React.createElement(WidgetCard, { widget, onEdit }));

    const editBtn = container.querySelector('.btn.btn-primary') as HTMLElement;
    expect(editBtn).toBeTruthy();

    act(() => {
      editBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 'w3' }));
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('Delete button appears only for active widgets and calls onDelete', () => {
    const activeWidget = { id: 'w4', widgetTypeId: 't1', name: 'Deletable', isActive: true } as any;
    const onDelete = vi.fn();

    render(React.createElement(WidgetCard, { widget: activeWidget, onDelete }));
    const delBtn = container.querySelector('.btn.btn-danger') as HTMLElement;
    expect(delBtn).toBeTruthy();

    act(() => {
      delBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(expect.objectContaining({ id: 'w4' }));
    expect(mockPush).not.toHaveBeenCalled();

    // Inactive widget should not render Delete button
    const inactiveWidget = { id: 'w5', widgetTypeId: 't1', name: 'NoDelete', isActive: false } as any;
    act(() => {
      root.render(React.createElement(WidgetCard, { widget: inactiveWidget, onDelete }));
    });
    const noDel = container.querySelector('.btn.btn-danger') as HTMLElement | null;
    expect(noDel).toBeNull();
  });
});
