const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const Emergency = require("../models/Emergency");

async function seedEmergency() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("✅ MongoDB connected");

        const emergencyDir = path.join(
            __dirname,
            "../data/emergency"
        );

        const files = fs
            .readdirSync(emergencyDir)
            .filter(file => file.endsWith(".json"));

        console.log(`📁 City files found: ${files.length}`);

        let allEmergencies = [];

        for (const file of files) {
            const filePath = path.join(emergencyDir, file);

            const data = JSON.parse(
                fs.readFileSync(filePath, "utf-8")
            );

            if (!Array.isArray(data)) {
                console.log(`⚠️ Skipping invalid file: ${file}`);
                continue;
            }

            allEmergencies.push(...data);

            console.log(
                `✔ ${file}: ${data.length} emergency services`
            );
        }

        console.log(
            `\n🚨 Total emergency services found: ${allEmergencies.length}`
        );

        await Emergency.deleteMany({});

        console.log("🗑️ Old emergency data removed");

        await Emergency.insertMany(allEmergencies);

        console.log(
            `🎉 Successfully seeded ${allEmergencies.length} emergency services`
        );

        await mongoose.connection.close();

        console.log("🔌 MongoDB connection closed");

    } catch (error) {
        console.error("❌ Emergency seeding failed:");
        console.error(error);

        process.exit(1);
    }
}

seedEmergency();