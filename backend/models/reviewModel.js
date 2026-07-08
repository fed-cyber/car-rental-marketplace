const pool = require("../config/db");

async function createReview(bookingId, customerId, carId, rating, comment) {
  const result = await pool.query(
    `INSERT INTO reviews (booking_id, customer_id, car_id, rating, comment)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [bookingId, customerId, carId, rating, comment]
  );
  return result.rows[0];
}

async function findReviewByBookingId(bookingId) {
  const result = await pool.query(
    `SELECT id FROM reviews WHERE booking_id = $1`,
    [bookingId]
  );
  return result.rows[0];
}

async function getReviewsForCar(carId) {
  const result = await pool.query(
    `SELECT reviews.*, users.name AS customer_name
     FROM reviews
     JOIN users ON reviews.customer_id = users.id
     WHERE reviews.car_id = $1
     ORDER BY reviews.created_at DESC`,
    [carId]
  );
  return result.rows;
}

async function getAllReviewsAdmin() {
  const result = await pool.query(
    `SELECT reviews.*, users.name AS customer_name, cars.make || ' ' || cars.model AS car_name
     FROM reviews
     JOIN users ON reviews.customer_id = users.id
     JOIN cars ON reviews.car_id = cars.id
     ORDER BY reviews.created_at DESC`
  );
  return result.rows;
}

async function deleteReview(id) {
  const result = await pool.query(
    `DELETE FROM reviews WHERE id = $1 RETURNING id`,
    [id]
  );
  return result.rows[0];
}

module.exports = {
  createReview,
  findReviewByBookingId,
  getReviewsForCar,
  getAllReviewsAdmin,
  deleteReview
};