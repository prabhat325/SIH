const express = require("express");

const router = express.Router();

const {
    getEmergencies,
    getEmergenciesByCity,
    getEmergencyById,
    createEmergency,
    updateEmergency,
    deleteEmergency
} = require("../controllers/emergencyController");


// GET ALL
router.get("/", getEmergencies);

// GET BY CITY
router.get("/city/:city", getEmergenciesByCity);

// GET BY ID
router.get("/:id", getEmergencyById);

// CREATE
router.post("/", createEmergency);

// UPDATE
router.put("/:id", updateEmergency);

// DELETE
router.delete("/:id", deleteEmergency);

module.exports = router;
