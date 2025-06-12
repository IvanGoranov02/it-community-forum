// Basic Jest setup without complex mocks
global.console = {
  ...console,
  // Suppress console.log in tests
  log: jest.fn(),
} 