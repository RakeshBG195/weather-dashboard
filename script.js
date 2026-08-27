/* =========================================================
   WEATHER DASHBOARD
   Frontend JavaScript
   Backend: Same Render server
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const API_BASE_URL = "";


/* =========================================================
   DOM ELEMENTS
========================================================= */

const locationInput = document.getElementById("locationInput");
const searchButton = document.getElementById("searchButton");
const locationButton = document.getElementById("locationButton");

const loading = document.getElementById("loading");
const errorMessage = document.getElementById("errorMessage");

const weatherSection = document.getElementById("weatherSection");

const cityName = document.getElementById("cityName");
const weatherDate = document.getElementById("weatherDate");
const weatherIcon = document.getElementById("weatherIcon");

const temperature = document.getElementById("temperature");
const weatherCondition = document.getElementById("weatherCondition");
const feelsLike = document.getElementById("feelsLike");

const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const pressure = document.getElementById("pressure");
const visibility = document.getElementById("visibility");

const forecastContainer = document.getElementById("forecastContainer");

const locationSuggestions =
    document.getElementById("locationSuggestions");

const themeToggle =
    document.getElementById("themeToggle");


/* =========================================================
   DEFAULT LOCATION
   Bengaluru coordinates
========================================================= */

let currentLatitude = 12.9716;
let currentLongitude = 77.5946;

let currentLocationName = "Bengaluru";


/* =========================================================
   WEATHER CODE INFORMATION
   Open-Meteo weather codes
========================================================= */

function getWeatherInfo(code) {

    const weatherCodes = {

        0: {
            description: "Clear sky",
            icon: "☀️"
        },

        1: {
            description: "Mainly clear",
            icon: "🌤️"
        },

        2: {
            description: "Partly cloudy",
            icon: "⛅"
        },

        3: {
            description: "Overcast",
            icon: "☁️"
        },

        45: {
            description: "Fog",
            icon: "🌫️"
        },

        48: {
            description: "Depositing rime fog",
            icon: "🌫️"
        },

        51: {
            description: "Light drizzle",
            icon: "🌦️"
        },

        53: {
            description: "Moderate drizzle",
            icon: "🌦️"
        },

        55: {
            description: "Dense drizzle",
            icon: "🌧️"
        },

        56: {
            description: "Light freezing drizzle",
            icon: "🌧️"
        },

        57: {
            description: "Dense freezing drizzle",
            icon: "🌧️"
        },

        61: {
            description: "Slight rain",
            icon: "🌦️"
        },

        63: {
            description: "Moderate rain",
            icon: "🌧️"
        },

        65: {
            description: "Heavy rain",
            icon: "🌧️"
        },

        66: {
            description: "Light freezing rain",
            icon: "🌧️"
        },

        67: {
            description: "Heavy freezing rain",
            icon: "🌧️"
        },

        71: {
            description: "Slight snow",
            icon: "🌨️"
        },

        73: {
            description: "Moderate snow",
            icon: "🌨️"
        },

        75: {
            description: "Heavy snow",
            icon: "❄️"
        },

        77: {
            description: "Snow grains",
            icon: "❄️"
        },

        80: {
            description: "Slight rain showers",
            icon: "🌦️"
        },

        81: {
            description: "Moderate rain showers",
            icon: "🌧️"
        },

        82: {
            description: "Violent rain showers",
            icon: "⛈️"
        },

        85: {
            description: "Slight snow showers",
            icon: "🌨️"
        },

        86: {
            description: "Heavy snow showers",
            icon: "❄️"
        },

        95: {
            description: "Thunderstorm",
            icon: "⛈️"
        },

        96: {
            description: "Thunderstorm with slight hail",
            icon: "⛈️"
        },

        99: {
            description: "Thunderstorm with heavy hail",
            icon: "⛈️"
        }

    };

    return weatherCodes[code] || {
        description: "Unknown",
        icon: "🌤️"
    };
}


