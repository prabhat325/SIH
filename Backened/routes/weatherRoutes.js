const express = require("express");

const router = express.Router();

const {
    getWeather
} = require("../controllers/weatherController");


// ==========================================
// GET WEATHER BY CITY
// Public endpoint
// ==========================================

router.get(
    "/:city",
    getWeather
);

module.exports = router;
