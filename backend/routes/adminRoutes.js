const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const requireRole = require("../middleware/roles");
const adminController = require("../controllers/adminController");

router.use(verifyToken, requireRole("admin"));

router.get("/users", adminController.listUsers);
router.put("/users/:id/status", adminController.setUserStatus);
router.get("/cars", adminController.listAllCars);
router.delete("/cars/:id", adminController.removeCar);
router.get("/reviews", adminController.listAllReviews);
router.delete("/reviews/:id", adminController.removeReview);

module.exports = router;