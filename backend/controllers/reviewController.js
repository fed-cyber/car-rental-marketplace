const reviewModel = require("../models/reviewModel");
const bookingModel = require("../models/bookingModel");

async function submitReview(req, res) {
  try {
    const { bookingId, carId, rating, comment } = req.body;

    if (!bookingId || !carId || !rating) {
      return res.status(400).json({ message: "bookingId, carId, and rating are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const booking = await bookingModel.findBookingById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.customer_id !== req.user.id) {
      return res.status(403).json({ message: "This booking does not belong to you" });
    }

    if (!["completed", "approved"].includes(booking.status)) {
      return res.status(400).json({ message: "You can only review completed rentals" });
    }

    const existingReview = await reviewModel.findReviewByBookingId(bookingId);
    if (existingReview) {
      return res.status(409).json({ message: "You have already reviewed this booking" });
    }

    const review = await reviewModel.createReview(bookingId, req.user.id, carId, rating, comment);
    res.status(201).json(review);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "You have already reviewed this booking" });
    }
    console.error(err);
    res.status(500).json({ message: "Server error submitting review" });
  }
}

async function getCarReviews(req, res) {
  try {
    const reviews = await reviewModel.getReviewsForCar(req.params.carId);
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching reviews" });
  }
}

module.exports = { submitReview, getCarReviews };