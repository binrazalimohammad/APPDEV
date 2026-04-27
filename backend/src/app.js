/**
 * Express application setup
 */
const express = require('express');
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');

const app = express();

// Parse JSON request bodies
app.use(express.json());

// Mount routes
app.use('/', indexRoutes);
app.use('/', authRoutes);   // POST /login, POST /refresh
app.use('/users', usersRoutes);  // GET /users, POST /users

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found.`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error.',
  });
});

module.exports = app;
