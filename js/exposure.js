class ExposureCalculator {


    calculateEv(aperture, shutterSpeed, iso) {
        const ev = Math.log2((aperture ** 2) / shutterSpeed * (iso / 100));
        return ev;
    }

    calculateEquivalentExposure(ev, targetAperture, targetIso, targetShutterSpeed) {
        console.log(`Calculating equivalent exposure with EV: ${ev}, targetAperture: ${targetAperture}, targetIso: ${targetIso}, targetShutterSpeed: ${targetShutterSpeed}`);
        if (targetAperture && targetIso && !targetShutterSpeed) {
            const equivalentAperture = 100 * (targetAperture ** 2) / ((2 ** ev) * targetIso);
            return equivalentAperture;
        } else if (targetAperture && !targetIso && targetShutterSpeed) {
            const equivalentIso = 100 * (targetAperture ** 2) / ((2 ** ev) * targetShutterSpeed);
            return equivalentIso;
        } else if (!targetAperture && targetIso && targetShutterSpeed) {
            const equivalentAperture = Math.sqrt((2 ** ev) * targetShutterSpeed * (targetIso / 100));
            return equivalentAperture;
        } else {
            throw new Error("Invalid input: Please provide exactly two of the three parameters (aperture, ISO, shutter speed).");
        }
    }
}