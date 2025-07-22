import '@testing-library/jest-dom';

// Mock console methods to avoid noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeEach(() => {
  console.log = jest.fn();
  // Suppress React act warnings in tests
  console.error = jest.fn().mockImplementation((message, ...args) => {
    if (typeof message === 'string' && message.includes('Warning: An update to %s inside a test was not wrapped in act')) {
      return;
    }
    originalConsoleError(message, ...args);
  });
});

afterEach(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

// Mock window.fetch if not available
if (!global.fetch) {
  global.fetch = jest.fn();
}

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});