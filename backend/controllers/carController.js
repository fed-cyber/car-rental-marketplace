const carModel = require("../models/carModel");

async function createCarListing(req, res) {
  try {
    const { make, model, year, vehicleType, pricePerDay, location, description, imageUrl } = req.body;

    if (!make || !model || !year || !vehicleType || !pricePerDay || !location) {
      return res.status(400).json({ message: "Missing required car fields" });
    }

    const car = await carModel.createCar(req.user.id, {
      make, model, year, vehicleType, pricePerDay, location, description, imageUrl
    });

    res.status(201).json(car);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error creating listing" });
  }
}

async function browseCars(req, res) {
  try {
    const { location, vehicleType, maxPrice } = req.query;
    const cars = await carModel.searchCars({ location, vehicleType, maxPrice });
    res.json(cars);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching cars" });
  }
}

async function getCarById(req, res) {
  try {
    const car = await carModel.findCarById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }
    res.json(car);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching car" });
  }
}

async function getMyCars(req, res) {
  try {
    const cars = await carModel.findCarsByOwner(req.user.id);
    res.json(cars);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching your listings" });
  }
}

async function updateCar(req, res) {
  try {
    const updated = await carModel.updateCar(req.params.id, req.user.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: "Car not found, you do not own this listing, or no fields were provided" });
    }
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error updating car" });
  }
}

async function deleteCar(req, res) {
  try {
    const deleted = await carModel.softDeleteCar(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ message: "Car not found or you do not own this listing" });
    }
    res.json({ message: "Listing removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error deleting car" });
  }
}

module.exports = {
  createCarListing,
  browseCars,
  getCarById,
  getMyCars,
  updateCar,
  deleteCar
};
