/**
 * DFD Level 1 — Data store access: `users` entity.
 * Used after Process 1 validates registration/login credentials.
 */
const { getPool } = require('../config/db');

async function findUserByEmail(email) {
  const [rows] = await getPool().query(
    'SELECT id, email, password_hash AS passwordHash, full_name AS fullName, role, created_at, updated_at FROM users WHERE email = :email LIMIT 1',
    { email: email.toLowerCase().trim() },
  );
  return rows[0] || null;
}

async function findUserById(id) {
  const [rows] = await getPool().query(
    'SELECT id, email, full_name AS fullName, role, created_at, updated_at FROM users WHERE id = :id LIMIT 1',
    { id },
  );
  return rows[0] || null;
}

async function createUser({ email, passwordHash, fullName, role = 'user' }) {
  const [result] = await getPool().query(
    `INSERT INTO users (email, password_hash, full_name, role) VALUES (:email, :passwordHash, :fullName, :role)`,
    {
      email: email.toLowerCase().trim(),
      passwordHash,
      fullName: fullName.trim(),
      role,
    },
  );
  return findUserById(result.insertId);
}

module.exports = { findUserByEmail, findUserById, createUser };
