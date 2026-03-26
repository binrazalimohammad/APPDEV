/**
 * Authentication routes: login, refresh
 */
const express = require('express');
const router = express.Router();
const userData = require('../data/users');
const { generateTokenPair, refreshAccessToken } = require('../utils/tokens');

/**
 * POST /login
 * Body: { username, password }
 * Returns: { accessToken, refreshToken, expiresIn } on success
 * Returns: 401 on invalid credentials
 */
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required.',
    });
  }

  const user = userData.authenticate(username, password);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid username or password.',
    });
  }

  const tokens = generateTokenPair(user);
  return res.status(200).json({
    success: true,
    message: 'Login successful',
    ...tokens,
  });
});

/**
 * POST /refresh
 * Body: { refreshToken }
 * Returns: { accessToken, refreshToken, expiresIn } on valid refresh token
 * Returns: 401 on expired or invalid refresh token
 */
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token is required.',
    });
  }

  const tokens = refreshAccessToken(refreshToken);

  if (!tokens) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token. Please login again.',
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Tokens refreshed',
    ...tokens,
  });
});

module.exports = router;
