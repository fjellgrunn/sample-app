import fjellConfig from '@fjell/common-config';

export default [
  ...fjellConfig,
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
