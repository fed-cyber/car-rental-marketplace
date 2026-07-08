const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const requireRole = require("../middleware/roles");
const carController = require("../controllers/carController");

router.get("/", carController.browseCars);
router.get("/owner/mine", verifyToken, requireRole("owner"), carController.getMyCars);
router.get("/:id", carController.getCarById);
router.post("/", verifyToken, requireRole("owner"), carController.createCarListing);
router.put("/:id", verifyToken, requireRole("owner"), carController.updateCar);
router.delete("/:id", verifyToken, requireRole("owner"), carController.deleteCar);

module.exports = router;