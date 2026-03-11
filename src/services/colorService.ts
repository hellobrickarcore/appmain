/**
 * Color Service for HelloBrick
 * 
 * Provides perceptually accurate color matching using LAB color space.
 */

interface LabColor {
    l: number;
    a: number;
    b: number;
}

interface ColorProfile {
    name: string;
    hex: string;
    lab: LabColor;
}

// Canonical LEGO-like color palette
const COLOR_PALETTE: ColorProfile[] = [
    { name: 'Red', hex: '#B40000', lab: { l: 30, a: 55, b: 40 } },
    { name: 'Blue', hex: '#0055BF', lab: { l: 35, a: 10, b: -55 } },
    { name: 'Yellow', hex: '#F2CD37', lab: { l: 80, a: 5, b: 70 } },
    { name: 'Green', hex: '#237841', lab: { l: 45, a: -40, b: 20 } },
    { name: 'Black', hex: '#050505', lab: { l: 1, a: 0, b: 0 } },
    { name: 'White', hex: '#D9D9D9', lab: { l: 87, a: 0, b: 0 } },
    { name: 'Light Gray', hex: '#9BA19D', lab: { l: 65, a: -1, b: 1 } },
    { name: 'Dark Gray', hex: '#6D6E5C', lab: { l: 45, a: -2, b: 8 } },
    { name: 'Orange', hex: '#FE8A18', lab: { l: 68, a: 40, b: 70 } },
];

/**
 * Convert RGB to LAB
 * Simplified conversion for matching purposes
 */
function rgbToLab(r: number, g: number, b: number): LabColor {
    // Normalize to [0, 1]
    let r_ = r / 255;
    let g_ = g / 255;
    let b_ = b / 255;

    // Linearize
    r_ = r_ > 0.04045 ? Math.pow((r_ + 0.055) / 1.055, 2.4) : r_ / 12.92;
    g_ = g_ > 0.04045 ? Math.pow((g_ + 0.055) / 1.055, 2.4) : g_ / 12.92;
    b_ = b_ > 0.04045 ? Math.pow((b_ + 0.055) / 1.055, 2.4) : b_ / 12.92;

    // RGB to XYZ
    let x = (r_ * 0.4124 + g_ * 0.3576 + b_ * 0.1805) * 100;
    let y = (r_ * 0.2126 + g_ * 0.7152 + b_ * 0.0722) * 100;
    let z = (r_ * 0.0193 + g_ * 0.1192 + b_ * 0.9505) * 100;

    // XYZ to LAB (D65 illuminant)
    x /= 95.047;
    y /= 100.000;
    z /= 108.883;

    x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);
    y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);
    z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);

    const l = (116 * y) - 16;
    const a = 500 * (x - y);
    const lab_b = 200 * (y - z);

    return { l, a, b: lab_b };
}

/**
 * Calculate DeltaE (CIE76)
 */
function deltaE(lab1: LabColor, lab2: LabColor): number {
    const dl = lab1.l - lab2.l;
    const da = lab1.a - lab2.a;
    const db = lab1.b - lab2.b;
    return Math.sqrt(dl * dl + da * da + db * db);
}

export const colorService = {
    /**
     * Estimate color from a canvas region
     * Returns 0.0 - 1.0 confidence
     */
    estimateColor(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): { name: string, confidence: number, hex: string } {
        try {
            // Sample center 50% of the box to avoid background contamination
            const sampleW = Math.max(1, Math.floor(w * 0.5));
            const sampleH = Math.max(1, Math.floor(h * 0.5));
            const sampleX = Math.max(0, Math.floor(x + (w - sampleW) / 2));
            const sampleY = Math.max(0, Math.floor(y + (h - sampleH) / 2));

            const imageData = ctx.getImageData(sampleX, sampleY, sampleW, sampleH);
            const data = imageData.data;

            let r = 0, g = 0, b = 0;
            const count = data.length / 4;

            for (let i = 0; i < data.length; i += 4) {
                r += data[i];
                g += data[i + 1];
                b += data[i + 2];
            }

            r = Math.floor(r / count);
            g = Math.floor(g / count);
            b = Math.floor(b / count);

            const sampleLab = rgbToLab(r, g, b);

            let bestMatch = COLOR_PALETTE[0];
            let minDistance = deltaE(sampleLab, bestMatch.lab);

            for (let i = 1; i < COLOR_PALETTE.length; i++) {
                const distance = deltaE(sampleLab, COLOR_PALETTE[i].lab);
                if (distance < minDistance) {
                    minDistance = distance;
                    bestMatch = COLOR_PALETTE[i];
                }
            }

            // Convert distance to confidence (DeltaE 0 = 1.0 confidence, DeltaE 50 = 0.0 confidence)
            const confidence = Math.max(0, Math.min(1, 1 - (minDistance / 50)));

            return {
                name: bestMatch.name,
                confidence,
                hex: bestMatch.hex
            };
        } catch (err) {
            console.error('[ColorService] Error estimating color:', err);
            return { name: 'Unknown', confidence: 0, hex: '#888' };
        }
    }
};
