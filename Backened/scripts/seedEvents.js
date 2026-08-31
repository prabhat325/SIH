const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const Event = require("../models/Event");

async function seedEvents() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("✅ MongoDB connected");

        const eventsDir = path.join(__dirname, "../data/events");

        const files = fs
            .readdirSync(eventsDir)
            .filter(file => file.endsWith(".json"));

        console.log(`📁 City files found: ${files.length}`);

        let allEvents = [];

        for (const file of files) {
            const filePath = path.join(eventsDir, file);

            const data = JSON.parse(
                fs.readFileSync(filePath, "utf-8")
            );

            let events = [];

            if (Array.isArray(data)) {
                events = data;
            } else if (data.events && Array.isArray(data.events)) {
                events = data.events;
            } else {
                console.log(`⚠️ Skipping invalid file: ${file}`);
                continue;
            }

            allEvents.push(...events);

            console.log(`✔ ${file}: ${events.length} events`);
        }

        console.log(`\n🎭 Total events found: ${allEvents.length}`);

        await Event.deleteMany({});

        console.log("🗑️ Old event data removed");

        await Event.insertMany(allEvents);

        console.log(
            `🎉 Successfully seeded ${allEvents.length} events`
        );

        await mongoose.connection.close();

        console.log("🔌 MongoDB connection closed");

    } catch (error) {
        console.error("❌ Event seeding failed:");
        console.error(error);

        process.exit(1);
    }
}

seedEvents();