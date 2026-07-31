module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@atlas/kernel$': '<rootDir>/../atlas-kernel/src',
    '^@atlas/types$': '<rootDir>/../atlas-types/src',
    '^@atlas/manufacturing-engine$': '<rootDir>/../manufacturing-engine/src',
    '^@atlas/parametric-engine$': '<rootDir>/../parametric-engine/src',
    '^@atlas/assembly-engine$': '<rootDir>/../assembly-engine/src',
    '^@atlas/(.*)$': '<rootDir>/../$1/src'
  }
};
