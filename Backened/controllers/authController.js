const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/User");
const { sendEmail } = require("../utils/email");


// ==========================================
// COOKIE OPTIONS
// ==========================================

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
        process.env.NODE_ENV === "production"
            ? "none"
            : "lax"
};


// ==========================================
// GENERATE TOKENS
// ==========================================

const generateTokens = async (user) => {

    const accessToken =
        user.generateAccessToken();

    const refreshToken =
        user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({
        validateBeforeSave: false
    });

    return {
        accessToken,
        refreshToken
    };
};


// ==========================================
// REGISTER
// ==========================================

const registerUser = async (req, res) => {

    try {

        const {
            username,
            email,
            fullName,
            password
        } = req.body;


        if (
            !username ||
            !email ||
            !fullName ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "username, email, fullName and password are required"
            });
        }


        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must be at least 8 characters long"
            });
        }


        const existingUser =
            await User.findOne({
                $or: [
                    {
                        email:
                            email.toLowerCase()
                    },
                    {
                        username:
                            username.toLowerCase()
                    }
                ]
            });


        if (existingUser) {
            return res.status(409).json({
                success: false,
                message:
                    "Username or email already registered"
            });
        }


        // ==================================
        // Create user
        // ==================================

        const user = await User.create({

            username:
                username.toLowerCase(),

            email:
                email.toLowerCase(),

            fullName,

            password

            // role automatically = user
        });


        // ==================================
        // Generate verification token
        // ==================================

        const {
            unHashedToken,
            hashedToken,
            tokenExpiry
        } = user.generateTemporaryToken();


        user.emailVerificationToken =
            hashedToken;

        user.emailVerificationExpiry =
            tokenExpiry;


        await user.save({
            validateBeforeSave: false
        });


        // ==================================
        // Create verification URL
        // ==================================

        const verificationUrl =
            `${process.env.FRONTEND_URL}/verify-email/${unHashedToken}`;


        // ==================================
        // Send verification email
        // ==================================

        try {

            await sendEmail({

                to: user.email,

                subject:
                    "Verify your SIH Tourism account",

                html: `
                    <h2>Welcome to SIH Tourism!</h2>

                    <p>
                        Hi ${user.fullName},
                    </p>

                    <p>
                        Thank you for registering.
                        Please verify your email address.
                    </p>

                    <p>
                        <a href="${verificationUrl}">
                            Verify Email
                        </a>
                    </p>

                    <p>
                        This verification link expires
                        in 20 minutes.
                    </p>
                `
            });

            console.log(
                "Verification email sent to:",
                user.email
            );

        } catch (emailError) {

            console.error(
                "Verification email failed:",
                emailError.message
            );
        }


        // ==================================
        // Safe response
        // ==================================

        const safeUser =
            await User.findById(user._id)
                .select(
                    "-password -refreshToken -emailVerificationToken -forgotPasswordToken"
                );


        res.status(201).json({
    success: true,

    message:
        "User registered successfully. Please verify your email.",

    data: {
        user: safeUser
    }
});

    } catch (error) {

        if (error.code === 11000) {

            return res.status(409).json({
                success: false,
                message:
                    "Username or email already exists"
            });
        }


        res.status(500).json({
            success: false,
            message:
                "Failed to register user",
            error: error.message
        });
    }
};


// ==========================================
// LOGIN
// ==========================================

