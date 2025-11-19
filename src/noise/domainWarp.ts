/**
 * Domain Warping for Noise Functions
 *
 * Domain warping is a technique where noise is used to distort the input
 * coordinates of another noise function, creating more complex and organic
 * patterns. This is fundamental in procedural generation and creative coding.
 *
 * Features:
 * - 2D and 3D domain warping
 * - Multi-octave warping for complex distortions
 * - Configurable warping strength and frequency
 *
 * References:
 * - Inigo Quilez's "Domain Warping" article
 * - The Book of Shaders
 */

import { perlin2D, perlin3D } from './perlin';
import { simplex2D, simplex3D } from './simplex';

/**
 * Noise function type for domain warping
 */
export type NoiseFn2D = (x: number, y: number) => number;
export type NoiseFn3D = (x: number, y: number, z: number) => number;

/**
 * Domain warping options
 */
export interface DomainWarpOptions {
    /** Strength of the warping effect (default: 1.0) */
    strength?: number;
    /** Frequency of the warp noise (default: 1.0) */
    frequency?: number;
    /** Number of octaves for multi-octave warping (default: 1) */
    octaves?: number;
    /** Lacunarity for multi-octave warping (default: 2.0) */
    lacunarity?: number;
    /** Gain for multi-octave warping (default: 0.5) */
    gain?: number;
    /** Offset for warp coordinates (default: [0, 0] or [0, 0, 0]) */
    offset?: number[];
}

/**
 * Apply 2D domain warping to a noise function
 *
 * @param noiseFn - The noise function to warp
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param options - Warping options
 * @returns Warped noise value
 *
 * @example
 * ```ts
 * // Simple domain warp
 * const value = domainWarp2D(perlin2D, x, y, { strength: 2.0 });
 *
 * // Multi-octave warp for complex patterns
 * const complex = domainWarp2D(simplex2D, x, y, {
 *   strength: 3.0,
 *   octaves: 3,
 *   frequency: 0.5
 * });
 * ```
 */
export function domainWarp2D(
    noiseFn: NoiseFn2D,
    x: number,
    y: number,
    options: DomainWarpOptions = {}
): number {
    const {
        strength = 1.0,
        frequency = 1.0,
        octaves = 1,
        lacunarity = 2.0,
        gain = 0.5,
        offset = [5.2, 1.3] // Arbitrary offsets to decorrelate warp directions
    } = options;

    let warpX = 0;
    let warpY = 0;
    let amplitude = strength;
    let freq = frequency;

    for (let i = 0; i < octaves; i++) {
        // Use noise to warp in X direction
        warpX += amplitude * perlin2D((x + offset[0]) * freq, y * freq);
        // Use noise to warp in Y direction
        warpY += amplitude * perlin2D(x * freq, (y + offset[1]) * freq);

        amplitude *= gain;
        freq *= lacunarity;
    }

    return noiseFn(x + warpX, y + warpY);
}

/**
 * Apply 3D domain warping to a noise function
 *
 * @param noiseFn - The noise function to warp
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param z - Z coordinate
 * @param options - Warping options
 * @returns Warped noise value
 *
 * @example
 * ```ts
 * // Simple 3D domain warp
 * const value = domainWarp3D(perlin3D, x, y, z, { strength: 2.0 });
 *
 * // Create organic, flowing patterns
 * const organic = domainWarp3D(simplex3D, x, y, z, {
 *   strength: 4.0,
 *   octaves: 2,
 *   frequency: 0.3
 * });
 * ```
 */
export function domainWarp3D(
    noiseFn: NoiseFn3D,
    x: number,
    y: number,
    z: number,
    options: DomainWarpOptions = {}
): number {
    const {
        strength = 1.0,
        frequency = 1.0,
        octaves = 1,
        lacunarity = 2.0,
        gain = 0.5,
        offset = [5.2, 1.3, 8.7] // Arbitrary offsets
    } = options;

    let warpX = 0;
    let warpY = 0;
    let warpZ = 0;
    let amplitude = strength;
    let freq = frequency;

    for (let i = 0; i < octaves; i++) {
        warpX += amplitude * perlin3D((x + offset[0]) * freq, y * freq, z * freq);
        warpY += amplitude * perlin3D(x * freq, (y + offset[1]) * freq, z * freq);
        warpZ += amplitude * perlin3D(x * freq, y * freq, (z + offset[2]) * freq);

        amplitude *= gain;
        freq *= lacunarity;
    }

    return noiseFn(x + warpX, y + warpY, z + warpZ);
}

