/** @type {import('jest').Config} */
module.exports = {
  transform: { '^.+\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tests/tsconfig.json' }] },
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  clearMocks: true,
};
