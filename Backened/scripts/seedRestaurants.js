const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const Restaurant = require("../models/Restaurant");

async function seedRestaurants() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("✅ MongoDB connected");

        const restaurantsDir = path.join(
            __dirname,
            "../data/restaurants"
        );

        const files = fs
            .readdirSync(restaurantsDir)
            .filter(file => file.endsWith(".json"));

        console.log(`📁 City files found: ${files.length}`);

        let allRestaurants = [];

        for (const file of files) {
            const filePath = path.join(restaurantsDir, file);

            const data = JSON.parse(
                fs.readFileSync(filePath, "utf-8")
            );

            if (!Array.isArray(data)) {
                console.log(`⚠️ Skipping invalid file: ${file}`);
                continue;
            }

            allRestaurants.push(...data);

            console.log(`✔ ${file}: ${data.length} restaurants`);
        }

        console.log(
            `\n🍽️ Total restaurants found: ${allRestaurants.length}`
        );

        await Restaurant.deleteMany({});

        console.log("🗑️ Old restaurant data removed");

        await Restaurant.insertMany(allRestaurants);

        console.log(
            `🎉 Successfully seeded ${allRestaurants.length} restaurants`
        );

        await mongoose.connection.close();

        console.log("🔌 MongoDB connection closed");

    } catch (error) {
        console.error("❌ Restaurant seeding failed:");
        console.error(error);

        process.exit(1);
    }
}

seedRestaurants();