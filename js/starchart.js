let stars = [];
let starNames = {};

const planets = [
    Astronomy.Body.Sun,
    Astronomy.Body.Moon,
    Astronomy.Body.Mercury,
    Astronomy.Body.Venus,
    Astronomy.Body.Mars,
    Astronomy.Body.Jupiter,
    Astronomy.Body.Saturn,
    Astronomy.Body.Uranus,
    Astronomy.Body.Neptune,
    Astronomy.Body.Pluto
]

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
    const response = await fetch('/assets/IAU-CSN.json');  //IAU Catalog of Star Names
    const data = await response.json();
    
    data.forEach(entry => {
        starNames[entry["HD"]] = entry["Name/Diacritics"];
    });
}


async function parse_star_data(data) {
    await constellationLinesReady;

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

const b1875Time = Astronomy.MakeTime(new Date('1875-01-01T12:00:00Z'));
const b1875ToJ2000 = Astronomy.InverseRotation(Astronomy.Rotation_EQJ_EQD(b1875Time));

function precess1875To2000(raHours, decDegrees) {
    const raRadians = raHours * 15 * Math.PI / 180;
    const decRadians = decDegrees * Math.PI / 180;
    const vector1875 = new Astronomy.Vector(
        Math.cos(decRadians) * Math.cos(raRadians),
        Math.cos(decRadians) * Math.sin(raRadians),
        Math.sin(decRadians),
        b1875Time
    );
    const vector2000 = Astronomy.RotateVector(b1875ToJ2000, vector1875);
    return Astronomy.EquatorFromVector(vector2000);
}

function drawStar(ctx, centerX, centerY, star, maxRadius) {
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
            const displayName = IAU_name ? IAU_name : star.name;
            ctx.fillText(displayName, centerX + x + 5, centerY - y - 5); // Offset the text slightly
        }
}

function drawStars(ctx, centerX, centerY, starObject, maxRadius) {
    Object.values(starObject).forEach(star => {
        drawStar(ctx, centerX, centerY, star, maxRadius);
    });
}

function drawConstellationLines(ctx, centerX, centerY, starObject, constellation_lines, maxRadius) {
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
    });
}

function drawConstellationLabels(ctx, centerX, centerY, starObject, constellation_lines, maxRadius) {
    Object.entries(stars.map((star) => {
        const {r, theta} = starObject[star.id] || {};
        if (r !== undefined && theta !== undefined && r > 90) {
            return null;
        }

        const ra = star.ra_hrs + (star.ra_min / 60) + (star.ra_sec / 3600);
        const dec = (star.dec_sign === '-' ? -1 : 1) * (star.dec_deg + (star.dec_min / 60) + (star.dec_sec / 3600));

        const constellationInfo = Astronomy.Constellation(ra, dec);

        if (constellationInfo) {
            const constellationName = constellationInfo.name;

            const { x, y } = polarToCartesian(r * (maxRadius / 90), theta);
            return { constellationName, x:  x, y: y };
        }
    }).reduce((acc, val) => {
        if (val && !isNaN(val.x) && !isNaN(val.y)) {
            const count = acc[val.constellationName]?.count || 0;

            const avgX = ((acc[val.constellationName]?.x || 0) * (count) + val.x) / (count + 1);
            const avgY = ((acc[val.constellationName]?.y || 0) * (count) + val.y) / (count + 1);

            acc[val.constellationName] = { x: avgX, y: avgY, count: (acc[val.constellationName]?.count || 0) + 1 };
        }
        return acc;
    }, {})).forEach(([constellationName, { x, y }]) => {

        console.log(`Labeling constellation ${constellationName} at (${x}, ${y})`);
        ctx.font = '12px Arial';
        ctx.fillStyle = 'blue';
        ctx.fillText(constellationName, centerX + x + 5, centerY - y - 5); // Offset the text slightly
    });
}

function drawPlanet(ctx, centerX, centerY, observer, date, planet, maxRadius) {
    const planetEquatorial = Astronomy.Equator(planet, date, observer, true, true);
        const planetHorizontal = Astronomy.Horizon(date, observer, planetEquatorial.ra, planetEquatorial.dec);
        const r = 90 - planetHorizontal.altitude;
        const theta = planetHorizontal.azimuth;

        if (r <= 90) { // Only draw if above the horizon
            const { x, y } = polarToCartesian(r * (maxRadius / 90), theta);
            ctx.beginPath();
            ctx.arc(centerX + x, centerY - y, 6, 0, 2 * Math.PI);
            ctx.fillStyle = 'yellow';
            ctx.fill();
            ctx.font = '12px Arial';
            ctx.fillStyle = 'rgba(255, 255, 0, 0.8)';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 1;
            ctx.strokeText(planet, centerX + x + 8, centerY - y - 8); // Offset the text slightly
            ctx.fillText(planet, centerX + x + 8, centerY - y - 8); // Place yellow text on top of the black stroke for better visibility
        }
}

