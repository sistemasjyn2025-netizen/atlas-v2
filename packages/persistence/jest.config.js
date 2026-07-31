module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@atlas/types$': '<rootDir>/../atlas-types/src',
    '^@atlas/manufacturing-engine$': '<rootDir>/../manufacturing-engine/src',
    '^@atlas/cost-engine$': '<rootDir>/../cost-engine/src',
    '^@atlas/(.*)$': '<rootDir>/../$1/src'
  }
};
