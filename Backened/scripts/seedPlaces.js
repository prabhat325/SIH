const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const TouristPlace = require("../models/TouristPlace");

async function seedPlaces() {
    try {
        // Connect MongoDB
        await mongoose.connect(process.env.MONGO_URI);

        console.log("✅ MongoDB connected");

        // Path to data/places
        const placesDir = path.join(__dirname, "../data/places");

        // Get all JSON files
        const files = fs
            .readdirSync(placesDir)
            .filter(file => file.endsWith(".json"));

        console.log(`📁 City files found: ${files.length}`);

        let allPlaces = [];

        // Read every city file
        for (const file of files) {
            const filePath = path.join(placesDir, file);

            const data = JSON.parse(
                fs.readFileSync(filePath, "utf-8")
            );

            if (!Array.isArray(data)) {
                console.log(`⚠️ Skipping invalid file: ${file}`);
                continue;
            }

            allPlaces.push(...data);

            console.log(`✔ ${file}: ${data.length} places`);
        }

        console.log(`\n📍 Total places found: ${allPlaces.length}`);

        // Remove existing places
        await TouristPlace.deleteMany({});

        console.log("🗑️ Old tourist places removed");

        // Insert all places
        await TouristPlace.insertMany(allPlaces);

        console.log(
            `🎉 Successfully seeded ${allPlaces.length} tourist places`
        );

        await mongoose.connection.close();

        console.log("🔌 MongoDB connection closed");

    } catch (error) {
        console.error("❌ Seeding failed:");
        console.error(error);

        process.exit(1);
    }
}

seedPlaces();