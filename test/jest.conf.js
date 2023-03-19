const path = require('path');

module.exports = {
  rootDir: path.dirname(__dirname),

  modulePaths: ["<rootDir>/lib", "<rootDir>/node_modules"],

  moduleFileExtensions: ["js"],

  // setupFiles: ['<rootDir>/test/pretest-jest.js'], // don't use this, expect.extend() will fail
  setupTestFrameworkScriptFile: "<rootDir>/test/pretest-jest.js",

  testEnvironment: "node",

  testMatch: ["**/*.spec.(ts|js)?(x)"],

  collectCoverage: true,

  collectCoverageFrom: [
    "src-js/**/*.{js,ts}",
    "!**/*.spec.{js,ts}",
    "!**/node_modules/**",
    "!**/test/**",
  ],

  // coverageDirectory: '<rootDir>/test/coverage-jest',

  coverageReporters: ["json", "lcov", "text", "html"],
};
