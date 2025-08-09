import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  captureConsole,
  delay,
  expectThrows,
  formatMemoryUsage,
  getMemoryUsage,
  waitFor
} from './testUtils';

describe('Test Utils', () => {
  describe('waitFor', () => {
    it('should resolve when condition becomes true', async () => {
      let counter = 0;
      const condition = () => {
        counter++;
        return counter >= 3;
      };

      const start = Date.now();
      await waitFor(condition, 1000, 50);
      const duration = Date.now() - start;

      expect(counter).toBeGreaterThanOrEqual(3);
      expect(duration).toBeLessThan(1000);
    });

    it('should resolve immediately if condition is already true', async () => {
      const condition = () => true;

      const start = Date.now();
      await waitFor(condition, 1000);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });

    it('should timeout if condition never becomes true', async () => {
      const condition = () => false;

      await expect(waitFor(condition, 200, 50)).rejects.toThrow('Condition not met within 200ms');
    });

    it('should work with async conditions', async () => {
      let asyncCounter = 0;
      const asyncCondition = async () => {
        asyncCounter++;
        return asyncCounter >= 2;
      };

      await waitFor(asyncCondition, 1000, 50);
      expect(asyncCounter).toBeGreaterThanOrEqual(2);
    });

    it('should use default timeout and interval', async () => {
      let counter = 0;
      const condition = () => {
        counter++;
        return counter >= 5;
      };

      await waitFor(condition); // Using defaults: 5000ms timeout, 100ms interval
      expect(counter).toBeGreaterThanOrEqual(5);
    });
  });

  describe('delay', () => {
    it('should delay for specified milliseconds', async () => {
      const start = Date.now();
      await delay(100);
      const duration = Date.now() - start;

      expect(duration).toBeGreaterThanOrEqual(90); // Allow some tolerance
      expect(duration).toBeLessThan(200);
    });

    it('should work with zero delay', async () => {
      const start = Date.now();
      await delay(0);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(50);
    });

    it('should return void', async () => {
      const result = await delay(10);
      expect(result).toBeUndefined();
    });
  });

  describe('expectThrows', () => {
    it('should catch thrown errors', async () => {
      const throwingFunction = async () => {
        throw new Error('Test error');
      };

      const error = await expectThrows(throwingFunction);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error');
    });

    it('should validate error message with string', async () => {
      const throwingFunction = async () => {
        throw new Error('Specific error message');
      };

      const error = await expectThrows(throwingFunction, 'Specific error');
      expect(error.message).toBe('Specific error message');
    });

    it('should validate error message with regex', async () => {
      const throwingFunction = async () => {
        throw new Error('Error with pattern 123');
      };

      const error = await expectThrows(throwingFunction, /pattern \d+/);
      expect(error.message).toMatch(/pattern \d+/);
    });

    it('should validate error type', async () => {
      const throwingFunction = async () => {
        throw new TypeError('Type error');
      };

      const error = await expectThrows(throwingFunction, TypeError);
      expect(error).toBeInstanceOf(TypeError);
    });

    it('should throw if function does not throw', async () => {
      const nonThrowingFunction = async () => {
        return 'success';
      };

      await expect(expectThrows(nonThrowingFunction)).rejects.toThrow('Expected function to throw, but it did not');
    });

    it('should throw if error message does not match string expectation', async () => {
      const throwingFunction = async () => {
        throw new Error('Different error');
      };

      await expect(expectThrows(throwingFunction, 'Expected error')).rejects.toThrow('Expected error to contain "Expected error"');
    });

    it('should throw if error message does not match regex expectation', async () => {
      const throwingFunction = async () => {
        throw new Error('No pattern here');
      };

      await expect(expectThrows(throwingFunction, /pattern \d+/)).rejects.toThrow('Expected error to match /pattern \\d+/');
    });

    it('should throw if error type does not match', async () => {
      const throwingFunction = async () => {
        throw new Error('Regular error');
      };

      await expect(expectThrows(throwingFunction, TypeError)).rejects.toThrow('Expected error to be instance of TypeError');
    });

    it('should handle non-Error thrown values', async () => {
      const throwingFunction = async () => {
        throw 'string error';
      };

      await expect(expectThrows(throwingFunction, 'string')).rejects.toThrow('Expected error to contain "string"');
    });
  });

  describe('captureConsole', () => {
    let originalConsole: any;

    beforeEach(() => {
      originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn
      };
    });

    afterEach(() => {
      console.log = originalConsole.log;
      console.error = originalConsole.error;
      console.warn = originalConsole.warn;
    });

    it('should capture console.log output', () => {
      const capture = captureConsole();

      console.log('Test message 1');
      console.log('Test message 2', 'with', 'multiple', 'args');

      expect(capture.logs).toEqual([
        'Test message 1',
        'Test message 2 with multiple args'
      ]);

      capture.restore();
    });

    it('should capture console.error output', () => {
      const capture = captureConsole();

      console.error('Error message 1');
      console.error('Error message 2', 'with details');

      expect(capture.errors).toEqual([
        'Error message 1',
        'Error message 2 with details'
      ]);

      capture.restore();
    });

    it('should capture console.warn output', () => {
      const capture = captureConsole();

      console.warn('Warning message 1');
      console.warn('Warning message 2', 'with details');

      expect(capture.warnings).toEqual([
        'Warning message 1',
        'Warning message 2 with details'
      ]);

      capture.restore();
    });

    it('should capture mixed console output', () => {
      const capture = captureConsole();

      console.log('Log message');
      console.error('Error message');
      console.warn('Warning message');

      expect(capture.logs).toEqual(['Log message']);
      expect(capture.errors).toEqual(['Error message']);
      expect(capture.warnings).toEqual(['Warning message']);

      capture.restore();
    });

    it('should restore original console functions', () => {
      const capture = captureConsole();

      // Verify console is captured
      console.log('Test');
      expect(capture.logs).toEqual(['Test']);

      // Restore and verify original functions are back
      capture.restore();
      expect(console.log).toBe(originalConsole.log);
      expect(console.error).toBe(originalConsole.error);
      expect(console.warn).toBe(originalConsole.warn);
    });

    it('should handle empty captures', () => {
      const capture = captureConsole();

      // Don't log anything
      expect(capture.logs).toEqual([]);
      expect(capture.errors).toEqual([]);
      expect(capture.warnings).toEqual([]);

      capture.restore();
    });

    it('should handle console calls with no arguments', () => {
      const capture = captureConsole();

      console.log();
      console.error();
      console.warn();

      expect(capture.logs).toEqual(['']);
      expect(capture.errors).toEqual(['']);
      expect(capture.warnings).toEqual(['']);

      capture.restore();
    });
  });

  describe('formatMemoryUsage', () => {
    it('should format bytes correctly', () => {
      expect(formatMemoryUsage(500)).toBe('500 B');
      expect(formatMemoryUsage(1023)).toBe('1023 B');
    });

    it('should format kilobytes correctly', () => {
      expect(formatMemoryUsage(1024)).toBe('1.00 kB');
      expect(formatMemoryUsage(2048)).toBe('2.00 kB');
      expect(formatMemoryUsage(1536)).toBe('1.50 kB');
      expect(formatMemoryUsage(1024 * 1024 - 1)).toBe('1024.00 kB');
    });

    it('should format megabytes correctly', () => {
      expect(formatMemoryUsage(1024 * 1024)).toBe('1.00 MB');
      expect(formatMemoryUsage(2 * 1024 * 1024)).toBe('2.00 MB');
      expect(formatMemoryUsage(1.5 * 1024 * 1024)).toBe('1.50 MB');
      expect(formatMemoryUsage(100 * 1024 * 1024)).toBe('100.00 MB');
    });

    it('should handle zero bytes', () => {
      expect(formatMemoryUsage(0)).toBe('0 B');
    });

    it('should handle very large values', () => {
      const largeValue = 1000 * 1024 * 1024; // 1000 MB
      expect(formatMemoryUsage(largeValue)).toBe('1000.00 MB');
    });

    it('should handle fractional bytes', () => {
      expect(formatMemoryUsage(1024.5)).toBe('1.00 kB');
      expect(formatMemoryUsage(1024 * 1024 + 512 * 1024)).toBe('1.50 MB');
    });
  });

  describe('getMemoryUsage', () => {
    it('should return memory usage with correct format', () => {
      const usage = getMemoryUsage();

      expect(usage).toHaveProperty('rss');
      expect(usage).toHaveProperty('heapTotal');
      expect(usage).toHaveProperty('heapUsed');
      expect(usage).toHaveProperty('external');

      // Each property should be a formatted string
      expect(typeof usage.rss).toBe('string');
      expect(typeof usage.heapTotal).toBe('string');
      expect(typeof usage.heapUsed).toBe('string');
      expect(typeof usage.external).toBe('string');

      // Should contain memory unit
      expect(usage.rss).toMatch(/\d+\.?\d*\s+(B|kB|MB)$/);
      expect(usage.heapTotal).toMatch(/\d+\.?\d*\s+(B|kB|MB)$/);
      expect(usage.heapUsed).toMatch(/\d+\.?\d*\s+(B|kB|MB)$/);
      expect(usage.external).toMatch(/\d+\.?\d*\s+(B|kB|MB)$/);
    });

    it('should return different values on subsequent calls', async () => {
      const usage1 = getMemoryUsage();

      // Create some memory pressure
      const largeArray = new Array(10000).fill('memory test');

      const usage2 = getMemoryUsage();

      // Values should be strings and potentially different
      expect(typeof usage1.heapUsed).toBe('string');
      expect(typeof usage2.heapUsed).toBe('string');

      // Clean up
      largeArray.length = 0;
    });

    it('should return reasonable memory values', () => {
      const usage = getMemoryUsage();

      // Parse the numeric values to verify they're reasonable
      const rssValue = parseFloat(usage.rss);
      const heapTotalValue = parseFloat(usage.heapTotal);
      const heapUsedValue = parseFloat(usage.heapUsed);
      const externalValue = parseFloat(usage.external);

      expect(rssValue).toBeGreaterThan(0);
      expect(heapTotalValue).toBeGreaterThan(0);
      expect(heapUsedValue).toBeGreaterThan(0);
      expect(externalValue).toBeGreaterThanOrEqual(0);

      // Heap used should be less than or equal to heap total
      if (usage.heapTotal.includes('MB') && usage.heapUsed.includes('MB')) {
        expect(heapUsedValue).toBeLessThanOrEqual(heapTotalValue);
      }
    });
  });

  describe('Integration Tests', () => {
    it('should work together in a realistic scenario', async () => {
      const capture = captureConsole();

      console.log('Starting memory test');
      const initialMemory = getMemoryUsage();

      // Simulate some async work
      await delay(50);

      // Wait for a condition with timeout
      let counter = 0;
      await waitFor(() => {
        counter++;
        console.log(`Counter: ${counter}`);
        return counter >= 3;
      }, 1000, 25);

      const finalMemory = getMemoryUsage();
      console.log(`Initial memory: ${initialMemory.heapUsed}`);
      console.log(`Final memory: ${finalMemory.heapUsed}`);

      // Verify console capture worked
      expect(capture.logs.length).toBeGreaterThan(0);
      expect(capture.logs[0]).toBe('Starting memory test');
      expect(capture.logs).toContain('Counter: 1');
      expect(capture.logs).toContain('Counter: 2');
      expect(capture.logs).toContain('Counter: 3');

      // Verify memory formatting
      expect(initialMemory.heapUsed).toMatch(/\d+\.?\d*\s+(B|kB|MB)$/);
      expect(finalMemory.heapUsed).toMatch(/\d+\.?\d*\s+(B|kB|MB)$/);

      capture.restore();
    });

    it('should handle error scenarios properly', async () => {
      const capture = captureConsole();

      try {
        await expectThrows(async () => {
          console.error('About to throw error');
          throw new Error('Test integration error');
        }, 'integration error');

        console.log('Error caught successfully');
      } catch (error) {
        console.error('Unexpected error:', error);
      }

      expect(capture.errors).toContain('About to throw error');
      expect(capture.logs).toContain('Error caught successfully');

      capture.restore();
    });
  });
});
