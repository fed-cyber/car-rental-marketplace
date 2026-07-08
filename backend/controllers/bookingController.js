const bookingModel = require("../models/bookingModel");
const carModel = require("../models/carModel");

function calculateDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end - start;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

async function requestBooking(req, res) {
  try {
    const { carId, startDate, endDate } = req.body;

    if (!carId || !startDate || !endDate) {
      return res.status(400).json({ message: "carId, startDate, and endDate are required" });
    }

    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ message: "endDate must be after startDate" });
    }

    const car = await carModel.findCarById(carId);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    if (!car.is_available) {
      return res.status(400).json({ message: "This car is not currently available" });
    }

    const hasOverlap = await bookingModel.checkDateOverlap(carId, startDate, endDate);
    if (hasOverlap) {
      return res.status(409).json({ message: "This car is already booked for part of those dates" });
    }

    const days = calculateDays(startDate, endDate);
    const totalPrice = days * parseFloat(car.price_per_day);

    const booking = await bookingModel.createBooking(req.user.id, carId, startDate, endDate, totalPrice);
    res.status(201).json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error creating booking" });
  }
}

async function approveBooking(req, res) {
  try {
    const booking = await bookingModel.findBookingById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.owner_id !== req.user.id) {
      return res.status(403).json({ message: "You do not own the car for this booking" });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({ message: `Booking is already ${booking.status}` });
    }

    const updated = await bookingModel.updateBookingStatus(req.params.id, "approved");
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error approving booking" });
  }
}

async function rejectBooking(req, res) {
  try {
    const booking = await bookingModel.findBookingById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.owner_id !== req.user.id) {
      return res.status(403).json({ message: "You do not own the car for this booking" });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({ message: `Booking is already ${booking.status}` });
    }

    const updated = await bookingModel.updateBookingStatus(req.params.id, "rejected");
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error rejecting booking" });
  }
}

async function getOwnerPendingRequests(req, res) {
  try {
    const bookings = await bookingModel.getPendingRequestsForOwner(req.user.id);
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching requests" });
  }
}

async function getOwnerHistory(req, res) {
  try {
    const bookings = await bookingModel.getHistoryForOwner(req.user.id);
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching history" });
  }
}

async function getCustomerActiveBookings(req, res) {
  try {
    const bookings = await bookingModel.getActiveBookingsForCustomer(req.user.id);
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching bookings" });
  }
}

async function getCustomerPastBookings(req, res) {
  try {
    const bookings = await bookingModel.getPastBookingsForCustomer(req.user.id);
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching past bookings" });
  }
}

module.exports = {
  requestBooking,
  approveBooking,
  rejectBooking,
  getOwnerPendingRequests,
  getOwnerHistory,
  getCustomerActiveBookings,
  getCustomerPastBookings
};