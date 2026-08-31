const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            minlength: 3,
            maxlength: 30
        },

        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },

        fullName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        password: {
            type: String,
            required: true,
            minlength: 8
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        },

        avatar: {
            type: String,
            default: null
        },

        isEmailVerified: {
            type: Boolean,
            default: false
        },

        refreshToken: {
            type: String,
            default: null
        },

        emailVerificationToken: {
            type: String,
            default: null
        },

        emailVerificationExpiry: {
            type: Date,
            default: null
        },

        forgotPasswordToken: {
            type: String,
            default: null
        },

        forgotPasswordExpiry: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);


// ==========================================
// HASH PASSWORD
// ==========================================

userSchema.pre("save", async function () {

    if (!this.isModified("password")) {
        return ;
    }

    this.password = await bcrypt.hash(
        this.password,
        12
    );
});


// ==========================================
// CHECK PASSWORD
// ==========================================

userSchema.methods.isPasswordCorrect =
    async function (password) {

        return await bcrypt.compare(
            password,
            this.password
        );
    };


// ==========================================
// ACCESS TOKEN
// ==========================================

userSchema.methods.generateAccessToken =
    function () {

        return jwt.sign(
            {
                _id: this._id,
                username: this.username,
                email: this.email,
                role: this.role
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn:
                    process.env.ACCESS_TOKEN_EXPIRY || "15m"
            }
        );
    };


// ==========================================
// REFRESH TOKEN
// ==========================================

userSchema.methods.generateRefreshToken =
    function () {

        return jwt.sign(
            {
                _id: this._id
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn:
                    process.env.REFRESH_TOKEN_EXPIRY || "7d"
            }
        );
    };


// ==========================================
// TEMPORARY TOKEN
// Used for email verification / password reset
// ==========================================

userSchema.methods.generateTemporaryToken =
    function () {

        const unHashedToken =
            crypto.randomBytes(32).toString("hex");

        const hashedToken =
            crypto
                .createHash("sha256")
                .update(unHashedToken)
                .digest("hex");

        const tokenExpiry =
            Date.now() + 20 * 60 * 1000;

        return {
            unHashedToken,
            hashedToken,
            tokenExpiry
        };
    };


module.exports = mongoose.model(
    "User",
    userSchema
);