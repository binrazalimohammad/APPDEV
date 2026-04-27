/**
 * JWT Authentication Middleware
 * Extracts Bearer token from Authorization header, verifies it, and attaches decoded user to req.user
 */
const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Middleware that verifies JWT access token from Authorization header
 * Format: Authorization: Bearer <token>
 * On success: attaches decoded payload to req.user
 * On failure: returns 401 Unauthorized
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided. Use: Authorization: Bearer <token>',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded; // { id, username, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Access token has expired. Use /refresh to get a new one.',
      });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or malformed token.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Authentication failed.',
    });
  }
}

module.exports = { authenticateToken };
