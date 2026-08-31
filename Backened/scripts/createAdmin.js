require("dotenv").config();

const connectDB = require("../config/db");
const User = require("../models/User");

const createAdmin = async () => {
    try {

        await connectDB();

        const email =
            "vaibhav.20253310@mnnit.ac.in";

        const user =
            await User.findOne({ email });

        if (!user) {
            console.log("❌ User not found");
            process.exit(1);
        }

        user.role = "admin";

        await user.save();

        console.log(
            "✅ Admin role assigned successfully"
        );

        console.log(
            "Email:",
            user.email
        );

        console.log(
            "Role:",
            user.role
        );

        process.exit(0);

    } catch (error) {

        console.error(
            "❌ Failed to assign admin role:",
            error
        );

        process.exit(1);
    }
};

createAdmin();