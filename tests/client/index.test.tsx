import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';

// Path to the module under test
const clientIndexModulePath = '../../src/client/index.tsx';

describe('client entrypoint (src/client/index.tsx)', () => {
  beforeEach(() => {
    // Ensure a clean DOM and fresh module state for each test
    document.body.innerHTML = '';
    vi.clearAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('creates a React root and renders <App /> when #root exists', async () => {
    const container = document.createElement('div');
    container.id = 'root';
    document.body.appendChild(container);

    const renderSpy = vi.fn();
    const createRootSpy = vi.fn(() => ({ render: renderSpy }));

    // Mock react-dom/client before importing the module under test
    vi.doMock('react-dom/client', () => ({
      default: undefined,
      createRoot: createRootSpy,
    }));

    // Import App to validate the element passed to render
    const { App } = await import('../../src/client/components/App');

    // Import the module under test (executes side effects)
    await import(clientIndexModulePath);

    expect(createRootSpy).toHaveBeenCalledTimes(1);
    expect(createRootSpy).toHaveBeenCalledWith(container);
    expect(renderSpy).toHaveBeenCalledTimes(1);

    const renderedArg = renderSpy.mock.calls[0][0] as unknown as React.ReactElement;
    expect(React.isValidElement(renderedArg)).toBe(true);
    expect(renderedArg.type).toBe(App);
  });

  it('throws an error when #root is missing', async () => {
    // No #root element added
    vi.doMock('react-dom/client', () => ({
      default: undefined,
      createRoot: vi.fn(() => ({ render: vi.fn() })),
    }));

    await expect(import(clientIndexModulePath)).rejects.toThrow('Root element not found');
  });
});
