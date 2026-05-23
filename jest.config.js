module.exports = {
  testEnvironment: 'jsdom', 
  
  setupFiles: ['<rootDir>/jest.setup.js'],
  
  collectCoverage: true,    
  collectCoverageFrom: [
    'src/**/*.js',          
    '!src/config/supabase.js' 
  ],
  coverageDirectory: 'coverage', 
  coverageReporters: ['text', 'html'],
};