const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
    {
        eventId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        city: {
            type: String,
            required: true,
            trim: true
        },

        state: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: "",
            trim: true
        },

        type: {
            type: String,
            required: true,
            enum: [
                "Festival",
                "Religious",
                "Cultural",
                "Sports",
                "Fair",
                "Exhibition",
                "Concert",
                "Other"
            ]
        },

        venue: {
            type: String,
            default: null,
            trim: true
        },

        usualMonth: {
            type: String,
            default: null,
            trim: true
        },

        usualTime: {
            type: String,
            default: null,
            trim: true
        },

        usualDuration: {
            type: String,
            default: null,
            trim: true
        },

        recurring: {
            type: Boolean,
            default: true
        },

        frequency: {
            type: String,
            enum: [
                "Yearly",
                "Monthly",
                "Seasonal",
                "Other"
            ],
            default: "Yearly"
        },

        website: {
            type: String,
            default: null
        },

        images: {
            type: [String],
            default: []
        },

        available: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Event", eventSchema);