const loginUser = async (req, res) => {

    try {

        const {
            email,
            username,
            password
        } = req.body;


        if (!password) {

            return res.status(400).json({
                success: false,
                message:
                    "Password is required"
            });
        }


        if (!email && !username) {

            return res.status(400).json({
                success: false,
                message:
                    "Email or username is required"
            });
        }


        const query = email
            ? {
                email:
                    email.toLowerCase()
            }
            : {
                username:
                    username.toLowerCase()
            };


        const user =
            await User.findOne(query);


        if (!user) {

            return res.status(401).json({
                success: false,
                message:
                    "Invalid credentials"
            });
        }


        const passwordCorrect =
            await user.isPasswordCorrect(
                password
            );


        if (!passwordCorrect) {

            return res.status(401).json({
                success: false,
                message:
                    "Invalid credentials"
            });
        }

        if (!user.isEmailVerified) {
    return res.status(403).json({
        success: false,
        message:
            "Please verify your email before logging in"
    });
}


        const {
            accessToken,
            refreshToken
        } = await generateTokens(user);


        res
            .status(200)

            .cookie(
                "accessToken",
                accessToken,
                {
                    ...cookieOptions,
                    maxAge:
                        15 * 60 * 1000
                }
            )

            .cookie(
                "refreshToken",
                refreshToken,
                {
                    ...cookieOptions,
                    maxAge:
                        7 * 24 * 60 * 60 * 1000
                }
            )

            .json({

                success: true,

                message:
                    "Login successful",

                data: {

                    user: {
                        _id: user._id,
                        username:
                            user.username,
                        email:
                            user.email,
                        fullName:
                            user.fullName,
                        role:
                            user.role,
                        avatar:
                            user.avatar,
                        isEmailVerified:
                            user.isEmailVerified
                    },

                    accessToken
                }
            });

    } catch (error) {

        res.status(500).json({
            success: false,
            message:
                "Failed to login",
            error: error.message
        });
    }
};


// ==========================================
// CURRENT USER
// ==========================================

const getCurrentUser = async (req, res) => {

    res.status(200).json({

        success: true,

        data: req.user
    });
};


// ==========================================
// LOGOUT
// ==========================================

const logoutUser = async (req, res) => {

    try {

        await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    refreshToken: null
                }
            }
        );


        res
            .clearCookie(
                "accessToken",
                cookieOptions
            )
            .clearCookie(
                "refreshToken",
                cookieOptions
            )

            .status(200)

            .json({
                success: true,
                message:
                    "Logout successful"
            });

    } catch (error) {

        res.status(500).json({
            success: false,
            message:
                "Failed to logout",
            error: error.message
        });
    }
};


// ==========================================
// REFRESH ACCESS TOKEN
// ==========================================

const refreshAccessToken = async (req, res) => {

    try {

        const incomingRefreshToken =
            req.cookies?.refreshToken ||
            req.body?.refreshToken;


        if (!incomingRefreshToken) {

            return res.status(401).json({
                success: false,
                message:
                    "Refresh token is required"
            });
        }


        const decoded =
            jwt.verify(
                incomingRefreshToken,
                process.env.REFRESH_TOKEN_SECRET
            );


        const user =
            await User.findById(decoded._id);


        if (!user) {

            return res.status(401).json({
                success: false,
                message:
                    "Invalid refresh token"
            });
        }


        if (
            user.refreshToken !==
            incomingRefreshToken
        ) {

            return res.status(401).json({
                success: false,
                message:
                    "Refresh token is invalid or revoked"
            });
        }


        const accessToken =
            user.generateAccessToken();


        res
            .cookie(
                "accessToken",
                accessToken,
                {
                    ...cookieOptions,
                    maxAge:
                        15 * 60 * 1000
                }
            )

            .status(200)

            .json({

                success: true,

                message:
                    "Access token refreshed",

                data: {
                    accessToken
                }
            });

    } catch (error) {

        return res.status(401).json({
            success: false,
            message:
                "Invalid or expired refresh token"
        });
    }
};


// ==========================================
// VERIFY EMAIL
// ==========================================

