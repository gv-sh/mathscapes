/**
 * Cubic Interpolation Functions
 *
 * Provides cubic interpolation methods including Hermite and Catmull-Rom splines
 * for smooth curves with continuous derivatives.
 *
 * Applications:
 * - Smooth camera paths
 * - Animation curves
 * - Spline-based modeling
 * - High-quality resampling
 */

/**
 * Cubic Hermite interpolation
 *
 * Interpolates between two points with specified tangents at each point.
 * Provides C1 continuity (continuous first derivative).
 *
 * @param p0 - Start point value
 * @param m0 - Start point tangent
 * @param p1 - End point value
 * @param m1 - End point tangent
 * @param t - Interpolation parameter [0, 1]
 * @returns Interpolated value
 *
 * @example
 * ```typescript
 * // Interpolate with tangent 1 at start and end
 * hermite(0, 1, 10, 1, 0.5);
 * ```
 */
export function hermite(p0: number, m0: number, p1: number, m1: number, t: number): number {
    const t2 = t * t;
    const t3 = t2 * t;

    // Hermite basis functions
    const h00 = 2 * t3 - 3 * t2 + 1;
    const h10 = t3 - 2 * t2 + t;
    const h01 = -2 * t3 + 3 * t2;
    const h11 = t3 - t2;

    return h00 * p0 + h10 * m0 + h01 * p1 + h11 * m1;
}

/**
 * Catmull-Rom spline interpolation
 *
 * Interpolates between p1 and p2, using p0 and p3 to calculate tangents.
 * This creates a smooth curve that passes through all control points.
 * The curve has C1 continuity.
 *
 * @param p0 - Point before start (used for tangent calculation)
 * @param p1 - Start point
 * @param p2 - End point
 * @param p3 - Point after end (used for tangent calculation)
 * @param t - Interpolation parameter [0, 1]
 * @param tension - Tension parameter (default: 0.5 for standard Catmull-Rom)
 * @returns Interpolated value
 *
 * @example
 * ```typescript
 * // Interpolate between 5 and 10, using context points
 * catmullRom(0, 5, 10, 15, 0.5);
 * ```
 */
export function catmullRom(
    p0: number,
    p1: number,
    p2: number,
    p3: number,
    t: number,
    tension: number = 0.5
): number {
    const t2 = t * t;
    const t3 = t2 * t;

    // Calculate tangents using finite differences
    const m1 = (p2 - p0) * tension;
    const m2 = (p3 - p1) * tension;

    // Use Hermite interpolation with calculated tangents
    return hermite(p1, m1, p2, m2, t);
}

/**
 * Cardinal spline interpolation
 *
 * Similar to Catmull-Rom but with adjustable tension parameter.
 * tension = 0: Catmull-Rom spline
 * tension = 1: No overshoot (tighter curve)
 *
 * @param p0 - Point before start
 * @param p1 - Start point
 * @param p2 - End point
 * @param p3 - Point after end
 * @param t - Interpolation parameter [0, 1]
 * @param tension - Tension parameter [0, 1] (default: 0)
 * @returns Interpolated value
 */
export function cardinal(
    p0: number,
    p1: number,
    p2: number,
    p3: number,
    t: number,
    tension: number = 0
): number {
    const s = (1 - tension) / 2;
    return catmullRom(p0, p1, p2, p3, t, s);
}

/**
 * Cubic interpolation through an array of points
 *
 * Creates a smooth curve through all points using Catmull-Rom splines.
 *
 * @param points - Array of values to interpolate through
 * @param t - Global interpolation parameter [0, 1]
 * @param tension - Tension parameter (default: 0.5)
 * @returns Interpolated value
 *
 * @example
 * ```typescript
 * cubicSpline([0, 5, 3, 10, 8], 0.5);
 * ```
 */
