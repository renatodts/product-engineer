import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    ignores: [
      'dist/**',
      '.next/**',
      'next-env.d.ts',
      '.expo/**',
      '.turbo/**',
      'node_modules/**',
      'coverage/**',
    ],
  },
];
