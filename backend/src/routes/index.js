/**
 * Root route - welcome message
 */
const express = require('express');
const router = express.Router();

/**
 * GET /
 * Returns welcome message (public)
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the REST API. Use POST /login to authenticate.',
    endpoints: {
      public: ['GET /', 'POST /login', 'POST /refresh', 'POST /google'],
      protected: ['GET /users', 'POST /users'],
    },
  });
});

module.exports = router;
