let stars = [];
let starNames = {};

const whiteListedStars = new Set([
    424, // Polaris
    2491, //Sirius

]); //Stars that are part of constellations that are not connected by lines in the constellation_lines array.

async function fetch_star_data() {
    const response = await fetch('/assets/catalog'); //Yale Bright Star Catalog
    const data = await response.text();

    return data;
}

async function fetch_star_names() {
    const response = await fetch('/assets/IAU-CSN.json');
    const data = await response.json();
    
    data.forEach(entry => {
        starNames[entry["HD"]] = entry["Name/Diacritics"];
    });
    console.log('Star names loaded:', starNames);
}


async function parse_star_data(data) {
    const lines = data.split('\n');
    const stars = [];
    for (const line of lines) {
        if (line.length < 1) continue; // Skip empty lines
        const star = {
            id: line.substring(0, 4).trim(),
            HD: parseInt(line.substring(25, 31).trim()),
            name: line.substring(4, 14).trim(),
            ra_hrs: parseFloat(line.substring(75, 77).trim()), //J2000 for RA and Dec
            ra_min: parseFloat(line.substring(77, 79).trim()),
            ra_sec: parseFloat(line.substring(79, 83).trim()),
            dec_sign: line.substring(83, 84).trim(),
            dec_deg: parseFloat(line.substring(84, 86).trim()),
            dec_min: parseFloat(line.substring(86, 88).trim()),
            dec_sec: parseFloat(line.substring(88, 90).trim()),
            mag: parseFloat(line.substring(102, 107).trim()),
        }
        stars.push(star);
    }
    return filterConstellationStars(stars, constellation_lines);
}

function getStarPositionsAtTime(observer, stars, date) {
    const starPositions = stars.map(star => {
        const ra = star.ra_hrs + (star.ra_min / 60) + (star.ra_sec / 3600);
        const dec = (star.dec_sign === '-' ? -1 : 1) * (star.dec_deg + (star.dec_min / 60) + (star.dec_sec / 3600));

        if (isNaN(ra) || isNaN(dec)) {
            console.warn(`Invalid RA/Dec for star ${star.name} (ID: ${star.id})`);
            return null; // Skip this star
        }
        const starHorizontalCoordinate = Astronomy.Horizon(date, observer, ra, dec);
        //convert it to polar coordinates for easier plotting
        const r = 90 - starHorizontalCoordinate.altitude; // radius is 90 - altitude
        const theta = starHorizontalCoordinate.azimuth; // angle is azimuth
        return {
            ...star,
            r: r,
            theta: theta
        };
    });
    return starPositions;
}

function filterConstellationStars(stars, constellation_lines) {
    const constellationStarIds = new Set();
    constellation_lines.forEach(line => {
        constellationStarIds.add(line[0]);
        constellationStarIds.add(line[1]);
    });
    return stars.filter(star => constellationStarIds.has(parseInt(star.id)) || whiteListedStars.has(parseInt(star.id)));
}

const polarToCartesian = (r, theta) => {
    const x = r * Math.cos((theta + 90) * (Math.PI / 180)); //the 90 is to rotate the chart so that 0 degrees is at the top (north)
    const y = r * Math.sin((theta + 90) * (Math.PI / 180));
    return { x, y };
}

