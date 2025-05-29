module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom', // Using jsdom for potential DOM interactions (like navigator.userAgent)
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    // Handle module aliases (if you have them in tsconfig.json, like @components/*)
    // Example:
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@contexts/(.*)$': '<rootDir>/src/contexts/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@mocks/(.*)$': '<rootDir>/src/mocks/$1',
    // Add other aliases here if needed
  },
  // Automatically clear mock calls, instances and results before every test
  clearMocks: true,
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        moduleResolution: 'node',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      }
    }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(msw)/)'
  ],
}; 