/* =========================================================
   SHOW LOADING
========================================================= */

function showLoading() {

    if (loading) {
        loading.style.display = "block";
        loading.textContent = "Loading weather data...";
    }

    hideError();
}


/* =========================================================
   HIDE LOADING
========================================================= */

function hideLoading() {

    if (loading) {
        loading.style.display = "none";
    }
}


/* =========================================================
   SHOW ERROR
========================================================= */

function showError(message) {

    hideLoading();

    if (errorMessage) {

        errorMessage.textContent = message;

        errorMessage.style.display = "block";
    }

    console.error("Weather Dashboard Error:", message);
}


/* =========================================================
   HIDE ERROR
========================================================= */

function hideError() {

    if (errorMessage) {
        errorMessage.style.display = "none";
        errorMessage.textContent = "";
    }
}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(dateString) {

    if (!dateString) {
        return "--";
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        return dateString;
    }

    return date.toLocaleDateString(
        undefined,
        {
            weekday: "long",
            month: "long",
            day: "numeric"
        }
    );
}


/* =========================================================
   FORMAT DATE AND TIME
========================================================= */

function formatDateTime(dateString) {

    if (!dateString) {
        return "--";
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        return dateString;
    }

    return date.toLocaleString(
        undefined,
        {
            weekday: "long",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    );
}


/* =========================================================
   GET DAY NAME
========================================================= */

function getDayName(dateString, index) {

    if (index === 0) {
        return "Today";
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        return dateString;
    }

    return date.toLocaleDateString(
        undefined,
        {
            weekday: "short"
        }
    );
}


/* =========================================================
   GET CURRENT WEATHER
========================================================= */

async function loadCurrentWeather(latitude, longitude) {

    console.log(
        "Getting weather for:",
        latitude,
        longitude
    );

    const url =
        `${API_BASE_URL}/api/weather?lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}`;

    console.log("Weather API:", url);

    const response = await fetch(url);

    if (!response.ok) {

        throw new Error(
            `Weather API returned ${response.status}`
        );
    }

    const data = await response.json();

    console.log("Weather response:", data);

    if (!data.success) {

        throw new Error(
            data.message ||
            data.error ||
            "Unable to get weather data."
        );
    }

    updateCurrentWeather(data);

    return data;
}


/* =========================================================
   UPDATE CURRENT WEATHER UI
========================================================= */

function updateCurrentWeather(data) {

    console.log(
        "Updating current weather:",
        data
    );

    const current = data.current || {};

    const weatherCode =
        Number(current.weather_code);

    const weatherInfo =
        getWeatherInfo(weatherCode);


    /* -------------------------
       TEMPERATURE
    ------------------------- */

    if (temperature) {

        const value = Number(current.temperature);

        temperature.textContent =
            `${Math.round(value)}°`;
    }


    /* -------------------------
       CONDITION
    ------------------------- */

    if (weatherCondition) {

        weatherCondition.textContent =
            weatherInfo.description;
    }


    /* -------------------------
       WEATHER ICON
    ------------------------- */

    if (weatherIcon) {

        weatherIcon.textContent =
            weatherInfo.icon;
    }


    /* -------------------------
       FEELS LIKE
    ------------------------- */

    if (feelsLike) {

        const value =
            Number(current.feels_like);

        feelsLike.textContent =
            `${Math.round(value)}°C`;
    }


    /* -------------------------
       HUMIDITY
    ------------------------- */

    if (humidity) {

        const value =
            Number(current.humidity);

        humidity.textContent =
            `${Math.round(value)}%`;
    }


    /* -------------------------
       WIND SPEED
    ------------------------- */

    if (windSpeed) {

        const value =
            Number(current.wind_speed);

        windSpeed.textContent =
            `${Math.round(value)} km/h`;
    }


    /* -------------------------
       PRESSURE
    ------------------------- */

    if (pressure) {

        const value =
            Number(current.pressure);

        pressure.textContent =
            `${Math.round(value)} hPa`;
    }


    /* -------------------------
       VISIBILITY
    ------------------------- */

    if (visibility) {

        const value =
            Number(current.visibility);

        const visibilityKm =
            value / 1000;

        visibility.textContent =
            `${visibilityKm.toFixed(1)} km`;
    }


    /* -------------------------
       UPDATED TIME
    ------------------------- */

    if (weatherDate) {

        const timezone =
            data.timezone || "Asia/Kolkata";

        const now =
            new Date();

        weatherDate.textContent =
            `Updated: ${now.toLocaleString(
                undefined,
                {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    timeZone: timezone
                }
            )}`;
    }


    /* -------------------------
       WEATHER SECTION
    ------------------------- */

    if (weatherSection) {

        weatherSection.style.display =
            "block";

        weatherSection.style.visibility =
            "visible";

        weatherSection.style.opacity =
            "1";
    }
}


/* =========================================================
   GET 7-DAY FORECAST
========================================================= */

async function loadForecast(latitude, longitude) {

    console.log(
        "Loading 7-day forecast..."
    );

    const url =
        `${API_BASE_URL}/api/forecast?lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}`;

    console.log(
        "Forecast API:",
        url
    );

    const response =
        await fetch(url);

    if (!response.ok) {

        throw new Error(
            `Forecast API returned ${response.status}`
        );
    }

    const data =
        await response.json();

    console.log(
        "Forecast response:",
        data
    );

    if (!data.success) {

        throw new Error(
            data.message ||
            data.error ||
            "Unable to get forecast data."
        );
    }

    const forecastList =
        data.forecast || [];

    console.log(
        "Forecast list:",
        forecastList
    );

    displayForecast(forecastList);
}


/* =========================================================
   DISPLAY FORECAST
========================================================= */

function displayForecast(forecastList) {

    if (!forecastContainer) {
        return;
    }

    forecastContainer.innerHTML = "";

    if (!forecastList.length) {

        forecastContainer.innerHTML =
            `<p>No forecast data available.</p>`;

        return;
    }


    forecastList.forEach(
        (day, index) => {

            const weatherCode =
                Number(day.weather_code);

            const weatherInfo =
                getWeatherInfo(weatherCode);


            const maxTemp =
                Number(day.temperature_2m_max);

            const minTemp =
                Number(day.temperature_2m_min);

            const rainProbability =
                Number(
                    day.precipitation_probability_max
                );

            const wind =
                Number(
                    day.wind_speed_10m_max
                );


            const card =
                document.createElement("div");

            card.className =
                "forecast-card";


            card.innerHTML = `

                <div class="forecast-day">
                    ${getDayName(day.date, index)}
                </div>

                <div class="forecast-icon">
                    ${weatherInfo.icon}
                </div>

                <div class="forecast-temperature">
                    ${Math.round(maxTemp)}° /
                    ${Math.round(minTemp)}°
                </div>

                <div class="forecast-condition">
                    ${weatherInfo.description}
                </div>

                <div class="forecast-rain">
                    💧 ${rainProbability}% rain
                </div>

                <div class="forecast-wind">
                    🌬️ ${Math.round(wind)} km/h
                </div>

            `;


            forecastContainer.appendChild(card);
        }
    );
}


/* =========================================================
   LOAD COMPLETE WEATHER
========================================================= */

async function loadWeather(
    latitude,
    longitude,
    locationName = "Your Location"
) {

    showLoading();

    try {

        currentLatitude =
            latitude;

        currentLongitude =
            longitude;

        currentLocationName =
            locationName;


        /* -------------------------
           CITY NAME
        ------------------------- */

        if (cityName) {

            cityName.textContent =
                locationName;
        }


        /* -------------------------
           CURRENT WEATHER
        ------------------------- */

        await loadCurrentWeather(
            latitude,
            longitude
        );


        /* -------------------------
           FORECAST
        ------------------------- */

        await loadForecast(
            latitude,
            longitude
        );


        hideLoading();

        console.log(
            "Weather loaded successfully."
        );


        /* Scroll to weather section */

        if (weatherSection) {

            setTimeout(
                () => {

                    weatherSection.scrollIntoView(
                        {
                            behavior: "smooth",
                            block: "start"
                        }
                    );

                },
                150
            );
        }

    }

    catch (error) {

        console.error(
            "Weather loading error:",
            error
        );

        showError(
            "Unable to load weather data. Please try again."
        );
    }
}


/* =========================================================
   SEARCH LOCATION
========================================================= */

async function searchLocation() {

    const query =
        locationInput
            ? locationInput.value.trim()
            : "";


    if (!query) {

        showError(
            "Please enter a city or location."
        );

        return;
    }


    console.log(
        "Searching location:",
        query
    );

    showLoading();


    try {

        const url =
            `${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`;

        console.log(
            "Location API:",
            url
        );


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                `Location search returned ${response.status}`
            );
        }


        const data =
            await response.json();


        console.log(
            "Location response:",
            data
        );


        if (!data.success) {

            throw new Error(
                data.message ||
                data.error ||
                "Location search failed."
            );
        }


        const locations =
            data.locations || [];


        if (!locations.length) {

            showError(
                `No location found for "${query}". Please try another city.`
            );

            return;
        }


        /* Use first result */

        const location =
            locations[0];


        const name =
            location.name ||
            query;


        const country =
            location.country ||
            "";


        const admin =
            location.admin1 ||
            "";


        let displayName =
            name;


        if (admin && admin !== name) {

            displayName +=
                `, ${admin}`;
        }


        if (country) {

            displayName +=
                `, ${country}`;
        }


        console.log(
            "Selected location:",
            displayName
        );


        if (locationInput) {

            locationInput.value =
                name;
        }


        hideSuggestions();


        await loadWeather(
            Number(location.latitude),
            Number(location.longitude),
            displayName
        );

    }

    catch (error) {

        console.error(
            "Location search error:",
            error
        );

        showError(
            "Unable to search this location. Please try again."
        );
    }
}


