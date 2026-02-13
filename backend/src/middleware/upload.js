const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|video\/mp4|video\/quicktime/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);// Create separate .env files for different environments
// .env.development, .env.production, .env.test
// Use config validation with joi// Implement repository pattern
// Add database connection pooling
// Create migration scripts
// Add database health checks// Add Swagger/OpenAPI documentation
// Implement API versioning
// Create comprehensive endpoint documentation// Unit tests with Jest
// Integration tests for API endpoints
// Database testing with test containers
// Authentication flow testing// Implement Redis caching
// Add database indexing
// Use compression middleware
// Implement pagination for large datasets// Implement code splitting
// Add lazy loading for components
// Optimize bundle size
// Use React.memo for expensive components// Implement refresh token rotation
// Add session management
// Use secure HTTP-only cookies
// Implement account lockout policies// Encrypt sensitive data at rest
// Implement data anonymization
// Add audit logging
// Use HTTPS in production// Add health check endpoints
// Implement application metrics
// Use structured logging
// Add error tracking (Sentry)// Database query performance
// API response times
// Memory usage tracking
// User experience metrics// ESLint with strict rules
// Prettier for code formatting
// Husky for git hooks
// Conventional commits// Automated testing on PR
// Code coverage reporting
// Security vulnerability scanning
// Automated deployment
  } else {
    cb(new Error('Error: Images Only!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // 1MB limit
  fileFilter: fileFilter
});

module.exports = upload;