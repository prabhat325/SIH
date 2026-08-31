const mongoose = require("mongoose");

const emergencyServiceSchema = new mongoose.Schema(
    {
        serviceId: {
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

        type: {
            type: String,
            required: true,
            enum: [
                "Hospital",
                "Police Station",
                "Fire Station",
                "Ambulance"
            ]
        },

        address: {
            type: String,
            required: true,
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

        phone: {
            type: String,
            default: null
        },

        website: {
            type: String,
            default: null
        },

        available24x7: {
            type: Boolean,
            default: false
        },

        emergencyFacilities: {
            type: [String],
            default: []
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

module.exports = mongoose.model(
    "EmergencyService",
    emergencyServiceSchema
);