/* =========================================================
   SEARCH LOCATION SUGGESTIONS
========================================================= */

async function searchSuggestions() {

    if (!locationInput) {
        return;
    }


    const query =
        locationInput.value.trim();


    if (query.length < 2) {

        hideSuggestions();

        return;
    }


    try {

        const url =
            `${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`;


        const response =
            await fetch(url);


        if (!response.ok) {
            return;
        }


        const data =
            await response.json();


        if (!data.success) {
            return;
        }


        const locations =
            data.locations || [];


        showSuggestions(
            locations.slice(0, 5)
        );

    }

    catch (error) {

        console.error(
            "Suggestion error:",
            error
        );
    }
}


/* =========================================================
   SHOW SUGGESTIONS
========================================================= */

function showSuggestions(locations) {

    if (!locationSuggestions) {
        return;
    }


    locationSuggestions.innerHTML = "";


    if (!locations.length) {

        hideSuggestions();

        return;
    }


    locations.forEach(
        location => {

            const item =
                document.createElement("div");


            item.className =
                "location-suggestion";


            const name =
                location.name ||
                "Unknown";


            const admin =
                location.admin1 ||
                "";


            const country =
                location.country ||
                "";


            let text =
                name;


            if (admin && admin !== name) {

                text +=
                    `, ${admin}`;
            }


            if (country) {

                text +=
                    `, ${country}`;
            }


            item.textContent =
                text;


            item.addEventListener(
                "click",
                async () => {

                    locationInput.value =
                        name;

                    hideSuggestions();

                    await loadWeather(
                        Number(location.latitude),
                        Number(location.longitude),
                        text
                    );
                }
            );


            locationSuggestions.appendChild(
                item
            );
        }
    );


    locationSuggestions.style.display =
        "block";
}


