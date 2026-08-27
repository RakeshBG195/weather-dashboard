// ============================================================
// WEATHER DASHBOARD BACKEND
// MAP REMOVED
// Uses Open-Meteo for:
// 1. Current weather
// 2. 7-day forecast
// 3. Location search
// ============================================================

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;


// ============================================================
// MIDDLEWARE
// ============================================================

app.use(cors());

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


// ============================================================
// HOME / SERVER CHECK
// ============================================================

app.get("/", (req, res) => {

    res.json({

        success: true,

        message:
            "Weather Dashboard Backend is running",

        endpoints: {

            weather:
                "/api/weather?lat=12.9716&lon=77.5946",

            forecast:
                "/api/forecast?lat=12.9716&lon=77.5946",

            search:
                "/api/search?q=bengaluru"

        }

    });

});


// ============================================================
// HEALTH CHECK
// ============================================================

app.get(
    "/api/health",
    (req, res) => {

        res.json({

            success: true,

            status: "healthy",

            message:
                "Weather backend is working"

        });

    }
);


// ============================================================
// CURRENT WEATHER
// ============================================================

app.get(
    "/api/weather",
    async (req, res) => {

        try {

            const {
                lat,
                lon
            } = req.query;


            // ------------------------------------------------
            // CHECK PARAMETERS
            // ------------------------------------------------

            if (
                lat === undefined ||
                lon === undefined
            ) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Latitude and longitude are required."

                });

            }


            // ------------------------------------------------
            // CONVERT TO NUMBERS
            // ------------------------------------------------

            const latitude =
                Number(lat);

            const longitude =
                Number(lon);


            // ------------------------------------------------
            // VALIDATE NUMBERS
            // ------------------------------------------------

            if (
                !Number.isFinite(latitude) ||
                !Number.isFinite(longitude)
            ) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Invalid latitude or longitude."

                });

            }


            console.log(
                `Getting weather for ${latitude}, ${longitude}`
            );


            // ------------------------------------------------
            // OPEN-METEO CURRENT WEATHER URL
            // ------------------------------------------------

            const url =
                "https://api.open-meteo.com/v1/forecast" +

                `?latitude=${encodeURIComponent(
                    latitude
                )}` +

                `&longitude=${encodeURIComponent(
                    longitude
                )}` +

                "&current=" +

                [
                    "temperature_2m",
                    "relative_humidity_2m",
                    "apparent_temperature",
                    "weather_code",
                    "wind_speed_10m",
                    "surface_pressure",
                    "visibility"
                ].join(",") +

                "&temperature_unit=celsius" +

                "&wind_speed_unit=kmh" +

                "&timezone=auto";


            console.log(
                "Weather API:",
                url
            );


            // ------------------------------------------------
            // REQUEST OPEN-METEO
            // ------------------------------------------------

            const response =
                await fetch(url);


            if (!response.ok) {

                throw new Error(
                    `Open-Meteo returned HTTP ${response.status}`
                );

            }


            const data =
                await response.json();


            // ------------------------------------------------
            // CHECK RESPONSE
            // ------------------------------------------------

            if (
                !data.current
            ) {

                throw new Error(
                    "Current weather data was not returned."
                );

            }


            const current =
                data.current;


            // ------------------------------------------------
            // SEND DATA TO FRONTEND
            // ------------------------------------------------

            res.json({

                success: true,

                latitude:
                    data.latitude,

                longitude:
                    data.longitude,

                timezone:
                    data.timezone,

                current: {

                    temperature:
                        current.temperature_2m,

                    humidity:
                        current.relative_humidity_2m,

                    feels_like:
                        current.apparent_temperature,

                    weather_code:
                        current.weather_code,

                    wind_speed:
                        current.wind_speed_10m,

                    pressure:
                        current.surface_pressure,

                    visibility:
                        current.visibility

                }

            });


        } catch (error) {

            console.error(
                "Weather API error:",
                error.message
            );


            res.status(500).json({

                success: false,

                error:
                    "Unable to get weather data.",

                details:
                    error.message

            });

        }

    }
);


// ============================================================
// 7-DAY FORECAST
// ============================================================

