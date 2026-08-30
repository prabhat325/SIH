const mongoose = require("mongoose");
const Hotel = require("../models/Hotel");

// GET /api/hotels

// whole search implemented with city filter and search with some fields of schema 

const getHotels = async (req, res) => {
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

        // Search hotel-related fields
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, "i");

            filter.$or = [
                { name: searchRegex },
                { city: searchRegex },
                { state: searchRegex },
                { address: searchRegex },
                { category: searchRegex },
                { amenities: searchRegex },
                { specialFeatures: searchRegex }
            ];
        }

        const [hotels, total] = await Promise.all([
            Hotel.find(filter)
                .skip(skip)
                .limit(limit),

            Hotel.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            data: hotels
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch hotels",
            error: error.message
        });
    }
};


// GET /api/hotels/city/:city
const getHotelsByCity = async (req, res) => {
    try {
        const city = req.params.city;

        const hotels = await Hotel.find({
            city: {
                $regex: new RegExp(`^${city}$`, "i")
            }
        });

        res.status(200).json({
            success: true,
            city: city,
            count: hotels.length,
            data: hotels
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch hotels by city",
            error: error.message
        });
    }
};


// GET /api/hotels/:id
const getHotelById = async (req, res) => {
    try {
        const id = req.params.id;

        let hotel = null;

        // First try MongoDB _id
        if (mongoose.Types.ObjectId.isValid(id)) {
            hotel = await Hotel.findById(id);
        }

        // Fallback for hotels using custom hotelId
        if (!hotel) {
            hotel = await Hotel.findOne({
                hotelId: id
            });
        }

        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: "Hotel not found"
            });
        }

        res.status(200).json({
            success: true,
            data: hotel
        });

    } catch (error) {
        console.error(
            "Get hotel by ID error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch hotel",
            error: error.message
        });
    }
};


// POST /api/hotels
const createHotel = async (req, res) => {
    try {
        const hotel = await Hotel.create(req.body);

        res.status(201).json({
            success: true,
            message: "Hotel created successfully",
            data: hotel
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Failed to create hotel",
            error: error.message
        });
    }
};


// PUT /api/hotels/:id
const updateHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findOneAndUpdate(
            { hotelId: req.params.id },
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: "Hotel not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Hotel updated successfully",
            data: hotel
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Failed to update hotel",
            error: error.message
        });
    }
};


// DELETE /api/hotels/:id
const deleteHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findOneAndDelete({
            hotelId: req.params.id
        });

        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: "Hotel not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Hotel deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete hotel",
            error: error.message
        });
    }
};


module.exports = {
    getHotels,
    getHotelsByCity,
    getHotelById,
    createHotel,
    updateHotel,
    deleteHotel
};
