/**
 * Application configuration loaded from environment variables
 */
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-change-me',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'fallback-refresh-secret-change-me',
    accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || '1h',
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
  },
};
