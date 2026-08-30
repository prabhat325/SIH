const express = require("express");

const {
  getCities,
  getCityById
} = require("../controllers/cityController");

const router = express.Router();

router.get("/", getCities);

router.get("/:cityId", getCityById);

module.exports = router;
