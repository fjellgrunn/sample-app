// @vitest-environment jsdom

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WidgetPage } from '../../../src/client/components/WidgetPage';
import { TestFixtures } from '../../helpers/testFixtures';

// Mock Next.js router
const mockPush = vi.fn();
const mockBack = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: mockBack,
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

// Mock WidgetProvider
const mockWidget = TestFixtures.createCompleteWidget('type1', {
  id: 'w1',
  name: 'Test Widget',
  description: 'A test widget',
  isActive: true
});

vi.mock('../../../src/client/providers/WidgetProvider', () => ({
  useWidget: () => ({
    item: mockWidget,
    isLoading: false,
    error: null
  }),
  useWidgets: () => ({
    items: [mockWidget],
    isLoading: false,
    error: null
  })
}));

// Mock the API
vi.mock('../../../src/client/api/WidgetAPI', () => ({
  widgetApi: {
    get: vi.fn()
  }
}));

describe('WidgetPage', () => {
  it('renders widget page successfully', () => {
    render(<WidgetPage widgetId="w1" />);

    // Just check that it renders without crashing and shows the widget name
    expect(screen.getByText('Test Widget')).toBeInTheDocument();
  });

  it('shows back button', () => {
    render(<WidgetPage widgetId="w1" />);

    const backButton = screen.getByText('← Back to Widgets');
    expect(backButton).toBeInTheDocument();
  });
});