export function cubicSpline(points: number[], t: number, tension: number = 0.5): number {
    if (points.length < 2) {
        throw new Error('Cubic spline requires at least 2 points');
    }
    if (points.length === 2) {
        // Fall back to linear interpolation
        return points[0] + (points[1] - points[0]) * t;
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

    // Get control points for this segment
    const p0 = segment > 0 ? points[segment - 1] : points[segment];
    const p1 = points[segment];
    const p2 = points[segment + 1];
    const p3 = segment < points.length - 2 ? points[segment + 2] : points[segment + 1];

    return catmullRom(p0, p1, p2, p3, localT, tension);
}

/**
 * Monotone cubic interpolation
 *
 * Ensures monotonicity: if input points are monotonically increasing/decreasing,
 * the interpolated curve will also be monotonic (no overshooting).
 * Useful for interpolating data that should preserve monotonicity.
 *
 * @param p0 - Previous point
 * @param p1 - Start point
 * @param p2 - End point
 * @param p3 - Next point
 * @param t - Interpolation parameter [0, 1]
 * @returns Interpolated value
 */
export function monotoneCubic(p0: number, p1: number, p2: number, p3: number, t: number): number {
    // Calculate secants (slopes between points)
    const d0 = p1 - p0;
    const d1 = p2 - p1;
    const d2 = p3 - p2;

    // Calculate tangents at p1 and p2
    let m1: number, m2: number;

    // Check for flat regions
    if (d0 * d1 <= 0) {
        m1 = 0;
    } else {
        m1 = (d0 + d1) / 2;
    }

    if (d1 * d2 <= 0) {
        m2 = 0;
    } else {
        m2 = (d1 + d2) / 2;
    }

    // Apply Fritsch-Carlson constraints to preserve monotonicity
    if (Math.abs(d1) < 1e-10) {
        m1 = 0;
        m2 = 0;
    } else {
        const alpha = m1 / d1;
        const beta = m2 / d1;
        const tau = 3;

        if (alpha * alpha + beta * beta > tau * tau) {
            const scale = tau / Math.sqrt(alpha * alpha + beta * beta);
            m1 = scale * alpha * d1;
            m2 = scale * beta * d1;
        }
    }

    return hermite(p1, m1, p2, m2, t);
}

/**
 * Bicubic interpolation in 2D
 *
 * Interpolates within a 4x4 grid of values using cubic interpolation in both dimensions.
 *
 * @param grid - 4x4 array of values (row-major order)
 * @param tx - X interpolation parameter [0, 1]
 * @param ty - Y interpolation parameter [0, 1]
 * @returns Interpolated value
 */
export function bicubic(grid: number[][], tx: number, ty: number): number {
    if (grid.length !== 4 || grid.some(row => row.length !== 4)) {
        throw new Error('Bicubic interpolation requires a 4x4 grid');
    }

    // Interpolate each row
    const rows: number[] = [];
    for (let i = 0; i < 4; i++) {
        rows.push(catmullRom(grid[i][0], grid[i][1], grid[i][2], grid[i][3], tx));
    }

    // Interpolate along column
    return catmullRom(rows[0], rows[1], rows[2], rows[3], ty);
}

/**
 * Tricubic interpolation in 3D
 *
 * Interpolates within a 4x4x4 grid of values using cubic interpolation in all dimensions.
 *
 * @param grid - 4x4x4 array of values
 * @param tx - X interpolation parameter [0, 1]
 * @param ty - Y interpolation parameter [0, 1]
 * @param tz - Z interpolation parameter [0, 1]
 * @returns Interpolated value
 */
export function tricubic(grid: number[][][], tx: number, ty: number, tz: number): number {
    if (grid.length !== 4 || grid.some(plane => plane.length !== 4) ||
        grid.some(plane => plane.some(row => row.length !== 4))) {
        throw new Error('Tricubic interpolation requires a 4x4x4 grid');
    }

    // Interpolate each z-plane
    const planes: number[] = [];
    for (let k = 0; k < 4; k++) {
        planes.push(bicubic(grid[k], tx, ty));
    }

    // Interpolate along z-axis
    return catmullRom(planes[0], planes[1], planes[2], planes[3], tz);
}

/**
 * Compute cubic polynomial coefficients
 *
 * Returns coefficients [a, b, c, d] for the cubic polynomial:
 * f(t) = a*t^3 + b*t^2 + c*t + d
 *
 * @param p0 - Previous point
 * @param p1 - Start point
 * @param p2 - End point
 * @param p3 - Next point
 * @param tension - Tension parameter (default: 0.5)
 * @returns Array of coefficients [a, b, c, d]
 */
export function cubicCoefficients(
    p0: number,
    p1: number,
    p2: number,
    p3: number,
    tension: number = 0.5
): [number, number, number, number] {
    const s = tension;

    const a = -s * p0 + (2 - s) * p1 + (s - 2) * p2 + s * p3;
    const b = 2 * s * p0 + (s - 3) * p1 + (3 - 2 * s) * p2 - s * p3;
    const c = -s * p0 + s * p2;
    const d = p1;

    return [a, b, c, d];
}

/**
 * Evaluate cubic polynomial from coefficients
 *
 * @param coeffs - Coefficients [a, b, c, d]
 * @param t - Parameter [0, 1]
 * @returns Evaluated value
 */
export function evaluateCubic(coeffs: [number, number, number, number], t: number): number {
    const [a, b, c, d] = coeffs;
    return a * t * t * t + b * t * t + c * t + d;
}
