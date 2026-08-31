const mongoose = require("mongoose");

// Function to connect our backend to MongoDB
const connectDB = async () => {
    try {
        // Connect to MongoDB using the URI stored in .env
        await mongoose.connect(process.env.MONGO_URI);

        console.log("✅ MongoDB connected successfully");
    } catch (error) {
        // Show the error if connection fails
        console.error("❌ MongoDB connection failed:", error.message);

        // Stop the server because the database is essential
        process.exit(1);
    }
};

module.exports = connectDB;