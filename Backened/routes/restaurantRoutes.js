const express = require("express");

const router = express.Router();

const {
    getRestaurants,
    getRestaurantsByCity,
    getRestaurantById,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant
} = require("../controllers/restaurantController");


// GET ALL
router.get("/", getRestaurants);

// GET BY CITY
router.get("/city/:city", getRestaurantsByCity);

// GET BY ID
router.get("/:id", getRestaurantById);

// CREATE
router.post("/", createRestaurant);

// UPDATE
router.put("/:id", updateRestaurant);

// DELETE
router.delete("/:id", deleteRestaurant);

module.exports = router;
