/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  setupFiles: ['<rootDir>/test/setup-env.ts'],
  // Integration suites share one Postgres test database and reset it between tests,
  // so run serially to avoid cross-file interference (TRUNCATE racing another suite).
  maxWorkers: 1,
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/../tsconfig.json' }],
  },
  testEnvironment: 'node',
};
