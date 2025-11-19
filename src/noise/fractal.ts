/**
 * Fractal Noise (fBm) and Turbulence
 *
 * Fractal Brownian Motion (fBm) combines multiple octaves of noise at different
 * frequencies and amplitudes to create more complex, natural-looking patterns.
 *
 * Applications:
 * - Realistic terrain generation
 * - Cloud and smoke simulation
 * - Organic textures
 * - Procedural details at multiple scales
 *
 * Key concepts:
 * - Octaves: Number of noise layers to combine
 * - Lacunarity: Frequency multiplier between octaves (typically 2.0)
 * - Persistence/Gain: Amplitude multiplier between octaves (typically 0.5)
 * - Turbulence: Absolute value version creating sharp, turbulent patterns
 */

import { PerlinNoise } from './perlin';
import { SimplexNoise } from './simplex';

/**
 * Noise type for fractal generation
 */
export enum NoiseType {
    PERLIN,
    SIMPLEX
}

/**
 * Options for fractal noise generation
 */
export interface FractalOptions {
    /** Number of octaves (layers) to combine (default: 4) */
    octaves?: number;
    /** Frequency multiplier between octaves (default: 2.0) */
    lacunarity?: number;
    /** Amplitude multiplier between octaves (default: 0.5) */
    persistence?: number;
    /** Initial frequency (default: 1.0) */
    frequency?: number;
    /** Initial amplitude (default: 1.0) */
    amplitude?: number;
    /** Seed for noise generator (default: random) */
    seed?: number;
}

/**
 * FractalNoise class for generating multi-octave fractal noise patterns
 *
 * @example
 * ```typescript
 * const fractal = new FractalNoise(NoiseType.SIMPLEX, { octaves: 6, persistence: 0.5 });
 * const value = fractal.fbm2D(x, y);
 * const turb = fractal.turbulence2D(x, y);
 * ```
 */
export class FractalNoise {
    private noiseGenerator: PerlinNoise | SimplexNoise;
    private octaves: number;
    private lacunarity: number;
    private persistence: number;
    private frequency: number;
    private amplitude: number;

    /**
     * Create a new fractal noise generator
     * @param type - Type of base noise (PERLIN or SIMPLEX)
     * @param options - Fractal generation options
     */
    constructor(type: NoiseType = NoiseType.PERLIN, options: FractalOptions = {}) {
        const {
            octaves = 4,
            lacunarity = 2.0,
            persistence = 0.5,
            frequency = 1.0,
            amplitude = 1.0,
            seed
        } = options;

        this.octaves = Math.max(1, Math.floor(octaves));
        this.lacunarity = lacunarity;
        this.persistence = persistence;
        this.frequency = frequency;
        this.amplitude = amplitude;

        // Create appropriate noise generator
        if (type === NoiseType.SIMPLEX) {
            this.noiseGenerator = new SimplexNoise(seed);
        } else {
            this.noiseGenerator = new PerlinNoise(seed);
        }
    }

    /**
     * Generate 2D fractional Brownian motion (fBm)
     * @param x - X coordinate
     * @param y - Y coordinate
     * @returns Fractal noise value
     */
    fbm2D(x: number, y: number): number {
        let total = 0;
        let freq = this.frequency;
        let amp = this.amplitude;
        let maxValue = 0;

        for (let i = 0; i < this.octaves; i++) {
            const noise = this.noiseGenerator instanceof PerlinNoise
                ? this.noiseGenerator.noise2D(x * freq, y * freq)
                : this.noiseGenerator.noise2D(x * freq, y * freq);

            total += noise * amp;
            maxValue += amp;

            freq *= this.lacunarity;
            amp *= this.persistence;
        }

        // Normalize to approximately [-1, 1]
        return total / maxValue;
    }

