const CONSTELLATION_LINES_URL = '/assets/constellation-lines-hr.utf8.txt';

let constellation_lines = [];

const constellationLinesReady = loadConstellationLines();

async function loadConstellationLines() {
    const response = await fetch(CONSTELLATION_LINES_URL);

    if (!response.ok) {
        throw new Error(`Failed to load constellation lines: ${response.status} ${response.statusText}`);
    }

    const fileContent = await response.text();
    constellation_lines = parseConstellationLines(fileContent);
    return constellation_lines;
}

function parseConstellationLines(fileContent) {
    const lines = fileContent.split('\n');

    const constellationLines = [];

    //line format is: "NAME = [HR1, HR2, HR3];[HR4, HR5, HR6];..."

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine === '' || trimmedLine.startsWith('#')) {
            continue; // Skip empty lines and comments
        }

        const [name, starsSegments] = trimmedLine.split(' = ');
        
        const starsSegmentsArray = starsSegments.split(';').map(JSON.parse);

        starsSegmentsArray.forEach((segment) => {
            for (let i = 0; i < segment.length - 1; i++) {
                constellationLines.push([segment[i], segment[i + 1]]);
            } 
        })
    }

    console.log(`Parsed ${constellationLines.length} constellation lines.`);

    return constellationLines;
}