import { afterEach, beforeEach } from 'vitest';
import { TestDatabase } from './testDatabase';

/**
 * Test utilities and common setup functions
 */

/**
 * Setup function for tests that need a clean database
 */
export function setupTestDatabase() {
  let testDb: TestDatabase;

  beforeEach(async () => {
    testDb = await TestDatabase.createFresh();
  });

  afterEach(async () => {
    if (testDb) {
      await testDb.cleanup();
    }
  });

  return () => testDb;
}

/**
 * Setup function for tests that need a database with seed data
 */
export function setupTestDatabaseWithData() {
  let testDb: TestDatabase;

  beforeEach(async () => {
    testDb = await TestDatabase.createWithData();
  });

  afterEach(async () => {
    if (testDb) {
      await testDb.cleanup();
    }
  });

  return () => testDb;
}

/**
 * Utility to wait for a condition to be true
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeout = 5000,
  interval = 100
): Promise<void> {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  throw new Error(`Condition not met within ${timeout}ms`);
}

/**
 * Utility to create a promise that resolves after a delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Utility to assert that an async function throws
 */
export async function expectThrows(
  fn: () => Promise<any>,
  expectedError?: string | RegExp | typeof Error
): Promise<Error> {
  try {
    await fn();
    // Return a rejected promise so callers using `await expect(...).rejects` work correctly
    return Promise.reject(new Error('Expected function to throw, but it did not')) as never;
  } catch (error) {
    if (expectedError) {
      if (typeof expectedError === 'string') {
        if (!(error instanceof Error) || !error.message.includes(expectedError)) {
          throw new Error(`Expected error to contain "${expectedError}", but got: ${error instanceof Error ? error.message : error}`);
        }
      } else if (expectedError instanceof RegExp) {
        if (!(error instanceof Error) || !expectedError.test(error.message)) {
          throw new Error(`Expected error to match ${expectedError}, but got: ${error instanceof Error ? error.message : error}`);
        }
      } else if (typeof expectedError === 'function') {
        if (!(error instanceof expectedError)) {
          throw new Error(`Expected error to be instance of ${expectedError.name}, but got: ${error}`);
        }
      }
    }
    return error as Error;
  }
}

/**
 * Utility to capture console output during test execution
 */
export function captureConsole() {
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  const logs: string[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  console.log = (...args) => logs.push(args.join(' '));
  console.error = (...args) => errors.push(args.join(' '));
  console.warn = (...args) => warnings.push(args.join(' '));

  return {
    logs,
    errors,
    warnings,
    restore: () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    }
  };
}

/**
 * Memory usage formatter for test results [[memory:3807185]]
 */
export function formatMemoryUsage(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} kB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Get current memory usage
 */
export function getMemoryUsage() {
  const usage = process.memoryUsage();
  return {
    rss: formatMemoryUsage(usage.rss),
    heapTotal: formatMemoryUsage(usage.heapTotal),
    heapUsed: formatMemoryUsage(usage.heapUsed),
    external: formatMemoryUsage(usage.external)
  };
}
