/**
 * Perlin Noise Implementation
 *
 * Perlin noise is a gradient noise function developed by Ken Perlin in 1983.
 * It produces smooth, natural-looking pseudorandom patterns widely used in:
 * - Procedural texture generation
 * - Terrain generation
 * - Organic motion and animation
 * - Visual effects
 *
 * This implementation provides 1D, 2D, 3D, and 4D Perlin noise functions.
 *
 * Reference: Ken Perlin, "An Image Synthesizer", SIGGRAPH 1985
 * Improved version: Ken Perlin, "Improving Noise", SIGGRAPH 2002
 */

/**
 * PerlinNoise class for generating multi-dimensional Perlin noise
 *
 * @example
 * ```typescript
 * const perlin = new PerlinNoise();
 * const value = perlin.noise2D(x, y);
 *
 * // With custom seed
 * const seededPerlin = new PerlinNoise(42);
 * ```
 */
export class PerlinNoise {
    private permutation: number[];
    private p: number[];

    /**
     * Create a new Perlin noise generator
     * @param seed - Optional seed for reproducible noise (default: random)
     */
    constructor(seed?: number) {
        // Initialize permutation table
        this.permutation = [];
        for (let i = 0; i < 256; i++) {
            this.permutation[i] = i;
        }

        // Shuffle using seed if provided
        if (seed !== undefined) {
            this.shuffle(seed);
        } else {
            // Random shuffle
            for (let i = 255; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this.permutation[i], this.permutation[j]] = [this.permutation[j], this.permutation[i]];
            }
        }

