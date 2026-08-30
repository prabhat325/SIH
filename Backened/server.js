// Import Express framework
// Express helps us create our backend server and APIs
const express = require("express");

// Import CORS
// CORS allows our frontend to communicate with this backend
const cors = require("cors");

// Import Helmet
// Helmet adds security-related HTTP headers to our responses
const helmet = require("helmet");

// Import Morgan
// Morgan logs incoming HTTP requests in the terminal
const morgan = require("morgan");

//middleware for error handling

const cookieParser = require("cookie-parser");

const {
  notFound, // not found for api endpoint dont exist
  errorHandler, // end point exists but something went wrong while processing it
} = require("./middleware/errorMiddleware");

// Load variables from the .env file
// Example: PORT=5000
require("dotenv").config();

const placeRoutes = require("./routes/placeRoutes"); // getting place routes for use

const vehicleRoutes = require("./routes/vehicleRoutes"); // getting vehicles routes for use

const hotelRoutes = require("./routes/hotelRoutes");

const restaurantRoutes = require("./routes/restaurantRoutes");

const emergencyRoutes = require("./routes/emergencyRoutes");

const guideRoutes = require("./routes/guideRoutes");

const eventRoutes = require("./routes/eventRoutes");

const mapRoutes = require("./routes/mapRoutes"); // getting mappdata of city from routes

const changeRequestRoutes = require("./routes/changeRequestRoutes"); // getting change request from routes

const authRoutes = require("./routes/authRoutes");

const adminRoutes = require("./routes/adminRoutes");

const reviewRoutes = require("./routes/reviewRoutes");

const savedRoutes = require("./routes/savedRoutes");

const weatherRoutes = require("./routes/weatherRoutes");

const cityRoutes = require("./routes/cityRoutes");

const aiRoutes = require("./routes/aiRoutes");

// Create an Express application
const app = express();

const connectDB = require("./config/db"); // connecting mongoose database to server

// Get the port from .env
// If PORT is not present in .env, use 5000 as the default
const PORT = process.env.PORT || 5000;

// -------------------- MIDDLEWARE --------------------

// Allow requests from different origins
// This will be important when our frontend runs on a different port/domain
app.use(cors());

// Add basic security headers to our responses
app.use(helmet());

// Allow Express to read JSON data sent in requests
// Example: { "name": "Kashi Vishwanath Temple" }
app.use(express.json());

// Log every incoming request in the terminal
// Example: GET / 200
app.use(morgan("dev"));

app.use(cookieParser()); //cookieparser

// Connect our backend to MongoDB Atlas
connectDB();

// ===============================
// Routes
// ===============================
app.use("/api/places", placeRoutes); // basically creating daddy and can make multiple branches in route.js

app.use("/api/vehicles", vehicleRoutes); // basically creating daddy api/vehicles and can make multiple branches in route.js

app.use("/api/hotels", hotelRoutes);

app.use("/api/restaurants", restaurantRoutes);

app.use("/api/emergency", emergencyRoutes);

app.use("/api/guides", guideRoutes);

app.use("/api/events", eventRoutes);

app.use("/api/map", mapRoutes);

app.use("/api/change-requests", changeRequestRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/reviews", reviewRoutes);

app.use("/api/saved", savedRoutes);

app.use("/api/weather", weatherRoutes);

app.use("/api/cities", cityRoutes);

app.use("/api/ai", aiRoutes);

// ===============================
// Test route
// ===============================

app.get("/", (req, res) => {
  res.send("SIH Tourism Backend is working!");
});

// error handling
app.use(notFound);
app.use(errorHandler);
// -------------------- START SERVER --------------------

// Start the Express server on the selected port
// The callback runs once the server successfully starts

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
