module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@atlas/api$': '<rootDir>/../atlas-api/src',
    '^@atlas/runtime$': '<rootDir>/../atlas-runtime/src',
    '^@atlas/kernel$': '<rootDir>/../atlas-kernel/src',
    '^@atlas/types$': '<rootDir>/../atlas-types/src',
    '^@atlas/parametric-engine$': '<rootDir>/../parametric-engine/src',
    '^@atlas/manufacturing-engine$': '<rootDir>/../manufacturing-engine/src',
    '^@atlas/document-engine$': '<rootDir>/../document-engine/src',
    '^@atlas/assembly-engine$': '<rootDir>/../assembly-engine/src',
    '^@atlas/(.*)$': '<rootDir>/../$1/src'
  }
};
