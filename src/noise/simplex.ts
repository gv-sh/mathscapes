/**
 * Simplex Noise Implementation
 *
 * Simplex noise is an improved gradient noise algorithm developed by Ken Perlin in 2001
 * as a successor to his classic Perlin noise. Key advantages:
 * - Better computational complexity (O(n^2) vs O(2^n) for n dimensions)
 * - Fewer directional artifacts
 * - More visually isotropic
 * - Cleaner implementation in higher dimensions
 *
 * This implementation provides 2D, 3D, and 4D simplex noise.
 * (1D simplex noise is equivalent to Perlin noise)
 *
 * Reference: Ken Perlin, "Noise Hardware", SIGGRAPH 2002
 * Based on Stefan Gustavson's implementation (2005)
 */

/**
 * SimplexNoise class for generating multi-dimensional simplex noise
 *
 * @example
 * ```typescript
 * const simplex = new SimplexNoise();
 * const value = simplex.noise2D(x, y);
 *
 * // With custom seed
 * const seededSimplex = new SimplexNoise(42);
 * ```
 */
export class SimplexNoise {
    private perm: number[];
    private permMod12: number[];

    // Skewing and unskewing factors for 2D, 3D, and 4D
    private static readonly F2 = 0.5 * (Math.sqrt(3) - 1);
    private static readonly G2 = (3 - Math.sqrt(3)) / 6;
    private static readonly F3 = 1 / 3;
    private static readonly G3 = 1 / 6;
    private static readonly F4 = (Math.sqrt(5) - 1) / 4;
    private static readonly G4 = (5 - Math.sqrt(5)) / 20;

