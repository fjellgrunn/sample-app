import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.test.ts',
        '**/*.test.tsx',
        'build.js',
        'eslint.config.mjs',
        'vitest.config.ts',
        'build-client.js'
      ],
      thresholds: {
        statements: 50,
        branches: 70,
        functions: 50,
        lines: 50
      }
    },
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true
  }
});
