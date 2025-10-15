
// 1. PROJECT POKÉMON (PokéAPI)
const pokemonDataElement = document.getElementById('pokemon-data');

// Hàm chọn ngẫu nhiên một ID Pokémon (Ví dụ: từ 1 đến 151)
function getRandomPokemonId() {
    // Giới hạn Pokémon từ 1 đến 151 (Thế hệ 1)
    return Math.floor(Math.random() * (151 - 1 + 1) + 1);
}

// Hàm lấy dữ liệu Pokémon ngẫu nhiên
async function fetchRandomPokemonData() {
    const randomId = getRandomPokemonId();
    const POKEAPI_URL = `https://pokeapi.co/api/v2/pokemon/${randomId}`;

    pokemonDataElement.innerHTML = '<p>Đang tải dữ liệu Pokémon ngẫu nhiên...</p>';
    try {
        const response = await fetch(POKEAPI_URL);
        if (!response.ok) {
            throw new Error(`Lỗi HTTP: ${response.status}`);
        }
        const data = await response.json();

        // Lấy thông tin cần thiết
        const name = data.name.toUpperCase();
        const height = (data.height / 10).toFixed(1); // đổi sang mét
        const weight = (data.weight / 10).toFixed(1); // đổi sang kg
        // Sử dụng front_default cho hình ảnh
        const imageUrl = data.sprites.front_default; 
        const abilities = data.abilities.map(a => a.ability.name).join(', ');

        // Hiển thị dữ liệu
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

// 2. PROJECT THỜI TIẾT (Open-Meteo)

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

async function fetchWeatherData(latitude, longitude) {
    weatherDataElement.innerHTML = '<p>Đang tải dữ liệu thời tiết...</p>';
    try {
        const WEATHER_URL = `${OPENMETEO_BASE_URL}latitude=${latitude}&longitude=${longitude}`;
        const response = await fetch(WEATHER_URL);
        
        if (!response.ok) {
            throw new Error(`Lỗi HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        const weather = data.current_weather;

        if (!weather) {
             throw new Error("Không tìm thấy dữ liệu thời tiết.");
        }

        const { icon, description } = getWeatherDisplay(weather.weathercode);
        
        // Lấy thông tin vị trí (OpenStreetMap)
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



// 3. KHỞI CHẠY

const refreshPokemonBtn = document.getElementById('refresh-pokemon');

// Gọi khi trang tải xong
document.addEventListener('DOMContentLoaded', () => {
    fetchRandomPokemonData(); 
    getLocationAndFetchWeather(); 
});

// Xử lý sự kiện nút Làm mới Pokémon
if (refreshPokemonBtn) {
    refreshPokemonBtn.addEventListener('click', fetchRandomPokemonData);
}

// Xử lý sự kiện nút Làm mới thời tiết
refreshWeatherBtn.addEventListener('click', getLocationAndFetchWeather);