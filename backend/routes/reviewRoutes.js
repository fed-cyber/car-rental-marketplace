const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const requireRole = require("../middleware/roles");
const reviewController = require("../controllers/reviewController");

router.post("/", verifyToken, requireRole("customer"), reviewController.submitReview);
router.get("/car/:carId", reviewController.getCarReviews);

module.exports = router;