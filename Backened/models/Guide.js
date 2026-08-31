const mongoose = require("mongoose");

const guideSchema = new mongoose.Schema(
    {
        guideId: {
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

        languages: {
            type: [String],
            default: []
        },

        specialization: {
            type: [String],
            default: []
        },

        experienceYears: {
            type: Number,
            min: 0,
            default: 0
        },

        rating: {
            type: Number,
            min: 0,
            max: 5,
            default: null
        },

        contact: {
            type: String,
            default: null
        },

        email: {
            type: String,
            default: null,
            lowercase: true,
            trim: true
        },

        pricePerHour: {
            type: Number,
            min: 0,
            default: null
        },

        description: {
            type: String,
            default: "",
            trim: true
        },

        image: {
            type: String,
            default: null
        },

        verified: {
            type: Boolean,
            default: false
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

module.exports = mongoose.model("Guide", guideSchema);