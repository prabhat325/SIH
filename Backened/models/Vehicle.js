const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
    {
        vehicleId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        vehicleType: {
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

        baseFare: {
            type: Number,
            min: 0,
            default: 0
        },

        farePerKm: {
            type: Number,
            required: true,
            min: 0
        },

        averageSpeed: {
            type: Number,
            min: 1,
            default: null
        },

        contacts: {
            type: [
                {
                    name: {
                        type: String,
                        required: true,
                        trim: true
                    },

                    phone: {
                        type: String,
                        required: true,
                        trim: true
                    }
                }
            ],
            default: []
        },

        // Vehicle images
        images: {
            type: [String],
            required: true,
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

module.exports = mongoose.model("Vehicle", vehicleSchema);