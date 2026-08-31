const mongoose = require("mongoose");

const tourismPlaceSchema = new mongoose.Schema(
    {
        placeId: {
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

        category: {
            type: String,
            required: true,
            trim: true
        },

        popularity: {
            type: String,
            enum: ["Famous", "Popular", "Lesser-Known"],
            default: "Popular"
        },

        address: {
            type: String,
            default: null,
            trim: true
        },

        latitude: {
            type: Number,
            default: null
        },

        longitude: {
            type: Number,
            default: null
        },

        entryFee: {
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

        openingTime: {
            type: String,
            default: null
        },

        closingTime: {
            type: String,
            default: null
        },

        bestTimeToVisit: {
            type: String,
            default: null
        },

        specialFeatures: {
            type: [String],
            default: []
        },

        images: {
            type: [String],
            default: []
        },

        website: {
            type: String,
            default: null
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

module.exports = mongoose.model("TouristPlace", tourismPlaceSchema);