    // Gradient vectors for 3D (pointing to mid-edge of cube)
    private static readonly grad3 = [
        [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
        [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
        [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
    ];

    // Gradient vectors for 4D
    private static readonly grad4 = [
        [0, 1, 1, 1], [0, 1, 1, -1], [0, 1, -1, 1], [0, 1, -1, -1],
        [0, -1, 1, 1], [0, -1, 1, -1], [0, -1, -1, 1], [0, -1, -1, -1],
        [1, 0, 1, 1], [1, 0, 1, -1], [1, 0, -1, 1], [1, 0, -1, -1],
        [-1, 0, 1, 1], [-1, 0, 1, -1], [-1, 0, -1, 1], [-1, 0, -1, -1],
        [1, 1, 0, 1], [1, 1, 0, -1], [1, -1, 0, 1], [1, -1, 0, -1],
        [-1, 1, 0, 1], [-1, 1, 0, -1], [-1, -1, 0, 1], [-1, -1, 0, -1],
        [1, 1, 1, 0], [1, 1, -1, 0], [1, -1, 1, 0], [1, -1, -1, 0],
        [-1, 1, 1, 0], [-1, 1, -1, 0], [-1, -1, 1, 0], [-1, -1, -1, 0]
    ];

    /**
     * Create a new Simplex noise generator
     * @param seed - Optional seed for reproducible noise (default: random)
     */
    constructor(seed?: number) {
        // Initialize permutation table
        const p = new Array(256);
        for (let i = 0; i < 256; i++) {
            p[i] = i;
        }

        // Shuffle using seed if provided
        if (seed !== undefined) {
            this.shuffle(p, seed);
        } else {
            // Random shuffle
            for (let i = 255; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [p[i], p[j]] = [p[j], p[i]];
            }
        }

        // Extend permutation table
        this.perm = new Array(512);
        this.permMod12 = new Array(512);
        for (let i = 0; i < 512; i++) {
            this.perm[i] = p[i & 255];
            this.permMod12[i] = this.perm[i] % 12;
        }
    }

    /**
     * Shuffle permutation table using a seed
     */
    private shuffle(arr: number[], seed: number): void {
        let current = seed;
        const a = 1664525;
        const c = 1013904223;
        const m = 4294967296;

        for (let i = 255; i > 0; i--) {
            current = (a * current + c) % m;
            const j = Math.floor((current / m) * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    /**
     * Fast floor function
     */
    private fastFloor(x: number): number {
        return x > 0 ? Math.floor(x) : Math.floor(x) - 1;
    }

    /**
     * Calculate dot product for 2D
     */
    private dot2(g: number[], x: number, y: number): number {
        return g[0] * x + g[1] * y;
    }

    /**
     * Calculate dot product for 3D
     */
    private dot3(g: number[], x: number, y: number, z: number): number {
        return g[0] * x + g[1] * y + g[2] * z;
    }

    /**
     * Calculate dot product for 4D
     */
    private dot4(g: number[], x: number, y: number, z: number, w: number): number {
        return g[0] * x + g[1] * y + g[2] * z + g[3] * w;
    }

    /**
     * Generate 2D Simplex noise
     * @param xin - X coordinate
     * @param yin - Y coordinate
     * @returns Noise value in range approximately [-1, 1]
     */
    noise2D(xin: number, yin: number): number {
        let n0, n1, n2; // Noise contributions from the three corners

        // Skew the input space to determine which simplex cell we're in
        const s = (xin + yin) * SimplexNoise.F2;
        const i = this.fastFloor(xin + s);
        const j = this.fastFloor(yin + s);

        const t = (i + j) * SimplexNoise.G2;
        const X0 = i - t; // Unskew the cell origin back to (x,y) space
        const Y0 = j - t;
        const x0 = xin - X0; // The x,y distances from the cell origin
        const y0 = yin - Y0;

        // Determine which simplex we are in
        let i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
        if (x0 > y0) {
            i1 = 1; j1 = 0; // Lower triangle
        } else {
            i1 = 0; j1 = 1; // Upper triangle
        }

        // Offsets for middle corner in (x,y) unskewed coords
        const x1 = x0 - i1 + SimplexNoise.G2;
        const y1 = y0 - j1 + SimplexNoise.G2;
        // Offsets for last corner in (x,y) unskewed coords
        const x2 = x0 - 1 + 2 * SimplexNoise.G2;
        const y2 = y0 - 1 + 2 * SimplexNoise.G2;

        // Work out the hashed gradient indices
        const ii = i & 255;
        const jj = j & 255;
        const gi0 = this.permMod12[ii + this.perm[jj]];
        const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1]];
        const gi2 = this.permMod12[ii + 1 + this.perm[jj + 1]];

        // Calculate the contribution from the three corners
        let t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 < 0) {
            n0 = 0;
        } else {
            t0 *= t0;
            n0 = t0 * t0 * this.dot2(SimplexNoise.grad3[gi0], x0, y0);
        }

        let t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 < 0) {
            n1 = 0;
        } else {
            t1 *= t1;
            n1 = t1 * t1 * this.dot2(SimplexNoise.grad3[gi1], x1, y1);
        }

        let t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 < 0) {
            n2 = 0;
        } else {
            t2 *= t2;
            n2 = t2 * t2 * this.dot2(SimplexNoise.grad3[gi2], x2, y2);
        }

        // Add contributions from each corner to get the final noise value
        // Scale to [-1, 1]
        return 70 * (n0 + n1 + n2);
    }

    /**
     * Generate 3D Simplex noise
     * @param xin - X coordinate
     * @param yin - Y coordinate
     * @param zin - Z coordinate
     * @returns Noise value in range approximately [-1, 1]
     */
    noise3D(xin: number, yin: number, zin: number): number {
        let n0, n1, n2, n3; // Noise contributions from the four corners

        // Skew the input space to determine which simplex cell we're in
        const s = (xin + yin + zin) * SimplexNoise.F3;
        const i = this.fastFloor(xin + s);
        const j = this.fastFloor(yin + s);
        const k = this.fastFloor(zin + s);

        const t = (i + j + k) * SimplexNoise.G3;
        const X0 = i - t;
        const Y0 = j - t;
        const Z0 = k - t;
        const x0 = xin - X0;
        const y0 = yin - Y0;
        const z0 = zin - Z0;

        // Determine which simplex we are in
        let i1, j1, k1; // Offsets for second corner
        let i2, j2, k2; // Offsets for third corner

        if (x0 >= y0) {
            if (y0 >= z0) {
                i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0;
            } else if (x0 >= z0) {
                i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1;
            } else {
                i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1;
            }
        } else {
            if (y0 < z0) {
                i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1;
            } else if (x0 < z0) {
                i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1;
            } else {
                i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0;
            }
        }

        // Offsets for remaining corners
        const x1 = x0 - i1 + SimplexNoise.G3;
        const y1 = y0 - j1 + SimplexNoise.G3;
        const z1 = z0 - k1 + SimplexNoise.G3;
        const x2 = x0 - i2 + 2 * SimplexNoise.G3;
        const y2 = y0 - j2 + 2 * SimplexNoise.G3;
        const z2 = z0 - k2 + 2 * SimplexNoise.G3;
        const x3 = x0 - 1 + 3 * SimplexNoise.G3;
        const y3 = y0 - 1 + 3 * SimplexNoise.G3;
        const z3 = z0 - 1 + 3 * SimplexNoise.G3;

        // Work out the hashed gradient indices
        const ii = i & 255;
        const jj = j & 255;
        const kk = k & 255;
        const gi0 = this.permMod12[ii + this.perm[jj + this.perm[kk]]];
        const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1]]];
        const gi2 = this.permMod12[ii + i2 + this.perm[jj + j2 + this.perm[kk + k2]]];
        const gi3 = this.permMod12[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1]]];

        // Calculate contributions from each corner
        let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
        if (t0 < 0) {
            n0 = 0;
        } else {
            t0 *= t0;
            n0 = t0 * t0 * this.dot3(SimplexNoise.grad3[gi0], x0, y0, z0);
        }

        let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
        if (t1 < 0) {
            n1 = 0;
        } else {
            t1 *= t1;
            n1 = t1 * t1 * this.dot3(SimplexNoise.grad3[gi1], x1, y1, z1);
        }

        let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
        if (t2 < 0) {
            n2 = 0;
        } else {
            t2 *= t2;
            n2 = t2 * t2 * this.dot3(SimplexNoise.grad3[gi2], x2, y2, z2);
        }

        let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
        if (t3 < 0) {
            n3 = 0;
        } else {
            t3 *= t3;
            n3 = t3 * t3 * this.dot3(SimplexNoise.grad3[gi3], x3, y3, z3);
        }

        // Add contributions and scale to [-1, 1]
        return 32 * (n0 + n1 + n2 + n3);
    }

    /**
     * Generate 4D Simplex noise
     * @param x - X coordinate
     * @param y - Y coordinate
     * @param z - Z coordinate
     * @param w - W coordinate
     * @returns Noise value in range approximately [-1, 1]
     */
    noise4D(x: number, y: number, z: number, w: number): number {
        let n0, n1, n2, n3, n4;

        // Skew the (x,y,z,w) space to determine which cell we're in
        const s = (x + y + z + w) * SimplexNoise.F4;
        const i = this.fastFloor(x + s);
        const j = this.fastFloor(y + s);
        const k = this.fastFloor(z + s);
        const l = this.fastFloor(w + s);

        const t = (i + j + k + l) * SimplexNoise.G4;
        const X0 = i - t;
        const Y0 = j - t;
        const Z0 = k - t;
        const W0 = l - t;

        const x0 = x - X0;
        const y0 = y - Y0;
        const z0 = z - Z0;
        const w0 = w - W0;

        // Rank ordering to determine which simplex we're in
        let rankx = 0;
        let ranky = 0;
        let rankz = 0;
        let rankw = 0;

        if (x0 > y0) rankx++; else ranky++;
        if (x0 > z0) rankx++; else rankz++;
        if (x0 > w0) rankx++; else rankw++;
        if (y0 > z0) ranky++; else rankz++;
        if (y0 > w0) ranky++; else rankw++;
        if (z0 > w0) rankz++; else rankw++;

        const i1 = rankx >= 3 ? 1 : 0;
        const j1 = ranky >= 3 ? 1 : 0;
        const k1 = rankz >= 3 ? 1 : 0;
        const l1 = rankw >= 3 ? 1 : 0;

        const i2 = rankx >= 2 ? 1 : 0;
        const j2 = ranky >= 2 ? 1 : 0;
        const k2 = rankz >= 2 ? 1 : 0;
        const l2 = rankw >= 2 ? 1 : 0;

        const i3 = rankx >= 1 ? 1 : 0;
        const j3 = ranky >= 1 ? 1 : 0;
        const k3 = rankz >= 1 ? 1 : 0;
        const l3 = rankw >= 1 ? 1 : 0;

        const x1 = x0 - i1 + SimplexNoise.G4;
        const y1 = y0 - j1 + SimplexNoise.G4;
        const z1 = z0 - k1 + SimplexNoise.G4;
        const w1 = w0 - l1 + SimplexNoise.G4;

        const x2 = x0 - i2 + 2 * SimplexNoise.G4;
        const y2 = y0 - j2 + 2 * SimplexNoise.G4;
        const z2 = z0 - k2 + 2 * SimplexNoise.G4;
        const w2 = w0 - l2 + 2 * SimplexNoise.G4;

        const x3 = x0 - i3 + 3 * SimplexNoise.G4;
        const y3 = y0 - j3 + 3 * SimplexNoise.G4;
        const z3 = z0 - k3 + 3 * SimplexNoise.G4;
        const w3 = w0 - l3 + 3 * SimplexNoise.G4;

        const x4 = x0 - 1 + 4 * SimplexNoise.G4;
        const y4 = y0 - 1 + 4 * SimplexNoise.G4;
        const z4 = z0 - 1 + 4 * SimplexNoise.G4;
        const w4 = w0 - 1 + 4 * SimplexNoise.G4;

        const ii = i & 255;
        const jj = j & 255;
        const kk = k & 255;
        const ll = l & 255;

        const gi0 = this.perm[ii + this.perm[jj + this.perm[kk + this.perm[ll]]]] % 32;
        const gi1 = this.perm[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1 + this.perm[ll + l1]]]] % 32;
        const gi2 = this.perm[ii + i2 + this.perm[jj + j2 + this.perm[kk + k2 + this.perm[ll + l2]]]] % 32;
        const gi3 = this.perm[ii + i3 + this.perm[jj + j3 + this.perm[kk + k3 + this.perm[ll + l3]]]] % 32;
        const gi4 = this.perm[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1 + this.perm[ll + 1]]]] % 32;

        let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0 - w0 * w0;
        if (t0 < 0) {
            n0 = 0;
        } else {
            t0 *= t0;
            n0 = t0 * t0 * this.dot4(SimplexNoise.grad4[gi0], x0, y0, z0, w0);
        }

        let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1 - w1 * w1;
        if (t1 < 0) {
            n1 = 0;
        } else {
            t1 *= t1;
            n1 = t1 * t1 * this.dot4(SimplexNoise.grad4[gi1], x1, y1, z1, w1);
        }

        let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2 - w2 * w2;
        if (t2 < 0) {
            n2 = 0;
        } else {
            t2 *= t2;
            n2 = t2 * t2 * this.dot4(SimplexNoise.grad4[gi2], x2, y2, z2, w2);
        }

        let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3 - w3 * w3;
        if (t3 < 0) {
            n3 = 0;
        } else {
            t3 *= t3;
            n3 = t3 * t3 * this.dot4(SimplexNoise.grad4[gi3], x3, y3, z3, w3);
        }

        let t4 = 0.6 - x4 * x4 - y4 * y4 - z4 * z4 - w4 * w4;
        if (t4 < 0) {
            n4 = 0;
        } else {
            t4 *= t4;
            n4 = t4 * t4 * this.dot4(SimplexNoise.grad4[gi4], x4, y4, z4, w4);
        }

        return 27 * (n0 + n1 + n2 + n3 + n4);
    }
}

// Convenience functions using a default instance
const defaultSimplex = new SimplexNoise();

/**
 * Generate 2D Simplex noise using default generator
 * @param x - X coordinate
 * @param y - Y coordinate
 * @returns Noise value in range approximately [-1, 1]
 */
export function simplex2D(x: number, y: number): number {
    return defaultSimplex.noise2D(x, y);
}

/**
 * Generate 3D Simplex noise using default generator
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param z - Z coordinate
 * @returns Noise value in range approximately [-1, 1]
 */
export function simplex3D(x: number, y: number, z: number): number {
    return defaultSimplex.noise3D(x, y, z);
}

/**
 * Generate 4D Simplex noise using default generator
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param z - Z coordinate
 * @param w - W coordinate
 * @returns Noise value in range approximately [-1, 1]
 */
export function simplex4D(x: number, y: number, z: number, w: number): number {
    return defaultSimplex.noise4D(x, y, z, w);
}
