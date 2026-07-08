require("dotenv").config();
const bcrypt = require("bcrypt");
const pool = require("./config/db");

async function seedAdmin() {
  const passwordHash = await bcrypt.hash("AdminPass123", 10);

  const existing = await pool.query("SELECT id FROM users WHERE email = $1", ["admin@roadshare.com"]);
  if (existing.rows.length > 0) {
    console.log("Admin already exists.");
    process.exit(0);
  }

  await pool.query(
    `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)`,
    ["Platform Admin", "admin@roadshare.com", passwordHash, "admin"]
  );

  console.log("Admin user created: admin@roadshare.com / AdminPass123");
  process.exit(0);
}

seedAdmin();