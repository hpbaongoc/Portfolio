
// PROJECT POKÉMON (PokéAPI)

const pokemonDataElement = document.getElementById('pokemon-data');

// Hàm chọn ngẫu nhiên một ID Pokémon (1–151)
function getRandomPokemonId() {
    return Math.floor(Math.random() * (151 - 1 + 1) + 1);
}

// Hàm lấy dữ liệu Pokémon ngẫu nhiên
async function fetchRandomPokemonData() {
    const randomId = getRandomPokemonId();
    const POKEAPI_URL = `https://pokeapi.co/api/v2/pokemon/${randomId}`;

    pokemonDataElement.innerHTML = '<p>Đang tải dữ liệu Pokémon ngẫu nhiên...</p>';
    try {
        const response = await fetch(POKEAPI_URL);
        if (!response.ok) throw new Error(`Lỗi HTTP: ${response.status}`);

        const data = await response.json();
        const name = data.name.toUpperCase();
        const height = (data.height / 10).toFixed(1);
        const weight = (data.weight / 10).toFixed(1);
        const imageUrl = data.sprites.front_default;
        const abilities = data.abilities.map(a => a.ability.name).join(', ');

        pokemonDataElement.innerHTML = `
            <img src="${imageUrl}" alt="${name}" style="width: 100px; height: 100px;">
            <h4>${name} (#${data.id})</h4>
            <p><b>Chiều cao:</b> ${height} m</p>
            <p><b>Cân nặng:</b> ${weight} kg</p>
            <p><b>Khả năng:</b> ${abilities}</p>
        `;
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu Pokémon:", error);
        pokemonDataElement.innerHTML = '<p style="color: red;">Không thể tải dữ liệu Pokémon 😔</p>';
    }
}

//  PROJECT THỜI TIẾT (Open-Meteo + OpenStreetMap)

const weatherDataElement = document.getElementById('weather-data');
const refreshWeatherBtn = document.getElementById('refresh-weather');
const OPENMETEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast?current_weather=true&';

// Hàm ánh xạ mã thời tiết (WMO Code)
function getWeatherDisplay(wmoCode) {
    const iconBaseClass = 'weather-icon fas'; 
    if (wmoCode === 0) return { icon: `${iconBaseClass} fa-sun`, description: 'Trời quang mây' };
    if (wmoCode >= 1 && wmoCode <= 3) return { icon: `${iconBaseClass} fa-cloud-sun`, description: 'Có mây, Mây rải rác' };
    if (wmoCode >= 45 && wmoCode <= 48) return { icon: `${iconBaseClass} fa-smog`, description: 'Sương mù' };
    if (wmoCode >= 51 && wmoCode <= 65) return { icon: `${iconBaseClass} fa-cloud-rain`, description: 'Mưa nhẹ đến vừa' };
    if (wmoCode >= 66 && wmoCode <= 67) return { icon: `${iconBaseClass} fa-cloud-showers-heavy`, description: 'Mưa đóng băng' };
    if (wmoCode >= 71 && wmoCode <= 75) return { icon: `${iconBaseClass} fa-snowflake`, description: 'Tuyết' };
    if (wmoCode >= 80 && wmoCode <= 82) return { icon: `${iconBaseClass} fa-cloud-showers-heavy`, description: 'Mưa rào mạnh' };
    if (wmoCode >= 95 && wmoCode <= 99) return { icon: `${iconBaseClass} fa-bolt`, description: 'Giông bão' };
    return { icon: `${iconBaseClass} fa-question-circle`, description: 'Không xác định' };
}

