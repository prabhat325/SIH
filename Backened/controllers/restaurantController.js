const mongoose = require("mongoose");
const Restaurant = require("../models/Restaurant");

// GET ALL RESTAURANTS

// implemented pagination + city filter + 

const getRestaurants = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);

        const limit = Math.min(
            Math.max(parseInt(req.query.limit) || 10, 1),
            50
        );

        const skip = (page - 1) * limit;

        const filter = {};

        // Filter by city
        if (req.query.city) {
            filter.city = {
                $regex: new RegExp(`^${req.query.city}$`, "i")
            };
        }

        // Search restaurant-related fields
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, "i");

            filter.$or = [
                { name: searchRegex },
                { city: searchRegex },
                { state: searchRegex },
                { address: searchRegex },
                { cuisine: searchRegex },
                { famousDishes: searchRegex },
                { "menu.food": searchRegex },
                { priceCategory: searchRegex },
                { amenities: searchRegex },
                { specialFeatures: searchRegex }
            ];
        }

        const [restaurants, total] = await Promise.all([
            Restaurant.find(filter)
                .skip(skip)
                .limit(limit),

            Restaurant.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            data: restaurants
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch restaurants",
            error: error.message
        });
    }
};


// GET RESTAURANTS BY CITY
const getRestaurantsByCity = async (req, res) => {
    try {
        const city = req.params.city;

        // Case-insensitive city search
        const restaurants = await Restaurant.find({
            city: {
                $regex: new RegExp(`^${city}$`, "i")
            }
        });

        res.status(200).json({
            success: true,
            city: city,
            count: restaurants.length,
            data: restaurants
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch restaurants by city",
            error: error.message
        });
    }
};


// GET RESTAURANT BY ID
const getRestaurantById = async (req, res) => {
    try {
        const id = req.params.id;

        let restaurant = null;

        // First try MongoDB _id
        if (mongoose.Types.ObjectId.isValid(id)) {
            restaurant = await Restaurant.findById(id);
        }

        // Fallback to custom restaurantId
        if (!restaurant) {
            restaurant = await Restaurant.findOne({
                restaurantId: id
            });
        }

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found"
            });
        }

        res.status(200).json({
            success: true,
            data: restaurant
        });

    } catch (error) {
        console.error(
            "Get restaurant by ID error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch restaurant",
            error: error.message
        });
    }
};


// CREATE RESTAURANT
const createRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.create(req.body);

        res.status(201).json({
            success: true,
            message: "Restaurant created successfully",
            data: restaurant
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Failed to create restaurant",
            error: error.message
        });
    }
};


// UPDATE RESTAURANT
const updateRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOneAndUpdate(
            { restaurantId: req.params.id },
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Restaurant updated successfully",
            data: restaurant
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Failed to update restaurant",
            error: error.message
        });
    }
};


// DELETE RESTAURANT
const deleteRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOneAndDelete({
            restaurantId: req.params.id
        });

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Restaurant deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete restaurant",
            error: error.message
        });
    }
};



module.exports = {
    getRestaurants,
    getRestaurantsByCity,
    getRestaurantById,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant
};
