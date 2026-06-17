const equivalentExposureCalculator = new ExposureCalculator();

const originalExposure = {
    shutterSpeed: 1/125,
    aperture: 8,
    iso: 100
}

const equivalentExposureTriangle = {
    shutterSpeed: NaN,
    aperture: 8,
    iso: 100
}
//elements:
const apertureInput = document.getElementById('ee_aperture');
const shutterSpeedInput = document.getElementById('ee_exposure_time');
const isoInput = document.getElementById('ee_iso');


const equivalentApertureOutput = document.getElementById('ee_aperture_2');
const equivalentShutterSpeedOutput = document.getElementById('ee_exposure_time_2');
const equivalentIsoOutput = document.getElementById('ee_iso_2');

const apertureCheckbox = document.getElementById('ee_aperture_checkbox');
const shutterSpeedCheckbox = document.getElementById('ee_exposure_time_checkbox');
const isoCheckbox = document.getElementById('ee_iso_checkbox');
//checkbox events
apertureCheckbox.addEventListener('change', () => {
    if (apertureCheckbox.checked) {
        shutterSpeedCheckbox.checked = false;
        isoCheckbox.checked = false;
        equivalentApertureOutput.value = '';
        equivalentApertureOutput.disabled = true;
        equivalentShutterSpeedOutput.disabled = false;
        equivalentIsoOutput.disabled = false;

        equivalentExposureTriangle.aperture = NaN;
        equivalentExposureTriangle.shutterSpeed = equivalentShutterSpeedOutput.value.includes('/') ? equivalentShutterSpeedOutput.value.split('/').map(Number).reduce((a, b) => a / b) : parseFloat(equivalentShutterSpeedOutput.value);
        equivalentExposureTriangle.iso = parseInt(equivalentIsoOutput.value);
        updateEquivalentExposure();
    } else {
        equivalentApertureOutput.disabled = false;
    }

});

shutterSpeedCheckbox.addEventListener('change', () => {
    if (shutterSpeedCheckbox.checked) {
        apertureCheckbox.checked = false;
        isoCheckbox.checked = false;
        equivalentShutterSpeedOutput.value = '';
        equivalentShutterSpeedOutput.disabled = true;
        equivalentApertureOutput.disabled = false;
        equivalentIsoOutput.disabled = false;

        equivalentExposureTriangle.shutterSpeed = NaN;
        equivalentExposureTriangle.iso = parseInt(equivalentIsoOutput.value);
        equivalentExposureTriangle.aperture = parseFloat(equivalentApertureOutput.value);
        updateEquivalentExposure();
    } else {
        equivalentShutterSpeedOutput.disabled = false;
    }
});

isoCheckbox.addEventListener('change', () => {
    if (isoCheckbox.checked) {
        apertureCheckbox.checked = false;
        shutterSpeedCheckbox.checked = false;
        equivalentIsoOutput.value = '';
        equivalentIsoOutput.disabled = true;
        equivalentApertureOutput.disabled = false;
        equivalentShutterSpeedOutput.disabled = false;

        equivalentExposureTriangle.iso = NaN;
        equivalentExposureTriangle.shutterSpeed = equivalentShutterSpeedOutput.value.includes('/') ? equivalentShutterSpeedOutput.value.split('/').map(Number).reduce((a, b) => a / b) : parseFloat(equivalentShutterSpeedOutput.value);
        equivalentExposureTriangle.aperture = parseFloat(equivalentApertureOutput.value);
        updateEquivalentExposure();
    }
    else {
        equivalentIsoOutput.disabled = false;
    }
});

//input events
apertureInput.addEventListener('input', () => {
    originalExposure.aperture = parseFloat(apertureInput.value);
    updateEquivalentExposure();
});

shutterSpeedInput.addEventListener('input', () => {
    if (shutterSpeedInput.value.includes('/')) {
        const [numerator, denominator] = shutterSpeedInput.value.split('/').map(Number);
        originalExposure.shutterSpeed = numerator / denominator;
    } else {
        originalExposure.shutterSpeed = parseFloat(shutterSpeedInput.value);
    }
    updateEquivalentExposure();
});

