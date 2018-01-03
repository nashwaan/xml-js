expect.extend({
  toContain: (collection, value) => require('jest-matchers/build/matchers.js').toContainEqual(collection, value)
});
