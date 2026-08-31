const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const Hotel = require("../models/Hotel");

async function seedHotels() {
    try {
        // Connect MongoDB using .env
        await mongoose.connect(process.env.MONGO_URI);

        console.log("✅ MongoDB connected");

        // Path to data/hotels
        const hotelsDir = path.join(__dirname, "../data/hotels");

        // Get all city JSON files
        const files = fs
            .readdirSync(hotelsDir)
            .filter(file => file.endsWith(".json"));

        console.log(`📁 City files found: ${files.length}`);

        let allHotels = [];

        // Read every city file
        for (const file of files) {
            const filePath = path.join(hotelsDir, file);

            const data = JSON.parse(
                fs.readFileSync(filePath, "utf-8")
            );

            if (!Array.isArray(data)) {
                console.log(`⚠️ Skipping invalid file: ${file}`);
                continue;
            }

            allHotels.push(...data);

            console.log(`✔ ${file}: ${data.length} hotels`);
        }

        console.log(`\n🏨 Total hotels found: ${allHotels.length}`);

        // Remove existing hotel records
        await Hotel.deleteMany({});

        console.log("🗑️ Old hotel data removed");

        // Insert cleaned hotel dataset
        await Hotel.insertMany(allHotels);

        console.log(
            `🎉 Successfully seeded ${allHotels.length} hotels`
        );

        await mongoose.connection.close();

        console.log("🔌 MongoDB connection closed");

    } catch (error) {
        console.error("❌ Hotel seeding failed:");
        console.error(error);

        process.exit(1);
    }
}

seedHotels();