const jwt = require("jsonwebtoken");
const User = require("../models/User");

const verifyJWT = async (req, res, next) => {
    try {
        let token = req.cookies?.accessToken;
        if (
            !token &&
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer ")
        ) {
            token =
                req.headers.authorization.split(" ")[1];
        }
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const decoded =
            jwt.verify(
                token,
                process.env.ACCESS_TOKEN_SECRET
            );        

        const user =
            await User.findById(decoded._id)
                .select("-password -refreshToken");


        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User no longer exists"
            });
        }

        req.user = user;

        next();

    } catch (error) {

        return res.status(401).json({
            success: false,
            message: "Invalid or expired access token"
        });
    }
};


module.exports = {
    verifyJWT
};
