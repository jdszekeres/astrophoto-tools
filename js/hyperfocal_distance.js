const focalLengthInput = document.getElementById('focal_length');
const apertureInput = document.getElementById('aperture');
const isAPSCInput = document.getElementById('is_apsc');


const calculateButton = document.getElementById('calculate-button');

const resultsContainer = document.getElementById('results-container');

const hyperfocalDistanceOutput = document.getElementById('hyperfocal_distance_result');


function calculateHyperfocalDistance() {
    let focalLength = parseFloat(focalLengthInput.value);
    const aperture = parseFloat(apertureInput.value);
    const isAPSC = isAPSCInput.checked;

    if (isNaN(focalLength) || isNaN(aperture) || focalLength <= 0 || aperture <= 0) {
        alert('Please enter valid positive numbers for focal length and aperture.');
        return;
    }

    if (isAPSC) {
        focalLength *= 1.6; // Adjust for APS-C crop factor
    }

    const circleOfConfusion = 0.029; // in mm
    const hyperfocalDistance = (focalLength * focalLength) / (aperture * circleOfConfusion) + focalLength; // in mm



    hyperfocalDistanceOutput.textContent = 'Hyperfocal Distance: ' + (hyperfocalDistance / 1000).toFixed(2) + ' m';

    resultsContainer.style.display = 'block';
}


calculateButton.addEventListener('click', calculateHyperfocalDistance);