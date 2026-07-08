const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const requireRole = require("../middleware/roles");
const bookingController = require("../controllers/bookingController");

router.post("/", verifyToken, requireRole("customer"), bookingController.requestBooking);
router.put("/:id/approve", verifyToken, requireRole("owner"), bookingController.approveBooking);
router.put("/:id/reject", verifyToken, requireRole("owner"), bookingController.rejectBooking);
router.get("/owner/pending", verifyToken, requireRole("owner"), bookingController.getOwnerPendingRequests);
router.get("/owner/history", verifyToken, requireRole("owner"), bookingController.getOwnerHistory);
router.get("/customer/active", verifyToken, requireRole("customer"), bookingController.getCustomerActiveBookings);
router.get("/customer/past", verifyToken, requireRole("customer"), bookingController.getCustomerPastBookings);

module.exports = router;