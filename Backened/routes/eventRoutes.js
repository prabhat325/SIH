const express = require("express");

const router = express.Router();

const {
    getEvents,
    getEventsByCity,
    getEventsByType,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
} = require("../controllers/eventController");


// GET ALL
router.get("/", getEvents);

// GET BY CITY
router.get("/city/:city", getEventsByCity);

// GET BY TYPE
router.get("/type/:type", getEventsByType);

// GET BY ID
router.get("/:id", getEventById);

// CREATE
router.post("/", createEvent);

// UPDATE
router.put("/:id", updateEvent);

// DELETE
router.delete("/:id", deleteEvent);

module.exports = router;
