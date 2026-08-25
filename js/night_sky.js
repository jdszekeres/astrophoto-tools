class NightSky {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d', {
            willReadFrequently: true
        });


        this.image = new Image();
        this.image.src = '/assets/bortle.webp';
        this.image.onload = () => {
            this.canvas.width = this.image.naturalWidth;
            this.canvas.height = this.image.naturalHeight;
            this.ctx.drawImage(this.image, 0, 0);
            console.log('NightSky initialized, image size:', this.image.naturalWidth, this.image.naturalHeight);

        };

    }

    legend = [
        { rgb: [255, 255, 255], sqm: 20.7951012 },
        { rgb: [255, 0, 0], sqm: 21.0858392 },
        {rgb: [255, 152, 0], sqm: 21.1585237 },
        {rgb: [255, 255, 0], sqm: 21.2312082 },
        {rgb: [83, 255, 0], sqm: 21.3038928 },
        {rgb: [42, 255, 42], sqm: 21.3765773 },
        {rgb: [57, 173, 115], sqm: 21.4492618 },
        {rgb: [48, 96, 167], sqm: 21.5219463 },
        {rgb: [48, 39, 137], sqm: 21.5946308 },
        {rgb: [48, 18, 59], sqm: 21.6673153 },
        {rgb: [0, 0, 0], sqm: 21.7400000 }
    ];

    _colorDistance(a, b) {
        return Math.sqrt(
            (a[0]-b[0])**2 +
            (a[1]-b[1])**2 +
            (a[2]-b[2])**2
        );
    }

    _getSQMFromRGB(rgb) {
        let closest = this.legend[0];
        let minDistance = this._colorDistance(rgb, closest.rgb);
        for (let i = 1; i < this.legend.length; i++) {
            const distance = this._colorDistance(rgb, this.legend[i].rgb);
            if (distance < minDistance) {
                minDistance = distance;
                closest = this.legend[i];
            }
        }

        // It's off, so we need to fix it
        // y=0.0000274652 * x^{4.41027} desmos generated
        const sqm = 0.0000274652 * Math.pow(closest.sqm, 4.41027);

        return sqm;
    }

    geoToPixel(lon, lat) {
        // TFW parameters from your input:

        const A = 0.0165006827291372;   // X-scale (longitude degree width per pixel)
        const D = 0.00000000;   // Rotation term for X (usually 0)
        const B = 0.00000000;   // Rotation term for Y (usually 0)
        const E = -0.0165006827291372;  // Y-scale (latitude degree height per pixel, negative)
        const C = -180.01419679352227377;// X-coordinate of the center of the upper-left pixel (origin longitude)
        const F = 74.98352006495314015;  // Y-coordinate of the center of the upper-left pixel (origin latitude)

        // Calculate pixel coordinates
        const x = (lon - C) / A;
        const y = (lat - F) / E;

        return {
            x: Math.round(x),
            y: Math.round(y)
        };
    }

    getBrightness(lat, lon) {
        //convert lat and lon to pixel coordinates
        const { x, y } = this.geoToPixel(lon, lat);

        console.log('Getting brightness for lat:', lat, 'lon:', lon, 'pixel coordinates:', x, y);

        const pixelData = this.ctx.getImageData(x.toFixed(0), y.toFixed(0), 1, 1).data;
        const r = pixelData[0];
        const g = pixelData[1];
        const b = pixelData[2];

        const rgb = [r, g, b];

        console.log('Pixel RGB:', rgb);

        const SQM = this._getSQMFromRGB(rgb);

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

    getImageOfCoordinate(lat, lon) {
        const size = 150; // size of the square to extract

        const { x, y } = this.geoToPixel(lon, lat);
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = size;
        tempCanvas.height = size;
        

        tempCtx.drawImage(this.canvas, x - size/2, y - size/2, size, size, 0, 0, size, size);
        
        // Map every pixel to the closest color in the legend to prevent antialiasing issues
        const imageData = tempCtx.getImageData(0, 0, size, size);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const rgb = [data[i], data[i + 1], data[i + 2]];
            const closest = this.legend.reduce((prev, curr) => {
                const prevDistance = this._colorDistance(rgb, prev.rgb);
                const currDistance = this._colorDistance(rgb, curr.rgb);
                return (currDistance < prevDistance) ? curr : prev;
            });
            data[i] = closest.rgb[0];
            data[i + 1] = closest.rgb[1];
            data[i + 2] = closest.rgb[2];
        }

        tempCtx.putImageData(imageData, 0, 0);
        
        tempCtx.beginPath();
        tempCtx.strokeStyle = 'black';
        tempCtx.lineWidth = 2;
        tempCtx.arc(size/2, size/2, 10, 0, 2 * Math.PI);
        tempCtx.closePath();
        tempCtx.stroke();
        tempCtx.beginPath();
        tempCtx.strokeStyle = 'white';
        tempCtx.lineWidth = 2;
        tempCtx.arc(size/2, size/2, 12, 0, 2 * Math.PI);
        tempCtx.closePath();
        tempCtx.stroke();
        tempCtx.beginPath();
        tempCtx.strokeStyle = 'black';
        tempCtx.lineWidth = 2;
        tempCtx.arc(size/2, size/2, 14, 0, 2 * Math.PI);
        tempCtx.stroke();
        return tempCanvas.toDataURL();
    }
}