const verifyEmail = async (req, res) => {

    try {

        const { token } = req.params;


        if (!token) {

            return res.status(400).json({
                success: false,
                message:
                    "Verification token is required"
            });
        }


        const hashedToken =
            crypto
                .createHash("sha256")
                .update(token)
                .digest("hex");


        const user =
            await User.findOne({

                emailVerificationToken:
                    hashedToken,

                emailVerificationExpiry: {
                    $gt: Date.now()
                }
            });


        if (!user) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid or expired verification token"
            });
        }


        user.isEmailVerified = true;

        user.emailVerificationToken = null;

        user.emailVerificationExpiry = null;


        await user.save({
            validateBeforeSave: false
        });


        res.status(200).json({

            success: true,

            message:
                "Email verified successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message:
                "Failed to verify email"
        });
    }
};


// ==========================================
// RESEND VERIFICATION EMAIL
// ==========================================

const resendVerificationEmail = async (
    req,
    res
) => {

    try {

        const { email } = req.body;


        if (!email) {

            return res.status(400).json({
                success: false,
                message:
                    "Email is required"
            });
        }


        const user =
            await User.findOne({
                email:
                    email.toLowerCase()
            });


        // Don't reveal whether an account exists
        if (!user) {

            return res.status(200).json({
                success: true,
                message:
                    "If the account exists, a verification email has been sent"
            });
        }


        if (user.isEmailVerified) {

            return res.status(400).json({
                success: false,
                message:
                    "Email is already verified"
            });
        }


        const {
            unHashedToken,
            hashedToken,
            tokenExpiry
        } = user.generateTemporaryToken();


        user.emailVerificationToken =
            hashedToken;

        user.emailVerificationExpiry =
            tokenExpiry;


        await user.save({
            validateBeforeSave: false
        });


        const verificationUrl =
            `${process.env.FRONTEND_URL}/verify-email/${unHashedToken}`;


        try {

            await sendEmail({

                to: user.email,

                subject:
                    "Verify your SIH Tourism account",

                html: `
                    <h2>Verify your SIH Tourism account</h2>

                    <p>
                        Hi ${user.fullName},
                    </p>

                    <p>
                        Please click the link below
                        to verify your email.
                    </p>

                    <p>
                        <a href="${verificationUrl}">
                            Verify Email
                        </a>
                    </p>

                    <p>
                        This link expires in 20 minutes.
                    </p>
                `
            });

            console.log(
                "Verification email resent to:",
                user.email
            );

        } catch (emailError) {

            console.error(
                "Verification email failed:",
                emailError.message
            );
        }


        res.status(200).json({

            success: true,

            message:
                "If the account exists, a verification email has been sent"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message:
                "Failed to resend verification email"
        });
    }
};


// ==========================================
// FORGOT PASSWORD
// ==========================================

const forgotPassword = async (req, res) => {

    try {

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }


        const user = await User.findOne({
            email: email.toLowerCase()
        });


        // Don't reveal whether an account exists
        if (!user) {
            return res.status(200).json({
                success: true,
                message:
                    "If an account exists with this email, a password reset link has been sent"
            });
        }


        // Generate temporary token
        const {
            unHashedToken,
            hashedToken,
            tokenExpiry
        } = user.generateTemporaryToken();


        user.forgotPasswordToken =
            hashedToken;

        user.forgotPasswordExpiry =
            tokenExpiry;


        await user.save({
            validateBeforeSave: false
        });


        // Create reset URL
        const resetUrl =
            `${process.env.FRONTEND_URL}/reset-password/${unHashedToken}`;


        try {

            await sendEmail({

                to: user.email,

                subject:
                    "Reset your SIH Tourism password",

                html: `
                    <h2>Password Reset</h2>

                    <p>
                        Hi ${user.fullName},
                    </p>

                    <p>
                        We received a request to reset
                        your SIH Tourism password.
                    </p>

                    <p>
                        <a href="${resetUrl}">
                            Reset Password
                        </a>
                    </p>

                    <p>
                        This link will expire
                        in 20 minutes.
                    </p>

                    <p>
                        If you did not request this,
                        you can safely ignore this email.
                    </p>
                `
            });

            console.log(
                "Password reset email sent to:",
                user.email
            );

        } catch (emailError) {

            console.error(
                "Password reset email failed:",
                emailError.message
            );
        }


        // Same response whether account exists or not
        return res.status(200).json({
            success: true,
            message:
                "If an account exists with this email, a password reset link has been sent"
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message:
                "Failed to process password reset request"
        });
    }
};


