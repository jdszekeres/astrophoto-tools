class ExposureCalculator {


    calculateEv(aperture, shutterSpeed, iso) {
        const ev = Math.log2((aperture ** 2) / shutterSpeed * (100 / iso));
        return ev;
    }

    calculateEquivalentExposure(ev, targetAperture, targetIso, targetShutterSpeed) {
        console.log(`Calculating equivalent exposure with EV: ${ev}, targetAperture: ${targetAperture}, targetIso: ${targetIso}, targetShutterSpeed: ${targetShutterSpeed}`);
        if (targetAperture && targetIso && !targetShutterSpeed) {
            // t = (N^2 * ISO/100) / (2^EV)
            const equivalentShutterSpeed = (targetAperture ** 2) * (targetIso / 100) / (2 ** ev);
            return equivalentShutterSpeed;
        } else if (targetAperture && !targetIso && targetShutterSpeed) {
            // ISO = 100 * (2^EV * t) / N^2
            const equivalentIso = 100 * (2 ** ev) * targetShutterSpeed / (targetAperture ** 2);
            return equivalentIso;
        } else if (!targetAperture && targetIso && targetShutterSpeed) {
            // N = sqrt(2^EV * t * (100/ISO))
            const equivalentAperture = Math.sqrt((2 ** ev) * targetShutterSpeed * (100 / targetIso));
            return equivalentAperture;
        } else {
            throw new Error("Invalid input: Please provide exactly two of the three parameters (aperture, ISO, shutter speed).");
        }
    }
}