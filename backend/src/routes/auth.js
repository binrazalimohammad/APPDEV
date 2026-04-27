/**
 * Authentication routes: login, refresh
 */
const express = require('express');
const router = express.Router();
const userData = require('../data/users');
const { generateTokenPair, refreshAccessToken } = require('../utils/tokens');
const { OAuth2Client } = require('google-auth-library');
const config = require('../config');

const googleClient = new OAuth2Client(config.google.clientId || undefined);

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

/**
 * POST /google
 * Body: { idToken }
 *
 * Mobile flow:
 * - Client obtains a Google ID token via Google Sign-In
 * - Send it here to exchange for API JWT tokens (access+refresh)
 */
router.post('/google', async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({
      success: false,
      message: 'idToken is required.',
    });
  }

  if (!config.google.clientId) {
    return res.status(500).json({
      success: false,
      message: 'Server Google client ID is not configured (GOOGLE_CLIENT_ID).',
    });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: config.google.clientId,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch user email from Google token.',
      });
    }

    const email = payload.email;
    const name = payload.name || payload.given_name || '';
    const googleSub = payload.sub;

    const existing = userData.findByEmailAndAuthType(email, 'google');
    const user = existing || userData.createGoogleUser({ email, name, googleSub });

    const tokens = generateTokenPair(user);
    return res.status(200).json({
      success: true,
      message: 'Google login successful',
      ...tokens,
    });
  } catch (e) {
    return res.status(400).json({
      success: false,
      message: 'Failed to verify Google token.',
    });
  }
});

module.exports = router;