    /**
     * Generate 3D fractional Brownian motion (fBm)
     * @param x - X coordinate
     * @param y - Y coordinate
     * @param z - Z coordinate
     * @returns Fractal noise value
     */
    fbm3D(x: number, y: number, z: number): number {
        let total = 0;
        let freq = this.frequency;
        let amp = this.amplitude;
        let maxValue = 0;

        for (let i = 0; i < this.octaves; i++) {
            const noise = this.noiseGenerator instanceof PerlinNoise
                ? this.noiseGenerator.noise3D(x * freq, y * freq, z * freq)
                : this.noiseGenerator.noise3D(x * freq, y * freq, z * freq);

            total += noise * amp;
            maxValue += amp;

            freq *= this.lacunarity;
            amp *= this.persistence;
        }

        return total / maxValue;
    }

    /**
     * Generate 4D fractional Brownian motion (fBm)
     * @param x - X coordinate
     * @param y - Y coordinate
     * @param z - Z coordinate
     * @param w - W coordinate
     * @returns Fractal noise value
     */
    fbm4D(x: number, y: number, z: number, w: number): number {
        let total = 0;
        let freq = this.frequency;
        let amp = this.amplitude;
        let maxValue = 0;

        for (let i = 0; i < this.octaves; i++) {
            const noise = this.noiseGenerator instanceof PerlinNoise
                ? this.noiseGenerator.noise4D(x * freq, y * freq, z * freq, w * freq)
                : this.noiseGenerator.noise4D(x * freq, y * freq, z * freq, w * freq);

            total += noise * amp;
            maxValue += amp;

            freq *= this.lacunarity;
            amp *= this.persistence;
        }

        return total / maxValue;
    }

    /**
     * Generate 2D turbulence (absolute value fBm)
     * Creates sharp, chaotic patterns useful for marble, fire, etc.
     * @param x - X coordinate
     * @param y - Y coordinate
     * @returns Turbulence value (always positive)
     */
    turbulence2D(x: number, y: number): number {
        let total = 0;
        let freq = this.frequency;
        let amp = this.amplitude;
        let maxValue = 0;

        for (let i = 0; i < this.octaves; i++) {
            const noise = this.noiseGenerator instanceof PerlinNoise
                ? this.noiseGenerator.noise2D(x * freq, y * freq)
                : this.noiseGenerator.noise2D(x * freq, y * freq);

            total += Math.abs(noise) * amp;
            maxValue += amp;

            freq *= this.lacunarity;
            amp *= this.persistence;
        }

        return total / maxValue;
    }

    /**
     * Generate 3D turbulence
     * @param x - X coordinate
     * @param y - Y coordinate
     * @param z - Z coordinate
     * @returns Turbulence value (always positive)
     */
    turbulence3D(x: number, y: number, z: number): number {
        let total = 0;
        let freq = this.frequency;
        let amp = this.amplitude;
        let maxValue = 0;

        for (let i = 0; i < this.octaves; i++) {
            const noise = this.noiseGenerator instanceof PerlinNoise
                ? this.noiseGenerator.noise3D(x * freq, y * freq, z * freq)
                : this.noiseGenerator.noise3D(x * freq, y * freq, z * freq);

            total += Math.abs(noise) * amp;
            maxValue += amp;

            freq *= this.lacunarity;
            amp *= this.persistence;
        }

        return total / maxValue;
    }

    /**
     * Generate ridged multifractal noise
     * Creates ridge-like patterns useful for mountains and terrain
     * @param x - X coordinate
     * @param y - Y coordinate
     * @returns Ridged noise value
     */
    ridged2D(x: number, y: number): number {
        let total = 0;
        let freq = this.frequency;
        let amp = this.amplitude;
        let maxValue = 0;

        for (let i = 0; i < this.octaves; i++) {
            const noise = this.noiseGenerator instanceof PerlinNoise
                ? this.noiseGenerator.noise2D(x * freq, y * freq)
                : this.noiseGenerator.noise2D(x * freq, y * freq);

            // Invert and sharpen
            const signal = 1.0 - Math.abs(noise);
            const ridge = signal * signal;

            total += ridge * amp;
            maxValue += amp;

            freq *= this.lacunarity;
            amp *= this.persistence;
        }

        return total / maxValue;
    }

