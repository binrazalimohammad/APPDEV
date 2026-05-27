/**
 * DFD Level 1 — Database layer: connection pool to the central data store.
 * All persistent entities (users, records, logs) flow through this module.
 */
const mysql = require('mysql2/promise');

function createPool() {
  return mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: true,
  });
}

/** @type {import('mysql2/promise').Pool | null} */
let pool = null;

function getPool() {
  if (!pool) {
    pool = createPool();
  }
  return pool;
}

module.exports = { getPool };
