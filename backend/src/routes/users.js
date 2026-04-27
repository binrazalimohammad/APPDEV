/**
 * User routes - protected by JWT auth
 */
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const userData = require('../data/users');

// All routes in this file require authentication
router.use(authenticateToken);

/**
 * GET /users
 * Returns list of all users (protected)
 */
router.get('/', (req, res) => {
  const users = userData.getAll();
  return res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

/**
 * POST /users
 * Body: { username, email }
 * Adds a new user (protected)
 */
router.post('/', (req, res) => {
  const { username, email } = req.body;

  if (!username || !email) {
    return res.status(400).json({
      success: false,
      message: 'Username and email are required.',
    });
  }

  const newUser = userData.add({ username, email });
  return res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: newUser,
  });
});

module.exports = router;
