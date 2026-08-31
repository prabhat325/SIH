const Saved = require("../models/Saved");

// ==========================================
// VALID RESOURCE TYPES
// ==========================================

const validResourceTypes = [
    "Place",
    "Hotel",
    "Restaurant",
    "Event",
    "Guide",
    "Emergency",
    "Vehicle"
];


// ==========================================
// SAVE RESOURCE
// ==========================================

const saveResource = async (req, res) => {
    try {

        const {
            resourceType,
            resourceId
        } = req.body;


        // -----------------------------
        // Authentication
        // -----------------------------

        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }


        // -----------------------------
        // Validate input
        // -----------------------------

        if (!resourceType || !resourceId) {
            return res.status(400).json({
                success: false,
                message:
                    "resourceType and resourceId are required"
            });
        }


        if (!validResourceTypes.includes(resourceType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid resource type"
            });
        }


        // -----------------------------
        // Check duplicate
        // -----------------------------

        const existingSaved =
            await Saved.findOne({
                user: req.user._id,
                resourceType,
                resourceId
            });


        if (existingSaved) {
            return res.status(409).json({
                success: false,
                message:
                    "Resource is already saved"
            });
        }


        // -----------------------------
        // Save resource
        // -----------------------------

        const saved =
            await Saved.create({
                user: req.user._id,
                resourceType,
                resourceId
            });


        res.status(201).json({
            success: true,
            message:
                "Resource saved successfully",
            data: saved
        });

    } catch (error) {

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "Resource is already saved"
            });
        }

        console.error(
            "Save resource error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to save resource",
            error: error.message
        });
    }
};


// ==========================================
// GET USER'S SAVED RESOURCES
// ==========================================

const getSavedResources = async (req, res) => {
    try {

        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }


        const {
            resourceType
        } = req.query;


        const filter = {
            user: req.user._id
        };


        // Optional filter

        if (resourceType) {

            if (
                !validResourceTypes.includes(
                    resourceType
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid resource type"
                });
            }

            filter.resourceType =
                resourceType;
        }


        const saved =
            await Saved
                .find(filter)
                .sort({
                    createdAt: -1
                });


        res.status(200).json({
            success: true,
            count: saved.length,
            data: saved
        });

    } catch (error) {

        console.error(
            "Get saved resources error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to fetch saved resources",
            error: error.message
        });
    }
};


// ==========================================
// UNSAVE RESOURCE
// ==========================================

const unsaveResource = async (req, res) => {
    try {

        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }


        const {
            resourceType,
            resourceId
        } = req.params;


        // -----------------------------
        // Validate resource type
        // -----------------------------

        if (!validResourceTypes.includes(resourceType)) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid resource type"
            });
        }


        if (!resourceId) {
            return res.status(400).json({
                success: false,
                message:
                    "Resource ID is required"
            });
        }


        // -----------------------------
        // Delete only user's saved item
        // -----------------------------

        const deleted =
            await Saved.findOneAndDelete({
                user: req.user._id,
                resourceType,
                resourceId
            });


        if (!deleted) {
            return res.status(404).json({
                success: false,
                message:
                    "Saved resource not found"
            });
        }


        res.status(200).json({
            success: true,
            message:
                "Resource removed from saved items"
        });

    } catch (error) {

        console.error(
            "Unsave resource error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to remove saved resource",
            error: error.message
        });
    }
};


module.exports = {
    saveResource,
    getSavedResources,
    unsaveResource
};