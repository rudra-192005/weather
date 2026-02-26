// API Configuration
const API_KEY = '1a24ce3843af7e63891191b9dfd4ca27'; // REPLACE THIS WITH YOUR ACTUAL API KEY
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const currentLocationBtn = document.getElementById('currentLocationBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const currentWeather = document.getElementById('currentWeather');
const forecastSection = document.getElementById('forecastSection');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');

// Weather display elements
const cityName = document.getElementById('cityName');
const dateTime = document.getElementById('dateTime');
const weatherIcon = document.getElementById('weatherIcon');
const temperature = document.getElementById('temperature');
const feelsLike = document.getElementById('feelsLike');
const weatherDesc = document.getElementById('weatherDesc');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const pressure = document.getElementById('pressure');
const visibility = document.getElementById('visibility');
const forecastContainer = document.getElementById('forecastContainer');

// Event Listeners
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherData(city);
    } else {
        showError('Please enter a city name');
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            getWeatherData(city);
        } else {
            showError('Please enter a city name');
        }
    }
});

currentLocationBtn.addEventListener('click', getCurrentLocation);

// Get current location
function getCurrentLocation() {
    if (navigator.geolocation) {
        showLoading();
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                getWeatherByCoordinates(latitude, longitude);
            },
            (error) => {
                hideLoading();
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        showError('Please allow location access to use this feature');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        showError('Location information is unavailable');
                        break;
                    case error.TIMEOUT:
                        showError('Location request timed out');
                        break;
                    default:
                        showError('An unknown error occurred');
                }
            }
        );
    } else {
        showError('Geolocation is not supported by your browser');
    }
}

// Get weather by city name with improved error handling
async function getWeatherData(city) {
    // Check if API key is set
    if (API_KEY === 'YOUR_API_KEY_HERE') {
        showError('Please set your OpenWeatherMap API key in script.js');
        return;
    }

    try {
        showLoading();
        hideError();
        
        console.log('Fetching weather for:', city); // Debug log
        
        // Fetch current weather
        const weatherResponse = await fetch(
            `${BASE_URL}/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`
        );
        
        console.log('Weather Response Status:', weatherResponse.status); // Debug log
        
        if (!weatherResponse.ok) {
            if (weatherResponse.status === 401) {
                throw new Error('Invalid API key. Please check your OpenWeatherMap API key');
            } else if (weatherResponse.status === 404) {
                throw new Error(`City "${city}" not found`);
            } else {
                throw new Error(`API Error: ${weatherResponse.status}`);
            }
        }
        
        const weatherData = await weatherResponse.json();
        console.log('Weather Data:', weatherData); // Debug log
        
        // Fetch 5-day forecast
        const forecastResponse = await fetch(
            `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`
        );
        
        if (!forecastResponse.ok) {
            console.warn('Forecast fetch failed, but current weather is available');
            // Still display current weather even if forecast fails
            displayWeather(weatherData);
            hideLoading();
            return;
        }
        
        const forecastData = await forecastResponse.json();
        console.log('Forecast Data:', forecastData); // Debug log
        
        displayWeather(weatherData);
        displayForecast(forecastData);
        hideLoading();
        
    } catch (error) {
        console.error('Error details:', error); // Debug log
        hideLoading();
        showError(error.message);
        currentWeather.style.display = 'none';
        forecastSection.style.display = 'none';
    }
}

// Get weather by coordinates
async function getWeatherByCoordinates(lat, lon) {
    // Check if API key is set
    if (API_KEY === 'YOUR_API_KEY_HERE') {
        showError('Please set your OpenWeatherMap API key in script.js');
        return;
    }

    try {
        showLoading();
        hideError();
        
        console.log('Fetching weather for coordinates:', lat, lon); // Debug log
        
        // Fetch current weather
        const weatherResponse = await fetch(
            `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );
        
        if (!weatherResponse.ok) {
            if (weatherResponse.status === 401) {
                throw new Error('Invalid API key. Please check your OpenWeatherMap API key');
            } else {
                throw new Error('Unable to fetch weather data');
            }
        }
        
        const weatherData = await weatherResponse.json();
        
        // Fetch 5-day forecast
        const forecastResponse = await fetch(
            `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );
        
        if (!forecastResponse.ok) {
            console.warn('Forecast fetch failed, but current weather is available');
            displayWeather(weatherData);
            hideLoading();
            return;
        }
        
        const forecastData = await forecastResponse.json();
        
        displayWeather(weatherData);
        displayForecast(forecastData);
        hideLoading();
        
    } catch (error) {
        console.error('Error details:', error); // Debug log
        hideLoading();
        showError(error.message);
        currentWeather.style.display = 'none';
        forecastSection.style.display = 'none';
    }
}

// Display current weather
function displayWeather(data) {
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    
    const now = new Date();
    dateTime.textContent = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
    weatherIcon.alt = data.weather[0].description;
    
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    feelsLike.textContent = `Feels like ${Math.round(data.main.feels_like)}°C`;
    weatherDesc.textContent = data.weather[0].description;
    
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${data.wind.speed} m/s`;
    pressure.textContent = `${data.main.pressure} hPa`;
    visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    
    currentWeather.style.display = 'block';
}

// Display 5-day forecast
function displayForecast(data) {
    // Get one forecast per day (at 12:00 PM)
    const dailyForecasts = data.list.filter(item => 
        item.dt_txt.includes('12:00:00')
    ).slice(0, 5);
    
    if (dailyForecasts.length === 0) {
        // If no 12:00 PM forecasts, take every 8th item (approximately daily)
        for (let i = 0; i < data.list.length && i < 40; i += 8) {
            if (data.list[i]) {
                dailyForecasts.push(data.list[i]);
            }
        }
    }
    
    forecastContainer.innerHTML = '';
    
    dailyForecasts.slice(0, 5).forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const card = document.createElement('div');
        card.className = 'forecast-card';
        
        card.innerHTML = `
            <div class="date">${date.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
            })}</div>
            <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" 
                 alt="${forecast.weather[0].description}">
            <div class="temp">${Math.round(forecast.main.temp)}°C</div>
            <div class="desc">${forecast.weather[0].description}</div>
            <div class="humidity">💧 ${forecast.main.humidity}%</div>
        `;
        
        forecastContainer.appendChild(card);
    });
    
    forecastSection.style.display = 'block';
}

// Utility functions
function showLoading() {
    loadingSpinner.style.display = 'block';
    currentWeather.style.display = 'none';
    forecastSection.style.display = 'none';
    errorMessage.style.display = 'none';
}

function hideLoading() {
    loadingSpinner.style.display = 'none';
}

function showError(message) {
    errorText.textContent = message;
    errorMessage.style.display = 'flex';
    currentWeather.style.display = 'none';
    forecastSection.style.display = 'none';
}

function hideError() {
    errorMessage.style.display = 'none';
}

// Initial load - show weather for a default city
window.addEventListener('load', () => {
    // Try Delhi first (more likely to work in your region)
    getWeatherData('Delhi');
});

// Add this for debugging
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});
