const express = require("express");
const axios = require("axios");

const TouristPlace = require("../models/TouristPlace");
const Hotel = require("../models/Hotel");

const router = express.Router();

const AI_ML_URL = "http://127.0.0.1:8000";


// ============================================================
// Helper: Escape regex characters
// ============================================================

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}


// ============================================================
// Format Hotel
// ============================================================

function formatHotel(hotel) {

    return {
        id: hotel.hotelId,
        hotelId: hotel.hotelId,

        name: hotel.name,

        city: hotel.city,
        state: hotel.state,

        address: hotel.address,

        latitude: hotel.latitude,
        longitude: hotel.longitude,

        pricePerNight: hotel.pricePerNight,

        category: hotel.category,

        rating: hotel.rating,

        amenities: hotel.amenities || [],

        specialFeatures:
            hotel.specialFeatures || [],

        images:
            hotel.images || [],

        image:
            hotel.images?.[0] || "",

        phone: hotel.phone,

        website: hotel.website,

        available:
            hotel.available ?? true
    };
}


// ============================================================
// AI RECOMMENDATION
// ============================================================

router.post("/recommend", async (req, res) => {

    try {

        // ======================================================
        // 1. CALL AI/ML SERVICE
        // ======================================================

        const response = await axios.post(
            `${AI_ML_URL}/api/v1/recommend`,
            req.body,
            {
                timeout: 10000
            }
        );

        const aiData = response.data;


        console.log(
            "AI/ML returned:",
            aiData?.total_results || 0,
            "recommendations"
        );


        // ======================================================
        // 2. VALIDATE AI RESPONSE
        // ======================================================

        if (
            !aiData ||
            !Array.isArray(aiData.results)
        ) {

            return res.status(200).json(aiData);

        }


        if (aiData.results.length === 0) {

            return res.status(200).json(aiData);

        }


        // ======================================================
        // 3. GET AI DESTINATION NAMES
        // ======================================================

        const destinationNames =
            aiData.results
                .map(item => item.destination)
                .filter(Boolean);


        console.log(
            "AI destinations:",
            destinationNames
        );


        // ======================================================
        // 4. CREATE CITY CONDITIONS
        // ======================================================

        const cityConditions =
            destinationNames.flatMap(name => {

                const cleanName =
                    name
                        .split("&")[0]
                        .trim();

                return [
                    {
                        city: {
                            $regex:
                                `^${escapeRegex(name)}$`,
                            $options: "i"
                        }
                    },
                    {
                        city: {
                            $regex:
                                `^${escapeRegex(cleanName)}$`,
                            $options: "i"
                        }
                    }
                ];

            });


        // ======================================================
        // 5. FETCH PLACES AND HOTELS IN PARALLEL
        // ======================================================

        let mongoPlaces = [];
        let mongoHotels = [];


        if (cityConditions.length > 0) {

            [
                mongoPlaces,
                mongoHotels
            ] = await Promise.all([

                TouristPlace.find({
                    $or: cityConditions,
                    available: true
                })
                    .lean(),

                Hotel.find({
                    $or: cityConditions,
                    available: true
                })
                    .lean()

            ]);

        }


        console.log(
            "MongoDB places found:",
            mongoPlaces.length
        );

        console.log(
            "MongoDB hotels found:",
            mongoHotels.length
        );


        // ======================================================
        // 6. GROUP PLACES BY CITY
        // ======================================================

        const placesByCity = new Map();


        mongoPlaces.forEach(place => {

            if (!place.city) return;


            const city =
                place.city
                    .trim()
                    .toLowerCase();


            if (!placesByCity.has(city)) {

                placesByCity.set(city, []);

            }


            placesByCity
                .get(city)
                .push(place);

        });


        // ======================================================
        // 7. GROUP HOTELS BY CITY
        // ======================================================

        const hotelsByCity = new Map();


        mongoHotels.forEach(hotel => {

            if (!hotel.city) return;


            const city =
                hotel.city
                    .trim()
                    .toLowerCase();


            if (!hotelsByCity.has(city)) {

                hotelsByCity.set(city, []);

            }


            hotelsByCity
                .get(city)
                .push(hotel);

        });


        // ======================================================
        // 8. ENRICH EACH AI RECOMMENDATION
        // ======================================================

        const enrichedResults =
            aiData.results.map(recommendation => {

                const destinationName =
                    recommendation.destination ||
                    "Unknown Destination";


                const cleanName =
                    destinationName
                        .split("&")[0]
                        .trim();


                // ==================================================
                // FIND PLACES
                // ==================================================

                let cityPlaces =
                    placesByCity.get(
                        destinationName.toLowerCase()
                    ) || [];


                if (cityPlaces.length === 0) {

                    cityPlaces =
                        placesByCity.get(
                            cleanName.toLowerCase()
                        ) || [];

                }


                // ==================================================
                // FIND HOTELS
                // ==================================================

                let cityHotels =
                    hotelsByCity.get(
                        destinationName.toLowerCase()
                    ) || [];


                if (cityHotels.length === 0) {

                    cityHotels =
                        hotelsByCity.get(
                            cleanName.toLowerCase()
                        ) || [];

                }


                // ==================================================
                // COLLECT HOTEL IMAGES
                // ==================================================

                const hotelImages = [
                    ...new Set(
                        cityHotels.flatMap(hotel =>
                            Array.isArray(hotel.images)
                                ? hotel.images
                                : []
                        )
                    )
                ];


                // ==================================================
                // CASE 1:
                // NO PLACE DATA IN MONGODB
                // ==================================================

                if (cityPlaces.length === 0) {

                    console.log(
                        `ℹ️ No backend place data for: ${destinationName}`
                    );


                    if (cityHotels.length > 0) {

                        console.log(
                            `   🏨 Hotels found: ${cityHotels.length}`
                        );

                    }


                    return {

                        // AI data
                        ...recommendation,


                        // Standard frontend fields
                        id:
                            recommendation.destination_id ||
                            cleanName
                                .toLowerCase()
                                .replace(/\s+/g, "_"),


                        name:
                            destinationName,


                        city:
                            cleanName,


                        state:
                            recommendation.state ||
                            "",


                        // AI image if available
                        image:
                            recommendation.image ||
                            recommendation.image_url ||
                            "",


                        images:
                            recommendation.images ||
                            [],


                        // AI attractions
                        topAttractions:
                            recommendation.top_attractions ||
                            recommendation.topAttractions ||
                            [],


                        // Hotels from backend if available
                        hotels:
                            cityHotels.map(formatHotel),


                        // Hotel images separately
                        hotelImages:
                            hotelImages,


                        // No places
                        places: [],


                        mongoMatched: false,

                        mongoPlaceCount: 0,

                        mongoHotelCount:
                            cityHotels.length

                    };

                }


                // ==================================================
                // CASE 2:
                // MONGODB PLACE DATA EXISTS
                // ==================================================

                const firstPlace =
                    cityPlaces[0];


                // ==================================================
                // COLLECT PLACE IMAGES
                // ==================================================

                const placeImages = [
                    ...new Set(
                        cityPlaces.flatMap(place =>
                            Array.isArray(place.images)
                                ? place.images
                                : []
                        )
                    )
                ];


                // ==================================================
                // COLLECT ATTRACTIONS
                // ==================================================

                const attractions =
                    cityPlaces
                        .slice(0, 6)
                        .map(place => place.name)
                        .filter(Boolean);


                // ==================================================
                // LOG
                // ==================================================

                console.log(
                    `✅ MongoDB matched: ${destinationName} → ${firstPlace.city}`
                );


                console.log(
                    `   Places found: ${cityPlaces.length}`
                );


                console.log(
                    `   Place images found: ${placeImages.length}`
                );


                console.log(
                    `   Hotels found: ${cityHotels.length}`
                );


                console.log(
                    `   Hotel images found: ${hotelImages.length}`
                );


                // ==================================================
                // FINAL COMBINED RESULT
                // ==================================================

                return {

                    // =================================================
                    // AI DATA
                    // =================================================

                    ...recommendation,


                    // =================================================
                    // DESTINATION
                    // =================================================

                    id:
                        recommendation.destination_id ||
                        firstPlace.placeId,


                    placeId:
                        firstPlace.placeId,


                    name:
                        destinationName,


                    city:
                        firstPlace.city,


                    state:
                        firstPlace.state ||
                        recommendation.state ||
                        "",


                    // =================================================
                    // PLACE INFORMATION
                    // =================================================

                    description:
                        firstPlace.description ||
                        recommendation.description ||
                        "",


                    category:
                        firstPlace.category ||
                        recommendation.category ||
                        "",


                    address:
                        firstPlace.address ||
                        null,


                    latitude:
                        firstPlace.latitude ??
                        null,


                    longitude:
                        firstPlace.longitude ??
                        null,


                    entryFee:
                        firstPlace.entryFee ??
                        0,


                    rating:
                        firstPlace.rating ??
                        null,


                    openingTime:
                        firstPlace.openingTime ||
                        null,


                    closingTime:
                        firstPlace.closingTime ||
                        null,


                    bestTimeToVisit:
                        firstPlace.bestTimeToVisit ||
                        null,


                    specialFeatures:
                        firstPlace.specialFeatures ||
                        [],


                    // =================================================
                    // PLACE IMAGES
                    // =================================================

                    images:
                        placeImages.length > 0
                            ? placeImages
                            : firstPlace.images || [],


                    image:
                        placeImages.length > 0
                            ? placeImages[0]
                            : firstPlace.images?.[0] ||
                            recommendation.image ||
                            "",


                    // =================================================
                    // ATTRACTIONS
                    // =================================================

                    topAttractions:
                        attractions.length > 0
                            ? attractions
                            : (
                                recommendation.top_attractions ||
                                []
                            ),


                    // =================================================
                    // HOTELS
                    // =================================================

                    hotels:
                        cityHotels.map(formatHotel),


                    // =================================================
                    // HOTEL IMAGES
                    // =================================================

                    hotelImages:
                        hotelImages,


                    // =================================================
                    // WEBSITE
                    // =================================================

                    website:
                        firstPlace.website ||
                        null,


                    // =================================================
                    // AVAILABILITY
                    // =================================================

                    available:
                        firstPlace.available ??
                        true,


                    // =================================================
                    // DEBUG
                    // =================================================

                    mongoMatched:
                        true,


                    mongoPlaceCount:
                        cityPlaces.length,


                    mongoHotelCount:
                        cityHotels.length

                };

            });


        // ======================================================
        // 9. SEND FINAL RESPONSE
        // ======================================================

        return res.status(200).json({

            ...aiData,

            results:
                enrichedResults

        });


    } catch (error) {

        console.error(
            "❌ AI/ML Recommendation Error:",
            error.response?.data ||
            error.message
        );


        return res.status(500).json({

            success: false,

            message:
                "AI/ML recommendation service failed",

            error:
                error.response?.data ||
                error.message

        });

    }

});


module.exports = router;
