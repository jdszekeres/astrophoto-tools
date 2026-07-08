const integratedTimesTable = [
    {
        name: "Milky Way",
        description: "Wide angle / Landscape milky way shots",
        min: 20 * 60,
        rec: 1 * 60 * 60,
        max: 2 * 60 * 60
    },

    {
        name: "Bright Galaxies",
        description: "Bright galaxies like Andromeda",
        min: 1 * 60 * 60,
        rec: 3 * 60 * 60,
        max: 6 * 60 * 60
    },

    {
        name: "Faint Galaxies",
        description: "Faint galaxies like M81, M82, and M101",
        min: 3 * 60 * 60,
        rec: 8 * 60 * 60,
        max: 16 * 60 * 60
    },

    {
        name: "Bright Nebulae",
        description: "Bright nebulae like Orion, Lagoon, and Eagle",
        min: 30 * 60,
        rec: 1.5 * 60 * 60,
        max: 3 * 60 * 60
    },

    {
        name: "Faint Nebulae",
        description: "Faint nebulae like Pelican, and Veil",
        min: 2 * 60 * 60,
        rec: 5 * 60 * 60,
        max: 10 * 60 * 60
    },

    {
        name: "Planetary Nebulae",
        description: "Planetary nebulae like Ring and Helix",
        min: 1 * 60 * 60,
        rec: 2.5 * 60 * 60,
        max: 5 * 60 * 60
    },

    {
        name: "Galaxy Clusters",
        description: "Galaxy clusters like Virgo and Coma",
        min: 5 * 60 * 60,
        rec: 10 * 60 * 60,
        max: 20 * 60 * 60
    },

    {
        name: "Star Clusters",
        description: "Star clusters like Pleiades and Hyades",
        min: 15 * 60,
        rec: 45 * 60,
        max: 1.5 * 60 * 60
    },

    {
        name: "IFN / Dust",
        description: "Integrated flux nebulae and dust clouds",
        min: 10 * 60 * 60,
        rec: 20 * 60 * 60,
        max: 40 * 60 * 60
    }
]


let selectedType = "Milky Way";

function makeSelectionTable() {
    const type_selector = document.getElementById('type-selector');
    type_selector.innerHTML = '';

    integratedTimesTable.forEach((item) => {
        const option = document.createElement('div');
        option.className = 'selection-option';
        
        const nameElem = document.createElement('div');
        nameElem.className = 'option-name';
        nameElem.textContent = item.name;
        option.appendChild(nameElem);

        const descElem = document.createElement('div');
        descElem.className = 'option-description';
        descElem.textContent = item.description;
        option.appendChild(descElem);

        const levelsElem = document.createElement('div');
        levelsElem.className = 'option-levels';
        for (const level of ['min', 'rec', 'max']) {
            const timeInSeconds = item[level];
            let text;
            if (timeInSeconds < 60 * 60) {
                text = `${Math.floor(timeInSeconds / 60)}m`;
            } else {
                if (timeInSeconds % 3600 === 0) {
                    text = `${Math.floor(timeInSeconds / 3600)}h`;
                } else {
                    text = `${Math.floor(timeInSeconds / 3600)}h ${Math.floor((timeInSeconds % 3600) / 60)}m`;
                }
            }
            const levelElem = document.createElement('span');
            levelElem.className = `disp-level ${level}`;
            levelElem.textContent = text;
            levelsElem.appendChild(levelElem);
        }
        option.appendChild(levelsElem);

        option.onclick = () => {
            selectedType = item.name;
            makeSelectionTable(); // Refresh the table to highlight the selected option
        };

        if (item.name === selectedType) {
            option.classList.add('selected');
        }

        type_selector.appendChild(option);
    });
}

makeSelectionTable();


function makeResults(typeInfo, exposureTime, ExposureCount) {
    const integrationTime = exposureTime * ExposureCount;

    const snr_improvement = Math.sqrt(ExposureCount);
    const signal_gain = 10 * Math.log10(ExposureCount);

    const qualityLevel = integrationTime < typeInfo.rec ? "Poor" : integrationTime > typeInfo.rec ? "Great" : "Good";

    const qualityRating = Math.min(1, integrationTime / typeInfo.max);

    const resultsDiv = document.getElementById('results-container');

    resultsDiv.innerHTML = `
        <h2>Results for ${typeInfo.name}</h2>
        <div id="results-details">
            <p>Integration Time: ${Math.floor(integrationTime / 3600)}h ${Math.floor((integrationTime % 3600) / 60)}m ${integrationTime % 60}s</p>
            <p><abbr title="Signal-to-Noise Ratio">SNR</abbr> Improvement: ${snr_improvement.toFixed(2)}x</p>
            <p>Signal Gain: ${signal_gain.toFixed(2)} dB</p>
        </div>
        <div class="gradient-container">
            <div class="gradient-bar" style="width: ${(1-qualityRating) * 100}%;"></div>
        </div>
        <div class="gradient-labels">
            <span class=${qualityLevel === "Poor" || qualityLevel === "Good" || qualityLevel === "Great" ? "selected_label" : ""}>Poor</span>
            <span class=${qualityLevel === "Good" || qualityLevel === "Great" ? "selected_label" : ""}>Good</span>
            <span class=${qualityLevel === "Great" ? "selected_label" : ""}>Great</span>
        </div>
    `;
}

document.getElementById('calculate-button').addEventListener('click', (e) => {
    e.preventDefault();
    const exposureTime = parseFloat(document.getElementById('exposure_time').value);
    const exposureCount = parseInt(document.getElementById('exposures').value);

    if (isNaN(exposureTime) || isNaN(exposureCount) || exposureTime <= 0 || exposureCount <= 0) {
        alert('Please enter valid positive numbers for exposure time and count.');
        return;
    }

    const typeInfo = integratedTimesTable.find(item => item.name === selectedType);

    if (!typeInfo) {
        alert('Selected type not found.');
        return;
    }

    makeResults(typeInfo, exposureTime, exposureCount);
});