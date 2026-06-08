document.getElementById('calculate_button').addEventListener('click', function() {
    const focalLength = parseFloat(document.getElementById('focal_length').value);
    const isAPSC = document.getElementById('crop_factor_checkbox').checked;

    if (isNaN(focalLength) || focalLength <= 0) {
        alert('Please enter a valid focal length.');
        return;
    }

    const cropFactor = isAPSC ? 1.5 : 1.0;
    const maxExposure = 400 / (focalLength * cropFactor);
    if (maxExposure < 1) {
        document.getElementById('result').textContent = `Maximum Exposure Time: 1/${(1/maxExposure).toFixed(0)} seconds`;
    } else {
        document.getElementById('result').textContent = `Maximum Exposure Time: ${maxExposure.toFixed(0)} seconds`;
    }

    document.querySelector('h2:has(#result)').style.display = 'block';
});