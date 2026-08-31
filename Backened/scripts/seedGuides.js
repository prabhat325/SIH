const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const Guide = require("../models/Guide");

async function seedGuides() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("✅ MongoDB connected");

        const guidesDir = path.join(
            __dirname,
            "../data/guides"
        );

        const files = fs
            .readdirSync(guidesDir)
            .filter(file => file.endsWith(".json"));

        console.log(`📁 City files found: ${files.length}`);

        let allGuides = [];

        for (const file of files) {
            const filePath = path.join(guidesDir, file);

            const data = JSON.parse(
                fs.readFileSync(filePath, "utf-8")
            );

            if (!Array.isArray(data)) {
                console.log(`⚠️ Skipping invalid file: ${file}`);
                continue;
            }

            allGuides.push(...data);

            console.log(`✔ ${file}: ${data.length} guides`);
        }

        console.log(
            `\n🧑‍🏫 Total guides found: ${allGuides.length}`
        );

        await Guide.deleteMany({});

        console.log("🗑️ Old guide data removed");

        await Guide.insertMany(allGuides);

        console.log(
            `🎉 Successfully seeded ${allGuides.length} guides`
        );

        await mongoose.connection.close();

        console.log("🔌 MongoDB connection closed");

    } catch (error) {
        console.error("❌ Guide seeding failed:");
        console.error(error);

        process.exit(1);
    }
}

seedGuides();