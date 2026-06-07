const nightSky = new NightSky();


document.getElementById('submitbutton').addEventListener('click', async (event) => {
    event.preventDefault();

    const lat = parseFloat(document.getElementById('lat').value);
    const lon = parseFloat(document.getElementById('lon').value);

    const sqm = await nightSky.getBrightness(lat, lon);
    const bortleClass = nightSky.getBortleClass(sqm);

    document.getElementById('bortle-value').textContent = bortleClass;
    document.getElementById('bortle-value').style.textDecoration = `underline blue`;
    document.getElementById('bortle-value').onclick = () => {
        window.location.href = `/pages/bortle_reference.html?bortle=${bortleClass}`;
    };
    document.getElementById('brightness-value').textContent = sqm.toFixed(2);

    const skyImage = document.getElementById('sky-image');
    skyImage.src = nightSky.getImageOfCoordinate(lat, lon);
    skyImage.style.display = 'block';
});