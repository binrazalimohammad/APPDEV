/**
 * JWT Token generation and refresh token storage
 */
const jwt = require('jsonwebtoken');
const config = require('../config');

// In-memory store for refresh tokens (use Redis/DB in production)
const refreshTokenStore = new Map();

/**
 * Generate access token (short-lived) and refresh token (long-lived)
 * @param {object} user - { id, username }
 * @returns {{ accessToken, refreshToken, expiresIn }}
 */
function generateTokenPair(user) {
  const payload = { id: user.id, username: user.username };

  const accessToken = jwt.sign(
    payload,
    config.jwt.secret,
    { expiresIn: config.jwt.accessTokenExpiry }
  );

  const refreshToken = jwt.sign(
    { ...payload, type: 'refresh' },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshTokenExpiry }
  );

  // Store refresh token with user id for validation
  refreshTokenStore.set(refreshToken, { userId: user.id, username: user.username });

  return {
    accessToken,
    refreshToken,
    expiresIn: config.jwt.accessTokenExpiry,
  };
}

/**
 * Verify refresh token and return new access token
 * @param {string} token - Refresh token
 * @returns {{ accessToken, expiresIn }} or null if invalid
 */
function refreshAccessToken(token) {
  if (!token || !refreshTokenStore.has(token)) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret);
    if (decoded.type !== 'refresh') {
      return null;
    }

    // Remove old refresh token (optional: single-use refresh tokens)
    refreshTokenStore.delete(token);

    const user = { id: decoded.id, username: decoded.username };
    const { accessToken, refreshToken, expiresIn } = generateTokenPair(user);

    return {
      accessToken,
      refreshToken, // Issue new refresh token (rotation)
      expiresIn,
    };
  } catch (err) {
    refreshTokenStore.delete(token);
    return null;
  }
}

/**
 * Revoke a refresh token (e.g., on logout)
 */
function revokeRefreshToken(token) {
  return refreshTokenStore.delete(token);
}

module.exports = {
  generateTokenPair,
  refreshAccessToken,
  revokeRefreshToken,
  refreshTokenStore,
};
