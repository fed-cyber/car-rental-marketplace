const pool = require("../config/db");

async function createBooking(customerId, carId, startDate, endDate, totalPrice) {
  const result = await pool.query(
    `INSERT INTO bookings (car_id, customer_id, start_date, end_date, total_price)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [carId, customerId, startDate, endDate, totalPrice]
  );
  return result.rows[0];
}

async function findBookingById(id) {
  const result = await pool.query(
    `SELECT bookings.*, cars.owner_id, cars.price_per_day
     FROM bookings
     JOIN cars ON bookings.car_id = cars.id
     WHERE bookings.id = $1`,
    [id]
  );
  return result.rows[0];
}

async function updateBookingStatus(id, status) {
  const result = await pool.query(
    `UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return result.rows[0];
}

async function getPendingRequestsForOwner(ownerId) {
  const result = await pool.query(
    `SELECT bookings.*, cars.make, cars.model, users.name AS customer_name
     FROM bookings
     JOIN cars ON bookings.car_id = cars.id
     JOIN users ON bookings.customer_id = users.id
     WHERE cars.owner_id = $1 AND bookings.status = 'pending'
     ORDER BY bookings.created_at ASC`,
    [ownerId]
  );
  return result.rows;
}

async function getHistoryForOwner(ownerId) {
  const result = await pool.query(
    `SELECT bookings.*, cars.make, cars.model, users.name AS customer_name
     FROM bookings
     JOIN cars ON bookings.car_id = cars.id
     JOIN users ON bookings.customer_id = users.id
     WHERE cars.owner_id = $1 AND bookings.status IN ('completed', 'rejected', 'cancelled', 'approved')
     ORDER BY bookings.created_at DESC`,
    [ownerId]
  );
  return result.rows;
}

async function getActiveBookingsForCustomer(customerId) {
  const result = await pool.query(
    `SELECT bookings.*, cars.make, cars.model
     FROM bookings
     JOIN cars ON bookings.car_id = cars.id
     WHERE bookings.customer_id = $1 AND bookings.status IN ('pending', 'approved')
     ORDER BY bookings.created_at DESC`,
    [customerId]
  );
  return result.rows;
}

async function getPastBookingsForCustomer(customerId) {
  const result = await pool.query(
    `SELECT bookings.*, cars.make, cars.model, cars.id AS car_id,
            EXISTS (SELECT 1 FROM reviews WHERE reviews.booking_id = bookings.id) AS has_review
     FROM bookings
     JOIN cars ON bookings.car_id = cars.id
     WHERE bookings.customer_id = $1 AND bookings.status IN ('completed', 'rejected', 'cancelled')
     ORDER BY bookings.created_at DESC`,
    [customerId]
  );
  return result.rows;
}

async function checkDateOverlap(carId, startDate, endDate) {
  const result = await pool.query(
    `SELECT id FROM bookings
     WHERE car_id = $1
       AND status = 'approved'
       AND (start_date, end_date) OVERLAPS ($2::date, $3::date)`,
    [carId, startDate, endDate]
  );
  return result.rows.length > 0;
}

module.exports = {
  createBooking,
  findBookingById,
  updateBookingStatus,
  getPendingRequestsForOwner,
  getHistoryForOwner,
  getActiveBookingsForCustomer,
  getPastBookingsForCustomer,
  checkDateOverlap
};