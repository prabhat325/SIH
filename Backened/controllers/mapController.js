const TouristPlace = require("../models/TouristPlace");
const Hotel = require("../models/Hotel");
const Restaurant = require("../models/Restaurant");
const Emergency = require("../models/Emergency");

const getCityMapData = async (req, res) => {
    try {
        const { city } = req.params;

        if (!city) {
            return res.status(400).json({
                success: false,
                message: "City is required"
            });
        }

        const cityRegex = new RegExp(`^${city}$`, "i");

        const [places, hotels, restaurants, emergency] =
            await Promise.all([
                TouristPlace.find({
                    city: cityRegex,
                    latitude: { $ne: null },
                    longitude: { $ne: null }
                }).select("_id name city latitude longitude category"),

                Hotel.find({
                    city: cityRegex,
                    latitude: { $ne: null },
                    longitude: { $ne: null }
                }).select("_id hotelId name city latitude longitude category"),

                Restaurant.find({
                    city: cityRegex,
                    latitude: { $ne: null },
                    longitude: { $ne: null }
                }).select("_id restaurantId name city latitude longitude cuisine"),

                Emergency.find({
                    city: cityRegex,
                    latitude: { $ne: null },
                    longitude: { $ne: null }
                }).select("_id serviceId name city type address latitude longitude")
            ]);

        res.status(200).json({
            success: true,
            city,
            data: {
                places,
                hotels,
                restaurants,
                emergency
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch map data",
            error: error.message
        });
    }
};

module.exports = {
    getCityMapData
};