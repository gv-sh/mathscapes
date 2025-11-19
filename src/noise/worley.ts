/**
 * Worley Noise (Cellular Noise) Implementation
 *
 * Worley noise, also known as cellular noise or Voronoi noise, creates distinctive
 * cellular patterns based on distances to randomly placed feature points.
 * Developed by Steven Worley in 1996.
 *
 * Applications:
 * - Organic textures (stone, water, cells)
 * - Cracked surfaces and voronoi diagrams
 * - Water caustics
 * - Procedural patterns
 *
 * This implementation provides 2D and 3D Worley noise with various distance metrics.
 *
 * Reference: Steven Worley, "A Cellular Texture Basis Function", SIGGRAPH 1996
 */

/**
 * Distance metric functions for Worley noise
 */
export enum DistanceMetric {
    /** Standard Euclidean distance */
    EUCLIDEAN,
    /** Manhattan/taxicab distance */
    MANHATTAN,
    /** Chebyshev distance (chessboard metric) */
    CHEBYSHEV,
    /** Minkowski distance with p=4 */
    MINKOWSKI
}

/**
 * WorleyNoise class for generating cellular noise patterns
 *
 * @example
 * ```typescript
 * const worley = new WorleyNoise();
 * const [f1, f2] = worley.noise2D(x, y);
 *
 * // Use f1 for basic cellular pattern
 * // Use f2 - f1 for cell edges
 *
 * // With custom seed and distance metric
 * const customWorley = new WorleyNoise(42, DistanceMetric.MANHATTAN);
 * ```
 */
export class WorleyNoise {
    private seed: number;
    private metric: DistanceMetric;
    private jitter: number;

    /**
     * Create a new Worley noise generator
     * @param seed - Seed for reproducible noise (default: random)
     * @param metric - Distance metric to use (default: EUCLIDEAN)
     * @param jitter - Amount of randomness in point positions, 0-1 (default: 1)
     */
    constructor(
        seed: number = Math.random() * 1000000,
        metric: DistanceMetric = DistanceMetric.EUCLIDEAN,
        jitter: number = 1.0
    ) {
        this.seed = seed;
        this.metric = metric;
        this.jitter = Math.max(0, Math.min(1, jitter));
    }

    /**
     * Hash function for pseudo-random number generation
     */
    private hash(...values: number[]): number {
        let h = this.seed;
        for (const v of values) {
            h = (h * 1664525 + v * 1013904223) >>> 0;
        }
        return h / 4294967296;
    }

    /**
     * Generate pseudo-random number from cell coordinates
     */
    private random(ix: number, iy: number, iz: number = 0): number {
        return this.hash(ix, iy, iz);
    }

    /**
     * Calculate distance based on selected metric
     */
    private distance2D(x1: number, y1: number, x2: number, y2: number): number {
        const dx = x2 - x1;
        const dy = y2 - y1;

        switch (this.metric) {
            case DistanceMetric.EUCLIDEAN:
                return Math.sqrt(dx * dx + dy * dy);
            case DistanceMetric.MANHATTAN:
                return Math.abs(dx) + Math.abs(dy);
            case DistanceMetric.CHEBYSHEV:
                return Math.max(Math.abs(dx), Math.abs(dy));
            case DistanceMetric.MINKOWSKI:
                return Math.pow(Math.pow(Math.abs(dx), 4) + Math.pow(Math.abs(dy), 4), 0.25);
            default:
                return Math.sqrt(dx * dx + dy * dy);
        }
    }

