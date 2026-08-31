const ChangeRequest = require("../models/ChangeRequest");


// ==========================================
// ADMIN DASHBOARD STATISTICS
// ==========================================

const getDashboardStats = async (req, res) => {
    try {

        const [
            total,
            pending,
            approved,
            rejected
        ] = await Promise.all([

            ChangeRequest.countDocuments(),

            ChangeRequest.countDocuments({
                status: "Pending"
            }),

            ChangeRequest.countDocuments({
                status: "Approved"
            }),

            ChangeRequest.countDocuments({
                status: "Rejected"
            })

        ]);


        res.status(200).json({

            success: true,

            data: {
                total,
                pending,
                approved,
                rejected
            }

        });

    } catch (error) {

        console.error(
            "Dashboard stats error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to fetch dashboard statistics",

            error: error.message

        });
    }
};


// ==========================================
// ADMIN - GET CHANGE REQUESTS
// Pagination + Search + Filters
// ==========================================

const getAdminChangeRequests = async (req, res) => {
    try {

        const {
            status,
            resourceType,
            requestType,
            search
        } = req.query;


        // ==========================================
        // PAGINATION
        // ==========================================

        let page =
            parseInt(req.query.page) || 1;

        let limit =
            parseInt(req.query.limit) || 10;


        // Prevent invalid page
        if (page < 1) {
            page = 1;
        }


        // Prevent invalid limit
        if (limit < 1) {
            limit = 10;
        }


        // Maximum 100 requests per page
        if (limit > 100) {
            limit = 100;
        }


        const skip =
            (page - 1) * limit;


        // ==========================================
        // BUILD FILTER
        // ==========================================

        const filter = {};


        // ==========================================
        // STATUS FILTER
        // ==========================================

        if (status) {

            if (
                ![
                    "Pending",
                    "Approved",
                    "Rejected"
                ].includes(status)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid status"

                });
            }


            filter.status = status;
        }


        // ==========================================
        // RESOURCE TYPE FILTER
        // ==========================================

        if (resourceType) {

            if (
                ![
                    "Place",
                    "Hotel",
                    "Restaurant",
                    "Event",
                    "Guide",
                    "Emergency",
                    "Vehicle"
                ].includes(resourceType)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid resource type"

                });
            }


            filter.resourceType =
                resourceType;
        }


        // ==========================================
        // REQUEST TYPE FILTER
        // ==========================================

        if (requestType) {

            if (
                ![
                    "CREATE",
                    "UPDATE",
                    "DELETE",
                    "REPORT"
                ].includes(requestType)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid request type"

                });
            }


            filter.requestType =
                requestType;
        }


        // ==========================================
        // SEARCH
        // ==========================================

        if (
            search &&
            search.trim()
        ) {

            const searchValue =
                search.trim();


            filter.$or = [

                {
                    requestId: {
                        $regex: searchValue,
                        $options: "i"
                    }
                },

                {
                    resourceId: {
                        $regex: searchValue,
                        $options: "i"
                    }
                },

                {
                    reason: {
                        $regex: searchValue,
                        $options: "i"
                    }
                }

            ];
        }


        // ==========================================
        // TOTAL COUNT
        // ==========================================

        const total =
            await ChangeRequest.countDocuments(
                filter
            );


        // ==========================================
        // GET REQUESTS
        // ==========================================

        const requests =
            await ChangeRequest
                .find(filter)

                .populate(
                    "submittedBy",
                    "username email fullName role"
                )

                .sort({
                    createdAt: -1
                })

                .skip(skip)

                .limit(limit);


        // ==========================================
        // PAGINATION INFORMATION
        // ==========================================

        const totalPages =
            Math.ceil(
                total / limit
            );


        // ==========================================
        // RESPONSE
        // ==========================================

        res.status(200).json({

            success: true,

            data: requests,

            pagination: {

                page,

                limit,

                total,

                totalPages,

                hasNextPage:
                    page < totalPages,

                hasPreviousPage:
                    page > 1

            }

        });


    } catch (error) {

        console.error(
            "Admin change requests error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to fetch admin change requests",

            error: error.message

        });
    }
};


// ==========================================
// ADMIN - GET SINGLE CHANGE REQUEST
// ==========================================

const getAdminChangeRequestById = async (req, res) => {

    try {

        const {
            id
        } = req.params;


        // ==========================================
        // FIND REQUEST
        // ==========================================

        const request =
            await ChangeRequest
                .findById(id)

                .populate(
                    "submittedBy",
                    "username email fullName role"
                );


        // ==========================================
        // REQUEST NOT FOUND
        // ==========================================

        if (!request) {

            return res.status(404).json({

                success: false,

                message:
                    "Change request not found"

            });
        }


        // ==========================================
        // RETURN REQUEST
        // ==========================================

        res.status(200).json({

            success: true,

            data: request

        });


    } catch (error) {

        console.error(
            "Admin change request details error:",
            error
        );


        // ==========================================
        // INVALID OBJECT ID
        // ==========================================

        if (
            error.name === "CastError"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid change request ID"

            });
        }


        res.status(500).json({

            success: false,

            message:
                "Failed to fetch change request",

            error: error.message

        });
    }
};


// ==========================================
// ADMIN - RECENT CHANGE REQUESTS
// ==========================================

const getRecentChangeRequests = async (req, res) => {

    try {

        const requests =
            await ChangeRequest
                .find({})

                .populate(
                    "submittedBy",
                    "username email fullName role"
                )

                .sort({
                    createdAt: -1
                })

                .limit(5);


        res.status(200).json({

            success: true,

            count:
                requests.length,

            data:
                requests

        });


    } catch (error) {

        console.error(
            "Recent requests error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to fetch recent requests",

            error: error.message

        });
    }
};


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    getDashboardStats,

    getAdminChangeRequests,

    getAdminChangeRequestById,

    getRecentChangeRequests

};