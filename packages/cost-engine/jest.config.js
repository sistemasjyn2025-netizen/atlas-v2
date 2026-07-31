module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@atlas/kernel$': '<rootDir>/../atlas-kernel/src',
    '^@atlas/manufacturing-engine$': '<rootDir>/../manufacturing-engine/src',
    '^@atlas/types$': '<rootDir>/../atlas-types/src',
    '^@atlas/(.*)$': '<rootDir>/../$1/src'
  }
};
