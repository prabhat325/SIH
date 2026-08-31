const mongoose = require("mongoose");

const citySchema = new mongoose.Schema(
    {
        cityId: {
            type: String,
            required: true,
            unique: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        state: {
            type: String,
            required: true,
            trim: true
        },

        country: {
            type: String,
            default: "India",
            trim: true
        },

        description: {
            type: String,
            default: "",
            trim: true
        },

        tourismPriority: {
            type: String,
            enum: [
                "Very High",
                "High",
                "Medium"
            ],
            default: "Medium"
        },

        famousFor: [{
            type: String,
            trim: true
        }],

        bestTimeToVisit: {
            type: String,
            default: null
        },

        latitude: {
            type: Number,
            default: null
        },

        longitude: {
            type: Number,
            default: null
        },

        images: [{
            type: String
        }],

        officialWebsite: {
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

module.exports = mongoose.model("City", citySchema);