    /**
     * Calculate distance for 3D based on selected metric
     */
    private distance3D(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): number {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dz = z2 - z1;

        switch (this.metric) {
            case DistanceMetric.EUCLIDEAN:
                return Math.sqrt(dx * dx + dy * dy + dz * dz);
            case DistanceMetric.MANHATTAN:
                return Math.abs(dx) + Math.abs(dy) + Math.abs(dz);
            case DistanceMetric.CHEBYSHEV:
                return Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz));
            case DistanceMetric.MINKOWSKI:
                return Math.pow(Math.pow(Math.abs(dx), 4) + Math.pow(Math.abs(dy), 4) + Math.pow(Math.abs(dz), 4), 0.25);
            default:
                return Math.sqrt(dx * dx + dy * dy + dz * dz);
        }
    }

    /**
     * Generate 2D Worley noise
     * @param x - X coordinate
     * @param y - Y coordinate
     * @returns Array of [F1, F2, F3] distances to closest three feature points
     */
    noise2D(x: number, y: number): [number, number, number] {
        const cellX = Math.floor(x);
        const cellY = Math.floor(y);

        let minDist1 = Infinity;
        let minDist2 = Infinity;
        let minDist3 = Infinity;

        // Check 3x3 neighborhood of cells
        for (let oy = -1; oy <= 1; oy++) {
            for (let ox = -1; ox <= 1; ox++) {
                const cx = cellX + ox;
                const cy = cellY + oy;

                // Generate feature point position within cell using hash
                const px = cx + this.jitter * (this.random(cx, cy, 0) - 0.5) + 0.5;
                const py = cy + this.jitter * (this.random(cx, cy, 1) - 0.5) + 0.5;

                // Calculate distance to feature point
                const dist = this.distance2D(x, y, px, py);

                // Update closest distances
                if (dist < minDist1) {
                    minDist3 = minDist2;
                    minDist2 = minDist1;
                    minDist1 = dist;
                } else if (dist < minDist2) {
                    minDist3 = minDist2;
                    minDist2 = dist;
                } else if (dist < minDist3) {
                    minDist3 = dist;
                }
            }
        }

        return [minDist1, minDist2, minDist3];
    }

    /**
     * Generate 3D Worley noise
     * @param x - X coordinate
     * @param y - Y coordinate
     * @param z - Z coordinate
     * @returns Array of [F1, F2, F3] distances to closest three feature points
     */
    noise3D(x: number, y: number, z: number): [number, number, number] {
        const cellX = Math.floor(x);
        const cellY = Math.floor(y);
        const cellZ = Math.floor(z);

        let minDist1 = Infinity;
        let minDist2 = Infinity;
        let minDist3 = Infinity;

        // Check 3x3x3 neighborhood of cells
        for (let oz = -1; oz <= 1; oz++) {
            for (let oy = -1; oy <= 1; oy++) {
                for (let ox = -1; ox <= 1; ox++) {
                    const cx = cellX + ox;
                    const cy = cellY + oy;
                    const cz = cellZ + oz;

                    // Generate feature point position within cell
                    const px = cx + this.jitter * (this.random(cx, cy, cz * 2) - 0.5) + 0.5;
                    const py = cy + this.jitter * (this.random(cx, cy, cz * 2 + 1) - 0.5) + 0.5;
                    const pz = cz + this.jitter * (this.random(cx, cy, cz * 3) - 0.5) + 0.5;

                    // Calculate distance to feature point
                    const dist = this.distance3D(x, y, z, px, py, pz);

                    // Update closest distances
                    if (dist < minDist1) {
                        minDist3 = minDist2;
                        minDist2 = minDist1;
                        minDist1 = dist;
                    } else if (dist < minDist2) {
                        minDist3 = minDist2;
                        minDist2 = dist;
                    } else if (dist < minDist3) {
                        minDist3 = dist;
                    }
                }
            }
        }

        return [minDist1, minDist2, minDist3];
    }
}

// Convenience functions using a default instance
const defaultWorley = new WorleyNoise();

/**
 * Generate 2D Worley noise using default generator
 * @param x - X coordinate
 * @param y - Y coordinate
 * @returns Array of [F1, F2, F3] distances to closest three feature points
 */
export function worley2D(x: number, y: number): [number, number, number] {
    return defaultWorley.noise2D(x, y);
}

/**
 * Generate 3D Worley noise using default generator
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param z - Z coordinate
 * @returns Array of [F1, F2, F3] distances to closest three feature points
 */
export function worley3D(x: number, y: number, z: number): [number, number, number] {
    return defaultWorley.noise3D(x, y, z);
}

/**
 * Generate cellular pattern (F1 only)
 * @param x - X coordinate
 * @param y - Y coordinate
 * @returns Distance to nearest feature point
 */
export function cellular2D(x: number, y: number): number {
    return defaultWorley.noise2D(x, y)[0];
}

/**
 * Generate cellular pattern (F1 only) in 3D
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param z - Z coordinate
 * @returns Distance to nearest feature point
 */
export function cellular3D(x: number, y: number, z: number): number {
    return defaultWorley.noise3D(x, y, z)[0];
}

/**
 * Generate cell edge pattern (F2 - F1)
 * @param x - X coordinate
 * @param y - Y coordinate
 * @returns Edge strength (difference between first and second closest points)
 */
export function cellEdge2D(x: number, y: number): number {
    const [f1, f2] = defaultWorley.noise2D(x, y);
    return f2 - f1;
}

/**
 * Generate cell edge pattern (F2 - F1) in 3D
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param z - Z coordinate
 * @returns Edge strength
 */
export function cellEdge3D(x: number, y: number, z: number): number {
    const [f1, f2] = defaultWorley.noise3D(x, y, z);
    return f2 - f1;
}
