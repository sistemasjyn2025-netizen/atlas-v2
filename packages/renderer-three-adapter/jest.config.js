module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@atlas/renderer-core$': '<rootDir>/../renderer-core/src',
    '^@atlas/(.*)$': '<rootDir>/../$1/src'
  }
};
