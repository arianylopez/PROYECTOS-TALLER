module.exports = {
  testEnvironment: 'jsdom', 
  
  collectCoverage: true,    
  
  collectCoverageFrom: [
    'src/**/*.js',  
    '!src/config/supabase.js' 
  ],
  
  coverageDirectory: 'coverage', 
  
  coverageReporters: ['text', 'html'],
};