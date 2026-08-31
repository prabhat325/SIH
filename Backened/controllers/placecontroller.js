const TouristPlace = require("../models/TouristPlace");

// Controller to get all tourist places

//city + search + pagination together. 🔥


const getPlaces = async (req, res) => {
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

        // Search relevant place fields
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, "i");

            filter.$or = [
                { name: searchRegex },
                { description: searchRegex },
                { category: searchRegex },
                { city: searchRegex },
                { state: searchRegex }
            ];
        }

        const [places, total] = await Promise.all([
            TouristPlace.find(filter)
                .skip(skip)
                .limit(limit),

            TouristPlace.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            data: places
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch places",
            error: error.message
        });
    }
};

// get  a place by city name 

const getPlacesByCity = async (req, res) => {
    try {
        const places = await TouristPlace.find({
            city: {
                $regex: `^${req.params.city}$`,
                $options: "i"
            }
        });

        res.status(200).json({
            count: places.length,
            places
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching places by city",
            error: error.message
        });
    }
};

// Create a new tourist place
const createPlace = async (req, res) => {
    try {

        // Get the data sent by the client
        const {
            name,
            description,
            category,
            state,
            city,
            address,
            latitude,
            longitude,
            entryFee,
            rating
        } = req.body;

        // Create a new document in MongoDB
        const place = await TouristPlace.create({
            name,
            description,
            category,
            state,
            city,
            address,
            latitude,
            longitude,
            entryFee,
            rating
        });

        // Send the newly created place back
        res.status(201).json(place);

    } catch (error) {

        res.status(500).json({
            message: "Failed to create tourist place",
            error: error.message
        });
    }
};





// Get a single tourist place by ID
const getPlaceById = async (req, res) => {
    try {

        // Get the ID from the URL
        const { id } = req.params;

        // Find the place using its MongoDB ID
        const place = await TouristPlace.findById(id);

        // If place doesn't exist
        if (!place) {
            return res.status(404).json({
                message: "Tourist place not found"
            });
        }

        // Send the place
        res.json(place);

    } catch (error) {

        res.status(500).json({
            message: "Failed to fetch tourist place",
            error: error.message
        });
    }
};





// Update a tourist place
const updatePlace = async (req, res) => {
    try {

        // ID comes from the URL
        const { id } = req.params;

        // Data to update comes from request body
        const updatedPlace = await TouristPlace.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        // If ID doesn't exist
        if (!updatedPlace) {
            return res.status(404).json({
                message: "Tourist place not found"
            });
        }

        res.json(updatedPlace);

    } catch (error) {
        res.status(500).json({
            message: "Failed to update tourist place",
            error: error.message
        });
    }
};





// Delete a tourist place
const deletePlace = async (req, res) => {
    try {

        const { id } = req.params;

        const deletedPlace = await TouristPlace.findByIdAndDelete(id);

        if (!deletedPlace) {
            return res.status(404).json({
                message: "Tourist place not found"
            });
        }

        res.json({
            message: "Tourist place deleted successfully",
            place: deletedPlace
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete tourist place",
            error: error.message
        });
    }
};


// Export the controller function
module.exports = {
    getPlaces,
    createPlace,
    getPlaceById,
    updatePlace,
    deletePlace,
    getPlacesByCity
};