isoInput.addEventListener('input', () => {
    originalExposure.iso = parseInt(isoInput.value);
    updateEquivalentExposure();
});

//equivalent textbox events
equivalentApertureOutput.addEventListener('input', () => {
    equivalentExposureTriangle.aperture = parseFloat(equivalentApertureOutput.value);
    updateEquivalentExposure();
});

equivalentShutterSpeedOutput.addEventListener('input', () => {
    if (equivalentShutterSpeedOutput.value.includes('/')) {
        const [numerator, denominator] = equivalentShutterSpeedOutput.value.split('/').map(Number);
        equivalentExposureTriangle.shutterSpeed = numerator / denominator;
    } else {
        equivalentExposureTriangle.shutterSpeed = parseFloat(equivalentShutterSpeedOutput.value);
    }
    updateEquivalentExposure();
});

equivalentIsoOutput.addEventListener('input', () => {
    equivalentExposureTriangle.iso = parseInt(equivalentIsoOutput.value);
    updateEquivalentExposure();
});

function updateEquivalentExposure() {
    const ev = equivalentExposureCalculator.calculateEv(originalExposure.aperture, originalExposure.shutterSpeed, originalExposure.iso);
    
    if (isNaN(equivalentExposureTriangle.aperture) || equivalentExposureTriangle.aperture === null) {
        const equivalentAperture = equivalentExposureCalculator.calculateEquivalentExposure(ev, null, equivalentExposureTriangle.iso, equivalentExposureTriangle.shutterSpeed);
        equivalentApertureOutput.value = equivalentAperture.toFixed(2);
    }

    if (isNaN(equivalentExposureTriangle.shutterSpeed) || equivalentExposureTriangle.shutterSpeed === null) {
        const equivalentShutterSpeed = equivalentExposureCalculator.calculateEquivalentExposure(ev, equivalentExposureTriangle.aperture, equivalentExposureTriangle.iso, null);

        equivalentShutterSpeedOutput.value = equivalentShutterSpeed > 1 ? equivalentShutterSpeed.toFixed(2) : '1/' + Math.round(1 / equivalentShutterSpeed);
    }

    if (isNaN(equivalentExposureTriangle.iso) || equivalentExposureTriangle.iso === null) {
        const equivalentIso = equivalentExposureCalculator.calculateEquivalentExposure(ev, equivalentExposureTriangle.aperture, null, equivalentExposureTriangle.shutterSpeed);
        equivalentIsoOutput.value = Math.round(equivalentIso);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check which checkbox is checked and set up the initial state
    if (shutterSpeedCheckbox.checked) {
        equivalentExposureTriangle.shutterSpeed = NaN;
        equivalentExposureTriangle.iso = parseInt(equivalentIsoOutput.value);
        equivalentExposureTriangle.aperture = parseFloat(equivalentApertureOutput.value);
        equivalentShutterSpeedOutput.disabled = true;
    } else if (apertureCheckbox.checked) {
        equivalentExposureTriangle.aperture = NaN;
        equivalentExposureTriangle.shutterSpeed = equivalentShutterSpeedOutput.value.includes('/') ? equivalentShutterSpeedOutput.value.split('/').map(Number).reduce((a, b) => a / b) : parseFloat(equivalentShutterSpeedOutput.value);
        equivalentExposureTriangle.iso = parseInt(equivalentIsoOutput.value);
        equivalentApertureOutput.disabled = true;
    } else if (isoCheckbox.checked) {
        equivalentExposureTriangle.iso = NaN;
        equivalentExposureTriangle.shutterSpeed = equivalentShutterSpeedOutput.value.includes('/') ? equivalentShutterSpeedOutput.value.split('/').map(Number).reduce((a, b) => a / b) : parseFloat(equivalentShutterSpeedOutput.value);
        equivalentExposureTriangle.aperture = parseFloat(equivalentApertureOutput.value);
        equivalentIsoOutput.disabled = true;
    }
    
    updateEquivalentExposure();
});
