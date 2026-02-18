const { test, expect } = require('@jest/globals');

const add = (a, b) => a + b;

test('basic math works', () => {
  expect(add(2, 3)).toBe(5);
});