    /**
     * Generate ridged multifractal noise in 3D
     * @param x - X coordinate
     * @param y - Y coordinate
     * @param z - Z coordinate
     * @returns Ridged noise value
     */
    ridged3D(x: number, y: number, z: number): number {
        let total = 0;
        let freq = this.frequency;
        let amp = this.amplitude;
        let maxValue = 0;

        for (let i = 0; i < this.octaves; i++) {
            const noise = this.noiseGenerator instanceof PerlinNoise
                ? this.noiseGenerator.noise3D(x * freq, y * freq, z * freq)
                : this.noiseGenerator.noise3D(x * freq, y * freq, z * freq);

            const signal = 1.0 - Math.abs(noise);
            const ridge = signal * signal;

            total += ridge * amp;
            maxValue += amp;

            freq *= this.lacunarity;
            amp *= this.persistence;
        }

        return total / maxValue;
    }

    /**
     * Generate domain-warped noise
     * Warps the input coordinates using noise to create organic distortions
     * @param x - X coordinate
     * @param y - Y coordinate
     * @param warpStrength - Strength of the warp effect (default: 0.1)
     * @returns Domain-warped noise value
     */
    domainWarp2D(x: number, y: number, warpStrength: number = 0.1): number {
        // Use noise to offset the coordinates
        const offsetX = this.fbm2D(x + 5.2, y + 1.3) * warpStrength;
        const offsetY = this.fbm2D(x + 8.7, y + 4.6) * warpStrength;

        return this.fbm2D(x + offsetX, y + offsetY);
    }

    /**
     * Generate domain-warped noise in 3D
     * @param x - X coordinate
     * @param y - Y coordinate
     * @param z - Z coordinate
     * @param warpStrength - Strength of the warp effect (default: 0.1)
     * @returns Domain-warped noise value
     */
    domainWarp3D(x: number, y: number, z: number, warpStrength: number = 0.1): number {
        const offsetX = this.fbm3D(x + 5.2, y + 1.3, z + 8.4) * warpStrength;
        const offsetY = this.fbm3D(x + 8.7, y + 4.6, z + 2.1) * warpStrength;
        const offsetZ = this.fbm3D(x + 3.1, y + 7.9, z + 5.5) * warpStrength;

        return this.fbm3D(x + offsetX, y + offsetY, z + offsetZ);
    }
}

// Convenience functions using default instances
const defaultFractalPerlin = new FractalNoise(NoiseType.PERLIN);
const defaultFractalSimplex = new FractalNoise(NoiseType.SIMPLEX);

/**
 * Generate 2D fBm using Perlin noise
 * @param x - X coordinate
 * @param y - Y coordinate
 * @returns Fractal noise value
 */
export function fbm2D(x: number, y: number): number {
    return defaultFractalPerlin.fbm2D(x, y);
}

/**
 * Generate 3D fBm using Perlin noise
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param z - Z coordinate
 * @returns Fractal noise value
 */
export function fbm3D(x: number, y: number, z: number): number {
    return defaultFractalPerlin.fbm3D(x, y, z);
}

/**
 * Generate 2D turbulence using Perlin noise
 * @param x - X coordinate
 * @param y - Y coordinate
 * @returns Turbulence value
 */
export function turbulence2D(x: number, y: number): number {
    return defaultFractalPerlin.turbulence2D(x, y);
}

/**
 * Generate 3D turbulence using Perlin noise
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param z - Z coordinate
 * @returns Turbulence value
 */
export function turbulence3D(x: number, y: number, z: number): number {
    return defaultFractalPerlin.turbulence3D(x, y, z);
}

/**
 * Generate 2D ridged noise using Perlin noise
 * @param x - X coordinate
 * @param y - Y coordinate
 * @returns Ridged noise value
 */
export function ridged2D(x: number, y: number): number {
    return defaultFractalPerlin.ridged2D(x, y);
}

/**
 * Generate 3D ridged noise using Perlin noise
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param z - Z coordinate
 * @returns Ridged noise value
 */
export function ridged3D(x: number, y: number, z: number): number {
    return defaultFractalPerlin.ridged3D(x, y, z);
}
