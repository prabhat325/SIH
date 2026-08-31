const express = require("express");

const router = express.Router();

const {
    getCityMapData
} = require("../controllers/mapController");

router.get("/:city", getCityMapData);

module.exports = router;
