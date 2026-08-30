const express = require("express");

const router = express.Router();

const {
    createChangeRequest,
    getChangeRequests,
    getMyChangeRequests,
    approveChangeRequest,
    rejectChangeRequest,
    getMyChangeRequestById
} = require("../controllers/changeRequestController");

const {
    verifyJWT
} = require("../middleware/authMiddleware");

const {
    requireAdmin
} = require("../middleware/adminMiddleware");


// ==========================================
// USER
// ==========================================

// Submit change request
// Any authenticated user can submit
router.post(
    "/",
    verifyJWT,
    createChangeRequest
);


// ==========================================
// USER - MY CHANGE REQUESTS
// ==========================================

// Logged-in user sees only their own requests
router.get(
    "/my",
    verifyJWT,
    getMyChangeRequests
);



// ==========================================
// USER - MY CHANGE REQUEST DETAILS
// ==========================================

router.get(
    "/my/:id",
    verifyJWT,
    getMyChangeRequestById
);


// ==========================================
// ADMIN
// ==========================================

// Get all change requests
router.get(
    "/",
    verifyJWT,
    requireAdmin,
    getChangeRequests
);


// Approve change request
router.patch(
    "/:id/approve",
    verifyJWT,
    requireAdmin,
    approveChangeRequest
);


// Reject change request
router.patch(
    "/:id/reject",
    verifyJWT,
    requireAdmin,
    rejectChangeRequest
);


module.exports = router;