// ==========================================
// RESET PASSWORD
// ==========================================

const resetPassword = async (req, res) => {

    try {

        const { token } = req.params;

        const { newPassword } = req.body;


        if (!token) {
            return res.status(400).json({
                success: false,
                message:
                    "Reset token is required"
            });
        }


        if (!newPassword) {
            return res.status(400).json({
                success: false,
                message:
                    "New password is required"
            });
        }


        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must be at least 8 characters long"
            });
        }


        // Hash token from URL
        const hashedToken =
            crypto
                .createHash("sha256")
                .update(token)
                .digest("hex");


        // Find user with valid token
        const user =
            await User.findOne({

                forgotPasswordToken:
                    hashedToken,

                forgotPasswordExpiry: {
                    $gt: Date.now()
                }
            });


        if (!user) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid or expired password reset token"
            });
        }


        // Set new password
        user.password = newPassword;


        // Invalidate reset token
        user.forgotPasswordToken = null;

        user.forgotPasswordExpiry = null;


        // Revoke existing refresh token
        // so old sessions must authenticate again
        user.refreshToken = null;


        await user.save();


        return res.status(200).json({
            success: true,
            message:
                "Password reset successfully"
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message:
                "Failed to reset password"
        });
    }
};

// ==========================================
// CHANGE PASSWORD
// ==========================================

const changePassword = async (req, res) => {

    try {

        const {
            currentPassword,
            newPassword
        } = req.body;


        // ==================================
        // Validate input
        // ==================================

        if (
            !currentPassword ||
            !newPassword
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Current password and new password are required"
            });
        }


        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message:
                    "New password must be at least 8 characters long"
            });
        }


        if (
            currentPassword ===
            newPassword
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "New password must be different from current password"
            });
        }


        // ==================================
        // Get user with password
        // ==================================

        const user =
            await User.findById(
                req.user._id
            );


        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found"
            });
        }


        // ==================================
        // Verify current password
        // ==================================

        const isPasswordCorrect =
            await user.isPasswordCorrect(
                currentPassword
            );


        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message:
                    "Current password is incorrect"
            });
        }


        // ==================================
        // Set new password
        // pre-save hook will hash it
        // ==================================

        user.password =
            newPassword;


        // ==================================
        // Revoke refresh token
        //
        // This logs out existing sessions
        // ==================================

        user.refreshToken = null;


        await user.save();


        // ==================================
        // Clear current cookies
        // ==================================

        res
            .clearCookie(
                "accessToken",
                cookieOptions
            )
            .clearCookie(
                "refreshToken",
                cookieOptions
            )
            .status(200)
            .json({
                success: true,
                message:
                    "Password changed successfully. Please login again."
            });

    } catch (error) {

        res.status(500).json({
            success: false,
            message:
                "Failed to change password"
        });
    }
};

// ==========================================
// DELETE ACCOUNT
// ==========================================

const deleteAccount = async (req, res) => {
    try {

        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message:
                    "Password is required to delete account"
            });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Verify current password
        const isPasswordCorrect =
            await user.isPasswordCorrect(password);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Incorrect password"
            });
        }

        // Delete user
        await User.findByIdAndDelete(user._id);

        // Clear authentication cookies
        res
            .clearCookie(
                "accessToken",
                cookieOptions
            )
            .clearCookie(
                "refreshToken",
                cookieOptions
            )
            .status(200)
            .json({
                success: true,
                message:
                    "Account deleted successfully"
            });

    } catch (error) {

        console.error(
            "Delete account error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to delete account",
            error: error.message
        });
    }
};



// ==========================================
// EXPORT
// ==========================================

module.exports = {
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
};