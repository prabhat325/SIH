const mongoose = require("mongoose");

const changeRequestSchema = new mongoose.Schema(
    {
        requestId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        // User who submitted this request
        submittedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        requestType: {
            type: String,
            required: true,
            enum: [
                "CREATE",
                "UPDATE",
                "DELETE",
                "REPORT"
            ]
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

        // ID of existing resource.
        // CREATE requests don't need this.
        resourceId: {
            type: String,
            default: null,
            trim: true
        },

        // Used for CREATE requests
        submittedData: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },

        // Used for UPDATE requests
        changes: {
            type: [
                {
                    field: {
                        type: String,
                        required: true,
                        trim: true
                    },

                    oldValue: {
                        type: mongoose.Schema.Types.Mixed,
                        default: null
                    },

                    newValue: {
                        type: mongoose.Schema.Types.Mixed,
                        default: null
                    }
                }
            ],
            default: []
        },

        reason: {
            type: String,
            required: true,
            trim: true
        },

        evidence: {
            type: [String],
            default: []
        },

        status: {
            type: String,
            enum: [
                "Pending",
                "Approved",
                "Rejected"
            ],
            default: "Pending"
        },

        adminNote: {
            type: String,
            default: null,
            trim: true
        },

        reviewedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "ChangeRequest",
    changeRequestSchema
);