app.get(
    "/api/forecast",
    async (req, res) => {

        try {

            const {
                lat,
                lon
            } = req.query;


            // ------------------------------------------------
            // CHECK PARAMETERS
            // ------------------------------------------------

            if (
                lat === undefined ||
                lon === undefined
            ) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Latitude and longitude are required."

                });

            }


            // ------------------------------------------------
            // CONVERT TO NUMBERS
            // ------------------------------------------------

            const latitude =
                Number(lat);

            const longitude =
                Number(lon);


            // ------------------------------------------------
            // VALIDATE
            // ------------------------------------------------

            if (
                !Number.isFinite(latitude) ||
                !Number.isFinite(longitude)
            ) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Invalid latitude or longitude."

                });

            }


            console.log(
                `Getting 7-day forecast for ${latitude}, ${longitude}`
            );


            // ------------------------------------------------
            // OPEN-METEO FORECAST URL
            // ------------------------------------------------

            const url =
                "https://api.open-meteo.com/v1/forecast" +

                `?latitude=${encodeURIComponent(
                    latitude
                )}` +

                `&longitude=${encodeURIComponent(
                    longitude
                )}` +

                "&forecast_days=7" +

                "&timezone=auto" +

                "&temperature_unit=celsius" +

                "&wind_speed_unit=kmh" +

                "&daily=" +

                [
                    "weather_code",
                    "temperature_2m_max",
                    "temperature_2m_min",
                    "precipitation_probability_max",
                    "precipitation_sum",
                    "wind_speed_10m_max"
                ].join(",");


            console.log(
                "Forecast API:",
                url
            );


            // ------------------------------------------------
            // REQUEST OPEN-METEO
            // ------------------------------------------------

            const response =
                await fetch(url);


            if (!response.ok) {

                throw new Error(
                    `Open-Meteo returned HTTP ${response.status}`
                );

            }


            const data =
                await response.json();


            // ------------------------------------------------
            // CHECK DATA
            // ------------------------------------------------

            if (
                !data.daily ||
                !Array.isArray(
                    data.daily.time
                )
            ) {

                throw new Error(
                    "Forecast data was not returned."
                );

            }


            const daily =
                data.daily;


            const forecast =
                [];


            // ------------------------------------------------
            // CREATE FORECAST ARRAY
            // ------------------------------------------------

            for (
                let i = 0;
                i < daily.time.length;
                i++
            ) {

                forecast.push({

                    date:
                        daily.time[i],

                    weather_code:
                        daily.weather_code?.[i] ??
                        0,

                    temperature_2m_max:
                        daily.temperature_2m_max?.[i] ??
                        null,

                    temperature_2m_min:
                        daily.temperature_2m_min?.[i] ??
                        null,

                    precipitation_probability_max:
                        daily
                            .precipitation_probability_max?.[i] ??
                        null,

                    precipitation_sum:
                        daily
                            .precipitation_sum?.[i] ??
                        null,

                    wind_speed_10m_max:
                        daily
                            .wind_speed_10m_max?.[i] ??
                        null

                });

            }


            console.log(
                `Forecast returned ${forecast.length} days`
            );


            // ------------------------------------------------
            // SEND FORECAST
            // ------------------------------------------------

            res.json({

                success: true,

                latitude:
                    data.latitude,

                longitude:
                    data.longitude,

                timezone:
                    data.timezone,

                forecast:
                    forecast

            });


        } catch (error) {

            console.error(
                "Forecast API error:",
                error.message
            );


            res.status(500).json({

                success: false,

                error:
                    "Unable to get forecast data.",

                details:
                    error.message

            });

        }

    }
);


// ============================================================
// LOCATION SEARCH
// ============================================================

app.get(
    "/api/search",
    async (req, res) => {

        try {

            const query =
                req.query.q;


            // ------------------------------------------------
            // CHECK QUERY
            // ------------------------------------------------

            if (
                !query ||
                !query.trim()
            ) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Search query is required."

                });

            }


            const searchText =
                query.trim();


            console.log(
                `Searching location: ${searchText}`
            );


            // ------------------------------------------------
            // OPEN-METEO GEOCODING
            // ------------------------------------------------

            const url =
                "https://geocoding-api.open-meteo.com/v1/search" +

                `?name=${encodeURIComponent(
                    searchText
                )}` +

                "&count=10" +

                "&language=en" +

                "&format=json";


            console.log(
                "Geocoding API:",
                url
            );


            // ------------------------------------------------
            // REQUEST LOCATION DATA
            // ------------------------------------------------

            const response =
                await fetch(url);


            if (!response.ok) {

                throw new Error(
                    `Geocoding API returned HTTP ${response.status}`
                );

            }


            const data =
                await response.json();


            const results =
                data.results || [];


            console.log(
                `Found ${results.length} locations`
            );


            // ------------------------------------------------
            // FORMAT LOCATIONS
            // ------------------------------------------------

            const locations =
                results.map(
                    location => ({

                        name:
                            location.name,

                        latitude:
                            location.latitude,

                        longitude:
                            location.longitude,

                        country:
                            location.country,

                        country_code:
                            location.country_code,

                        admin1:
                            location.admin1,

                        timezone:
                            location.timezone,

                        population:
                            location.population ??
                            null

                    })
                );


            // ------------------------------------------------
            // SEND LOCATION RESULTS
            // ------------------------------------------------

            res.json({

                success: true,

                query:
                    searchText,

                locations:
                    locations

            });


        } catch (error) {

            console.error(
                "Location search error:",
                error.message
            );


            res.status(500).json({

                success: false,

                error:
                    "Unable to search location.",

                details:
                    error.message

            });

        }

    }
);


// ============================================================
// 404 HANDLER
// ============================================================

app.use(
    (req, res) => {

        res.status(404).json({

            success: false,

            error:
                "API endpoint not found.",

            path:
                req.originalUrl

        });

    }
);


// ============================================================
// GENERAL ERROR HANDLER
// ============================================================

app.use(
    (error, req, res, next) => {

        console.error(
            "Server error:",
            error
        );


        res.status(500).json({

            success: false,

            error:
                "Internal server error."

        });

    }
);


// ============================================================
// START SERVER
// ============================================================

app.listen(
    PORT,
    () => {

        console.log("");

        console.log(
            "=========================================="
        );

        console.log(
            "      WEATHER DASHBOARD BACKEND"
        );

        console.log(
            "=========================================="
        );

        console.log(
            `Server running at http://localhost:${PORT}`
        );

        console.log(
            `Weather:  http://localhost:${PORT}/api/weather?lat=12.9716&lon=77.5946`
        );

        console.log(
            `Forecast: http://localhost:${PORT}/api/forecast?lat=12.9716&lon=77.5946`
        );

        console.log(
            `Search:   http://localhost:${PORT}/api/search?q=bengaluru`
        );

        console.log(
            "=========================================="
        );

        console.log("");

    }
);