const Vehicle = require("../models/Vehicle");


// GET ALL TRANSPORTATION OPTIONS



const getVehicles = async (req, res) => {
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

        // Filter by vehicle type
        if (req.query.vehicleType) {
            filter.vehicleType = {
                $regex: new RegExp(`^${req.query.vehicleType}$`, "i")
            };
        }

        // Search vehicle-related fields
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, "i");

            filter.$or = [
                { vehicleType: searchRegex },
                { city: searchRegex },
                { state: searchRegex },
                { "contacts.name": searchRegex }
            ];
        }

        const [vehicles, total] = await Promise.all([
            Vehicle.find(filter)
                .skip(skip)
                .limit(limit),

            Vehicle.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            data: vehicles
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch vehicles",
            error: error.message
        });
    }
};


// GET VEHICLES BY CITY
const getVehiclesByCity = async (req, res) => {
    try {
        const city = req.params.city;

        // Case-insensitive city search
        const vehicles = await Vehicle.find({
            city: {
                $regex: new RegExp(`^${city}$`, "i")
            }
        });

        res.status(200).json({
            success: true,
            city: city,
            count: vehicles.length,
            data: vehicles
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch vehicles by city",
            error: error.message
        });
    }
};


// GET VEHICLE BY ID
const getVehicleById = async (req, res) => {
    try {
        const vehicle = await Vehicle.findOne({
            vehicleId: req.params.id
        });

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found"
            });
        }

        res.status(200).json({
            success: true,
            data: vehicle
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch vehicle",
            error: error.message
        });
    }
};


// CREATE VEHICLE
const createVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.create(req.body);

        res.status(201).json({
            success: true,
            message: "Vehicle created successfully",
            data: vehicle
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Failed to create vehicle",
            error: error.message
        });
    }
};


// UPDATE VEHICLE
const updateVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findOneAndUpdate(
            { vehicleId: req.params.id },
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Vehicle updated successfully",
            data: vehicle
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Failed to update vehicle",
            error: error.message
        });
    }
};


// DELETE VEHICLE
const deleteVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findOneAndDelete({
            vehicleId: req.params.id
        });

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Vehicle deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete vehicle",
            error: error.message
        });
    }
};


module.exports = {
    getVehicles,
    getVehiclesByCity,
    getVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle
};