const express = require("express");

const router = express.Router();

const {
    getHotels,
    getHotelsByCity,
    getHotelById,
    createHotel,
    updateHotel,
    deleteHotel
} = require("../controllers/hotelController");

// GET /api/hotels
router.get("/", getHotels);

// GET /api/hotels/city/:city
router.get("/city/:city", getHotelsByCity);

// GET /api/hotels/:id
router.get("/:id", getHotelById);

// POST /api/hotels
router.post("/", createHotel);

// PUT /api/hotels/:id
router.put("/:id", updateHotel);

// DELETE /api/hotels/:id
router.delete("/:id", deleteHotel);

module.exports = router;
