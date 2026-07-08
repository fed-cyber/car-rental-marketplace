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

async function updateCarAvailability(id, ownerId, isAvailable) {
  const result = await pool.query(
    `UPDATE cars SET is_available = $1 WHERE id = $2 AND owner_id = $3 RETURNING *`,
    [isAvailable, id, ownerId]
  );
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
  updateCarAvailability,
  softDeleteCar,
  getAllCarsAdmin,
  adminRemoveCar
};