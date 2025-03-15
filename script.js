const apiKey = "080dfbe499bef4726a8d011d91ae45ed"; 

document.addEventListener("DOMContentLoaded", function () {
    // Dark Mode Toggle
    const darkModeToggle = document.getElementById("darkModeToggle");

    // Check local storage for dark mode preference
    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-mode");
        darkModeToggle.checked = true;
    }

    // Toggle dark mode on switch change
    darkModeToggle.addEventListener("change", function () {
        if (this.checked) {
            document.body.classList.add("dark-mode");
            localStorage.setItem("darkMode", "enabled");
        } else {
            document.body.classList.remove("dark-mode");
            localStorage.setItem("darkMode", "disabled");
        }
    });

    // Current Location Button
    document.getElementById("locationBtn").addEventListener("click", function () {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async function (position) {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                try {
                    const reverseGeoResponse = await fetch(
                        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
                    );
                    const locationData = await reverseGeoResponse.json();

                    if (locationData.cod === 200) {
                        fetchWeather(locationData.name); // Fetch weather using detected city name
                    } else {
                        alert("Location not found. Please try again.");
                    }
                } catch (error) {
                    console.error("Error fetching location data:", error);
                }
            }, function (error) {
                alert("Unable to retrieve location. Please allow location access.");
            });
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    });
});

// const apiKey = "080dfbe499bef4726a8d011d91ae45ed"; // OpenWeather API Key

document.getElementById("citySearch").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        let city = this.value.trim();
        if (city) {
            city = formatCityName(city); // Fixes capitalization issue
            fetchWeather(city);
        }
    }
});

// ✅ Fixes City Name Capitalization
function formatCityName(city) {
    return city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
}

// ✅ Fetch Weather Data from OpenWeather API
async function fetchWeather(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`
        );
        const data = await response.json();

        if (data.cod === 200) {
            updateCityCard(data);  // ✅ Fixes Time Issue Here!
            updateWeatherCard(data);
        } else {
            showErrorMessage("City not found. Please enter a valid city name.");
        }
    } catch (error) {
        console.error("Error fetching weather data:", error);
        showErrorMessage("Network error. Please check your connection.");
    }
}

// ✅ FIXED: Get Correct Local Time using JavaScript Formatter
function updateCityCard(data) {
    document.getElementById("cityName").textContent = data.name; // Update City Name

    const timezoneOffset = data.timezone; // Timezone offset in seconds
    const localTime = new Date(Date.now() + timezoneOffset * 1000); // Adjust UTC time

    // ✅ The Fix: Use `Intl.DateTimeFormat()` with correct timezone
    const options = { hour: "2-digit", minute: "2-digit", timeZone: "UTC" };
    const formattedTime = new Intl.DateTimeFormat("en-US", options).format(localTime);
    const formattedDate = localTime.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "short" });

    document.getElementById("time").textContent = formattedTime; // ✅ Now Correct!
    document.getElementById("date").textContent = formattedDate;
}

// ✅ Function to Update the Weather Details Card
function updateWeatherCard(data) {
    document.getElementById("temp").textContent = `${Math.round(data.main.temp)}°C`;
    document.getElementById("feelsLike").textContent = `${Math.round(data.main.feels_like)}°C`;
    document.getElementById("weatherCondition").textContent = data.weather[0].main;
    document.getElementById("weatherIcon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
    document.getElementById("weatherIcon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
    document.getElementById("weatherIcon").style.width = "100px"; // Set width
    document.getElementById("weatherIcon").style.height = "100px"; // Set height
     
   

    const rightSection = document.querySelector(".right-section .weather-info");
    const infoBoxes = rightSection.querySelectorAll(".info-box .text-center");

    if (infoBoxes.length >= 4) {
        infoBoxes[0].innerHTML = `${data.main.humidity}% <br> <small>Humidity</small>`;
        infoBoxes[1].innerHTML = `${data.wind.speed} km/h <br> <small>Wind Speed</small>`;
        infoBoxes[2].innerHTML = `${data.main.pressure} hPa <br> <small>Pressure</small>`;
        infoBoxes[3].innerHTML = `N/A <br> <small>UV</small>`; // UV index not available in this API
    }

    const sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    document.getElementById("sunrise").textContent = sunriseTime;
    document.getElementById("sunset").textContent = sunsetTime;
}

// ✅ Shows Error Message in UI Instead of Popup
function showErrorMessage(message) {
    const cityNameElement = document.getElementById("cityName");
    cityNameElement.textContent = message;
    cityNameElement.style.color = "red"; // Highlight error

    document.getElementById("time").textContent = "--:--";
    document.getElementById("date").textContent = "Invalid city";
    document.getElementById("temp").textContent = "--°C";
    document.getElementById("feelsLike").textContent = "--°C";
    document.getElementById("weatherCondition").textContent = "--";
    document.getElementById("weatherIcon").src = "images/error.png"; // Default error icon
    document.getElementById("sunrise").textContent = "--:--";
    document.getElementById("sunset").textContent = "--:--";
}



// for hourly forecast






//const apiKey = "080dfbe499bef4726a8d011d91ae45ed"; // OpenWeather API Key

document.getElementById("citySearch").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        let city = this.value.trim();
        if (city) {
            city = formatCityName(city); // Fixes capitalization issue
            fetchWeather(city);
            fetchForecast(city); // Fetch 5-day & hourly forecast
        }
    }
});

// ✅ Fetch 5-Day & Hourly Forecast
async function fetchForecast(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`
        );
        const data = await response.json();

        if (data.cod === "200") {
            updateHourlyForecast(data);
        } else {
            console.error("Error fetching forecast data:", data.message);
        }
    } catch (error) {
        console.error("Error fetching forecast data:", error);
    }
}

