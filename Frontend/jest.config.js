module.exports = {
  testEnvironment: "jsdom",
  collectCoverageFrom: [
    "src/**/*.js", 
    "!src/app.js",
    "!src/core/api.js" 
  ]
};