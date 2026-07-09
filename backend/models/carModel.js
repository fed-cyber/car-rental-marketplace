const pool = require("../config/db");

async function createCar(ownerId, data) {
  const result = await pool.query(
    `INSERT INTO cars (owner_id, make, model, year, vehicle_type, price_per_day, location, description, image_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [ownerId, data.make, data.model, data.year, data.vehicleType, data.pricePerDay, data.location, data.description, data.imageUrl]
  );
  return result.rows[0];
}

async function searchCars(filters) {
  const conditions = ["is_removed = FALSE", "is_available = TRUE"];
  const values = [];

  if (filters.location) {
    values.push(`%${filters.location}%`);
    conditions.push(`location ILIKE $${values.length}`);
  }

  if (filters.vehicleType) {
    values.push(filters.vehicleType);
    conditions.push(`vehicle_type = $${values.length}`);
  }

  if (filters.maxPrice) {
    values.push(filters.maxPrice);
    conditions.push(`price_per_day <= $${values.length}`);
  }

  const query = `SELECT * FROM cars WHERE ${conditions.join(" AND ")} ORDER BY created_at DESC`;
  const result = await pool.query(query, values);
  return result.rows;
}

async function findCarById(id) {
  const result = await pool.query(
    `SELECT * FROM cars WHERE id = $1 AND is_removed = FALSE`,
    [id]
  );
  return result.rows[0];
}

async function findCarsByOwner(ownerId) {
  const result = await pool.query(
    `SELECT * FROM cars WHERE owner_id = $1 AND is_removed = FALSE ORDER BY created_at DESC`,
    [ownerId]
  );
  return result.rows;
}

async function updateCar(id, ownerId, data) {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (data.make !== undefined) { fields.push(`make = $${paramIndex++}`); values.push(data.make); }
  if (data.model !== undefined) { fields.push(`model = $${paramIndex++}`); values.push(data.model); }
  if (data.year !== undefined) { fields.push(`year = $${paramIndex++}`); values.push(data.year); }
  if (data.vehicleType !== undefined) { fields.push(`vehicle_type = $${paramIndex++}`); values.push(data.vehicleType); }
  if (data.pricePerDay !== undefined) { fields.push(`price_per_day = $${paramIndex++}`); values.push(data.pricePerDay); }
  if (data.location !== undefined) { fields.push(`location = $${paramIndex++}`); values.push(data.location); }
  if (data.description !== undefined) { fields.push(`description = $${paramIndex++}`); values.push(data.description); }
  if (data.imageUrl !== undefined) { fields.push(`image_url = $${paramIndex++}`); values.push(data.imageUrl); }
  if (data.isAvailable !== undefined) { fields.push(`is_available = $${paramIndex++}`); values.push(data.isAvailable); }

  if (fields.length === 0) {
    return null;
  }

  values.push(id, ownerId);

  const query = `
    UPDATE cars SET ${fields.join(", ")}
    WHERE id = $${paramIndex++} AND owner_id = $${paramIndex++}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
}

async function softDeleteCar(id, ownerId) {
  const result = await pool.query(
    `UPDATE cars SET is_removed = TRUE WHERE id = $1 AND owner_id = $2 RETURNING id`,
    [id, ownerId]
  );
  return result.rows[0];
}

async function getAllCarsAdmin() {
  const result = await pool.query(
    `SELECT cars.*, users.name AS owner_name
     FROM cars
     JOIN users ON cars.owner_id = users.id
     WHERE cars.is_removed = FALSE
     ORDER BY cars.created_at DESC`
  );
  return result.rows;
}

async function adminRemoveCar(id) {
  const result = await pool.query(
    `UPDATE cars SET is_removed = TRUE WHERE id = $1 RETURNING id`,
    [id]
  );
  return result.rows[0];
}

module.exports = {
  createCar,
  searchCars,
  findCarById,
  findCarsByOwner,
  updateCar,
  softDeleteCar,
  getAllCarsAdmin,
  adminRemoveCar
};