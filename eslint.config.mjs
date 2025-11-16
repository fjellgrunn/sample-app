import fjellConfig from '@fjell/common-config';
import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  ...fjellConfig,
  ...compat.extends('next/core-web-vitals'),
  {
    rules: {
      "max-depth": "off",
      "no-undefined": "off",
      "@typescript-eslint/no-unused-vars": "off",
      'max-params': 'off',
      'max-len': 'off',
    },
  },
];
