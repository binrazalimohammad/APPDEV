/**
 * DFD Level 1 — Database seed (sample data store).
 * Run from server folder: npm run seed
 * Loads credentials from ../server/.env via dotenv.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'server', '.env') });

const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function seed() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dfd_app',
    waitForConnections: true,
    connectionLimit: 2,
  });

  const pwdUser = bcrypt.hashSync('Password123!', 10);
  const pwdAdmin = bcrypt.hashSync('AdminPass123!', 10);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query('DELETE FROM activity_logs');
    await conn.query('DELETE FROM records');
    await conn.query('DELETE FROM users');

    const [adminRows] = await conn.query(
      `INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, 'admin')`,
      ['admin@dfd.local', pwdAdmin, 'System Admin'],
    );
    const adminId = adminRows.insertId;

    const [userRows] = await conn.query(
      `INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, 'user')`,
      ['user@dfd.local', pwdUser, 'Regular User'],
    );
    const userId = userRows.insertId;

    const [r1] = await conn.query(
      `INSERT INTO records (user_id, title, category, description, priority, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        'Replace lobby lighting',
        'Maintenance',
        'LED retrofit for main lobby fixtures.',
        'high',
        'submitted',
      ],
    );

    await conn.query(
      `INSERT INTO activity_logs (user_id, record_id, action, details) VALUES (?, ?, ?, ?)`,
      [userId, r1.insertId, 'RECORD_CREATE', JSON.stringify({ source: 'seed' })],
    );

    await conn.query(
      `INSERT INTO records (user_id, title, category, description, priority, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        'Annual fire drill',
        'Safety',
        'Schedule building-wide evacuation drill.',
        'medium',
        'reviewed',
      ],
    );

    await conn.query(
      `INSERT INTO activity_logs (user_id, record_id, action, details) VALUES (?, ?, ?, ?)`,
      [adminId, null, 'SEED_COMPLETE', '{}'],
    );

    await conn.commit();
    console.log('Seed complete.');
    console.log('  admin@dfd.local / AdminPass123!');
    console.log('  user@dfd.local / Password123!');
  } catch (e) {
    await conn.rollback();
    console.error(e);
    process.exit(1);
  } finally {
    conn.release();
    await pool.end();
  }
}

seed();