/**
 * Apply recursive domain warping (warping the warp)
 *
 * This creates extremely complex, organic patterns by applying
 * domain warping multiple times recursively.
 *
 * @param noiseFn - The noise function to warp
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param depth - Number of recursive warp layers (default: 2)
 * @param strength - Base warping strength (default: 1.0)
 * @returns Recursively warped noise value
 *
 * @example
 * ```ts
 * // Create marble-like patterns
 * const marble = recursiveDomainWarp2D(perlin2D, x, y, 3, 2.0);
 * ```
 */
export function recursiveDomainWarp2D(
    noiseFn: NoiseFn2D,
    x: number,
    y: number,
    depth: number = 2,
    strength: number = 1.0
): number {
    if (depth <= 0) {
        return noiseFn(x, y);
    }

    const offset1 = [5.2, 1.3];
    const offset2 = [9.7, 3.8];

    const warpX = strength * perlin2D(x + offset1[0], y + offset1[1]);
    const warpY = strength * perlin2D(x + offset2[0], y + offset2[1]);

    return recursiveDomainWarp2D(noiseFn, x + warpX, y + warpY, depth - 1, strength * 0.7);
}

/**
 * Apply recursive domain warping in 3D
 *
 * @param noiseFn - The noise function to warp
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param z - Z coordinate
 * @param depth - Number of recursive warp layers (default: 2)
 * @param strength - Base warping strength (default: 1.0)
 * @returns Recursively warped noise value
 */
export function recursiveDomainWarp3D(
    noiseFn: NoiseFn3D,
    x: number,
    y: number,
    z: number,
    depth: number = 2,
    strength: number = 1.0
): number {
    if (depth <= 0) {
        return noiseFn(x, y, z);
    }

    const offset1 = [5.2, 1.3, 8.7];
    const offset2 = [9.7, 3.8, 2.1];
    const offset3 = [7.4, 6.5, 4.9];

    const warpX = strength * perlin3D(x + offset1[0], y + offset1[1], z + offset1[2]);
    const warpY = strength * perlin3D(x + offset2[0], y + offset2[1], z + offset2[2]);
    const warpZ = strength * perlin3D(x + offset3[0], y + offset3[1], z + offset3[2]);

    return recursiveDomainWarp3D(
        noiseFn,
        x + warpX,
        y + warpY,
        z + warpZ,
        depth - 1,
        strength * 0.7
    );
}

/**
 * Create a flow field using domain warping
 *
 * Useful for particle systems and fluid simulations
 *
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param time - Time parameter for animation
 * @param options - Warping options
 * @returns Flow vector [dx, dy]
 *
 * @example
 * ```ts
 * const [dx, dy] = flowField2D(x, y, time, { strength: 0.5 });
 * particleX += dx;
 * particleY += dy;
 * ```
 */
export function flowField2D(
    x: number,
    y: number,
    time: number = 0,
    options: DomainWarpOptions = {}
): [number, number] {
    const { strength = 1.0, frequency = 1.0 } = options;

    const dx = strength * simplex3D(x * frequency, y * frequency, time);
    const dy = strength * simplex3D(
        (x + 100) * frequency,
        (y + 100) * frequency,
        time
    );

    return [dx, dy];
}

/**
 * Create a 3D flow field
 *
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param z - Z coordinate
 * @param time - Time parameter for animation
 * @param options - Warping options
 * @returns Flow vector [dx, dy, dz]
 */
export function flowField3D(
    x: number,
    y: number,
    z: number,
    time: number = 0,
    options: DomainWarpOptions = {}
): [number, number, number] {
    const { strength = 1.0, frequency = 1.0 } = options;

    const dx = strength * perlin3D(x * frequency, y * frequency, z * frequency + time);
    const dy = strength * perlin3D(
        (x + 100) * frequency,
        (y + 100) * frequency,
        z * frequency + time
    );
    const dz = strength * perlin3D(
        (x + 200) * frequency,
        (y + 200) * frequency,
        (z + 100) * frequency + time
    );

    return [dx, dy, dz];
}
