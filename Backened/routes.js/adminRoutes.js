const express = require("express");

const router = express.Router();



const {
    getDashboardStats,
    getAdminChangeRequests,
    getAdminChangeRequestById,
    getRecentChangeRequests
} = require("../controllers/adminController");

const {
    approveChangeRequest,
    rejectChangeRequest
} = require("../controllers/changeRequestController");


const {
    verifyJWT
} = require("../middleware/authMiddleware");

const {
    requireAdmin
} = require("../middleware/adminMiddleware");


// ==========================================
// ADMIN - DASHBOARD STATISTICS
// ==========================================

router.get(
    "/dashboard/stats",
    verifyJWT,
    requireAdmin,
    getDashboardStats
);


// ==========================================
// ADMIN - CHANGE REQUEST LIST
// ==========================================

router.get(
    "/change-requests",
    verifyJWT,
    requireAdmin,
    getAdminChangeRequests
);


// ==========================================
// ADMIN - CHANGE REQUEST DETAILS
// ==========================================

router.get(
    "/change-requests/:id",
    verifyJWT,
    requireAdmin,
    getAdminChangeRequestById
);

// ==========================================
// ADMIN - RECENT CHANGE REQUESTS
// ==========================================

router.get(
    "/dashboard/recent-requests",
    verifyJWT,
    requireAdmin,
    getRecentChangeRequests
);

// ==========================================
// ADMIN - APPROVE CHANGE REQUEST
// ==========================================

router.patch(
    "/change-requests/:id/approve",
    verifyJWT,
    requireAdmin,
    approveChangeRequest
);


// ==========================================
// ADMIN - REJECT CHANGE REQUEST
// ==========================================

router.patch(
    "/change-requests/:id/reject",
    verifyJWT,
    requireAdmin,
    rejectChangeRequest
);


module.exports = router;
