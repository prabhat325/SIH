const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
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
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },

        comment: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000
        }
    },
    {
        timestamps: true
    }
);


// One user can review a resource only once
reviewSchema.index(
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
    mongoose.model("Review", reviewSchema);