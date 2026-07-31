/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@atlas/types$': '<rootDir>../atlas-types/src'
  },
  testMatch: ['**/tests/**/*.test.ts']
};
