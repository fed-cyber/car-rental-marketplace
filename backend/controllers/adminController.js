const userModel = require("../models/userModel");
const carModel = require("../models/carModel");
const reviewModel = require("../models/reviewModel");

async function listUsers(req, res) {
  try {
    const users = await userModel.getAllUsers();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching users" });
  }
}

async function setUserStatus(req, res) {
  try {
    const { isActive } = req.body;
    const updated = await userModel.setUserActiveStatus(req.params.id, isActive);
    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error updating user status" });
  }
}

async function listAllCars(req, res) {
  try {
    const cars = await carModel.getAllCarsAdmin();
    res.json(cars);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching cars" });
  }
}

async function removeCar(req, res) {
  try {
    const removed = await carModel.adminRemoveCar(req.params.id);
    if (!removed) {
      return res.status(404).json({ message: "Car not found" });
    }
    res.json({ message: "Listing removed by admin" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error removing car" });
  }
}

async function listAllReviews(req, res) {
  try {
    const reviews = await reviewModel.getAllReviewsAdmin();
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching reviews" });
  }
}

async function removeReview(req, res) {
  try {
    const deleted = await reviewModel.deleteReview(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.json({ message: "Review removed by admin" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error removing review" });
  }
}

module.exports = {
  listUsers,
  setUserStatus,
  listAllCars,
  removeCar,
  listAllReviews,
  removeReview
};