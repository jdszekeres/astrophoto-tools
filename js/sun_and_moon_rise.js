const lat_input = document.getElementById('lat');
const lon_input = document.getElementById('lon');

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            lat_input.value = position.coords.latitude.toFixed(6);
            lon_input.value = position.coords.longitude.toFixed(6);
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

document.getElementById('date').valueAsDate = new Date();
document.getElementById('current-location-button').addEventListener('click', getLocation);


const getMoonPhase = (phase) => {
    if (phase === 0 || phase === 1) {
        return "New Moon";
    } else if (phase > 0 && phase < 0.25) {
        return "Waxing Crescent";
    } else if (phase === 0.25) {
        return "First Quarter";
    } else if (phase > 0.25 && phase < 0.5) {
        return "Waxing Gibbous";
    } else if (phase === 0.5) {
        return "Full Moon";
    }
    else if (phase > 0.5 && phase < 0.75) {
        return "Waning Gibbous";
    } else if (phase === 0.75) {
        return "Last Quarter";
    } else {
        return "Waning Crescent";
    }
};

const getMoonPhaseEmoji = (phase) => {
    if (phase === "New Moon") {
        return "🌑";
    } else if (phase === "Waxing Crescent") {
        return "🌒";
    } else if (phase === "First Quarter") {
        return "🌓";
    } else if (phase === "Waxing Gibbous") {
        return "🌔"
    } else if (phase === "Full Moon") {
            return "🌕";
    } else if (phase === "Waning Gibbous") {
        return "🌖";
    }  else if (phase === "Waning Crescent") {
        return "🌘";
    } else if (phase === "Last Quarter") {
        return "🌗";
    } else {
        return "";
    }
};

document.getElementById('submit-button').addEventListener('click', (event) => {
    event.preventDefault();

    const lat = parseFloat(lat_input.value);
    const lon = parseFloat(lon_input.value);
    const date = document.getElementById('date').value;

    if (isNaN(lat) || isNaN(lon)) {
        alert("Please enter valid latitude and longitude values.");
        return;
    } 

    const sun_times = getTimes(new Date(date), lat, lon);

    const sunrise = sun_times.sunrise ? sun_times.sunrise.toLocaleTimeString() : "N/A";
    const sunset = sun_times.sunset ? sun_times.sunset.toLocaleTimeString() : "N/A";
    
    const night = sun_times.night ? sun_times.night.toLocaleTimeString() : "N/A";

    const nightEnd = sun_times.nightEnd ? sun_times.nightEnd.toLocaleTimeString() : "N/A";

    const moon_times = getMoonTimes(new Date(date), lat, lon);
    const moonrise = moon_times.rise ? moon_times.rise.toLocaleTimeString() : "N/A";
    const moonset = moon_times.set ? moon_times.set.toLocaleTimeString() : "N/A";

    const moonIllumination = getMoonIllumination(moon_times.rise ? moon_times.rise : new Date(date));

    const moonPhase = getMoonPhase(moonIllumination.phase);
    const moonPhaseEmoji = getMoonPhaseEmoji(moonPhase);

    const moonIlluminationPercent = (moonIllumination.fraction * 100).toFixed(2) + "%";

    document.getElementById('sunrise').textContent = sunrise;
    document.getElementById('sunset').textContent = sunset;
    document.getElementById('night_start').textContent = night;
    document.getElementById('night_end').textContent = nightEnd;
    document.getElementById('moonrise').textContent = moonrise;
    document.getElementById('moonset').textContent = moonset;
    document.getElementById('moonphase').textContent = moonPhase + " " + moonPhaseEmoji;
    document.getElementById('moonillumination').textContent = moonIlluminationPercent;

    document.getElementById('results_container').style.display = 'flex';

});