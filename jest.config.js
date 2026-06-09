module.exports = {
  testEnvironment: 'jsdom', 
  
  setupFiles: ['<rootDir>/jest.setup.js'],
  
  collectCoverage: true,    
  collectCoverageFrom: [
    "services/**/*.js", 
    "!**/node_modules/**", 
    "!**/tests/**" 
  ],
  coverageDirectory: 'coverage', 
  coverageReporters: ['text', 'html'],
};