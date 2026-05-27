/**
 * DFD Level 1 — HTTP routes for Process 1 authentication (actor → validation → token).
 */
const { Router } = require('express');
const { body } = require('express-validator');
const { authRequired } = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = Router();

router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('fullName').trim().isLength({ min: 2 }).withMessage('Full name is required'),
  ],
  authController.register,
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password required'),
  ],
  authController.login,
);

router.get('/me', authRequired, authController.me);

module.exports = router;
