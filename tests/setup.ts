// Import vi and expect from vitest for the mocks below
import { expect, vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock matchMedia for jsdom environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.alert for tests
Object.defineProperty(window, 'alert', {
  writable: true,
  value: vi.fn(),
});

// Mock window.confirm for tests
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: vi.fn(),
});

// Mock indexedDB for tests (prevents cache errors in Node.js environment)
const mockIndexedDB = {
  open: vi.fn().mockImplementation(() => ({
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    result: {
      objectStoreNames: { contains: vi.fn(() => false) },
      createObjectStore: vi.fn(),
      transaction: vi.fn(() => ({
        objectStore: vi.fn(() => ({
          get: vi.fn(() => ({ addEventListener: vi.fn() })),
          put: vi.fn(() => ({ addEventListener: vi.fn() })),
          delete: vi.fn(() => ({ addEventListener: vi.fn() })),
          clear: vi.fn(() => ({ addEventListener: vi.fn() })),
          getAllKeys: vi.fn(() => ({ addEventListener: vi.fn() })),
        })),
      })),
    },
    onsuccess: null,
    onerror: null,
  })),
  deleteDatabase: vi.fn(),
};

Object.defineProperty(window, 'indexedDB', {
  writable: true,
  value: mockIndexedDB,
});

// Also define it globally for Node.js environment
global.indexedDB = mockIndexedDB;