        // Duplicate permutation table to avoid overflow
        this.p = new Array(512);
        for (let i = 0; i < 512; i++) {
            this.p[i] = this.permutation[i % 256];
        }
    }

    /**
     * Shuffle permutation table using a seed
     * Uses a simple LCG (Linear Congruential Generator) for deterministic shuffling
     */
    private shuffle(seed: number): void {
        let current = seed;
        const a = 1664525;
        const c = 1013904223;
        const m = 4294967296; // 2^32

        for (let i = 255; i > 0; i--) {
            current = (a * current + c) % m;
            const j = Math.floor((current / m) * (i + 1));
            [this.permutation[i], this.permutation[j]] = [this.permutation[j], this.permutation[i]];
        }
    }

    /**
     * Fade function for smooth interpolation
     * Uses improved fade function: 6t^5 - 15t^4 + 10t^3
     * This has zero first and second derivatives at t=0 and t=1
     */
    private fade(t: number): number {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    /**
     * Linear interpolation
     */
    private lerp(t: number, a: number, b: number): number {
        return a + t * (b - a);
    }

    /**
     * Calculate gradient for 1D
     */
    private grad1(hash: number, x: number): number {
        // Use the hash to determine gradient direction (+1 or -1)
        return (hash & 1) === 0 ? x : -x;
    }

    /**
     * Calculate gradient for 2D
     */
    private grad2(hash: number, x: number, y: number): number {
        // Use hash to select gradient vector from 8 possibilities
        const h = hash & 7;
        const u = h < 4 ? x : y;
        const v = h < 4 ? y : x;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    /**
     * Calculate gradient for 3D
     */
    private grad3(hash: number, x: number, y: number, z: number): number {
        // Use hash to select gradient vector from 12 edge vectors of a cube
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    /**
     * Calculate gradient for 4D
     */
    private grad4(hash: number, x: number, y: number, z: number, w: number): number {
        const h = hash & 31;
        const u = h < 24 ? x : y;
        const v = h < 16 ? y : z;
        const s = h < 8 ? z : w;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v) + ((h & 4) === 0 ? s : -s);
    }

    /**
     * Generate 1D Perlin noise
     * @param x - Input coordinate
     * @returns Noise value in range [-1, 1]
     */
    noise1D(x: number): number {
        // Find unit grid cell containing point
        const X = Math.floor(x) & 255;

        // Relative position within cell
        x -= Math.floor(x);

        // Fade curve
        const u = this.fade(x);

        // Hash coordinates of cell corners
        const a = this.p[X];
        const b = this.p[X + 1];

        // Calculate gradients and interpolate
        return this.lerp(u, this.grad1(a, x), this.grad1(b, x - 1));
    }

    /**
     * Generate 2D Perlin noise
     * @param x - X coordinate
     * @param y - Y coordinate
     * @returns Noise value in range approximately [-1, 1]
     */
    noise2D(x: number, y: number): number {
        // Find unit grid cell containing point
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;

        // Relative position within cell
        x -= Math.floor(x);
        y -= Math.floor(y);

        // Fade curves
        const u = this.fade(x);
        const v = this.fade(y);

        // Hash coordinates of cell corners
        const a = this.p[X] + Y;
        const aa = this.p[a];
        const ab = this.p[a + 1];
        const b = this.p[X + 1] + Y;
        const ba = this.p[b];
        const bb = this.p[b + 1];

        // Calculate gradients and interpolate
        return this.lerp(
            v,
            this.lerp(u, this.grad2(aa, x, y), this.grad2(ba, x - 1, y)),
            this.lerp(u, this.grad2(ab, x, y - 1), this.grad2(bb, x - 1, y - 1))
        );
    }

    /**
     * Generate 3D Perlin noise
     * @param x - X coordinate
     * @param y - Y coordinate
     * @param z - Z coordinate
     * @returns Noise value in range approximately [-1, 1]
     */
    noise3D(x: number, y: number, z: number): number {
        // Find unit grid cell containing point
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;

        // Relative position within cell
        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        // Fade curves
        const u = this.fade(x);
        const v = this.fade(y);
        const w = this.fade(z);

        // Hash coordinates of cell corners
        const a = this.p[X] + Y;
        const aa = this.p[a] + Z;
        const ab = this.p[a + 1] + Z;
        const b = this.p[X + 1] + Y;
        const ba = this.p[b] + Z;
        const bb = this.p[b + 1] + Z;

        // Calculate gradients and interpolate
        return this.lerp(
            w,
            this.lerp(
                v,
                this.lerp(u, this.grad3(this.p[aa], x, y, z), this.grad3(this.p[ba], x - 1, y, z)),
                this.lerp(u, this.grad3(this.p[ab], x, y - 1, z), this.grad3(this.p[bb], x - 1, y - 1, z))
            ),
            this.lerp(
                v,
                this.lerp(u, this.grad3(this.p[aa + 1], x, y, z - 1), this.grad3(this.p[ba + 1], x - 1, y, z - 1)),
                this.lerp(u, this.grad3(this.p[ab + 1], x, y - 1, z - 1), this.grad3(this.p[bb + 1], x - 1, y - 1, z - 1))
            )
        );
    }

    /**
     * Generate 4D Perlin noise
     * @param x - X coordinate
     * @param y - Y coordinate
     * @param z - Z coordinate
     * @param w - W coordinate (often used for time/animation)
     * @returns Noise value in range approximately [-1, 1]
     */
    noise4D(x: number, y: number, z: number, w: number): number {
        // Find unit hypercube containing point
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;
        const W = Math.floor(w) & 255;

        // Relative position within hypercube
        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);
        w -= Math.floor(w);

        // Fade curves
        const u = this.fade(x);
        const v = this.fade(y);
        const s = this.fade(z);
        const t = this.fade(w);

        // Hash coordinates
        const a = this.p[X] + Y;
        const aa = this.p[a] + Z;
        const ab = this.p[a + 1] + Z;
        const b = this.p[X + 1] + Y;
        const ba = this.p[b] + Z;
        const bb = this.p[b + 1] + Z;

        const aaa = this.p[aa] + W;
        const aba = this.p[ab] + W;
        const baa = this.p[ba] + W;
        const bba = this.p[bb] + W;
        const aab = this.p[aa + 1] + W;
        const abb = this.p[ab + 1] + W;
        const bab = this.p[ba + 1] + W;
        const bbb = this.p[bb + 1] + W;

        // Interpolate along w
        return this.lerp(
            t,
            this.lerp(
                s,
                this.lerp(
                    v,
                    this.lerp(u, this.grad4(this.p[aaa], x, y, z, w), this.grad4(this.p[baa], x - 1, y, z, w)),
                    this.lerp(u, this.grad4(this.p[aba], x, y - 1, z, w), this.grad4(this.p[bba], x - 1, y - 1, z, w))
                ),
                this.lerp(
                    v,
                    this.lerp(u, this.grad4(this.p[aab], x, y, z - 1, w), this.grad4(this.p[bab], x - 1, y, z - 1, w)),
                    this.lerp(u, this.grad4(this.p[abb], x, y - 1, z - 1, w), this.grad4(this.p[bbb], x - 1, y - 1, z - 1, w))
                )
            ),
            this.lerp(
                s,
                this.lerp(
                    v,
                    this.lerp(u, this.grad4(this.p[aaa + 1], x, y, z, w - 1), this.grad4(this.p[baa + 1], x - 1, y, z, w - 1)),
                    this.lerp(u, this.grad4(this.p[aba + 1], x, y - 1, z, w - 1), this.grad4(this.p[bba + 1], x - 1, y - 1, z, w - 1))
                ),
                this.lerp(
                    v,
                    this.lerp(u, this.grad4(this.p[aab + 1], x, y, z - 1, w - 1), this.grad4(this.p[bab + 1], x - 1, y, z - 1, w - 1)),
                    this.lerp(u, this.grad4(this.p[abb + 1], x, y - 1, z - 1, w - 1), this.grad4(this.p[bbb + 1], x - 1, y - 1, z - 1, w - 1))
                )
            )
        );
    }
}

// Convenience functions using a default instance
const defaultPerlin = new PerlinNoise();

/**
 * Generate 1D Perlin noise using default generator
 * @param x - Input coordinate
 * @returns Noise value in range [-1, 1]
 */
export function perlin1D(x: number): number {
    return defaultPerlin.noise1D(x);
}

/**
 * Generate 2D Perlin noise using default generator
 * @param x - X coordinate
 * @param y - Y coordinate
 * @returns Noise value in range approximately [-1, 1]
 */
export function perlin2D(x: number, y: number): number {
    return defaultPerlin.noise2D(x, y);
}

/**
 * Generate 3D Perlin noise using default generator
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param z - Z coordinate
 * @returns Noise value in range approximately [-1, 1]
 */
export function perlin3D(x: number, y: number, z: number): number {
    return defaultPerlin.noise3D(x, y, z);
}

/**
 * Generate 4D Perlin noise using default generator
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param z - Z coordinate
 * @param w - W coordinate
 * @returns Noise value in range approximately [-1, 1]
 */
export function perlin4D(x: number, y: number, z: number, w: number): number {
    return defaultPerlin.noise4D(x, y, z, w);
}
