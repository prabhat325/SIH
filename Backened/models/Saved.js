const mongoose = require("mongoose");

const savedSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        resourceType: {
            type: String,
            required: true,
            enum: [
                "Place",
                "Hotel",
                "Restaurant",
                "Event",
                "Guide",
                "Emergency",
                "Vehicle"
            ]
        },

        resourceId: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);


// Prevent the same user from saving
// the same resource more than once
savedSchema.index(
    {
        user: 1,
        resourceType: 1,
        resourceId: 1
    },
    {
        unique: true
    }
);


module.exports =
    mongoose.model("Saved", savedSchema);