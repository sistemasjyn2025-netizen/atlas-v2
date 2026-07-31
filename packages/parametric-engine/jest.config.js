/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@atlas/types$': '<rootDir>../atlas-types/src',
    '^@atlas/kernel$': '<rootDir>../atlas-kernel/src'
  },
  testMatch: ['**/tests/**/*.test.ts']
};
