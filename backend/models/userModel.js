const pool = require("../config/db");

async function createUser(name, email, passwordHash, role) {
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, is_active, created_at`,
    [name, email, passwordHash, role]
  );
  return result.rows[0];
}

async function findUserByEmail(email) {
  const result = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );
  return result.rows[0];
}

async function findUserById(id) {
  const result = await pool.query(
    `SELECT id, name, email, role, is_active, created_at FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0];
}

async function getAllUsers() {
  const result = await pool.query(
    `SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC`
  );
  return result.rows;
}

async function setUserActiveStatus(id, isActive) {
  const result = await pool.query(
    `UPDATE users SET is_active = $1 WHERE id = $2
     RETURNING id, name, email, role, is_active`,
    [isActive, id]
  );
  return result.rows[0];
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  getAllUsers,
  setUserActiveStatus
};