/**
 * Value Noise Implementation
 *
 * Value noise is a simple noise function that interpolates between random values
 * at integer coordinates. Unlike gradient noise (Perlin), it interpolates actual
 * values rather than gradients, making it computationally simpler but potentially
 * less visually smooth.
 *
 * Features:
 * - 1D, 2D, 3D value noise
 * - Configurable seed for reproducibility
 * - Smooth interpolation using smoothstep
 *
 * References:
 * - Ken Perlin's Noise Hardware (2001)
 * - The Book of Shaders: Noise chapter
 */

/**
 * Value Noise Generator
 * Generates smooth random noise by interpolating random values at grid points
 */
export class ValueNoise {
    private seed: number;
    private perm: number[];

    /**
     * Creates a new ValueNoise generator
     * @param seed - Random seed for reproducibility (default: random)
     */
    constructor(seed?: number) {
        this.seed = seed !== undefined ? seed : Math.random() * 65536;
        this.perm = this.generatePermutation();
    }

    /**
     * Generate permutation table for randomness
     */
    private generatePermutation(): number[] {
        const p: number[] = [];

        // Initialize with sequential values
        for (let i = 0; i < 256; i++) {
            p[i] = i;
        }

        // Fisher-Yates shuffle with seed
        let seed = this.seed;
        for (let i = 255; i > 0; i--) {
            // Simple seeded random using linear congruential generator
            seed = (seed * 1103515245 + 12345) & 0x7fffffff;
            const j = Math.floor((seed / 0x7fffffff) * (i + 1));
            [p[i], p[j]] = [p[j], p[i]];
        }

        // Duplicate for easy wrapping
        return [...p, ...p];
    }

    /**
     * Hash function to get random value at integer coordinates
     */
    private hash(...coords: number[]): number {
        let h = this.seed & 0xff;
        for (const c of coords) {
            h = this.perm[(h + Math.floor(c)) & 0xff];
        }
        return h / 255; // Normalize to [0, 1]
    }

    /**
     * Smooth interpolation function (smoothstep)
     */
    private smoothstep(t: number): number {
        return t * t * (3 - 2 * t);
    }

    /**
     * Linear interpolation
     */
    private lerp(t: number, a: number, b: number): number {
        return a + t * (b - a);
    }

    /**
     * 1D value noise
     * @param x - Input coordinate
     * @returns Noise value in range [0, 1]
     */
    noise1D(x: number): number {
        const xi = Math.floor(x);
        const xf = x - xi;

        // Get random values at integer points
        const v0 = this.hash(xi);
        const v1 = this.hash(xi + 1);

        // Smooth interpolation
        const sx = this.smoothstep(xf);
        return this.lerp(sx, v0, v1);
    }

    /**
     * 2D value noise
     * @param x - X coordinate
     * @param y - Y coordinate
     * @returns Noise value in range [0, 1]
     */
    noise2D(x: number, y: number): number {
        const xi = Math.floor(x);
        const yi = Math.floor(y);
        const xf = x - xi;
        const yf = y - yi;

        // Get random values at corners
        const v00 = this.hash(xi, yi);
        const v10 = this.hash(xi + 1, yi);
        const v01 = this.hash(xi, yi + 1);
        const v11 = this.hash(xi + 1, yi + 1);

        // Smooth interpolation
        const sx = this.smoothstep(xf);
        const sy = this.smoothstep(yf);

        // Bilinear interpolation
        const v0 = this.lerp(sx, v00, v10);
        const v1 = this.lerp(sx, v01, v11);
        return this.lerp(sy, v0, v1);
    }

    /**
     * 3D value noise
     * @param x - X coordinate
     * @param y - Y coordinate
     * @param z - Z coordinate
     * @returns Noise value in range [0, 1]
     */
    noise3D(x: number, y: number, z: number): number {
        const xi = Math.floor(x);
        const yi = Math.floor(y);
        const zi = Math.floor(z);
        const xf = x - xi;
        const yf = y - yi;
        const zf = z - zi;

        // Get random values at corners
        const v000 = this.hash(xi, yi, zi);
        const v100 = this.hash(xi + 1, yi, zi);
        const v010 = this.hash(xi, yi + 1, zi);
        const v110 = this.hash(xi + 1, yi + 1, zi);
        const v001 = this.hash(xi, yi, zi + 1);
        const v101 = this.hash(xi + 1, yi, zi + 1);
        const v011 = this.hash(xi, yi + 1, zi + 1);
        const v111 = this.hash(xi + 1, yi + 1, zi + 1);

        // Smooth interpolation
        const sx = this.smoothstep(xf);
        const sy = this.smoothstep(yf);
        const sz = this.smoothstep(zf);

        // Trilinear interpolation
        const v00 = this.lerp(sx, v000, v100);
        const v10 = this.lerp(sx, v010, v110);
        const v01 = this.lerp(sx, v001, v101);
        const v11 = this.lerp(sx, v011, v111);

        const v0 = this.lerp(sy, v00, v10);
        const v1 = this.lerp(sy, v01, v11);

        return this.lerp(sz, v0, v1);
    }
}

// Convenience functions with default instance

const defaultValueNoise = new ValueNoise();

/**
 * 1D value noise with default generator
 * @param x - Input coordinate
 * @returns Noise value in range [0, 1]
 */
export function value1D(x: number): number {
    return defaultValueNoise.noise1D(x);
}

/**
 * 2D value noise with default generator
 * @param x - X coordinate
 * @param y - Y coordinate
 * @returns Noise value in range [0, 1]
 */
export function value2D(x: number, y: number): number {
    return defaultValueNoise.noise2D(x, y);
}

/**
 * 3D value noise with default generator
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param z - Z coordinate
 * @returns Noise value in range [0, 1]
 */
export function value3D(x: number, y: number, z: number): number {
    return defaultValueNoise.noise3D(x, y, z);
}
