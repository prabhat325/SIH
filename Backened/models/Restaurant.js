const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
    {
        restaurantId: {
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

        cuisine: {
            type: [String],
            default: []
        },

        famousDishes: {
            type: [String],
            default: []
        },

        menu: {
            type: [
                {
                    food: {
                        type: String,
                        trim: true
                    },

                    price: {
                        type: Number,
                        min: 0,
                        default: null
                    }
                }
            ],
            default: []
        },

        averageCostForOne: {
            type: Number,
            min: 0,
            default: null
        },

        priceCategory: {
            type: String,
            enum: ["Budget", "Moderate", "Premium"],
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

module.exports = mongoose.model("Restaurant", restaurantSchema);

