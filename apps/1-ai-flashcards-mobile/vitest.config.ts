import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    environment: 'node',
    include: ['**/*.test.ts', '**/*.test.tsx'],
    alias: {
      'react-native': resolve(__dirname, 'test/stubs/react-native.ts'),
      'expo-status-bar': resolve(__dirname, 'test/stubs/expo-status-bar.ts'),
    },
  },
});
