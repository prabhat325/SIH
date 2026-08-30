const Review = require("../models/Review");

// ==========================================
// CREATE REVIEW
// ==========================================

const createReview = async (req, res) => {
    try {
        const {
            resourceType,
            resourceId,
            rating,
            comment
        } = req.body;

        // -----------------------------
        // Authentication
        // -----------------------------

        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        // -----------------------------
        // Required fields
        // -----------------------------

        if (
            !resourceType ||
            !resourceId ||
            rating === undefined ||
            !comment
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "resourceType, resourceId, rating and comment are required"
            });
        }

        // -----------------------------
        // Validate resource type
        // -----------------------------

        const validResourceTypes = [
            "Place",
            "Hotel",
            "Restaurant",
            "Event",
            "Guide",
            "Emergency",
            "Vehicle"
        ];

        if (!validResourceTypes.includes(resourceType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid resource type"
            });
        }

        // -----------------------------
        // Validate rating
        // -----------------------------

        if (
            !Number.isInteger(Number(rating)) ||
            Number(rating) < 1 ||
            Number(rating) > 5
        ) {
            return res.status(400).json({
                success: false,
                message: "Rating must be an integer between 1 and 5"
            });
        }

        // -----------------------------
        // Validate comment
        // -----------------------------

        const cleanComment = comment.trim();

        if (!cleanComment) {
            return res.status(400).json({
                success: false,
                message: "Comment cannot be empty"
            });
        }

        if (cleanComment.length > 1000) {
            return res.status(400).json({
                success: false,
                message:
                    "Comment cannot exceed 1000 characters"
            });
        }

        // -----------------------------
        // Prevent duplicate review
        // -----------------------------

        const existingReview = await Review.findOne({
            user: req.user._id,
            resourceType,
            resourceId
        });

        if (existingReview) {
            return res.status(409).json({
                success: false,
                message:
                    "You have already reviewed this resource"
            });
        }

        // -----------------------------
        // Create review
        // -----------------------------

        const review = await Review.create({
            user: req.user._id,
            resourceType,
            resourceId,
            rating: Number(rating),
            comment: cleanComment
        });

        // -----------------------------
        // Populate user information
        // -----------------------------

        await review.populate(
            "user",
            "username fullName avatar"
        );

        res.status(201).json({
            success: true,
            message: "Review submitted successfully",
            data: review
        });

    } catch (error) {

        // MongoDB duplicate index protection
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "You have already reviewed this resource"
            });
        }

        console.error(
            "Create review error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to create review",
            error: error.message
        });
    }
};


// ==========================================
// GET REVIEWS FOR RESOURCE
// ==========================================

const getReviews = async (req, res) => {
    try {

        const {
            resourceType,
            resourceId
        } = req.params;

        const validResourceTypes = [
            "Place",
            "Hotel",
            "Restaurant",
            "Event",
            "Guide",
            "Emergency",
            "Vehicle"
        ];

        if (!validResourceTypes.includes(resourceType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid resource type"
            });
        }

        if (!resourceId) {
            return res.status(400).json({
                success: false,
                message: "Resource ID is required"
            });
        }

        const reviews = await Review
            .find({
                resourceType,
                resourceId
            })
            .populate(
                "user",
                "username fullName avatar"
            )
            .sort({
                createdAt: -1
            });

        // -----------------------------
        // Calculate rating summary
        // -----------------------------

        const totalReviews = reviews.length;

        const totalRating = reviews.reduce(
            (sum, review) =>
                sum + review.rating,
            0
        );

        const averageRating =
            totalReviews > 0
                ? Number(
                    (
                        totalRating /
                        totalReviews
                    ).toFixed(1)
                )
                : 0;

        res.status(200).json({
            success: true,

            data: {
                reviews,
                summary: {
                    totalReviews,
                    averageRating
                }
            }
        });

    } catch (error) {

        console.error(
            "Get reviews error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch reviews",
            error: error.message
        });
    }
};


// ==========================================
// UPDATE OWN REVIEW
// ==========================================

const updateReview = async (req, res) => {
    try {

        const { id } = req.params;

        const {
            rating,
            comment
        } = req.body;

        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        if (
            rating === undefined &&
            comment === undefined
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Rating or comment is required"
            });
        }

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        // -----------------------------
        // Ownership check
        // -----------------------------

        if (
            review.user.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You can only update your own review"
            });
        }

        // -----------------------------
        // Update rating
        // -----------------------------

        if (rating !== undefined) {

            if (
                !Number.isInteger(Number(rating)) ||
                Number(rating) < 1 ||
                Number(rating) > 5
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Rating must be an integer between 1 and 5"
                });
            }

            review.rating = Number(rating);
        }

        // -----------------------------
        // Update comment
        // -----------------------------

        if (comment !== undefined) {

            const cleanComment =
                comment.trim();

            if (!cleanComment) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Comment cannot be empty"
                });
            }

            if (cleanComment.length > 1000) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Comment cannot exceed 1000 characters"
                });
            }

            review.comment =
                cleanComment;
        }

        await review.save();

        await review.populate(
            "user",
            "username fullName avatar"
        );

        res.status(200).json({
            success: true,
            message:
                "Review updated successfully",
            data: review
        });

    } catch (error) {

        console.error(
            "Update review error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to update review",
            error: error.message
        });
    }
};


// ==========================================
// DELETE OWN REVIEW
// ==========================================

const deleteReview = async (req, res) => {
    try {

        const { id } = req.params;

        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const review =
            await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        // -----------------------------
        // Ownership check
        // -----------------------------

        if (
            review.user.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You can only delete your own review"
            });
        }

        await Review.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message:
                "Review deleted successfully"
        });

    } catch (error) {

        console.error(
            "Delete review error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to delete review",
            error: error.message
        });
    }
};


// ==========================================
// GET MY REVIEWS
// Authenticated user
// ==========================================

const getMyReviews = async (req, res) => {
    try {

        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const reviews = await Review
            .find({
                user: req.user._id
            })
            .sort({
                createdAt: -1
            });

        return res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });

    } catch (error) {

        console.error(
            "Get my reviews error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch your reviews",
            error: error.message
        });
    }
};


module.exports = {
    createReview,
    getReviews,
    updateReview,
    deleteReview,
    getMyReviews
};
