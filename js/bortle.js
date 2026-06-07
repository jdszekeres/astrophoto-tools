const nightSky = new NightSky();


document.getElementById('submitbutton').addEventListener('click', async (event) => {
    event.preventDefault();

    const lat = parseFloat(document.getElementById('lat').value);
    const lon = parseFloat(document.getElementById('lon').value);

    const sqm = await nightSky.getBrightness(lat, lon);
    const bortleClass = nightSky.getBortleClass(sqm);
    alert(`Bortle Class: ${bortleClass}\nSky Brightness (SQM): ${sqm.toFixed(2)}`);
});