const Guide = require("../models/Guide");


// GET ALL GUIDES

// pagination + city filter + search implemented
const getGuides = async (req, res) => {
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

        // Search guide-related fields
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, "i");

            filter.$or = [
                { name: searchRegex },
                { city: searchRegex },
                { state: searchRegex },
                { languages: searchRegex },
                { specialization: searchRegex },
                { description: searchRegex }
            ];
        }

        const [guides, total] = await Promise.all([
            Guide.find(filter)
                .skip(skip)
                .limit(limit),

            Guide.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            data: guides
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch guides",
            error: error.message
        });
    }
};

// GET GUIDES BY CITY
const getGuidesByCity = async (req, res) => {
    try {
        const city = req.params.city;

        // Case-insensitive city search
        const guides = await Guide.find({
            city: {
                $regex: new RegExp(`^${city}$`, "i")
            }
        });

        res.status(200).json({
            success: true,
            city: city,
            count: guides.length,
            data: guides
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch guides by city",
            error: error.message
        });
    }
};


// GET GUIDE BY ID
const getGuideById = async (req, res) => {
    try {
        const guide = await Guide.findOne({
            guideId: req.params.id
        });

        if (!guide) {
            return res.status(404).json({
                success: false,
                message: "Guide not found"
            });
        }

        res.status(200).json({
            success: true,
            data: guide
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch guide",
            error: error.message
        });
    }
};


// CREATE GUIDE
const createGuide = async (req, res) => {
    try {
        const guide = await Guide.create(req.body);

        res.status(201).json({
            success: true,
            message: "Guide created successfully",
            data: guide
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Failed to create guide",
            error: error.message
        });
    }
};


// UPDATE GUIDE
const updateGuide = async (req, res) => {
    try {
        const guide = await Guide.findOneAndUpdate(
            { guideId: req.params.id },
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!guide) {
            return res.status(404).json({
                success: false,
                message: "Guide not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Guide updated successfully",
            data: guide
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Failed to update guide",
            error: error.message
        });
    }
};


// DELETE GUIDE
const deleteGuide = async (req, res) => {
    try {
        const guide = await Guide.findOneAndDelete({
            guideId: req.params.id
        });

        if (!guide) {
            return res.status(404).json({
                success: false,
                message: "Guide not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Guide deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete guide",
            error: error.message
        });
    }
};


module.exports = {
    getGuides,
    getGuidesByCity,
    getGuideById,
    createGuide,
    updateGuide,
    deleteGuide
};