// function drawConstellationBounds(ctx, centerX, centerY, starObject, maxRadius, observer, date) {
//     const constellations = stars.map((star) => {
//         const {r, theta} = starObject[star.id] || {};
//         if (r !== undefined && theta !== undefined && r > 90) {
//             return null;
//         }

//         const ra = star.ra_hrs + (star.ra_min / 60) + (star.ra_sec / 3600);
//         const dec = (star.dec_sign === '-' ? -1 : 1) * (star.dec_deg + (star.dec_min / 60) + (star.dec_sec / 3600));

//         return Astronomy.Constellation(ra, dec);
//     }).filter(Boolean);

//     //Find index of constellation in the constellations array
//     const uniqueConstellationsIds = [...new Set(constellations.map(c => c.name))].
//         map(name => Astronomy.ConstelNames.findIndex(c => c[1] === name));

//     Astronomy.ConstelBounds.forEach((b, index) => {
//         if (true) {
//             const fd = 10 / (4 * 60); // conversion factor from compact units to DEC degrees
//             const fr = fd / 15; // conversion factor from compact units to RA  sidereal hours 

//             const dec_lo = b[3] * fd;
//             const dec_hi_units = index === 0 ? 90 / fd : Astronomy.ConstelBounds[index - 1][3];
//             const dec_hi = dec_hi_units * fd;
//             const ra_lo = b[1] * fr;
//             const ra_hi = b[2] * fr;

//             console.log(`Drawing bounds for constellation ${Astronomy.ConstelNames[b[0]][1]}: RA ${ra_lo} to ${ra_hi}, Dec ${dec_lo} to ${dec_hi}`);

//             const corners = [
//                 precess1875To2000(ra_lo, dec_lo),
//                 precess1875To2000(ra_hi, dec_lo),
//                 precess1875To2000(ra_hi, dec_hi),
//                 precess1875To2000(ra_lo, dec_hi),
//             ];

//             const points = corners.map(corner => {
//                 const hor = Astronomy.Horizon(date, observer, corner.ra, corner.dec);
//                 return {
//                     altitude: hor.altitude,
//                     x: polarToCartesian((90 - hor.altitude) * (maxRadius / 90), hor.azimuth).x,
//                     y: polarToCartesian((90 - hor.altitude) * (maxRadius / 90), hor.azimuth).y,
//                 };
//             });

//             if (points.some(point => point.altitude > 0)) {
//                 ctx.beginPath();
//                 ctx.moveTo(centerX + points[0].x, centerY - points[0].y);
//                 points.slice(1).forEach(point => {
//                     ctx.lineTo(centerX + point.x, centerY - point.y);
//                 });
//                 ctx.closePath();
//                 ctx.fillStyle = 'rgba(0, 255, 0, 0.08)';
//                 ctx.fill();
//                 ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
//                 ctx.stroke();
//             }
//         }
//     });
// }
        
        

function createStarChart(observer, stars, date) {
    const starPositions = getStarPositionsAtTime(observer, stars, date);
    const canvas = document.getElementById('starChart');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = 300; // Maximum radius for the star chart

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);


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


        starObject[star.id] = {r: star.r, theta: star.theta, mag: star.mag, id: star.id, name: star.name, HD: star.HD};
    });

    //Draw overall constellation labels
    drawConstellationLabels(ctx, centerX, centerY, starObject, constellation_lines, maxRadius);

    //Draw constellation bounds
    // drawConstellationBounds(ctx, centerX, centerY, starObject, maxRadius, observer, date);

    //Draw stars
    drawStars(ctx, centerX, centerY, starObject, maxRadius);

    //Draw constellation lines

    drawConstellationLines(ctx, centerX, centerY, starObject, constellation_lines, maxRadius);


    //Draw and label planets
    for (const planet of planets) {
        drawPlanet(ctx, centerX, centerY, observer, date, planet, maxRadius);
    }
}

document.getElementById('submitbutton').addEventListener('click', async (e) => {
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

    await constellationLinesReady;

    if (stars.length === 0) {
        const data = await fetch_star_data();
        const parsed_stars = await parse_star_data(data);
        stars = Array.from(parsed_stars).sort((a, b) => a.mag - b.mag);
    }

    createStarChart(observer, stars, date);
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
