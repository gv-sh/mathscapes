/**
 * Gradient Noise Implementation
 *
 * Gradient noise (also known as classic Perlin noise) generates smooth noise by
 * interpolating dot products of random gradients at grid points. This produces
 * more natural-looking noise compared to value noise.
 *
 * This is a cleaner implementation separate from Perlin noise to demonstrate
 * the gradient noise algorithm more explicitly.
 *
 * Features:
 * - 2D and 3D gradient noise
 * - Configurable seed for reproducibility
 * - Quintic interpolation for smoother results
 *
 * References:
 * - Ken Perlin's original paper (1985)
 * - Improving Noise (Perlin, 2002)
 */

/**
 * Gradient Noise Generator
 * Generates smooth random noise using random gradients at grid points
 */
export class GradientNoise {
    private seed: number;
    private perm: number[];
    private gradients2D: [number, number][];
    private gradients3D: [number, number, number][];

    /**
     * Creates a new GradientNoise generator
     * @param seed - Random seed for reproducibility (default: random)
     */
    constructor(seed?: number) {
        this.seed = seed !== undefined ? seed : Math.random() * 65536;
        this.perm = this.generatePermutation();
        this.gradients2D = this.generateGradients2D();
        this.gradients3D = this.generateGradients3D();
    }

    /**
     * Generate permutation table
     */
    private generatePermutation(): number[] {
        const p: number[] = [];
        for (let i = 0; i < 256; i++) {
            p[i] = i;
        }

        let seed = this.seed;
        for (let i = 255; i > 0; i--) {
            seed = (seed * 1103515245 + 12345) & 0x7fffffff;
            const j = Math.floor((seed / 0x7fffffff) * (i + 1));
            [p[i], p[j]] = [p[j], p[i]];
        }

        return [...p, ...p];
    }

    /**
     * Generate 2D gradient vectors
     * Uses 8 evenly distributed unit vectors
     */
    private generateGradients2D(): [number, number][] {
        const grads: [number, number][] = [];
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI * 2) / 8;
            grads.push([Math.cos(angle), Math.sin(angle)]);
        }
        return grads;
    }

    /**
     * Generate 3D gradient vectors
     * Uses 12 edge directions of a cube
     */
    private generateGradients3D(): [number, number, number][] {
        return [
            [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
            [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
            [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
        ];
    }

    /**
     * Hash function to get gradient index
     */
    private hash(...coords: number[]): number {
        let h = this.seed & 0xff;
        for (const c of coords) {
            h = this.perm[(h + Math.floor(c)) & 0xff];
        }
        return h;
    }

    /**
     * Fade function for smooth interpolation (quintic)
     * Smoother than cubic: 6t^5 - 15t^4 + 10t^3
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
     * 2D gradient noise
     * @param x - X coordinate
     * @param y - Y coordinate
     * @returns Noise value in range approximately [-1, 1]
     */
    noise2D(x: number, y: number): number {
        const xi = Math.floor(x);
        const yi = Math.floor(y);
        const xf = x - xi;
        const yf = y - yi;

        // Get gradient indices for corners
        const g00 = this.hash(xi, yi) & 7;
        const g10 = this.hash(xi + 1, yi) & 7;
        const g01 = this.hash(xi, yi + 1) & 7;
        const g11 = this.hash(xi + 1, yi + 1) & 7;

        // Compute dot products with distance vectors
        const [gx00, gy00] = this.gradients2D[g00];
        const [gx10, gy10] = this.gradients2D[g10];
        const [gx01, gy01] = this.gradients2D[g01];
        const [gx11, gy11] = this.gradients2D[g11];

        const n00 = gx00 * xf + gy00 * yf;
        const n10 = gx10 * (xf - 1) + gy10 * yf;
        const n01 = gx01 * xf + gy01 * (yf - 1);
        const n11 = gx11 * (xf - 1) + gy11 * (yf - 1);

        // Interpolate
        const sx = this.fade(xf);
        const sy = this.fade(yf);

        const n0 = this.lerp(sx, n00, n10);
        const n1 = this.lerp(sx, n01, n11);

        return this.lerp(sy, n0, n1);
    }

    /**
     * 3D gradient noise
     * @param x - X coordinate
     * @param y - Y coordinate
     * @param z - Z coordinate
     * @returns Noise value in range approximately [-1, 1]
     */
    noise3D(x: number, y: number, z: number): number {
        const xi = Math.floor(x);
        const yi = Math.floor(y);
        const zi = Math.floor(z);
        const xf = x - xi;
        const yf = y - yi;
        const zf = z - zi;

        // Get gradient indices for corners
        const g000 = this.hash(xi, yi, zi) % 12;
        const g100 = this.hash(xi + 1, yi, zi) % 12;
        const g010 = this.hash(xi, yi + 1, zi) % 12;
        const g110 = this.hash(xi + 1, yi + 1, zi) % 12;
        const g001 = this.hash(xi, yi, zi + 1) % 12;
        const g101 = this.hash(xi + 1, yi, zi + 1) % 12;
        const g011 = this.hash(xi, yi + 1, zi + 1) % 12;
        const g111 = this.hash(xi + 1, yi + 1, zi + 1) % 12;

        // Compute dot products
        const dot = (g: [number, number, number], dx: number, dy: number, dz: number): number => {
            return g[0] * dx + g[1] * dy + g[2] * dz;
        };

        const n000 = dot(this.gradients3D[g000], xf, yf, zf);
        const n100 = dot(this.gradients3D[g100], xf - 1, yf, zf);
        const n010 = dot(this.gradients3D[g010], xf, yf - 1, zf);
        const n110 = dot(this.gradients3D[g110], xf - 1, yf - 1, zf);
        const n001 = dot(this.gradients3D[g001], xf, yf, zf - 1);
        const n101 = dot(this.gradients3D[g101], xf - 1, yf, zf - 1);
        const n011 = dot(this.gradients3D[g011], xf, yf - 1, zf - 1);
        const n111 = dot(this.gradients3D[g111], xf - 1, yf - 1, zf - 1);

        // Interpolate
        const sx = this.fade(xf);
        const sy = this.fade(yf);
        const sz = this.fade(zf);

        const n00 = this.lerp(sx, n000, n100);
        const n10 = this.lerp(sx, n010, n110);
        const n01 = this.lerp(sx, n001, n101);
        const n11 = this.lerp(sx, n011, n111);

        const n0 = this.lerp(sy, n00, n10);
        const n1 = this.lerp(sy, n01, n11);

        return this.lerp(sz, n0, n1);
    }
}

// Convenience functions with default instance

const defaultGradientNoise = new GradientNoise();

/**
 * 2D gradient noise with default generator
 * @param x - X coordinate
 * @param y - Y coordinate
 * @returns Noise value in range approximately [-1, 1]
 */
export function gradient2D(x: number, y: number): number {
    return defaultGradientNoise.noise2D(x, y);
}

/**
 * 3D gradient noise with default generator
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param z - Z coordinate
 * @returns Noise value in range approximately [-1, 1]
 */
export function gradient3D(x: number, y: number, z: number): number {
    return defaultGradientNoise.noise3D(x, y, z);
}
