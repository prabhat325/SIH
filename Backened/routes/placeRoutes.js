const express = require("express");

const router = express.Router();

// Import controller
const {
    getPlaces,
    createPlace,
    getPlaceById,
    updatePlace,
    deletePlace,
    getPlacesByCity
} = require("../controllers/placeController");

// GET /api/places
router.get("/", getPlaces);         // reading available places

// POST /api/places
router.post("/", createPlace);      // creating from frontend

// GET /api/places/city/:city
router.get("/city/:city", getPlacesByCity);

// GET /api/places/:id
router.get("/:id", getPlaceById);   // get place by id 

// PUT /api/places/:id
router.put("/:id", updatePlace);    // updating fields of documents with ids

// DELETE /api/places/:id
router.delete("/:id", deletePlace);     // delete whole document with help of id 

// Export router
module.exports = router;

