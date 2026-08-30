const express = require("express");

const router = express.Router();

const {
    getVehicles,
    getVehiclesByCity,
    getVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle
} = require("../controllers/vehicleController");


// GET ALL
router.get("/", getVehicles);

// GET BY CITY
router.get("/city/:city", getVehiclesByCity);

// GET BY ID
router.get("/:id", getVehicleById);

// CREATE
router.post("/", createVehicle);

// UPDATE
router.put("/:id", updateVehicle);

// DELETE
router.delete("/:id", deleteVehicle);

module.exports = router;