function createStarChart(observer, stars, date) {
    const starPositions = getStarPositionsAtTime(observer, stars, date);
    const canvas = document.getElementById('starChart');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = 300; // Maximum radius for the star chart

    // Draw the circular boundary
    ctx.beginPath();
    ctx.arc(centerX, centerY, maxRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'black';
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();

    //draw cardinal directions
    const cardinalDirections = ['N', 'E', 'S', 'W'];
    cardinalDirections.forEach((dir, index) => {
        const angle = index * 90; // 0, 90, 180, 270 degrees
        const { x, y } = polarToCartesian(maxRadius - 20, angle); // Offset by 20 pixels for labels
        ctx.font = '16px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(dir, centerX + x - 8, centerY - y + 8); // Adjust text position for better centering
    });

    const starObject = {}


    starPositions.forEach(star => {

        if (!star) return; // Skip invalid stars
        if (isNaN(star.r) || isNaN(star.theta)) return; // Skip stars with invalid coordinates
        if (star.r > 90) return; // Skip stars below the horizon

        // console.log(`Star ${star.name} (ID: ${star.id}) - r: ${star.r}, theta: ${star.theta}, mag: ${star.mag} name from IAU catalog: ${starNames[star.HD]}`);

        starObject[star.id] = {r: star.r, theta: star.theta, mag: star.mag, id: star.id, name: star.name, HD: star.HD};
    });
    Object.values(starObject).forEach(star => {
        const { x, y } = polarToCartesian(star.r * (maxRadius / 90), star.theta);
        const brightness = Math.max(0, 1 - (star.mag / 6)); // Normalize magnitude to [0, 1]
        const radius = Math.max(1, 5 * brightness); // Scale radius based on brightness
        ctx.beginPath();
        ctx.arc(centerX + x, centerY - y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`; // White color with brightness
        ctx.fill();

       // Optionally, draw star names for brighter stars
        if (star.mag < 2 || whiteListedStars.has(parseInt(star.id))) { // Only label stars brighter than magnitude 2 and whitelisted stars
        ctx.font = '12px Arial';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            const IAU_name = starNames[star.HD];
            console.log(`Star ${star.name} (ID: ${star.id}, HD: ${star.HD}) - IAU name: ${IAU_name}`);
            const displayName = IAU_name ? IAU_name : star.name;
            ctx.fillText(displayName, centerX + x + 5, centerY - y - 5); // Offset the text slightly
        }
    });

    constellation_lines.forEach(line => {
        const star1 = starObject[line[0]];
        const star2 = starObject[line[1]];

        if (star1 && star2) {
            const { x: x1, y: y1 } = polarToCartesian(star1.r * (maxRadius / 90), star1.theta);
            const { x: x2, y: y2 } = polarToCartesian(star2.r * (maxRadius / 90), star2.theta);
            
            ctx.beginPath();
            ctx.moveTo(centerX + x1, centerY - y1);
            ctx.lineTo(centerX + x2, centerY - y2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.stroke();
        }
    })
}

document.getElementById('submitbutton').addEventListener('click', (e) => {
    e.preventDefault();
    const lat = parseFloat(document.getElementById('lat').value);
    const lon = parseFloat(document.getElementById('lon').value);

    const datetimeInput = document.getElementById('datetime').value;

    // Combine datetime into a single Date object
    const date = new Date(datetimeInput); //convert local time to UTC automatically

    if (isNaN(lat) || isNaN(lon)) {
        alert('Please enter valid latitude and longitude values.');
        return;
    }

    const observer = new Astronomy.Observer(lat, lon, 0); // Assuming sea level for altitude

    if (stars.length === 0) {
        stars = fetch_star_data().then(data => parse_star_data(data)).then(parsed_stars => {
            stars = Array.from(parsed_stars).sort((a, b) => a.mag - b.mag);
            createStarChart(observer, stars, date);
        });
    } else {
        createStarChart(observer, stars, date);
    }
});



//load star data
(async () => {
    const data = await fetch_star_data();
    const parsed_stars = await parse_star_data(data);
    stars = Array.from(parsed_stars).sort((a, b) => a.mag - b.mag); // Sort stars by magnitude

    await fetch_star_names();
})()


document.getElementById('current-location-button').addEventListener('click', (e) => {
    e.preventDefault();
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            document.getElementById('lat').value = position.coords.latitude.toFixed(6);
            document.getElementById('lon').value = position.coords.longitude.toFixed(6);
        }, (error) => {
            alert('Error getting location: ' + error.message);
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});
