let weatherChart = null;
let currentLocation = "";

function updateDateTime() {
  const now = new Date();
  document.getElementById("currentDay").textContent = `Day: ${now.toLocaleDateString('en-IN', { weekday: 'long' })}`;
  document.getElementById("currentDate").textContent = `Date: ${now.toLocaleDateString('en-IN')}`;
  document.getElementById("currentTime").textContent = `Time: ${now.toLocaleTimeString('en-IN')}`;
}

setInterval(updateDateTime, 1000);
updateDateTime();

async function getWeather(type = 'current') {
  const location = document.getElementById("locationInput").value.trim();
  const resultDiv = document.getElementById("weatherResult");
  const currentDiv = document.getElementById("currentWeather");
  const hourlyDiv = document.getElementById("hourlyWeather");
  const forecastDiv = document.getElementById("forecastWeather");

  if (!location) {
    resultDiv.innerHTML = '<div class="error">Please enter a location in India.</div>';
    return;
  }

  document.querySelectorAll('.tab-buttons button').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');

  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });

  resultDiv.innerHTML = '<div class="loading"><div class="spinner"></div>Loading weather data...</div>';
  
  const apiKey = "c217fb55c6084d7a828134345251404";
  let url;
  
  try {
    if (type === 'current') {
      url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location},India&aqi=no`;
    } else if (type === 'hourly') {
      url = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location},India&days=1&aqi=no`;
    } else {
      url = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location},India&days=3&aqi=no`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to fetch weather data');
    }

    const data = await response.json();
    if (!data) {
      throw new Error('No weather data received');
    }
    
    resultDiv.innerText = '';
    currentLocation = data.location.name;
    document.getElementById("locationName").textContent = `Weather in ${data.location.name}, ${data.location.country}`;
    
    if (type === 'current') {
      displayCurrentWeather(data, currentDiv);
      currentDiv.classList.add('active');
    } else if (type === 'hourly') {
      displayHourlyForecast(data, hourlyDiv);
      hourlyDiv.classList.add('active');
    } else {
      displayForecast(data, forecastDiv);
      forecastDiv.classList.add('active');
    }
  } catch (error) {
    console.error("Weather API Error:", error);
    resultDiv.innerHTML = `<div class="error">Error: ${error.message || 'Failed to get weather data'}</div>`;
  }
}

function displayCurrentWeather(data, container) {
  if (!data.location || !data.current) {
    container.innerHTML = '<div class="error">Invalid weather data received</div>';
    return;
  }
  
  const { location, current } = data;
  container.innerHTML = `
    <div class="current-weather">
      <h3>Current Weather in ${location.name}, ${location.country}</h3>
      <p><img src="https:${current.condition.icon}" alt="${current.condition.text}"></p>
      <p>Temperature: <strong>${current.temp_c}°C</strong> (Feels like ${current.feelslike_c}°C)</p>
      <p>Condition: ${current.condition.text}</p>
    </div>
    <div class="weather-details">
      <div class="weather-detail"><p>Humidity</p><p><strong>${current.humidity}%</strong></p></div>
      <div class="weather-detail"><p>Wind Speed</p><p><strong>${current.wind_kph} km/h</strong></p></div>
      <div class="weather-detail"><p>Wind Direction</p><p><strong>${current.wind_dir}</strong></p></div>
      <div class="weather-detail"><p>Pressure</p><p><strong>${current.pressure_mb} mb</strong></p></div>
      <div class="weather-detail"><p>Precipitation</p><p><strong>${current.precip_mm} mm</strong></p></div>
      <div class="weather-detail"><p>UV Index</p><p><strong>${current.uv}</strong></p></div>
      <div class="weather-detail"><p>Visibility</p><p><strong>${current.vis_km} km</strong></p></div>
      <div class="weather-detail"><p>Cloud Cover</p><p><strong>${current.cloud}%</strong></p></div>
    </div>
    <p>Last Updated: ${current.last_updated}</p>
  `;
}

function displayHourlyForecast(data, container) {
  if (!data.location || !data.forecast?.forecastday?.[0]?.hour) {
    container.innerHTML = '<div class="error">Invalid hourly forecast data received</div>';
    return;
  }
  
  const { location, forecast } = data;
  const hours = forecast.forecastday[0].hour;
  
  container.innerHTML = `
    <h3>24-Hour Forecast for ${location.name}, ${location.country}</h3>
    <div class="hourly-forecast">
      ${hours.map(hour => `
        <div class="hourly-item">
          <p><strong>${new Date(hour.time).getHours()}:00</strong></p>
          <p><img src="https:${hour.condition.icon}" alt="${hour.condition.text}" width="30"></p>
          <p>${hour.temp_c}°C</p>
          <p>${hour.condition.text}</p>
          <p>💧 ${hour.humidity}%</p>
          <p>🌬️ ${hour.wind_kph} km/h</p>
          <p>☁️ ${hour.cloud}%</p>
        </div>
      `).join('')}
    </div>
  `;
}

function displayForecast(data, container) {
  if (!data.location || !data.forecast?.forecastday) {
    container.innerHTML = '<div class="error">Invalid forecast data received</div>';
    return;
  }
  
  const { location, forecast } = data;
  container.innerHTML = `
    <h3>3-Day Forecast for ${location.name}, ${location.country}</h3>
    <div class="forecast-container">
      ${forecast.forecastday.map(day => `
        <div class="forecast-day">
          <h3>${new Date(day.date).toLocaleDateString('en-IN', { weekday: 'long' })}</h3>
          <p>${new Date(day.date).toLocaleDateString('en-IN')}</p>
          <p><img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}"></p>
          <p>Max: ${day.day.maxtemp_c}°C</p>
          <p>Min: ${day.day.mintemp_c}°C</p>
          <p>${day.day.condition.text}</p>
          <p>Rain: ${day.day.daily_chance_of_rain}%</p>
          <p>Humidity: ${day.day.avghumidity}%</p>
          <p>Wind: ${day.day.maxwind_kph} km/h</p>
          <p>Visibility: ${day.day.avgvis_km} km</p>
          <p>UV Index: ${day.day.uv}</p>
        </div>
      `).join('')}
    </div>
  `;
}

document.getElementById("locationInput").addEventListener("keypress", function(e) {
  if (e.key === "Enter") {
    getWeather('current');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  updateDateTime();
});
