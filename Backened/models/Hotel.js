const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema(
    {
        hotelId: {
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

        pricePerNight: {
            type: Number,
            min: 0,
            default: null
        },

        category: {
            type: String,
            enum: ["Budget", "Mid-Range", "Luxury"],
            required: true
        },

        rating: {
            type: Number,
            min: 0,
            max: 5,
            default: null
        },

        amenities: {
            type: [String],
            default: []
        },

        specialFeatures: {
            type: [String],
            default: []
        },

        images: {
            type: [String],
            default: []
        },

        phone: {
            type: String,
            default: null
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

module.exports = mongoose.model("Hotel", hotelSchema);