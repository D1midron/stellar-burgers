import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@slices(.*)$': '<rootDir>/src/services/slices$1',
    '^@utils-types(.*)$': '<rootDir>/src/utils/types$1'
  }
};

export default config;