// ✅ Update Hourly Forecast
function updateHourlyForecast(data) {
    const hourlyContainer = document.querySelector(".hourly-container");
    hourlyContainer.innerHTML = ""; // Clear previous data

    data.list.slice(0, 5).forEach((entry) => {
        const time = entry.dt_txt.split(" ")[1].slice(0, 5); // Extract HH:MM
        const temp = Math.round(entry.main.temp);
        const icon = `https://openweathermap.org/img/wn/${entry.weather[0].icon}.png`;
        const windSpeed = entry.wind.speed;

        const hourlyItem = document.createElement("div");
        hourlyItem.classList.add("hourly-item");
        hourlyItem.innerHTML = `
            <p>${time}</p>
            <img src="${icon}" class="forecast-img5">
            <p>${temp}°C</p>
            <img src="images/paper-plane2.png" class="forecast-img5">
            <p>${windSpeed} km/h</p>
        `;
        
        hourlyContainer.appendChild(hourlyItem);
    });
}

// ✅ Correctly Fetch & Update 5-Day Forecast
async function fetchForecast(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`
        );
        const data = await response.json();

        if (data.cod === "200") {
            updateHourlyForecast(data);
            updateFiveDayForecast(data); // ✅ Ensuring it updates the 5-day forecast
        } else {
            console.error("Error fetching forecast data:", data.message);
        }
    } catch (error) {
        console.error("Error fetching forecast data:", error);
    }
}

// ✅ Fixed Update 5-Day Forecast Function
function updateFiveDayForecast(data) {
    const forecastList = document.getElementById("forecastList");
    forecastList.innerHTML = ""; // ✅ Clear previous data before updating

    const dailyForecasts = {};

    // ✅ Loop through forecast data and pick only one entry per day (12:00 PM preferred)
    data.list.forEach((item) => {
        const date = item.dt_txt.split(" ")[0]; // Extract the date (YYYY-MM-DD)
        const time = item.dt_txt.split(" ")[1]; // Extract the time (HH:MM:SS)

        // ✅ Select the forecast for midday (12:00 PM) or the closest available time
        if (!dailyForecasts[date] || (time >= "12:00:00" && time < "15:00:00")) {
            dailyForecasts[date] = item;
        }
    });

    // ✅ Display only 5 days of forecast
    Object.values(dailyForecasts).slice(0, 5).forEach((day) => {
        const forecastItem = document.createElement("li");
        forecastItem.innerHTML = `
            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" class="forecast-img">
            ${Math.round(day.main.temp)}°C ${new Date(day.dt_txt).toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "short" })}
        `;
        forecastList.appendChild(forecastItem);
    });
}





