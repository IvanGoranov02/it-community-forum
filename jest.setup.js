// Basic Jest setup for Node.js environment
global.console = {
  ...console,
  // Suppress console.log in tests
  log: jest.fn(),
}

// URL polyfill for Node.js environment
const { URL, URLSearchParams } = require('url')
global.URL = URL
global.URLSearchParams = URLSearchParams

// Mock fetch if not available
if (!global.fetch) {
  global.fetch = jest.fn()
}

// Mock window object for Node.js environment
global.window = {
  location: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
  },
} 