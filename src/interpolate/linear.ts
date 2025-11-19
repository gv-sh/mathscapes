/**
 * Linear Interpolation Functions
 *
 * Provides various linear interpolation methods for smoothly transitioning
 * between values in 1D, 2D, and 3D spaces.
 *
 * Applications:
 * - Smooth animations and transitions
 * - Texture sampling
 * - Data resampling
 * - Color blending
 */

/**
 * Linear interpolation (lerp) between two values
 *
 * Calculates a value linearly interpolated between a and b using parameter t.
 * When t = 0, returns a; when t = 1, returns b.
 *
 * @param a - Start value
 * @param b - End value
 * @param t - Interpolation parameter [0, 1]
 * @returns Interpolated value
 *
 * @example
 * ```typescript
 * lerp(0, 10, 0.5); // Returns 5
 * lerp(100, 200, 0.25); // Returns 125
 * ```
 */
export function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

/**
 * Linear interpolation with clamping
 *
 * Same as lerp but clamps t to [0, 1] range
 *
 * @param a - Start value
 * @param b - End value
 * @param t - Interpolation parameter (will be clamped to [0, 1])
 * @returns Interpolated value
 */
export function lerpClamped(a: number, b: number, t: number): number {
    const clamped = Math.max(0, Math.min(1, t));
    return lerp(a, b, clamped);
}

/**
 * Inverse linear interpolation
 *
 * Given a value between a and b, returns the interpolation parameter t
 * that would produce that value.
 *
 * @param a - Start value
 * @param b - End value
 * @param value - Value to find parameter for
 * @returns Interpolation parameter t
 *
 * @example
 * ```typescript
 * inverseLerp(0, 10, 5); // Returns 0.5
 * inverseLerp(100, 200, 150); // Returns 0.5
 * ```
 */
export function inverseLerp(a: number, b: number, value: number): number {
    if (Math.abs(b - a) < Number.EPSILON) {
        return 0;
    }
    return (value - a) / (b - a);
}

/**
 * Remap a value from one range to another
 *
 * @param value - Value to remap
 * @param inMin - Input range minimum
 * @param inMax - Input range maximum
 * @param outMin - Output range minimum
 * @param outMax - Output range maximum
 * @returns Remapped value
 *
 * @example
 * ```typescript
 * remap(5, 0, 10, 0, 100); // Returns 50
 * remap(0.5, 0, 1, -1, 1); // Returns 0
 * ```
 */
export function remap(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
    const t = inverseLerp(inMin, inMax, value);
    return lerp(outMin, outMax, t);
}

/**
 * Bilinear interpolation in 2D
 *
 * Interpolates between four corner values in a unit square.
 *
 * @param v00 - Value at (0, 0)
 * @param v10 - Value at (1, 0)
 * @param v01 - Value at (0, 1)
 * @param v11 - Value at (1, 1)
 * @param tx - X interpolation parameter [0, 1]
 * @param ty - Y interpolation parameter [0, 1]
 * @returns Interpolated value
 *
 * @example
 * ```typescript
 * // Interpolate in the center of a square
 * bilinear(0, 1, 1, 2, 0.5, 0.5); // Returns 1.0
 * ```
 */
export function bilinear(
    v00: number,
    v10: number,
    v01: number,
    v11: number,
    tx: number,
    ty: number
): number {
    // Interpolate along x-axis
    const a = lerp(v00, v10, tx);
    const b = lerp(v01, v11, tx);

    // Interpolate along y-axis
    return lerp(a, b, ty);
}

/**
 * Bilinear interpolation using array of corner values
 *
 * @param corners - Array of 4 values: [v00, v10, v01, v11]
 * @param tx - X interpolation parameter [0, 1]
 * @param ty - Y interpolation parameter [0, 1]
 * @returns Interpolated value
 */
export function bilinearArray(corners: number[], tx: number, ty: number): number {
    if (corners.length !== 4) {
        throw new Error('Bilinear interpolation requires exactly 4 corner values');
    }
    return bilinear(corners[0], corners[1], corners[2], corners[3], tx, ty);
}

