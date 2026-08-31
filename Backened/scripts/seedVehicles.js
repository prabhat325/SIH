const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const Vehicle = require("../models/Vehicle");

async function seedVehicles() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("✅ MongoDB connected");

        const vehiclesDir = path.join(
            __dirname,
            "../data/vehicles"
        );

        const files = fs
            .readdirSync(vehiclesDir)
            .filter(file => file.endsWith(".json"));

        console.log(`📁 City files found: ${files.length}`);

        let allVehicles = [];

        for (const file of files) {
            const filePath = path.join(vehiclesDir, file);

            const data = JSON.parse(
                fs.readFileSync(filePath, "utf-8")
            );

            if (!Array.isArray(data)) {
                console.log(`⚠️ Skipping invalid file: ${file}`);
                continue;
            }

            allVehicles.push(...data);

            console.log(`✔ ${file}: ${data.length} vehicles`);
        }

        console.log(
            `\n🚕 Total transportation records found: ${allVehicles.length}`
        );

        await Vehicle.deleteMany({});

        console.log("🗑️ Old vehicle data removed");

        await Vehicle.insertMany(allVehicles);

        console.log(
            `🎉 Successfully seeded ${allVehicles.length} vehicles`
        );

        await mongoose.connection.close();

        console.log("🔌 MongoDB connection closed");

    } catch (error) {
        console.error("❌ Vehicle seeding failed:");
        console.error(error);

        process.exit(1);
    }
}

seedVehicles();