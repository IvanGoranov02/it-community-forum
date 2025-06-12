# Testing Setup

This project includes basic unit tests using Jest to verify core functionality.

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch
```

## Test Coverage

The tests cover approximately 15-20% of the codebase, focusing on:

### 1. Utility Functions (`utils.test.ts`)
- URL hash parsing for OAuth tokens
- Username generation from email addresses
- OAuth error message decoding

### 2. Authentication Utils (`auth-utils.test.ts`)
- Email format validation
- Session storage object creation
- OAuth provider detection

### 3. Form Validation (`form-validation.test.ts`)
- Password strength validation
- Username sanitization
- Post title length validation

## Test Structure

- **Test files**: Located in `__tests__/` directory
- **Configuration**: `jest.config.js` and `jest.setup.js`
- **Environment**: Node.js (simplified setup without complex mocks)

## Notes

- Tests focus on pure utility functions rather than React components
- Complex component testing with mocks was avoided for simplicity
- TypeScript linter errors in test files are expected (missing @types/jest) but tests run successfully
- Tests verify the core business logic used in OAuth authentication and form validation 