/**
 * Trilinear interpolation in 3D
 *
 * Interpolates between eight corner values in a unit cube.
 *
 * @param v000 - Value at (0, 0, 0)
 * @param v100 - Value at (1, 0, 0)
 * @param v010 - Value at (0, 1, 0)
 * @param v110 - Value at (1, 1, 0)
 * @param v001 - Value at (0, 0, 1)
 * @param v101 - Value at (1, 0, 1)
 * @param v011 - Value at (0, 1, 1)
 * @param v111 - Value at (1, 1, 1)
 * @param tx - X interpolation parameter [0, 1]
 * @param ty - Y interpolation parameter [0, 1]
 * @param tz - Z interpolation parameter [0, 1]
 * @returns Interpolated value
 */
export function trilinear(
    v000: number,
    v100: number,
    v010: number,
    v110: number,
    v001: number,
    v101: number,
    v011: number,
    v111: number,
    tx: number,
    ty: number,
    tz: number
): number {
    // Interpolate along x-axis for z=0 plane
    const c00 = lerp(v000, v100, tx);
    const c10 = lerp(v010, v110, tx);

    // Interpolate along x-axis for z=1 plane
    const c01 = lerp(v001, v101, tx);
    const c11 = lerp(v011, v111, tx);

    // Interpolate along y-axis
    const c0 = lerp(c00, c10, ty);
    const c1 = lerp(c01, c11, ty);

    // Interpolate along z-axis
    return lerp(c0, c1, tz);
}

/**
 * Trilinear interpolation using array of corner values
 *
 * @param corners - Array of 8 values: [v000, v100, v010, v110, v001, v101, v011, v111]
 * @param tx - X interpolation parameter [0, 1]
 * @param ty - Y interpolation parameter [0, 1]
 * @param tz - Z interpolation parameter [0, 1]
 * @returns Interpolated value
 */
export function trilinearArray(corners: number[], tx: number, ty: number, tz: number): number {
    if (corners.length !== 8) {
        throw new Error('Trilinear interpolation requires exactly 8 corner values');
    }
    return trilinear(
        corners[0], corners[1], corners[2], corners[3],
        corners[4], corners[5], corners[6], corners[7],
        tx, ty, tz
    );
}

/**
 * Smoothstep function
 *
 * Hermite interpolation that provides smooth acceleration and deceleration.
 * Results in C1 continuity (continuous first derivative).
 *
 * @param edge0 - Lower edge
 * @param edge1 - Upper edge
 * @param x - Input value
 * @returns Smoothly interpolated value [0, 1]
 *
 * @example
 * ```typescript
 * smoothstep(0, 1, 0.5); // Returns 0.5
 * smoothstep(0, 10, 5); // Returns 0.5 with smooth curve
 * ```
 */
export function smoothstep(edge0: number, edge1: number, x: number): number {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
}

/**
 * Smoother step function (Ken Perlin's improved version)
 *
 * Provides even smoother interpolation than smoothstep with C2 continuity
 * (continuous second derivative).
 *
 * @param edge0 - Lower edge
 * @param edge1 - Upper edge
 * @param x - Input value
 * @returns Smoothly interpolated value [0, 1]
 */
export function smootherstep(edge0: number, edge1: number, x: number): number {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * t * (t * (t * 6 - 15) + 10);
}

/**
 * Cosine interpolation
 *
 * Uses cosine function for smooth interpolation. Smoother than linear
 * but not as efficient as smoothstep.
 *
 * @param a - Start value
 * @param b - End value
 * @param t - Interpolation parameter [0, 1]
 * @returns Interpolated value
 */
export function cosineInterp(a: number, b: number, t: number): number {
    const mu = (1 - Math.cos(t * Math.PI)) / 2;
    return a * (1 - mu) + b * mu;
}

/**
 * Multi-point linear interpolation (polyline)
 *
 * Interpolates through multiple points along a polyline.
 *
 * @param points - Array of values to interpolate through
 * @param t - Global interpolation parameter [0, 1]
 * @returns Interpolated value
 *
 * @example
 * ```typescript
 * multiLerp([0, 5, 2, 10], 0.5); // Interpolates through the middle points
 * ```
 */
export function multiLerp(points: number[], t: number): number {
    if (points.length === 0) {
        throw new Error('Cannot interpolate empty array');
    }
    if (points.length === 1) {
        return points[0];
    }

    // Clamp t to [0, 1]
    t = Math.max(0, Math.min(1, t));

    // Calculate which segment we're in
    const scaledT = t * (points.length - 1);
    const segment = Math.floor(scaledT);
    const localT = scaledT - segment;

    // Handle edge case
    if (segment >= points.length - 1) {
        return points[points.length - 1];
    }

    return lerp(points[segment], points[segment + 1], localT);
}