/* =========================================================
   HIDE SUGGESTIONS
========================================================= */

function hideSuggestions() {

    if (locationSuggestions) {

        locationSuggestions.innerHTML =
            "";

        locationSuggestions.style.display =
            "none";
    }
}


/* =========================================================
   GET USER LOCATION
========================================================= */

function getUserLocation() {

    if (!navigator.geolocation) {

        showError(
            "Geolocation is not supported by your browser."
        );

        return;
    }


    showLoading();


    navigator.geolocation.getCurrentPosition(

        async position => {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;


            console.log(
                "Current location:",
                latitude,
                longitude
            );


            try {

                await loadWeather(
                    latitude,
                    longitude,
                    "Your Location"
                );

            }

            catch (error) {

                console.error(
                    "Current location weather error:",
                    error
                );

                showError(
                    "Unable to load weather for your current location."
                );
            }

        },

        error => {

            console.error(
                "Geolocation error:",
                error
            );


            let message =
                "Unable to get your location.";


            if (error.code === 1) {

                message =
                    "Location permission was denied. Please allow location access in your browser.";
            }

            else if (error.code === 2) {

                message =
                    "Your location could not be determined.";
            }

            else if (error.code === 3) {

                message =
                    "Location request timed out.";
            }


            showError(message);
        },

        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
        }
    );
}


