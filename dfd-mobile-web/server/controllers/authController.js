/**
 * DFD Level 1 — Process 1 boundary: authentication / actor onboarding.
 * Validates credentials, issues JWT (actor session) for downstream processes.
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

function issueToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  );
}

async function register(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  const { email, password, fullName } = req.body;

  const existing = await User.findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ success: false, error: 'Email already registered' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const user = await User.createUser({
    email,
    passwordHash,
    fullName,
    role: 'user',
  });

  const token = issueToken(user);
  return res.status(201).json({
    success: true,
    data: {
      token,
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
    },
  });
}

async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  const { email, password } = req.body;
  const user = await User.findUserByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ success: false, error: 'Invalid email or password' });
  }

  const safe = await User.findUserById(user.id);
  const token = issueToken({
    id: safe.id,
    email: safe.email,
    role: safe.role,
    fullName: safe.fullName,
  });
  return res.json({
    success: true,
    data: {
      token,
      user: { id: safe.id, email: safe.email, fullName: safe.fullName, role: safe.role },
    },
  });
}

async function me(req, res) {
  const user = await User.findUserById(req.user.id);
  if (!user) return res.status(404).json({ success: false, error: 'User not found' });
  return res.json({
    success: true,
    data: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
  });
}

module.exports = { register, login, me };
