// ==========================================
// GET WEATHER BY CITY
// ==========================================

const getWeather = async (req, res) => {
    try {
        const { city } = req.params;

        // --------------------------------------
        // Validate city
        // --------------------------------------

        if (!city || !city.trim()) {
            return res.status(400).json({
                success: false,
                message: "City is required"
            });
        }

        const cityName = city.trim();

        // --------------------------------------
        // 1. Find city coordinates
        // --------------------------------------

        const geocodingUrl =
            "https://geocoding-api.open-meteo.com/v1/search?" +
            `name=${encodeURIComponent(cityName)}` +
            "&count=5" +
            "&language=en" +
            "&format=json";

        const geoResponse =
            await fetch(geocodingUrl);

        if (!geoResponse.ok) {
            console.error(
                "Geocoding API status:",
                geoResponse.status
            );

            return res.status(502).json({
                success: false,
                message:
                    "Unable to find city location"
            });
        }

        const geoData =
            await geoResponse.json();

        // --------------------------------------
        // No city found
        // --------------------------------------

        if (
            !geoData.results ||
            geoData.results.length === 0
        ) {
            return res.status(404).json({
                success: false,
                message: "City not found"
            });
        }

        // --------------------------------------
        // Prefer Indian result
        // --------------------------------------

        const indianLocation =
            geoData.results.find(
                (result) =>
                    result.country_code === "IN"
            );

        const location =
            indianLocation ||
            geoData.results[0];

        // --------------------------------------
        // 2. Get weather
        // --------------------------------------

        const weatherUrl =
            "https://api.open-meteo.com/v1/forecast?" +
            `latitude=${location.latitude}` +
            `&longitude=${location.longitude}` +
            "&current=" +
            "temperature_2m," +
            "relative_humidity_2m," +
            "apparent_temperature," +
            "weather_code," +
            "wind_speed_10m" +
            "&daily=" +
            "temperature_2m_max," +
            "temperature_2m_min," +
            "weather_code," +
            "precipitation_probability_max" +
            "&forecast_days=5" +
            "&timezone=auto";

        const weatherResponse =
            await fetch(weatherUrl);

        if (!weatherResponse.ok) {
            console.error(
                "Weather API status:",
                weatherResponse.status
            );

            return res.status(502).json({
                success: false,
                message:
                    "Unable to fetch weather data"
            });
        }

        const weatherData =
            await weatherResponse.json();

        // --------------------------------------
        // 3. Validate weather response
        // --------------------------------------

        if (!weatherData.current) {
            return res.status(502).json({
                success: false,
                message:
                    "Weather data unavailable"
            });
        }

        // --------------------------------------
        // 4. Frontend-friendly response
        // --------------------------------------

        return res.status(200).json({

            success: true,

            data: {

                location: {
                    city:
                        location.name,

                    state:
                        location.admin1 ||
                        null,

                    country:
                        location.country ||
                        null,

                    latitude:
                        location.latitude,

                    longitude:
                        location.longitude,

                    timezone:
                        weatherData.timezone ||
                        null
                },

                current: {

                    temperature:
                        weatherData
                            .current
                            .temperature_2m,

                    apparentTemperature:
                        weatherData
                            .current
                            .apparent_temperature,

                    humidity:
                        weatherData
                            .current
                            .relative_humidity_2m,

                    weatherCode:
                        weatherData
                            .current
                            .weather_code,

                    windSpeed:
                        weatherData
                            .current
                            .wind_speed_10m,

                    time:
                        weatherData
                            .current
                            .time
                },

                forecast: {

                    dates:
                        weatherData
                            .daily
                            .time,

                    maxTemperature:
                        weatherData
                            .daily
                            .temperature_2m_max,

                    minTemperature:
                        weatherData
                            .daily
                            .temperature_2m_min,

                    weatherCode:
                        weatherData
                            .daily
                            .weather_code,

                    precipitationProbability:
                        weatherData
                            .daily
                            .precipitation_probability_max
                }
            }
        });

    } catch (error) {

        console.error(
            "Weather controller error:",
            error
        );

        return res.status(502).json({
            success: false,
            message:
                "Unable to fetch weather data"
        });
    }
};


// ==========================================
// EXPORT
// ==========================================

module.exports = {
    getWeather
};