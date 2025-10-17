export default {
  rootDir: ".",
  testEnvironment: "node",
  transform: {
    "^.+\\.js$": "babel-jest"
  },
  testMatch: [
    "<rootDir>/test/**/*.test.js",
    "<rootDir>/test/**/*.spec.js"
  ],
  verbose: true,
};
