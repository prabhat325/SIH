const express = require("express");

const router = express.Router();

const {
    getGuides,
    getGuidesByCity,
    getGuideById,
    createGuide,
    updateGuide,
    deleteGuide
} = require("../controllers/guideController");


// GET ALL
router.get("/", getGuides);

// GET BY CITY
router.get("/city/:city", getGuidesByCity);

// GET BY ID
router.get("/:id", getGuideById);

// CREATE
router.post("/", createGuide);

// UPDATE
router.put("/:id", updateGuide);

// DELETE
router.delete("/:id", deleteGuide);

module.exports = router;
