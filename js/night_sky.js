class NightSky {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d', {
            willReadFrequently: true
        });


        this.image = new Image();
        this.image.src = '/assets/mondo_ridotto0p25.jpg';
        this.image.onload = () => {
            this.canvas.width = this.image.naturalWidth;
            this.canvas.height = this.image.naturalHeight;
            this.ctx.drawImage(this.image, 0, 0);
            console.log('NightSky initialized, image size:', this.image.naturalWidth, this.image.naturalHeight);

        };

    }

    legend = [
    { rgb: [0, 0, 0],     ratio: 0.5 },
    { rgb: [30, 60, 120], ratio: 1.5 },
    { rgb: [0, 120, 255], ratio: 4 },
    { rgb: [0, 255, 180], ratio: 12 },
    { rgb: [255, 255, 0], ratio: 24 },
    { rgb: [255, 150, 0], ratio: 48 },
    { rgb: [255, 0, 0], ratio: 96 },
    { rgb: [255, 255, 255], ratio: 200 }
    ];

    _colorDistance(a, b) {
    return Math.sqrt(
        (a[0]-b[0])**2 +
        (a[1]-b[1])**2 +
        (a[2]-b[2])**2
    );
}

    _getRatioFromPixel(rgb) {
        let best = this.legend[0];
        let bestDist = Infinity;

        for (const item of this.legend) {
            const d = this._colorDistance(rgb, item.rgb);
            if (d < bestDist) {
                bestDist = d;
                best = item;
            }
        }

        return best.ratio;
    }

    _latLonToPixel(lat, lon) {
    const W = 9354;
    const H = 4252;

    // longitude fit (from regression)
    const x = (lon + 126.44) / 0.03382;

    // latitude fit
    const y = (-20.28 * lat) + 1862.4;

    return { x, y };
}



    getBrightness(lat, lon) {
        //convert lat and lon to pixel coordinates
        const { x, y } = this._latLonToPixel(lat, lon, this.canvas.width, this.canvas.height);

        console.log('Getting brightness for lat:', lat, 'lon:', lon, 'pixel coordinates:', x, y);

        const pixelData = this.ctx.getImageData(x.toFixed(0), y.toFixed(0), 1, 1).data;
        const r = pixelData[0];
        const g = pixelData[1];
        const b = pixelData[2];

        const rgb = [r, g, b];
        const ratio = this._getRatioFromPixel(rgb);

        const SQM = 21.58 - 2.5 * Math.log10(ratio);

        return SQM;
    }

    getBortleClass(sqm) {
        if (sqm >= 21.75) return 1;
        if (sqm >= 21.25) return 2;
        if (sqm >= 20.75) return 3;
        if (sqm >= 20.25) return 4;
        if (sqm >= 19.75) return 5;
        if (sqm >= 19.25) return 6;
        if (sqm >= 18.75) return 7;
        if (sqm >= 18.25) return 8;
        return 9;
    }
}