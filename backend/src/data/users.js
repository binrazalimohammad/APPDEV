/**
 * In-memory user storage for demo purposes
 * In production, replace with database (e.g., MongoDB, PostgreSQL)
 */

// Hardcoded test user for login (username: admin, password: admin123)
const TEST_USER = {
  id: 1,
  username: 'admin',
  password: 'admin123', // In production, use bcrypt hashed passwords
  email: 'admin@example.com',
};

// In-memory array of users (demo only)
// authType: 'password' | 'google'
const users = [
  { id: 1, username: 'admin', email: 'admin@example.com', authType: 'password' },
  { id: 2, username: 'john', email: 'john@example.com', authType: 'password' },
  { id: 3, username: 'jane', email: 'jane@example.com', authType: 'password' },
];

let nextId = 4;

/**
 * Authenticate user by username and password
 * @returns {object|null} User object without password, or null if invalid
 */
function authenticate(username, password) {
  if (TEST_USER.username === username && TEST_USER.password === password) {
    return {
      id: TEST_USER.id,
      username: TEST_USER.username,
      email: TEST_USER.email,
      authType: 'password',
    };
  }
  return null;
}

function findByEmailAndAuthType(email, authType) {
  if (!email || !authType) return null;
  return users.find((u) => u.email === email && u.authType === authType) || null;
}

function createGoogleUser({ email, name, googleSub }) {
  const username = name || (email ? email.split('@')[0] : `google_user_${nextId}`);
  const newUser = {
    id: nextId++,
    username,
    email,
    authType: 'google',
    googleSub,
  };
  users.push(newUser);
  return newUser;
}

/**
 * Get all users (without sensitive fields)
 */
function getAll() {
  return users.map(({ id, username, email, authType }) => ({ id, username, email, authType }));
}

/**
 * Add a new user
 * @returns {object} Created user (without password)
 */
function add(userData) {
  const { username, email } = userData;
  const newUser = { id: nextId++, username, email, authType: 'password' };
  users.push(newUser);
  return newUser;
}

module.exports = {
  authenticate,
  findByEmailAndAuthType,
  createGoogleUser,
  getAll,
  add,
};
