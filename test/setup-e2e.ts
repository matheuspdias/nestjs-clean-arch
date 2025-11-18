/**
 * E2E Test Setup
 * This file runs before all E2E tests
 */

// Set test environment variables
process.env.NODE_ENV = 'test';

// Increase timeout for E2E tests
jest.setTimeout(30000);

// Global test hooks
beforeAll(() => {
  console.log('Starting E2E tests...');
});

afterAll(() => {
  console.log('E2E tests completed.');
});