/* =========================================================
   THEME TOGGLE
========================================================= */

function toggleTheme() {

    document.body.classList.toggle(
        "light-mode"
    );


    const isLight =
        document.body.classList.contains(
            "light-mode"
        );


    if (themeToggle) {

        themeToggle.textContent =
            isLight
                ? "☀️"
                : "🌙";
    }


    localStorage.setItem(
        "weatherTheme",
        isLight
            ? "light"
            : "dark"
    );
}


/* =========================================================
   LOAD SAVED THEME
========================================================= */

function loadSavedTheme() {

    const savedTheme =
        localStorage.getItem(
            "weatherTheme"
        );


    if (
        savedTheme === "light"
    ) {

        document.body.classList.add(
            "light-mode"
        );


        if (themeToggle) {

            themeToggle.textContent =
                "☀️";
        }
    }

    else {

        if (themeToggle) {

            themeToggle.textContent =
                "🌙";
        }
    }
}


/* =========================================================
   EVENT LISTENERS
========================================================= */


/* Search button */

if (searchButton) {

    searchButton.addEventListener(
        "click",
        searchLocation
    );
}


/* Enter key */

if (locationInput) {

    locationInput.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                event.preventDefault();

                searchLocation();
            }
        }
    );
}


/* Search suggestions */

if (locationInput) {

    locationInput.addEventListener(
        "input",
        searchSuggestions
    );
}


/* Use current location */

if (locationButton) {

    locationButton.addEventListener(
        "click",
        getUserLocation
    );
}


/* Theme button */

if (themeToggle) {

    themeToggle.addEventListener(
        "click",
        toggleTheme
    );
}


/* Hide suggestions when clicking outside */

document.addEventListener(
    "click",
    event => {

        if (
            locationSuggestions &&
            locationInput &&
            !locationSuggestions.contains(event.target) &&
            event.target !== locationInput
        ) {

            hideSuggestions();
        }
    }
);


/* =========================================================
   INITIALIZE APPLICATION
========================================================= */

function initializeApp() {

    console.log(
        "Weather Dashboard JavaScript loaded successfully."
    );

    console.log(
        "Weather Dashboard started."
    );


    loadSavedTheme();


    /*
     * Load Bengaluru automatically
     * when the page starts.
     */

    loadWeather(
        currentLatitude,
        currentLongitude,
        currentLocationName
    );
}


/* =========================================================
   START APPLICATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);
