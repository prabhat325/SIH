const Event = require("../models/Event");


// GET ALL EVENTS

const getEvents = async (req, res) => {
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

        // Search event-related fields
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, "i");

            filter.$or = [
                { name: searchRegex },
                { city: searchRegex },
                { state: searchRegex },
                { description: searchRegex },
                { type: searchRegex },
                { venue: searchRegex },
                { usualMonth: searchRegex },
                { usualTime: searchRegex },
                { usualDuration: searchRegex },
                { frequency: searchRegex }
            ];
        }

        const [events, total] = await Promise.all([
            Event.find(filter)
                .skip(skip)
                .limit(limit),

            Event.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            data: events
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch events",
            error: error.message
        });
    }
};


// GET EVENTS BY CITY
const getEventsByCity = async (req, res) => {
    try {
        const city = req.params.city;

        // Case-insensitive city search
        const events = await Event.find({
            city: {
                $regex: new RegExp(`^${city}$`, "i")
            }
        });

        res.status(200).json({
            success: true,
            city: city,
            count: events.length,
            data: events
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch events by city",
            error: error.message
        });
    }
};


// GET EVENTS BY TYPE
const getEventsByType = async (req, res) => {
    try {
        const type = req.params.type;

        const events = await Event.find({
            type: {
                $regex: new RegExp(`^${type}$`, "i")
            }
        });

        res.status(200).json({
            success: true,
            type: type,
            count: events.length,
            data: events
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch events by type",
            error: error.message
        });
    }
};


// GET EVENT BY ID
const getEventById = async (req, res) => {
    try {
        const event = await Event.findOne({
            eventId: req.params.id
        });

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        res.status(200).json({
            success: true,
            data: event
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch event",
            error: error.message
        });
    }
};


// CREATE EVENT
const createEvent = async (req, res) => {
    try {
        const event = await Event.create(req.body);

        res.status(201).json({
            success: true,
            message: "Event created successfully",
            data: event
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Failed to create event",
            error: error.message
        });
    }
};


// UPDATE EVENT
const updateEvent = async (req, res) => {
    try {
        const event = await Event.findOneAndUpdate(
            { eventId: req.params.id },
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Event updated successfully",
            data: event
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Failed to update event",
            error: error.message
        });
    }
};


// DELETE EVENT
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findOneAndDelete({
            eventId: req.params.id
        });

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Event deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete event",
            error: error.message
        });
    }
};


module.exports = {
    getEvents,
    getEventsByCity,
    getEventsByType,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
};