// Hàm lấy dữ liệu thời tiết
async function fetchWeatherData(latitude, longitude) {
    weatherDataElement.innerHTML = '<p>Đang tải dữ liệu thời tiết...</p>';
    try {
        const WEATHER_URL = `${OPENMETEO_BASE_URL}latitude=${latitude}&longitude=${longitude}`;
        const response = await fetch(WEATHER_URL);
        if (!response.ok) throw new Error(`Lỗi HTTP: ${response.status}`);

        const data = await response.json();
        const weather = data.current_weather;
        if (!weather) throw new Error("Không tìm thấy dữ liệu thời tiết.");

        const { icon, description } = getWeatherDisplay(weather.weathercode);
        
        // Lấy thông tin địa điểm (OpenStreetMap)
        const locationResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
        const locationData = await locationResponse.json();
        const locationName = locationData.address.city || locationData.address.town || locationData.address.village || 'Vị trí hiện tại';

        weatherDataElement.innerHTML = `
            <div class="${icon} weather-icon"></div>
            <h4>${locationName}</h4>
            <p class="weather-info">${weather.temperature}°C</p>
            <p>${description}</p>
            <p class="small-text">Tốc độ gió: ${weather.windspeed} km/h</p>
        `;
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu thời tiết:", error);
        weatherDataElement.innerHTML = '<p style="color: red;">Không thể tải dữ liệu thời tiết. Lỗi API hoặc Mất kết nối.</p>';
    }
}

function getLocationAndFetchWeather() {
    weatherDataElement.innerHTML = '<p>Đang cố gắng lấy vị trí...</p>';
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                fetchWeatherData(lat, lon);
            },
            (error) => {
                console.error("Lỗi Geolocation:", error);
                weatherDataElement.innerHTML = '<p style="color: red;">Truy cập vị trí bị từ chối hoặc thất bại. Vui lòng cho phép truy cập vị trí.</p>';
            }
        );
    } else {
        weatherDataElement.innerHTML = '<p style="color: red;">Trình duyệt không hỗ trợ Geolocation.</p>';
    }
}


// PROJECT QUY ĐỔI TIỀN (USD → VND, dùng API thật)


const usdInput = document.getElementById("usd-amount");
const convertButton = document.getElementById("convert-usd");
const vndResult = document.getElementById("vnd-result");

let exchangeRate = null;

// Gọi API để lấy tỷ giá thật
async function fetchExchangeRate() {
    try {
        vndResult.textContent = "Fetching real exchange rate...";
        const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
        const data = await response.json();
        exchangeRate = data.rates.VND;
        vndResult.textContent = `✅ Current rate: 1 USD = ${exchangeRate.toLocaleString()} VND`;
        vndResult.style.color = "green";
    } catch (error) {
        vndResult.textContent = "⚠️ Failed to fetch exchange rate. Using default 25,000 VND.";
        exchangeRate = 25000;
        vndResult.style.color = "orange";
    }
}

// Chuyển đổi USD → VND
convertButton.addEventListener("click", () => {
    const usdValue = parseFloat(usdInput.value);
    if (isNaN(usdValue) || usdValue <= 0) {
        vndResult.textContent = "❌ Please enter a valid amount.";
        vndResult.style.color = "red";
        return;
    }

    if (!exchangeRate) {
        vndResult.textContent = "⏳ Please wait, fetching exchange rate...";
        vndResult.style.color = "orange";
        return;
    }

    const vndValue = usdValue * exchangeRate;
    vndResult.textContent = `💰 ${usdValue.toFixed(2)} USD = ${vndValue.toLocaleString()} VND`;
    vndResult.style.color = "green";
});

// Cập nhật tỷ giá mỗi 30 phút
setInterval(fetchExchangeRate, 30 * 60 * 1000);


// KHỞI CHẠY (Khi trang load)


const refreshPokemonBtn = document.getElementById('refresh-pokemon');

document.addEventListener('DOMContentLoaded', () => {
    fetchRandomPokemonData();      // Lấy Pokémon ngẫu nhiên
    getLocationAndFetchWeather();  // Lấy thời tiết
    fetchExchangeRate();           // Lấy tỷ giá ban đầu
});

// Nút "Next Pokémon"
if (refreshPokemonBtn) {
    refreshPokemonBtn.addEventListener('click', fetchRandomPokemonData);
}

// Nút "Refresh Weather"
if (refreshWeatherBtn) {
    refreshWeatherBtn.addEventListener('click', getLocationAndFetchWeather);
}
