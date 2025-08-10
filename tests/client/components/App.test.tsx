import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../../../src/client/components/App';

// Mock the child components to avoid complex dependencies
vi.mock('../../../src/client/components/WidgetList', () => ({
  WidgetList: () => <div data-testid="widget-list">Widget List Component</div>
}));

vi.mock('../../../src/client/components/WidgetPage', () => ({
  WidgetPage: () => <div data-testid="widget-page">Widget Page Component</div>
}));

// Mock the WidgetProvider to avoid cache/API dependencies
vi.mock('../../../src/client/providers/WidgetProvider', () => ({
  WidgetContextProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="widget-provider">{children}</div>
  ),
  WidgetAdapter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="widget-adapter">{children}</div>
  )
}));

// Mock the WidgetTypeProvider to avoid cache/API dependencies
vi.mock('../../../src/client/providers/WidgetTypeProvider', () => ({
  WidgetTypeAdapter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="widget-type-adapter">{children}</div>
  )
}));

// Mock react-router-dom to control routing behavior in tests
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');

  // Create a simple mock that renders based on current path
  const mockCurrentPath = vi.fn(() => '/');

  return {
    ...actual,
    BrowserRouter: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="browser-router">{children}</div>
    ),
    Routes: ({ children }: { children: React.ReactNode }) => {
      // Simulate route matching based on current path
      const path = mockCurrentPath();
      const routeElement = path.startsWith('/widget/') ?
        <div data-testid="widget-page">Widget Page Component</div> :
        <div data-testid="widget-list">Widget List Component</div>;

      return <div data-testid="routes">{routeElement}</div>;
    },
    Route: ({ element }: { path?: string; element: React.ReactNode }) => element,
    // Export the mock function so we can control it in tests
    __setMockPath: mockCurrentPath
  };
});

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderApp = () => {
    return render(<App />);
  };

  it('renders without crashing', () => {
    renderApp();
    expect(screen.getByText('Fjell Sample App')).toBeInTheDocument();
  });

  it('displays the main header content', () => {
    renderApp();

    expect(screen.getByText('Fjell Sample App')).toBeInTheDocument();
    expect(screen.getByText('Widget Management System')).toBeInTheDocument();
  });

  it('displays the footer content', () => {
    renderApp();

    expect(screen.getByText('Built with Fjell Framework')).toBeInTheDocument();
  });

  it('has the correct app structure with header, main, and footer', () => {
    renderApp();

    const appDiv = screen.getByText('Fjell Sample App').closest('.app');
    expect(appDiv).toBeInTheDocument();

    const header = screen.getByRole('banner');
    expect(header).toHaveClass('app-header');

    const main = screen.getByRole('main');
    expect(main).toHaveClass('app-main');

    const footer = screen.getByText('Built with Fjell Framework').closest('.app-footer');
    expect(footer).toBeInTheDocument();
  });

  it('wraps content with RootAdapters (WidgetAdapter and WidgetTypeAdapter)', () => {
    renderApp();

    expect(screen.getByTestId('widget-adapter')).toBeInTheDocument();
    expect(screen.getByTestId('widget-type-adapter')).toBeInTheDocument();
  });

  it('includes BrowserRouter for routing', () => {
    renderApp();

    expect(screen.getByTestId('browser-router')).toBeInTheDocument();
  });

  it('includes Routes component', () => {
    renderApp();

    expect(screen.getByTestId('routes')).toBeInTheDocument();
  });

  it('renders WidgetList component by default (simulating root path)', () => {
    renderApp();

    expect(screen.getByTestId('widget-list')).toBeInTheDocument();
  });

  describe('Component Structure', () => {
    it('has the correct class names for styling', () => {
      renderApp();

      const appContainer = screen.getByText('Fjell Sample App').closest('.app');
      expect(appContainer).toBeInTheDocument();

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('app-header');

      const main = screen.getByRole('main');
      expect(main).toHaveClass('app-main');
    });

    it('contains all required child components in the correct order', () => {
      const { container } = renderApp();

      const app = container.querySelector('.app');
      const children = Array.from(app?.children || []);

      // Should have header, main, footer in that order
      expect(children).toHaveLength(3);
      expect(children[0]).toHaveClass('app-header');
      expect(children[1]).toHaveClass('app-main');
      expect(children[2]).toHaveClass('app-footer');
    });

    it('has proper semantic HTML structure', () => {
      renderApp();

      // Check for semantic HTML elements
      expect(screen.getByRole('banner')).toBeInTheDocument(); // header
      expect(screen.getByRole('main')).toBeInTheDocument(); // main
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument(); // h1
    });
  });

  describe('Content Verification', () => {
    it('displays the correct header text', () => {
      renderApp();

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent('Fjell Sample App');

      const subtitle = screen.getByText('Widget Management System');
      expect(subtitle).toBeInTheDocument();
    });

    it('displays the correct footer text', () => {
      renderApp();

      const footerText = screen.getByText('Built with Fjell Framework');
      expect(footerText).toBeInTheDocument();
      expect(footerText.closest('.app-footer')).toBeInTheDocument();
    });
  });
});
