const express = require("express");

const router = express.Router();

const {
    registerUser,
    loginUser,
    getCurrentUser,
    logoutUser,
    refreshAccessToken,
    verifyEmail,
    resendVerificationEmail,
    forgotPassword,
    resetPassword,
    changePassword,
    deleteAccount
} = require("../controllers/authController");

const {
    verifyJWT
} = require("../middleware/authMiddleware");


// ==========================================
// PUBLIC AUTH ROUTES
// ==========================================

// Register
router.post(
    "/register",
    registerUser
);


// Login
router.post(
    "/login",
    loginUser
);


// Refresh access token
router.post(
    "/refresh",
    refreshAccessToken
);


// Verify email
router.get(
    "/verify-email/:token",
    verifyEmail
);


// Resend verification email
router.post(
    "/resend-verification",
    resendVerificationEmail
);

// Forgot password
router.post(
    "/forgot-password",
    forgotPassword
);


// Reset password
router.post(
    "/reset-password/:token",
    resetPassword
);

// ==========================================
// PROTECTED AUTH ROUTES
// ==========================================

// Current logged-in user
router.get(
    "/current-user",
    verifyJWT,
    getCurrentUser
);


// Logout
router.post(
    "/logout",
    verifyJWT,
    logoutUser
);

// Change password
router.post(
    "/change-password",
    verifyJWT,
    changePassword
);

// Delete account
router.delete(
    "/delete-account",
    verifyJWT,
    deleteAccount
);

// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;
