const express = require("express");

const router = express.Router();

const {
    createReview,
    getReviews,
    updateReview,
    deleteReview,
    getMyReviews
} = require("../controllers/reviewController");

const {
    verifyJWT
} = require("../middleware/authMiddleware");



// ==========================================
// GET MY REVIEWS
// Authenticated user
// ==========================================

router.get(
    "/my",
    verifyJWT,
    getMyReviews
);


// ==========================================
// GET REVIEWS
// Public
// ==========================================

router.get(
    "/:resourceType/:resourceId",
    getReviews
);


// ==========================================
// CREATE REVIEW
// Authenticated user
// ==========================================

router.post(
    "/",
    verifyJWT,
    createReview
);


// ==========================================
// UPDATE OWN REVIEW
// ==========================================

router.patch(
    "/:id",
    verifyJWT,
    updateReview
);


// ==========================================
// DELETE OWN REVIEW
// ==========================================

router.delete(
    "/:id",
    verifyJWT,
    deleteReview
);


module.exports = router;
