const Emergency = require("../models/Emergency");


// GET ALL EMERGENCY SERVICES



const getEmergencies = async (req, res) => {
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

        // Filter by emergency type
        if (req.query.type) {
            filter.type = {
                $regex: new RegExp(`^${req.query.type}$`, "i")
            };
        }

        // Search emergency fields
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, "i");

            filter.$or = [
                { name: searchRegex },
                { city: searchRegex },
                { state: searchRegex },
                { type: searchRegex },
                { address: searchRegex },
                { emergencyFacilities: searchRegex }
            ];
        }

        const [emergency, total] = await Promise.all([
            Emergency.find(filter)
                .skip(skip)
                .limit(limit),

            Emergency.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            data: emergency
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch emergency services",
            error: error.message
        });
    }
};

// GET EMERGENCY SERVICES BY CITY
const getEmergenciesByCity = async (req, res) => {
    try {
        const city = req.params.city;

        // Case-insensitive city search
        const emergencies = await Emergency.find({
            city: {
                $regex: new RegExp(`^${city}$`, "i")
            }
        });

        res.status(200).json({
            success: true,
            city: city,
            count: emergencies.length,
            data: emergencies
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch emergency services by city",
            error: error.message
        });
    }
};


// GET EMERGENCY SERVICE BY ID
const getEmergencyById = async (req, res) => {
    try {
        const emergency = await Emergency.findOne({
            serviceId: req.params.id
        });

        if (!emergency) {
            return res.status(404).json({
                success: false,
                message: "Emergency service not found"
            });
        }

        res.status(200).json({
            success: true,
            data: emergency
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch emergency service",
            error: error.message
        });
    }
};


// CREATE EMERGENCY SERVICE
const createEmergency = async (req, res) => {
    try {
        const emergency = await Emergency.create(req.body);

        res.status(201).json({
            success: true,
            message: "Emergency service created successfully",
            data: emergency
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Failed to create emergency service",
            error: error.message
        });
    }
};


// UPDATE EMERGENCY SERVICE
const updateEmergency = async (req, res) => {
    try {
        const emergency = await Emergency.findOneAndUpdate(
            { serviceId: req.params.id },
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!emergency) {
            return res.status(404).json({
                success: false,
                message: "Emergency service not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Emergency service updated successfully",
            data: emergency
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Failed to update emergency service",
            error: error.message
        });
    }
};


// DELETE EMERGENCY SERVICE
const deleteEmergency = async (req, res) => {
    try {
        const emergency = await Emergency.findOneAndDelete({
            serviceId: req.params.id
        });

        if (!emergency) {
            return res.status(404).json({
                success: false,
                message: "Emergency service not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Emergency service deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete emergency service",
            error: error.message
        });
    }
};


module.exports = {
    getEmergencies,
    getEmergenciesByCity,
    getEmergencyById,
    createEmergency,
    updateEmergency,
    deleteEmergency
};

/*

Endpoints we'll get

GET    /api/emergency
GET    /api/emergency/city/:city
GET    /api/emergency/:id
POST   /api/emergency
PUT    /api/emergency/:id
DELETE /api/emergency/:id

*/ 